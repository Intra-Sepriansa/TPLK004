import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Download,
    Eye,
    Hash,
    Loader2,
    Save,
    Timer,
    Type,
    Upload,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';

import JadwalIcon from '@/assets/admin/jadwal/jadwal.png';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Course {
    id: number;
    nama: string;
    sks: number;
    dosen?: { nama: string };
    scheduled_meetings: number[];
    offline_meetings: number[];
    quick_ready_meetings: number[];
    meeting_templates: {
        meeting_number: number;
        topic: string | null;
        description: string | null;
        mode: 'offline' | 'online' | 'hybrid' | null;
        is_offline: boolean;
        quick_ready: boolean;
        suggested_title: string;
        suggested_description: string;
    }[];
}

interface ExistingSession {
    id: number;
    course_id: number;
    meeting_number: number;
    title?: string;
    description?: string | null;
    start_at: string;
    end_at: string;
}

interface PageProps {
    courses: Course[];
    stats: { total: number };
    existingSessions: ExistingSession[];
}

const formatMeetingBadges = (meetings: number[]) =>
    meetings.length > 0 ? meetings.map((meeting) => `P${meeting}`).join(', ') : '-';

// ─── Helper Components ───────────────────────────────────────────────────────

function FormSection({
    title,
    description,
    icon: Icon,
    gradient,
    children,
    collapsible,
    defaultOpen = true,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
    children: ReactNode;
    collapsible?: boolean;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            }}
            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <button
                type="button"
                onClick={() => collapsible && setOpen(!open)}
                className={cn(
                    'flex w-full items-center gap-4 p-6 text-left',
                    collapsible &&
                        'cursor-pointer transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30',
                )}
            >
                <div
                    className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                        gradient,
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
                {collapsible && (
                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        className="text-neutral-400"
                    >
                        <ChevronLeft className="h-5 w-5 -rotate-90" />
                    </motion.div>
                )}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function FormField({
    label,
    icon: Icon,
    required,
    optional,
    error,
    helper,
    children,
    className,
}: {
    label: string;
    icon: LucideIcon;
    required?: boolean;
    optional?: boolean;
    error?: string;
    helper?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('space-y-2', className)}>
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
                <Icon className="h-4 w-4 text-indigo-500" />
                {label}
                {required && <span className="text-xs text-rose-500">*</span>}
                {optional && (
                    <span className="text-xs font-normal text-neutral-400">
                        (Opsional)
                    </span>
                )}
            </label>
            {children}
            {helper && !error && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {helper}
                </p>
            )}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400"
                >
                    <AlertCircle className="h-3 w-3" /> {error}
                </motion.p>
            )}
        </div>
    );
}

// ─── Meeting Progress ────────────────────────────────────────────────────────

function MeetingProgress({
    completedMeetings,
    currentMeeting,
    totalMeetings = 16,
}: {
    completedMeetings: number;
    currentMeeting: number;
    totalMeetings?: number;
}) {
    const progress = (completedMeetings / totalMeetings) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-indigo-800 dark:from-indigo-950/30 dark:to-purple-950/30"
        >
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    Progress Pertemuan
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {completedMeetings}/{totalMeetings}
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-900">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>
                    Pertemuan ke-{currentMeeting} dari {totalMeetings} pertemuan
                </span>
            </div>
        </motion.div>
    );
}

// ─── Duration Calculator ─────────────────────────────────────────────────────

