import AkademikIcon from '@/assets/mahasiswa/akademik/akademik.png';
import MindMapView from '@/components/MindMapView';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import StudentLayout from '@/layouts/student-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlignLeft,
    ArrowRight,
    BookOpen,
    BrainCircuit,
    Building2,
    Calendar,
    CheckCircle,
    ChevronLeft,
    Clock,
    Columns3,
    Copy,
    Edit,
    ExternalLink,
    Eye,
    FileText,
    Hash,
    LayoutGrid,
    List,
    Monitor,
    Pin,
    Plus,
    Search,
    Sparkles,
    Star,
    Trash2,
    TrendingUp,
    XCircle,
    Zap,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

// Add new AI Response interface
interface AIResponse {
    summary?: string;
    keywords?: string[];
    flashcards?: Array<{ question: string; answer: string }>;
}

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
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();
    const flash = props.flash;

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [toast, setToast] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });
    const [viewMode, setViewMode] = useState<
        'grid' | 'list' | 'masonry' | 'mindmap'
    >('grid');
    const [sortBy, setSortBy] = useState<'date' | 'title' | 'course'>('date');
    const [pinnedNotes, setPinnedNotes] = useState<number[]>([]);
    const [favoriteNotes, setFavoriteNotes] = useState<number[]>([]);

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
        setPinnedNotes((prev) =>
            prev.includes(noteId)
                ? prev.filter((id) => id !== noteId)
                : [...prev, noteId],
        );
    };

    // Toggle favorite note
    const toggleFavorite = (noteId: number) => {
        setFavoriteNotes((prev) =>
            prev.includes(noteId)
                ? prev.filter((id) => id !== noteId)
                : [...prev, noteId],
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
        setToast({
            type: 'error',
            message: 'Fitur deaktifkan untuk catatan ini.',
        });
        setTimeout(() => setToast(null), 3000);
    };

    // Sort and filter notes
    const sortedAndFilteredNotes = useMemo(() => {
        const filtered = [...notes];

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else {
                return a.course_name.localeCompare(b.course_name);
            }
        });

        // Separate pinned notes
        const pinned = filtered.filter((n) => pinnedNotes.includes(n.id));
        const unpinned = filtered.filter((n) => !pinnedNotes.includes(n.id));

        return [...pinned, ...unpinned];
    }, [notes, sortBy, pinnedNotes]);

    // Group notes by course
    const notesByCourse = sortedAndFilteredNotes.reduce(
        (acc, note) => {
            if (!acc[note.course_name]) {
                acc[note.course_name] = {
                    mode: note.course_mode,
                    notes: [],
                };
            }
            acc[note.course_name].notes.push(note);
            return acc;
        },
        {} as Record<string, { mode: 'online' | 'offline'; notes: Note[] }>,
    );

    // Calculate stats
    const stats = {
        total: notes.length,
        courses: Object.keys(notesByCourse).length,
        thisWeek: notes.filter((n) => {
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

    const handleEdit = (note: Note) => {
        router.visit(`/user/akademik/catatan/${note.id}/edit`);
    };

    const handleView = (note: Note) => {
        router.visit(`/user/akademik/catatan/${note.id}`);
    };

    const openDeleteDialog = (id: number) =>
        setDeleteDialog({ open: true, id });

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
        router.get(
            '/user/akademik/catatan',
            {
                ...filters,
                search: searchQuery,
            },
            { preserveState: true },
        );
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/user/akademik/catatan',
            {
                ...filters,
                [key]: value === 'all' ? '' : value,
            },
            { preserveState: true },
        );
    };

    // Removed old modal handler functions

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
                            className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${
                                toast.type === 'success'
                                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            {toast.type === 'success' ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : (
                                <XCircle className="h-5 w-5" />
                            )}
                            <span className="text-sm font-medium">
                                {toast.message}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl border border-white/20 p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <Link href="/user/akademik">
                            <motion.button
                                whileHover={{ scale: 1.05, x: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-100 hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Kembali ke Akademik
                            </motion.button>
                        </Link>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.06, rotate: 4 }}
                                    className="relative flex h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                                >
                                    <img
                                        src={AkademikIcon}
                                        alt="Catatan Pembelajaran"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.55)]"
                                    />
                                </motion.div>

                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="text-sm font-medium text-indigo-100"
                                    >
                                        Manajemen Pembelajaran
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Catatan Pembelajaran
                                    </motion.h1>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <Link href="/user/akademik/catatan/create">
                                    <Button className="group flex items-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-6 py-6 text-white shadow-lg shadow-black/20 backdrop-blur-xl transition-all hover:bg-white/25 hover:shadow-white/10">
                                        <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                                        <span className="text-lg font-semibold">
                                            Catatan Baru
                                        </span>
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-lg text-indigo-100"
                        >
                            Catat materi setiap pertemuan untuk referensi
                            belajar
                        </motion.p>
                    </div>
                </motion.div>

                {/* Stats Cards - Outside Header */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
                >
                    {[
                        {
                            icon: FileText,
                            label: 'Total Catatan',
                            value: stats.total,
                            iconColor: 'text-sky-500',
                            glow: 'bg-sky-500',
                            gradientBg:
                                'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
                        },
                        {
                            icon: BookOpen,
                            label: 'Mata Kuliah',
                            value: stats.courses,
                            iconColor: 'text-violet-500',
                            glow: 'bg-violet-500',
                            gradientBg:
                                'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10',
                        },
                        {
                            icon: TrendingUp,
                            label: 'Minggu Ini',
                            value: stats.thisWeek,
                            iconColor: 'text-amber-500',
                            glow: 'bg-amber-500',
                            gradientBg:
                                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                delay: 0.15 + index * 0.05,
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                            }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.gradientBg}`}
                            />
                            <div
                                className={`absolute -top-8 -right-8 h-24 w-24 rounded-full ${stat.glow} opacity-15 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-35`}
                            />

                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter
                                            value={stat.value}
                                            duration={1500}
                                        />
                                    </p>
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.08, rotate: 6 }}
                                >
                                    <stat.icon
                                        className={`h-5 w-5 ${stat.iconColor}`}
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Search & Filter */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="space-y-4 p-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-1 gap-2"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder="Cari catatan..."
                                        className="h-11 rounded-xl border-2 pl-9 transition-colors hover:border-purple-300 focus:border-purple-500"
                                    />
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        className="h-11 rounded-xl"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Cari
                                    </Button>
                                </motion.div>
                            </form>
                            <Select
                                value={filters.course_id || 'all'}
                                onValueChange={(v) =>
                                    handleFilter('course_id', v)
                                }
                            >
                                <SelectTrigger className="h-11 w-full rounded-xl border-2 transition-colors hover:border-purple-300 md:w-[200px]">
                                    <SelectValue placeholder="Semua Matkul" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Matkul
                                    </SelectItem>
                                    {courses.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* View Mode & Sort Options */}
                        <div className="flex items-center justify-between gap-4 border-t border-neutral-200/70 pt-4 dark:border-neutral-700/70">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Tampilan:
                                </span>
                                <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                                    {[
                                        {
                                            value: 'grid' as const,
                                            icon: LayoutGrid,
                                            label: 'Grid',
                                        },
                                        {
                                            value: 'list' as const,
                                            icon: List,
                                            label: 'List',
                                        },
                                        {
                                            value: 'masonry' as const,
                                            icon: Columns3,
                                            label: 'Masonry',
                                        },
                                        {
                                            value: 'mindmap' as const,
                                            icon: BrainCircuit,
                                            label: 'Mind Map',
                                        },
                                    ].map((mode) => (
                                        <motion.button
                                            key={mode.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                setViewMode(mode.value)
                                            }
                                            className={`rounded-md p-2 transition-colors ${
                                                viewMode === mode.value
                                                    ? 'bg-white text-purple-600 shadow-sm dark:bg-neutral-700'
                                                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                            }`}
                                            title={mode.label}
                                        >
                                            <mode.icon className="h-4 w-4" />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Urutkan:
                                </span>
                                <Select
                                    value={sortBy}
                                    onValueChange={(v: any) => setSortBy(v)}
                                >
                                    <SelectTrigger className="h-9 w-[140px] rounded-lg border-2 transition-colors hover:border-purple-300">
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
                {viewMode === 'mindmap' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full rounded-xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <MindMapView notes={notes} courses={courses} />
                    </motion.div>
                ) : Object.keys(notesByCourse).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(notesByCourse).map(
                            (
                                [courseName, { mode, notes: courseNotes }],
                                courseIndex,
                            ) => (
                                <motion.div
                                    key={courseName}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                                >
                                    <div className="border-b border-neutral-200/70 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-neutral-700/70 dark:from-purple-950/20 dark:to-pink-950/20">
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.2,
                                                    y: -2,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 300,
                                                    damping: 15,
                                                }}
                                                className={`rounded-lg p-2 ${mode === 'offline' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}
                                            >
                                                {mode === 'offline' ? (
                                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <Monitor className="h-5 w-5 text-blue-600" />
                                                )}
                                            </motion.div>
                                            <div className="flex-1">
                                                <h2 className="font-semibold text-neutral-900 dark:text-white">
                                                    {courseName}
                                                </h2>
                                                <p className="text-xs text-neutral-500">
                                                    {courseNotes.length} catatan
                                                    tersimpan
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    mode === 'offline'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className={`text-xs ${mode === 'offline' ? 'bg-emerald-500' : ''}`}
                                            >
                                                {mode === 'offline'
                                                    ? 'Offline'
                                                    : 'Online'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div
                                            className={`grid gap-4 ${
                                                viewMode === 'grid'
                                                    ? 'md:grid-cols-2'
                                                    : viewMode === 'list'
                                                      ? 'grid-cols-1'
                                                      : 'md:grid-cols-3'
                                            }`}
                                        >
                                            {courseNotes.map(
                                                (note, noteIndex) => (
                                                    <AdvancedNoteCard
                                                        key={note.id}
                                                        note={note}
                                                        noteIndex={noteIndex}
                                                        viewMode={viewMode}
                                                        isPinned={pinnedNotes.includes(
                                                            note.id,
                                                        )}
                                                        isFavorite={favoriteNotes.includes(
                                                            note.id,
                                                        )}
                                                        onTogglePin={() =>
                                                            togglePin(note.id)
                                                        }
                                                        onToggleFavorite={() =>
                                                            toggleFavorite(
                                                                note.id,
                                                            )
                                                        }
                                                        onView={() =>
                                                            handleView(note)
                                                        }
                                                        onEdit={() =>
                                                            handleEdit(note)
                                                        }
                                                        onDuplicate={() =>
                                                            handleDuplicate(
                                                                note,
                                                            )
                                                        }
                                                        onDelete={() =>
                                                            openDeleteDialog(
                                                                note.id,
                                                            )
                                                        }
                                                        stats={getNoteStats(
                                                            note.content,
                                                        )}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ),
                        )}
                    </div>
                ) : (
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
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
                                        ease: 'easeInOut',
                                    }}
                                    className="inline-block"
                                >
                                    <img
                                        src={AkademikIcon}
                                        alt="Catatan Pembelajaran"
                                        className="mb-3 h-16 w-16 object-contain opacity-65 drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                    />
                                </motion.div>
                                <p className="mb-2 font-medium text-muted-foreground">
                                    Belum ada catatan
                                </p>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Mulai catat materi pembelajaran kamu
                                </p>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href="/user/akademik/catatan/create">
                                        <Button
                                            variant="outline"
                                            className="rounded-xl"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />{' '}
                                            Tambah Catatan Pertama
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({
                            open,
                            id: open ? deleteDialog.id : null,
                        })
                    }
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

