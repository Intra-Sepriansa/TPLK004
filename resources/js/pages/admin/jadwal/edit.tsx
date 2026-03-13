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
    Edit,
    Eye,
    Hash,
    Loader2,
    Lock,
    Save,
    Timer,
    Type,
    Users,
    X,
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
}

interface ExistingSession {
    id: number;
    course_id: number;
    meeting_number: number;
    title?: string;
    start_at: string;
    end_at: string;
}

interface SessionData {
    id: number;
    course_id: number;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
    logs_count: number;
    course?: Course;
}

interface PageProps {
    session: SessionData;
    courses: Course[];
    existingSessions: ExistingSession[];
}

// ─── Helper Components ───────────────────────────────────────────────────────

function FormSection({
    title,
    description,
    icon: Icon,
    gradient,
    children,
}: {
    title: string;
    description: string;
    icon: any;
    gradient: string;
    children: ReactNode;
}) {
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
            <div className="flex items-center gap-4 p-6">
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
            </div>
            <div className="px-6 pb-6">{children}</div>
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
    locked,
    lockMessage,
    children,
    className,
}: {
    label: string;
    icon: any;
    required?: boolean;
    optional?: boolean;
    error?: string;
    helper?: string;
    locked?: boolean;
    lockMessage?: string;
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
                {locked && <Lock className="h-3 w-3 text-neutral-400" />}
            </label>
            {children}
            {lockMessage && (
                <p className="flex items-center gap-1 text-xs text-amber-600 italic dark:text-amber-400">
                    <AlertCircle className="h-3 w-3" /> {lockMessage}
                </p>
            )}
            {helper && !error && !lockMessage && (
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

function InfoItem({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: any;
    label: string;
    value?: string | number;
    color: string;
}) {
    const colors: Record<string, string> = {
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        emerald:
            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    };
    return (
        <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <div
                className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    colors[color],
                )}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {label}
                </p>
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {value || '-'}
                </p>
            </div>
        </div>
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
        </motion.div>
    );
}

// ─── Conflict Checker ────────────────────────────────────────────────────────

function ConflictChecker({
    startAt,
    endAt,
    existingSessions,
}: {
    startAt: string;
    endAt: string;
    existingSessions: ExistingSession[];
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
                        Waktu ini tersedia
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
                                        Pertemuan {c.meeting_number}
                                        {c.title && ` — ${c.title}`}
                                    </p>
                                    <p className="text-xs text-rose-600 dark:text-rose-400">
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

// ─── Change Tracker ──────────────────────────────────────────────────────────

interface Change {
    field: string;
    oldValue: string;
    newValue: string;
}

function ChangeTracker({ changes }: { changes: Change[] }) {
    if (changes.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Edit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        {changes.length} Perubahan Terdeteksi
                    </h4>
                    <div className="mt-2 space-y-1.5">
                        {changes.map((c, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-xs"
                            >
                                <span className="font-medium text-amber-800 dark:text-amber-200">
                                    {c.field}:
                                </span>
                                <span className="text-rose-600 line-through dark:text-rose-400">
                                    {c.oldValue}
                                </span>
                                <span className="text-neutral-400">→</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {c.newValue}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function EditJadwal({
    session: schedule,
    courses,
    existingSessions,
}: PageProps) {
    // Format datetimes for datetime-local inputs
    const formatForInput = (dt: string) => {
        if (!dt) return '';
        return dt.replace(' ', 'T').slice(0, 16);
    };

    const form = useForm({
        course_id: String(schedule.course_id),
        meeting_number: schedule.meeting_number,
        title: schedule.title || '',
        start_at: formatForInput(schedule.start_at),
        end_at: formatForInput(schedule.end_at),
    });

    const [originalData] = useState({ ...form.data });
    const [showPreview, setShowPreview] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Selected course
    const selectedCourse = useMemo(
        () => courses.find((c) => c.id === parseInt(form.data.course_id)),
        [form.data.course_id, courses],
    );

    // Detect changes
    const hasChanges = useMemo(
        () => JSON.stringify(form.data) !== JSON.stringify(originalData),
        [form.data, originalData],
    );

    const hasTimeChanged = useMemo(
        () =>
            form.data.start_at !== originalData.start_at ||
            form.data.end_at !== originalData.end_at,
        [form.data.start_at, form.data.end_at, originalData],
    );

    // Unsaved changes warning
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [hasChanges]);

    // Locked flags
    const courseIsLocked = schedule.logs_count > 0;
    const timeIsLocked = schedule.is_active;

    // Build changes list
    const getChanges = (): Change[] => {
        const fieldLabels: Record<string, string> = {
            course_id: 'Mata Kuliah',
            meeting_number: 'Pertemuan',
            title: 'Judul',
            start_at: 'Waktu Mulai',
            end_at: 'Waktu Selesai',
        };

        const formatVal = (key: string, val: any): string => {
            if (key === 'course_id') {
                const c = courses.find((co) => co.id === parseInt(val));
                return c ? c.nama : String(val);
            }
            if (key === 'start_at' || key === 'end_at') {
                return val
                    ? new Date(val).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                      })
                    : '-';
            }
            return String(val || '-');
        };

        return (Object.keys(form.data) as Array<keyof typeof form.data>)
            .filter(
                (key) => String(form.data[key]) !== String(originalData[key]),
            )
            .map((key) => ({
                field: fieldLabels[key] || key,
                oldValue: formatVal(key, originalData[key]),
                newValue: formatVal(key, form.data[key]),
            }));
    };

    const handleBack = () => {
        if (hasChanges) {
            if (
                confirm(
                    'Ada perubahan yang belum disimpan. Yakin ingin kembali?',
                )
            ) {
                router.visit('/admin/jadwal');
            }
        } else {
            router.visit('/admin/jadwal');
        }
    };

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        form.patch(`/admin/jadwal/${schedule.id}`, {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => router.visit('/admin/jadwal'), 2500);
            },
        });
    };

    const inputClass =
        'w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm';
    const disabledClass =
        'w-full rounded-xl bg-neutral-100 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-neutral-500 dark:text-neutral-500 cursor-not-allowed text-sm';

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

    // Original info for header card
    const origStart = schedule.start_at ? new Date(schedule.start_at) : null;
    const origEnd = schedule.end_at ? new Date(schedule.end_at) : null;
    const origTimeStr =
        origStart && origEnd
            ? `${origStart.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })} - ${origEnd.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
            : '-';

    return (
        <AppLayout>
            <Head title={`Edit Jadwal #${schedule.id}`} />

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
                            onClick={handleBack}
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
                                        alt="Edit Jadwal"
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
                                        Edit Jadwal
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-2 text-sm leading-relaxed text-indigo-100/80 sm:text-base"
                                    >
                                        Perbarui informasi jadwal perkuliahan
                                        dengan lengkap dan akurat
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
                                    Jadwal ID
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                                    <Calendar className="h-4 w-4" />#
                                    {schedule.id}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ CURRENT INFO CARD ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                Informasi Jadwal Saat Ini
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Data yang sedang aktif untuk jadwal ini
                            </p>
                        </div>
                        <span
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium',
                                schedule.is_active
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
                            )}
                        >
                            {schedule.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <InfoItem
                            icon={BookOpen}
                            label="Mata Kuliah"
                            value={schedule.course?.nama}
                            color="indigo"
                        />
                        <InfoItem
                            icon={Hash}
                            label="Pertemuan"
                            value={`#${schedule.meeting_number}`}
                            color="purple"
                        />
                        <InfoItem
                            icon={Clock}
                            label="Waktu"
                            value={origTimeStr}
                            color="pink"
                        />
                        <InfoItem
                            icon={Users}
                            label="Kehadiran"
                            value={`${schedule.logs_count || 0} mahasiswa`}
                            color="emerald"
                        />
                    </div>
                </motion.div>

                {/* ═══════ FORM ═══════ */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Informasi Mata Kuliah */}
                    <FormSection
                        title="Informasi Mata Kuliah"
                        description="Data mata kuliah dan pertemuan"
                        icon={BookOpen}
                        gradient="from-indigo-500 to-purple-600"
                    >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Course - locked if has logs */}
                            <FormField
                                label="Mata Kuliah"
                                icon={BookOpen}
                                required
                                error={form.errors.course_id}
                                locked={courseIsLocked}
                                lockMessage={
                                    courseIsLocked
                                        ? 'Tidak dapat diubah karena sudah ada data kehadiran'
                                        : undefined
                                }
                            >
                                {courseIsLocked ? (
                                    <div className={disabledClass}>
                                        {schedule.course?.nama} (
                                        {schedule.course?.sks} SKS)
                                    </div>
                                ) : (
                                    <select
                                        value={form.data.course_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'course_id',
                                                e.target.value,
                                            )
                                        }
                                        className={cn(
                                            inputClass,
                                            'appearance-auto',
                                        )}
                                    >
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nama} ({c.sks} SKS)
                                                {c.dosen
                                                    ? ` - ${c.dosen.nama}`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </FormField>

                            <FormField
                                label="Pertemuan Ke"
                                icon={Hash}
                                required
                                error={form.errors.meeting_number}
                            >
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
                            </FormField>

                            <FormField
                                label="Judul/Topik Pertemuan"
                                icon={Type}
                                optional
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
                        </div>

                        {/* Course info card */}
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
                        {/* Active warning */}
                        {timeIsLocked && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
                            >
                                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                        Jadwal Sedang Aktif
                                    </p>
                                    <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                                        Waktu tidak dapat diubah karena jadwal
                                        ini sedang berjalan. Nonaktifkan
                                        terlebih dahulu untuk mengubah waktu.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                label="Waktu Mulai"
                                icon={Clock}
                                required
                                error={form.errors.start_at}
                                locked={timeIsLocked}
                                lockMessage={
                                    timeIsLocked
                                        ? 'Tidak dapat diubah saat jadwal aktif'
                                        : undefined
                                }
                            >
                                <input
                                    type="datetime-local"
                                    value={form.data.start_at}
                                    onChange={(e) =>
                                        form.setData('start_at', e.target.value)
                                    }
                                    disabled={timeIsLocked}
                                    className={cn(
                                        timeIsLocked
                                            ? disabledClass
                                            : inputClass,
                                        '[color-scheme:dark]',
                                    )}
                                />
                            </FormField>

                            <FormField
                                label="Waktu Selesai"
                                icon={Clock}
                                required
                                error={form.errors.end_at}
                                locked={timeIsLocked}
                                lockMessage={
                                    timeIsLocked
                                        ? 'Tidak dapat diubah saat jadwal aktif'
                                        : undefined
                                }
                            >
                                <input
                                    type="datetime-local"
                                    value={form.data.end_at}
                                    onChange={(e) =>
                                        form.setData('end_at', e.target.value)
                                    }
                                    disabled={timeIsLocked}
                                    className={cn(
                                        timeIsLocked
                                            ? disabledClass
                                            : inputClass,
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

                        {/* Conflict Checker - only when time changed */}
                        {!timeIsLocked && hasTimeChanged && (
                            <ConflictChecker
                                startAt={form.data.start_at}
                                endAt={form.data.end_at}
                                existingSessions={existingSessions}
                            />
                        )}
                    </FormSection>

                    {/* ═══════ CHANGE TRACKER ═══════ */}
                    {hasChanges && <ChangeTracker changes={getChanges()} />}

                    {/* ═══════ STICKY ACTION BAR ═══════ */}
                    <div className="sticky bottom-0 z-10 -mx-6 -mb-6 border-t border-neutral-200 bg-white/80 p-4 backdrop-blur-xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/80">
                        <div className="flex flex-col justify-end gap-3 sm:flex-row">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBack}
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
                                disabled={form.processing || !hasChanges}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-100 disabled:opacity-50 sm:w-auto dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/40"
                            >
                                <Eye className="h-4 w-4" />
                                Preview Perubahan
                            </motion.button>

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={form.processing || !hasChanges}
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
                                        Perubahan
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
                                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="absolute top-4 right-4 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                    <h3 className="text-2xl font-bold">
                                        Preview Perubahan
                                    </h3>
                                    <p className="mt-1 text-sm text-white/80">
                                        Periksa kembali data sebelum menyimpan
                                    </p>
                                </div>

                                <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
                                    {/* Changes summary */}
                                    {hasChanges && (
                                        <div className="mb-4">
                                            <ChangeTracker
                                                changes={getChanges()}
                                            />
                                        </div>
                                    )}

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

                                    {form.data.start_at && form.data.end_at && (
                                        <DurationCalculator
                                            startAt={form.data.start_at}
                                            endAt={form.data.end_at}
                                            sks={selectedCourse?.sks}
                                        />
                                    )}
                                </div>

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
                                        Simpan Perubahan
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
                                    Jadwal berhasil diperbarui
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
