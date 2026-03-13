import permitIcon from '@/assets/dosen/izin-sakit/persetujuan-izin.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Calendar,
    Check,
    CheckCircle,
    ChevronRight,
    ClipboardList,
    Clock,
    FileText,
    FileType,
    Image as ImageIcon,
    Loader2,
    Send,
    Stethoscope,
    Upload,
    X,
} from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';

type Session = {
    id: number;
    mata_kuliah: string;
    tanggal: string;
    tanggal_display: string;
    waktu: string;
    dosen: string;
};

type Props = {
    availableSessions: Session[];
};

export default function PermitCreate({ availableSessions }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [searchSession, setSearchSession] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        attendance_session_id: '',
        type: 'izin' as 'izin' | 'sakit',
        tanggal_mulai: '',
        tanggal_selesai: '',
        reason: '',
        keterangan: '',
        attachment: null as File | null,
    });

    const filteredSessions = useMemo(
        () =>
            availableSessions.filter((session) =>
                `${session.mata_kuliah} ${session.dosen}`
                    .toLowerCase()
                    .includes(searchSession.toLowerCase()),
            ),
        [availableSessions, searchSession],
    );

    const selectedSession = useMemo(
        () =>
            availableSessions.find(
                (session) => String(session.id) === data.attendance_session_id,
            ),
        [availableSessions, data.attendance_session_id],
    );

    const handleFileChange = (file: File | null) => {
        if (!file) {
            setData('attachment', null);
            setFilePreview(null);
            return;
        }

        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf',
        ];
        if (!validTypes.includes(file.type)) {
            window.alert(
                'Format file tidak didukung. Gunakan JPG, PNG, atau PDF.',
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            window.alert('Ukuran file maksimal 5MB.');
            return;
        }

        setData('attachment', file);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleDrag = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.type === 'dragenter' || event.type === 'dragover') {
            setDragActive(true);
        }

        if (event.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);

        if (event.dataTransfer.files?.[0]) {
            handleFileChange(event.dataTransfer.files[0]);
        }
    };

    const canProceedToStep2 = Boolean(
        data.attendance_session_id &&
            data.type &&
            data.tanggal_mulai &&
            data.tanggal_selesai,
    );
    const canProceedToStep3 = data.reason.trim().length >= 20;
    const canSubmit = data.attachment !== null;
    const completedByStep: Record<number, boolean> = {
        1: canProceedToStep2,
        2: canProceedToStep3,
        3: canSubmit,
    };
    const maxUnlockedStep = canProceedToStep2 ? (canProceedToStep3 ? 3 : 2) : 1;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        post('/user/permit', {
            forceFormData: true,
            onSuccess: () => {
                router.visit('/user/permit');
            },
        });
    };

    const steps = [
        {
            number: 1,
            title: 'Pilih Sesi',
            description: 'Pilih sesi dan jenis pengajuan',
            icon: Calendar,
        },
        {
            number: 2,
            title: 'Alasan',
            description: 'Tulis alasan dengan jelas',
            icon: FileText,
        },
        {
            number: 3,
            title: 'Upload Surat',
            description: 'Upload surat keterangan',
            icon: Upload,
        },
    ];

    return (
        <StudentLayout>
            <Head title="Ajukan Izin/Sakit" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 p-4 md:p-6 lg:p-8"
            >
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-3">
                        <Link href="/user/permit">
                            <motion.button
                                whileHover={{ x: -4 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Izin/Sakit
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
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

                    <div className="relative z-10">
                        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                            <motion.div
                                className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
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
                                    src={permitIcon}
                                    alt="Ajukan Izin"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </motion.div>

                            <div className="flex-1">
                                <p className="text-sm font-medium tracking-wide text-indigo-100">
                                    Form Pengajuan
                                </p>
                                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                    Ajukan Izin/Sakit
                                </h1>
                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                                    Lengkapi formulir di bawah untuk mengajukan
                                    izin atau sakit.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex w-max min-w-full items-center gap-2 sm:justify-center">
                            {steps.map((step, index) => {
                                const StepIcon = step.icon;
                                const isActive = currentStep === step.number;
                                const isCompleted =
                                    step.number < currentStep &&
                                    completedByStep[step.number];
                                const canOpen =
                                    step.number <= maxUnlockedStep ||
                                    step.number <= currentStep;

                                return (
                                    <div
                                        key={step.number}
                                        className="flex shrink-0 items-center gap-2"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => {
                                                if (!canOpen) {
                                                    window.alert(
                                                        'Lengkapi langkah sebelumnya dulu.',
                                                    );
                                                    return;
                                                }
                                                setCurrentStep(step.number);
                                            }}
                                            className={cn(
                                                'flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm',
                                                isActive &&
                                                    'border-indigo-400 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25',
                                                isCompleted &&
                                                    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
                                                !isActive &&
                                                    !isCompleted &&
                                                    'border-slate-200/70 bg-white/70 text-slate-500 dark:border-slate-700 dark:bg-neutral-800/40',
                                                canOpen
                                                    ? 'cursor-pointer'
                                                    : 'cursor-not-allowed opacity-45',
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <StepIcon className="h-4 w-4" />
                                            )}
                                            <span className="whitespace-nowrap">
                                                {step.title}
                                            </span>
                                        </motion.button>
                                        {index < steps.length - 1 && (
                                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step-1"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white">
                                            <Calendar className="h-5 w-5 text-indigo-500" />
                                            Pilih Sesi Kuliah
                                        </Label>
                                        <Input
                                            value={searchSession}
                                            onChange={(event) =>
                                                setSearchSession(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Cari mata kuliah atau dosen..."
                                            className="rounded-xl border-neutral-300 bg-white/60 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/60"
                                        />
                                        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-neutral-200 bg-white/40 p-3 dark:border-neutral-700 dark:bg-neutral-800/40">
                                            {filteredSessions.length > 0 ? (
                                                filteredSessions.map(
                                                    (session) => (
                                                        <button
                                                            key={session.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setData(
                                                                    'attendance_session_id',
                                                                    String(
                                                                        session.id,
                                                                    ),
                                                                )
                                                            }
                                                            className={cn(
                                                                'w-full rounded-xl p-4 text-left transition-all',
                                                                data.attendance_session_id ===
                                                                    String(
                                                                        session.id,
                                                                    )
                                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                                    : 'bg-white/60 hover:bg-white/80 dark:bg-neutral-800/60 dark:hover:bg-neutral-800/80',
                                                            )}
                                                        >
                                                            <p className="font-semibold">
                                                                {
                                                                    session.mata_kuliah
                                                                }
                                                            </p>
                                                            <p
                                                                className={cn(
                                                                    'mt-1 text-sm',
                                                                    data.attendance_session_id ===
                                                                        String(
                                                                            session.id,
                                                                        )
                                                                        ? 'text-white/90'
                                                                        : 'text-neutral-600 dark:text-neutral-400',
                                                                )}
                                                            >
                                                                {session.dosen}
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-3 text-xs">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {
                                                                        session.tanggal_display
                                                                    }
                                                                </span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {
                                                                        session.waktu
                                                                    }
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ),
                                                )
                                            ) : (
                                                <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                                                    Tidak ada sesi yang
                                                    ditemukan.
                                                </div>
                                            )}
                                        </div>
                                        {errors.attendance_session_id && (
                                            <p className="inline-flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.attendance_session_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white">
                                            <ClipboardList className="h-5 w-5 text-indigo-500" />
                                            Jenis Pengajuan
                                        </Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                {
                                                    value: 'izin',
                                                    label: 'Izin',
                                                    icon: ClipboardList,
                                                    gradient:
                                                        'from-blue-500 to-cyan-600',
                                                },
                                                {
                                                    value: 'sakit',
                                                    label: 'Sakit',
                                                    icon: Stethoscope,
                                                    gradient:
                                                        'from-red-500 to-pink-600',
                                                },
                                            ].map((item) => {
                                                const TypeIcon = item.icon;

                                                return (
                                                    <button
                                                        key={item.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'type',
                                                                item.value as
                                                                    | 'izin'
                                                                    | 'sakit',
                                                            )
                                                        }
                                                        className={cn(
                                                            'relative overflow-hidden rounded-2xl p-6 transition-all',
                                                            data.type ===
                                                                item.value
                                                                ? `bg-gradient-to-br ${item.gradient} text-white shadow-xl`
                                                                : 'bg-white/60 hover:bg-white/80 dark:bg-neutral-800/60 dark:hover:bg-neutral-800/80',
                                                        )}
                                                    >
                                                        <div className="text-center">
                                                            <TypeIcon className="mx-auto mb-2 h-10 w-10" />
                                                            <p className="text-lg font-semibold">
                                                                {item.label}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Tanggal Mulai
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.tanggal_mulai}
                                                onChange={(event) =>
                                                    setData(
                                                        'tanggal_mulai',
                                                        event.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-neutral-300 bg-white/60 dark:border-neutral-700 dark:bg-neutral-800/60"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Tanggal Selesai
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.tanggal_selesai}
                                                min={
                                                    data.tanggal_mulai ||
                                                    undefined
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'tanggal_selesai',
                                                        event.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-neutral-300 bg-white/60 dark:border-neutral-700 dark:bg-neutral-800/60"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step-2"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label className="inline-flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white">
                                            <FileText className="h-5 w-5 text-indigo-500" />
                                            Alasan Pengajuan{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Textarea
                                            value={data.reason}
                                            onChange={(event) =>
                                                setData(
                                                    'reason',
                                                    event.target.value,
                                                )
                                            }
                                            rows={6}
                                            placeholder="Jelaskan alasan izin/sakit secara detail (minimal 20 karakter)..."
                                            className="resize-none rounded-xl border-neutral-300 bg-white/60 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/60"
                                        />
                                        <div className="flex items-center justify-between text-sm">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1',
                                                    data.reason.trim().length >=
                                                        20
                                                        ? 'text-emerald-600'
                                                        : 'text-neutral-500',
                                                )}
                                            >
                                                {data.reason.trim().length >=
                                                    20 && (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                                {data.reason.trim().length}/20
                                                karakter minimum
                                            </span>
                                            <span className="text-neutral-400">
                                                {data.reason.length} karakter
                                            </span>
                                        </div>
                                        {errors.reason && (
                                            <p className="inline-flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.reason}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-neutral-900 dark:text-white">
                                            Keterangan Tambahan (Opsional)
                                        </Label>
                                        <Textarea
                                            value={data.keterangan}
                                            onChange={(event) =>
                                                setData(
                                                    'keterangan',
                                                    event.target.value,
                                                )
                                            }
                                            rows={4}
                                            placeholder="Tambahkan keterangan tambahan jika diperlukan..."
                                            className="resize-none rounded-xl border-neutral-300 bg-white/60 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/60"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step-3"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label className="inline-flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white">
                                            <Upload className="h-5 w-5 text-indigo-500" />
                                            Upload Surat Keterangan{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>

                                        <motion.div
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            whileHover={{ scale: 1.01 }}
                                            className={cn(
                                                'cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all',
                                                dragActive &&
                                                    'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20',
                                                data.attachment &&
                                                    'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20',
                                                !dragActive &&
                                                    !data.attachment &&
                                                    'border-neutral-300 hover:border-indigo-400 dark:border-neutral-700',
                                            )}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                                onChange={(event) =>
                                                    handleFileChange(
                                                        event.target
                                                            .files?.[0] || null,
                                                    )
                                                }
                                                className="hidden"
                                            />

                                            {!data.attachment ? (
                                                <div className="text-center">
                                                    <motion.div
                                                        animate={{
                                                            y: dragActive
                                                                ? -10
                                                                : [0, -10, 0],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: dragActive
                                                                ? 0
                                                                : Infinity,
                                                            ease: 'easeInOut',
                                                        }}
                                                        className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30"
                                                    >
                                                        <Upload className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                                                    </motion.div>
                                                    <p className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                                        {dragActive
                                                            ? 'Lepaskan file di sini'
                                                            : 'Upload Surat Keterangan'}
                                                    </p>
                                                    <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                                                        Drag & drop file atau
                                                        klik untuk memilih.
                                                    </p>
                                                    <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <ImageIcon className="h-4 w-4" />
                                                            JPG, PNG
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <FileType className="h-4 w-4" />
                                                            PDF
                                                        </span>
                                                        <span>Max 5MB</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                        <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <p className="mb-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                                        File berhasil diupload
                                                    </p>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {data.attachment.name}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>

                                        {data.attachment && (
                                            <div className="rounded-2xl border border-neutral-200 bg-white/60 p-4 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/60">
                                                <div className="flex items-start gap-4">
                                                    <div className="shrink-0">
                                                        {filePreview ? (
                                                            <img
                                                                src={
                                                                    filePreview
                                                                }
                                                                alt="Preview surat"
                                                                className="h-24 w-24 rounded-xl border-2 border-neutral-200 object-cover dark:border-neutral-700"
                                                            />
                                                        ) : (
                                                            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                                                                <FileType className="h-12 w-12 text-neutral-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-semibold text-neutral-900 dark:text-white">
                                                            {
                                                                data.attachment
                                                                    .name
                                                            }
                                                        </p>
                                                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                                            {
                                                                data.attachment
                                                                    .type
                                                            }
                                                        </p>
                                                        <p className="mt-1 text-xs text-neutral-500">
                                                            {(
                                                                data.attachment
                                                                    .size /
                                                                1024 /
                                                                1024
                                                            ).toFixed(2)}{' '}
                                                            MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleFileChange(
                                                                null,
                                                            )
                                                        }
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {errors.attachment && (
                                            <p className="inline-flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.attachment}
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                            <FileText className="h-4 w-4" />
                                            Ringkasan Pengajuan
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Mata Kuliah
                                                </span>
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {selectedSession?.mata_kuliah ??
                                                        '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Jenis
                                                </span>
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {data.type === 'sakit'
                                                        ? 'Sakit'
                                                        : 'Izin'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Periode
                                                </span>
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {data.tanggal_mulai || '-'}{' '}
                                                    s/d{' '}
                                                    {data.tanggal_selesai ||
                                                        '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 flex items-center justify-between gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-700"
                        >
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentStep((step) =>
                                            Math.max(1, step - 1),
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/60 px-6 py-3 font-medium text-neutral-700 backdrop-blur transition-all hover:bg-white/80 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800/80"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </button>
                            ) : (
                                <div />
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentStep((step) =>
                                            Math.min(3, step + 1),
                                        )
                                    }
                                    disabled={
                                        (currentStep === 1 &&
                                            !canProceedToStep2) ||
                                        (currentStep === 2 &&
                                            !canProceedToStep3)
                                    }
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium shadow-lg transition-all',
                                        (currentStep === 1 &&
                                            canProceedToStep2) ||
                                            (currentStep === 2 &&
                                                canProceedToStep3)
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:shadow-purple-500/30'
                                            : 'cursor-not-allowed bg-neutral-300 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400',
                                    )}
                                >
                                    Selanjutnya
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={!canSubmit || processing}
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold shadow-lg transition-all',
                                        canSubmit && !processing
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:shadow-emerald-500/30'
                                            : 'cursor-not-allowed bg-neutral-300 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400',
                                    )}
                                >
                                    {processing ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                    {processing
                                        ? 'Mengirim...'
                                        : 'Kirim Pengajuan'}
                                </Button>
                            )}
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
