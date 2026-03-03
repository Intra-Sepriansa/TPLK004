import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import statsHadirIcon from '@/assets/admin/live-monitor/hadir-icon.png';
import statsTerlambatIcon from '@/assets/admin/dashboard/terlambat-icon.png';
import statsAbsenIcon from '@/assets/admin/bulk-import/gagal.png';
import statsStatusIcon from '@/assets/mahasiswa/jadwal-kuliah/uas.png';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar,
    Clock,
    MapPin,
    BookOpen,
    User,
    Building2,
    Monitor,
    Download,
    Share2,
    Bell,
    BellOff,
    ChevronLeft,
    Mail,
    Phone,
    FileText,
    Link as LinkIcon,
    CheckCircle2,
    XCircle,
    Clock3,
    TrendingUp,
    Target,
    Paperclip,
    Plus,
    Edit,
    Trash2,
    ExternalLink,
    Video,
    MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

/* ═══════════════════════════════════════════════════ */
/*                     TYPES                          */
/* ═══════════════════════════════════════════════════ */
interface CourseDetail {
    id: number;
    course_name: string;
    course_code: string;
    sks: number;
    semester: number;
    mode: 'online' | 'offline';
    ruangan: string;
    meeting_link?: string;
    schedule_day: string;
    time_range: string;
    jam_mulai: string;
    jam_selesai: string;
    duration: string;
    color: string;
    description?: string;
    syllabus_url?: string;
}

interface DosenInfo {
    id: number;
    name: string;
    nidn: string;
    email: string | null;
    phone?: string | null;
    photo_url?: string | null;
    expertise: string[];
}

interface AttendanceRecord {
    id: number;
    meeting_number: number;
    date: string;
    status: 'present' | 'late' | 'absent' | 'permit';
    time_in?: string | null;
    notes?: string | null;
}

interface Material {
    id: number;
    title: string;
    type: 'pdf' | 'ppt' | 'doc' | 'video' | 'link';
    url: string;
    size?: string | null;
    uploaded_at: string;
}

interface Note {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    course: CourseDetail;
    dosen: DosenInfo;
    attendanceRecords: AttendanceRecord[];
    materials: Material[];
    notes: Note[];
    stats: {
        total_meetings: number;
        attended: number;
        late: number;
        absent: number;
        attendance_rate: number;
        can_take_uas: boolean;
        min_attendance: number;
    };
    hasReminder: boolean;
    nextMeeting: {
        number: number;
        date: string;
        time: string;
    } | null;
}

/* ═══════════════════════════════════════════════════ */
/*          ANIMATION VARIANTS                        */
/* ═══════════════════════════════════════════════════ */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
} as const;

