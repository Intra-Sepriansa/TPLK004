import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    AlertTriangle, BookOpen, Calendar, CheckCircle, Clock, Eye, FileText, MessageSquare,
    MoreHorizontal, Pencil, Plus, Search, Trash2, Sparkles,
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
    const [form, setForm] = useState({
        course_id: '', judul: '', deskripsi: '', instruksi: '',
        jenis: 'tugas', deadline: '', prioritas: 'sedang', status: 'draft',
    });

    useEffect(() => { setIsLoaded(true); }, []);

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

    const handleDelete = (id: number) => { if (confirm('Yakin ingin menghapus tugas ini?')) router.delete(`/dosen/tugas/${id}`); };

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
        const styles: Record<string, string> = {
            tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
            sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
            rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25',
        };
        return <Badge className={styles[p]}>{p}</Badge>;
    };

    const getStatusBadge = (s: string) => {
        const styles: Record<string, string> = {
            published: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
            draft: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
            closed: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
        };
        return <Badge className={styles[s]}>{s}</Badge>;
    };

    return (
        <DosenLayout>
            <Head title="Informasi Tugas" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className={`flex items-center justify-between transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                            <Sparkles className="h-8 w-8 animate-pulse" /> Informasi Tugas
                        </h1>
                        <p className="text-muted-foreground mt-1">Kelola tugas untuk mahasiswa</p>
                    </div>
                    <Dialog open={showCreate} onOpenChange={setShowCreate}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Tugas
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle className="text-xl text-indigo-700">Tambah Tugas Baru</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Mata Kuliah</Label>
                                    <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Pilih mata kuliah" /></SelectTrigger>
                                        <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Judul</Label><Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} /></div>
                                <div><Label>Deskripsi</Label><Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} /></div>
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
                                    <div><Label>Deadline</Label><Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">📋 Draft</SelectItem>
                                                <SelectItem value="published">✅ Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">Simpan</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { icon: FileText, label: 'Total', value: stats.total, color: 'from-blue-500 to-indigo-500', delay: '0ms' },
                        { icon: CheckCircle, label: 'Published', value: stats.published, color: 'from-emerald-500 to-teal-500', delay: '100ms' },
                        { icon: Clock, label: 'Draft', value: stats.draft, color: 'from-gray-500 to-slate-500', delay: '200ms' },
                        { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, color: 'from-red-500 to-rose-500', delay: '300ms' },
                    ].map((stat, i) => (
                        <div key={i} className={`rounded-2xl border bg-card p-5 transition-all duration-500 hover:scale-105 hover:shadow-xl group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: stat.delay }}>
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
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
                            onKeyDown={(e) => e.key === 'Enter' && router.get('/dosen/tugas', { search, course_id: courseId, status }, { preserveState: true })}
                            className="pl-10" />
                    </div>
                    <Select value={courseId} onValueChange={(v) => { setCourseId(v); router.get('/dosen/tugas', { search, course_id: v, status }, { preserveState: true }); }}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Semua Mata Kuliah" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                            {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={(v) => { setStatus(v); router.get('/dosen/tugas', { search, course_id: courseId, status: v }, { preserveState: true }); }}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tugas List */}
                <div className="space-y-4">
                    {tugasList.length === 0 ? (
                        <div className={`rounded-2xl border bg-card p-16 text-center transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="relative mx-auto w-24 h-24 mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 animate-ping" />
                                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                                    <FileText className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <p className="text-xl font-semibold text-muted-foreground">Belum ada tugas</p>
                        </div>
                    ) : (
                        tugasList.map((tugas, index) => (
                            <div key={tugas.id} className={`rounded-2xl border bg-card p-5 transition-all duration-500 hover:shadow-xl hover:scale-[1.01] cursor-pointer group ${tugas.is_overdue ? 'border-red-300 bg-red-50/50 dark:bg-red-900/10' : ''} ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: `${500 + index * 100}ms` }}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1" onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)}>
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">{tugas.jenis}</Badge>
                                            {getPriorityBadge(tugas.prioritas)}
                                            {getStatusBadge(tugas.status)}
                                            {tugas.is_overdue && <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse">⚠️ Overdue</Badge>}
                                        </div>
                                        <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{tugas.judul}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{tugas.deskripsi}</p>
                                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg"><BookOpen className="h-4 w-4 text-blue-500" /> {tugas.course.nama}</span>
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg"><Calendar className="h-4 w-4 text-purple-500" /> {tugas.deadline_display}</span>
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg"><MessageSquare className="h-4 w-4 text-emerald-500" /> {tugas.diskusi_count} diskusi</span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)}><Eye className="mr-2 h-4 w-4 text-blue-500" /> Lihat Detail</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEdit(tugas)}><Pencil className="mr-2 h-4 w-4 text-amber-500" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(tugas.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Edit Dialog */}
                <Dialog open={showEdit} onOpenChange={setShowEdit}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle className="text-xl text-indigo-700">Edit Tugas</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div><Label>Judul</Label><Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} /></div>
                            <div><Label>Deskripsi</Label><Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} /></div>
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
                                <div><Label>Deadline</Label><Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
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
                            <Button onClick={handleEdit} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">Simpan Perubahan</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DosenLayout>
    );
}
