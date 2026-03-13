import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Award,
    CheckCircle,
    ChevronRight,
    FileText,
    Settings,
    Sparkles,
    UserCheck,
    Users,
    Users2,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

type Course = { id: number; nama: string };
type Props = { courses: Course[] };

const cV = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
};
const iV = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

const formationModes = [
    {
        value: 'self-form',
        label: 'Self-Form',
        desc: 'Mahasiswa membentuk kelompok sendiri',
        icon: Users2,
        color: 'from-blue-500 to-cyan-500',
    },
    {
        value: 'random',
        label: 'Random',
        desc: 'Sistem membentuk kelompok secara acak',
        icon: Sparkles,
        color: 'from-purple-500 to-violet-500',
    },
    {
        value: 'manual',
        label: 'Manual',
        desc: 'Dosen menentukan anggota kelompok',
        icon: UserCheck,
        color: 'from-amber-500 to-orange-500',
    },
];

const gradingModes = [
    {
        value: 'same',
        label: 'Same Grade',
        desc: 'Semua anggota mendapat nilai sama',
        icon: Users,
        color: 'from-green-500 to-emerald-500',
    },
    {
        value: 'individual',
        label: 'Individual',
        desc: 'Nilai dasar ± penyesuaian per mahasiswa',
        icon: UserCheck,
        color: 'from-blue-500 to-indigo-500',
    },
    {
        value: 'peer',
        label: 'Peer Evaluation',
        desc: 'Nilai berdasarkan evaluasi teman',
        icon: Award,
        color: 'from-purple-500 to-pink-500',
    },
    {
        value: 'contribution',
        label: 'Contribution',
        desc: 'Nilai berdasarkan kontribusi aktivitas',
        icon: Zap,
        color: 'from-orange-500 to-red-500',
    },
];