export default function JadwalDetail({
    course,
    dosen,
    attendanceRecords,
    materials,
    notes,
    stats,
    hasReminder,
    nextMeeting,
}: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; noteId: number | null }>({ open: false, noteId: null });

    const noteForm = useForm({
        content: '',
    });

    // Toggle reminder
    const toggleReminder = () => {
        router.post(`/user/schedule/${course.id}/reminder/toggle`, {}, { preserveScroll: true });
    };

    // Join online class
    const joinClass = () => {
        if (course.meeting_link) {
            window.open(course.meeting_link, '_blank');
        }
    };

    // Export to calendar
    const exportToCalendar = () => {
        window.location.href = `/user/schedule/${course.id}/export-ical`;
    };

    // Share schedule
    const shareSchedule = () => {
        setIsShareDialogOpen(true);
    };

    // Save note
    const saveNote = () => {
        if (editingNote) {
            noteForm.put(`/user/schedule/${course.id}/notes/${editingNote.id}`, {
                onSuccess: () => {
                    setIsNoteDialogOpen(false);
                    setEditingNote(null);
                    noteForm.reset();
                },
            });
        } else {
            noteForm.post(`/user/schedule/${course.id}/notes`, {
                onSuccess: () => {
                    setIsNoteDialogOpen(false);
                    noteForm.reset();
                },
            });
        }
    };

    // Delete note
    const deleteNote = (noteId: number) => {
        setDeleteDialog({ open: true, noteId });
    };

    const handleConfirmDeleteNote = () => {
        if (!deleteDialog.noteId) return;
        router.delete(`/user/schedule/${course.id}/notes/${deleteDialog.noteId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteDialog({ open: false, noteId: null }),
        });
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'late':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'absent':
                return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
            case 'permit':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default:
                return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return CheckCircle2;
            case 'late':
                return Clock3;
            case 'absent':
                return XCircle;
            default:
                return Clock;
        }
    };

    return (
        <StudentLayout>
            <Head title={`Detail - ${course.course_name}`} />

            <motion.div
                className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HERO HEADER ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
                >
                    {/* Static Background Graphic */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50" />
                    <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50" />

                    <div className="relative">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                            <div className="flex-1 w-full relative">
                                <Link href="/user/akademik/jadwal">
                                    <motion.button
                                        whileHover={{ scale: 1.05, x: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-flex items-center gap-2 text-sm text-indigo-100 hover:text-white mb-4"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Kembali ke Jadwal
                                    </motion.button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5">
                                        {course.course_code}
                                    </Badge>
                                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5">
                                        {course.sks} SKS
                                    </Badge>
                                    <Badge className={cn(
                                        "border-white/30 text-[10px] sm:text-xs flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5",
                                        course.mode === 'online'
                                            ? "bg-blue-500/30 text-white"
                                            : "bg-emerald-500/30 text-white"
                                    )}>
                                        {course.mode === 'online' ? (
                                            <><Monitor className="h-3 w-3 mr-1" />Online</>
                                        ) : (
                                            <><Building2 className="h-3 w-3 mr-1" />Offline</>
                                        )}
                                    </Badge>
                                </div>

                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words max-w-[90%] md:max-w-full">
                                    {course.course_name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-sm text-indigo-100">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span>{course.schedule_day}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span>{course.time_range}</span>
                                    </div>
                                    {course.mode === 'offline' && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span>{course.ruangan}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dosen Card (Desktop) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="hidden lg:block w-full lg:w-auto mt-4 lg:mt-0"
                            >
                                <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30 min-w-[200px] lg:min-w-[280px]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {dosen.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white text-sm sm:text-base truncate">{dosen.name}</p>
                                            <p className="text-[10px] sm:text-xs text-indigo-200">NIDN: {dosen.nidn}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-[10px] sm:text-xs mt-3">
                                        {dosen.email && (
                                            <a href={`mailto:${dosen.email}`} className="flex items-center gap-2 text-indigo-100 hover:text-white">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{dosen.email}</span>
                                            </a>
                                        )}
                                        {dosen.phone && (
                                            <a href={`tel:${dosen.phone}`} className="flex items-center gap-2 text-indigo-100 hover:text-white">
                                                <Phone className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{dosen.phone}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.4 } },
                            }}
                            className="flex flex-nowrap lg:flex-wrap overflow-x-auto gap-2 sm:gap-2 no-scrollbar pb-2 lg:pb-0"
                        >
                            {course.mode === 'online' && course.meeting_link && (
                                <motion.button
                                    onClick={joinClass}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex whitespace-nowrap shrink-0 items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white text-indigo-600 font-semibold text-[11px] sm:text-sm shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    Join Kelas
                                </motion.button>
                            )}

                            <motion.button
                                onClick={toggleReminder}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex whitespace-nowrap shrink-0 items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 backdrop-blur-md text-[11px] sm:text-sm font-semibold hover:bg-white/30 transition-colors"
                            >
                                {hasReminder ? (
                                    <><BellOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Matikan Reminder</>
                                ) : (
                                    <><Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Set Reminder</>
                                )}
                            </motion.button>

                            <motion.button
                                onClick={exportToCalendar}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex whitespace-nowrap shrink-0 items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 backdrop-blur-md text-[11px] sm:text-sm font-semibold hover:bg-white/30 transition-colors"
                            >
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Export
                            </motion.button>

                            <motion.button
                                onClick={shareSchedule}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex whitespace-nowrap shrink-0 items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 backdrop-blur-md text-[11px] sm:text-sm font-semibold hover:bg-white/30 transition-colors"
                            >
                                <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Share
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>


                {/* ═══════ STATS CARDS ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    variants={containerVariants}
                >
                    {[
                        {
                            customIcon: statsHadirIcon,
                            title: 'Kehadiran',
                            value: stats.attended,
                            total: stats.total_meetings,
                            note: `${stats.attendance_rate}%`,
                            colorConfig: { gradientBg: 'from-sky-500/5 to-blue-500/5 dark:from-sky-500/10 dark:to-blue-500/10', glow: 'bg-sky-500' },
                        },
                        {
                            customIcon: statsTerlambatIcon,
                            title: 'Terlambat',
                            value: stats.late,
                            total: stats.total_meetings,
                            note: `${((stats.late / stats.total_meetings) * 100).toFixed(0)}%`,
                            colorConfig: { gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', glow: 'bg-amber-500' },
                        },
                        {
                            customIcon: statsAbsenIcon,
                            title: 'Tidak Hadir',
                            value: stats.absent,
                            total: stats.total_meetings,
                            note: `${((stats.absent / stats.total_meetings) * 100).toFixed(0)}%`,
                            colorConfig: { gradientBg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10', glow: 'bg-rose-500' },
                        },
                        {
                            customIcon: statsStatusIcon,
                            title: 'Status UAS',
                            value: stats.can_take_uas ? 'Bisa' : 'Tidak',
                            note: `Min ${stats.min_attendance}%`,
                            colorConfig: {
                                gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                                glow: 'bg-emerald-500',
                            },
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            variants={itemVariants}
                            whileHover={{ scale: 1.04, y: -4 }}
                            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`} />
                            <motion.div
                                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.glow} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                            />

                            <div className="relative flex flex-col items-center text-center gap-2">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center shrink-0"
                                >
                                    <img src={stat.customIcon} alt={stat.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                                </motion.div>

                                <div>
                                    <p className="text-[10px] sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.title}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">
                                        {typeof stat.value === 'number' && stat.total ? `${stat.value}/${stat.total}` : stat.value}
                                    </p>
                                    <p className="text-[8px] sm:text-xs text-neutral-400 mt-0.5">{stat.note}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════ NEXT MEETING ALERT ═══════ */}
                {nextMeeting && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 shadow-xl dark:border-blue-800 dark:from-blue-950/30 dark:to-cyan-950/30"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shrink-0">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                                    Pertemuan Berikutnya
                                </h3>
                                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                                    Pertemuan #{nextMeeting.number} • {nextMeeting.date} • {nextMeeting.time}
                                </p>
                            </div>
                            <Link href="/user/absen" className="w-full sm:w-auto mt-2 sm:mt-0">
                                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                    Absen Sekarang
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ TABS CONTENT ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="overflow-x-auto no-scrollbar mb-6 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0">
                            <TabsList className="flex w-max min-w-full lg:grid lg:grid-cols-4 gap-1 p-1.5 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-inner border border-white/40 dark:border-white/10 h-auto">
                                <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-neutral-600 dark:text-neutral-300 data-[state=active]:shadow-md px-5 py-2.5 font-semibold transition-all">Overview</TabsTrigger>
                                <TabsTrigger value="attendance" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-neutral-600 dark:text-neutral-300 data-[state=active]:shadow-md px-5 py-2.5 font-semibold transition-all">Kehadiran</TabsTrigger>
                                <TabsTrigger value="materials" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-neutral-600 dark:text-neutral-300 data-[state=active]:shadow-md px-5 py-2.5 font-semibold transition-all">Materi</TabsTrigger>
                                <TabsTrigger value="notes" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-neutral-600 dark:text-neutral-300 data-[state=active]:shadow-md px-5 py-2.5 font-semibold transition-all">Catatan</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Course Description */}
                            {course.description && (
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Deskripsi Mata Kuliah
                                    </h3>
                                    <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                        {course.description}
                                    </p>
                                </div>
                            )}

                            {/* Dosen Info (Mobile) */}
                            <div className="lg:hidden">
                                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Dosen Pengampu
                                </h3>
                                <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50 p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {dosen.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-neutral-900 dark:text-white">{dosen.name}</p>
                                            <p className="text-xs text-neutral-500">NIDN: {dosen.nidn}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        {dosen.email && (
                                            <a href={`mailto:${dosen.email}`} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span className="truncate">{dosen.email}</span>
                                            </a>
                                        )}
                                        {dosen.phone && (
                                            <a href={`tel:${dosen.phone}`} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{dosen.phone}</span>
                                            </a>
                                        )}
                                    </div>
                                    {dosen.expertise.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/10">
                                            <p className="text-xs text-neutral-500 mb-2">Keahlian:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {dosen.expertise.map((skill, i) => (
                                                    <Badge key={i} variant="secondary" className="text-[10px]">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attendance Progress */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Progress Kehadiran
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-white/60 dark:bg-neutral-800/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                                                Tingkat Kehadiran
                                            </span>
                                            <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                                                {stats.attendance_rate}%
                                            </span>
                                        </div>
                                        <Progress value={stats.attendance_rate} className="h-2 sm:h-3" />
                                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-2">
                                            {stats.can_take_uas
                                                ? `✓ Sudah memenuhi syarat UAS (min ${stats.min_attendance}%)`
                                                : `⚠️ Belum memenuhi syarat UAS (min ${stats.min_attendance}%)`
                                            }
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        <div className="rounded-xl border border-neutral-200 dark:border-transparent bg-emerald-50/80 dark:bg-emerald-900/20 p-2 sm:p-3 text-center">
                                            <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.attended}</p>
                                            <p className="text-[10px] sm:text-xs text-emerald-600/70">Hadir</p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-200 dark:border-transparent bg-amber-50/80 dark:bg-amber-900/20 p-2 sm:p-3 text-center">
                                            <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.late}</p>
                                            <p className="text-[10px] sm:text-xs text-amber-600/70">Terlambat</p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-200 dark:border-transparent bg-rose-50/80 dark:bg-rose-900/20 p-2 sm:p-3 text-center">
                                            <p className="text-xl sm:text-2xl font-bold text-rose-600">{stats.absent}</p>
                                            <p className="text-[10px] sm:text-xs text-rose-600/70">Tidak Hadir</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Syllabus */}
                            {course.syllabus_url && (
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Silabus
                                    </h3>
                                    <a
                                        href={course.syllabus_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                                    >
                                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white truncate">
                                                Silabus {course.course_name}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-neutral-500">PDF Document</p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 shrink-0" />
                                    </a>
                                </div>
                            )}
                        </TabsContent>


                        {/* ATTENDANCE TAB */}
                        <TabsContent value="attendance" className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                                    Riwayat Kehadiran
                                </h3>
                                <Badge variant="outline" className="text-[10px] sm:text-xs bg-white dark:bg-transparent border-neutral-200 dark:border-neutral-700">
                                    {attendanceRecords.length} Pertemuan
                                </Badge>
                            </div>

                            {attendanceRecords.length > 0 ? (
                                <div className="space-y-3">
                                    {attendanceRecords.map((record, index) => {
                                        const StatusIcon = getStatusIcon(record.status);
                                        return (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.01, x: 2 }}
                                                className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50"
                                            >
                                                <div className={cn(
                                                    "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl",
                                                    getStatusColor(record.status)
                                                )}>
                                                    <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1">
                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                                            Pertemuan #{record.meeting_number}
                                                        </p>
                                                        <Badge className={cn("text-[10px] w-fit", getStatusColor(record.status))}>
                                                            {record.status === 'present' ? 'Hadir' :
                                                                record.status === 'late' ? 'Terlambat' :
                                                                    record.status === 'permit' ? 'Izin' : 'Tidak Hadir'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-500">
                                                        <span>{record.date}</span>
                                                        {record.time_in && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{record.time_in}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {record.notes && (
                                                        <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 line-clamp-2">
                                                            {record.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50 p-8 text-center">
                                    <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-400 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-neutral-500">Belum ada riwayat kehadiran</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* MATERIALS TAB */}
                        <TabsContent value="materials" className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                                    Materi Kuliah
                                </h3>
                                <Badge variant="outline" className="text-[10px] sm:text-xs bg-white dark:bg-transparent border-neutral-200 dark:border-neutral-700">
                                    {materials.length} File
                                </Badge>
                            </div>

                            {materials.length > 0 ? (
                                <div className="grid gap-3">
                                    {materials.map((material, index) => {
                                        const getTypeIcon = (type: string) => {
                                            switch (type) {
                                                case 'pdf': return FileText;
                                                case 'video': return Video;
                                                case 'link': return LinkIcon;
                                                default: return Paperclip;
                                            }
                                        };

                                        const getTypeColor = (type: string) => {
                                            switch (type) {
                                                case 'pdf': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
                                                case 'video': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
                                                case 'link': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
                                                default: return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
                                            }
                                        };

                                        const TypeIcon = getTypeIcon(material.type);

                                        return (
                                            <motion.a
                                                key={material.id}
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.01, x: 2 }}
                                                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                                            >
                                                <div className={cn(
                                                    "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl",
                                                    getTypeColor(material.type)
                                                )}>
                                                    <TypeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                                        {material.title}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-neutral-500 mt-1">
                                                        <span className="font-semibold">{material.type.toUpperCase()}</span>
                                                        {material.size && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{material.size}</span>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <span>{material.uploaded_at}</span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 shrink-0" />
                                            </motion.a>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50 p-8 text-center">
                                    <Paperclip className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-400 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-neutral-500">Belum ada materi tersedia</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* NOTES TAB */}
                        <TabsContent value="notes" className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                                    Catatan Pribadi
                                </h3>
                                <Button
                                    onClick={() => {
                                        setEditingNote(null);
                                        noteForm.reset();
                                        setIsNoteDialogOpen(true);
                                    }}
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 sm:h-9 text-xs sm:text-sm px-3"
                                >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    Tambah
                                </Button>
                            </div>

                            {notes.length > 0 ? (
                                <div className="space-y-3">
                                    {notes.map((note, index) => (
                                        <motion.div
                                            key={note.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-3 sm:p-4 rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50"
                                        >
                                            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                                                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-500">
                                                    <MessageSquare className="h-3 w-3" />
                                                    <span>{note.created_at}</span>
                                                    {note.updated_at !== note.created_at && (
                                                        <span className="text-neutral-400 hidden sm:inline">(edited)</span>
                                                    )}
                                                </div>
                                                <div className="flex gap-0.5 sm:gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingNote(note);
                                                            noteForm.setData('content', note.content);
                                                            setIsNoteDialogOpen(true);
                                                        }}
                                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteNote(note.id)}
                                                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                                {note.content}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white/60 dark:bg-neutral-800/50 p-8 text-center flex flex-col items-center">
                                    <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-400 mb-3 opacity-50" />
                                    <p className="text-sm text-neutral-500 mb-4">Belum ada catatan</p>
                                    <Button
                                        onClick={() => {
                                            setEditingNote(null);
                                            noteForm.reset();
                                            setIsNoteDialogOpen(true);
                                        }}
                                        variant="outline"
                                        className="rounded-xl border-neutral-200 dark:border-neutral-700 h-9 shrink-0 text-xs sm:text-sm"
                                    >
                                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                        Buat Catatan Pertama
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>

                {/* ═══════ NOTE DIALOG ═══════ */}
                <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-neutral-900 dark:text-white">
                                {editingNote ? 'Edit Catatan' : 'Tambah Catatan'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <Textarea
                                value={noteForm.data.content}
                                onChange={(e) => noteForm.setData('content', e.target.value)}
                                placeholder="Tulis catatan Anda di sini..."
                                rows={5}
                                className="resize-none rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 focus-visible:ring-indigo-500"
                            />
                            {noteForm.errors.content && (
                                <p className="text-[10px] sm:text-xs text-rose-600">{noteForm.errors.content}</p>
                            )}
                            <div className="flex gap-2 sm:gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsNoteDialogOpen(false);
                                        setEditingNote(null);
                                        noteForm.reset();
                                    }}
                                    className="flex-1 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={saveNote}
                                    disabled={noteForm.processing || !noteForm.data.content.trim()}
                                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {noteForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ═══════ SHARE DIALOG ═══════ */}
                <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-neutral-900 dark:text-white">Share Jadwal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <p className="text-[11px] sm:text-sm text-neutral-600 dark:text-neutral-400">
                                Bagikan detail jadwal mata kuliah ini
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/user/akademik/jadwal/${course.id}`}
                                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/user/akademik/jadwal/${course.id}`);
                                    }}
                                    className="rounded-xl shrink-0"
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, noteId: open ? deleteDialog.noteId : null })}
                    onConfirm={handleConfirmDeleteNote}
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
