import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Edit,
    Download,
    Filter,
    RefreshCw,
    Play,
    Pause,
    CalendarCheck,
    CalendarClock,
    BookOpen,
    Users,
    X,
} from 'lucide-react';
import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Course {
    id: number;
    nama: string;
    sks: number;
    dosen?: { nama: string };
}

interface Session {
    id: number;
    course_id: number;
    meeting_number: number;
    title?: string;
    start_at: string;
    end_at: string;
    is_active: boolean;
    course?: Course;
    logs_count?: number;
}

interface Stats {
    total: number;
    active: number;
    completed: number;
    scheduled: number;
    total_attendance: number;
    avg_per_session: number;
    unique_courses: number;
}

interface WeeklySchedule {
    day: string;
    sessions: { id: number; course: string; meeting: number; time: string; is_active: boolean }[];
}

interface PageProps {
    sessions: {
        data: Session[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    courses: Course[];
    stats: Stats;
    weeklySchedule: WeeklySchedule[];
    courseDistribution: { name: string; count: number }[];
    upcomingSessions: Session[];
    recentSessions: Session[];
    filters: {
        course_id: string;
        status: string;
        date_from: string;
        date_to: string;
    };
    flash?: { success?: string; error?: string };
}

export default function AdminJadwal({
    sessions,
    courses,
    stats,
    weeklySchedule,
    courseDistribution,
    upcomingSessions,
    recentSessions,
    filters,
    flash,
}: PageProps) {
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const addForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });

