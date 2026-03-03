import EditSesiIcon from '@/assets/admin/sesi-absen/edit-sesi-icon.png';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
    AlertCircle,
    AlignLeft,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    FileText,
    Hash,
    Loader2,
    Lock,
    Save,
    Settings,
    Users,
    Zap,
} from 'lucide-react';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';

interface SessionData {
    id: number;
    course_id: number;
    course_name: string;
    dosen_name: string;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
    status: string;
    logs_count: number;
    created_at: string | null;
    updated_at: string | null;
    can_edit_meeting: boolean;
    can_edit_time: boolean;
}

interface Course {
    id: number;
    nama: string;
    sks: number;
    dosen: string;
}

interface PageProps {
    session: SessionData;
    courses: Course[];
}

type EditFormData = {
    course_id: string;
    meeting_number: number;
    title: string;
    start_at: string;
    end_at: string;
};

type ClientErrors = Partial<Record<keyof EditFormData, string>>;

type ChangeItem = {
    field: string;
    oldValue: string;
    newValue: string;
};

const fieldLabels: Record<keyof EditFormData, string> = {
    course_id: 'Mata Kuliah',
    meeting_number: 'Pertemuan Ke',
    title: 'Judul Sesi',
    start_at: 'Waktu Mulai',
    end_at: 'Waktu Selesai',
};

const formatDateTime = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatChangeValue = (
    field: keyof EditFormData,
    value: EditFormData[keyof EditFormData],
) => {
    if (field === 'start_at' || field === 'end_at') {
        return formatDateTime(String(value));
    }
    if (field === 'meeting_number') {
        return String(value);
    }
    if (field === 'title') {
        return String(value || '(kosong)');
    }
    return String(value);
};

const toDateTimeLocalString = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getDurationInfo = (startAt: string, endAt: string) => {
    if (!startAt || !endAt) return null;
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    if (totalMinutes <= 0) return null;

    return {
        totalMinutes,
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
    };
};

