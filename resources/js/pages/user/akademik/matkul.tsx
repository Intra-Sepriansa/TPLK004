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
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    BookOpen, Plus, ArrowLeft, Monitor, Building2, Clock, Calendar,
    Trash2, Edit, CheckCircle2, GraduationCap, CheckCircle, XCircle, Sparkles,
    TrendingUp, Target, BookA
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, FormEvent, useEffect, useRef } from 'react';

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
    saturday: 'Sabtu',
};

export default function AcademicCourses({ courses }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;

    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    // Mouse tracking for parallax
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
    };

    // Calculate stats
    const stats = {
        total: courses.length,
        online: courses.filter(c => c.mode === 'online').length,
        offline: courses.filter(c => c.mode === 'offline').length,
        avgProgress: courses.length > 0
            ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
            : 0,
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
                            className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${toast.type === 'success'
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
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
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

                        {/* Floating Book Icons */}
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
                                <BookOpen className="h-4 w-4 text-white/40" />
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
                                    className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-xl"
                                >
                                    <BookA className="h-16 w-16 text-white" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-white/90 font-medium"
                                    >
                                        Manajemen Akademik
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Mata Kuliah
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
                                            Tambah Matkul
                                        </Button>
                                    </motion.div>
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
                                                        <SelectItem value="saturday">Sabtu</SelectItem>
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
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-white/90 text-lg"
                        >
                            Kelola mata kuliah semester ini
                        </motion.p>

                        {/* Quick Stats with Dock-Style Animations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {[
                                { icon: BookOpen, label: 'Total Matkul', value: stats.total, color: 'emerald' },
                                { icon: Monitor, label: 'Online', value: stats.online, color: 'blue' },
                                { icon: Building2, label: 'Offline', value: stats.offline, color: 'teal' },
                                { icon: TrendingUp, label: 'Avg Progress', value: stats.avgProgress, suffix: '%', color: 'cyan' },
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
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 dark:border-emerald-800/70 shadow-sm backdrop-blur overflow-hidden"
                >
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg"
                            >
                                <GraduationCap className="h-5 w-5 text-emerald-600" />
                            </motion.div>
                            <div>
                                <p className="font-medium">Aturan SKS</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    2 SKS = 14 pertemuan (UTS setelah P7, UAS setelah P14)<br />
                                    3 SKS = 21 pertemuan (UTS setelah P14, UAS setelah P21)
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Courses Grid */}
                {courses.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course, index) => (
                            <MagneticCourseCard
                                key={course.id}
                                course={course}
                                index={index}
                                dayNames={dayNames}
                                handleEdit={handleEdit}
                                openDeleteDialog={openDeleteDialog}
                                handleMarkMeeting={handleMarkMeeting}
                            />
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
                                    <BookA className="h-24 w-24 mx-auto mb-3 text-slate-300 dark:text-slate-700 opacity-50 drop-shadow-sm" />
                                </motion.div>
                                <p className="text-muted-foreground font-medium mb-2">Belum ada mata kuliah</p>
                                <p className="text-sm text-muted-foreground mb-4">Tambahkan mata kuliah untuk mulai tracking</p>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="outline" onClick={() => setShowForm(true)} className="rounded-xl">
                                        <Plus className="h-4 w-4 mr-2" /> Tambah Mata Kuliah
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
                    title="Hapus Mata Kuliah"
                    message="Yakin ingin menghapus mata kuliah ini? Semua tugas dan catatan terkait juga akan dihapus."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </motion.div>
        </StudentLayout>
    );
}

// Magnetic Course Card Component with 3D Effects
function MagneticCourseCard({ course, index, dayNames, handleEdit, openDeleteDialog, handleMarkMeeting }: {
    course: Course;
    index: number;
    dayNames: Record<string, string>;
    handleEdit: (course: Course) => void;
    openDeleteDialog: (id: number) => void;
    handleMarkMeeting: (courseId: number, meetingNumber: number) => void;
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
            transition={{ delay: 0.2 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
                transition: 'transform 0.1s ease-out',
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="relative rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden group"
        >
            {/* Top Color Bar */}
            <div className={`h-2 ${course.mode === 'offline' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`} />

            {/* Glow Effect */}
            <motion.div
                className={`absolute inset-0 ${course.mode === 'offline' ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10' : 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-indigo-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <div className="relative z-10 p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <motion.div whileHover={{ scale: 1.2, y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                            {course.mode === 'offline' ? (
                                <Building2 className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <Monitor className="h-5 w-5 text-blue-600" />
                            )}
                        </motion.div>
                        <Badge variant={course.mode === 'offline' ? 'default' : 'secondary'} className={`text-xs ${course.mode === 'offline' ? 'bg-emerald-500' : ''}`}>
                            {course.mode === 'offline' ? 'Offline' : 'Online'}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-2">{course.sks} SKS</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <motion.div whileHover={{ scale: 1.2, rotate: 15 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" onClick={() => handleEdit(course)}>
                                <Edit className="h-4 w-4 text-emerald-600" />
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.2, rotate: -15 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => openDeleteDialog(course.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    </div>
                </div>

                <motion.h3
                    whileHover={{ x: 5 }}
                    className="font-bold text-lg text-slate-900 dark:text-white mb-4"
                >
                    {course.name}
                </motion.h3>

                {/* Schedule */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{dayNames[course.schedule_day]}</span>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.schedule_time}</span>
                    </motion.div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold text-emerald-600">{course.current_meeting}/{course.total_meetings}</span>
                    </div>
                    <Progress value={course.progress} className="h-2.5" />
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        className={`p-3 rounded-xl text-center ${course.current_meeting >= course.uts_meeting ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700' : 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800'}`}
                    >
                        <p className="text-xs text-muted-foreground font-medium mb-1">UTS</p>
                        <p className="font-bold text-sm">
                            {course.current_meeting >= course.uts_meeting ? (
                                <span className="text-emerald-600 flex items-center justify-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> Selesai
                                </span>
                            ) : (
                                <span className="text-amber-600">P{course.uts_meeting}</span>
                            )}
                        </p>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        className={`p-3 rounded-xl text-center ${course.current_meeting >= course.uas_meeting ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'}`}
                    >
                        <p className="text-xs text-muted-foreground font-medium mb-1">UAS</p>
                        <p className="font-bold text-sm">
                            {course.current_meeting >= course.uas_meeting ? (
                                <span className="text-emerald-600 flex items-center justify-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> Selesai
                                </span>
                            ) : (
                                <span className="text-red-600">P{course.uas_meeting}</span>
                            )}
                        </p>
                    </motion.div>
                </div>

                {/* Mark Meeting Complete */}
                {course.current_meeting < course.total_meetings && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            className="w-full rounded-xl border-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500"
                            onClick={() => handleMarkMeeting(course.id, course.current_meeting + 1)}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Tandai P{course.current_meeting + 1} Selesai
                        </Button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