    const editForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });

    const handleFilter = () => {
        router.get('/admin/jadwal', { course_id: courseId, status, date_from: dateFrom, date_to: dateTo }, { preserveState: true });
    };

    const handleExportPdf = () => {
        window.open(`/admin/jadwal/pdf?date_from=${dateFrom}&date_to=${dateTo}`, '_blank');
    };

    const submitAdd = (e: FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/jadwal', {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setShowAddForm(false);
            },
        });
    };

    const startEdit = (s: Session) => {
        setEditingId(s.id);
        editForm.setData({
            course_id: String(s.course_id),
            meeting_number: s.meeting_number,
            title: s.title || '',
            start_at: s.start_at?.replace(' ', 'T').slice(0, 16) || '',
            end_at: s.end_at?.replace(' ', 'T').slice(0, 16) || '',
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        editForm.patch(`/admin/jadwal/${editingId}`, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const formatLabel = (label: string) =>
        label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&amp;/g, '&').replace(/<[^>]*>/g, '');

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12
            }
        }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <AppLayout>
            <Head title="Jadwal" />

            <motion.div className="p-6 space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
                {/* Header */}
                <motion.div 
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg"
                >
                    <motion.div 
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div 
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                        animate={{ 
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ 
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Calendar className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-sm text-blue-100">Manajemen</p>
                                <h1 className="text-2xl font-bold">Jadwal Sesi Absen</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">
                            Kelola jadwal sesi absensi, aktifkan sesi, dan pantau kehadiran
                        </p>
                    </div>
                </motion.div>

                {/* Flash Messages */}
                <AnimatePresence>
                    {(flash?.success || flash?.error) && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`rounded-xl p-4 ${flash.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                        >
                            {flash.success || flash.error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <motion.div 
                    className="grid gap-4 md:grid-cols-4 lg:grid-cols-7"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <Play className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Aktif</p>
                                <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <CalendarCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Selesai</p>
                                <p className="text-xl font-bold text-slate-600">{stats.completed}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                <CalendarClock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Terjadwal</p>
                                <p className="text-xl font-bold text-amber-600">{stats.scheduled}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Kehadiran</p>
                                <p className="text-xl font-bold text-purple-600">{stats.total_attendance}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Rata-rata</p>
                                <p className="text-xl font-bold text-cyan-600">{stats.avg_per_session}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Matkul</p>
                                <p className="text-xl font-bold text-indigo-600">{stats.unique_courses}</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Filter & Actions */}
                <motion.div 
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    whileHover={{ scale: 1.005, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-6">
                        <div>
                            <Label className="mb-2 block text-sm">Dari Tanggal</Label>
                            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Sampai Tanggal</Label>
                            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Mata Kuliah</Label>
                            <select
                                value={courseId}
                                onChange={e => setCourseId(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                            >
                                <option value="all">Semua</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Status</Label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                            >
                                <option value="all">Semua</option>
                                <option value="active">Aktif</option>
                                <option value="completed">Selesai</option>
                                <option value="scheduled">Terjadwal</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 md:col-span-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button onClick={handleFilter} className="flex-1">
                                    <RefreshCw className="h-4 w-4" />
                                    Filter
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button onClick={() => setShowAddForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                                    <Plus className="h-4 w-4" />
                                    Tambah
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button onClick={handleExportPdf} className="bg-gradient-to-r from-blue-500 to-purple-600">
                                    <Download className="h-4 w-4" />
                                    PDF
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>


                {/* Add Form Modal */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, rotateY: -15 }}
                                animate={{ scale: 1, rotateY: 0 }}
                                exit={{ scale: 0.9, rotateY: 15 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Tambah Jadwal</h3>
                                    <motion.button 
                                        onClick={() => setShowAddForm(false)} 
                                        className="text-slate-400 hover:text-slate-600"
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.button>
                                </div>
                                <form onSubmit={submitAdd} className="space-y-4">
                                    <div>
                                        <Label>Mata Kuliah</Label>
                                        <select
                                            value={addForm.data.course_id}
                                            onChange={e => addForm.setData('course_id', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <option value="">Pilih mata kuliah</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.nama} (SKS {c.sks})</option>)}
                                        </select>
                                        <InputError message={addForm.errors.course_id} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Pertemuan ke</Label>
                                            <Input type="number" min={1} max={21} value={addForm.data.meeting_number} onChange={e => addForm.setData('meeting_number', Number(e.target.value))} />
                                            <InputError message={addForm.errors.meeting_number} />
                                        </div>
                                        <div>
                                            <Label>Judul (opsional)</Label>
                                            <Input value={addForm.data.title} onChange={e => addForm.setData('title', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Waktu Mulai</Label>
                                        <Input type="datetime-local" value={addForm.data.start_at} onChange={e => addForm.setData('start_at', e.target.value)} />
                                        <InputError message={addForm.errors.start_at} />
                                    </div>
                                    <div>
                                        <Label>Waktu Selesai</Label>
                                        <Input type="datetime-local" value={addForm.data.end_at} onChange={e => addForm.setData('end_at', e.target.value)} />
                                        <InputError message={addForm.errors.end_at} />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit" disabled={addForm.processing} className="flex-1">
                                            <Plus className="h-4 w-4" />
                                            Simpan
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Batal</Button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Grid */}
                <motion.div 
                    className="grid gap-6 lg:grid-cols-3"
                    variants={containerVariants}
                >
                    {/* Sessions Table */}
                    <motion.div 
                        variants={slideInLeft}
                        className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Jadwal</h2>
                                </div>
                                <span className="text-sm text-slate-500">Total {sessions.total}</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {sessions.data.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-500">Tidak ada jadwal</p>
                                </div>
                            ) : (
                                sessions.data.map((s, index) => (
                                    <motion.div 
                                        key={s.id} 
                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        {editingId === s.id ? (
                                            <form onSubmit={submitEdit} className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <select
                                                        value={editForm.data.course_id}
                                                        onChange={e => editForm.setData('course_id', e.target.value)}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                                    >
                                                        {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                                    </select>
                                                    <Input type="number" min={1} max={21} value={editForm.data.meeting_number} onChange={e => editForm.setData('meeting_number', Number(e.target.value))} placeholder="Pertemuan" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input type="datetime-local" value={editForm.data.start_at} onChange={e => editForm.setData('start_at', e.target.value)} />
                                                    <Input type="datetime-local" value={editForm.data.end_at} onChange={e => editForm.setData('end_at', e.target.value)} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="submit" size="sm" disabled={editForm.processing}>Simpan</Button>
                                                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>Batal</Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-medium text-slate-900 dark:text-white">{s.course?.nama || 'Mata Kuliah'}</h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            {s.is_active ? 'Aktif' : 'Terjadwal'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500">Pertemuan {s.meeting_number} {s.title && `• ${s.title}`}</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        <Clock className="inline h-3 w-3 mr-1" />
                                                        {s.start_at} - {s.end_at}
                                                    </p>
                                                    {s.logs_count !== undefined && (
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            <Users className="inline h-3 w-3 mr-1" />
                                                            {s.logs_count} kehadiran
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {s.is_active ? (
                                                        <Button size="sm" variant="outline" onClick={() => router.patch(`/admin/jadwal/${s.id}/deactivate`, {}, { preserveScroll: true })}>
                                                            <Pause className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => router.patch(`/admin/jadwal/${s.id}/activate`, {}, { preserveScroll: true })}>
                                                            <Play className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" onClick={() => startEdit(s)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="text-red-600" onClick={() => router.delete(`/admin/jadwal/${s.id}`, { preserveScroll: true })}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                        {sessions.last_page > 1 && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                                {sessions.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-50 text-slate-400 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: formatLabel(link.label) }}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div 
                        variants={slideInRight}
                        className="space-y-6"
                    >
                        {/* Weekly Schedule */}
                        <motion.div 
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Minggu Ini</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-64 overflow-y-auto">
                                {weeklySchedule.map((day, dayIndex) => (
                                    <motion.div 
                                        key={day.day} 
                                        className="p-3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: dayIndex * 0.05 }}
                                    >
                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{day.day}</p>
                                        {day.sessions.length === 0 ? (
                                            <p className="text-xs text-slate-400">Tidak ada jadwal</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {day.sessions.map(s => (
                                                    <div key={s.id} className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-700 dark:text-slate-300 truncate">{s.course}</span>
                                                        <span className="text-xs text-slate-500">{s.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Course Distribution */}
                        {courseDistribution.length > 0 && (
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                whileHover={{ scale: 1.01, y: -2 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi Matkul</h2>
                                </div>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={courseDistribution} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={80} />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Upcoming Sessions */}
                        <motion.div 
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="h-5 w-5 text-amber-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Akan Datang</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {upcomingSessions.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">Tidak ada jadwal</div>
                                ) : (
                                    upcomingSessions.map((s, index) => (
                                        <motion.div 
                                            key={s.id} 
                                            className="p-3"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                        >
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{s.course?.nama}</p>
                                            <p className="text-xs text-slate-500">Pertemuan {s.meeting_number} • {s.start_at}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