function AdvancedNoteCard({
    note,
    noteIndex,
    viewMode,
    isPinned,
    isFavorite,
    onTogglePin,
    onToggleFavorite,
    onView,
    onEdit,
    onDuplicate,
    onDelete,
    stats,
}: {
    note: Note;
    noteIndex: number;
    viewMode: 'grid' | 'list' | 'masonry' | 'mindmap';
    isPinned: boolean;
    isFavorite: boolean;
    onTogglePin: () => void;
    onToggleFavorite: () => void;
    onView: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    stats: { words: number; readingTime: number };
}) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showActions, setShowActions] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // AI States
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [showAIDialog, setShowAIDialog] = useState(false);
    const [aiMode, setAiMode] = useState<'summary' | 'flashcards'>('summary');

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

    const handleGenerateAI = async (mode: 'summary' | 'flashcards') => {
        setAiMode(mode);
        setShowAIDialog(true);
        setIsGeneratingAI(true);
        setAiResponse(null);

        try {
            const endpoint =
                mode === 'summary'
                    ? `/user/akademik/catatan/${note.id}/generate-summary`
                    : `/user/akademik/catatan/${note.id}/generate-flashcards`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (!response.ok) throw new Error('Failed to generate AI content');

            const data = await response.json();
            setAiResponse(data);
        } catch (error) {
            console.error('AI error:', error);
            // Show error state in dialog
        } finally {
            setIsGeneratingAI(false);
        }
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
            style={
                !isListView
                    ? {
                          transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
                          transition: 'transform 0.1s ease-out',
                      }
                    : {}
            }
            whileHover={{
                scale: isListView ? 1.01 : 1.02,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            }}
            className={`group relative overflow-hidden rounded-2xl border-2 bg-white/70 backdrop-blur-xl dark:bg-neutral-900/40 ${
                isPinned
                    ? 'border-amber-400 dark:border-amber-600'
                    : 'border-white/20 dark:border-white/5'
            } ${isListView ? 'flex items-start gap-4 p-4' : 'p-5'}`}
        >
            {/* Pin Indicator */}
            {isPinned && (
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-0 right-0 h-0 w-0 border-t-[40px] border-l-[40px] border-t-amber-400 border-l-transparent"
                >
                    <Pin className="absolute -top-8 right-1 h-4 w-4 rotate-45 text-white" />
                </motion.div>
            )}

            {/* Glow Effect */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                    isPinned
                        ? 'from-amber-500/10 via-yellow-500/10 to-orange-500/10'
                        : isFavorite
                          ? 'from-rose-500/10 via-pink-500/10 to-purple-500/10'
                          : 'from-purple-500/10 via-pink-500/10 to-rose-500/10'
                }`}
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <div className={`relative z-10 ${isListView ? 'flex-1' : ''}`}>
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <motion.div whileHover={{ scale: 1.1 }}>
                            <Badge
                                variant="outline"
                                className="border-2 border-purple-200 bg-purple-50 text-xs dark:border-purple-800 dark:bg-purple-950/30"
                            >
                                <Calendar className="mr-1 h-3 w-3" />P
                                {note.meeting_number}
                            </Badge>
                        </motion.div>
                        {isFavorite && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                            >
                                <Badge
                                    variant="outline"
                                    className="border-2 border-rose-200 bg-rose-50 text-xs dark:border-rose-800 dark:bg-rose-950/30"
                                >
                                    <Star className="mr-1 h-3 w-3 fill-rose-500 text-rose-500" />
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
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 ${isPinned ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                                        onClick={onTogglePin}
                                        title={isPinned ? 'Unpin' : 'Pin'}
                                    >
                                        <Pin
                                            className={`h-4 w-4 ${isPinned ? 'fill-amber-600' : ''}`}
                                        />
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                        onClick={onView}
                                        title="Lihat Detail"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                        onClick={() =>
                                            handleGenerateAI('summary')
                                        }
                                        title="AI Summary"
                                    >
                                        <BrainCircuit className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-yellow-500 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                                        onClick={() =>
                                            handleGenerateAI('flashcards')
                                        }
                                        title="AI Flashcards"
                                    >
                                        <Zap className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 ${isFavorite ? 'text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                                        onClick={onToggleFavorite}
                                        title={
                                            isFavorite
                                                ? 'Unfavorite'
                                                : 'Favorite'
                                        }
                                    >
                                        <Star
                                            className={`h-4 w-4 ${isFavorite ? 'fill-rose-600' : ''}`}
                                        />
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.2, rotate: 15 }}
                                    whileTap={{ scale: 0.9 }}
                                >
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
                                <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
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
                                <motion.div
                                    whileHover={{ scale: 1.2, rotate: -15 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
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
                    onClick={onView}
                    className={`mb-2 cursor-pointer font-bold text-neutral-900 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300 ${isListView ? 'text-xl' : 'text-lg'}`}
                >
                    {note.title}
                </motion.h4>

                {/* Content Preview */}
                <div
                    className={`prose prose-sm dark:prose-invert mb-3 max-w-none text-sm text-neutral-600 dark:text-neutral-400 ${isListView ? 'line-clamp-2' : 'line-clamp-3'}`}
                    dangerouslySetInnerHTML={{ __html: note.content }}
                />

                {/* Stats */}
                <div className="mb-3 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
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
                        className="mt-3 border-t border-neutral-200/70 pt-3 dark:border-neutral-700/70"
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                Link Referensi
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            {note.links
                                .slice(0, isListView ? 1 : 2)
                                .map((link, i) => (
                                    <motion.a
                                        key={i}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ x: 5, scale: 1.02 }}
                                        className="flex items-center gap-2 rounded-lg p-2 text-xs text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-neutral-800/70 dark:hover:text-blue-300"
                                    >
                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{link}</span>
                                    </motion.a>
                                ))}
                            {note.links.length > (isListView ? 1 : 2) && (
                                <p className="pl-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    +{note.links.length - (isListView ? 1 : 2)}{' '}
                                    link lainnya
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-200/70 pt-3 dark:border-neutral-700/70">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {note.created_at}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onView}
                            className="h-6 px-2 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                        >
                            Detail
                            <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                        <div className="mr-2 flex -space-x-2">
                            <motion.div
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                className="relative z-0"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-teal-100 text-[10px] font-bold text-teal-700 dark:border-neutral-800">
                                    ME
                                </div>
                            </motion.div>
                        </div>
                        {note.updated_at !== note.created_at && (
                            <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px]"
                            >
                                Diperbarui
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Result Dialog */}
            <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                            {aiMode === 'summary' ? (
                                <BrainCircuit className="h-6 w-6 text-indigo-500" />
                            ) : (
                                <Zap className="h-6 w-6 text-yellow-500" />
                            )}
                            AI{' '}
                            {aiMode === 'summary'
                                ? 'Summary & Keywords'
                                : 'Smart Flashcards'}
                        </DialogTitle>
                        <DialogDescription>
                            Dihasilkan secara otomatis menggunakan kecerdasan
                            buatan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex min-h-[200px] flex-col justify-center py-4">
                        <AnimatePresence mode="wait">
                            {isGeneratingAI ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center gap-4 py-8"
                                >
                                    <motion.div
                                        animate={{
                                            rotate: 360,
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            rotate: {
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            },
                                            scale: {
                                                duration: 1,
                                                repeat: Infinity,
                                            },
                                        }}
                                        className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600"
                                    />
                                    <p className="animate-pulse text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                        Memproses catatan dengan AI...
                                    </p>
                                </motion.div>
                            ) : aiResponse ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {aiMode === 'summary' && (
                                        <>
                                            <div className="space-y-2">
                                                <h4 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                                                    <AlignLeft className="h-4 w-4 text-indigo-500" />
                                                    Ringkasan Topik
                                                </h4>
                                                <div className="rounded-xl bg-indigo-50 p-4 text-sm leading-relaxed text-neutral-700 dark:bg-violet-900/30 dark:text-neutral-300">
                                                    {aiResponse.summary ||
                                                        'Summary not returning.'}
                                                </div>
                                            </div>

                                            {aiResponse.keywords &&
                                                aiResponse.keywords.length >
                                                    0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                                                            <Hash className="h-4 w-4 text-purple-500" />
                                                            Keywords
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {aiResponse.keywords.map(
                                                                (kw, idx) => (
                                                                    <Badge
                                                                        key={
                                                                            idx
                                                                        }
                                                                        variant="secondary"
                                                                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300"
                                                                    >
                                                                        {kw}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </>
                                    )}

                                    {aiMode === 'flashcards' &&
                                        aiResponse.flashcards && (
                                            <div className="space-y-4">
                                                {aiResponse.flashcards.map(
                                                    (card, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{
                                                                opacity: 0,
                                                                x: -20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    idx * 0.1,
                                                            }}
                                                            className="space-y-2 rounded-xl border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-4 dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800/50"
                                                        >
                                                            <div className="flex gap-2">
                                                                <span className="font-bold text-yellow-600 dark:text-yellow-500">
                                                                    Q:
                                                                </span>
                                                                <p className="font-medium text-neutral-900 dark:text-white">
                                                                    {
                                                                        card.question
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="mt-2 flex gap-2 border-t border-neutral-100 pt-2 dark:border-neutral-700/60">
                                                                <span className="font-bold text-emerald-600 dark:text-emerald-500">
                                                                    A:
                                                                </span>
                                                                <p className="text-neutral-600 dark:text-neutral-400">
                                                                    {
                                                                        card.answer
                                                                    }
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </motion.div>
                            ) : (
                                <div className="py-8 text-center text-red-500">
                                    <XCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                    <p>
                                        Gagal memproses AI. Pastikan layanan
                                        aktif.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAIDialog(false)}
                        >
                            Tutup
                        </Button>
                        {aiResponse && (
                            <Button className="gap-2">
                                <Copy className="h-4 w-4" />
                                Copy Hasil
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
