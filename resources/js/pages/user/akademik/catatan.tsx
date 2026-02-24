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
    FileText, Clock, TrendingUp, LayoutGrid, List, Columns3, Star, Copy,
    Download, Filter, ArrowUpDown, Eye, Pin, Hash, BookMarked, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, FormEvent, useEffect, useRef, useMemo } from 'react';

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
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>('grid');
    const [sortBy, setSortBy] = useState<'date' | 'title' | 'course'>('date');
    const [pinnedNotes, setPinnedNotes] = useState<number[]>([]);
    const [favoriteNotes, setFavoriteNotes] = useState<number[]>([]);
    const [formStep, setFormStep] = useState(1);
    const [showPreview, setShowPreview] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
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

    // Toggle pin note
    const togglePin = (noteId: number) => {
        setPinnedNotes(prev => 
            prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
        );
    };

    // Toggle favorite note
    const toggleFavorite = (noteId: number) => {
        setFavoriteNotes(prev => 
            prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
        );
    };

    // Calculate word count and reading time
    const getNoteStats = (content: string) => {
        const words = content.trim().split(/\s+/).length;
        const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min
        return { words, readingTime };
    };

    // Duplicate note
    const handleDuplicate = (note: Note) => {
        const course = courses.find(c => c.id === note.course_id);
        setSelectedCourse(course || null);
        setData({
            mahasiswa_course_id: String(note.course_id),
            meeting_number: String(note.meeting_number),
            title: `${note.title} (Copy)`,
            content: note.content,
            links: note.links?.join('\n') || '',
        });
        setShowForm(true);
    };

    // Sort and filter notes
    const sortedAndFilteredNotes = useMemo(() => {
        let filtered = [...notes];
        
        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else {
                return a.course_name.localeCompare(b.course_name);
            }
        });
        
        // Separate pinned notes
        const pinned = filtered.filter(n => pinnedNotes.includes(n.id));
        const unpinned = filtered.filter(n => !pinnedNotes.includes(n.id));
        
        return [...pinned, ...unpinned];
    }, [notes, sortBy, pinnedNotes]);

    // Group notes by course
    const notesByCourse = sortedAndFilteredNotes.reduce((acc, note) => {
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
        setFormStep(1);
        setShowPreview(false);
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
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl"
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
                        
                        {/* Floating Academic Icons */}
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 0 }}
                                animate={{
                                    opacity: [0, 0.4, 0],
                                    y: [0, -100 - Math.random() * 50],
                                    x: [0, (Math.random() - 0.5) * 50],
                                    rotate: [0, Math.random() * 360],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${10 + (i * 6) % 80}%`,
                                    bottom: '0',
                                }}
                            >
                                {i % 5 === 0 ? (
                                    <NotebookPen className="h-4 w-4 text-white/30" />
                                ) : i % 5 === 1 ? (
                                    <BookOpen className="h-4 w-4 text-white/30" />
                                ) : i % 5 === 2 ? (
                                    <FileText className="h-4 w-4 text-white/30" />
                                ) : i % 5 === 3 ? (
                                    <Sparkles className="h-4 w-4 text-white/30" />
                                ) : (
                                    <Calendar className="h-4 w-4 text-white/30" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                    
                    {/* Floating Large Icons */}
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-8 right-16 text-white/10"
                    >
                        <NotebookPen className="h-24 w-24" />
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, 15, 0],
                            rotate: [0, -8, 8, 0],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute bottom-8 left-16 text-white/10"
                    >
                        <BookOpen className="h-28 w-28" />
                    </motion.div>
                    
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
                                    </motion.div>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                            {editingNote ? 'Edit Catatan' : 'Tambah Catatan Baru'}
                                        </DialogTitle>
                                        <DialogDescription>Catat materi pembelajaran untuk referensi</DialogDescription>
                                    </DialogHeader>
                                    
                                    {/* Step Indicator */}
                                    <div className="flex items-center justify-center gap-2 mb-6">
                                        {[1, 2, 3].map((step) => (
                                            <motion.div
                                                key={step}
                                                className="flex items-center"
                                            >
                                                <motion.div
                                                    animate={{
                                                        scale: formStep === step ? 1.2 : 1,
                                                        backgroundColor: formStep >= step ? 'rgb(20 184 166)' : 'rgb(226 232 240)',
                                                    }}
                                                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                                        formStep >= step ? 'text-white' : 'text-slate-400'
                                                    }`}
                                                >
                                                    {formStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                                                </motion.div>
                                                {step < 3 && (
                                                    <motion.div
                                                        animate={{
                                                            width: formStep > step ? '60px' : '40px',
                                                            backgroundColor: formStep > step ? 'rgb(20 184 166)' : 'rgb(226 232 240)',
                                                        }}
                                                        className="h-1 mx-2"
                                                    />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="overflow-y-auto max-h-[50vh] px-1">
                                            <AnimatePresence mode="wait">
                                                {/* Step 1: Course & Meeting */}
                                                {formStep === 1 && (
                                                    <motion.div
                                                        key="step1"
                                                        initial={{ opacity: 0, x: 50 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -50 }}
                                                        className="space-y-4"
                                                    >
                                                        <div className="text-center mb-6">
                                                            <motion.div
                                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                                className="inline-block"
                                                            >
                                                                <BookOpen className="h-16 w-16 mx-auto text-teal-500 mb-3" />
                                                            </motion.div>
                                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pilih Mata Kuliah</h3>
                                                            <p className="text-sm text-slate-500">Tentukan mata kuliah dan pertemuan</p>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <Label className="text-base font-semibold">Mata Kuliah</Label>
                                                            <Select value={data.mahasiswa_course_id} onValueChange={handleCourseSelect}>
                                                                <SelectTrigger className="h-12 border-2 hover:border-teal-400 transition-colors">
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
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="space-y-2"
                                                            >
                                                                <Label className="text-base font-semibold">Pertemuan</Label>
                                                                <Select value={data.meeting_number} onValueChange={(v) => setData('meeting_number', v)}>
                                                                    <SelectTrigger className="h-12 border-2 hover:border-teal-400 transition-colors">
                                                                        <SelectValue placeholder="Pilih pertemuan" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: selectedCourse.total_meetings }, (_, i) => (
                                                                            <SelectItem key={i + 1} value={String(i + 1)}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Calendar className="h-4 w-4" />
                                                                                    Pertemuan {i + 1}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors.meeting_number && <p className="text-sm text-red-500">{errors.meeting_number}</p>}
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* Step 2: Title & Content */}
                                                {formStep === 2 && (
                                                    <motion.div
                                                        key="step2"
                                                        initial={{ opacity: 0, x: 50 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -50 }}
                                                        className="space-y-4"
                                                    >
                                                        <div className="text-center mb-6">
                                                            <motion.div
                                                                animate={{ scale: [1, 1.1, 1] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                                className="inline-block"
                                                            >
                                                                <NotebookPen className="h-16 w-16 mx-auto text-cyan-500 mb-3" />
                                                            </motion.div>
                                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tulis Catatan</h3>
                                                            <p className="text-sm text-slate-500">Catat materi pembelajaran dengan detail</p>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <Label className="text-base font-semibold">Judul Catatan</Label>
                                                            <Input
                                                                value={data.title}
                                                                onChange={(e) => setData('title', e.target.value)}
                                                                placeholder="Contoh: Pengenalan Machine Learning"
                                                                className="h-12 border-2 hover:border-cyan-400 focus:border-cyan-500 transition-colors"
                                                            />
                                                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                                            {data.title && (
                                                                <motion.p
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    className="text-xs text-teal-600 dark:text-teal-400"
                                                                >
                                                                    ✓ Judul terlihat bagus!
                                                                </motion.p>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-base font-semibold">Isi Catatan</Label>
                                                                <span className="text-xs text-slate-500">
                                                                    {data.content.length} karakter
                                                                </span>
                                                            </div>
                                                            <Textarea
                                                                value={data.content}
                                                                onChange={(e) => setData('content', e.target.value)}
                                                                placeholder="Tulis catatan pembelajaran dengan detail..."
                                                                rows={8}
                                                                className="border-2 hover:border-cyan-400 focus:border-cyan-500 transition-colors resize-none"
                                                            />
                                                            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                                                            {data.content && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400"
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        <FileText className="h-3 w-3" />
                                                                        {data.content.trim().split(/\s+/).length} kata
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        ~{Math.ceil(data.content.trim().split(/\s+/).length / 200)} menit baca
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Step 3: Links & Preview */}
                                                {formStep === 3 && (
                                                    <motion.div
                                                        key="step3"
                                                        initial={{ opacity: 0, x: 50 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -50 }}
                                                        className="space-y-4"
                                                    >
                                                        <div className="text-center mb-6">
                                                            <motion.div
                                                                animate={{ rotate: [0, 360] }}
                                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                                className="inline-block"
                                                            >
                                                                <Sparkles className="h-16 w-16 mx-auto text-blue-500 mb-3" />
                                                            </motion.div>
                                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tambah Referensi</h3>
                                                            <p className="text-sm text-slate-500">Link tambahan dan preview catatan</p>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <Label className="text-base font-semibold">Link Referensi (Opsional)</Label>
                                                            <Textarea
                                                                value={data.links}
                                                                onChange={(e) => setData('links', e.target.value)}
                                                                placeholder="https://example.com&#10;https://another-link.com"
                                                                rows={3}
                                                                className="border-2 hover:border-blue-400 focus:border-blue-500 transition-colors resize-none font-mono text-sm"
                                                            />
                                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                <ExternalLink className="h-3 w-3" />
                                                                Masukkan satu link per baris
                                                            </p>
                                                            {data.links && (
                                                                <motion.p
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    className="text-xs text-blue-600 dark:text-blue-400"
                                                                >
                                                                    ✓ {data.links.split('\n').filter(l => l.trim()).length} link ditambahkan
                                                                </motion.p>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Preview Toggle */}
                                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => setShowPreview(!showPreview)}
                                                                className="w-full"
                                                            >
                                                                {showPreview ? 'Sembunyikan' : 'Lihat'} Preview
                                                            </Button>
                                                        </div>
                                                        
                                                        {/* Preview */}
                                                        <AnimatePresence>
                                                            {showPreview && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="p-4 rounded-xl border-2 border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30"
                                                                >
                                                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{data.title || 'Judul Catatan'}</h4>
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {selectedCourse?.name || 'Mata Kuliah'}
                                                                        </Badge>
                                                                        {data.meeting_number && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Pertemuan {data.meeting_number}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap mb-3">
                                                                        {data.content || 'Isi catatan akan muncul di sini...'}
                                                                    </p>
                                                                    {data.links && data.links.trim() && (
                                                                        <div className="pt-3 border-t border-teal-300 dark:border-teal-700">
                                                                            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-2">Link Referensi:</p>
                                                                            <div className="space-y-1">
                                                                                {data.links.split('\n').filter(l => l.trim()).map((link, i) => (
                                                                                    <div key={i} className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                                                                        <ExternalLink className="h-3 w-3" />
                                                                                        <span className="truncate">{link}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Navigation Buttons */}
                                        <DialogFooter className="flex items-center justify-between gap-2">
                                            <div className="flex gap-2">
                                                {formStep > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setFormStep(formStep - 1)}
                                                        className="gap-2"
                                                    >
                                                        <ArrowLeft className="h-4 w-4" />
                                                        Kembali
                                                    </Button>
                                                )}
                                                <Button type="button" variant="ghost" onClick={closeForm}>
                                                    Batal
                                                </Button>
                                            </div>
                                            
                                            {formStep < 3 ? (
                                                <Button
                                                    type="button"
                                                    onClick={() => setFormStep(formStep + 1)}
                                                    disabled={
                                                        (formStep === 1 && (!data.mahasiswa_course_id || !data.meeting_number)) ||
                                                        (formStep === 2 && (!data.title || !data.content))
                                                    }
                                                    className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                                                >
                                                    Lanjut
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            >
                                                                <Sparkles className="h-4 w-4" />
                                                            </motion.div>
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4" />
                                                            {editingNote ? 'Perbarui Catatan' : 'Simpan Catatan'}
                                                        </>
                                                    )}
                                                </Button>
                                            )}
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
                            transition={{ delay: 0.2 }}
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
                    <div className="p-4 space-y-4">
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
                        
                        {/* View Mode & Sort Options */}
                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tampilan:</span>
                                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    {[
                                        { value: 'grid' as const, icon: LayoutGrid, label: 'Grid' },
                                        { value: 'list' as const, icon: List, label: 'List' },
                                        { value: 'masonry' as const, icon: Columns3, label: 'Masonry' },
                                    ].map((mode) => (
                                        <motion.button
                                            key={mode.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setViewMode(mode.value)}
                                            className={`p-2 rounded-md transition-colors ${
                                                viewMode === mode.value
                                                    ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                            title={mode.label}
                                        >
                                            <mode.icon className="h-4 w-4" />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Urutkan:</span>
                                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                    <SelectTrigger className="w-[140px] h-9 border-2 hover:border-purple-300 transition-colors rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5" />
                                                Terbaru
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="title">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5" />
                                                Judul
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="course">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                Mata Kuliah
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                                transition={{ delay: 0.2 }}
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
                                    <div className={`grid gap-4 ${
                                        viewMode === 'grid' ? 'md:grid-cols-2' :
                                        viewMode === 'list' ? 'grid-cols-1' :
                                        'md:grid-cols-3'
                                    }`}>
                                        {courseNotes.map((note, noteIndex) => (
                                            <AdvancedNoteCard
                                                key={note.id}
                                                note={note}
                                                noteIndex={noteIndex}
                                                viewMode={viewMode}
                                                isPinned={pinnedNotes.includes(note.id)}
                                                isFavorite={favoriteNotes.includes(note.id)}
                                                onTogglePin={() => togglePin(note.id)}
                                                onToggleFavorite={() => toggleFavorite(note.id)}
                                                onEdit={() => handleEdit(note)}
                                                onDuplicate={() => handleDuplicate(note)}
                                                onDelete={() => openDeleteDialog(note.id)}
                                                stats={getNoteStats(note.content)}
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

// Advanced Note Card Component with Multiple Features
function AdvancedNoteCard({ 
    note, 
    noteIndex, 
    viewMode,
    isPinned,
    isFavorite,
    onTogglePin,
    onToggleFavorite,
    onEdit,
    onDuplicate,
    onDelete,
    stats
}: {
    note: Note;
    noteIndex: number;
    viewMode: 'grid' | 'list' | 'masonry';
    isPinned: boolean;
    isFavorite: boolean;
    onTogglePin: () => void;
    onToggleFavorite: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    stats: { words: number; readingTime: number };
}) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showActions, setShowActions] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || viewMode === 'list') return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0 });
        setShowActions(false);
    };

    const isListView = viewMode === 'list';

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setShowActions(true)}
            style={!isListView ? {
                transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
                transition: 'transform 0.1s ease-out',
            } : {}}
            whileHover={{ scale: isListView ? 1.01 : 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className={`relative rounded-2xl border-2 bg-white dark:bg-slate-900/50 overflow-hidden group ${
                isPinned ? 'border-amber-400 dark:border-amber-600' : 'border-slate-200 dark:border-slate-800'
            } ${isListView ? 'flex items-start gap-4 p-4' : 'p-5'}`}
        >
            {/* Pin Indicator */}
            {isPinned && (
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-amber-400 border-l-[40px] border-l-transparent"
                >
                    <Pin className="absolute -top-8 right-1 h-4 w-4 text-white rotate-45" />
                </motion.div>
            )}
            
            {/* Glow Effect */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isPinned ? 'from-amber-500/10 via-yellow-500/10 to-orange-500/10' :
                    isFavorite ? 'from-rose-500/10 via-pink-500/10 to-purple-500/10' :
                    'from-purple-500/10 via-pink-500/10 to-rose-500/10'
                }`}
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            
            <div className={`relative z-10 ${isListView ? 'flex-1' : ''}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <motion.div whileHover={{ scale: 1.1 }}>
                            <Badge variant="outline" className="text-xs border-2 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30">
                                <Calendar className="h-3 w-3 mr-1" />
                                P{note.meeting_number}
                            </Badge>
                        </motion.div>
                        {isFavorite && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                            >
                                <Badge variant="outline" className="text-xs border-2 border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30">
                                    <Star className="h-3 w-3 mr-1 fill-rose-500 text-rose-500" />
                                    Favorit
                                </Badge>
                            </motion.div>
                        )}
                    </div>
                    
                    {/* Quick Actions */}
                    <AnimatePresence>
                        {showActions && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                className="flex items-center gap-1"
                            >
                                <motion.div whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={`h-8 w-8 ${isPinned ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        onClick={onTogglePin}
                                        title={isPinned ? 'Unpin' : 'Pin'}
                                    >
                                        <Pin className={`h-4 w-4 ${isPinned ? 'fill-amber-600' : ''}`} />
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={`h-8 w-8 ${isFavorite ? 'text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        onClick={onToggleFavorite}
                                        title={isFavorite ? 'Unfavorite' : 'Favorite'}
                                    >
                                        <Star className={`h-4 w-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.2, rotate: 15 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30" 
                                        onClick={onEdit}
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4 text-purple-600" />
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
                                        onClick={onDuplicate}
                                        title="Duplicate"
                                    >
                                        <Copy className="h-4 w-4 text-blue-600" />
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.2, rotate: -15 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30" 
                                        onClick={onDelete}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Title */}
                <motion.h4
                    whileHover={{ x: 3 }}
                    className={`font-bold text-slate-900 dark:text-white mb-2 ${isListView ? 'text-xl' : 'text-lg'}`}
                >
                    {note.title}
                </motion.h4>
                
                {/* Content Preview */}
                <p className={`text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap mb-3 ${isListView ? 'line-clamp-2' : 'line-clamp-3'}`}>
                    {note.content}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{stats.words} kata</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{stats.readingTime} menit baca</span>
                    </div>
                </div>
                
                {/* Links */}
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
                            {note.links.slice(0, isListView ? 1 : 2).map((link, i) => (
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
                            {note.links.length > (isListView ? 1 : 2) && (
                                <p className="text-xs text-slate-400 pl-2">+{note.links.length - (isListView ? 1 : 2)} link lainnya</p>
                            )}
                        </div>
                    </motion.div>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-400">{note.created_at}</p>
                    </div>
                    {note.updated_at !== note.created_at && (
                        <Badge variant="outline" className="text-xs">
                            Diperbarui
                        </Badge>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
