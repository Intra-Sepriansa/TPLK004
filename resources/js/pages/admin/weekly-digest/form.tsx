import TaskInfoIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import NotificationIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import TotalNotificationIcon from '@/assets/admin/notification-center/total.png';
import SettingsIcon from '@/assets/admin/pengaturan/pengaturan.png';
import CourseIcon from '@/assets/dosen/dashboard/course-icon.png';
import SessionStatIcon from '@/assets/dosen/dashboard/stat-total-sessions.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Minus,
    Plus,
    Save,
    Trash2,
    Type,
} from 'lucide-react';
import { useCallback } from 'react';

interface CourseOption {
    id: number;
    nama: string;
    kode: string | null;
    kelas: string | null;
}

interface DigestPayload {
    id?: number;
    courses?: {
        id: number;
        name: string;
        code: string;
        meeting_number: number;
        title: string | null;
    }[];
    mata_kuliah_ids?: number[];
    meetings?: Record<string, number[]>;
    titles?: Record<string, string[]>;
    week_number: number;
    semester: string;
    has_structured_task: boolean;
    forum_posts_required: number;
    mentari_course_url: string | null;
    mentari_course_id: string | null;
    is_published: boolean;
}

interface Props {
    mode: 'create' | 'edit';
    digest: DigestPayload | null;
    courses: CourseOption[];
    constants: {
        class_label: string;
        platform_name: string;
        platform_url: string;
        forum_posts_required: number;
    };
}

interface FormShape {
    mata_kuliah_ids: string[];
    meetings: Record<string, number[]>;
    titles: Record<string, string[]>;
    has_structured_task: boolean;
    is_published: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.97, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { type: 'spring' as const, stiffness: 220, damping: 18 },
    },
} as const;

const meetingEntryVariants = {
    initial: { opacity: 0, height: 0, y: -10, scale: 0.95 },
    animate: {
        opacity: 1,
        height: 'auto' as const,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
    exit: {
        opacity: 0,
        height: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.2 },
    },
};

/* ─── Stepper Component ─── */
function MeetingStepper({
    value,
    onChange,
    min = 1,
    max = 32,
}: {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
}) {
    const clamp = (v: number) => Math.max(min, Math.min(max, v));

    return (
        <div className="flex items-center gap-0.5">
            <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(clamp(value - 1));
                }}
                disabled={value <= min}
                className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-all sm:h-10 sm:w-10',
                    value <= min
                        ? 'cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-neutral-800 dark:text-neutral-600'
                        : 'bg-rose-50 text-rose-600 shadow-sm hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40',
                )}
            >
                <Minus className="h-4 w-4" />
            </motion.button>

            <motion.span
                key={value}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-9 w-12 items-center justify-center rounded-xl bg-indigo-50 text-sm font-extrabold tabular-nums text-indigo-700 sm:h-10 sm:w-14 sm:text-base dark:bg-indigo-900/30 dark:text-indigo-300"
            >
                {value}
            </motion.span>

            <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(clamp(value + 1));
                }}
                disabled={value >= max}
                className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-all sm:h-10 sm:w-10',
                    value >= max
                        ? 'cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-neutral-800 dark:text-neutral-600'
                        : 'bg-emerald-50 text-emerald-600 shadow-sm hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40',
                )}
            >
                <Plus className="h-4 w-4" />
            </motion.button>
        </div>
    );
}