function DurationCalculator({
    startAt,
    endAt,
    sks,
}: {
    startAt: string;
    endAt: string;
    sks?: number;
}) {
    if (!startAt || !endAt) return null;

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    const diffMs = endDate.getTime() - startDate.getTime();

    if (diffMs <= 0) return null;

    const totalMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const expectedMinutes = sks ? sks * 50 : null;
    const isValid = expectedMinutes
        ? Math.abs(totalMinutes - expectedMinutes) <= 10
        : true;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'mt-4 rounded-xl border p-4',
                isValid
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer
                        className={cn(
                            'h-5 w-5',
                            isValid
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400',
                        )}
                    />
                    <span
                        className={cn(
                            'text-sm font-medium',
                            isValid
                                ? 'text-emerald-900 dark:text-emerald-100'
                                : 'text-amber-900 dark:text-amber-100',
                        )}
                    >
                        Durasi Perkuliahan
                    </span>
                </div>
                <div className="text-right">
                    <p
                        className={cn(
                            'text-lg font-bold',
                            isValid
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-amber-700 dark:text-amber-300',
                        )}
                    >
                        {hours > 0 && `${hours} jam `}
                        {minutes} menit
                    </p>
                    {sks && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {isValid ? '✓ Sesuai' : '⚠️ Tidak sesuai'} dengan{' '}
                            {sks} SKS ({expectedMinutes} menit)
                        </p>
                    )}
                </div>
            </div>
            {!isValid && sks && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Durasi standar untuk {sks} SKS adalah {expectedMinutes}{' '}
                    menit (±10 menit)
                </p>
            )}
        </motion.div>
    );
}

// ─── Day Info ────────────────────────────────────────────────────────────────

function DayInfo({ dateStr }: { dateStr: string }) {
    if (!dateStr) return null;

    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return null;

    const dayNames = [
        'Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
    ];
    const dayName = dayNames[dateObj.getDay()];
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'mt-2 flex items-center gap-2 rounded-lg p-2 text-xs',
                isWeekend
                    ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                    : 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
            )}
        >
            <Calendar className="h-3 w-3" />
            <span>
                {dayName},{' '}
                {dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}
                {isWeekend && ' (Akhir Pekan)'}
            </span>
        </motion.div>
    );
}

// ─── Time Presets ────────────────────────────────────────────────────────────

function TimePresets({
    date,
    onSelect,
}: {
    date: string;
    onSelect: (start: string, end: string) => void;
}) {
    const presets = [
        {
            label: '07:00 - 08:40',
            start: '07:00',
            end: '08:40',
            sks: 2,
            icon: '🌅',
        },
        {
            label: '08:40 - 10:20',
            start: '08:40',
            end: '10:20',
            sks: 2,
            icon: '☀️',
        },
        {
            label: '10:20 - 12:00',
            start: '10:20',
            end: '12:00',
            sks: 2,
            icon: '🌤️',
        },
        {
            label: '13:00 - 14:40',
            start: '13:00',
            end: '14:40',
            sks: 2,
            icon: '🌞',
        },
        {
            label: '14:40 - 16:20',
            start: '14:40',
            end: '16:20',
            sks: 2,
            icon: '🌆',
        },
        {
            label: '16:20 - 18:00',
            start: '16:20',
            end: '18:00',
            sks: 2,
            icon: '🌇',
        },
    ];

    const buildDatetime = (time: string) => {
        if (!date) return '';
        return `${date}T${time}`;
    };

    return (
        <div className="mt-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Clock className="h-4 w-4 text-indigo-500" />
                Preset Waktu Kuliah:
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {presets.map((preset, i) => (
                    <motion.button
                        key={i}
                        type="button"
                        onClick={() =>
                            onSelect(
                                buildDatetime(preset.start),
                                buildDatetime(preset.end),
                            )
                        }
                        disabled={!date}
                        className="rounded-xl border border-neutral-200 bg-white/60 p-3 text-left transition-all hover:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800/60 dark:hover:border-indigo-500"
                        whileHover={{ scale: date ? 1.02 : 1 }}
                        whileTap={{ scale: date ? 0.98 : 1 }}
                    >
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-lg">{preset.icon}</span>
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                {preset.sks} SKS
                            </span>
                        </div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {preset.label}
                        </p>
                    </motion.button>
                ))}
            </div>
            {!date && (
                <p className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
                    <AlertCircle className="h-3 w-3" /> Pilih tanggal terlebih
                    dahulu untuk menggunakan preset
                </p>
            )}
        </div>
    );
}

