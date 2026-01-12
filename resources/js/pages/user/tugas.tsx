import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertTriangle, Bell, BookOpen, Calendar, CheckCircle, Clock, Eye, FileText, MessageSquare, Search,
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

    const getPriorityBadge = (p: string) => {
        const c: Record<string, string> = { tinggi: 'bg-red-100 text-red-700', sedang: 'bg-yellow-100 text-yellow-700', rendah: 'bg-green-100 text-green-700' };
        return <Badge className={c[p]}>{p}</Badge>;
    };

    return (
        <StudentLayout mahasiswa={mahasiswa}>
            <Head title="Informasi Tugas" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Informasi Tugas</h1>
                    <p className="text-muted-foreground">Lihat tugas dan deadline dari dosen</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2"><FileText className="h-5 w-5 text-blue-600" /></div>
                            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-100 p-2"><Clock className="h-5 w-5 text-emerald-600" /></div>
                            <div><p className="text-2xl font-bold">{stats.upcoming}</p><p className="text-sm text-muted-foreground">Mendatang</p></div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-red-100 p-2"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
                            <div><p className="text-2xl font-bold">{stats.overdue}</p><p className="text-sm text-muted-foreground">Terlewat</p></div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 p-2"><Bell className="h-5 w-5 text-orange-600" /></div>
                            <div><p className="text-2xl font-bold">{stats.unread}</p><p className="text-sm text-muted-foreground">Belum Dibaca</p></div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
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
                        <div className="rounded-xl border bg-card p-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-muted-foreground">Belum ada tugas</p>
                        </div>
                    ) : (
                        tugasList.map((tugas) => (
                            <div
                                key={tugas.id}
                                onClick={() => router.visit(`/user/tugas/${tugas.id}`)}
                                className={`rounded-xl border bg-card p-4 transition-all hover:shadow-md cursor-pointer ${tugas.is_overdue ? 'border-red-200 dark:border-red-900/50' : ''} ${!tugas.is_read ? 'border-l-4 border-l-emerald-500' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-blue-100 text-blue-700">{tugas.jenis}</Badge>
                                            {getPriorityBadge(tugas.prioritas)}
                                            {tugas.is_overdue && <Badge className="bg-red-500 text-white">Terlewat</Badge>}
                                            {!tugas.is_read && <Badge className="bg-emerald-500 text-white">Baru</Badge>}
                                        </div>
                                        <h3 className="font-semibold text-lg">{tugas.judul}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{tugas.deskripsi}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {tugas.course.nama}</span>
                                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {tugas.deadline_display}</span>
                                            <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {tugas.diskusi_count} diskusi</span>
                                        </div>
                                        {!tugas.is_overdue && tugas.days_until_deadline <= 3 && (
                                            <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                                                <AlertTriangle className="h-4 w-4" /> Deadline dalam {tugas.days_until_deadline} hari
                                            </p>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
