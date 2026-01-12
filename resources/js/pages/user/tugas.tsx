import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertTriangle, Bell, BookOpen, Calendar, Clock, Eye, FileText, MessageSquare, Search, Sparkles,
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

    useEffect(() => { setIsLoaded(true); }, []);

    const getPriorityBadge = (p: string) => {
        const styles: Record<string, string> = {
            tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25 animate-pulse',
            sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
            rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25',
        };
        return <Badge className={styles[p]}>{p}</Badge>;
    };

    return (
        <StudentLayout mahasiswa={mahasiswa}>
            <Head title="Informasi Tugas" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <Sparkles className="h-8 w-8 animate-pulse" /> Informasi Tugas
                    </h1>
                    <p className="text-muted-foreground mt-1">Lihat tugas dan deadline dari dosen</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { icon: FileText, label: 'Total', value: stats.total, color: 'from-blue-500 to-indigo-500', delay: '0ms' },
                        { icon: Clock, label: 'Mendatang', value: stats.upcoming, color: 'from-emerald-500 to-teal-500', delay: '100ms' },
                        { icon: AlertTriangle, label: 'Terlewat', value: stats.overdue, color: 'from-red-500 to-rose-500', delay: '200ms' },
                        { icon: Bell, label: 'Belum Dibaca', value: stats.unread, color: 'from-orange-500 to-amber-500', delay: '300ms' },
                    ].map((stat, i) => (
                        <div key={i} className={`rounded-2xl border bg-card p-5 transition-all duration-500 hover:scale-105 hover:shadow-xl group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: stat.delay }}>
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className={`flex gap-4 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Cari tugas..." value={search} onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && router.get('/user/tugas', { search, course_id: courseId, status }, { preserveState: true })}
                            className="pl-10" />
                    </div>
                    <Select value={courseId} onValueChange={(v) => { setCourseId(v); router.get('/user/tugas', { search, course_id: v, status }, { preserveState: true }); }}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Semua Mata Kuliah" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                            {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={(v) => { setStatus(v); router.get('/user/tugas', { search, course_id: courseId, status: v }, { preserveState: true }); }}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Semua" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="upcoming">Mendatang</SelectItem>
                            <SelectItem value="overdue">Terlewat</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tugas List */}
                <div className="space-y-4">
                    {tugasList.length === 0 ? (
                        <div className={`rounded-2xl border bg-card p-16 text-center transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="relative mx-auto w-24 h-24 mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-20 animate-ping" />
                                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                                    <FileText className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <p className="text-xl font-semibold text-muted-foreground">Belum ada tugas</p>
                            <p className="text-sm text-muted-foreground mt-2">Tugas dari dosen akan muncul di sini</p>
                        </div>
                    ) : (
                        tugasList.map((tugas, index) => (
                            <div
                                key={tugas.id}
                                onClick={() => router.visit(`/user/tugas/${tugas.id}`)}
                                className={`rounded-2xl border bg-card p-5 transition-all duration-500 hover:shadow-xl hover:scale-[1.01] cursor-pointer group ${tugas.is_overdue ? 'border-red-300 bg-red-50/50 dark:bg-red-900/10' : ''} ${!tugas.is_read ? 'border-l-4 border-l-emerald-500' : ''} ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                                style={{ transitionDelay: `${500 + index * 100}ms` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">{tugas.jenis}</Badge>
                                            {getPriorityBadge(tugas.prioritas)}
                                            {tugas.is_overdue && <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse">⚠️ Terlewat</Badge>}
                                            {!tugas.is_read && <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white animate-bounce">✨ Baru</Badge>}
                                        </div>
                                        <h3 className="font-bold text-lg group-hover:text-emerald-600 transition-colors">{tugas.judul}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{tugas.deskripsi}</p>
                                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg"><BookOpen className="h-4 w-4 text-blue-500" /> {tugas.course.nama}</span>
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg"><Calendar className="h-4 w-4 text-purple-500" /> {tugas.deadline_display}</span>
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg"><MessageSquare className="h-4 w-4 text-emerald-500" /> {tugas.diskusi_count} diskusi</span>
                                        </div>
                                        {!tugas.is_overdue && tugas.days_until_deadline <= 3 && tugas.days_until_deadline >= 0 && (
                                            <div className="mt-3 p-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                                                <p className="text-sm text-amber-600 flex items-center gap-1 font-medium">
                                                    <AlertTriangle className="h-4 w-4 animate-bounce" /> Deadline dalam {tugas.days_until_deadline} hari!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