// ─── Conflict Checker ────────────────────────────────────────────────────────

function ConflictChecker({
    startAt,
    endAt,
    existingSessions,
    currentCourseId,
}: {
    startAt: string;
    endAt: string;
    existingSessions: ExistingSession[];
    currentCourseId: string;
}) {
    if (!startAt || !endAt) return null;

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (
        isNaN(startDate.getTime()) ||
        isNaN(endDate.getTime()) ||
        endDate <= startDate
    )
        return null;

    const conflicts = existingSessions.filter((s) => {
        const sStart = new Date(s.start_at);
        const sEnd = new Date(s.end_at);
        // Overlap: start < existing_end AND end > existing_start
        return startDate < sEnd && endDate > sStart;
    });

    if (conflicts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30"
            >
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                        Tidak ada bentrok jadwal
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                        Waktu ini tersedia untuk dijadwalkan
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30"
        >
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                        Terdeteksi {conflicts.length} bentrok jadwal
                    </p>
                    <div className="mt-2 space-y-2">
                        {conflicts.slice(0, 5).map((c) => {
                            const cStart = new Date(c.start_at);
                            const cEnd = new Date(c.end_at);
                            return (
                                <div
                                    key={c.id}
                                    className="rounded-lg bg-rose-100 p-2 dark:bg-rose-900/30"
                                >
                                    <p className="text-xs font-medium text-rose-800 dark:text-rose-200">
                                        {c.course_id ===
                                        parseInt(currentCourseId)
                                            ? 'Mata kuliah yang sama'
                                            : `Course #${c.course_id}`}
                                        {c.title && ` — ${c.title}`}
                                    </p>
                                    <p className="text-xs text-rose-600 dark:text-rose-400">
                                        Pertemuan {c.meeting_number} •{' '}
                                        {cStart.toLocaleString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}{' '}
                                        -{' '}
                                        {cEnd.toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CreateJadwal({
    courses,
    stats,
    existingSessions,
}: PageProps) {
    const form = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        description: '',
        start_at: '',
        end_at: '',
    });

    const [showPreview, setShowPreview] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Selected course
    const selectedCourse = useMemo(
        () => courses.find((c) => c.id === parseInt(form.data.course_id)),
        [form.data.course_id, courses],
    );
    const availableOfflineMeetings = useMemo(() => {
        if (!selectedCourse) {
            return [];
        }

        const scheduledMeetings = new Set(selectedCourse.scheduled_meetings);
        return selectedCourse.offline_meetings.filter(
            (meetingNumber) => !scheduledMeetings.has(meetingNumber),
        );
    }, [selectedCourse]);
    const selectedMeetingTemplate = useMemo(
        () =>
            selectedCourse?.meeting_templates.find(
                (meeting) =>
                    meeting.meeting_number === form.data.meeting_number,
            ),
        [selectedCourse, form.data.meeting_number],
    );

    // Completed meetings for selected course
    const completedMeetings = useMemo(() => {
        if (!form.data.course_id) return 0;
        const cid = parseInt(form.data.course_id);
        return existingSessions.filter((s) => s.course_id === cid).length;
    }, [form.data.course_id, existingSessions]);

    // Auto-suggest next meeting number when course changes
    useEffect(() => {
        if (!form.data.course_id) return;
        if (availableOfflineMeetings.length === 0) {
            return;
        }

        const nextMeetingNumber = availableOfflineMeetings.includes(
            form.data.meeting_number,
        )
            ? form.data.meeting_number
            : availableOfflineMeetings[0];

        if (nextMeetingNumber && form.data.meeting_number !== nextMeetingNumber) {
            form.setData('meeting_number', nextMeetingNumber);
        }
    }, [availableOfflineMeetings, form, form.data.course_id, form.data.meeting_number]);

    useEffect(() => {
        if (!selectedMeetingTemplate?.quick_ready) {
            return;
        }

        form.setData((prev) => {
            if (
                prev.title === selectedMeetingTemplate.suggested_title &&
                prev.description ===
                    selectedMeetingTemplate.suggested_description
            ) {
                return prev;
            }

            return {
                ...prev,
                    title: selectedMeetingTemplate.suggested_title,
                    description: selectedMeetingTemplate.suggested_description,
            };
        });
    }, [form, selectedMeetingTemplate]);

    // Extract date from start_at for presets & day info
    const selectedDate = form.data.start_at
        ? form.data.start_at.split('T')[0]
        : '';

    const handleTimePreset = (start: string, end: string) => {
        form.setData((prev) => ({ ...prev, start_at: start, end_at: end }));
    };

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        form.post('/admin/jadwal', {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => router.visit('/admin/jadwal'), 2500);
            },
        });
    };

    const inputClass =
        'w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm';
    const selectClass = cn(inputClass, 'appearance-auto');

    // Preview items
    const previewItems = [
        {
            label: 'Mata Kuliah',
            value: selectedCourse
                ? `${selectedCourse.nama} (${selectedCourse.sks} SKS)`
                : '-',
            icon: BookOpen,
        },
        {
            label: 'Dosen',
            value: selectedCourse?.dosen?.nama || '-',
            icon: Users,
        },
        {
            label: 'Pertemuan Ke',
            value: `${form.data.meeting_number}`,
            icon: Hash,
        },
        { label: 'Judul/Topik', value: form.data.title || '-', icon: Type },
        {
            label: 'Deskripsi',
            value: form.data.description || '-',
            icon: Type,
        },
        {
            label: 'Waktu Mulai',
            value: form.data.start_at
                ? new Date(form.data.start_at).toLocaleString('id-ID', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                  })
                : '-',
            icon: Clock,
        },
        {
            label: 'Waktu Selesai',
            value: form.data.end_at
                ? new Date(form.data.end_at).toLocaleString('id-ID', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                  })
                : '-',
            icon: Clock,
        },
    ];

    return (
        <AppLayout>
            <Head title="Tambah Jadwal" />

            <div className="space-y-6 p-6">
                {/* ═══════ HEADER ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring' as const,
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
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
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/admin/jadwal')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Kembali ke Daftar Jadwal
                        </motion.button>

                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center md:gap-4">
                            <div className="flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
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
                                        type: 'spring' as const,
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={JadwalIcon}
                                        alt="Tambah Jadwal"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                    >
                                        Manajemen Jadwal Perkuliahan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                    >
                                        Tambah Jadwal Baru
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-2 text-sm leading-relaxed text-indigo-100/80 sm:text-base"
                                    >
                                        Buat jadwal perkuliahan baru dengan
                                        detail lengkap dan akurat
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="hidden shrink-0 rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl sm:block"
                            >
                                <p className="text-xs text-indigo-100/90">
                                    Total Jadwal
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                                    <Calendar className="h-4 w-4" />
                                    {stats.total} Jadwal
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ FORM ═══════ */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Informasi Mata Kuliah */}
                    <FormSection
                        title="Informasi Mata Kuliah"
                        description="Pilih mata kuliah dan pertemuan"
                        icon={BookOpen}
                        gradient="from-indigo-500 to-purple-600"
                    >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                label="Mata Kuliah"
                                icon={BookOpen}
                                required
                                error={form.errors.course_id}
                                helper="Pilih mata kuliah yang akan dijadwalkan"
                            >
                                <select
                                    value={form.data.course_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'course_id',
                                            e.target.value,
                                        )
                                    }
                                    className={selectClass}
                                >
                                    <option value="">Pilih Mata Kuliah</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nama} ({c.sks} SKS)
                                            {c.dosen
                                                ? ` - ${c.dosen.nama}`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField
                                label="Pertemuan Ke"
                                icon={Hash}
                                required
                                error={form.errors.meeting_number}
                                helper={
                                    selectedCourse?.offline_meetings.length
                                        ? 'Pilih pertemuan offline dari data RPS. Sesi akan aktif otomatis saat jadwal dimulai.'
                                        : 'Pilih nomor pertemuan. Jika RPS offline belum tersedia, input manual masih diperbolehkan.'
                                }
                            >
                                {selectedCourse?.offline_meetings.length ? (
                                    <select
                                        value={
                                            availableOfflineMeetings.includes(
                                                form.data.meeting_number,
                                            )
                                                ? String(form.data.meeting_number)
                                                : ''
                                        }
                                        onChange={(e) =>
                                            form.setData(
                                                'meeting_number',
                                                parseInt(e.target.value) || 1,
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        {availableOfflineMeetings.length === 0 ? (
                                            <option value="">
                                                Semua pertemuan offline sudah
                                                dijadwalkan
                                            </option>
                                        ) : (
                                            availableOfflineMeetings.map(
                                                (meetingNumber) => (
                                                    <option
                                                        key={meetingNumber}
                                                        value={meetingNumber}
                                                    >
                                                        Pertemuan {meetingNumber}
                                                    </option>
                                                ),
                                            )
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        min={1}
                                        max={16}
                                        value={form.data.meeting_number}
                                        onChange={(e) =>
                                            form.setData(
                                                'meeting_number',
                                                parseInt(e.target.value) || 1,
                                            )
                                        }
                                        className={cn(inputClass, 'font-mono')}
                                    />
                                )}
                                {selectedCourse && (
                                    <MeetingProgress
                                        completedMeetings={completedMeetings}
                                        currentMeeting={
                                            form.data.meeting_number
                                        }
                                    />
                                )}
                            </FormField>

                            <FormField
                                label="Judul/Topik Pertemuan"
                                icon={Type}
                                optional
                                helper="Contoh: Pengenalan Algoritma, UTS, Presentasi"
                                className="md:col-span-2"
                            >
                                <input
                                    type="text"
                                    value={form.data.title}
                                    onChange={(e) =>
                                        form.setData('title', e.target.value)
                                    }
                                    placeholder="Masukkan judul atau topik pertemuan"
                                    className={inputClass}
                                />
                            </FormField>

                            <div className="md:col-span-2">
                                <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-neutral-900/50 dark:to-fuchsia-950/20">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold tracking-[0.28em] text-indigo-500 uppercase">
                                                Pertemuan Otomatis
                                            </p>
                                            <h3 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                                                Nama sesi dan deskripsi akan
                                                mengikuti pertemuan offline
                                                yang dipilih
                                            </h3>
                                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                                                Admin cukup memilih pertemuan
                                                offline. Template RPS akan
                                                terpasang otomatis dan sesi ini
                                                aktif sendiri saat waktu mulai
                                                tiba.
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-indigo-600 uppercase dark:border-indigo-800/60 dark:bg-white/5 dark:text-indigo-300">
                                            Aktif Sesuai Jadwal
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                        <div className="rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
                                            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                                                Offline Di RPS
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                                {selectedCourse
                                                    ? formatMeetingBadges(
                                                          selectedCourse.offline_meetings,
                                                      )
                                                    : 'Pilih mata kuliah dulu'}
                                            </p>
                                            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                                Belum dijadwalkan:{' '}
                                                {selectedCourse
                                                    ? formatMeetingBadges(
                                                          availableOfflineMeetings,
                                                      )
                                                    : '-'}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
                                            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                                                Meeting Aktif
                                            </p>
                                            {!selectedCourse ? (
                                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                    Pilih mata kuliah dulu.
                                                </p>
                                            ) : selectedMeetingTemplate ? (
                                                <>
                                                    <p className="mt-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                                        P
                                                        {
                                                            selectedMeetingTemplate.meeting_number
                                                        }{' '}
                                                        •{' '}
                                                        {selectedMeetingTemplate.mode ??
                                                            'belum ditandai'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                                                        {selectedMeetingTemplate.topic ??
                                                            'Topik RPS belum diisi.'}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            form.setData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    title: selectedMeetingTemplate.suggested_title,
                                                                    description:
                                                                        selectedMeetingTemplate.suggested_description,
                                                                }),
                                                            )
                                                        }
                                                        disabled={
                                                            !selectedMeetingTemplate.quick_ready
                                                        }
                                                        className="mt-3 inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300"
                                                    >
                                                        <Download className="mr-2 h-3.5 w-3.5" />
                                                        Terapkan Template
                                                    </button>
                                                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                                        {selectedMeetingTemplate.quick_ready
                                                            ? 'Template offline siap dipakai dan sesi akan aktif otomatis saat jadwal masuk.'
                                                            : selectedMeetingTemplate.is_offline
                                                              ? 'Meeting offline ada, tapi topik/deskripsinya belum lengkap.'
                                                              : 'Sesi absensi offline hanya bisa dibuat dari pertemuan offline.'}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="mt-2 text-sm text-amber-600 dark:text-amber-300">
                                                    Belum ada template offline
                                                    untuk pertemuan ini.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <FormField
                                label="Deskripsi Jadwal"
                                icon={Type}
                                optional
                                helper="Ringkasan materi akan otomatis mengikuti template pertemuan offline, lalu masih bisa kamu edit manual."
                                className="md:col-span-2"
                            >
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    rows={4}
                                    placeholder="Tambahkan ringkasan materi atau arahan pertemuan"
                                    className={cn(
                                        inputClass,
                                        'min-h-[110px] resize-y',
                                    )}
                                />
                            </FormField>
                        </div>

                        {/* Selected course info card */}
                        {selectedCourse && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                                            {selectedCourse.nama}
                                        </p>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                            {selectedCourse.sks} SKS • Dosen:{' '}
                                            {selectedCourse.dosen?.nama || '-'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </FormSection>

                    {/* Section 2: Waktu & Durasi */}
                    <FormSection
                        title="Waktu & Durasi"
                        description="Atur jadwal waktu perkuliahan"
                        icon={Clock}
                        gradient="from-purple-500 to-pink-600"
                    >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                label="Waktu Mulai"
                                icon={Clock}
                                required
                                error={form.errors.start_at}
                            >
                                <input
                                    type="datetime-local"
                                    value={form.data.start_at}
                                    onChange={(e) =>
                                        form.setData('start_at', e.target.value)
                                    }
                                    className={cn(
                                        inputClass,
                                        '[color-scheme:dark]',
                                    )}
                                />
                                <DayInfo dateStr={form.data.start_at} />
                            </FormField>

                            <FormField
                                label="Waktu Selesai"
                                icon={Clock}
                                required
                                error={form.errors.end_at}
                            >
                                <input
                                    type="datetime-local"
                                    value={form.data.end_at}
                                    onChange={(e) =>
                                        form.setData('end_at', e.target.value)
                                    }
                                    className={cn(
                                        inputClass,
                                        '[color-scheme:dark]',
                                    )}
                                />
                            </FormField>
                        </div>

                        {/* Duration Calculator */}
                        <DurationCalculator
                            startAt={form.data.start_at}
                            endAt={form.data.end_at}
                            sks={selectedCourse?.sks}
                        />

                        {/* Time Presets */}
                        <TimePresets
                            date={selectedDate}
                            onSelect={handleTimePreset}
                        />

                        {/* Conflict Checker */}
                        <ConflictChecker
                            startAt={form.data.start_at}
                            endAt={form.data.end_at}
                            existingSessions={existingSessions}
                            currentCourseId={form.data.course_id}
                        />
                    </FormSection>

                    {/* Section 3: Bulk Import (Collapsible) */}
                    <FormSection
                        title="Import Jadwal Massal"
                        description="Upload file Excel untuk membuat banyak jadwal sekaligus"
                        icon={Upload}
                        gradient="from-cyan-500 to-blue-600"
                        collapsible
                        defaultOpen={false}
                    >
                        <div className="space-y-4">
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                            Download Template
                                        </h4>
                                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                            Gunakan template Excel untuk
                                            memastikan format data yang benar
                                        </p>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white opacity-60 transition-colors hover:bg-blue-700"
                                            disabled
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Segera Hadir
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="cursor-not-allowed rounded-xl border-2 border-dashed border-neutral-300 p-8 text-center opacity-60 dark:border-neutral-700">
                                <Upload className="mx-auto mb-3 h-12 w-12 text-neutral-400" />
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Fitur import Excel/CSV akan segera tersedia
                                </p>
                                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                                    Format: Excel (.xlsx, .xls) atau CSV (.csv)
                                </p>
                            </div>
                        </div>
                    </FormSection>

                    {/* ═══════ STICKY ACTION BAR ═══════ */}
                    <div className="sticky bottom-0 z-10 -mx-6 -mb-6 border-t border-neutral-200 bg-white/80 p-4 backdrop-blur-xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/80">
                        <div className="flex flex-col justify-end gap-3 sm:flex-row">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.visit('/admin/jadwal')}
                                disabled={form.processing}
                                className="w-full rounded-xl border border-neutral-200 bg-white/60 px-6 py-3 text-sm font-semibold text-neutral-600 transition-all hover:bg-neutral-100 disabled:opacity-50 sm:w-auto dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-700/60"
                            >
                                Batal
                            </motion.button>

                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowPreview(true)}
                                disabled={form.processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-100 disabled:opacity-50 sm:w-auto dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/40"
                            >
                                <Eye className="h-4 w-4" />
                                Preview Data
                            </motion.button>

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={form.processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {form.processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />{' '}
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" /> Simpan
                                        Jadwal
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </form>

                {/* ═══════ PREVIEW MODAL ═══════ */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
                            onClick={() => setShowPreview(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                transition={{
                                    type: 'spring' as const,
                                    stiffness: 250,
                                    damping: 22,
                                }}
                                className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="absolute top-4 right-4 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                    <h3 className="text-2xl font-bold">
                                        Preview Jadwal Baru
                                    </h3>
                                    <p className="mt-1 text-sm text-white/80">
                                        Periksa kembali data sebelum menyimpan
                                    </p>
                                </div>

                                {/* Content */}
                                <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
                                    {previewItems.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {item.label}
                                                </p>
                                                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Duration in preview */}
                                    {form.data.start_at && form.data.end_at && (
                                        <DurationCalculator
                                            startAt={form.data.start_at}
                                            endAt={form.data.end_at}
                                            sks={selectedCourse?.sks}
                                        />
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 border-t border-neutral-200 p-6 dark:border-neutral-700">
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowPreview(false)}
                                        className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                    >
                                        Kembali Edit
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setShowPreview(false);
                                            handleSubmit();
                                        }}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
                                    >
                                        <Save className="h-4 w-4" />
                                        Simpan Jadwal
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ SUCCESS ANIMATION ═══════ */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 20 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: 'spring' as const,
                                        stiffness: 200,
                                        delay: 0.2,
                                    }}
                                    className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/30"
                                >
                                    <CheckCircle2 className="h-12 w-12 text-white" />
                                </motion.div>
                                <h3 className="mb-2 text-3xl font-bold text-white">
                                    Berhasil!
                                </h3>
                                <p className="text-lg text-neutral-400">
                                    Jadwal berhasil ditambahkan
                                </p>
                                <p className="mt-2 text-sm text-neutral-500">
                                    Mengalihkan ke daftar jadwal...
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