export default function EditSesiAbsen({ session, courses }: PageProps) {
    const initialFormData = useMemo<EditFormData>(
        () => ({
            course_id: String(session.course_id),
            meeting_number: session.meeting_number,
            title: session.title ?? '',
            start_at: session.start_at ?? '',
            end_at: session.end_at ?? '',
        }),
        [session],
    );

    const form = useForm<EditFormData>(initialFormData);
    const [clientErrors, setClientErrors] = useState<ClientErrors>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const [originalData] = useState<EditFormData>(initialFormData);

    const hasChanges = useMemo(() => {
        return (
            form.data.course_id !== originalData.course_id ||
            form.data.meeting_number !== originalData.meeting_number ||
            form.data.title !== originalData.title ||
            form.data.start_at !== originalData.start_at ||
            form.data.end_at !== originalData.end_at
        );
    }, [form.data, originalData]);

    const changes = useMemo<ChangeItem[]>(() => {
        const result: ChangeItem[] = [];
        (Object.keys(fieldLabels) as Array<keyof EditFormData>).forEach(
            (key) => {
                if (form.data[key] !== originalData[key]) {
                    result.push({
                        field: fieldLabels[key],
                        oldValue: formatChangeValue(key, originalData[key]),
                        newValue: formatChangeValue(key, form.data[key]),
                    });
                }
            },
        );
        return result;
    }, [form.data, originalData]);

    const durationInfo = useMemo(
        () => getDurationInfo(form.data.start_at, form.data.end_at),
        [form.data.start_at, form.data.end_at],
    );

    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!hasChanges) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    const validateForm = () => {
        const nextErrors: ClientErrors = {};

        if (!form.data.course_id) {
            nextErrors.course_id = 'Mata kuliah wajib tersedia.';
        }

        if (
            !Number.isFinite(form.data.meeting_number) ||
            form.data.meeting_number < 1 ||
            form.data.meeting_number > 21
        ) {
            nextErrors.meeting_number =
                'Nomor pertemuan harus antara 1 sampai 21.';
        }

        if (
            !session.can_edit_meeting &&
            form.data.meeting_number !== originalData.meeting_number
        ) {
            nextErrors.meeting_number =
                'Nomor pertemuan tidak dapat diubah karena sudah ada data kehadiran.';
        }

        if (!form.data.start_at) {
            nextErrors.start_at = 'Waktu mulai wajib diisi.';
        }

        if (!form.data.end_at) {
            nextErrors.end_at = 'Waktu selesai wajib diisi.';
        }

        if (
            !session.can_edit_time &&
            (form.data.start_at !== originalData.start_at ||
                form.data.end_at !== originalData.end_at)
        ) {
            nextErrors.start_at =
                'Waktu sesi yang sedang aktif tidak dapat diubah.';
            nextErrors.end_at =
                'Waktu sesi yang sedang aktif tidak dapat diubah.';
        }

        if (form.data.start_at && form.data.end_at) {
            const start = new Date(form.data.start_at);
            const end = new Date(form.data.end_at);

            if (Number.isNaN(start.getTime())) {
                nextErrors.start_at = 'Format waktu mulai tidak valid.';
            }
            if (Number.isNaN(end.getTime())) {
                nextErrors.end_at = 'Format waktu selesai tidak valid.';
            }

            if (!nextErrors.start_at && !nextErrors.end_at) {
                if (end <= start) {
                    nextErrors.end_at =
                        'Waktu selesai harus setelah waktu mulai.';
                } else {
                    const durationMinutes = Math.floor(
                        (end.getTime() - start.getTime()) / 60000,
                    );
                    if (durationMinutes < 30) {
                        nextErrors.end_at = 'Durasi minimal 30 menit.';
                    } else if (durationMinutes > 240) {
                        nextErrors.end_at = 'Durasi maksimal 4 jam.';
                    }
                }
            }
        }

        setClientErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const submitUpdate = () => {
        if (!hasChanges || form.processing) return;
        if (!validateForm()) return;

        form.patch(`/admin/sesi-absen/${session.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                if (successTimeoutRef.current) {
                    clearTimeout(successTimeoutRef.current);
                }
                successTimeoutRef.current = setTimeout(() => {
                    router.visit('/admin/sesi-absen');
                }, 1200);
            },
        });
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                submitUpdate();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                handleBack();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasChanges, form.processing, form.data, clientErrors]);

    const handleBack = () => {
        if (!hasChanges) {
            router.visit('/admin/sesi-absen');
            return;
        }

        const shouldLeave = window.confirm(
            'Ada perubahan yang belum disimpan. Yakin ingin kembali?',
        );
        if (shouldLeave) {
            router.visit('/admin/sesi-absen');
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        submitUpdate();
    };

    const timeline = useMemo(() => {
        const result: Array<{ label: string; value: string }> = [];
        if (session.created_at) {
            result.push({
                label: 'Sesi dibuat',
                value: formatDateTime(session.created_at),
            });
        }
        if (session.updated_at) {
            result.push({
                label: 'Terakhir diperbarui',
                value: formatDateTime(session.updated_at),
            });
        }
        result.push({
            label: 'Total data kehadiran',
            value: `${session.logs_count} mahasiswa`,
        });
        return result;
    }, [session]);

    return (
        <AppLayout>
            <Head title={`Edit Sesi #${session.id}`} />

            <div className="min-h-screen bg-black p-4 md:p-6 dark:bg-black">
                <div className="mx-auto w-full max-w-6xl space-y-6">
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
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.02, x: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBack}
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Kembali ke Daftar Sesi
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
                                            type: 'spring',
                                            stiffness: 300,
                                            delay: 0.2,
                                        }}
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                    >
                                        <img
                                            src={EditSesiIcon}
                                            alt="Edit Sesi"
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
                                            Edit Sesi Absen
                                        </motion.h1>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="mt-2 text-sm text-blue-100/80 sm:text-base"
                                        >
                                            Perbarui informasi sesi absensi
                                            dengan lengkap dan akurat
                                        </motion.p>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl"
                                >
                                    <p className="text-xs text-indigo-100/90">
                                        Sesi ID
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                                        <FileText className="h-4 w-4" />#
                                        {session.id}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Informasi Sesi Saat Ini
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Data aktif sebelum perubahan disimpan
                                </p>
                            </div>
                            <span
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-medium',
                                    session.is_active
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
                                )}
                            >
                                {session.is_active ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <InfoItem
                                icon={BookOpen}
                                label="Mata Kuliah"
                                value={session.course_name}
                                color="indigo"
                            />
                            <InfoItem
                                icon={Hash}
                                label="Pertemuan"
                                value={`#${session.meeting_number}`}
                                color="purple"
                            />
                            <InfoItem
                                icon={Clock}
                                label="Waktu"
                                value={formatDateTime(session.start_at)}
                                color="pink"
                            />
                            <InfoItem
                                icon={Users}
                                label="Kehadiran"
                                value={`${session.logs_count} mahasiswa`}
                                color="emerald"
                            />
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <FormSection
                                    title="Informasi Dasar"
                                    description="Data utama sesi absensi"
                                    icon={FileText}
                                    gradient="from-indigo-400 to-purple-600"
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField
                                            label="Mata Kuliah"
                                            icon={BookOpen}
                                            locked
                                            lockMessage="Mata kuliah tidak dapat diubah setelah sesi dibuat."
                                            error={clientErrors.course_id}
                                        >
                                            <select
                                                value={form.data.course_id}
                                                disabled
                                                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-600 dark:text-neutral-400"
                                            >
                                                {courses.map((course) => (
                                                    <option
                                                        key={course.id}
                                                        value={course.id}
                                                    >
                                                        {course.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>

                                        <FormField
                                            label="Pertemuan Ke"
                                            icon={Hash}
                                            required
                                            error={
                                                clientErrors.meeting_number ||
                                                form.errors.meeting_number
                                            }
                                            locked={!session.can_edit_meeting}
                                            lockMessage={
                                                !session.can_edit_meeting
                                                    ? 'Tidak dapat diubah karena sudah ada data kehadiran.'
                                                    : undefined
                                            }
                                        >
                                            <input
                                                type="number"
                                                min={1}
                                                max={21}
                                                value={form.data.meeting_number}
                                                onChange={(event) => {
                                                    form.setData(
                                                        'meeting_number',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    );
                                                    setClientErrors((prev) => ({
                                                        ...prev,
                                                        meeting_number:
                                                            undefined,
                                                    }));
                                                }}
                                                disabled={
                                                    !session.can_edit_meeting
                                                }
                                                className={cn(
                                                    'w-full rounded-xl border px-4 py-3 transition-all',
                                                    !session.can_edit_meeting
                                                        ? 'cursor-not-allowed border-white/10 bg-white/5 text-neutral-600 dark:text-neutral-400'
                                                        : 'border-white/20 bg-white/60 text-neutral-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white',
                                                )}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Judul Sesi"
                                            icon={AlignLeft}
                                            optional
                                            helper="Contoh: Kuis 1, UTS, Presentasi"
                                        >
                                            <input
                                                type="text"
                                                value={form.data.title}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'title',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan judul sesi (opsional)"
                                                className="w-full rounded-xl border border-white/20 bg-white/60 px-4 py-3 text-neutral-900 transition-all focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white"
                                            />
                                        </FormField>

                                        <FormField
                                            label="Dosen Pengampu"
                                            icon={Users}
                                            locked
                                            className="md:col-span-1"
                                        >
                                            <input
                                                type="text"
                                                value={session.dosen_name}
                                                disabled
                                                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-600 dark:text-neutral-400"
                                            />
                                        </FormField>
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Jadwal & Waktu"
                                    description="Atur waktu pelaksanaan sesi"
                                    icon={Clock}
                                    gradient="from-purple-400 to-pink-600"
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField
                                            label="Waktu Mulai"
                                            icon={Clock}
                                            required
                                            error={
                                                clientErrors.start_at ||
                                                form.errors.start_at
                                            }
                                            locked={!session.can_edit_time}
                                            lockMessage={
                                                !session.can_edit_time
                                                    ? 'Waktu tidak dapat diubah saat sesi aktif.'
                                                    : undefined
                                            }
                                        >
                                            <input
                                                type="datetime-local"
                                                value={form.data.start_at}
                                                onChange={(event) => {
                                                    form.setData(
                                                        'start_at',
                                                        event.target.value,
                                                    );
                                                    setClientErrors((prev) => ({
                                                        ...prev,
                                                        start_at: undefined,
                                                    }));
                                                }}
                                                disabled={
                                                    !session.can_edit_time
                                                }
                                                className={cn(
                                                    'w-full rounded-xl border px-4 py-3 [color-scheme:dark] transition-all',
                                                    !session.can_edit_time
                                                        ? 'cursor-not-allowed border-white/10 bg-white/5 text-neutral-600 dark:text-neutral-400'
                                                        : 'border-white/20 bg-white/60 text-neutral-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white',
                                                )}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Waktu Selesai"
                                            icon={Clock}
                                            required
                                            error={
                                                clientErrors.end_at ||
                                                form.errors.end_at
                                            }
                                            locked={!session.can_edit_time}
                                            lockMessage={
                                                !session.can_edit_time
                                                    ? 'Waktu tidak dapat diubah saat sesi aktif.'
                                                    : undefined
                                            }
                                        >
                                            <input
                                                type="datetime-local"
                                                value={form.data.end_at}
                                                onChange={(event) => {
                                                    form.setData(
                                                        'end_at',
                                                        event.target.value,
                                                    );
                                                    setClientErrors((prev) => ({
                                                        ...prev,
                                                        end_at: undefined,
                                                    }));
                                                }}
                                                disabled={
                                                    !session.can_edit_time
                                                }
                                                className={cn(
                                                    'w-full rounded-xl border px-4 py-3 [color-scheme:dark] transition-all',
                                                    !session.can_edit_time
                                                        ? 'cursor-not-allowed border-white/10 bg-white/5 text-neutral-600 dark:text-neutral-400'
                                                        : 'border-white/20 bg-white/60 text-neutral-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white',
                                                )}
                                            />
                                        </FormField>
                                    </div>

                                    {durationInfo && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                        Durasi Sesi
                                                    </p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        Durasi valid 30 menit
                                                        sampai 4 jam.
                                                    </p>
                                                </div>
                                                <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                                    {durationInfo.hours > 0
                                                        ? `${durationInfo.hours} jam `
                                                        : ''}
                                                    {durationInfo.minutes} menit
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {session.can_edit_time && (
                                        <div className="mt-4">
                                            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                                Preset Durasi
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {[30, 60, 90, 120].map(
                                                    (minutes) => (
                                                        <motion.button
                                                            key={minutes}
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    !form.data
                                                                        .start_at
                                                                ) {
                                                                    setClientErrors(
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
                                                                const start =
                                                                    new Date(
                                                                        form.data.start_at,
                                                                    );
                                                                if (
                                                                    Number.isNaN(
                                                                        start.getTime(),
                                                                    )
                                                                ) {
                                                                    setClientErrors(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            start_at:
                                                                                'Format waktu mulai tidak valid.',
                                                                        }),
                                                                    );
                                                                    return;
                                                                }
                                                                const nextEnd =
                                                                    new Date(
                                                                        start.getTime() +
                                                                            minutes *
                                                                                60000,
                                                                    );
                                                                form.setData(
                                                                    'end_at',
                                                                    toDateTimeLocalString(
                                                                        nextEnd,
                                                                    ),
                                                                );
                                                                setClientErrors(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        start_at:
                                                                            undefined,
                                                                        end_at: undefined,
                                                                    }),
                                                                );
                                                            }}
                                                            className="rounded-lg border border-white/20 bg-white/60 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:bg-white dark:border-white/10 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                            whileHover={{
                                                                scale: 1.04,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.96,
                                                            }}
                                                        >
                                                            <Zap className="mr-1 inline h-3.5 w-3.5" />
                                                            {minutes < 60
                                                                ? `${minutes} menit`
                                                                : `${minutes / 60} jam`}
                                                        </motion.button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </FormSection>

                                <AnimatePresence>
                                    {changes.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                                                        {changes.length}{' '}
                                                        perubahan terdeteksi
                                                    </h4>
                                                    <div className="mt-2 space-y-2">
                                                        {changes.map(
                                                            (change) => (
                                                                <div
                                                                    key={`${change.field}-${change.newValue}`}
                                                                    className="text-sm"
                                                                >
                                                                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                                                                        <Edit className="h-3.5 w-3.5 shrink-0" />
                                                                        <span className="font-medium">
                                                                            {
                                                                                change.field
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <p className="ml-5 text-xs text-amber-700 line-through dark:text-amber-300">
                                                                        {
                                                                            change.oldValue
                                                                        }
                                                                    </p>
                                                                    <p className="ml-5 text-xs font-semibold text-amber-900 dark:text-amber-100">
                                                                        →{' '}
                                                                        {
                                                                            change.newValue
                                                                        }
                                                                    </p>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="sticky bottom-0 z-10 -mx-4 border-t border-white/20 bg-white/80 p-4 backdrop-blur-xl sm:-mx-6 sm:p-6 dark:border-white/10 dark:bg-neutral-900/80">
                                    <div className="flex flex-col justify-end gap-3 sm:flex-row sm:gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            disabled={form.processing}
                                            className="w-full sm:w-auto"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={
                                                form.processing || !hasChanges
                                            }
                                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 sm:w-auto"
                                        >
                                            {form.processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Simpan Perubahan
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <FormSection
                                title="Riwayat Sesi"
                                description="Informasi perubahan yang tercatat"
                                icon={Settings}
                                gradient="from-sky-400 to-indigo-600"
                                collapsible
                                defaultOpen
                            >
                                <div className="space-y-3">
                                    {timeline.map((item) => (
                                        <div
                                            key={`${item.label}-${item.value}`}
                                            className="rounded-xl bg-white/50 p-3 dark:bg-neutral-800/50"
                                        >
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {item.label}
                                            </p>
                                            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </FormSection>

                            <FormSection
                                title="Pintasan"
                                description="Akses cepat saat edit"
                                icon={Zap}
                                gradient="from-pink-400 to-rose-600"
                                collapsible
                                defaultOpen
                            >
                                <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    <div className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2 dark:bg-neutral-800/50">
                                        <span>Simpan perubahan</span>
                                        <kbd className="rounded border border-white/20 bg-white/70 px-2 py-1 font-mono text-[11px] text-neutral-700 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300">
                                            Ctrl + Enter
                                        </kbd>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2 dark:bg-neutral-800/50">
                                        <span>Kembali</span>
                                        <kbd className="rounded border border-white/20 bg-white/70 px-2 py-1 font-mono text-[11px] text-neutral-700 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300">
                                            Esc
                                        </kbd>
                                    </div>
                                </div>
                            </FormSection>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 20 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 220,
                                    delay: 0.1,
                                }}
                                className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/30"
                            >
                                <CheckCircle2 className="h-12 w-12 text-white" />
                            </motion.div>
                            <h3 className="text-3xl font-bold text-white">
                                Berhasil
                            </h3>
                            <p className="mt-2 text-lg text-gray-300">
                                Sesi absen berhasil diperbarui
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Mengalihkan ke daftar sesi...
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}

interface FormSectionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
    children: ReactNode;
    collapsible?: boolean;
    defaultOpen?: boolean;
}

function FormSection({
    title,
    description,
    icon: Icon,
    gradient,
    children,
    collapsible = false,
    defaultOpen = true,
}: FormSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div
                className={cn(
                    'border-b border-white/10 p-6 dark:border-white/5',
                    collapsible &&
                        'cursor-pointer transition-colors hover:bg-white/50 dark:hover:bg-neutral-800/50',
                )}
                onClick={() => collapsible && setIsOpen((prev) => !prev)}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                                gradient,
                            )}
                        >
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                {title}
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {description}
                            </p>
                        </div>
                    </div>
                    {collapsible && (
                        <ChevronRight
                            className={cn(
                                'h-5 w-5 text-neutral-400 transition-transform',
                                isOpen && 'rotate-90',
                            )}
                        />
                    )}
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface FormFieldProps {
    label: string;
    icon?: LucideIcon;
    required?: boolean;
    optional?: boolean;
    locked?: boolean;
    lockMessage?: string;
    error?: string;
    helper?: string;
    children: ReactNode;
    className?: string;
}

function FormField({
    label,
    icon: Icon,
    required,
    optional,
    locked,
    lockMessage,
    error,
    helper,
    children,
    className,
}: FormFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
                {required && <span className="text-red-500">*</span>}
                {optional && (
                    <span className="text-xs font-normal text-gray-500">
                        (Opsional)
                    </span>
                )}
                {locked && <Lock className="h-3.5 w-3.5 text-gray-400" />}
            </label>

            <div className="relative">
                {children}
                {locked && (
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                )}
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                </motion.p>
            )}

            {!error && helper && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {helper}
                </p>
            )}
            {!error && lockMessage && locked && (
                <p className="flex items-center gap-1 text-xs text-gray-500 italic">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {lockMessage}
                </p>
            )}
        </div>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    color: 'indigo' | 'purple' | 'pink' | 'emerald';
}) {
    const colorConfigs: Record<typeof color, string> = {
        indigo: 'from-indigo-400 to-indigo-600',
        purple: 'from-purple-400 to-purple-600',
        pink: 'from-pink-400 to-pink-600',
        emerald: 'from-emerald-400 to-emerald-600',
    };

    return (
        <div className="flex items-center gap-3 rounded-xl bg-white/50 p-3 dark:bg-neutral-800/50">
            <div
                className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg',
                    colorConfigs[color],
                )}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {label}
                </p>
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    );
}
