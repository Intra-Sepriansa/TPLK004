import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    NotebookPen, Plus, ArrowLeft, Search, BookOpen, Monitor, Building2,
    Trash2, Edit, ExternalLink, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

interface Note {
    id: number;
    course_id: number;
    course_name: string;
    course_mode: 'online' | 'offline';
    meeting_number: number;
    title: string;
    content: string;
    links: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Course {
    id: number;
    name: string;
    mode: 'online' | 'offline';
    total_meetings: number;
}

interface Props {
    notes: Note[];
    courses: Course[];
    filters: {
        search: string;
        course_id: string;
    };
}

export default function AcademicNotes({ notes, courses, filters }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;
    
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

    // Show flash message as toast
    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success, flash?.error]);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        mahasiswa_course_id: '',
        meeting_number: '',
        title: '',
        content: '',
        links: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingNote) {
            patch(`/user/akademik/catatan/${editingNote.id}`, {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                    setEditingNote(null);
                    setSelectedCourse(null);
                },
                onError: () => {
                    setToast({ type: 'error', message: 'Gagal memperbarui catatan' });
                    setTimeout(() => setToast(null), 3000);
                },
            });
        } else {
            post('/user/akademik/catatan', {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                    setSelectedCourse(null);
                },
                onError: () => {
                    setToast({ type: 'error', message: 'Gagal menambahkan catatan' });
                    setTimeout(() => setToast(null), 3000);
                },
            });
        }
    };

    const handleEdit = (note: Note) => {
        setEditingNote(note);
        const course = courses.find(c => c.id === note.course_id);
        setSelectedCourse(course || null);
        setData({
            mahasiswa_course_id: String(note.course_id),
            meeting_number: String(note.meeting_number),
            title: note.title,
            content: note.content,
            links: note.links?.join('\n') || '',
        });
        setShowForm(true);
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/akademik/catatan/${deleteDialog.id}`, {
                preserveScroll: true,
            });
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/user/akademik/catatan', { 
            ...filters, 
            search: searchQuery 
        }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/user/akademik/catatan', { 
            ...filters, 
            [key]: value === 'all' ? '' : value 
        }, { preserveState: true });
    };

    const handleCourseSelect = (courseId: string) => {
        setData('mahasiswa_course_id', courseId);
        const course = courses.find(c => c.id === parseInt(courseId));
        setSelectedCourse(course || null);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingNote(null);
        setSelectedCourse(null);
        reset();
    };

    // Group notes by course
    const notesByCourse = notes.reduce((acc, note) => {
        if (!acc[note.course_name]) {
            acc[note.course_name] = {
                mode: note.course_mode,
                notes: [],
            };
        }
        acc[note.course_name].notes.push(note);
        return acc;
    }, {} as Record<string, { mode: 'online' | 'offline'; notes: Note[] }>);

    return (
        <StudentLayout>
            <Head title="Catatan Pembelajaran" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg transition-all duration-300 ${
                        toast.type === 'success' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/user/akademik" className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <NotebookPen className="h-7 w-7 text-purple-600" />
                                Catatan Pembelajaran
                            </h1>
                            <p className="text-muted-foreground">Catat materi setiap pertemuan</p>
                        </div>
                    </div>
                    <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                                <Plus className="h-4 w-4 mr-2" /> Tambah Catatan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingNote ? 'Edit Catatan' : 'Tambah Catatan Baru'}</DialogTitle>
                                <DialogDescription>Catat materi pembelajaran untuk referensi</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Mata Kuliah</Label>
                                    <Select value={data.mahasiswa_course_id} onValueChange={handleCourseSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih mata kuliah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    <div className="flex items-center gap-2">
                                                        {c.mode === 'offline' ? <Building2 className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                                        {c.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.mahasiswa_course_id && <p className="text-sm text-red-500">{errors.mahasiswa_course_id}</p>}
                                </div>
                                {selectedCourse && (
                                    <div className="space-y-2">
                                        <Label>Pertemuan</Label>
                                        <Select value={data.meeting_number} onValueChange={(v) => setData('meeting_number', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih pertemuan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: selectedCourse.total_meetings }, (_, i) => (
                                                    <SelectItem key={i + 1} value={String(i + 1)}>Pertemuan {i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.meeting_number && <p className="text-sm text-red-500">{errors.meeting_number}</p>}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Judul</Label>
                                    <Input
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Pengenalan Machine Learning"
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Isi Catatan</Label>
                                    <Textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Tulis catatan pembelajaran..."
                                        rows={6}
                                    />
                                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Link Referensi (Opsional)</Label>
                                    <Textarea
                                        value={data.links}
                                        onChange={(e) => setData('links', e.target.value)}
                                        placeholder="Satu link per baris..."
                                        rows={2}
                                    />
                                    <p className="text-xs text-muted-foreground">Masukkan satu link per baris</p>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : editingNote ? 'Perbarui' : 'Simpan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search & Filter */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari catatan..."
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Cari</Button>
                            </form>
                            <Select value={filters.course_id || 'all'} onValueChange={(v) => handleFilter('course_id', v)}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Semua Matkul" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Matkul</SelectItem>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes List */}
                {Object.keys(notesByCourse).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(notesByCourse).map(([courseName, { mode, notes: courseNotes }]) => (
                            <Card key={courseName}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {mode === 'offline' ? (
                                            <Building2 className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <Monitor className="h-5 w-5 text-blue-600" />
                                        )}
                                        {courseName}
                                        <Badge variant={mode === 'offline' ? 'default' : 'secondary'} className={`text-xs ${mode === 'offline' ? 'bg-emerald-500' : ''}`}>
                                            {mode === 'offline' ? 'Offline' : 'Online'}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {courseNotes.map((note) => (
                                            <div key={note.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            P{note.meeting_number}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(note)}>
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => openDeleteDialog(note.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <h4 className="font-medium mb-2">{note.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                                                {note.links && note.links.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Link Referensi:</p>
                                                        <div className="space-y-1">
                                                            {note.links.map((link, i) => (
                                                                <a 
                                                                    key={i} 
                                                                    href={link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                                                                >
                                                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                                                    <span className="truncate">{link}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-3">{note.created_at}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <NotebookPen className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground">Belum ada catatan</p>
                                <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" /> Tambah Catatan Pertama
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                    onConfirm={handleDelete}
                    title="Hapus Catatan"
                    message="Yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </StudentLayout>
    );
}
