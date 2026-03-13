import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    FileText,
    Layers,
    ListChecks,
    Plus,
    Save,
    Shuffle,
    Sparkles,
    Trash2,
    UserPlus,
    Users2,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

type Course = {
    id: number;
    nama: string;
    dosen_id: number | null;
};

type Dosen = {
    id: number;
    nama: string;
};

type Student = {
    id: number;
    nama: string;
    nim: string | null;
};

type ManualGroup = {
    temp_id: string;
    name: string;
    leader_id: string;
    member_ids: string[];
};

type Props = {
    courses: Course[];
    dosens: Dosen[];
    courseStudents: Record<string, Student[]>;
};

type WorkflowForm = {
    dosen_id: string;
    course_id: string;
    title: string;
    description: string;
    formation_mode: 'self-form' | 'random' | 'manual';
    grading_mode: 'same' | 'individual' | 'peer' | 'contribution';
    min_members: number;
    max_members: number;
    formation_deadline: string;
    submission_deadline: string;
    max_file_size_mb: number;
    peer_evaluation_weight: number;
    contribution_threshold: number;
    allow_resubmission: boolean;
    features: string[];
    random_group_count: number;
    random_group_size: number;
    self_form_group_count: number;
    self_form_group_size: number;
    manual_groups: ManualGroup[];
    return_to_workflow: boolean;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 320, damping: 25 },
    },
};

const steps = [
    { id: 1, label: 'Informasi Dasar', icon: FileText },
    { id: 2, label: 'Mode Kelompok', icon: Layers },
    { id: 3, label: 'Konfigurasi Mode', icon: Users2 },
    { id: 4, label: 'Review', icon: ListChecks },
] as const;

const formationOptions = [
    {
        value: 'manual' as const,
        label: 'Manual',
        desc: 'Admin susun anggota dan ketua per kelompok',
        tone: 'from-violet-500 to-fuchsia-500',
    },
    {
        value: 'random' as const,
        label: 'Random Cepat',
        desc: 'Sistem bagi otomatis dengan jumlah kelompok yang ditentukan',
        tone: 'from-blue-500 to-cyan-500',
    },
    {
        value: 'self-form' as const,
        label: 'Self Form',
        desc: 'Mahasiswa membentuk kelompok sendiri',
        tone: 'from-emerald-500 to-teal-500',
    },
];

const gradingModes = [
    { value: 'same', label: 'Nilai Sama' },
    { value: 'individual', label: 'Nilai Individual' },
    { value: 'peer', label: 'Peer Evaluation' },
    { value: 'contribution', label: 'Contribution Based' },
] as const;

const featureOptions = [
    { key: 'chat', label: 'Chat Kelompok' },
    { key: 'tasks', label: 'Task List' },
    { key: 'file_upload', label: 'Upload File' },
    { key: 'peer_eval', label: 'Peer Evaluation' },
    { key: 'conflict_report', label: 'Laporan Konflik' },
];

const createManualGroup = (): ManualGroup => ({
    temp_id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: '',
    leader_id: '',
    member_ids: [],
});

