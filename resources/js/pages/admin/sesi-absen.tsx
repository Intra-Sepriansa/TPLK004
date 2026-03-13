import courseIcon from '@/assets/admin/sesi-absen/course-icon.png';
import EditSesiIcon from '@/assets/admin/sesi-absen/edit-sesi-icon.png';
import hariIcon from '@/assets/admin/sesi-absen/hari-icon.png';
import rataRataIcon from '@/assets/admin/sesi-absen/rata-rata-icon.png';
import sesiIcon from '@/assets/admin/sesi-absen/sesi-icon.png';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Copy,
    Download,
    Edit,
    Pause,
    Play,
    Plus,
    RefreshCw,
    Search,
    Sparkles,
    Timer,
    Trash2,
    TrendingUp,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
interface Session {
    id: number;
    course_id: number;
    course_name: string;
    dosen_name: string;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
    logs_count: number;
    tokens_count: number;
    present_count: number;
    late_count: number;
    rejected_count: number;
    status: string;
    duration_minutes: number;
}

interface Course {
    id: number;
    nama: string;
    sks: number;
    dosen: string;
}

interface Stats {
    total_sessions: number;
    active_sessions: number;
    today_sessions: number;
    today_attendance: number;
    week_sessions: number;
    week_attendance: number;
    month_sessions: number;
    month_attendance: number;
    avg_attendance_per_session: number;
    completion_rate: number;
}

interface ActiveSessionDetail {
    id: number;
    course_name: string;
    dosen_name: string;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
    status: string;
    total_attendance: number;
    present_count: number;
    late_count: number;
    rejected_count: number;
    pending_selfie: number;
    total_tokens: number;
    active_tokens: number;
    duration_minutes: number;
    time_remaining: number;
}

interface TodaySession {
    id: number;
    course: string;
    meeting: number;
    time: string;
    is_active: boolean;
    status: string;
}

interface HourlyData {
    hour: string;
    count: number;
}
interface WeeklyData {
    date: string;
    day: string;
    sessions: number;
    attendance: number;
}
interface CoursePerf {
    id: number;
    name: string;
    total_sessions: number;
    completed_sessions: number;
    avg_attendance: number;
}

