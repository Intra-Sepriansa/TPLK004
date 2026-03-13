import NotifIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Award,
    Bell,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    Info,
    Loader2,
    Mail,
    Save,
    Search,
    Send,
    Target,
    Users,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface NotificationTemplate {
    id: number;
    name: string;
    type: string;
    title: string;
    message: string;
    usage_count: number;
}
interface Props {
    dosen: { id: number; nama: string; nidn: string; email: string };
    courses: Array<{
        id: number;
        nama: string;
        kode: string | number;
        mahasiswa_count: number;
    }>;
    mahasiswa: Array<{ id: number; nama: string; nim: string; kelas: string }>;
    templates: NotificationTemplate[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
} as const;

const NOTIF_TYPES = [
    {
        value: 'reminder',
        label: 'Pengingat',
        icon: Clock,
        color: 'from-blue-400 to-cyan-600',
        desc: 'Reminder tugas/jadwal',
    },
    {
        value: 'announcement',
        label: 'Pengumuman',
        icon: Mail,
        color: 'from-purple-400 to-violet-600',
        desc: 'Info penting',
    },
    {
        value: 'alert',
        label: 'Peringatan',
        icon: AlertTriangle,
        color: 'from-red-400 to-pink-600',
        desc: 'Urgent alert',
    },
    {
        value: 'achievement',
        label: 'Pencapaian',
        icon: Award,
        color: 'from-amber-400 to-orange-600',
        desc: 'Prestasi mahasiswa',
    },
    {
        value: 'warning',
        label: 'Warning',
        icon: AlertCircle,
        color: 'from-orange-400 to-red-600',
        desc: 'Peringatan khusus',
    },
    {
        value: 'info',
        label: 'Informasi',
        icon: Info,
        color: 'from-emerald-400 to-teal-600',
        desc: 'Info umum',
    },
] as const;

const PRIORITIES = [
    {
        value: 'normal',
        label: 'Normal',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Info,
    },
    {
        value: 'high',
        label: 'Penting',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: AlertCircle,
    },
    {
        value: 'urgent',
        label: 'Urgent',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: AlertTriangle,
    },
] as const;

const STEPS = [
    {
        id: 1,
        title: 'Tipe & Template',
        description: 'Pilih tipe notifikasi',
        icon: Bell,
    },
    {
        id: 2,
        title: 'Konten',
        description: 'Tulis pesan notifikasi',
        icon: FileText,
    },
    {
        id: 3,
        title: 'Penerima',
        description: 'Pilih target penerima',
        icon: Users,
    },
    {
        id: 4,
        title: 'Jadwal',
        description: 'Atur waktu pengiriman',
        icon: Calendar,
    },
    { id: 5, title: 'Review', description: 'Periksa & kirim', icon: Send },
];

function getTypeColor(type: string) {
    const c: Record<string, string> = {
        reminder: 'bg-blue-100 text-blue-700',
        announcement: 'bg-purple-100 text-purple-700',
        alert: 'bg-red-100 text-red-700',
        achievement: 'bg-amber-100 text-amber-700',
        warning: 'bg-orange-100 text-orange-700',
        info: 'bg-emerald-100 text-emerald-700',
    };
    return c[type] || 'bg-neutral-100 text-neutral-700';
}
function getTypeLabel(type: string) {
    return NOTIF_TYPES.find((t) => t.value === type)?.label || type;
}

export default function NotificationDetail({
    dosen,
    courses,
    mahasiswa,
    templates,
}: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [sending, setSending] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDraft, setIsDraft] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [searchMhs, setSearchMhs] = useState('');
    const [confirmChecks, setConfirmChecks] = useState({
        content: false,
        target: false,
    });

    const [formData, setFormData] = useState({
        type: 'info' as string,
        priority: 'normal' as string,
        template_id: null as number | null,
        title: '',
        message: '',
        action_url: '',
        action_label: '',
        target_type: 'all' as 'all' | 'course' | 'custom',
        course_ids: [] as number[],
        mahasiswa_ids: [] as number[],
        send_now: true,
        scheduled_at: '',
        recurring: false,
        recurring_pattern: '' as string,
        recurring_days: [] as string[],
        recurring_end_date: '',
    });