export default function AdminTugasKelompokWorkflow({
    courses,
    dosens,
    courseStudents,
}: Props) {
    const [step, setStep] = useState<number>(1);
    const [localError, setLocalError] = useState<string>('');

    const { data, setData, post, processing, errors, reset, transform } =
        useForm<WorkflowForm>({
            dosen_id: '',
            course_id: '',
            title: '',
            description: '',
            formation_mode: 'manual',
            grading_mode: 'same',
            min_members: 2,
            max_members: 5,
            formation_deadline: '',
            submission_deadline: '',
            max_file_size_mb: 25,
            peer_evaluation_weight: 0.3,
            contribution_threshold: 0.3,
            allow_resubmission: false,
            features: ['chat', 'tasks', 'file_upload'],
            random_group_count: 2,
            random_group_size: 4,
            self_form_group_count: 2,
            self_form_group_size: 4,
            manual_groups: [],
            return_to_workflow: true,
        });

    const selectedCourse = useMemo(
        () =>
            courses.find((course) => String(course.id) === data.course_id) ??
            null,
        [courses, data.course_id],
    );

    const selectedDosen = useMemo(
        () =>
            dosens.find((dosen) => String(dosen.id) === data.dosen_id) ?? null,
        [dosens, data.dosen_id],
    );

    const filteredCourses = useMemo(() => {
        if (!data.dosen_id) return courses;
        return courses.filter(
            (course) => String(course.dosen_id ?? '') === data.dosen_id,
        );
    }, [courses, data.dosen_id]);

    const selectedCourseStudents = useMemo(
        () => courseStudents[data.course_id] ?? [],
        [courseStudents, data.course_id],
    );

    const recommendedConfig = useMemo(() => {
        const total = selectedCourseStudents.length;
        if (total <= 0) {
            return {
                totalStudents: 0,
                balancedSize: 4,
                balancedGroupCount: 2,
            };
        }

        const balancedSize = Math.max(
            2,
            Math.min(8, total <= 12 ? 3 : total <= 30 ? 4 : 5),
        );
        const balancedGroupCount = Math.max(1, Math.ceil(total / balancedSize));
        return {
            totalStudents: total,
            balancedSize,
            balancedGroupCount,
        };
    }, [selectedCourseStudents.length]);

    const assignedMemberIds = useMemo(() => {
        return new Set(
            data.manual_groups
                .flatMap((group) => group.member_ids)
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id)),
        );
    }, [data.manual_groups]);

    const unassignedStudents = useMemo(
        () =>
            selectedCourseStudents.filter(
                (student) => !assignedMemberIds.has(student.id),
            ),
        [selectedCourseStudents, assignedMemberIds],
    );

    const stepOneComplete = Boolean(
        data.dosen_id && data.course_id && data.title.trim(),
    );
    const stepTwoComplete = Boolean(
        data.formation_mode &&
            data.min_members >= 2 &&
            data.max_members >= data.min_members,
    );

    const validateManualGroups = (): string | null => {
        if (!data.manual_groups.length) {
            return 'Mode manual membutuhkan minimal 1 kelompok.';
        }

        const used = new Set<string>();
        for (let i = 0; i < data.manual_groups.length; i += 1) {
            const group = data.manual_groups[i];
            const groupLabel = group.name.trim() || `Kelompok ${i + 1}`;

            if (!group.name.trim()) {
                return `Nama ${groupLabel} wajib diisi.`;
            }

            const members = Array.from(new Set(group.member_ids));
            if (!group.leader_id) {
                return `Ketua untuk ${groupLabel} wajib dipilih.`;
            }
            if (!members.includes(group.leader_id)) {
                return `Ketua ${groupLabel} harus termasuk anggota kelompok.`;
            }

            if (
                members.length < data.min_members ||
                members.length > data.max_members
            ) {
                return `Jumlah anggota ${groupLabel} harus ${data.min_members}-${data.max_members}.`;
            }

            for (const memberId of members) {
                if (used.has(memberId)) {
                    return 'Satu mahasiswa hanya boleh berada di satu kelompok.';
                }
                used.add(memberId);
            }
        }

        return null;
    };

    const validateStep = (targetStep: number): string | null => {
        if (targetStep <= 1) return null;
        if (!stepOneComplete)
            return 'Lengkapi informasi dasar terlebih dahulu.';
        if (targetStep <= 2) return null;
        if (!stepTwoComplete)
            return 'Lengkapi mode kelompok dan jumlah anggota.';
        if (targetStep <= 3) return null;

        if (data.formation_mode === 'random') {
            if (data.random_group_count < 1)
                return 'Jumlah kelompok random minimal 1.';
            if (
                data.random_group_size < data.min_members ||
                data.random_group_size > data.max_members
            ) {
                return `Anggota per kelompok random harus ${data.min_members}-${data.max_members}.`;
            }
        }

        if (data.formation_mode === 'manual') {
            return validateManualGroups();
        }

        if (data.formation_mode === 'self-form') {
            if (data.self_form_group_count < 1) {
                return 'Jumlah kelompok self-form minimal 1.';
            }
            if (
                data.self_form_group_size < data.min_members ||
                data.self_form_group_size > data.max_members
            ) {
                return `Anggota per kelompok self-form harus ${data.min_members}-${data.max_members}.`;
            }
        }

        return null;
    };

    const canGoToStep = (targetStep: number): boolean => {
        if (targetStep <= step) return true;
        return !validateStep(targetStep);
    };

    const handleDosenChange = (value: string) => {
        setData('dosen_id', value);
        setData('manual_groups', []);
    };

    useEffect(() => {
        if (!data.dosen_id) {
            if (data.course_id) setData('course_id', '');
            return;
        }

        const dosenCourses = courses.filter(
            (course) => String(course.dosen_id ?? '') === data.dosen_id,
        );
        const nextCourseId = dosenCourses[0] ? String(dosenCourses[0].id) : '';
        if (data.course_id !== nextCourseId) {
            setData('course_id', nextCourseId);
        }
    }, [data.dosen_id, data.course_id, courses, setData]);

    const toDateTimeLocal = (date: Date) => {
        const pad = (value: number) => String(value).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const applySmartRecommendation = (mode: 'balanced' | 'collab' | 'fast') => {
        const total = recommendedConfig.totalStudents;
        const baseSize = recommendedConfig.balancedSize;

        let targetSize = baseSize;
        if (mode === 'collab') targetSize = Math.max(2, baseSize - 1);
        if (mode === 'fast') targetSize = Math.min(10, baseSize + 1);

        const targetCount = Math.max(
            1,
            Math.ceil((total || targetSize) / targetSize),
        );
        const minMembers = Math.max(2, targetSize - 1);
        const maxMembers = Math.max(minMembers, Math.min(12, targetSize + 1));

        setData('min_members', minMembers);
        setData('max_members', maxMembers);
        setData('random_group_size', targetSize);
        setData('random_group_count', targetCount);
        setData('self_form_group_size', targetSize);
        setData('self_form_group_count', targetCount);

        if (!data.formation_deadline) {
            const formationDate = new Date();
            formationDate.setDate(formationDate.getDate() + 3);
            setData('formation_deadline', toDateTimeLocal(formationDate));
        }

        if (!data.submission_deadline) {
            const submissionDate = new Date();
            submissionDate.setDate(submissionDate.getDate() + 10);
            setData('submission_deadline', toDateTimeLocal(submissionDate));
        }
    };

    const addManualGroup = () => {
        setData('manual_groups', [...data.manual_groups, createManualGroup()]);
    };

    const removeManualGroup = (tempId: string) => {
        setData(
            'manual_groups',
            data.manual_groups.filter((group) => group.temp_id !== tempId),
        );
    };

    const updateManualGroup = (tempId: string, patch: Partial<ManualGroup>) => {
        setData(
            'manual_groups',
            data.manual_groups.map((group) =>
                group.temp_id === tempId ? { ...group, ...patch } : group,
            ),
        );
    };

    const toggleMember = (tempId: string, studentId: string) => {
        const target = data.manual_groups.find(
            (group) => group.temp_id === tempId,
        );
        if (!target) return;

        const exists = target.member_ids.includes(studentId);
        const nextMembers = exists
            ? target.member_ids.filter((id) => id !== studentId)
            : [...target.member_ids, studentId];

        const patch: Partial<ManualGroup> = { member_ids: nextMembers };
        if (!nextMembers.includes(target.leader_id)) {
            patch.leader_id = nextMembers[0] ?? '';
        }
        updateManualGroup(tempId, patch);
    };

    const autoSeedManualGroups = () => {
        if (!selectedCourseStudents.length) return;

        const groupCount = Math.max(1, data.random_group_count || 1);
        const groupSize = Math.max(
            data.min_members,
            Math.min(
                data.max_members,
                data.random_group_size || data.max_members,
            ),
        );
        const shuffled = [...selectedCourseStudents].sort(
            () => Math.random() - 0.5,
        );
        const buckets: Student[][] = Array.from(
            { length: groupCount },
            () => [],
        );

        for (const student of shuffled) {
            let target = 0;
            for (let i = 1; i < buckets.length; i += 1) {
                if (buckets[i].length < buckets[target].length) target = i;
            }
            buckets[target].push(student);
        }

        const groups = buckets
            .filter((bucket) => bucket.length > 0)
            .map((bucket, index) => {
                const limited = bucket.slice(0, groupSize);
                return {
                    temp_id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
                    name: `Kelompok ${index + 1}`,
                    leader_id: String(limited[0]?.id ?? ''),
                    member_ids: limited.map((item) => String(item.id)),
                };
            });

        setData('manual_groups', groups);
    };

    const toggleFeature = (key: string) => {
        if (data.features.includes(key)) {
            setData(
                'features',
                data.features.filter((item) => item !== key),
            );
            return;
        }
        setData('features', [...data.features, key]);
    };

    const goNext = () => {
        const error = validateStep(step + 1);
        if (error) {
            setLocalError(error);
            return;
        }
        setLocalError('');
        setStep((current) => Math.min(4, current + 1));
    };

    const goPrev = () => {
        setLocalError('');
        setStep((current) => Math.max(1, current - 1));
    };

    const handleSubmit = () => {
        const reviewError = validateStep(4);
        if (reviewError) {
            setLocalError(reviewError);
            return;
        }

        setLocalError('');
        transform((payload: WorkflowForm) => ({
            ...payload,
            return_to_workflow: true,
            dosen_id: Number(payload.dosen_id),
            course_id: Number(payload.course_id),
            min_members: Number(payload.min_members),
            max_members: Number(payload.max_members),
            max_file_size_mb: Number(payload.max_file_size_mb),
            peer_evaluation_weight: Number(payload.peer_evaluation_weight),
            contribution_threshold: Number(payload.contribution_threshold),
            random_group_count:
                payload.formation_mode === 'random'
                    ? Number(payload.random_group_count)
                    : null,
            random_group_size:
                payload.formation_mode === 'random'
                    ? Number(payload.random_group_size)
                    : null,
            self_form_group_count:
                payload.formation_mode === 'self-form'
                    ? Number(payload.self_form_group_count)
                    : null,
            self_form_group_size:
                payload.formation_mode === 'self-form'
                    ? Number(payload.self_form_group_size)
                    : null,
            manual_groups:
                payload.formation_mode === 'manual'
                    ? payload.manual_groups.map((group: ManualGroup) => ({
                          name: group.name.trim(),
                          leader_id: Number(group.leader_id),
                          member_ids: group.member_ids.map((id: string) =>
                              Number(id),
                          ),
                      }))
                    : null,
        }));

        post('/admin/tugas-kelompok', {
            onSuccess: () => {
                setLocalError('');
                window.location.assign('/admin/tugas-kelompok');
            },
            onError: (formErrors) => {
                const firstError = Object.values(formErrors)[0];
                setLocalError(
                    typeof firstError === 'string'
                        ? firstError
                        : 'Ada data yang belum valid. Periksa kembali isian.',
                );
            },
        });
    };

    const headerModeText =
        data.formation_mode === 'manual'
            ? 'Manual oleh Admin'
            : data.formation_mode === 'random'
              ? 'Random Otomatis'
              : 'Self Form oleh Mahasiswa';

    return (
        <AppLayout>
            <Head title="Workflow Tugas Kelompok" />

            <motion.div
                className="space-y-6 p-4 md:p-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.section
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-7"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <button
                            type="button"
                            onClick={() =>
                                router.visit('/admin/tugas-kelompok')
                            }
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Tugas Kelompok
                        </button>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                                    <img
                                        src={TugasIcon}
                                        alt="Workflow Tugas Kelompok"
                                        className="h-full w-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wide text-indigo-100">
                                        Workflow Terhubung Admin-Dosen-Mahasiswa
                                    </p>
                                    <h1 className="text-2xl font-bold sm:text-3xl">
                                        Buat Tugas Kelompok
                                    </h1>
                                    <p className="mt-1 text-sm text-indigo-100/90">
                                        Mode aktif: {headerModeText}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-xl">
                                <p className="text-xs text-indigo-100/90">
                                    Progress
                                </p>
                                <p className="text-lg font-bold">{step}/4</p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="inline-flex min-w-max items-center gap-2">
                            {steps.map((stepItem, idx) => {
                                const StepIcon = stepItem.icon;
                                const isActive = step === stepItem.id;
                                const isDone = step > stepItem.id;
                                const canOpen = canGoToStep(stepItem.id);

                                return (
                                    <div
                                        key={stepItem.id}
                                        className="inline-flex items-center gap-2"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!canOpen) return;
                                                setLocalError('');
                                                setStep(stepItem.id);
                                            }}
                                            className={cn(
                                                'inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all',
                                                isActive
                                                    ? 'border-fuchsia-200 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                                                    : isDone
                                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                                                      : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-neutral-800 dark:text-slate-300',
                                                !canOpen &&
                                                    'cursor-not-allowed opacity-60',
                                            )}
                                        >
                                            {isDone ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <StepIcon className="h-4 w-4" />
                                            )}
                                            <span className="whitespace-nowrap">
                                                {stepItem.label}
                                            </span>
                                        </button>
                                        {idx < steps.length - 1 && (
                                            <ChevronRight className="h-4 w-4 text-slate-400" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>

                {(localError || Object.keys(errors).length > 0) && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-rose-300/40 bg-rose-50/70 px-4 py-3 text-sm text-rose-700 backdrop-blur-sm dark:border-rose-700/40 dark:bg-rose-900/20 dark:text-rose-200"
                    >
                        {localError ||
                            'Beberapa field belum valid. Periksa form di bawah.'}
                    </motion.div>
                )}

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Informasi Dasar
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Dosen Pengampu</Label>
                                    <select
                                        value={data.dosen_id}
                                        onChange={(event) =>
                                            handleDosenChange(
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-xl border border-slate-300 bg-white/80 px-3 text-sm dark:border-slate-700 dark:bg-neutral-800"
                                    >
                                        <option value="">Pilih dosen</option>
                                        {dosens.map((dosen) => (
                                            <option
                                                key={dosen.id}
                                                value={String(dosen.id)}
                                            >
                                                {dosen.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.dosen_id && (
                                        <p className="text-xs text-rose-500">
                                            {errors.dosen_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Mata Kuliah</Label>
                                    <Input
                                        value={selectedCourse?.nama ?? ''}
                                        readOnly
                                        placeholder="Pilih dosen terlebih dahulu"
                                        className="h-10 w-full rounded-xl border-slate-300 bg-slate-100/90 text-slate-700 dark:border-slate-700 dark:bg-neutral-800/80 dark:text-slate-200"
                                    />
                                    {errors.course_id && (
                                        <p className="text-xs text-rose-500">
                                            {errors.course_id}
                                        </p>
                                    )}
                                    {data.dosen_id &&
                                        filteredCourses.length === 0 && (
                                            <p className="text-xs text-amber-500">
                                                Belum ada mata kuliah terhubung
                                                ke dosen ini.
                                            </p>
                                        )}
                                    {data.dosen_id &&
                                        filteredCourses.length > 1 &&
                                        selectedCourse && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Otomatis memakai mata kuliah
                                                utama dosen:{' '}
                                                {selectedCourse.nama} (
                                                {filteredCourses.length} mata
                                                kuliah terdeteksi).
                                            </p>
                                        )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 dark:border-indigo-700/40 dark:bg-indigo-900/20">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-200">
                                            <Sparkles className="h-4 w-4" />
                                            Rekomendasi Otomatis
                                        </p>
                                        <p className="mt-1 text-xs text-indigo-600/90 dark:text-indigo-300/90">
                                            Dosen terpilih:{' '}
                                            {selectedDosen?.nama ?? '-'} •
                                            Mahasiswa terdeteksi:{' '}
                                            {recommendedConfig.totalStudents}
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                                        <CalendarClock className="h-3.5 w-3.5" />
                                        Deadline default akan diisi otomatis
                                        bila kosong
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            applySmartRecommendation('collab')
                                        }
                                        className="justify-center rounded-xl border-indigo-300 bg-white/80 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                                    >
                                        Kolaboratif
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            applySmartRecommendation('balanced')
                                        }
                                        className="justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                    >
                                        Balanced
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            applySmartRecommendation('fast')
                                        }
                                        className="justify-center rounded-xl border-indigo-300 bg-white/80 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                                    >
                                        Cepat Eksekusi
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Judul Tugas</Label>
                                <Input
                                    value={data.title}
                                    onChange={(event) =>
                                        setData('title', event.target.value)
                                    }
                                    placeholder="Contoh: Proyek Akhir Sistem Informasi"
                                />
                                {errors.title && (
                                    <p className="text-xs text-rose-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Deskripsi</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={4}
                                    placeholder="Tujuan tugas, output yang diminta, dan standar penilaian."
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Deadline Pembentukan Kelompok</Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.formation_deadline}
                                        onChange={(event) =>
                                            setData(
                                                'formation_deadline',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Deadline Pengumpulan</Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.submission_deadline}
                                        onChange={(event) =>
                                            setData(
                                                'submission_deadline',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {errors.submission_deadline && (
                                        <p className="text-xs text-rose-500">
                                            {errors.submission_deadline}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Mode Kelompok
                            </h2>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                {formationOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'formation_mode',
                                                option.value,
                                            )
                                        }
                                        className={cn(
                                            'rounded-2xl border p-4 text-left transition-all',
                                            data.formation_mode === option.value
                                                ? 'border-purple-300 bg-purple-50/70 shadow-lg dark:border-purple-600 dark:bg-purple-900/30'
                                                : 'border-slate-200 bg-white/70 hover:border-purple-200 dark:border-slate-700 dark:bg-neutral-800',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'mb-3 inline-flex rounded-xl bg-gradient-to-r px-2.5 py-1 text-xs font-semibold text-white',
                                                option.tone,
                                            )}
                                        >
                                            {option.label}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            {option.desc}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Minimal Anggota per Kelompok</Label>
                                    <Input
                                        type="number"
                                        min={2}
                                        max={20}
                                        value={data.min_members}
                                        onChange={(event) =>
                                            setData(
                                                'min_members',
                                                Number(event.target.value || 2),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Maksimal Anggota per Kelompok</Label>
                                    <Input
                                        type="number"
                                        min={2}
                                        max={20}
                                        value={data.max_members}
                                        onChange={(event) =>
                                            setData(
                                                'max_members',
                                                Number(event.target.value || 2),
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Mode Penilaian</Label>
                                <select
                                    value={data.grading_mode}
                                    onChange={(event) =>
                                        setData(
                                            'grading_mode',
                                            event.target
                                                .value as WorkflowForm['grading_mode'],
                                        )
                                    }
                                    className="h-10 w-full rounded-xl border border-slate-300 bg-white/80 px-3 text-sm dark:border-slate-700 dark:bg-neutral-800"
                                >
                                    {gradingModes.map((mode) => (
                                        <option
                                            key={mode.value}
                                            value={mode.value}
                                        >
                                            {mode.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Konfigurasi Mode
                            </h2>

                            {data.formation_mode === 'random' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label>Jumlah Kelompok</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={data.random_group_count}
                                                onChange={(event) =>
                                                    setData(
                                                        'random_group_count',
                                                        Number(
                                                            event.target
                                                                .value || 1,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Anggota per Kelompok</Label>
                                            <Input
                                                type="number"
                                                min={data.min_members}
                                                max={data.max_members}
                                                value={data.random_group_size}
                                                onChange={(event) =>
                                                    setData(
                                                        'random_group_size',
                                                        Number(
                                                            event.target
                                                                .value ||
                                                                data.max_members,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-sky-200/60 bg-sky-50/70 p-3 text-sm text-sky-700 dark:border-sky-700/50 dark:bg-sky-900/20 dark:text-sky-200">
                                        Setelah disimpan, sistem otomatis
                                        membentuk kelompok acak dan langsung
                                        mengunci formasi.
                                    </div>
                                </div>
                            )}

                            {data.formation_mode === 'manual' && (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={addManualGroup}
                                            className="rounded-xl"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Kelompok
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={autoSeedManualGroups}
                                            className="rounded-xl"
                                        >
                                            <Shuffle className="mr-2 h-4 w-4" />
                                            Isi Otomatis & Edit
                                        </Button>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Mahasiswa tersedia:{' '}
                                            {selectedCourseStudents.length} •
                                            Belum terpakai:{' '}
                                            {unassignedStudents.length}
                                        </p>
                                    </div>

                                    {data.manual_groups.length === 0 && (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-neutral-800 dark:text-slate-300">
                                            Belum ada kelompok manual. Klik{' '}
                                            <span className="font-semibold">
                                                Tambah Kelompok
                                            </span>{' '}
                                            untuk mulai mengatur anggota dan
                                            ketua.
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {data.manual_groups.map(
                                            (group, index) => (
                                                <div
                                                    key={group.temp_id}
                                                    className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-neutral-800/70"
                                                >
                                                    <div className="mb-3 flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                            Kelompok {index + 1}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeManualGroup(
                                                                    group.temp_id,
                                                                )
                                                            }
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300 text-rose-500 transition hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-900/30"
                                                            aria-label="Hapus kelompok"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        <div className="space-y-1.5">
                                                            <Label>
                                                                Nama Kelompok
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    group.name
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateManualGroup(
                                                                        group.temp_id,
                                                                        {
                                                                            name: event
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder={`Kelompok ${index + 1}`}
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label>
                                                                Ketua Kelompok
                                                            </Label>
                                                            <select
                                                                value={
                                                                    group.leader_id
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    const leaderId =
                                                                        event
                                                                            .target
                                                                            .value;
                                                                    const members =
                                                                        group.member_ids.includes(
                                                                            leaderId,
                                                                        )
                                                                            ? group.member_ids
                                                                            : [
                                                                                  ...group.member_ids,
                                                                                  leaderId,
                                                                              ];
                                                                    updateManualGroup(
                                                                        group.temp_id,
                                                                        {
                                                                            leader_id:
                                                                                leaderId,
                                                                            member_ids:
                                                                                members.filter(
                                                                                    Boolean,
                                                                                ),
                                                                        },
                                                                    );
                                                                }}
                                                                className="h-10 w-full rounded-xl border border-slate-300 bg-white/90 px-3 text-sm dark:border-slate-700 dark:bg-neutral-800"
                                                            >
                                                                <option value="">
                                                                    Pilih ketua
                                                                </option>
                                                                {selectedCourseStudents.map(
                                                                    (
                                                                        student,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                student.id
                                                                            }
                                                                            value={String(
                                                                                student.id,
                                                                            )}
                                                                        >
                                                                            {
                                                                                student.nama
                                                                            }{' '}
                                                                            {student.nim
                                                                                ? `(${student.nim})`
                                                                                : ''}
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3">
                                                        <Label className="mb-2 block">
                                                            Anggota Kelompok
                                                        </Label>
                                                        <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-neutral-900">
                                                            {selectedCourseStudents.length ===
                                                                0 && (
                                                                <p className="text-xs text-slate-500">
                                                                    Pilih mata
                                                                    kuliah
                                                                    terlebih
                                                                    dahulu untuk
                                                                    menampilkan
                                                                    mahasiswa.
                                                                </p>
                                                            )}

                                                            {selectedCourseStudents.map(
                                                                (student) => {
                                                                    const idValue =
                                                                        String(
                                                                            student.id,
                                                                        );
                                                                    const checked =
                                                                        group.member_ids.includes(
                                                                            idValue,
                                                                        );
                                                                    const usedInOtherGroup =
                                                                        data.manual_groups.some(
                                                                            (
                                                                                other,
                                                                            ) =>
                                                                                other.temp_id !==
                                                                                    group.temp_id &&
                                                                                other.member_ids.includes(
                                                                                    idValue,
                                                                                ),
                                                                        );

                                                                    return (
                                                                        <label
                                                                            key={
                                                                                student.id
                                                                            }
                                                                            className={cn(
                                                                                'flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs',
                                                                                checked
                                                                                    ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-200'
                                                                                    : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-neutral-800 dark:text-slate-200',
                                                                                usedInOtherGroup &&
                                                                                    !checked &&
                                                                                    'cursor-not-allowed opacity-55',
                                                                            )}
                                                                        >
                                                                            <span className="truncate pr-2">
                                                                                {
                                                                                    student.nama
                                                                                }
                                                                                {student.nim
                                                                                    ? ` • ${student.nim}`
                                                                                    : ''}
                                                                            </span>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    checked
                                                                                }
                                                                                disabled={
                                                                                    usedInOtherGroup &&
                                                                                    !checked
                                                                                }
                                                                                onChange={() =>
                                                                                    toggleMember(
                                                                                        group.temp_id,
                                                                                        idValue,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </label>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                            Jumlah anggota:{' '}
                                                            {
                                                                group.member_ids
                                                                    .length
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {data.formation_mode === 'self-form' && (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 text-sm text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-200">
                                        Mahasiswa akan memilih slot kelompok
                                        secara real-time. Ketua kelompok dapat
                                        menambah anggota dan mengatur ketua
                                        langsung dari halaman detail mahasiswa.
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label>Jumlah Kelompok</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={
                                                    data.self_form_group_count
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'self_form_group_count',
                                                        Number(
                                                            event.target
                                                                .value || 1,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Anggota per Kelompok</Label>
                                            <Input
                                                type="number"
                                                min={data.min_members}
                                                max={data.max_members}
                                                value={
                                                    data.self_form_group_size
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'self_form_group_size',
                                                        Number(
                                                            event.target
                                                                .value ||
                                                                data.max_members,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Review & Simpan
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-neutral-800">
                                    <p className="text-xs tracking-wide text-slate-500 uppercase">
                                        Informasi
                                    </p>
                                    <div className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                                        <p>
                                            <span className="text-slate-500">
                                                Judul:
                                            </span>{' '}
                                            {data.title || '-'}
                                        </p>
                                        <p>
                                            <span className="text-slate-500">
                                                Mata Kuliah:
                                            </span>{' '}
                                            {selectedCourse?.nama || '-'}
                                        </p>
                                        <p>
                                            <span className="text-slate-500">
                                                Dosen:
                                            </span>{' '}
                                            {dosens.find(
                                                (item) =>
                                                    String(item.id) ===
                                                    data.dosen_id,
                                            )?.nama || '-'}
                                        </p>
                                        <p>
                                            <span className="text-slate-500">
                                                Deadline:
                                            </span>{' '}
                                            {data.submission_deadline || '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-neutral-800">
                                    <p className="text-xs tracking-wide text-slate-500 uppercase">
                                        Konfigurasi
                                    </p>
                                    <div className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                                        <p>
                                            <span className="text-slate-500">
                                                Mode Formasi:
                                            </span>{' '}
                                            {data.formation_mode}
                                        </p>
                                        <p>
                                            <span className="text-slate-500">
                                                Mode Nilai:
                                            </span>{' '}
                                            {data.grading_mode}
                                        </p>
                                        <p>
                                            <span className="text-slate-500">
                                                Anggota per kelompok:
                                            </span>{' '}
                                            {data.min_members} -{' '}
                                            {data.max_members}
                                        </p>
                                        {data.formation_mode === 'random' && (
                                            <p>
                                                <span className="text-slate-500">
                                                    Random:
                                                </span>{' '}
                                                {data.random_group_count}{' '}
                                                kelompok ×{' '}
                                                {data.random_group_size} anggota
                                            </p>
                                        )}
                                        {data.formation_mode === 'manual' && (
                                            <p>
                                                <span className="text-slate-500">
                                                    Manual:
                                                </span>{' '}
                                                {data.manual_groups.length}{' '}
                                                kelompok,{' '}
                                                {assignedMemberIds.size}{' '}
                                                mahasiswa terpasang
                                            </p>
                                        )}
                                        {data.formation_mode ===
                                            'self-form' && (
                                            <p>
                                                <span className="text-slate-500">
                                                    Self-form:
                                                </span>{' '}
                                                {data.self_form_group_count}{' '}
                                                slot kelompok ×{' '}
                                                {data.self_form_group_size}{' '}
                                                anggota
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/60">
                                <p className="text-xs tracking-wide text-slate-500 uppercase">
                                    Fitur Aktif
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {featureOptions.map((feature) => {
                                        const enabled = data.features.includes(
                                            feature.key,
                                        );
                                        return (
                                            <button
                                                key={feature.key}
                                                type="button"
                                                onClick={() =>
                                                    toggleFeature(feature.key)
                                                }
                                                className={cn(
                                                    'rounded-full border px-3 py-1 text-xs transition',
                                                    enabled
                                                        ? 'border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-700 dark:bg-violet-900/40 dark:text-violet-200'
                                                        : 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-neutral-800 dark:text-slate-300',
                                                )}
                                            >
                                                {feature.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {data.formation_mode === 'manual' &&
                                unassignedStudents.length > 0 && (
                                    <div className="rounded-2xl border border-amber-300/60 bg-amber-50/80 p-4 text-sm text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
                                        <p className="font-semibold">
                                            Masih ada{' '}
                                            {unassignedStudents.length}{' '}
                                            mahasiswa belum masuk kelompok
                                            manual.
                                        </p>
                                        <p className="mt-1 text-xs">
                                            Anda tetap bisa simpan sekarang,
                                            lalu lanjut penataan melalui halaman
                                            detail.
                                        </p>
                                    </div>
                                )}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                step === 1
                                    ? router.visit('/admin/tugas-kelompok')
                                    : goPrev()
                            }
                            className="w-full rounded-xl sm:w-auto"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {step === 1 ? 'Batal' : 'Sebelumnya'}
                        </Button>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            {step < 4 && (
                                <Button
                                    type="button"
                                    onClick={goNext}
                                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white sm:w-auto"
                                >
                                    Lanjut
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {step === 4 && (
                                <Button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleSubmit}
                                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white sm:w-auto"
                                >
                                    {processing ? (
                                        <>
                                            <Zap className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Simpan Workflow
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/35 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/35"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                Jalur Data Terhubung
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Assignment yang dibuat admin otomatis tampil di
                                dosen pengampu dan mahasiswa peserta mata
                                kuliah.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setLocalError('');
                                reset();
                                setStep(1);
                            }}
                            className="rounded-xl"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Reset Form
                        </Button>
                    </div>
                </motion.section>
            </motion.div>
        </AppLayout>
    );
}
