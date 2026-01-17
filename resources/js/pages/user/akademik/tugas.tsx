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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    ListTodo, Plus, ArrowLeft, Clock, CheckCircle2, AlertTriangle, 
    Calendar, Trash2, Filter, BookOpen, CheckCircle, XCircle
} from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

interface Task {
    id: number;
    title: string;
    description: string | null;
    course_id: number;
    course_name: string;
    meeting_number: number | null;
    deadline: string | null;
    deadline_formatted: string | null;
    days_remaining: number | null;
    status: 'pending' | 'in_progress' | 'completed';
    is_overdue: boolean;
    completed_at: string | null;
    created_at: string;
}

interface Course {
    id: number;
    name: string;
    total_meetings: number;
}

interface Props {
    tasks: Task[];
    courses: Course[];
    stats: {
        total: number;
        completed: number;
        pending: number;
        overdue: number;
    };
    filters: {
        status: string;
        course_id: string;
    };
}

export default function AcademicTasks({ tasks, courses, stats, filters }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;
    
    const [showForm, setShowForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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

    const { data, setData, post, processing, errors, reset } = useForm({
        mahasiswa_course_id: '',
        meeting_number: '',
        title: '',
        description: '',
        deadline: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/akademik/tugas', {
            onSuccess: () => {
                reset();
                setShowForm(false);
                setSelectedCourse(null);
            },
            onError: () => {
                setToast({ type: 'error', message: 'Gagal menambahkan tugas' });
                setTimeout(() => setToast(null), 3000);
            },
        });
    };

    const handleToggle = (id: number) => {
        router.post(`/user/akademik/tugas/${id}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/akademik/tugas/${deleteDialog.id}`, {
                preserveScroll: true,
            });
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/user/akademik/tugas', { 
            ...filters, 
            [key]: value === 'all' ? '' : value 
        }, { preserveState: true });
    };

    const handleCourseSelect = (courseId: string) => {
        setData('mahasiswa_course_id', courseId);
        const course = courses.find(c => c.id === parseInt(courseId));
        setSelectedCourse(course || null);
    };

    return (
        <StudentLayout>
            <Head title="Tugas Akademik" />
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
                                <ListTodo className="h-7 w-7 text-amber-600" />
                                Tugas Akademik
                            </h1>
                            <p className="text-muted-foreground">Kelola tugas per mata kuliah</p>
                        </div>
                    </div>
                    <Dialog open={showForm} onOpenChange={setShowForm}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
                                <Plus className="h-4 w-4 mr-2" /> Tambah Tugas
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Tugas Baru</DialogTitle>
                                <DialogDescription>Catat tugas untuk mata kuliah tertentu</DialogDescription>
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
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.mahasiswa_course_id && <p className="text-sm text-red-500">{errors.mahasiswa_course_id}</p>}
                                </div>
                                {selectedCourse && (
                                    <div className="space-y-2">
                                        <Label>Pertemuan (Opsional)</Label>
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
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Judul Tugas</Label>
                                    <Input
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Tugas Bab 3"
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Deskripsi (Opsional)</Label>
                                    <Textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Detail tugas..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deadline (Opsional)</Label>
                                    <Input
                                        type="date"
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Tugas</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                            <p className="text-sm text-emerald-600/80">Selesai</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                            <p className="text-sm text-amber-600/80">Pending</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                            <p className="text-sm text-red-600/80">Terlambat</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Filter:</span>
                            </div>
                            <Select value={filters.course_id || 'all'} onValueChange={(v) => handleFilter('course_id', v)}>
                                <SelectTrigger className="w-[180px]">
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

                {/* Tasks List */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Daftar Tugas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v)}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">Semua</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="completed">Selesai</TabsTrigger>
                                <TabsTrigger value="overdue">Terlambat</TabsTrigger>
                            </TabsList>
                            <TabsContent value={filters.status || 'all'}>
                                {tasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {tasks.map((task) => (
                                            <div 
                                                key={task.id} 
                                                className={`p-4 rounded-lg border transition-all ${
                                                    task.status === 'completed' 
                                                        ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' 
                                                        : task.is_overdue 
                                                            ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                                                            : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={task.status === 'completed'}
                                                        onCheckedChange={() => handleToggle(task.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                                    {task.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <BookOpen className="h-3 w-3 mr-1" />
                                                                        {task.course_name}
                                                                    </Badge>
                                                                    {task.meeting_number && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            P{task.meeting_number}
                                                                        </Badge>
                                                                    )}
                                                                    {task.status === 'completed' ? (
                                                                        <Badge className="bg-emerald-500 text-xs">
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                                                        </Badge>
                                                                    ) : task.is_overdue ? (
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            <AlertTriangle className="h-3 w-3 mr-1" /> Terlambat
                                                                        </Badge>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {task.deadline_formatted && task.status !== 'completed' && (
                                                                    <div className={`text-right ${task.is_overdue ? 'text-red-600' : task.days_remaining !== null && task.days_remaining <= 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                                                        <div className="flex items-center gap-1 text-xs">
                                                                            <Calendar className="h-3 w-3" />
                                                                            {task.deadline_formatted}
                                                                        </div>
                                                                        {task.days_remaining !== null && !task.is_overdue && (
                                                                            <p className="text-xs">{task.days_remaining} hari lagi</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => openDeleteDialog(task.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                                        <p className="text-muted-foreground">Belum ada tugas</p>
                                        <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                                            <Plus className="h-4 w-4 mr-2" /> Tambah Tugas Pertama
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

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
            </div>
        </StudentLayout>
    );
}