export default function DosenTugasKelompokCreate({ courses }: Props) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors } = useForm({
        course_id: courses.length === 1 ? String(courses[0].id) : '',
        title: '',
        description: '',
        formation_mode: 'self-form',
        grading_mode: 'same',
        min_members: 2,
        max_members: 5,
        formation_deadline: '',
        submission_deadline: '',
        max_file_size_mb: 25,
        peer_evaluation_weight: 0.3,
        contribution_threshold: 0.3,
        allow_resubmission: false,
        random_group_count: 2,
        random_group_size: 4,
        self_form_group_count: 2,
        self_form_group_size: 4,
        features: [] as string[],
    });

    const handleSubmit = () => {
        post('/dosen/tugas-kelompok', { preserveScroll: true });
    };

    const steps = [
        { num: 1, label: 'Detail Tugas', icon: FileText },
        { num: 2, label: 'Pembentukan Kelompok', icon: Users2 },
        { num: 3, label: 'Penilaian', icon: Award },
        { num: 4, label: 'Pengaturan', icon: Settings },
    ];
    const isStep1Complete = Boolean(
        data.course_id && data.title.trim() && data.submission_deadline,
    );
    const isStep2Complete =
        data.min_members >= 2 && data.max_members >= data.min_members;
    const isStep3Complete = Boolean(data.grading_mode);
    const completedByStep: Record<number, boolean> = {
        1: isStep1Complete,
        2: isStep2Complete,
        3: isStep3Complete,
        4: false,
    };
    const maxUnlockedStep = isStep1Complete
        ? isStep2Complete
            ? isStep3Complete
                ? 4
                : 3
            : 2
        : 1;

    return (
        <DosenLayout>
            <Head title="Buat Tugas Kelompok" />
            <motion.div
                className="space-y-6 p-4 md:p-6"
                variants={cV}
                initial="hidden"
                animate="visible"
            >
                {/* ═══ HEADER ═══ */}
                <motion.div
                    variants={iV}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                                router.visit('/dosen/tugas-kelompok')
                            }
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="relative flex h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    type: 'spring' as const,
                                    stiffness: 300,
                                }}
                            >
                                <img
                                    src={TugasIcon}
                                    alt="Buat Tugas"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </motion.div>
                            <div className="mt-1 flex-1 sm:mt-0">
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                    Buat Tugas Kelompok Baru
                                </h1>
                                <p className="mt-1 text-sm text-purple-100">
                                    Atur detail, pembentukan kelompok, dan mode
                                    penilaian
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ STEP INDICATOR ═══ */}
                <motion.div
                    variants={iV}
                    className="w-full max-w-full overflow-hidden"
                >
                    <div className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex w-max min-w-full items-center gap-2 sm:justify-center">
                            {steps.map((s, i) => {
                                const StepIcon = s.icon;
                                const isActive = step === s.num;
                                const isDone =
                                    s.num < step && completedByStep[s.num];
                                const canOpen =
                                    s.num <= maxUnlockedStep || s.num <= step;
                                return (
                                    <div
                                        key={s.num}
                                        className="flex shrink-0 items-center gap-2"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (!canOpen) {
                                                    window.alert(
                                                        'Lengkapi langkah sebelumnya dulu.',
                                                    );
                                                    return;
                                                }
                                                setStep(s.num);
                                            }}
                                            className={cn(
                                                'flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-2.5 sm:text-sm',
                                                isActive
                                                    ? 'border-purple-400 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                                                    : isDone
                                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                      : 'border-slate-200/50 bg-white/60 text-slate-500 dark:border-slate-700 dark:bg-neutral-800/40',
                                            )}
                                        >
                                            {isDone ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                <StepIcon className="h-4 w-4" />
                                            )}
                                            <span className="whitespace-nowrap">
                                                {s.label}
                                            </span>
                                        </motion.button>
                                        {i < steps.length - 1 && (
                                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* ═══ FORM CONTENT ═══ */}
                <motion.div
                    variants={iV}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                <FileText className="h-5 w-5 text-purple-500" />{' '}
                                Detail Tugas
                            </h3>
                            {/* Mata kuliah auto-set */}
                            {courses.length === 1 ? (
                                <div className="flex items-center gap-3 rounded-xl border border-purple-200/50 bg-purple-50/50 p-3 dark:bg-purple-900/20">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Mata Kuliah
                                        </p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {courses[0].nama}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Label>Mata Kuliah *</Label>
                                    <Select
                                        value={data.course_id}
                                        onValueChange={(v) =>
                                            setData('course_id', v)
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih Mata Kuliah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={String(c.id)}
                                                >
                                                    {c.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.course_id && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.course_id}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div>
                                <Label>Judul Tugas *</Label>
                                <Input
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Contoh: Project Website E-Commerce"
                                    className="mt-1"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Deskripsi</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Jelaskan tugas kelompok secara detail..."
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Deadline Pembentukan Kelompok</Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.formation_deadline}
                                        onChange={(e) =>
                                            setData(
                                                'formation_deadline',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Deadline Pengumpulan</Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.submission_deadline}
                                        onChange={(e) =>
                                            setData(
                                                'submission_deadline',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                <Users2 className="h-5 w-5 text-purple-500" />{' '}
                                Mode Pembentukan Kelompok
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {formationModes.map((fm) => {
                                    const FMIcon = fm.icon;
                                    return (
                                        <motion.div
                                            key={fm.value}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                                setData(
                                                    'formation_mode',
                                                    fm.value,
                                                )
                                            }
                                            className={cn(
                                                'relative cursor-pointer rounded-2xl border-2 p-5 transition-all',
                                                data.formation_mode === fm.value
                                                    ? 'border-purple-400 bg-purple-50/50 shadow-lg shadow-purple-500/10 dark:bg-purple-900/20'
                                                    : 'border-slate-200/50 bg-white/60 hover:border-purple-200 dark:border-slate-700 dark:bg-neutral-800/30',
                                            )}
                                        >
                                            {data.formation_mode ===
                                                fm.value && (
                                                <div className="absolute top-3 right-3">
                                                    <CheckCircle className="h-5 w-5 text-purple-500" />
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    'mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                                                    fm.color,
                                                )}
                                            >
                                                <FMIcon className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                {fm.label}
                                            </h4>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {fm.desc}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Min. Anggota per Kelompok</Label>
                                    <Input
                                        type="number"
                                        min={2}
                                        max={20}
                                        value={data.min_members}
                                        onChange={(e) =>
                                            setData(
                                                'min_members',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Maks. Anggota per Kelompok</Label>
                                    <Input
                                        type="number"
                                        min={2}
                                        max={20}
                                        value={data.max_members}
                                        onChange={(e) =>
                                            setData(
                                                'max_members',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {data.formation_mode === 'random' && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Jumlah Kelompok Random</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={data.random_group_count}
                                            onChange={(e) =>
                                                setData(
                                                    'random_group_count',
                                                    parseInt(
                                                        e.target.value || '1',
                                                    ),
                                                )
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Anggota per Kelompok Random
                                        </Label>
                                        <Input
                                            type="number"
                                            min={data.min_members}
                                            max={data.max_members}
                                            value={data.random_group_size}
                                            onChange={(e) =>
                                                setData(
                                                    'random_group_size',
                                                    parseInt(
                                                        e.target.value ||
                                                            String(
                                                                data.max_members,
                                                            ),
                                                    ),
                                                )
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}

                            {data.formation_mode === 'self-form' && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Jumlah Slot Kelompok</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={data.self_form_group_count}
                                            onChange={(e) =>
                                                setData(
                                                    'self_form_group_count',
                                                    parseInt(
                                                        e.target.value || '1',
                                                    ),
                                                )
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Anggota per Slot</Label>
                                        <Input
                                            type="number"
                                            min={data.min_members}
                                            max={data.max_members}
                                            value={data.self_form_group_size}
                                            onChange={(e) =>
                                                setData(
                                                    'self_form_group_size',
                                                    parseInt(
                                                        e.target.value ||
                                                            String(
                                                                data.max_members,
                                                            ),
                                                    ),
                                                )
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                <Award className="h-5 w-5 text-purple-500" />{' '}
                                Mode Penilaian
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {gradingModes.map((gm) => {
                                    const GMIcon = gm.icon;
                                    return (
                                        <motion.div
                                            key={gm.value}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                                setData(
                                                    'grading_mode',
                                                    gm.value,
                                                )
                                            }
                                            className={cn(
                                                'relative cursor-pointer rounded-2xl border-2 p-5 transition-all',
                                                data.grading_mode === gm.value
                                                    ? 'border-purple-400 bg-purple-50/50 shadow-lg shadow-purple-500/10 dark:bg-purple-900/20'
                                                    : 'border-slate-200/50 bg-white/60 hover:border-purple-200 dark:border-slate-700 dark:bg-neutral-800/30',
                                            )}
                                        >
                                            {data.grading_mode === gm.value && (
                                                <div className="absolute top-3 right-3">
                                                    <CheckCircle className="h-5 w-5 text-purple-500" />
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    'mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                                                    gm.color,
                                                )}
                                            >
                                                <GMIcon className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                {gm.label}
                                            </h4>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {gm.desc}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            {data.grading_mode === 'peer' && (
                                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:bg-purple-900/20">
                                    <Label>
                                        Bobot Peer Evaluation (
                                        {Math.round(
                                            data.peer_evaluation_weight * 100,
                                        )}
                                        %)
                                    </Label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={
                                            data.peer_evaluation_weight * 100
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'peer_evaluation_weight',
                                                parseInt(e.target.value) / 100,
                                            )
                                        }
                                        className="mt-2 w-full accent-purple-500"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        Nilai akhir = (Nilai Dosen ×{' '}
                                        {Math.round(
                                            (1 - data.peer_evaluation_weight) *
                                                100,
                                        )}
                                        %) + (Peer Score ×{' '}
                                        {Math.round(
                                            data.peer_evaluation_weight * 100,
                                        )}
                                        %)
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                <Settings className="h-5 w-5 text-purple-500" />{' '}
                                Pengaturan Lanjutan
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Maks. Ukuran File (MB)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={data.max_file_size_mb}
                                        onChange={(e) =>
                                            setData(
                                                'max_file_size_mb',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div className="mt-6 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.allow_resubmission}
                                        onChange={(e) =>
                                            setData(
                                                'allow_resubmission',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <Label>Izinkan Resubmision</Label>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mt-6 rounded-2xl border border-slate-200/50 bg-white/60 p-5 dark:border-slate-700 dark:bg-neutral-800/30">
                                <h4 className="mb-3 font-bold text-slate-900 dark:text-white">
                                    📋 Ringkasan
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500">
                                            Judul:
                                        </span>{' '}
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {data.title || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">
                                            Mata Kuliah:
                                        </span>{' '}
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {courses.find(
                                                (c) =>
                                                    String(c.id) ===
                                                    data.course_id,
                                            )?.nama || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">
                                            Mode Kelompok:
                                        </span>{' '}
                                        <span className="font-medium text-slate-900 capitalize dark:text-white">
                                            {data.formation_mode}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">
                                            Mode Penilaian:
                                        </span>{' '}
                                        <span className="font-medium text-slate-900 capitalize dark:text-white">
                                            {data.grading_mode}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">
                                            Anggota:
                                        </span>{' '}
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {data.min_members}-
                                            {data.max_members}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">
                                            Resubmisi:
                                        </span>{' '}
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {data.allow_resubmission
                                                ? 'Ya'
                                                : 'Tidak'}
                                        </span>
                                    </div>
                                    {data.formation_mode === 'random' && (
                                        <>
                                            <div>
                                                <span className="text-slate-500">
                                                    Jumlah Kelompok Random:
                                                </span>{' '}
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {data.random_group_count}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    Anggota Random:
                                                </span>{' '}
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {data.random_group_size}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {data.formation_mode === 'self-form' && (
                                        <>
                                            <div>
                                                <span className="text-slate-500">
                                                    Jumlah Slot:
                                                </span>{' '}
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {data.self_form_group_count}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    Anggota per Slot:
                                                </span>{' '}
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {data.self_form_group_size}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-200/50 pt-4 dark:border-slate-700">
                        <Button
                            variant="outline"
                            onClick={() =>
                                step > 1
                                    ? setStep(step - 1)
                                    : router.visit('/dosen/tugas-kelompok')
                            }
                            className="rounded-xl"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />{' '}
                            {step > 1 ? 'Sebelumnya' : 'Batal'}
                        </Button>
                        {step < 4 ? (
                            <Button
                                onClick={() => {
                                    const currentStepValid =
                                        (step === 1 && isStep1Complete) ||
                                        (step === 2 && isStep2Complete) ||
                                        (step === 3 && isStep3Complete);

                                    if (!currentStepValid) {
                                        window.alert(
                                            'Lengkapi langkah ini dulu sebelum lanjut.',
                                        );
                                        return;
                                    }

                                    setStep(step + 1);
                                }}
                                className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-600 hover:to-fuchsia-600"
                            >
                                Selanjutnya{' '}
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />{' '}
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Buat Tugas Kelompok'}
                            </Button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </DosenLayout>
    );
}
