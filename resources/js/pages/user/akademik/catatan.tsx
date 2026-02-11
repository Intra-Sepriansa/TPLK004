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
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
    NotebookPen, Plus, ArrowLeft, Search, BookOpen, Monitor, Building2,
    Trash2, Edit, ExternalLink, Calendar, CheckCircle, XCircle, Sparkles,
    FileText, Clock, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useState, FormEvent, useEffect, useRef } from 'react';

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
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 20,
            },
        },
    };

    // Mouse tracking for parallax
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
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

    // Calculate stats
    const stats = {
        total: notes.length,
        courses: Object.keys(notesByCourse).length,
        thisWeek: notes.filter(n => {
            const noteDate = new Date(n.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return noteDate >= weekAgo;
        }).length,
    };

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

    return (
        <StudentLayout>
            <Head title="Catatan Pembelajaran" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col gap-6 p-4 md:p-6"
            >
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${
                                toast.type === 'success' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                            }`}
                        >
                            {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Advanced Header with Particles */}
                <motion.div
                    variants={itemVariants}
                    onMouseMove={handleMouseMove}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.4, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl"
                        />
                        
                        {/* Floating Notebook Icons */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    y: [0, -40, -80],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            >
                                <NotebookPen className="h-4 w-4 text-white/40" />
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/user/akademik">
                                    <motion.div
                                        whileHover={{ scale: 1.1, x: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </motion.div>
                                </Link>
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    whileHover={{ scale: 1.15, y: -3 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30"
                                >
                                    <NotebookPen className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-white/90 font-medium"
                                    >
                                        Manajemen Pembelajaran
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Catatan Pembelajaran
                                    </motion.h1>
                                </div>
                            </div>
                            <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
                                <DialogTrigger asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button className="bg-white/20 hover:bg-white/30 backdrop-blur border-0 shadow-lg">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Catatan
                                        </Button>
                                    </motion.div>
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
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-white/90 text-lg"
                        >
                            Catat materi setiap pertemuan untuk referensi belajar
                        </motion.p>
                        
                        {/* Quick Stats with Dock-Style Animations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 grid grid-cols-3 gap-4"
                        >
                            {[
                                { icon: FileText, label: 'Total Catatan', value: stats.total },
                                { icon: BookOpen, label: 'Mata Kuliah', value: stats.courses },
                                { icon: TrendingUp, label: 'Minggu Ini', value: stats.thisWeek },
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 200 }}
                                    whileHover={{ 
                                        scale: 1.05, 
                                        y: -5,
                                        boxShadow: "0 10px 30px rgba(255,255,255,0.2)"
                                    }}
                                    className="bg-white/10 backdrop-blur rounded-xl p-4 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <motion.div
                                            whileHover={{ scale: 1.2, y: -2 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        >
                                            <stat.icon className="h-5 w-5 text-white/80" />
                                        </motion.div>
                                        <p className="text-white/80 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-3xl font-bold">
                                        <AnimatedCounter value={stat.value} duration={1500} />
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Search & Filter */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                >
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari catatan..."
                                        className="pl-9 h-11 border-2 hover:border-purple-300 focus:border-purple-500 transition-colors rounded-xl"
                                    />
                                </div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button type="submit" variant="secondary" className="h-11 rounded-xl">
                                        <Search className="h-4 w-4 mr-2" />
                                        Cari
                                    </Button>
                                </motion.div>
                            </form>
                            <Select value={filters.course_id || 'all'} onValueChange={(v) => handleFilter('course_id', v)}>
                                <SelectTrigger className="w-full md:w-[200px] h-11 border-2 hover:border-purple-300 transition-colors rounded-xl">
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
                    </div>
                </motion.div>

                {/* Notes List */}
                {Object.keys(notesByCourse).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(notesByCourse).map(([courseName, { mode, notes: courseNotes }], courseIndex) => (
                            <motion.div
                                key={courseName}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: courseIndex * 0.1, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.01, y: -2 }}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                    <div className="flex items-center gap-2">
                                        <motion.div
                                            whileHover={{ scale: 1.2, y: -2 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                            className={`p-2 rounded-lg ${mode === 'offline' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}
                                        >
                                            {mode === 'offline' ? (
                                                <Building2 className="h-5 w-5 text-emerald-600" />
                                            ) : (
                                                <Monitor className="h-5 w-5 text-blue-600" />
                                            )}
                                        </motion.div>
                                        <div className="flex-1">
                                            <h2 className="font-semibold text-slate-900 dark:text-white">{courseName}</h2>
                                            <p className="text-xs text-slate-500">{courseNotes.length} catatan tersimpan</p>
                                        </div>
                                        <Badge variant={mode === 'offline' ? 'default' : 'secondary'} className={`text-xs ${mode === 'offline' ? 'bg-emerald-500' : ''}`}>
                                            {mode === 'offline' ? 'Offline' : 'Online'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {courseNotes.map((note, noteIndex) => (
                                            <MagneticNoteCard
                                                key={note.id}
                                                note={note}
                                                noteIndex={noteIndex}
                                                handleEdit={handleEdit}
                                                openDeleteDialog={openDeleteDialog}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                    >
                        <div className="py-12">
                            <div className="text-center">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="inline-block"
                                >
                                    <NotebookPen className="h-16 w-16 mx-auto text-purple-400 mb-3 opacity-50" />
                                </motion.div>
                                <p className="text-muted-foreground font-medium mb-2">Belum ada catatan</p>
                                <p className="text-sm text-muted-foreground mb-4">Mulai catat materi pembelajaran kamu</p>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="outline" onClick={() => setShowForm(true)} className="rounded-xl">
                                        <Plus className="h-4 w-4 mr-2" /> Tambah Catatan Pertama
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
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
            </motion.div>
        </StudentLayout>
    );
}

// Magnetic Note Card Component with 3D Effects
function MagneticNoteCard({ note, noteIndex, handleEdit, openDeleteDialog }: {
    note: Note;
    noteIndex: number;
    handleEdit: (note: Note) => void;
    openDeleteDialog: (id: number) => void;
}) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: noteIndex * 0.05, type: "spring", stiffness: 200 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
                transition: 'transform 0.1s ease-out',
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="relative p-5 rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden group"
        >
            {/* Glow Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            
            <div className="relative z-10">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <motion.div whileHover={{ scale: 1.1 }}>
                        <Badge variant="outline" className="text-xs border-2 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30">
                            <Calendar className="h-3 w-3 mr-1" />
                            Pertemuan {note.meeting_number}
                        </Badge>
                    </motion.div>
                    <div className="flex items-center gap-1">
                        <motion.div whileHover={{ scale: 1.2, rotate: 15 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30" onClick={() => handleEdit(note)}>
                                <Edit className="h-4 w-4 text-purple-600" />
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.2, rotate: -15 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => openDeleteDialog(note.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
                
                <motion.h4
                    whileHover={{ x: 5 }}
                    className="font-bold text-lg text-slate-900 dark:text-white mb-2"
                >
                    {note.title}
                </motion.h4>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-wrap mb-3">
                    {note.content}
                </p>
                
                {note.links && note.links.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Link Referensi</p>
                        </div>
                        <div className="space-y-1.5">
                            {note.links.map((link, i) => (
                                <motion.a
                                    key={i}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ x: 5, scale: 1.02 }}
                                    className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                                >
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{link}</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
                
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <p className="text-xs text-slate-400">{note.created_at}</p>
                </div>
            </div>
        </motion.div>
    );
}