    const updateForm = (key: string, value: any) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!formData.type && !!formData.priority;
            case 2:
                return (
                    formData.title.length > 0 &&
                    formData.title.length <= 100 &&
                    formData.message.length > 0 &&
                    formData.message.length <= 1000
                );
            case 3:
                if (formData.target_type === 'course')
                    return formData.course_ids.length > 0;
                if (formData.target_type === 'custom')
                    return formData.mahasiswa_ids.length > 0;
                return true;
            case 4:
                if (!formData.send_now && !formData.scheduled_at) return false;
                if (formData.recurring && !formData.recurring_end_date)
                    return false;
                return true;
            case 5:
                return true;
            default:
                return false;
        }
    };

    const completedSteps = useMemo(() => {
        const s = new Set<number>();
        for (let i = 1; i <= 5; i++) {
            if (validateStep(i) && i < currentStep) s.add(i);
        }
        return s;
    }, [currentStep, formData]);

    const totalRecipients = useMemo(() => {
        if (formData.target_type === 'all') return mahasiswa.length;
        if (formData.target_type === 'course')
            return courses
                .filter((c) => formData.course_ids.includes(c.id))
                .reduce((s, c) => s + c.mahasiswa_count, 0);
        return formData.mahasiswa_ids.length;
    }, [
        formData.target_type,
        formData.course_ids,
        formData.mahasiswa_ids,
        mahasiswa,
        courses,
    ]);

    const filteredMhs = useMemo(() => {
        if (!searchMhs) return mahasiswa;
        const q = searchMhs.toLowerCase();
        return mahasiswa.filter(
            (m) =>
                m.nama.toLowerCase().includes(q) ||
                m.nim.toLowerCase().includes(q),
        );
    }, [searchMhs, mahasiswa]);

    const handleTemplateSelect = (t: NotificationTemplate) => {
        setFormData((prev) => ({
            ...prev,
            template_id: t.id,
            title: t.title || '',
            message: t.message || '',
            type: t.type || prev.type,
        }));
    };

    const handleNextStep = () => {
        if (validateStep(currentStep) && currentStep < 5)
            setCurrentStep((prev) => prev + 1);
    };
    const handlePrevStep = () => {
        if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    };

    const handleSaveDraft = () => {
        setIsSaving(true);
        router.post(
            '/dosen/notifications',
            { ...formData, is_draft: true } as any,
            {
                onFinish: () => {
                    setIsSaving(false);
                    setIsDraft(true);
                },
            },
        );
    };

    const handleSend = () => {
        setSending(true);
        router.post(
            '/dosen/notifications',
            {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                priority: formData.priority,
                target_type:
                    formData.target_type === 'course'
                        ? 'all'
                        : formData.target_type === 'custom'
                          ? 'specific'
                          : 'all',
                target_mahasiswa:
                    formData.target_type === 'custom'
                        ? formData.mahasiswa_ids
                        : undefined,
                action_url: formData.action_url || undefined,
                scheduled_at: !formData.send_now
                    ? formData.scheduled_at
                    : undefined,
            } as any,
            {
                onFinish: () => setSending(false),
                onSuccess: () => router.visit('/dosen/notifications'),
            },
        );
    };

    const canNavigateToStep = (step: number) => {
        for (let i = 1; i < step; i++) {
            if (!validateStep(i)) return false;
        }
        return true;
    };

    const allStepsValid =
        validateStep(1) &&
        validateStep(2) &&
        validateStep(3) &&
        validateStep(4);

    const cardClass =
        'rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50';

    return (
        <DosenLayout>
            <Head title="Buat Notifikasi" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8"
            >
                {/* ═══════ HEADER ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-4 text-white shadow-2xl sm:p-6 md:p-8"
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
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/dosen/notifications')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
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
                                >
                                    <img
                                        src={NotifIcon}
                                        alt="Header Icon"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <p className="text-sm font-medium tracking-wide text-indigo-100">
                                        Buat Notifikasi Baru
                                    </p>
                                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                        Kirim Pemberitahuan
                                    </h1>
                                    <p className="mt-2 text-sm leading-relaxed text-indigo-100 sm:text-base">
                                        Buat dan kirim notifikasi ke mahasiswa
                                    </p>
                                </div>
                            </div>

                            <div className="mt-2 flex w-full flex-col items-center gap-3 lg:mt-0 lg:w-auto lg:items-end">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-6 py-3 shadow-lg backdrop-blur-xl"
                                >
                                    <div className="rounded-lg bg-indigo-500/20 p-2">
                                        <Target className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100">
                                            Progress
                                        </p>
                                        <p className="text-2xl font-bold text-white">
                                            {currentStep}/5
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2"
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            backgroundColor:
                                                'rgba(255,255,255,0.25)',
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveDraft}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" /> Simpan
                                        Draft
                                    </motion.button>
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            backgroundColor:
                                                'rgba(255,255,255,0.25)',
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() =>
                                            setShowPreview(!showPreview)
                                        }
                                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
                                    >
                                        <Eye className="h-4 w-4" /> Preview
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>

                        {isDraft && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/20 px-4 py-2 backdrop-blur-md"
                            >
                                <AlertCircle className="h-4 w-4 text-amber-200" />
                                <span className="text-sm text-amber-100">
                                    Draft tersimpan
                                </span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* ═══════ PROGRESS STEPPER ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className={`${cardClass} overflow-hidden`}
                >
                    <div className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex w-max min-w-full items-center gap-2 sm:justify-center">
                            {STEPS.map((step, idx) => {
                                const StepIcon = step.icon;
                                const isActive = currentStep === step.id;
                                const isDone =
                                    step.id < currentStep &&
                                    completedSteps.has(step.id);
                                const canOpen = canNavigateToStep(step.id);

                                return (
                                    <div
                                        key={step.id}
                                        className="flex shrink-0 items-center gap-2"
                                    >
                                        <motion.button
                                            whileHover={{
                                                scale: canOpen ? 1.05 : 1,
                                            }}
                                            whileTap={{
                                                scale: canOpen ? 0.95 : 1,
                                            }}
                                            onClick={() =>
                                                canOpen &&
                                                setCurrentStep(step.id)
                                            }
                                            disabled={!canOpen}
                                            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-2.5 sm:text-sm ${
                                                isActive
                                                    ? 'border-indigo-400 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                    : isDone
                                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                      : 'border-slate-200/50 bg-white/60 text-slate-500 dark:border-slate-700 dark:bg-neutral-800/40 dark:text-slate-300'
                                            } ${!canOpen ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            {isDone ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                <StepIcon className="h-4 w-4" />
                                            )}
                                            <span className="whitespace-nowrap">
                                                {step.title}
                                            </span>
                                        </motion.button>
                                        {idx < STEPS.length - 1 && (
                                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-6 w-full px-2">
                        <div className="mb-2 flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                            <span>Progress Keseluruhan</span>
                            <span className="font-bold">
                                {Math.round((currentStep / 5) * 100)}%
                            </span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={{
                                    width: `${(currentStep / 5) * 100}%`,
                                }}
                                transition={{ duration: 0.5 }}
                                className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ WIZARD STEPS ═══════ */}
                <>
                    {/* STEP 1: Tipe & Template */}
                    {currentStep === 1 && (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="min-w-0 space-y-6 lg:col-span-2">
                                <motion.div className={`${cardClass} !p-8`}>
                                    <div className="mb-6 flex items-center gap-3">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                                        >
                                            <Bell className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white">
                                                Tipe Notifikasi
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Pilih tipe dan template
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Tipe Notifikasi *
                                            </label>
                                            <div className="w-full max-w-full overflow-hidden sm:overflow-visible">
                                                <div className="w-full snap-x snap-mandatory overflow-x-auto px-1 pt-1 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
                                                    <div className="inline-flex min-w-max items-stretch gap-1.5 pr-1 sm:grid sm:w-full sm:min-w-0 sm:grid-cols-3 sm:gap-3 sm:pr-0">
                                                        {NOTIF_TYPES.map(
                                                            (type) => (
                                                                <motion.button
                                                                    key={
                                                                        type.value
                                                                    }
                                                                    type="button"
                                                                    whileHover={{
                                                                        scale: 1.02,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.98,
                                                                    }}
                                                                    onClick={() =>
                                                                        updateForm(
                                                                            'type',
                                                                            type.value,
                                                                        )
                                                                    }
                                                                    className={`relative h-[92px] w-[104px] shrink-0 snap-start overflow-hidden rounded-lg p-2 text-center transition-all sm:h-auto sm:w-auto sm:rounded-2xl sm:p-4 ${formData.type === type.value ? 'border border-indigo-400/70 bg-indigo-50/40 sm:ring-4 sm:ring-indigo-500/50 dark:bg-indigo-900/20' : 'border border-neutral-200 dark:border-neutral-800'}`}
                                                                >
                                                                    <div
                                                                        className={`mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${type.color} text-white shadow-lg sm:mb-2 sm:h-11 sm:w-11 sm:rounded-xl`}
                                                                    >
                                                                        <type.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                                                                    </div>
                                                                    <p className="text-[10px] font-semibold text-neutral-900 sm:text-xs dark:text-white">
                                                                        {
                                                                            type.label
                                                                        }
                                                                    </p>
                                                                    <p className="text-[9px] text-neutral-500 sm:text-[10px]">
                                                                        {
                                                                            type.desc
                                                                        }
                                                                    </p>
                                                                </motion.button>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Prioritas *
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {PRIORITIES.map((p) => (
                                                    <motion.button
                                                        key={p.value}
                                                        type="button"
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.95,
                                                        }}
                                                        onClick={() =>
                                                            updateForm(
                                                                'priority',
                                                                p.value,
                                                            )
                                                        }
                                                        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center font-bold transition-all ${formData.priority === p.value ? 'ring-4 ring-indigo-500/50 ' + p.color : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}
                                                    >
                                                        <p.icon className="h-4 w-4" />
                                                        {p.label}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                        {templates.length > 0 && (
                                            <div>
                                                <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Gunakan Template (Opsional)
                                                </label>
                                                <div className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto">
                                                    {templates
                                                        .filter(
                                                            (t) =>
                                                                !formData.type ||
                                                                t.type ===
                                                                    formData.type,
                                                        )
                                                        .map((t) => (
                                                            <motion.button
                                                                key={t.id}
                                                                type="button"
                                                                whileHover={{
                                                                    scale: 1.02,
                                                                    y: -2,
                                                                }}
                                                                whileTap={{
                                                                    scale: 0.98,
                                                                }}
                                                                onClick={() =>
                                                                    handleTemplateSelect(
                                                                        t,
                                                                    )
                                                                }
                                                                className={`rounded-xl p-4 text-left transition-all ${formData.template_id === t.id ? 'bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20' : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-800'}`}
                                                            >
                                                                <p className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                                    {t.name}
                                                                </p>
                                                                <p className="line-clamp-2 text-xs text-neutral-500">
                                                                    {t.message}
                                                                </p>
                                                            </motion.button>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-1">
                                <motion.div
                                    className={`sticky top-6 ${cardClass}`}
                                >
                                    <div className="mb-4 flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-indigo-600" />
                                        <h4 className="font-bold text-neutral-900 dark:text-white">
                                            Preview
                                        </h4>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs ${getTypeColor(formData.type)}`}
                                        >
                                            {getTypeLabel(formData.type)}
                                        </span>
                                        {formData.priority !== 'normal' && (
                                            <span
                                                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${formData.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}
                                            >
                                                {formData.priority === 'urgent'
                                                    ? 'Urgent'
                                                    : 'Penting'}
                                            </span>
                                        )}
                                        <p className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
                                            {formData.title ||
                                                'Judul notifikasi...'}
                                        </p>
                                        <p className="mt-1 line-clamp-3 text-xs text-neutral-500">
                                            {formData.message ||
                                                'Pesan notifikasi...'}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Konten */}
                    {currentStep === 2 && (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="min-w-0 lg:col-span-2">
                                <motion.div className={`${cardClass} !p-8`}>
                                    <div className="mb-6 flex items-center gap-3">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-lg shadow-purple-500/30"
                                        >
                                            <FileText className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white">
                                                Konten Notifikasi
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Tulis judul dan pesan
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/40 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                                            <p className="text-xs font-semibold tracking-wide text-indigo-700 uppercase dark:text-indigo-300">
                                                Content Builder
                                            </p>
                                            <p className="mt-1 text-xs text-indigo-600/90 dark:text-indigo-300/80">
                                                Tulis judul singkat, isi pesan
                                                jelas, lalu tambahkan CTA bila
                                                diperlukan.
                                            </p>
                                        </div>

                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Judul *
                                                </label>
                                                <span
                                                    className={`text-xs ${formData.title.length > 100 ? 'text-red-500' : 'text-neutral-400'}`}
                                                >
                                                    {formData.title.length}/100
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) =>
                                                    updateForm(
                                                        'title',
                                                        e.target.value,
                                                    )
                                                }
                                                maxLength={100}
                                                placeholder="Contoh: Pengumuman UTS Algoritma"
                                                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-black dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Pesan *
                                                </label>
                                                <span
                                                    className={`text-xs ${formData.message.length > 1000 ? 'text-red-500' : 'text-neutral-400'}`}
                                                >
                                                    {formData.message.length}
                                                    /1000
                                                </span>
                                            </div>
                                            <textarea
                                                value={formData.message}
                                                onChange={(e) =>
                                                    updateForm(
                                                        'message',
                                                        e.target.value,
                                                    )
                                                }
                                                maxLength={1000}
                                                rows={9}
                                                placeholder="Tulis detail notifikasi di sini..."
                                                className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-black dark:text-white"
                                            />
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {[
                                                    'Harap dibaca dengan seksama.',
                                                    'Deadline: [isi tanggal].',
                                                    'Hubungi dosen bila ada pertanyaan.',
                                                ].map((snippet) => (
                                                    <button
                                                        key={snippet}
                                                        type="button"
                                                        onClick={() =>
                                                            updateForm(
                                                                'message',
                                                                `${formData.message}${formData.message ? '\n' : ''}${snippet}`,
                                                            )
                                                        }
                                                        className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                                                    >
                                                        + {snippet}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Action URL (Opsional)
                                                </label>
                                                <input
                                                    type="url"
                                                    value={formData.action_url}
                                                    onChange={(e) =>
                                                        updateForm(
                                                            'action_url',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="https://..."
                                                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-black dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Action Label (Opsional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        formData.action_label
                                                    }
                                                    onChange={(e) =>
                                                        updateForm(
                                                            'action_label',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Lihat Detail"
                                                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-black dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-1">
                                <motion.div
                                    className={`sticky top-6 ${cardClass}`}
                                >
                                    <div className="mb-4 flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-indigo-600" />
                                        <h4 className="font-bold text-neutral-900 dark:text-white">
                                            Preview
                                        </h4>
                                    </div>
                                    <div className="space-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs ${getTypeColor(formData.type)}`}
                                        >
                                            {getTypeLabel(formData.type)}
                                        </span>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                            {formData.title || 'Judul...'}
                                        </p>
                                        <p className="text-xs whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                                            {formData.message || 'Pesan...'}
                                        </p>
                                        {formData.action_label && (
                                            <button className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                                                {formData.action_label} →
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Target Penerima */}
                    {currentStep === 3 && (
                        <div className="grid gap-3 lg:grid-cols-3 lg:gap-5">
                            <div className="min-w-0 lg:col-span-2">
                                <motion.div
                                    className={`${cardClass} !p-3 sm:!p-5`}
                                >
                                    <div className="mb-6 flex items-center gap-3">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                        >
                                            <Users className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white">
                                                Target Penerima
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Pilih siapa yang menerima
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Mode Target *
                                            </label>
                                            <div className="w-full max-w-full overflow-x-hidden overflow-y-visible sm:overflow-visible">
                                                <div className="mt-1 w-full snap-x snap-mandatory overflow-x-auto px-2 pt-2 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-0 sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
                                                    <div className="inline-flex min-w-max items-stretch gap-2 pr-1 sm:grid sm:w-full sm:min-w-0 sm:grid-cols-3 sm:gap-3 sm:pr-0">
                                                        {[
                                                            {
                                                                value: 'all' as const,
                                                                label: 'Semua Mahasiswa',
                                                                icon: Users,
                                                                desc: `${mahasiswa.length} mahasiswa`,
                                                            },
                                                            {
                                                                value: 'course' as const,
                                                                label: 'Per Mata Kuliah',
                                                                icon: FileText,
                                                                desc: `${courses.length} mata kuliah`,
                                                            },
                                                            {
                                                                value: 'custom' as const,
                                                                label: 'Pilih Manual',
                                                                icon: Target,
                                                                desc: 'Pilih spesifik',
                                                            },
                                                        ].map((opt) => (
                                                            <motion.button
                                                                key={opt.value}
                                                                type="button"
                                                                whileHover={{
                                                                    scale: 1.03,
                                                                    y: -3,
                                                                }}
                                                                whileTap={{
                                                                    scale: 0.97,
                                                                }}
                                                                onClick={() =>
                                                                    updateForm(
                                                                        'target_type',
                                                                        opt.value,
                                                                    )
                                                                }
                                                                className={`flex h-[136px] w-[128px] shrink-0 snap-start flex-col items-center rounded-xl p-2.5 text-center transition-all sm:h-auto sm:w-auto sm:rounded-2xl sm:p-4 ${formData.target_type === opt.value ? 'bg-indigo-50 ring-4 ring-indigo-500/50 dark:bg-indigo-900/20' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}
                                                            >
                                                                <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg sm:mb-2 sm:h-10 sm:w-10 sm:rounded-xl">
                                                                    <opt.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                                </div>
                                                                <p className="line-clamp-2 min-h-[2rem] text-sm leading-tight font-bold text-neutral-900 sm:min-h-0 sm:text-sm dark:text-white">
                                                                    {opt.label}
                                                                </p>
                                                                <p className="mt-auto pt-1 text-[11px] leading-tight text-neutral-500 sm:text-xs">
                                                                    {opt.desc}
                                                                </p>
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {formData.target_type === 'course' && (
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Pilih Mata Kuliah
                                                </label>
                                                <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-neutral-200 p-2 dark:border-neutral-800">
                                                    {courses.map((c) => (
                                                        <motion.label
                                                            key={c.id}
                                                            whileHover={{
                                                                scale: 1.01,
                                                            }}
                                                            className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all ${formData.course_ids.includes(c.id) ? 'bg-indigo-50 ring-2 ring-indigo-500/50 dark:bg-indigo-900/20' : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-800'}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.course_ids.includes(
                                                                    c.id,
                                                                )}
                                                                onChange={() =>
                                                                    updateForm(
                                                                        'course_ids',
                                                                        formData.course_ids.includes(
                                                                            c.id,
                                                                        )
                                                                            ? formData.course_ids.filter(
                                                                                  (
                                                                                      id,
                                                                                  ) =>
                                                                                      id !==
                                                                                      c.id,
                                                                              )
                                                                            : [
                                                                                  ...formData.course_ids,
                                                                                  c.id,
                                                                              ],
                                                                    )
                                                                }
                                                                className="rounded border-neutral-300 text-indigo-600"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                                    {c.nama}
                                                                </p>
                                                                <p className="text-xs text-neutral-500">
                                                                    {
                                                                        c.mahasiswa_count
                                                                    }{' '}
                                                                    mahasiswa
                                                                </p>
                                                            </div>
                                                        </motion.label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {formData.target_type === 'custom' && (
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                    <input
                                                        type="text"
                                                        value={searchMhs}
                                                        onChange={(e) =>
                                                            setSearchMhs(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Cari mahasiswa..."
                                                        className="w-full rounded-xl border border-neutral-300 bg-white py-3 pr-4 pl-10 text-sm dark:border-neutral-700 dark:bg-black dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-neutral-500">
                                                        {
                                                            formData
                                                                .mahasiswa_ids
                                                                .length
                                                        }{' '}
                                                        dipilih
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateForm(
                                                                'mahasiswa_ids',
                                                                formData
                                                                    .mahasiswa_ids
                                                                    .length ===
                                                                    mahasiswa.length
                                                                    ? []
                                                                    : mahasiswa.map(
                                                                          (m) =>
                                                                              m.id,
                                                                      ),
                                                            )
                                                        }
                                                        className="text-xs font-semibold text-indigo-600 hover:underline"
                                                    >
                                                        {formData.mahasiswa_ids
                                                            .length ===
                                                        mahasiswa.length
                                                            ? 'Hapus Semua'
                                                            : 'Pilih Semua'}
                                                    </button>
                                                </div>
                                                <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-neutral-200 p-2 dark:border-neutral-800">
                                                    {filteredMhs.map((m) => (
                                                        <label
                                                            key={m.id}
                                                            className={`flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all ${formData.mahasiswa_ids.includes(m.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.mahasiswa_ids.includes(
                                                                    m.id,
                                                                )}
                                                                onChange={() =>
                                                                    updateForm(
                                                                        'mahasiswa_ids',
                                                                        formData.mahasiswa_ids.includes(
                                                                            m.id,
                                                                        )
                                                                            ? formData.mahasiswa_ids.filter(
                                                                                  (
                                                                                      id,
                                                                                  ) =>
                                                                                      id !==
                                                                                      m.id,
                                                                              )
                                                                            : [
                                                                                  ...formData.mahasiswa_ids,
                                                                                  m.id,
                                                                              ],
                                                                    )
                                                                }
                                                                className="rounded border-neutral-300 text-indigo-600"
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                                    {m.nama}
                                                                </p>
                                                                <p className="text-xs text-neutral-400">
                                                                    {m.nim} ·{' '}
                                                                    {m.kelas}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                    {filteredMhs.length ===
                                                        0 && (
                                                        <div className="py-6 text-center text-sm text-neutral-500">
                                                            Mahasiswa tidak
                                                            ditemukan
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-1">
                                <motion.div
                                    className={`${cardClass} !p-4 sm:!p-5 lg:sticky lg:top-6`}
                                >
                                    <div className="mb-4 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-emerald-600" />
                                        <h4 className="font-bold text-neutral-900 dark:text-white">
                                            Target
                                        </h4>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <p className="text-3xl font-bold text-indigo-600 sm:text-4xl dark:text-indigo-400">
                                            {totalRecipients}
                                        </p>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Total Penerima
                                        </p>
                                        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                            {formData.target_type === 'all'
                                                ? 'Semua mahasiswa aktif'
                                                : formData.target_type ===
                                                    'course'
                                                  ? 'Berdasarkan mata kuliah terpilih'
                                                  : 'Berdasarkan mahasiswa pilihan'}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Jadwal */}
                    {currentStep === 4 && (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <motion.div className={`${cardClass} !p-8`}>
                                    <div className="mb-6 flex items-center gap-3">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                                        >
                                            <Calendar className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white">
                                                Jadwal Pengiriman
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Atur waktu pengiriman
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() =>
                                                    updateForm('send_now', true)
                                                }
                                                className={`rounded-2xl p-4 text-center transition-all ${formData.send_now ? 'bg-indigo-50 ring-4 ring-indigo-500/50 dark:bg-indigo-900/20' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}
                                            >
                                                <Zap className="mx-auto mb-2 h-8 w-8 text-amber-500" />
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                    Kirim Sekarang
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    Langsung dikirim
                                                </p>
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() =>
                                                    updateForm(
                                                        'send_now',
                                                        false,
                                                    )
                                                }
                                                className={`rounded-2xl p-4 text-center transition-all ${!formData.send_now ? 'bg-indigo-50 ring-4 ring-indigo-500/50 dark:bg-indigo-900/20' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}
                                            >
                                                <Clock className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                    Jadwalkan
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    Kirim nanti
                                                </p>
                                            </motion.button>
                                        </div>
                                        {!formData.send_now && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: 'auto',
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-4"
                                            >
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                        Tanggal & Waktu Kirim *
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={
                                                            formData.scheduled_at
                                                        }
                                                        onChange={(e) =>
                                                            updateForm(
                                                                'scheduled_at',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-black dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            formData.recurring
                                                        }
                                                        onChange={(e) =>
                                                            updateForm(
                                                                'recurring',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="rounded border-neutral-300 text-indigo-600"
                                                        id="recurring"
                                                    />
                                                    <label
                                                        htmlFor="recurring"
                                                        className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                                    >
                                                        Kirim Berulang
                                                    </label>
                                                </div>
                                                {formData.recurring && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="space-y-4 border-l-2 border-indigo-200 pl-4 dark:border-indigo-800"
                                                    >
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                                Pola
                                                            </label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {[
                                                                    'daily',
                                                                    'weekly',
                                                                    'monthly',
                                                                ].map((p) => (
                                                                    <button
                                                                        key={p}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateForm(
                                                                                'recurring_pattern',
                                                                                p,
                                                                            )
                                                                        }
                                                                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${formData.recurring_pattern === p ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}
                                                                    >
                                                                        {p ===
                                                                        'daily'
                                                                            ? 'Harian'
                                                                            : p ===
                                                                                'weekly'
                                                                              ? 'Mingguan'
                                                                              : 'Bulanan'}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {formData.recurring_pattern ===
                                                            'weekly' && (
                                                            <div>
                                                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                                    Hari
                                                                </label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {[
                                                                        'Senin',
                                                                        'Selasa',
                                                                        'Rabu',
                                                                        'Kamis',
                                                                        'Jumat',
                                                                        'Sabtu',
                                                                        'Minggu',
                                                                    ].map(
                                                                        (d) => (
                                                                            <button
                                                                                key={
                                                                                    d
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    updateForm(
                                                                                        'recurring_days',
                                                                                        formData.recurring_days.includes(
                                                                                            d,
                                                                                        )
                                                                                            ? formData.recurring_days.filter(
                                                                                                  (
                                                                                                      x,
                                                                                                  ) =>
                                                                                                      x !==
                                                                                                      d,
                                                                                              )
                                                                                            : [
                                                                                                  ...formData.recurring_days,
                                                                                                  d,
                                                                                              ],
                                                                                    )
                                                                                }
                                                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${formData.recurring_days.includes(d) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'}`}
                                                                            >
                                                                                {
                                                                                    d
                                                                                }
                                                                            </button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                                Sampai Tanggal *
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    formData.recurring_end_date
                                                                }
                                                                onChange={(e) =>
                                                                    updateForm(
                                                                        'recurring_end_date',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-black dark:text-white"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-1">
                                <motion.div
                                    className={`sticky top-6 ${cardClass}`}
                                >
                                    <div className="mb-4 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-amber-600" />
                                        <h4 className="font-bold text-neutral-900 dark:text-white">
                                            Jadwal
                                        </h4>
                                    </div>
                                    <div className="space-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {formData.send_now
                                                ? '⚡ Kirim Sekarang'
                                                : '🕐 Dijadwalkan'}
                                        </p>
                                        {!formData.send_now &&
                                            formData.scheduled_at && (
                                                <p className="text-xs text-neutral-500">
                                                    {new Date(
                                                        formData.scheduled_at,
                                                    ).toLocaleString('id-ID')}
                                                </p>
                                            )}
                                        {formData.recurring && (
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                                🔄 Berulang{' '}
                                                {formData.recurring_pattern ===
                                                'daily'
                                                    ? 'harian'
                                                    : formData.recurring_pattern ===
                                                        'weekly'
                                                      ? 'mingguan'
                                                      : 'bulanan'}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Review & Kirim */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <motion.div className={`${cardClass} !p-8`}>
                                <div className="mb-6 flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                    >
                                        <CheckCircle className="h-6 w-6" />
                                    </motion.div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 dark:text-white">
                                            Review & Kirim
                                        </h3>
                                        <p className="text-sm text-neutral-500">
                                            Periksa sebelum mengirim
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                Tipe & Prioritas
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentStep(1)
                                                }
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs ${getTypeColor(formData.type)}`}
                                            >
                                                {getTypeLabel(formData.type)}
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs ${formData.priority === 'urgent' ? 'bg-red-100 text-red-700' : formData.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}
                                            >
                                                {formData.priority}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                Konten
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentStep(2)
                                                }
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {formData.title}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                                            {formData.message}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                Penerima
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentStep(3)
                                                }
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {totalRecipients}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {formData.target_type === 'all'
                                                ? 'Semua mahasiswa'
                                                : formData.target_type ===
                                                    'course'
                                                  ? 'Per mata kuliah'
                                                  : 'Pilihan manual'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                Jadwal
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentStep(4)
                                                }
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {formData.send_now
                                                ? '⚡ Kirim Sekarang'
                                                : '🕐 ' +
                                                  (formData.scheduled_at
                                                      ? new Date(
                                                            formData.scheduled_at,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )
                                                      : 'Belum diatur')}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
                                    <h4 className="mb-3 text-sm font-bold text-neutral-900 dark:text-white">
                                        Konfirmasi
                                    </h4>
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={confirmChecks.content}
                                            onChange={(e) =>
                                                setConfirmChecks((prev) => ({
                                                    ...prev,
                                                    content: e.target.checked,
                                                }))
                                            }
                                            className="rounded border-neutral-300 text-indigo-600"
                                        />
                                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                            Saya sudah memeriksa konten
                                            notifikasi
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={confirmChecks.target}
                                            onChange={(e) =>
                                                setConfirmChecks((prev) => ({
                                                    ...prev,
                                                    target: e.target.checked,
                                                }))
                                            }
                                            className="rounded border-neutral-300 text-indigo-600"
                                        />
                                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                            Target penerima sudah benar
                                        </span>
                                    </label>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </>

                {/* ═══════ NAVIGATION ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className={`${cardClass} overflow-hidden`}
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePrevStep}
                            disabled={currentStep === 1}
                            className="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-neutral-100 px-2 py-2 text-[11px] font-semibold text-neutral-600 disabled:opacity-50 sm:h-auto sm:flex-none sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm dark:bg-neutral-800 dark:text-neutral-400"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                            <span className="truncate">Sebelumnya</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSaveDraft}
                            className="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-100 px-2 py-2 text-[11px] font-semibold text-amber-700 sm:h-auto sm:flex-none sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm dark:bg-amber-900/30 dark:text-amber-400"
                        >
                            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="truncate">Simpan Draft</span>
                        </motion.button>

                        {currentStep < 5 ? (
                            <motion.button
                                whileHover={{ scale: 1.05, x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextStep}
                                disabled={!validateStep(currentStep)}
                                className="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-2 text-[11px] font-semibold text-white shadow-lg shadow-indigo-500/30 disabled:opacity-50 sm:h-auto sm:flex-none sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                            >
                                <span className="truncate">Selanjutnya</span>
                                <ArrowRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={
                                    sending ||
                                    !allStepsValid ||
                                    !confirmChecks.content ||
                                    !confirmChecks.target
                                }
                                className="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-2 text-[11px] font-semibold text-white shadow-lg shadow-emerald-500/30 disabled:opacity-50 sm:h-auto sm:flex-none sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-5 sm:w-5" />
                                        <span className="truncate">
                                            Mengirim...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                        <span className="truncate">
                                            Kirim Notifikasi
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </DosenLayout>
    );
}