/* ─── Single Meeting Entry Row ─── */
function MeetingEntry({
    courseId,
    index,
    meetingNumber,
    title,
    canRemove,
    onMeetingChange,
    onTitleChange,
    onRemove,
}: {
    courseId: string;
    index: number;
    meetingNumber: number;
    title: string;
    canRemove: boolean;
    onMeetingChange: (val: number) => void;
    onTitleChange: (val: string) => void;
    onRemove: () => void;
}) {
    return (
        <motion.div
            variants={meetingEntryVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className="overflow-hidden"
        >
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 p-3.5 dark:border-indigo-500/15 dark:from-indigo-950/20 dark:via-neutral-900/60 dark:to-purple-950/10">
                {/* Header row */}
                <div className="mb-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100/80 px-2.5 py-1 text-[11px] font-bold tracking-wide text-indigo-600 uppercase dark:bg-indigo-900/40 dark:text-indigo-300">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-extrabold text-white">
                            {index + 1}
                        </span>
                        Pertemuan
                    </span>

                    {canRemove && (
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    {/* Stepper */}
                    <div className="shrink-0">
                        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Pertemuan Ke-
                        </label>
                        <MeetingStepper
                            value={meetingNumber}
                            onChange={onMeetingChange}
                        />
                    </div>

                    {/* Title input */}
                    <div className="min-w-0 flex-1">
                        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Judul{' '}
                            <span className="normal-case text-slate-400 dark:text-slate-500">
                                (Opsional)
                            </span>
                        </label>
                        <Input
                            type="text"
                            placeholder={`Contoh: Materi ${meetingNumber}`}
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-10 rounded-xl border-indigo-100/80 bg-white/80 px-3 text-sm transition-all focus:border-indigo-300 focus:ring-indigo-200 dark:border-indigo-500/10 dark:bg-neutral-900/60 dark:focus:border-indigo-500/40"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function WeeklyDigestForm({
    mode,
    digest,
    courses,
    constants,
}: Props) {
    const isEdit = mode === 'edit';

    // Normalize digest data for the form (arrays)
    const initialMeetings: Record<string, number[]> = {};
    const initialTitles: Record<string, string[]> = {};
    if (digest?.meetings) {
        for (const [k, v] of Object.entries(digest.meetings)) {
            initialMeetings[k] = Array.isArray(v) ? v : [v as unknown as number];
        }
    }
    if (digest?.titles) {
        for (const [k, v] of Object.entries(digest.titles)) {
            initialTitles[k] = Array.isArray(v) ? v : [v as unknown as string];
        }
    }

    const form = useForm<FormShape>({
        mata_kuliah_ids: digest?.mata_kuliah_ids?.map(String) || [],
        meetings: initialMeetings,
        titles: initialTitles,
        has_structured_task: digest?.has_structured_task ?? false,
        is_published: digest?.is_published ?? false,
    });

    const selectedCourses = courses.filter((course) =>
        form.data.mata_kuliah_ids.includes(String(course.id)),
    );

    // Count total meeting entries across all selected courses
    const totalMeetingEntries = selectedCourses.reduce((sum, c) => {
        const cid = String(c.id);
        return sum + (form.data.meetings[cid]?.length || 1);
    }, 0);

    let previewTitleSnippet = 'Materi Informasi Pekanan';
    if (selectedCourses.length === 1) {
        const cid = String(selectedCourses[0].id);
        const titles = form.data.titles[cid] || [];
        const meetings = form.data.meetings[cid] || [1];
        previewTitleSnippet =
            titles[0]?.trim() ||
            `Materi Pertemuan ${meetings[0] || 1}`;
    } else if (selectedCourses.length > 1) {
        previewTitleSnippet = 'Multi Judul dan Pertemuan';
    }

    // Handlers
    const handleCheckCourse = useCallback(
        (courseId: number, checked: boolean) => {
            const cid = String(courseId);

            if (isEdit) {
                form.setData((data) => ({
                    ...data,
                    mata_kuliah_ids: checked ? [cid] : [],
                    meetings: checked ? { [cid]: [1] } : {},
                    titles: checked ? { [cid]: [''] } : {},
                }));
                return;
            }

            if (checked) {
                form.setData((data) => ({
                    ...data,
                    mata_kuliah_ids: [...data.mata_kuliah_ids, cid],
                    meetings: { ...data.meetings, [cid]: [1] },
                    titles: { ...data.titles, [cid]: [''] },
                }));
            } else {
                const newMeetings = { ...form.data.meetings };
                const newTitles = { ...form.data.titles };
                delete newMeetings[cid];
                delete newTitles[cid];
                form.setData((data) => ({
                    ...data,
                    mata_kuliah_ids: data.mata_kuliah_ids.filter(
                        (id) => id !== cid,
                    ),
                    meetings: newMeetings,
                    titles: newTitles,
                }));
            }
        },
        [form, isEdit],
    );

    const handleAddMeeting = useCallback(
        (courseId: string) => {
            const currentMeetings = form.data.meetings[courseId] || [1];
            const currentTitles = form.data.titles[courseId] || [''];
            const lastMeeting =
                currentMeetings[currentMeetings.length - 1] || 1;

            form.setData((data) => ({
                ...data,
                meetings: {
                    ...data.meetings,
                    [courseId]: [...currentMeetings, lastMeeting + 1],
                },
                titles: {
                    ...data.titles,
                    [courseId]: [...currentTitles, ''],
                },
            }));
        },
        [form],
    );

    const handleRemoveMeeting = useCallback(
        (courseId: string, index: number) => {
            const currentMeetings = [...(form.data.meetings[courseId] || [1])];
            const currentTitles = [...(form.data.titles[courseId] || [''])];
            currentMeetings.splice(index, 1);
            currentTitles.splice(index, 1);

            form.setData((data) => ({
                ...data,
                meetings: {
                    ...data.meetings,
                    [courseId]:
                        currentMeetings.length > 0 ? currentMeetings : [1],
                },
                titles: {
                    ...data.titles,
                    [courseId]:
                        currentTitles.length > 0 ? currentTitles : [''],
                },
            }));
        },
        [form],
    );

    const handleMeetingChange = useCallback(
        (courseId: string, index: number, value: number) => {
            const currentMeetings = [...(form.data.meetings[courseId] || [1])];
            currentMeetings[index] = value;
            form.setData('meetings', {
                ...form.data.meetings,
                [courseId]: currentMeetings,
            });
        },
        [form],
    );

    const handleTitleChange = useCallback(
        (courseId: string, index: number, value: string) => {
            const currentTitles = [...(form.data.titles[courseId] || [''])];
            currentTitles[index] = value;
            form.setData('titles', {
                ...form.data.titles,
                [courseId]: currentTitles,
            });
        },
        [form],
    );

    const submitForm = (publish: boolean) => {
        form.transform((data) => ({ ...data, is_published: publish }));

        if (isEdit && digest?.id) {
            form.patch(`/admin/weekly-digest/${digest.id}`);
            return;
        }

        form.post('/admin/weekly-digest');
    };

    return (
        <AppLayout>
            <Head
                title={
                    isEdit
                        ? 'Edit Info Pekanan Mentari'
                        : 'Buat Info Pekanan Mentari'
                }
            />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ─── Header Banner ─── */}
                <motion.div
                    variants={itemVariants}
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
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative space-y-6">
                        <div className="flex justify-start">
                            <motion.button
                                type="button"
                                onClick={() =>
                                    router.get(
                                        isEdit && digest?.id
                                            ? `/admin/weekly-digest/${digest.id}`
                                            : '/admin/weekly-digest',
                                    )
                                }
                                whileHover={{ x: -4 }}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {isEdit
                                    ? 'Kembali ke Detail'
                                    : 'Kembali ke Daftar'}
                            </motion.button>
                        </div>

                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
                                    <img
                                        src={NotificationIcon}
                                        alt="Form Info Pekanan"
                                        className="h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium tracking-wide text-indigo-100">
                                        Editor Entry Mentari
                                    </p>
                                    <h1 className="mt-1 text-2xl leading-tight font-bold sm:text-3xl">
                                        {isEdit
                                            ? 'Edit Info Pekanan Mentari'
                                            : 'Buat Info Pekanan Mentari'}
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm text-indigo-100/90">
                                        Lengkapi informasi untuk rekap pekanan
                                        mahasiswa.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex w-full flex-wrap justify-center gap-2 sm:mt-0 sm:justify-start lg:w-auto lg:flex-col lg:items-end">
                                <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
                                    Kelas {constants.class_label}
                                </Badge>
                                <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
                                    {constants.platform_name}
                                </Badge>
                                <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
                                    Forum {constants.forum_posts_required}x
                                </Badge>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Form ─── */}
                <motion.form
                    variants={itemVariants}
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitForm(form.data.is_published);
                    }}
                    className="w-full"
                >
                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-6">
                            {/* ─── Input Utama Card ─── */}
                            <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg dark:border-white/10 dark:bg-neutral-900/60">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="relative flex h-12 w-12 items-center justify-center">
                                        <img
                                            src={CourseIcon}
                                            alt="Input Utama"
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Input Utama
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Bagian ini saja yang perlu admin isi
                                            manual.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <BookOpen className="h-4 w-4 text-indigo-500" />
                                            Mata Kuliah{' '}
                                            {isEdit
                                                ? '(Satu)'
                                                : '(Bisa Lebih Dari Satu)'}
                                        </label>

                                        <div className="custom-scrollbar max-h-[40rem] overflow-y-auto rounded-3xl border border-white/20 bg-white/80 p-3 shadow-inner dark:border-white/10 dark:bg-neutral-800/80">
                                            <div className="flex flex-col gap-2.5">
                                                {courses.map((course) => {
                                                    const cid = String(
                                                        course.id,
                                                    );
                                                    const isChecked =
                                                        form.data.mata_kuliah_ids.includes(
                                                            cid,
                                                        );
                                                    const courseMeetings =
                                                        form.data.meetings[
                                                            cid
                                                        ] || [1];
                                                    const courseTitles =
                                                        form.data.titles[
                                                            cid
                                                        ] || [''];

                                                    return (
                                                        <div
                                                            key={course.id}
                                                            className={cn(
                                                                'rounded-2xl border transition-all duration-300',
                                                                isChecked
                                                                    ? 'border-indigo-500/40 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/50 shadow-md shadow-indigo-500/5 dark:border-indigo-500/25 dark:from-indigo-950/30 dark:via-neutral-900/80 dark:to-purple-950/15'
                                                                    : 'border-transparent bg-white hover:bg-slate-50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800/80',
                                                            )}
                                                        >
                                                            {/* Course header — clickable */}
                                                            <label className="flex cursor-pointer items-start gap-3 p-3.5">
                                                                <Checkbox
                                                                    checked={
                                                                        isChecked
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) =>
                                                                        handleCheckCourse(
                                                                            course.id,
                                                                            checked ===
                                                                                true,
                                                                        )
                                                                    }
                                                                    className="mt-0.5"
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm leading-tight font-bold text-slate-900 dark:text-white">
                                                                        {
                                                                            course.nama
                                                                        }
                                                                    </p>
                                                                    {course.kelas && (
                                                                        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                                            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                                                                            Kelas{' '}
                                                                            {
                                                                                course.kelas
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {isChecked && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Badge className="bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                                                                            {courseMeetings.length}{' '}
                                                                            Pertemuan
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                            </label>

                                                            {/* Expanded meeting entries */}
                                                            <AnimatePresence
                                                                mode="sync"
                                                            >
                                                                {isChecked && (
                                                                    <motion.div
                                                                        initial={{
                                                                            opacity: 0,
                                                                            height: 0,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            height: 'auto',
                                                                        }}
                                                                        exit={{
                                                                            opacity: 0,
                                                                            height: 0,
                                                                        }}
                                                                        transition={{
                                                                            type: 'spring',
                                                                            stiffness: 300,
                                                                            damping: 28,
                                                                        }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="space-y-2 px-3.5 pb-3.5">
                                                                            {/* Divider */}
                                                                            <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent dark:via-indigo-800/40" />

                                                                            {/* Meeting entries */}
                                                                            <AnimatePresence mode="sync">
                                                                                {courseMeetings.map(
                                                                                    (
                                                                                        meetNum,
                                                                                        idx,
                                                                                    ) => (
                                                                                        <MeetingEntry
                                                                                            key={`${cid}-meeting-${idx}`}
                                                                                            courseId={
                                                                                                cid
                                                                                            }
                                                                                            index={
                                                                                                idx
                                                                                            }
                                                                                            meetingNumber={
                                                                                                meetNum
                                                                                            }
                                                                                            title={
                                                                                                courseTitles[
                                                                                                    idx
                                                                                                ] ||
                                                                                                ''
                                                                                            }
                                                                                            canRemove={
                                                                                                courseMeetings.length >
                                                                                                1
                                                                                            }
                                                                                            onMeetingChange={(
                                                                                                val,
                                                                                            ) =>
                                                                                                handleMeetingChange(
                                                                                                    cid,
                                                                                                    idx,
                                                                                                    val,
                                                                                                )
                                                                                            }
                                                                                            onTitleChange={(
                                                                                                val,
                                                                                            ) =>
                                                                                                handleTitleChange(
                                                                                                    cid,
                                                                                                    idx,
                                                                                                    val,
                                                                                                )
                                                                                            }
                                                                                            onRemove={() =>
                                                                                                handleRemoveMeeting(
                                                                                                    cid,
                                                                                                    idx,
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    ),
                                                                                )}
                                                                            </AnimatePresence>

                                                                            {/* Add meeting button */}
                                                                            <motion.button
                                                                                type="button"
                                                                                whileHover={{
                                                                                    scale: 1.02,
                                                                                }}
                                                                                whileTap={{
                                                                                    scale: 0.98,
                                                                                }}
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    handleAddMeeting(
                                                                                        cid,
                                                                                    );
                                                                                }}
                                                                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 px-4 py-2.5 text-xs font-bold text-indigo-500 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-700/30 dark:text-indigo-400 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/20"
                                                                            >
                                                                                <Plus className="h-3.5 w-3.5" />
                                                                                Tambah
                                                                                Pertemuan
                                                                            </motion.button>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {form.errors.mata_kuliah_ids && (
                                            <p className="text-sm font-medium text-rose-600">
                                                {form.errors.mata_kuliah_ids}
                                            </p>
                                        )}
                                    </div>

                                    {/* ─── Checkboxes ─── */}
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={
                                                        form.data
                                                            .has_structured_task
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        form.setData(
                                                            'has_structured_task',
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        Ada tugas terstruktur
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Centang jika materi ini
                                                        juga diikuti tugas
                                                        terstruktur di Mentari.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={
                                                        form.data.is_published
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        form.setData(
                                                            'is_published',
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        Publish sekarang
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Jika aktif, entry ini
                                                        langsung muncul pada
                                                        rekap mingguan
                                                        mahasiswa.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Ringkasan Pilihan Card ─── */}
                            <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg dark:border-white/10 dark:bg-neutral-900/60">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="relative flex h-12 w-12 items-center justify-center">
                                        <img
                                            src={TotalNotificationIcon}
                                            alt="Ringkasan"
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            Ringkasan Pilihan
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Overview entry yang akan dibuat.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Mata Kuliah Terpilih
                                            </p>
                                            <span
                                                className={cn(
                                                    'text-lg font-extrabold',
                                                    selectedCourses.length > 0
                                                        ? 'text-indigo-600 dark:text-indigo-400'
                                                        : 'text-slate-400',
                                                )}
                                            >
                                                {selectedCourses.length}
                                            </span>
                                        </div>
                                        {selectedCourses.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {selectedCourses.map((c) => {
                                                    const cid = String(c.id);
                                                    const meetings =
                                                        form.data.meetings[
                                                            cid
                                                        ] || [1];
                                                    return (
                                                        <div
                                                            key={c.id}
                                                            className="rounded-xl bg-slate-50/80 p-2.5 dark:bg-neutral-800/40"
                                                        >
                                                            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                                <span className="truncate">
                                                                    {c.nama}
                                                                </span>
                                                            </p>
                                                            <div className="mt-1.5 flex flex-wrap gap-1 pl-5">
                                                                {meetings.map(
                                                                    (
                                                                        m,
                                                                        idx,
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                                        >
                                                                            Pertemuan{' '}
                                                                            {m}
                                                                        </Badge>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="rounded-2xl border border-white/20 bg-white/80 p-3 text-center dark:border-white/10 dark:bg-neutral-950/30">
                                            <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                Total Entry
                                            </p>
                                            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                                                {totalMeetingEntries}
                                            </span>
                                        </div>
                                        <div className="rounded-2xl border border-white/20 bg-white/80 p-3 text-center dark:border-white/10 dark:bg-neutral-950/30">
                                            <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                Tugas
                                            </p>
                                            <Badge
                                                className={cn(
                                                    form.data
                                                        .has_structured_task
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                                                )}
                                            >
                                                {form.data.has_structured_task
                                                    ? 'Ya'
                                                    : 'Tidak'}
                                            </Badge>
                                        </div>
                                        <div className="rounded-2xl border border-white/20 bg-white/80 p-3 text-center dark:border-white/10 dark:bg-neutral-950/30">
                                            <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                Status
                                            </p>
                                            <Badge
                                                className={cn(
                                                    form.data.is_published
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                                )}
                                            >
                                                {form.data.is_published
                                                    ? 'Publish'
                                                    : 'Draft'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Tips & Panduan Card ─── */}
                            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-lg dark:border-emerald-900/30 dark:bg-emerald-950/20">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                                        <Type className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Tips & Panduan
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Petunjuk membuat info pekanan.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    {[
                                        {
                                            text: 'Pilih satu atau lebih mata kuliah yang materinya sudah masuk ke Mentari.',
                                            color: 'bg-emerald-500',
                                        },
                                        {
                                            text: 'Isi nomor pertemuan menggunakan tombol − dan + yang tersedia.',
                                            color: 'bg-teal-500',
                                        },
                                        {
                                            text: 'Klik "+ Tambah Pertemuan" untuk menambah pertemuan kedua di satu mata kuliah.',
                                            color: 'bg-cyan-500',
                                        },
                                        {
                                            text: 'Judul opsional bisa diisi untuk keterangan tambahan.',
                                            color: 'bg-blue-500',
                                        },
                                        {
                                            text: 'Centang "Tugas Terstruktur" jika materi ada tugas di Mentari.',
                                            color: 'bg-indigo-500',
                                        },
                                        {
                                            text: 'Draft bisa diedit kapan saja sebelum di-publish.',
                                            color: 'bg-violet-500',
                                        },
                                    ].map((tip, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-2.5"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                                                    tip.color,
                                                )}
                                            />
                                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                                {tip.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ─── Right Column ─── */}
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-lg dark:border-white/10 dark:bg-neutral-900/60">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="relative flex h-12 w-12 items-center justify-center">
                                        <img
                                            src={SettingsIcon}
                                            alt="Sistem Otomatis"
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Sistem Otomatis
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Admin tidak perlu mengisi field
                                            teknis tambahan.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <InfoCard
                                        label="Label Kelas"
                                        value={constants.class_label}
                                        helper="Tetap dan tidak bisa diubah."
                                    />
                                    <InfoCard
                                        label="Platform"
                                        value={constants.platform_name}
                                        helper="Semua entry selalu diarahkan ke Mentari."
                                    />
                                    <InfoCard
                                        label="Portal"
                                        value={constants.platform_url}
                                        helper="URL platform diset permanen oleh sistem."
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/80 p-5 shadow-lg dark:border-cyan-900/30 dark:bg-cyan-950/20">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="relative flex h-12 w-12 items-center justify-center">
                                        <img
                                            src={TaskInfoIcon}
                                            alt="Aturan Kehadiran"
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Aturan Kehadiran
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Ini poin yang nanti dibaca
                                            mahasiswa.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-900/40">
                                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                                        Submit forum diskusi{' '}
                                        {constants.forum_posts_required}x
                                    </Badge>
                                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                                        Kehadiran diperoleh jika mahasiswa
                                        submit forum diskusi sebanyak{' '}
                                        {constants.forum_posts_required} kali
                                        pada materi yang sudah masuk ke Mentari.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-lg dark:border-white/10 dark:bg-neutral-900/60">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="relative flex h-12 w-12 items-center justify-center">
                                        <img
                                            src={SessionStatIcon}
                                            alt="Preview Ringkas"
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Preview Ringkas
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Seperti bahasa tampilan di dashboard
                                            dosen: singkat, jelas, dan langsung
                                            terbaca.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-2xl">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.2em] text-indigo-200/80 uppercase">
                                            Entry Pekanan
                                        </p>
                                        <p className="mt-2 text-xl font-bold">
                                            {selectedCourses.length > 0
                                                ? selectedCourses.length > 1
                                                    ? `${selectedCourses.length} Mata Kuliah Terpilih`
                                                    : selectedCourses[0].nama
                                                : 'Pilih mata kuliah'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            {previewTitleSnippet}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="border-white/10 bg-white/10 text-white">
                                            {totalMeetingEntries} Pertemuan
                                        </Badge>
                                        <Badge className="border-white/10 bg-white/10 text-white">
                                            {constants.class_label}
                                        </Badge>
                                        <Badge
                                            className={cn(
                                                'border-white/10 text-white',
                                                form.data.has_structured_task
                                                    ? 'bg-amber-500/80'
                                                    : 'bg-slate-500/60',
                                            )}
                                        >
                                            {form.data.has_structured_task
                                                ? 'Ada Tugas Terstruktur'
                                                : 'Tanpa Tugas Terstruktur'}
                                        </Badge>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-sm leading-7 text-slate-200">
                                            Materi sudah masuk di{' '}
                                            {constants.platform_name}. Mahasiswa
                                            wajib submit forum diskusi{' '}
                                            {constants.forum_posts_required}x
                                            untuk mendapatkan kehadiran.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Submit Buttons ─── */}
                    <div className="flex flex-col gap-3 px-6 pt-2 pb-6 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 rounded-2xl border-white/20 bg-white/80 px-6 font-bold dark:border-white/10 dark:bg-neutral-900/60"
                            onClick={() => submitForm(false)}
                            disabled={form.processing}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Draft
                        </Button>
                        <Button
                            type="submit"
                            className="h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                            disabled={form.processing}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {form.data.is_published
                                ? 'Simpan dan Publish'
                                : 'Simpan Entry'}
                        </Button>
                    </div>
                </motion.form>
            </motion.div>
        </AppLayout>
    );
}

function InfoCard({
    label,
    value,
    helper,
}: {
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {value}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {helper}
            </p>
        </div>
    );
}
