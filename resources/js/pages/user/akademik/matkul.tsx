import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    BookOpen, Plus, ArrowLeft, Monitor, Building2, Clock, Calendar,
    Trash2, Edit, CheckCircle2, GraduationCap, CheckCircle, XCircle
} from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

interface Course {
    id: number;
    name: string;
    sks: 2 | 3;
    total_meetings: number;
    current_meeting: number;
    uts_meeting: number;
    uas_meeting: number;
    schedule_day: string;
    schedule_time: string;
    mode: 'online' | 'offline';
    progress: number;
    uts_days_remaining: number | null;
    uas_days_remaining: number | null;
}

interface Props {
    courses: Course[];
}

const dayNames: Record<string, string> = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
};

export default function AcademicCourses({ courses }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;
    
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
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
        name: '',
        sks: '2',
        schedule_day: 'monday',
        schedule_time: '08:00',
        mode: 'online' as 'online' | 'offline',
        start_date: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingCourse) {
            patch(`/user/akademik/matkul/${editingCourse.id}`, {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                    setEditingCourse(null);
                },
                onError: () => {
                    setToast({ type: 'error', message: 'Gagal memperbarui mata kuliah' });
                    setTimeout(() => setToast(null), 3000);
                },
            });
        } else {
            post('/user/akademik/matkul', {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                },
                onError: () => {
                    setToast({ type: 'error', message: 'Gagal menambahkan mata kuliah' });
                    setTimeout(() => setToast(null), 3000);
                },
            });
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setData({
            name: course.name,
            sks: String(course.sks),
            schedule_day: course.schedule_day,
            schedule_time: course.schedule_time,
            mode: course.mode,
            start_date: '',
        });
        setShowForm(true);
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/akademik/matkul/${deleteDialog.id}`, {});
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleMarkMeeting = (courseId: number, meetingNumber: number) => {
        router.post(`/user/akademik/matkul/${courseId}/meeting/${meetingNumber}/complete`, {}, {
            preserveScroll: true,
        });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCourse(null);
        reset();
    };

    return (
        <StudentLayout>
            <Head title="Mata Kuliah" />
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
                                <BookOpen className="h-7 w-7 text-emerald-600" />
                                Mata Kuliah
                            </h1>
                            <p className="text-muted-foreground">Kelola mata kuliah semester ini</p>
                        </div>
                    </div>
                    <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                                <Plus className="h-4 w-4 mr-2" /> Tambah Matkul
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</DialogTitle>
                                <DialogDescription>
                                    {editingCourse ? 'Perbarui informasi mata kuliah' : 'Tambah mata kuliah baru untuk semester ini'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nama Mata Kuliah</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Kecerdasan Buatan"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>SKS</Label>
                                        <Select value={data.sks} onValueChange={(v) => setData('sks', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2">2 SKS (14 pertemuan)</SelectItem>
                                                <SelectItem value="3">3 SKS (21 pertemuan)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sks && <p className="text-sm text-red-500">{errors.sks}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mode</Label>
                                        <Select value={data.mode} onValueChange={(v: 'online' | 'offline') => setData('mode', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="offline">Offline</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hari</Label>
                                        <Select value={data.schedule_day} onValueChange={(v) => setData('schedule_day', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monday">Senin</SelectItem>
                                                <SelectItem value="tuesday">Selasa</SelectItem>
                                                <SelectItem value="wednesday">Rabu</SelectItem>
                                                <SelectItem value="thursday">Kamis</SelectItem>
                                                <SelectItem value="friday">Jumat</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Jam</Label>
                                        <Input
                                            type="time"
                                            value={data.schedule_time}
                                            onChange={(e) => setData('schedule_time', e.target.value)}
                                        />
                                    </div>
                                </div>
                                {!editingCourse && (
                                    <div className="space-y-2">
                                        <Label>Tanggal Mulai (Opsional)</Label>
                                        <Input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Untuk menghitung jadwal pertemuan</p>
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : editingCourse ? 'Perbarui' : 'Simpan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Info Card */}
                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                <GraduationCap className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-medium">Aturan SKS</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    2 SKS = 14 pertemuan (UTS setelah P7, UAS setelah P14)<br />
                                    3 SKS = 21 pertemuan (UTS setelah P14, UAS setelah P21)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Grid */}
                {courses.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                                <div className={`h-2 ${course.mode === 'offline' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {course.mode === 'offline' ? (
                                                <Building2 className="h-5 w-5 text-emerald-600" />
                                            ) : (
                                                <Monitor className="h-5 w-5 text-blue-600" />
                                            )}
                                            <Badge variant={course.mode === 'offline' ? 'default' : 'secondary'} className={`text-xs ${course.mode === 'offline' ? 'bg-emerald-500' : ''}`}>
                                                {course.mode === 'offline' ? 'Offline' : 'Online'}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">{course.sks} SKS</Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(course)}>
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => openDeleteDialog(course.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Schedule */}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{dayNames[course.schedule_day]}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{course.schedule_time}</span>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span>Progress</span>
                                            <span className="font-medium">{course.current_meeting}/{course.total_meetings}</span>
                                        </div>
                                        <Progress value={course.progress} className="h-2" />
                                    </div>

                                    {/* Milestones */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`p-2 rounded-lg text-center ${course.current_meeting >= course.uts_meeting ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                                            <p className="text-xs text-muted-foreground">UTS</p>
                                            <p className="font-medium text-sm">
                                                {course.current_meeting >= course.uts_meeting ? (
                                                    <span className="text-emerald-600 flex items-center justify-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                                                    </span>
                                                ) : (
                                                    `P${course.uts_meeting}`
                                                )}
                                            </p>
                                        </div>
                                        <div className={`p-2 rounded-lg text-center ${course.current_meeting >= course.uas_meeting ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                            <p className="text-xs text-muted-foreground">UAS</p>
                                            <p className="font-medium text-sm">
                                                {course.current_meeting >= course.uas_meeting ? (
                                                    <span className="text-emerald-600 flex items-center justify-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                                                    </span>
                                                ) : (
                                                    `P${course.uas_meeting}`
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mark Meeting Complete */}
                                    {course.current_meeting < course.total_meetings && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => handleMarkMeeting(course.id, course.current_meeting + 1)}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Tandai P{course.current_meeting + 1} Selesai
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground">Belum ada mata kuliah</p>
                                <p className="text-sm text-muted-foreground mt-1">Tambahkan mata kuliah untuk mulai tracking</p>
                                <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" /> Tambah Mata Kuliah
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
                    title="Hapus Mata Kuliah"
                    message="Yakin ingin menghapus mata kuliah ini? Semua tugas dan catatan terkait juga akan dihapus."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </StudentLayout>
    );
}