interface PageProps {
    sessions: {
        data: Session[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    courses: Course[];
    stats: Stats;
    activeSessionDetail: ActiveSessionDetail | null;
    todaySessions: TodaySession[];
    hourlyDistribution: HourlyData[];
    weeklyTrend: WeeklyData[];
    coursePerformance: CoursePerf[];
    filters: {
        course_id: string;
        status: string;
        search: string;
        per_page: number;
    };
}

type EditFormValues = {
    course_id: string;
    meeting_number: number;
    title: string;
    start_at: string;
    end_at: string;
};

type EditFormValidation = {
    meeting_number: string;
    start_at: string;
    end_at: string;
};

type EditFormTouched = {
    meeting_number: boolean;
    start_at: boolean;
    end_at: boolean;
};

const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
> = {
    active: { label: 'Aktif', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    scheduled: {
        label: 'Terjadwal',
        color: 'text-blue-700',
        bg: 'bg-blue-100',
    },
    ongoing: {
        label: 'Berlangsung',
        color: 'text-amber-700',
        bg: 'bg-amber-100',
    },
    completed: {
        label: 'Selesai',
        color: 'text-slate-700',
        bg: 'bg-slate-100',
    },
};

const emptyEditValidation: EditFormValidation = {
    meeting_number: '',
    start_at: '',
    end_at: '',
};

const emptyEditTouched: EditFormTouched = {
    meeting_number: false,
    start_at: false,
    end_at: false,
};

const parseDateTimeValue = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const calculateDurationInMinutes = (startAt: string, endAt: string) => {
    const start = parseDateTimeValue(startAt);
    const end = parseDateTimeValue(endAt);
    if (!start || !end) return null;
    const total = Math.floor((end.getTime() - start.getTime()) / 60000);
    if (total <= 0) return null;
    return {
        total,
        hours: Math.floor(total / 60),
        minutes: total % 60,
    };
};

const normalizeDateTimeLocal = (value: string) => {
    if (!value) return '';
    if (value.includes('T')) {
        return value.slice(0, 16);
    }
    if (value.includes(' ')) {
        return value.replace(' ', 'T').slice(0, 16);
    }
    return value.slice(0, 16);
};

const toDateTimeLocalString = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function SesiAbsen({
    sessions,
    courses,
    stats,
    activeSessionDetail,
    todaySessions,
    hourlyDistribution,
    weeklyTrend,
    coursePerformance,
    filters,
}: PageProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSession, setEditSession] = useState<Session | null>(null);
    const [search, setSearch] = useState(filters.search);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    // Countdown Timer Effect
    useEffect(() => {
        if (!activeSessionDetail) return;

        const calculateCountdown = () => {
            const endTime = new Date(activeSessionDetail.end_at).getTime();
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60),
            );
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds });
        };

        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);

        return () => clearInterval(interval);
    }, [activeSessionDetail]);

    const editForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });

    const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const [editValidation, setEditValidation] =
        useState<EditFormValidation>(emptyEditValidation);
    const [editTouched, setEditTouched] =
        useState<EditFormTouched>(emptyEditTouched);
    const [editDirty, setEditDirty] = useState(false);
    const [showEditSuccess, setShowEditSuccess] = useState(false);
    const [initialEditValues, setInitialEditValues] =
        useState<EditFormValues | null>(null);

    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    const getCurrentEditData = (): EditFormValues => ({
        course_id: String(editForm.data.course_id ?? ''),
        meeting_number: Number(editForm.data.meeting_number ?? 0),
        title: String(editForm.data.title ?? ''),
        start_at: String(editForm.data.start_at ?? ''),
        end_at: String(editForm.data.end_at ?? ''),
    });

    const validateEditData = (data: EditFormValues): EditFormValidation => {
        const next: EditFormValidation = { ...emptyEditValidation };

        if (
            !Number.isFinite(data.meeting_number) ||
            data.meeting_number < 1 ||
            data.meeting_number > 21
        ) {
            next.meeting_number = 'Nomor pertemuan harus antara 1 sampai 21.';
        }

        if (!data.start_at) {
            next.start_at = 'Waktu mulai wajib diisi.';
        }

        if (!data.end_at) {
            next.end_at = 'Waktu selesai wajib diisi.';
        }

        const startDate = parseDateTimeValue(data.start_at);
        const endDate = parseDateTimeValue(data.end_at);

        if (data.start_at && !startDate) {
            next.start_at = 'Format waktu mulai tidak valid.';
        }

        if (data.end_at && !endDate) {
            next.end_at = 'Format waktu selesai tidak valid.';
        }

        if (startDate && endDate) {
            if (endDate <= startDate) {
                next.end_at = 'Waktu selesai harus setelah waktu mulai.';
            } else {
                const totalMinutes = Math.floor(
                    (endDate.getTime() - startDate.getTime()) / 60000,
                );
                if (totalMinutes < 30) {
                    next.end_at = 'Durasi minimal 30 menit.';
                } else if (totalMinutes > 240) {
                    next.end_at = 'Durasi maksimal 4 jam.';
                }
            }
        }

        return next;
    };

    const isEditValid = (validation: EditFormValidation) =>
        !validation.meeting_number &&
        !validation.start_at &&
        !validation.end_at;

    const isDifferentFromInitial = (nextData: EditFormValues) => {
        if (!initialEditValues) return false;
        return (
            String(nextData.course_id) !==
                String(initialEditValues.course_id) ||
            Number(nextData.meeting_number) !==
                Number(initialEditValues.meeting_number) ||
            String(nextData.title || '') !==
                String(initialEditValues.title || '') ||
            String(nextData.start_at || '') !==
                String(initialEditValues.start_at || '') ||
            String(nextData.end_at || '') !==
                String(initialEditValues.end_at || '')
        );
    };

    const updateEditField = <K extends keyof EditFormValues>(
        field: K,
        value: EditFormValues[K],
    ) => {
        editForm.setData(field as any, value as any);
        const nextData: EditFormValues = {
            ...getCurrentEditData(),
            [field]: value,
        } as EditFormValues;
        if (
            field === 'meeting_number' ||
            field === 'start_at' ||
            field === 'end_at'
        ) {
            setEditTouched((prev) => ({ ...prev, [field]: true }));
        }
        const nextValidation = validateEditData(nextData);
        setEditValidation(nextValidation);
        setEditDirty(isDifferentFromInitial(nextData));
    };

    const closeEditModal = (force = false) => {
        if (editForm.processing) return;

        if (!force && editDirty) {
            const shouldClose = window.confirm(
                'Ada perubahan yang belum disimpan. Yakin ingin menutup modal?',
            );
            if (!shouldClose) return;
        }

        if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
            successTimeoutRef.current = null;
        }

        setShowEditModal(false);
        setEditSession(null);
        setShowEditSuccess(false);
        setEditDirty(false);
        setEditTouched(emptyEditTouched);
        setEditValidation(emptyEditValidation);
        setInitialEditValues(null);
    };

    const submitEditForm = () => {
        if (!editSession) return;
        const currentData = getCurrentEditData();
        const validation = validateEditData(currentData);
        setEditValidation(validation);
        setEditTouched({ meeting_number: true, start_at: true, end_at: true });

        if (!isEditValid(validation)) {
            return;
        }

        editForm.patch(`/admin/sesi-absen/${editSession.id}`, {
            onSuccess: () => {
                setShowEditSuccess(true);
                setEditDirty(false);
                if (successTimeoutRef.current) {
                    clearTimeout(successTimeoutRef.current);
                }
                successTimeoutRef.current = setTimeout(() => {
                    closeEditModal(true);
                }, 1100);
            },
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/admin/sesi-absen',
            { ...filters, [key]: value },
            { preserveState: true },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleEdit = (session: Session) => {
        router.visit(`/admin/sesi-absen/${session.id}/edit`);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        submitEditForm();
    };

    useEffect(() => {
        if (!showEditModal) return;

        const handleKeyPress = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                submitEditForm();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                closeEditModal();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [
        showEditModal,
        editSession,
        editDirty,
        editForm.processing,
        editForm.data,
    ]);

    useEffect(() => {
        if (!showEditModal || !editDirty) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [showEditModal, editDirty]);

    const currentEditValues = getCurrentEditData();
    const durationInfo = calculateDurationInMinutes(
        currentEditValues.start_at,
        currentEditValues.end_at,
    );
    const changedFields = initialEditValues
        ? [
              initialEditValues.meeting_number !==
              currentEditValues.meeting_number
                  ? 'Nomor pertemuan diubah'
                  : null,
              initialEditValues.title !== currentEditValues.title
                  ? 'Judul sesi diubah'
                  : null,
              initialEditValues.start_at !== currentEditValues.start_at
                  ? 'Waktu mulai diubah'
                  : null,
              initialEditValues.end_at !== currentEditValues.end_at
                  ? 'Waktu selesai diubah'
                  : null,
          ].filter((item): item is string => Boolean(item))
        : [];

    const handleActivate = (id: number) =>
        router.patch(`/admin/sesi-absen/${id}/activate`);
    const handleDeactivate = (id: number) =>
        router.patch(`/admin/sesi-absen/${id}/deactivate`);
    const handleDuplicate = (id: number) =>
        router.post(`/admin/sesi-absen/${id}/duplicate`);

    const openDeleteDialog = (id: number) =>
        setDeleteDialog({ open: true, id });
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/admin/sesi-absen/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    return (
        <AppLayout>
            <Head title="Sesi Absen" />
            <div className="space-y-6 p-6">
                {/* Header - Advanced Animated Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
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

                    {/* Overlay & Glow Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center md:gap-4">
                        <div className="flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
                            <motion.div
                                className="relative flex h-24 w-24 shrink-0 sm:h-20 sm:w-20"
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -10,
                                }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    delay: 0.2,
                                }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img
                                    src={courseIcon}
                                    alt="Sesi Absen"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                                />
                            </motion.div>
                            <div className="mt-1 flex-1 sm:mt-0">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm font-medium text-blue-100"
                                >
                                    Manajemen Kehadiran
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-2xl font-bold sm:text-3xl"
                                >
                                    Sesi Absen
                                </motion.h1>
                            </div>
                        </div>
                        <motion.div
                            className="flex w-full shrink-0 justify-center md:w-auto md:justify-end"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: 0.5,
                                type: 'spring',
                                stiffness: 200,
                            }}
                        >
                            <motion.button
                                onClick={() =>
                                    router.get('/admin/sesi-absen/create')
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold shadow-lg backdrop-blur-xl transition-colors hover:bg-white/30 sm:px-6 sm:py-3.5"
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Plus className="h-4 w-4" />
                                Buat Sesi Baru
                            </motion.button>
                        </motion.div>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative mt-4 text-blue-100/80"
                    >
                        Kelola sesi absensi, pantau kehadiran real-time, dan
                        analisis performa
                    </motion.p>
                </motion.div>

                {/* Active Session Banner - Advanced */}
                <AnimatePresence>
                    {activeSessionDetail && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 20,
                            }}
                            className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl p-6 shadow-xl"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                                animate={{
                                    backgroundPosition: [
                                        '0% 50%',
                                        '100% 50%',
                                        '0% 50%',
                                    ],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                style={{ backgroundSize: '200% 200%' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white shadow-xl backdrop-blur-xl sm:h-14 sm:w-14 sm:rounded-2xl"
                                    >
                                        <Play className="h-6 w-6 sm:h-7 sm:w-7" />
                                    </motion.div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <motion.span
                                                animate={{
                                                    opacity: [1, 0.5, 1],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/25 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm"
                                            >
                                                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                                                LIVE
                                            </motion.span>
                                            <p className="text-sm font-medium text-white/80">
                                                Sesi Aktif
                                            </p>
                                        </div>
                                        <p className="mt-1 text-base font-bold break-words text-white sm:text-lg">
                                            {activeSessionDetail.course_name}
                                        </p>
                                        <p className="text-xs text-white/70 sm:text-sm">
                                            Pertemuan #
                                            {activeSessionDetail.meeting_number}{' '}
                                            • {activeSessionDetail.dosen_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full lg:w-auto">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:flex lg:items-center lg:gap-4">
                                        <motion.div
                                            className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-center backdrop-blur-sm sm:px-4"
                                            whileHover={{ scale: 1.08 }}
                                        >
                                            <p className="text-xl font-bold text-white sm:text-2xl">
                                                {
                                                    activeSessionDetail.total_attendance
                                                }
                                            </p>
                                            <p className="text-xs text-white/70">
                                                Kehadiran
                                            </p>
                                        </motion.div>
                                        <motion.div
                                            className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-center backdrop-blur-sm sm:px-4"
                                            whileHover={{ scale: 1.08 }}
                                        >
                                            <p className="text-xl font-bold text-white sm:text-2xl">
                                                {
                                                    activeSessionDetail.pending_selfie
                                                }
                                            </p>
                                            <p className="text-xs text-white/70">
                                                Pending Selfie
                                            </p>
                                        </motion.div>
                                        <div className="col-span-2 rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-sm">
                                            <div className="flex items-center justify-center gap-1">
                                                {countdown.days > 0 && (
                                                    <>
                                                        <div className="flex min-w-[36px] flex-col items-center rounded-lg border border-white/20 bg-white/15 px-1.5 py-1 backdrop-blur-sm">
                                                            <span className="text-base font-bold text-white tabular-nums sm:text-lg">
                                                                {countdown.days}
                                                            </span>
                                                            <span className="text-[9px] text-white/60">
                                                                hari
                                                            </span>
                                                        </div>
                                                        <span className="text-base font-bold text-white/60">
                                                            :
                                                        </span>
                                                    </>
                                                )}
                                                <div className="flex min-w-[36px] flex-col items-center rounded-lg border border-white/20 bg-white/15 px-1.5 py-1 backdrop-blur-sm">
                                                    <span className="text-base font-bold text-white tabular-nums sm:text-lg">
                                                        {String(
                                                            countdown.hours,
                                                        ).padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <span className="text-base font-bold text-white/60">
                                                    :
                                                </span>
                                                <div className="flex min-w-[36px] flex-col items-center rounded-lg border border-white/20 bg-white/15 px-1.5 py-1 backdrop-blur-sm">
                                                    <span className="text-base font-bold text-white tabular-nums sm:text-lg">
                                                        {String(
                                                            countdown.minutes,
                                                        ).padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <span className="text-base font-bold text-white/60">
                                                    :
                                                </span>
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.05, 1],
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                    }}
                                                    className="flex min-w-[36px] flex-col items-center rounded-lg border border-white/20 bg-white/15 px-1.5 py-1 backdrop-blur-sm"
                                                >
                                                    <span className="text-base font-bold text-white tabular-nums sm:text-lg">
                                                        {String(
                                                            countdown.seconds,
                                                        ).padStart(2, '0')}
                                                    </span>
                                                </motion.div>
                                            </div>
                                            <p className="mt-1 text-center text-xs text-white/70">
                                                Sisa Waktu
                                            </p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleDeactivate(
                                                    activeSessionDetail.id,
                                                )
                                            }
                                            className="col-span-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/80 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 backdrop-blur-sm transition-all hover:bg-red-500 lg:w-auto lg:px-5 lg:py-3"
                                        >
                                            <Pause className="h-4 w-4" />
                                            Tutup Sesi
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid - Staggered Spring Animations */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.04 },
                        },
                    }}
                >
                    {[
                        {
                            imageIcon: courseIcon,
                            label: 'Total Sesi',
                            value: stats.total_sessions,
                            sub: 'Semua waktu',
                            color: 'purple',
                        },
                        {
                            imageIcon: sesiIcon,
                            label: 'Sesi Aktif',
                            value: stats.active_sessions,
                            sub: 'Saat ini',
                            color: 'emerald',
                        },
                        {
                            imageIcon: hariIcon,
                            label: 'Hari Ini',
                            value: stats.today_sessions,
                            sub: `${stats.today_attendance} kehadiran`,
                            color: 'orange',
                        },
                        {
                            imageIcon: rataRataIcon,
                            label: 'Rata-rata',
                            value: stats.avg_attendance_per_session,
                            sub: 'Per sesi',
                            color: 'blue',
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.9 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    },
                                },
                            }}
                            whileHover={{
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                        >
                            <StatCard
                                imageIcon={card.imageIcon}
                                label={card.label}
                                value={card.value}
                                sub={card.sub}
                                color={card.color}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Charts Row — Glassmorphism */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl lg:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <h2 className="font-semibold text-neutral-900 dark:text-white">
                                Tren Mingguan
                            </h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyTrend}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-neutral-200 dark:stroke-neutral-800"
                                    />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'rgba(255,255,255,0.95)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '12px',
                                            backdropFilter: 'blur(12px)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sessions"
                                        name="Sesi"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.3}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="attendance"
                                        name="Kehadiran"
                                        stroke="#22c55e"
                                        fill="#22c55e"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <h2 className="font-semibold text-neutral-900 dark:text-white">
                                Kehadiran Hari Ini
                            </h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyDistribution}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-neutral-200 dark:stroke-neutral-800"
                                    />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fontSize: 9, fill: '#64748b' }}
                                        interval={2}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="count"
                                        name="Kehadiran"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Today Sessions & Course Performance — Glassmorphism */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="border-b border-white/10 p-4 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                    <Timer className="h-5 w-5" />
                                </div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">
                                    Jadwal Hari Ini
                                </h2>
                            </div>
                        </div>
                        <div className="max-h-72 divide-y divide-neutral-200/50 overflow-y-auto dark:divide-neutral-800/50">
                            {todaySessions.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500">
                                    Tidak ada sesi hari ini
                                </div>
                            ) : (
                                todaySessions.map((s, idx) => {
                                    const cfg =
                                        statusConfig[s.status] ||
                                        statusConfig.scheduled;
                                    return (
                                        <motion.div
                                            key={s.id}
                                            className="flex items-center justify-between p-3 backdrop-blur transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.is_active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}`}
                                                >
                                                    {s.is_active ? (
                                                        <Play className="h-4 w-4" />
                                                    ) : (
                                                        <Clock className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                        {s.course}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        Pertemuan #{s.meeting} •{' '}
                                                        {s.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                                            >
                                                {cfg.label}
                                            </span>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                    <motion.div
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="border-b border-white/10 p-4 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">
                                    Performa Mata Kuliah
                                </h2>
                            </div>
                        </div>
                        <div className="max-h-72 divide-y divide-neutral-200/50 overflow-y-auto dark:divide-neutral-800/50">
                            {coursePerformance.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500">
                                    Belum ada data
                                </div>
                            ) : (
                                coursePerformance.map((c, idx) => (
                                    <motion.div
                                        key={c.id}
                                        className="flex items-center justify-between p-3 backdrop-blur transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02, x: -4 }}
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {c.name}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {c.completed_sessions}/
                                                {c.total_sessions} sesi
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                {c.avg_attendance}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                rata-rata
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Filters & Search — Glassmorphism */}
                <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <div className="flex flex-wrap items-center gap-4">
                        <form
                            onSubmit={handleSearch}
                            className="min-w-[200px] flex-1"
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari sesi atau mata kuliah..."
                                    className="w-full rounded-xl border border-white/20 bg-white/60 py-2.5 pr-4 pl-10 text-sm backdrop-blur transition-all focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white"
                                />
                            </div>
                        </form>
                        <select
                            value={filters.course_id}
                            onChange={(e) =>
                                handleFilter('course_id', e.target.value)
                            }
                            className="rounded-xl border border-white/20 bg-white/60 px-3 py-2.5 text-sm backdrop-blur transition-all focus:border-indigo-500 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white"
                        >
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nama}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                handleFilter('status', e.target.value)
                            }
                            className="rounded-xl border border-white/20 bg-white/60 px-3 py-2.5 text-sm backdrop-blur transition-all focus:border-indigo-500 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="completed">Selesai</option>
                        </select>
                        <button
                            onClick={() => router.reload()}
                            className="flex items-center gap-2 rounded-xl bg-neutral-100/60 px-4 py-2.5 text-sm text-neutral-600 backdrop-blur transition-all hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                        <button
                            onClick={() => router.get('/admin/sesi-absen/pdf')}
                            className="flex items-center gap-2 rounded-xl bg-neutral-100/60 px-4 py-2.5 text-sm text-neutral-600 backdrop-blur transition-all hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Sessions Table — Glassmorphism */}
                <motion.div
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-neutral-50/60 backdrop-blur dark:bg-neutral-800/60">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase dark:text-neutral-400">
                                        Mata Kuliah
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase dark:text-neutral-400">
                                        Pertemuan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase dark:text-neutral-400">
                                        Waktu
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase dark:text-neutral-400">
                                        Kehadiran
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase dark:text-neutral-400">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase dark:text-neutral-400">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
                                {sessions.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-12 text-center"
                                        >
                                            <Calendar className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                                            <p className="text-neutral-500">
                                                Belum ada sesi absen
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.data.map((s, idx) => {
                                        const cfg =
                                            statusConfig[s.status] ||
                                            statusConfig.scheduled;
                                        return (
                                            <motion.tr
                                                key={s.id}
                                                className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: idx * 0.03,
                                                }}
                                                whileHover={{ scale: 1.005 }}
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-neutral-900 dark:text-white">
                                                        {s.course_name}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        {s.dosen_name}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                                                        #{s.meeting_number}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-neutral-900 dark:text-white">
                                                        {
                                                            s.start_at?.split(
                                                                ' ',
                                                            )[0]
                                                        }
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        {
                                                            s.start_at?.split(
                                                                ' ',
                                                            )[1]
                                                        }{' '}
                                                        -{' '}
                                                        {
                                                            s.end_at?.split(
                                                                ' ',
                                                            )[1]
                                                        }
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                            {s.logs_count}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            {s.present_count >
                                                                0 && (
                                                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                    {
                                                                        s.present_count
                                                                    }
                                                                </span>
                                                            )}
                                                            {s.late_count >
                                                                0 && (
                                                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                    {
                                                                        s.late_count
                                                                    }
                                                                </span>
                                                            )}
                                                            {s.rejected_count >
                                                                0 && (
                                                                <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                    {
                                                                        s.rejected_count
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {!s.is_active &&
                                                            s.status !==
                                                                'completed' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleActivate(
                                                                            s.id,
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30"
                                                                    title="Aktifkan"
                                                                >
                                                                    <Play className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        {s.is_active && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeactivate(
                                                                        s.id,
                                                                    )
                                                                }
                                                                className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-100/60 dark:hover:bg-red-900/30"
                                                                title="Nonaktifkan"
                                                            >
                                                                <Pause className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(s)
                                                            }
                                                            className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDuplicate(
                                                                    s.id,
                                                                )
                                                            }
                                                            className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
                                                            title="Duplikat"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    s.id,
                                                                )
                                                            }
                                                            className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-100/60 dark:hover:bg-red-900/30"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {sessions.last_page > 1 && (
                        <div className="flex justify-center gap-2 border-t border-white/10 p-4 dark:border-white/5">
                            {sessions.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    disabled={!link.url}
                                    className={`rounded-lg px-3 py-1.5 text-sm transition-all ${link.active ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : link.url ? 'bg-neutral-100/60 text-neutral-700 backdrop-blur hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-700/60' : 'cursor-not-allowed bg-neutral-50/40 text-neutral-400'}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEditModal && editSession && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => closeEditModal()}
                        >
                            <motion.div
                                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            <motion.div
                                className="relative mx-2 w-full max-w-2xl sm:mx-auto"
                                initial={{ scale: 0.82, y: 50, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.82, y: 50, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div className="relative max-h-[92vh] overflow-x-hidden overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0A0A0B] shadow-2xl sm:rounded-[2.5rem]">
                                    <div className="relative overflow-hidden p-6 sm:p-8 md:p-10">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                                            animate={{
                                                backgroundPosition: [
                                                    '0% 0%',
                                                    '100% 100%',
                                                    '0% 0%',
                                                ],
                                            }}
                                            transition={{
                                                duration: 15,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                            style={{
                                                backgroundSize: '200% 200%',
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/60" />
                                        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />

                                        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex w-full flex-col items-center gap-4 text-center sm:w-auto sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                                                <motion.div
                                                    className="relative shrink-0"
                                                    whileHover={{
                                                        scale: 1.05,
                                                        rotate: -5,
                                                    }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 10,
                                                    }}
                                                >
                                                    <img
                                                        src={EditSesiIcon}
                                                        alt="Edit Sesi"
                                                        className="pointer-events-none h-16 w-16 object-contain drop-shadow-2xl sm:h-20 sm:w-20"
                                                    />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl">
                                                        Edit Sesi Absen
                                                    </h3>
                                                    <p className="mt-1 text-sm font-medium text-white/80 drop-shadow sm:mt-1.5 sm:text-base">
                                                        Perbarui informasi sesi
                                                        absensi dengan lengkap
                                                        dan akurat
                                                    </p>
                                                </div>
                                            </div>

                                            <motion.button
                                                type="button"
                                                onClick={() => closeEditModal()}
                                                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 shadow-lg backdrop-blur-md transition-colors hover:bg-black/40 sm:static sm:h-11 sm:w-11"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 90,
                                                }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    <form
                                        onSubmit={handleUpdate}
                                        className="relative space-y-6 bg-black/40 p-6 backdrop-blur-2xl sm:space-y-8 sm:p-8 md:p-10"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 }}
                                            className="space-y-2"
                                        >
                                            <label className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-300 uppercase">
                                                <BookOpen className="h-4 w-4 text-indigo-300" />
                                                Mata Kuliah
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={
                                                        editForm.data.course_id
                                                    }
                                                    disabled
                                                    className="w-full cursor-not-allowed appearance-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-11 text-white/60 shadow-inner"
                                                    required
                                                >
                                                    {courses.map((course) => (
                                                        <option
                                                            key={course.id}
                                                            value={course.id}
                                                            className="bg-slate-900 text-white"
                                                        >
                                                            {course.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/30">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <rect
                                                            width="18"
                                                            height="11"
                                                            x="3"
                                                            y="11"
                                                            rx="2"
                                                            ry="2"
                                                        />
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 italic">
                                                Mata kuliah tidak dapat diubah
                                                setelah sesi dibuat.
                                            </p>
                                        </motion.div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="space-y-2"
                                            >
                                                <label className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-300 uppercase">
                                                    <Calendar className="h-4 w-4 text-purple-300" />
                                                    Pertemuan Ke
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="number"
                                                        min="1"
                                                        max="21"
                                                        value={
                                                            editForm.data
                                                                .meeting_number
                                                        }
                                                        onChange={(event) => {
                                                            const rawValue =
                                                                event.target
                                                                    .value;
                                                            const meetingNumber =
                                                                rawValue === ''
                                                                    ? 0
                                                                    : Number(
                                                                          rawValue,
                                                                      );
                                                            updateEditField(
                                                                'meeting_number',
                                                                Number.isNaN(
                                                                    meetingNumber,
                                                                )
                                                                    ? 0
                                                                    : meetingNumber,
                                                            );
                                                        }}
                                                        className={cn(
                                                            'w-full rounded-2xl border bg-white/5 px-5 py-4 pr-11 text-white shadow-inner transition-all duration-300 placeholder:text-gray-500 focus:bg-white/10 focus:ring-4 focus:ring-pink-500/20',
                                                            editTouched.meeting_number &&
                                                                editValidation.meeting_number
                                                                ? 'border-rose-500/60 focus:border-rose-500/70'
                                                                : 'border-white/10 focus:border-pink-500/50',
                                                        )}
                                                        required
                                                        whileFocus={{
                                                            scale: 1.01,
                                                        }}
                                                    />
                                                    {editTouched.meeting_number && (
                                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                                            {editValidation.meeting_number ? (
                                                                <AlertCircle className="h-4 w-4 text-rose-400" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Masukkan nomor pertemuan
                                                    antara 1 sampai 21.
                                                </p>
                                                {editTouched.meeting_number &&
                                                    editValidation.meeting_number && (
                                                        <p className="flex items-center gap-1 text-xs text-rose-400">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {
                                                                editValidation.meeting_number
                                                            }
                                                        </p>
                                                    )}
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 }}
                                                className="space-y-2"
                                            >
                                                <label className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-300 uppercase">
                                                    <Sparkles className="h-4 w-4 text-pink-300" />
                                                    Judul Sesi{' '}
                                                    <span className="text-xs font-medium tracking-normal text-gray-500 normal-case">
                                                        (opsional)
                                                    </span>
                                                </label>
                                                <motion.input
                                                    type="text"
                                                    value={
                                                        editForm.data.title ||
                                                        ''
                                                    }
                                                    onChange={(event) =>
                                                        updateEditField(
                                                            'title',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: Kuis 1, UTS, Presentasi"
                                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white shadow-inner transition-all duration-300 placeholder:text-gray-500 focus:border-pink-500/50 focus:bg-white/10 focus:ring-4 focus:ring-pink-500/20"
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Judul membantu identifikasi
                                                    sesi khusus.
                                                </p>
                                            </motion.div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-2"
                                            >
                                                <label className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-300 uppercase">
                                                    <Clock className="h-4 w-4 text-emerald-300" />
                                                    Waktu Mulai
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="datetime-local"
                                                        value={
                                                            editForm.data
                                                                .start_at
                                                        }
                                                        onChange={(event) =>
                                                            updateEditField(
                                                                'start_at',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={cn(
                                                            'w-full rounded-2xl border bg-white/5 px-5 py-4 pr-11 text-white [color-scheme:dark] shadow-inner transition-all duration-300 focus:bg-white/10 focus:ring-4 focus:ring-pink-500/20',
                                                            editTouched.start_at &&
                                                                editValidation.start_at
                                                                ? 'border-rose-500/60 focus:border-rose-500/70'
                                                                : 'border-white/10 focus:border-pink-500/50',
                                                        )}
                                                        required
                                                        whileFocus={{
                                                            scale: 1.01,
                                                        }}
                                                    />
                                                    {editTouched.start_at && (
                                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                                            {editValidation.start_at ? (
                                                                <AlertCircle className="h-4 w-4 text-rose-400" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {editTouched.start_at &&
                                                    editValidation.start_at && (
                                                        <p className="flex items-center gap-1 text-xs text-rose-400">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {
                                                                editValidation.start_at
                                                            }
                                                        </p>
                                                    )}
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.25 }}
                                                className="space-y-2"
                                            >
                                                <label className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-300 uppercase">
                                                    <Clock className="h-4 w-4 text-emerald-300" />
                                                    Waktu Selesai
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="datetime-local"
                                                        value={
                                                            editForm.data.end_at
                                                        }
                                                        onChange={(event) =>
                                                            updateEditField(
                                                                'end_at',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={cn(
                                                            'w-full rounded-2xl border bg-white/5 px-5 py-4 pr-11 text-white [color-scheme:dark] shadow-inner transition-all duration-300 focus:bg-white/10 focus:ring-4 focus:ring-pink-500/20',
                                                            editTouched.end_at &&
                                                                editValidation.end_at
                                                                ? 'border-rose-500/60 focus:border-rose-500/70'
                                                                : 'border-white/10 focus:border-pink-500/50',
                                                        )}
                                                        required
                                                        whileFocus={{
                                                            scale: 1.01,
                                                        }}
                                                    />
                                                    {editTouched.end_at && (
                                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                                            {editValidation.end_at ? (
                                                                <AlertCircle className="h-4 w-4 text-rose-400" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {editTouched.end_at &&
                                                    editValidation.end_at && (
                                                        <p className="flex items-center gap-1 text-xs text-rose-400">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {
                                                                editValidation.end_at
                                                            }
                                                        </p>
                                                    )}
                                            </motion.div>
                                        </div>

                                        {durationInfo ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-200">
                                                            Durasi Sesi
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            Durasi valid:
                                                            minimal 30 menit,
                                                            maksimal 4 jam.
                                                        </p>
                                                    </div>
                                                    <p className="text-right text-lg font-bold text-white">
                                                        {durationInfo.hours > 0
                                                            ? `${durationInfo.hours} jam `
                                                            : ''}
                                                        {durationInfo.minutes}{' '}
                                                        menit
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : null}

                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                Preset Durasi
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {[30, 60, 90, 120].map(
                                                    (minutes) => (
                                                        <motion.button
                                                            key={minutes}
                                                            type="button"
                                                            onClick={() => {
                                                                const startDate =
                                                                    parseDateTimeValue(
                                                                        String(
                                                                            editForm
                                                                                .data
                                                                                .start_at ||
                                                                                '',
                                                                        ),
                                                                    );
                                                                if (
                                                                    !startDate
                                                                ) {
                                                                    setEditTouched(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            start_at: true,
                                                                        }),
                                                                    );
                                                                    setEditValidation(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            start_at:
                                                                                'Isi waktu mulai terlebih dahulu sebelum memilih preset.',
                                                                        }),
                                                                    );
                                                                    return;
                                                                }
                                                                const nextEndDate =
                                                                    new Date(
                                                                        startDate.getTime() +
                                                                            minutes *
                                                                                60000,
                                                                    );
                                                                updateEditField(
                                                                    'end_at',
                                                                    toDateTimeLocalString(
                                                                        nextEndDate,
                                                                    ),
                                                                );
                                                            }}
                                                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                                                            whileHover={{
                                                                scale: 1.04,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.96,
                                                            }}
                                                        >
                                                            {minutes < 60
                                                                ? `${minutes} menit`
                                                                : `${minutes / 60} jam`}
                                                        </motion.button>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        {editDirty &&
                                            changedFields.length > 0 && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        x: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-3"
                                                >
                                                    <p className="text-xs font-semibold tracking-wide text-amber-300 uppercase">
                                                        Perubahan Terdeteksi
                                                    </p>
                                                    <div className="mt-1 space-y-1">
                                                        {changedFields.map(
                                                            (item) => (
                                                                <p
                                                                    key={item}
                                                                    className="text-xs text-amber-100/90"
                                                                >
                                                                    {item}
                                                                </p>
                                                            ),
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}

                                        <div className="border-t border-white/10 pt-4">
                                            <p className="mb-2 text-xs text-gray-500">
                                                Pintasan keyboard
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="flex items-center gap-2">
                                                    <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-gray-300">
                                                        Ctrl + Enter
                                                    </kbd>
                                                    <span className="text-xs text-gray-500">
                                                        Simpan
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-gray-300">
                                                        Esc
                                                    </kbd>
                                                    <span className="text-xs text-gray-500">
                                                        Tutup
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.div
                                            className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end sm:gap-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.28 }}
                                        >
                                            <motion.button
                                                type="button"
                                                onClick={() => closeEditModal()}
                                                className="order-2 w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-white sm:order-1 sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Batal
                                            </motion.button>

                                            <motion.button
                                                type="submit"
                                                disabled={
                                                    editForm.processing ||
                                                    !isEditValid(editValidation)
                                                }
                                                className="relative order-1 w-full overflow-hidden rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-pink-500/30 transition-all hover:from-pink-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:w-auto sm:rounded-2xl sm:px-10 sm:py-4 sm:text-base"
                                                whileHover={{
                                                    scale: editForm.processing
                                                        ? 1
                                                        : 1.02,
                                                    y: editForm.processing
                                                        ? 0
                                                        : -2,
                                                }}
                                                whileTap={{
                                                    scale: editForm.processing
                                                        ? 1
                                                        : 0.98,
                                                }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                                    animate={{
                                                        x: ['-200%', '200%'],
                                                    }}
                                                    transition={{
                                                        duration: 2.5,
                                                        repeat: Infinity,
                                                        ease: 'linear',
                                                    }}
                                                />
                                                <span className="relative flex items-center justify-center gap-2">
                                                    {editForm.processing ? (
                                                        <>
                                                            <svg
                                                                className="h-5 w-5 animate-spin text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                />
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                                />
                                                            </svg>
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        'Simpan Perubahan'
                                                    )}
                                                </span>
                                            </motion.button>
                                        </motion.div>
                                    </form>

                                    <AnimatePresence>
                                        {editForm.processing && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 backdrop-blur-sm"
                                            >
                                                <div className="text-center">
                                                    <motion.div
                                                        animate={{
                                                            rotate: 360,
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                        }}
                                                        className="mx-auto mb-4 h-14 w-14 rounded-full border-4 border-white/15 border-t-white"
                                                    />
                                                    <p className="font-medium text-white">
                                                        Menyimpan perubahan...
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <AnimatePresence>
                                        {showEditSuccess && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                                className="absolute inset-0 z-50 flex items-center justify-center rounded-[2rem] bg-black/80 backdrop-blur-xl sm:rounded-[2.5rem]"
                                            >
                                                <div className="px-6 text-center">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 200,
                                                            delay: 0.15,
                                                        }}
                                                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/30"
                                                    >
                                                        <CheckCircle className="h-10 w-10 text-white" />
                                                    </motion.div>
                                                    <h4 className="text-2xl font-bold text-white">
                                                        Berhasil
                                                    </h4>
                                                    <p className="mt-1 text-sm text-gray-300">
                                                        Sesi absen berhasil
                                                        diperbarui.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                    title="Hapus Sesi Absen"
                    message="Yakin ingin menghapus sesi absen ini? Semua data kehadiran terkait juga akan dihapus."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </AppLayout>
    );
}

function StatCard({
    icon: Icon,
    imageIcon,
    label,
    value,
    sub,
    color,
}: {
    icon?: any;
    imageIcon?: string;
    label: string;
    value: number | string;
    sub: string;
    color: string;
}) {
    const [isHovered, setIsHovered] = useState(false);

    // Map colors to matching dashboard configurations
    const colorConfigs: Record<string, any> = {
        emerald: {
            bg: 'bg-emerald-500',
            hoverShadow: 'group-hover:shadow-emerald-500/10',
            gradientBg:
                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
            iconBg: 'from-emerald-400 to-teal-600 shadow-emerald-500/30',
        },
        orange: {
            bg: 'bg-amber-500',
            hoverShadow: 'group-hover:shadow-amber-500/10',
            gradientBg:
                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            iconBg: 'from-orange-400 to-orange-600 shadow-orange-500/30',
        },
        amber: {
            bg: 'bg-amber-500',
            hoverShadow: 'group-hover:shadow-amber-500/10',
            gradientBg:
                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            iconBg: 'from-amber-400 to-orange-600 shadow-amber-500/30',
        },
        purple: {
            bg: 'bg-violet-500',
            hoverShadow: 'group-hover:shadow-violet-500/10',
            gradientBg:
                'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10',
            iconBg: 'from-violet-400 to-purple-600 shadow-violet-500/30',
        },
        blue: {
            bg: 'bg-sky-500',
            hoverShadow: 'group-hover:shadow-sky-500/10',
            gradientBg:
                'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
            iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30',
        },
    };
    const c = colorConfigs[color] ?? colorConfigs.blue;

    return (
        <div
            className={`group relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${c.hoverShadow} cursor-pointer dark:border-white/5`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`}
            />

            <motion.div
                initial={false}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${c.bg} blur-3xl transition-all duration-500`}
            />

            <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                {imageIcon ? (
                    <motion.div
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img
                            src={imageIcon}
                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                            alt={label}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br sm:h-14 sm:w-14 sm:rounded-2xl ${c.iconBg} text-white shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {Icon && <Icon className="h-4 w-4 sm:h-6 sm:w-6" />}
                    </motion.div>
                )}
                <div className="flex w-full flex-col items-center sm:w-auto sm:items-start">
                    <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                        {label}
                    </p>
                    <div className="mt-0.5 flex w-full justify-center sm:mt-1 sm:justify-start">
                        <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                            {value}
                        </span>
                    </div>
                    <p className="mt-0.5 text-[8px] leading-tight text-neutral-400 sm:text-xs">
                        {sub}
                    </p>
                </div>
            </div>
        </div>
    );
}
