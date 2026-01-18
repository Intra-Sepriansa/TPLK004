import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertTriangle, Bell, BookOpen, Calendar, Clock, Eye, FileText, MessageSquare, Search, Sparkles,
    CheckCircle, Filter, TrendingUp, Target, Zap, ArrowRight, ListTodo, BarChart3
} from 'lucide-react';

type Course = { id: number; nama: string; dosen: string | null };
type Tugas = {
    id: number; judul: string; deskripsi: string; jenis: string;
    deadline: string; deadline_display: string; prioritas: string;
    course: { id: number; nama: string; dosen: string | null }; created_by: string;
    is_overdue: boolean; days_until_deadline: number; is_read: boolean; diskusi_count: number;
};
type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    tugasList: Tugas[]; courses: Course[];
    stats: { total: number; upcoming: number; overdue: number; unread: number };
    filters: { search: string; course_id: string; status: string };
};

export default function UserTugas({ mahasiswa, tugasList, courses, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => { 
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const getPriorityConfig = (p: string) => {
        const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
            tinggi: { bg: 'bg-gradient-to-r from-red-500 to-rose-600', text: 'text-white', icon: Zap, label: 'Tinggi' },
            sedang: { bg: 'bg-gradient-to-r from-amber-500 to-orange-500', text: 'text-white', icon: Target, label: 'Sedang' },
            rendah: { bg: 'bg-gradient-to-r from-emerald-500 to-green-500', text: 'text-white', icon: CheckCircle, label: 'Rendah' },
        };
        return configs[p] || configs.rendah;
    };

    const completionRate = stats.total > 0 ? Math.round(((stats.total - stats.upcoming - stats.overdue) / stats.total) * 100) : 0;

    return (
        <StudentLayout mahasiswa={mahasiswa}>
            <Head title="Informasi Tugas" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-6 text-white shadow-xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                <ListTodo className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100 font-medium">Akademik</p>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    Informasi Tugas
                                    <Sparkles className="h-6 w-6 animate-pulse" />
                                </h1>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">Lihat dan kelola tugas dari dosen dengan mudah</p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-4 w-4 text-blue-200 group-hover:scale-110 transition-transform" />
                                    <p className="text-blue-100 text-xs font-medium">Total Tugas</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-blue-200 group-hover:scale-110 transition-transform" />
                                    <p className="text-blue-100 text-xs font-medium">Mendatang</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.upcoming}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-blue-200 group-hover:scale-110 transition-transform" />
                                    <p className="text-blue-100 text-xs font-medium">Terlewat</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.overdue}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-2 mb-1">
                                    <Bell className="h-4 w-4 text-blue-200 group-hover:scale-110 transition-transform" />
                                    <p className="text-blue-100 text-xs font-medium">Belum Dibaca</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.unread}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Mendatang</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.upcoming}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Terlewat</p>
                                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                <Bell className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Belum Dibaca</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className={`rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                            <Filter className="h-4 w-4" />
                        </div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Tugas</h2>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input 
                                placeholder="Cari tugas..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && router.get('/user/tugas', { search, course_id: courseId, status }, { preserveState: true })}
                                className="pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500" 
                            />
                        </div>
                        <Select value={courseId} onValueChange={(v) => { setCourseId(v); router.get('/user/tugas', { search, course_id: v, status }, { preserveState: true }); }}>
                            <SelectTrigger className="w-full md:w-48 rounded-xl">
                                <SelectValue placeholder="Semua Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={(v) => { setStatus(v); router.get('/user/tugas', { search, course_id: courseId, status: v }, { preserveState: true }); }}>
                            <SelectTrigger className="w-full md:w-40 rounded-xl">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="upcoming">Mendatang</SelectItem>
                                <SelectItem value="overdue">Terlewat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tugas List */}
                <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                    <ListTodo className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Tugas</h2>
                                    <p className="text-xs text-slate-500">{tugasList.length} tugas ditemukan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {tugasList.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="relative mx-auto w-24 h-24 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg shadow-blue-500/30">
                                        <FileText className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <p className="text-xl font-semibold text-slate-700 dark:text-gray-300">Belum ada tugas</p>
                                <p className="text-sm text-slate-500 mt-2">Tugas dari dosen akan muncul di sini</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tugasList.map((tugas, index) => {
                                    const priorityConfig = getPriorityConfig(tugas.prioritas);
                                    const PriorityIcon = priorityConfig.icon;
                                    
                                    return (
                                        <div
                                            key={tugas.id}
                                            onClick={() => router.visit(`/user/tugas/${tugas.id}`)}
                                            className={`rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] cursor-pointer group ${
                                                tugas.is_overdue 
                                                    ? 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-800' 
                                                    : !tugas.is_read 
                                                        ? 'border-l-4 border-l-blue-500 border-slate-200 dark:border-gray-700' 
                                                        : 'border-slate-200 dark:border-gray-700 hover:border-blue-300'
                                            }`}
                                            style={{ 
                                                animationDelay: `${index * 100}ms`,
                                                animation: isLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    {/* Badges */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
                                                            {tugas.jenis}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${priorityConfig.bg} ${priorityConfig.text} shadow-lg`}>
                                                            <PriorityIcon className="h-3 w-3" />
                                                            {priorityConfig.label}
                                                        </span>
                                                        {tugas.is_overdue && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse shadow-lg shadow-red-500/25">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Terlewat
                                                            </span>
                                                        )}
                                                        {!tugas.is_read && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                                                                <Sparkles className="h-3 w-3 animate-pulse" />
                                                                Baru
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Title */}
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {tugas.judul}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 mt-2">{tugas.deskripsi}</p>
                                                    
                                                    {/* Meta Info */}
                                                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-sm text-slate-600 dark:text-gray-400">
                                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                                            {tugas.course.nama}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-sm text-slate-600 dark:text-gray-400">
                                                            <Calendar className="h-4 w-4 text-purple-500" />
                                                            {tugas.deadline_display}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-sm text-slate-600 dark:text-gray-400">
                                                            <MessageSquare className="h-4 w-4 text-emerald-500" />
                                                            {tugas.diskusi_count} diskusi
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Deadline Warning */}
                                                    {!tugas.is_overdue && tugas.days_until_deadline <= 3 && tugas.days_until_deadline >= 0 && (
                                                        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                                            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2 font-medium">
                                                                <AlertTriangle className="h-4 w-4 animate-bounce" />
                                                                Deadline dalam {tugas.days_until_deadline} hari!
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Action Button */}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="opacity-0 group-hover:opacity-100 transition-all bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl"
                                                >
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </StudentLayout>
    );
}
