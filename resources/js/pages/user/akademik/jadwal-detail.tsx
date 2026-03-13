import {
    default as statsAbsenIcon,
    default as statsTerlambatIcon,
} from '@/assets/admin/dashboard/terlambat-icon.png';
import statsHadirIcon from '@/assets/admin/live-monitor/hadir-icon.png';
import statsStatusIcon from '@/assets/mahasiswa/jadwal-kuliah/uas.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Bell,
    BellOff,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ClipboardList,
    Clock,
    Clock3,
    Download,
    Edit,
    ExternalLink,
    FileText,
    Link as LinkIcon,
    Mail,
    MapPin,
    MessageSquare,
    Monitor,
    Paperclip,
    Phone,
    Plus,
    Share2,
    Trash2,
    TrendingUp,
    User,
    Video,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

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

interface WeeklyDigestInfo {
    week_number: number;
    semester: string;
    week_range: string;
    class_label: string;
    published_at?: string | null;
    items: Array<{
        id: number;
        course_name: string;
        course_code: string | null;
        meeting_number: number;
        title: string | null;
        display_title: string;
        has_structured_task: boolean;
        forum_posts_required: number;
        mentari_course_url: string | null;
        mentari_course_id: string | null;
    }>;
}

interface Props {
    course: CourseDetail;
    weeklyDigest: WeeklyDigestInfo | null;
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
    weeklyDigest,
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
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        noteId: number | null;
    }>({ open: false, noteId: null });

    const noteForm = useForm({
        content: '',
    });

    // Toggle reminder
    const toggleReminder = () => {
        router.post(
            `/user/schedule/${course.id}/reminder/toggle`,
            {},
            { preserveScroll: true },
        );
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
            noteForm.put(
                `/user/schedule/${course.id}/notes/${editingNote.id}`,
                {
                    onSuccess: () => {
                        setIsNoteDialogOpen(false);
                        setEditingNote(null);
                        noteForm.reset();
                    },
                },
            );
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
        router.delete(
            `/user/schedule/${course.id}/notes/${deleteDialog.noteId}`,
            {
                preserveScroll: true,
                onSuccess: () => setDeleteDialog({ open: false, noteId: null }),
            },
        );
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
                className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HERO HEADER ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
                >
                    {/* Static Background Graphic */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 opacity-50 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 opacity-50 blur-3xl" />

                    <div className="relative">
                        <div className="mb-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="relative w-full flex-1">
                                <Link href="/user/akademik/jadwal">
                                    <motion.button
                                        whileHover={{ scale: 1.05, x: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-100 hover:text-white"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Kembali ke Jadwal
                                    </motion.button>
                                </Link>

                                <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                                    <Badge className="border-white/30 bg-white/20 px-2 py-0.5 text-[10px] text-white sm:px-2.5 sm:py-0.5 sm:text-xs">
                                        {course.course_code}
                                    </Badge>
                                    <Badge className="border-white/30 bg-white/20 px-2 py-0.5 text-[10px] text-white sm:px-2.5 sm:py-0.5 sm:text-xs">
                                        {course.sks} SKS
                                    </Badge>
                                    <Badge
                                        className={cn(
                                            'flex items-center border-white/30 px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-0.5 sm:text-xs',
                                            course.mode === 'online'
                                                ? 'bg-blue-500/30 text-white'
                                                : 'bg-emerald-500/30 text-white',
                                        )}
                                    >
                                        {course.mode === 'online' ? (
                                            <>
                                                <Monitor className="mr-1 h-3 w-3" />
                                                Online
                                            </>
                                        ) : (
                                            <>
                                                <Building2 className="mr-1 h-3 w-3" />
                                                Offline
                                            </>
                                        )}
                                    </Badge>
                                </div>

                                <h1 className="mb-2 max-w-[90%] text-xl font-bold break-words sm:text-2xl md:max-w-full md:text-3xl">
                                    {course.course_name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-indigo-100 sm:text-sm">
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
                                className="mt-4 hidden w-full lg:mt-0 lg:block lg:w-auto"
                            >
                                <div className="min-w-[200px] rounded-2xl border border-white/30 bg-white/20 p-4 backdrop-blur-xl lg:min-w-[280px]">
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/30 text-lg font-bold text-white sm:h-12 sm:w-12">
                                            {dosen.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-white sm:text-base">
                                                {dosen.name}
                                            </p>
                                            <p className="text-[10px] text-indigo-200 sm:text-xs">
                                                NIDN: {dosen.nidn}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2 text-[10px] sm:text-xs">
                                        {dosen.email && (
                                            <a
                                                href={`mailto:${dosen.email}`}
                                                className="flex items-center gap-2 text-indigo-100 hover:text-white"
                                            >
                                                <Mail className="h-3 w-3 shrink-0" />
                                                <span className="truncate">
                                                    {dosen.email}
                                                </span>
                                            </a>
                                        )}
                                        {dosen.phone && (
                                            <a
                                                href={`tel:${dosen.phone}`}
                                                className="flex items-center gap-2 text-indigo-100 hover:text-white"
                                            >
                                                <Phone className="h-3 w-3 shrink-0" />
                                                <span className="truncate">
                                                    {dosen.phone}
                                                </span>
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
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.4,
                                    },
                                },
                            }}
                            className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto pb-2 sm:gap-2 lg:flex-wrap lg:pb-0"
                        >
                            {course.mode === 'online' &&
                                course.meeting_link && (
                                    <motion.button
                                        onClick={joinClass}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-semibold whitespace-nowrap text-indigo-600 shadow-lg transition-shadow hover:shadow-xl sm:px-4 sm:text-sm"
                                    >
                                        <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        Join Kelas
                                    </motion.button>
                                )}

                            <motion.button
                                onClick={toggleReminder}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-[11px] font-semibold whitespace-nowrap text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:px-4 sm:text-sm"
                            >
                                {hasReminder ? (
                                    <>
                                        <BellOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        Matikan Reminder
                                    </>
                                ) : (
                                    <>
                                        <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        Set Reminder
                                    </>
                                )}
                            </motion.button>

                            <motion.button
                                onClick={exportToCalendar}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-[11px] font-semibold whitespace-nowrap text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:px-4 sm:text-sm"
                            >
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Export
                            </motion.button>

                            <motion.button
                                onClick={shareSchedule}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-[11px] font-semibold whitespace-nowrap text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:px-4 sm:text-sm"
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
                            colorConfig: {
                                gradientBg:
                                    'from-sky-500/5 to-blue-500/5 dark:from-sky-500/10 dark:to-blue-500/10',
                                glow: 'bg-sky-500',
                            },
                        },
                        {
                            customIcon: statsTerlambatIcon,
                            title: 'Terlambat',
                            value: stats.late,
                            total: stats.total_meetings,
                            note: `${((stats.late / stats.total_meetings) * 100).toFixed(0)}%`,
                            colorConfig: {
                                gradientBg:
                                    'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                                glow: 'bg-amber-500',
                            },
                        },
                        {
                            customIcon: statsAbsenIcon,
                            title: 'Tidak Hadir',
                            value: stats.absent,
                            total: stats.total_meetings,
                            note: `${((stats.absent / stats.total_meetings) * 100).toFixed(0)}%`,
                            colorConfig: {
                                gradientBg:
                                    'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
                                glow: 'bg-rose-500',
                            },
                        },
                        {
                            customIcon: statsStatusIcon,
                            title: 'Status UAS',
                            value: stats.can_take_uas ? 'Bisa' : 'Tidak',
                            note: `Min ${stats.min_attendance}%`,
                            colorConfig: {
                                gradientBg:
                                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                                glow: 'bg-emerald-500',
                            },
                        },
                    ].map((stat) => (
                        <motion.div
                            key={stat.title}
                            variants={itemVariants}
                            whileHover={{ scale: 1.04, y: -4 }}
                            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`}
                            />
                            <motion.div
                                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.colorConfig.glow} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                            />

                            <div className="relative flex flex-col items-center gap-2 text-center">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                >
                                    <img
                                        src={stat.customIcon}
                                        alt={stat.title}
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                    />
                                </motion.div>

                                <div>
                                    <p className="text-[10px] font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                        {stat.title}
                                    </p>
                                    <p className="mt-0.5 text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                        {typeof stat.value === 'number' &&
                                        stat.total
                                            ? `${stat.value}/${stat.total}`
                                            : stat.value}
                                    </p>
                                    <p className="mt-0.5 text-[8px] text-neutral-400 sm:text-xs">
                                        {stat.note}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════ NEXT MEETING ALERT ═══════ */}
                {nextMeeting && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-xl sm:p-6 dark:border-blue-800 dark:from-blue-950/30 dark:to-cyan-950/30"
                    >
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-blue-900 sm:text-base dark:text-blue-100">
                                    Pertemuan Berikutnya
                                </h3>
                                <p className="text-xs text-blue-700 sm:text-sm dark:text-blue-300">
                                    Pertemuan #{nextMeeting.number} •{' '}
                                    {nextMeeting.date} • {nextMeeting.time}
                                </p>
                            </div>
                            <Link
                                href="/user/absen"
                                className="mt-2 w-full sm:mt-0 sm:w-auto"
                            >
                                <Button className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                                    Absen Sekarang
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ TABS CONTENT ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="no-scrollbar -mx-2 mb-6 overflow-x-auto px-2 pb-2 sm:mx-0 sm:px-0 sm:pb-0">
                            <TabsList className="flex h-auto w-max min-w-full gap-1 rounded-2xl border border-white/40 bg-white/60 p-1.5 shadow-inner backdrop-blur-md lg:grid lg:grid-cols-5 dark:border-white/10 dark:bg-black/30">
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-xl px-5 py-2.5 font-semibold text-neutral-600 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md dark:text-neutral-300"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="attendance"
                                    className="rounded-xl px-5 py-2.5 font-semibold text-neutral-600 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md dark:text-neutral-300"
                                >
                                    Kehadiran
                                </TabsTrigger>
                                <TabsTrigger
                                    value="materials"
                                    className="rounded-xl px-5 py-2.5 font-semibold text-neutral-600 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md dark:text-neutral-300"
                                >
                                    Materi
                                </TabsTrigger>
                                <TabsTrigger
                                    value="weekly-digest"
                                    className="rounded-xl px-5 py-2.5 font-semibold text-neutral-600 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md dark:text-neutral-300"
                                >
                                    Info Pekanan
                                </TabsTrigger>
                                <TabsTrigger
                                    value="notes"
                                    className="rounded-xl px-5 py-2.5 font-semibold text-neutral-600 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md dark:text-neutral-300"
                                >
                                    Catatan
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Course Description */}
                            {course.description && (
                                <div>
                                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Deskripsi Mata Kuliah
                                    </h3>
                                    <p className="text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
                                        {course.description}
                                    </p>
                                </div>
                            )}

                            {/* Dosen Info (Mobile) */}
                            <div className="lg:hidden">
                                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Dosen Pengampu
                                </h3>
                                <div className="rounded-2xl border border-neutral-200 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/50">
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                                            {dosen.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {dosen.name}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                NIDN: {dosen.nidn}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        {dosen.email && (
                                            <a
                                                href={`mailto:${dosen.email}`}
                                                className="flex items-center gap-2 text-neutral-600 hover:text-indigo-600 dark:text-neutral-400"
                                            >
                                                <Mail className="h-3.5 w-3.5" />
                                                <span className="truncate">
                                                    {dosen.email}
                                                </span>
                                            </a>
                                        )}
                                        {dosen.phone && (
                                            <a
                                                href={`tel:${dosen.phone}`}
                                                className="flex items-center gap-2 text-neutral-600 hover:text-indigo-600 dark:text-neutral-400"
                                            >
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{dosen.phone}</span>
                                            </a>
                                        )}
                                    </div>
                                    {dosen.expertise.length > 0 && (
                                        <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-white/10">
                                            <p className="mb-2 text-xs text-neutral-500">
                                                Keahlian:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {dosen.expertise.map(
                                                    (skill, i) => (
                                                        <Badge
                                                            key={i}
                                                            variant="secondary"
                                                            className="text-[10px]"
                                                        >
                                                            {skill}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attendance Progress */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Progress Kehadiran
                                </h3>
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-neutral-200 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/50">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
                                                Tingkat Kehadiran
                                            </span>
                                            <span className="text-xs font-semibold text-neutral-900 sm:text-sm dark:text-white">
                                                {stats.attendance_rate}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={stats.attendance_rate}
                                            className="h-2 sm:h-3"
                                        />
                                        <p className="mt-2 text-[10px] text-neutral-500 sm:text-xs">
                                            {stats.can_take_uas
                                                ? `✓ Sudah memenuhi syarat UAS (min ${stats.min_attendance}%)`
                                                : `⚠️ Belum memenuhi syarat UAS (min ${stats.min_attendance}%)`}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        <div className="rounded-xl border border-neutral-200 bg-emerald-50/80 p-2 text-center sm:p-3 dark:border-transparent dark:bg-emerald-900/20">
                                            <p className="text-xl font-bold text-emerald-600 sm:text-2xl">
                                                {stats.attended}
                                            </p>
                                            <p className="text-[10px] text-emerald-600/70 sm:text-xs">
                                                Hadir
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-200 bg-amber-50/80 p-2 text-center sm:p-3 dark:border-transparent dark:bg-amber-900/20">
                                            <p className="text-xl font-bold text-amber-600 sm:text-2xl">
                                                {stats.late}
                                            </p>
                                            <p className="text-[10px] text-amber-600/70 sm:text-xs">
                                                Terlambat
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-200 bg-rose-50/80 p-2 text-center sm:p-3 dark:border-transparent dark:bg-rose-900/20">
                                            <p className="text-xl font-bold text-rose-600 sm:text-2xl">
                                                {stats.absent}
                                            </p>
                                            <p className="text-[10px] text-rose-600/70 sm:text-xs">
                                                Tidak Hadir
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Syllabus */}
                            {course.syllabus_url && (
                                <div>
                                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Silabus
                                    </h3>
                                    <a
                                        href={course.syllabus_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white/60 p-3 transition-colors hover:bg-neutral-50 sm:p-4 dark:border-white/5 dark:bg-neutral-800/50 dark:hover:bg-neutral-700/50"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10 dark:bg-blue-900/30">
                                            <FileText className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-neutral-900 sm:text-base dark:text-white">
                                                Silabus {course.course_name}
                                            </p>
                                            <p className="text-[10px] text-neutral-500 sm:text-xs">
                                                PDF Document
                                            </p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400 sm:h-5 sm:w-5" />
                                    </a>
                                </div>
                            )}
                        </TabsContent>

                        {/* ATTENDANCE TAB */}
                        <TabsContent value="attendance" className="space-y-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                                    Riwayat Kehadiran
                                </h3>
                                <Badge
                                    variant="outline"
                                    className="border-neutral-200 bg-white text-[10px] sm:text-xs dark:border-neutral-700 dark:bg-transparent"
                                >
                                    {attendanceRecords.length} Pertemuan
                                </Badge>
                            </div>

                            {attendanceRecords.length > 0 ? (
                                <div className="space-y-3">
                                    {attendanceRecords.map((record, index) => {
                                        const StatusIcon = getStatusIcon(
                                            record.status,
                                        );
                                        return (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                whileHover={{
                                                    scale: 1.01,
                                                    x: 2,
                                                }}
                                                className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white/60 p-3 sm:items-center sm:gap-4 sm:p-4 dark:border-white/5 dark:bg-neutral-800/50"
                                            >
                                                <div
                                                    className={cn(
                                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
                                                        getStatusColor(
                                                            record.status,
                                                        ),
                                                    )}
                                                >
                                                    <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-2">
                                                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                            Pertemuan #
                                                            {
                                                                record.meeting_number
                                                            }
                                                        </p>
                                                        <Badge
                                                            className={cn(
                                                                'w-fit text-[10px]',
                                                                getStatusColor(
                                                                    record.status,
                                                                ),
                                                            )}
                                                        >
                                                            {record.status ===
                                                            'present'
                                                                ? 'Hadir'
                                                                : record.status ===
                                                                    'late'
                                                                  ? 'Terlambat'
                                                                  : record.status ===
                                                                      'permit'
                                                                    ? 'Izin'
                                                                    : 'Tidak Hadir'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 sm:text-xs">
                                                        <span>
                                                            {record.date}
                                                        </span>
                                                        {record.time_in && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    {
                                                                        record.time_in
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {record.notes && (
                                                        <p className="mt-1.5 line-clamp-2 text-[10px] text-neutral-600 sm:text-xs dark:text-neutral-400">
                                                            {record.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-neutral-200 bg-white/60 p-8 text-center dark:border-white/5 dark:bg-neutral-800/50">
                                    <Clock className="mx-auto mb-3 h-10 w-10 text-neutral-400 opacity-50 sm:h-12 sm:w-12" />
                                    <p className="text-sm text-neutral-500">
                                        Belum ada riwayat kehadiran
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* MATERIALS TAB */}
                        <TabsContent value="materials" className="space-y-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                                    Materi Kuliah
                                </h3>
                                <Badge
                                    variant="outline"
                                    className="border-neutral-200 bg-white text-[10px] sm:text-xs dark:border-neutral-700 dark:bg-transparent"
                                >
                                    {materials.length} File
                                </Badge>
                            </div>

                            {materials.length > 0 ? (
                                <div className="grid gap-3">
                                    {materials.map((material, index) => {
                                        const getTypeIcon = (type: string) => {
                                            switch (type) {
                                                case 'pdf':
                                                    return FileText;
                                                case 'video':
                                                    return Video;
                                                case 'link':
                                                    return LinkIcon;
                                                default:
                                                    return Paperclip;
                                            }
                                        };

                                        const getTypeColor = (type: string) => {
                                            switch (type) {
                                                case 'pdf':
                                                    return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
                                                case 'video':
                                                    return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
                                                case 'link':
                                                    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
                                                default:
                                                    return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
                                            }
                                        };

                                        const TypeIcon = getTypeIcon(
                                            material.type,
                                        );

                                        return (
                                            <motion.a
                                                key={material.id}
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                whileHover={{
                                                    scale: 1.01,
                                                    x: 2,
                                                }}
                                                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white/60 p-3 transition-colors hover:bg-neutral-50 sm:gap-4 sm:p-4 dark:border-white/5 dark:bg-neutral-800/50 dark:hover:bg-neutral-700/50"
                                            >
                                                <div
                                                    className={cn(
                                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
                                                        getTypeColor(
                                                            material.type,
                                                        ),
                                                    )}
                                                >
                                                    <TypeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                                        {material.title}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-neutral-500 sm:gap-2 sm:text-xs">
                                                        <span className="font-semibold">
                                                            {material.type.toUpperCase()}
                                                        </span>
                                                        {material.size && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    {
                                                                        material.size
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <span>
                                                            {
                                                                material.uploaded_at
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400 sm:h-5 sm:w-5" />
                                            </motion.a>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-neutral-200 bg-white/60 p-8 text-center dark:border-white/5 dark:bg-neutral-800/50">
                                    <Paperclip className="mx-auto mb-3 h-10 w-10 text-neutral-400 opacity-50 sm:h-12 sm:w-12" />
                                    <p className="text-sm text-neutral-500">
                                        Belum ada materi tersedia
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* WEEKLY DIGEST TAB */}
                        <TabsContent
                            value="weekly-digest"
                            className="space-y-4"
                        >
                            {weeklyDigest ? (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 dark:border-cyan-900/40 dark:bg-cyan-950/20">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-cyan-900 dark:text-cyan-200">
                                                    Info Pekanan Mentari
                                                </h3>
                                                <p className="mt-1 text-xs text-cyan-700 dark:text-cyan-300">
                                                    Rekap matkul yang materinya
                                                    sudah masuk pada pekan yang
                                                    dipublikasikan admin.
                                                </p>
                                            </div>
                                            <div className="text-[11px] text-cyan-700 dark:text-cyan-300">
                                                Pekan aktif •{' '}
                                                {weeklyDigest.semester}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm dark:border-white/5 dark:bg-neutral-800/50">
                                        <div className="mb-4 flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                                                <ClipboardList className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                                                    Ringkasan Pekanan Kelas
                                                </h4>
                                                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                                    {weeklyDigest.week_range} •{' '}
                                                    {weeklyDigest.class_label}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 dark:border-cyan-900/30 dark:bg-cyan-950/20">
                                                <p className="text-xs font-semibold tracking-wide text-cyan-700 uppercase dark:text-cyan-300">
                                                    Total Matkul Masuk
                                                </p>
                                                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                                                    {weeklyDigest.items.length}
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                                                <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                                    Tugas Terstruktur
                                                </p>
                                                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                                                    {
                                                        weeklyDigest.items.filter(
                                                            (item) =>
                                                                item.has_structured_task,
                                                        ).length
                                                    }
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3 dark:border-violet-900/30 dark:bg-violet-950/20">
                                                <p className="text-xs font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-300">
                                                    Aturan Kehadiran
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-white">
                                                    Forum{' '}
                                                    {weeklyDigest.items[0]
                                                        ?.forum_posts_required ??
                                                        2}
                                                    x
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm dark:border-white/5 dark:bg-neutral-800/50">
                                        <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white">
                                            <BookOpen className="h-5 w-5 text-cyan-500" />
                                            Matkul yang Materinya Sudah Masuk
                                        </h4>
                                        <div className="space-y-3">
                                            {weeklyDigest.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-white/5 dark:bg-neutral-900/50"
                                                >
                                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                    {
                                                                        item.course_name
                                                                    }
                                                                </p>
                                                                <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                                                                    Pertemuan{' '}
                                                                    {
                                                                        item.meeting_number
                                                                    }
                                                                </Badge>
                                                                {item.has_structured_task ? (
                                                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                                        Ada
                                                                        Tugas
                                                                        Terstruktur
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
                                                                        Tanpa
                                                                        Tugas
                                                                        Terstruktur
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                                                                {
                                                                    item.display_title
                                                                }
                                                            </p>
                                                            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                                                Kehadiran
                                                                didapat setelah
                                                                submit forum
                                                                diskusi{' '}
                                                                {
                                                                    item.forum_posts_required
                                                                }
                                                                x.
                                                            </p>
                                                        </div>

                                                        {item.mentari_course_url && (
                                                            <motion.a
                                                                whileHover={{
                                                                    y: -2,
                                                                }}
                                                                whileTap={{
                                                                    scale: 0.98,
                                                                }}
                                                                href={
                                                                    item.mentari_course_url
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-cyan-700"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                Buka Mentari
                                                            </motion.a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 p-8 text-center dark:border-white/10 dark:bg-neutral-900/50">
                                    <ClipboardList className="mx-auto mb-3 h-10 w-10 text-neutral-400 opacity-60" />
                                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                        Info pekanan belum tersedia
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                        Admin belum mempublikasikan rekapan
                                        mingguan Mentari untuk kelas ini.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* NOTES TAB */}
                        <TabsContent value="notes" className="space-y-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                                    Catatan Pribadi
                                </h3>
                                <Button
                                    onClick={() => {
                                        setEditingNote(null);
                                        noteForm.reset();
                                        setIsNoteDialogOpen(true);
                                    }}
                                    size="sm"
                                    className="h-8 rounded-xl bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700 sm:h-9 sm:text-sm"
                                >
                                    <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
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
                                            className="rounded-2xl border border-neutral-200 bg-white/60 p-3 sm:p-4 dark:border-white/5 dark:bg-neutral-800/50"
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-2 sm:gap-3">
                                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 sm:gap-2 sm:text-xs">
                                                    <MessageSquare className="h-3 w-3" />
                                                    <span>
                                                        {note.created_at}
                                                    </span>
                                                    {note.updated_at !==
                                                        note.created_at && (
                                                        <span className="hidden text-neutral-400 sm:inline">
                                                            (edited)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-0.5 sm:gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingNote(
                                                                note,
                                                            );
                                                            noteForm.setData(
                                                                'content',
                                                                note.content,
                                                            );
                                                            setIsNoteDialogOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="h-6 w-6 p-0 hover:bg-neutral-200 sm:h-7 sm:w-7 dark:hover:bg-neutral-700"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            deleteNote(note.id)
                                                        }
                                                        className="h-6 w-6 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:h-7 sm:w-7 dark:hover:bg-rose-950/50"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-xs leading-relaxed whitespace-pre-wrap text-neutral-700 sm:text-sm dark:text-neutral-300">
                                                {note.content}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white/60 p-8 text-center dark:border-white/5 dark:bg-neutral-800/50">
                                    <MessageSquare className="mb-3 h-10 w-10 text-neutral-400 opacity-50 sm:h-12 sm:w-12" />
                                    <p className="mb-4 text-sm text-neutral-500">
                                        Belum ada catatan
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setEditingNote(null);
                                            noteForm.reset();
                                            setIsNoteDialogOpen(true);
                                        }}
                                        variant="outline"
                                        className="h-9 shrink-0 rounded-xl border-neutral-200 text-xs sm:text-sm dark:border-neutral-700"
                                    >
                                        <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        Buat Catatan Pertama
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>

                {/* ═══════ NOTE DIALOG ═══════ */}
                <Dialog
                    open={isNoteDialogOpen}
                    onOpenChange={setIsNoteDialogOpen}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-neutral-900 dark:text-white">
                                {editingNote
                                    ? 'Edit Catatan'
                                    : 'Tambah Catatan'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <Textarea
                                value={noteForm.data.content}
                                onChange={(e) =>
                                    noteForm.setData('content', e.target.value)
                                }
                                placeholder="Tulis catatan Anda di sini..."
                                rows={5}
                                className="resize-none rounded-xl border-neutral-200 bg-neutral-50 focus-visible:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900/50"
                            />
                            {noteForm.errors.content && (
                                <p className="text-[10px] text-rose-600 sm:text-xs">
                                    {noteForm.errors.content}
                                </p>
                            )}
                            <div className="flex gap-2 pt-2 sm:gap-3">
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
                                    disabled={
                                        noteForm.processing ||
                                        !noteForm.data.content.trim()
                                    }
                                    className="flex-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    {noteForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ═══════ SHARE DIALOG ═══════ */}
                <Dialog
                    open={isShareDialogOpen}
                    onOpenChange={setIsShareDialogOpen}
                >
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-neutral-900 dark:text-white">
                                Share Jadwal
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <p className="text-[11px] text-neutral-600 sm:text-sm dark:text-neutral-400">
                                Bagikan detail jadwal mata kuliah ini
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/user/akademik/jadwal/${course.id}`}
                                    className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-300"
                                />
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/user/akademik/jadwal/${course.id}`,
                                        );
                                    }}
                                    className="shrink-0 rounded-xl"
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({
                            open,
                            noteId: open ? deleteDialog.noteId : null,
                        })
                    }
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
