import SesiBaruIcon from '@/assets/admin/sesi-absen/sesi-baru-icon.png';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlignLeft,
    Bell,
    Blend,
    BookOpen,
    Building,
    Calendar,
    Camera,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    FileText,
    Fingerprint,
    Globe,
    Lock,
    Mail,
    Map,
    MapPin,
    MessageSquare,
    QrCode,
    Radar,
    Repeat,
    Save,
    Send,
    Settings,
    Smartphone,
    Target,
    Timer,
    TrendingUp,
    Unlock,
    Users,
    Video,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const steps = [
    {
        id: 1,
        title: 'Informasi Dasar',
        description: 'Nama sesi & mata kuliah',
        icon: BookOpen,
    },
    {
        id: 2,
        title: 'Jadwal & Waktu',
        description: 'Tanggal, jam, dan durasi',
        icon: Calendar,
    },
    {
        id: 3,
        title: 'Lokasi & Zona',
        description: 'Fisik, online, dan radius',
        icon: MapPin,
    },
    {
        id: 4,
        title: 'Metode Absensi',
        description: 'QR, GPS, selfie, dan AI',
        icon: QrCode,
    },
    {
        id: 5,
        title: 'Pengaturan Lanjutan',
        description: 'Visibilitas, sanksi, publish',
        icon: Settings,
    },
    {
        id: 6,
        title: 'Notifikasi',
        description: 'Reminder dan alert',
        icon: Bell,
    },
    {
        id: 7,
        title: 'Review & Publish',
        description: 'Cek akhir lalu simpan',
        icon: Send,
    },
];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
} as const;

interface Course {
    id: number;
    nama: string;
    sks: number;
    dosen: string;
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

interface PageProps {
    courses: Course[];
}

const createInitialFormData = () => ({
    // Step 1
    nama_sesi: '',
    mata_kuliah_id: '',
    pertemuan: '',
    deskripsi: '',
    tags: [] as string[],

    // Step 2
    tanggal: '',
    waktu_mulai: '',
    waktu_selesai: '',
    waktu_buka_absen: '',
    waktu_tutup_absen: '',
    toleransi_keterlambatan: 15,
    recurring: false,

    // Step 3
    tipe_lokasi: 'fisik',
    ruangan_id: '',
    link_meeting: '',
    zona_lat: '',
    zona_lng: '',
    zona_radius: 100,

    // Step 4
    metode_absensi: [] as string[],
    qr_settings: {} as { refresh_interval?: number },
    gps_settings: {} as Record<string, never>,
    selfie_settings: {
        liveness_check: true,
        strictness_level: 'medium' as 'low' | 'medium' | 'high',
    },

    // Step 5
    status: 'published',
    visibilitas: 'all',
    mahasiswa_ids: [] as number[],
    pengaturan_absensi: { auto_close: true, allow_late: true },
    penilaian: { method: 'simple', weight: 100 },
    sanksi: { enabled: false },

    notifikasi_mahasiswa: true,
    notifikasi_dosen: true,
    notifikasi_admin: false,
    notifikasi_ortu: false,
    channels: ['push', 'in-app'] as string[],
    timing: ['15_min_before'] as string[],
    notification_title: '',
    notification_message: '',
});

type FormDataState = ReturnType<typeof createInitialFormData>;
type StrictnessLevel = FormDataState['selfie_settings']['strictness_level'];

const strictnessLevels = ['low', 'medium', 'high'] as const;

const isStrictnessLevel = (value: string): value is StrictnessLevel =>
    strictnessLevels.includes(value as StrictnessLevel);

const formatMeetingBadges = (meetings: number[]) =>
    meetings.length > 0 ? meetings.map((meeting) => `P${meeting}`).join(', ') : '-';

function WizardStepTracker({
    currentStep,
    onStepSelect,
}: {
    currentStep: number;
    onStepSelect: (step: number) => void;
}) {
    const activeStep = steps.find((step) => step.id === currentStep) ?? steps[0];

    return (
        <motion.section
            variants={itemVariants}
            className="mb-8 rounded-[2rem] border border-white/10 bg-[#030303] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.45)] md:mb-12 md:p-6"
        >
            <div className="overflow-x-auto pb-2">
                <div className="flex min-w-max items-center gap-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon as LucideIcon;
                        const isCompleted = step.id < currentStep;
                        const isActive = step.id === currentStep;
                        const isClickable = isCompleted;

                        return (
                            <div key={step.id} className="flex items-center gap-3">
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    onClick={() => {
                                        if (isClickable) onStepSelect(step.id);
                                    }}
                                    disabled={!isClickable && !isActive}
                                    className={cn(
                                        'group flex shrink-0 items-center gap-3 rounded-[1.35rem] border px-5 py-4 text-left transition-all duration-300',
                                        isActive
                                            ? 'border-white/20 bg-gradient-to-r from-[#5d63ff] via-[#9a3df4] to-[#cf47ff] text-white shadow-[0_18px_48px_rgba(126,76,255,0.42)]'
                                            : isCompleted
                                              ? 'cursor-pointer border-white/12 bg-white/[0.09] text-white hover:border-white/20 hover:bg-white/[0.13]'
                                              : 'cursor-not-allowed border-white/10 bg-white/[0.05] text-white/72',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
                                            isActive
                                                ? 'border-white/20 bg-white/12 text-white'
                                                : isCompleted
                                                  ? 'border-emerald-400/25 bg-emerald-500/12 text-emerald-300'
                                                  : 'border-white/10 bg-white/[0.04] text-white/60',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-lg font-semibold leading-none">
                                            {step.title}
                                        </span>
                                        <span
                                            className={cn(
                                                'mt-1 block text-xs tracking-[0.18em] uppercase',
                                                isActive
                                                    ? 'text-white/72'
                                                    : isCompleted
                                                      ? 'text-emerald-200/70'
                                                      : 'text-white/38',
                                            )}
                                        >
                                            {isCompleted
                                                ? 'Selesai'
                                                : isActive
                                                  ? 'Aktif'
                                                  : `Step ${step.id}`}
                                        </span>
                                    </span>
                                </motion.button>

                                {index < steps.length - 1 && (
                                    <ChevronRight className="h-5 w-5 shrink-0 text-white/28" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.28em] text-white/42 uppercase">
                        Step Aktif
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                        {activeStep.title}
                    </p>
                    <p className="text-sm text-white/58">
                        {activeStep.description}
                    </p>
                </div>
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-white/62 uppercase">
                    Step {currentStep}/{steps.length}
                </div>
            </div>
        </motion.section>
    );
}

export default function CreateSesiAbsen({ courses }: PageProps) {
    const [currentStep, setCurrentStep] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('sesiAbsenStep');
            if (saved) return Number.parseInt(saved, 10);
        }
        return 1;
    });
    const [formData, setFormData] = useState<FormDataState>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('sesiAbsenForm');
            if (saved) {
                try {
                    const initialData = createInitialFormData();
                    const parsed = JSON.parse(saved) as Partial<FormDataState>;

                    return {
                        ...initialData,
                        ...parsed,
                        qr_settings: {
                            ...initialData.qr_settings,
                            ...parsed.qr_settings,
                        },
                        gps_settings: {
                            ...initialData.gps_settings,
                            ...parsed.gps_settings,
                        },
                        selfie_settings: {
                            ...initialData.selfie_settings,
                            ...parsed.selfie_settings,
                        },
                        pengaturan_absensi: {
                            ...initialData.pengaturan_absensi,
                            ...parsed.pengaturan_absensi,
                        },
                        penilaian: {
                            ...initialData.penilaian,
                            ...parsed.penilaian,
                        },
                        sanksi: {
                            ...initialData.sanksi,
                            ...parsed.sanksi,
                        },
                    };
                } catch {
                    sessionStorage.removeItem('sesiAbsenForm');
                }
            }
        }
        return createInitialFormData();
    });

    // Save form state to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('sesiAbsenForm', JSON.stringify(formData));
        sessionStorage.setItem('sesiAbsenStep', currentStep.toString());
    }, [formData, currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep((curr) => curr + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((curr) => curr - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.visit('/admin/sesi-absen');
        }
    };

    const handleSaveDraft = () => {
        console.log('Draft Saved', formData);
    };

    const handlePublish = () => {
        // Safely construct datetime strings so incomplete forms trigger clean 422 errors, not 500s.
        const startDateTime =
            formData.tanggal && formData.waktu_mulai
                ? `${formData.tanggal} ${formData.waktu_mulai}:00`
                : '';
        const endDateTime =
            formData.tanggal && formData.waktu_selesai
                ? `${formData.tanggal} ${formData.waktu_selesai}:00`
                : '';

        // Map the advanced frontend formData to the backend SesiAbsenController specification
        const payload = {
            course_id: formData.mata_kuliah_id,
            meeting_number: selectedMeetingNumber || 1,
            title: formData.nama_sesi,
            description: formData.deskripsi,
            start_at: startDateTime,
            end_at: endDateTime,
            broadcast_notification: formData.notifikasi_mahasiswa,
            notification_title: formData.notification_title,
            notification_message: formData.notification_message,

            // Note: Advanced features (Zona, AI methods, settings) would need
            // further backend migration extensions to store in the DB.
            // Sending the base required fields to ensure it publishes correctly.
        };

        console.log('PAYLOAD DIKIRIM:', payload);

        router.post('/admin/sesi-absen', payload, {
            onSuccess: () => {
                sessionStorage.removeItem('sesiAbsenForm');
                sessionStorage.removeItem('sesiAbsenStep');
                // Backend will redirect to the index route
            },
            onError: (errors) => {
                console.error('Validation Errors:', errors);
                // Extract error messages into a readable string
                const errorMessages = Object.values(errors).join('\n- ');
                const alertMessage = errorMessages
                    ? `Penyimpanan Gagal. Silakan periksa kembali:\n- ${errorMessages}`
                    : 'Gagal mempublikasikan: Mohon lengkapi semua field yang wajib, seperti Mata Kuliah, Tanggal, dan Waktu.';

                alert(alertMessage);
            },
        });
    };

    const selectedCourse = courses?.find(
        (c) => c.id.toString() === formData.mata_kuliah_id,
    );
    const availableOfflineMeetings = useMemo(
        () =>
            selectedCourse
                ? selectedCourse.offline_meetings.filter(
                      (meetingNumber) =>
                          !selectedCourse.scheduled_meetings.includes(
                              meetingNumber,
                          ),
                  )
                : [],
        [selectedCourse],
    );
    const selectedMeetingNumber = (() => {
        const rawMeetingNumber = Number.parseInt(formData.pertemuan, 10);

        if (availableOfflineMeetings.length === 0) {
            return rawMeetingNumber;
        }

        return availableOfflineMeetings.includes(rawMeetingNumber)
            ? rawMeetingNumber
            : availableOfflineMeetings[0];
    })();
    const selectedMeetingTemplate = selectedCourse?.meeting_templates.find(
        (meeting) => meeting.meeting_number === selectedMeetingNumber,
    );
    const getQuickTemplate = (courseId: string, meetingNumberRaw: string) => {
        const course = courses.find((item) => item.id.toString() === courseId);
        const meetingNumber = Number.parseInt(meetingNumberRaw, 10);

        if (!course || Number.isNaN(meetingNumber)) {
            return null;
        }

        return (
            course.meeting_templates.find(
                (meeting) => meeting.meeting_number === meetingNumber,
            ) ?? null
        );
    };

    const applyMeetingTemplateToDraft = (
        draft: FormDataState,
        overrides?: Partial<Pick<FormDataState, 'mata_kuliah_id' | 'pertemuan'>>,
    ) => {
        const courseId = overrides?.mata_kuliah_id ?? draft.mata_kuliah_id;
        const meetingNumber = overrides?.pertemuan ?? draft.pertemuan;
        const template = getQuickTemplate(courseId, meetingNumber);

        if (!template?.quick_ready) {
            return draft;
        }

        return {
            ...draft,
            mata_kuliah_id: courseId,
            pertemuan: meetingNumber,
            nama_sesi: template.suggested_title,
            deskripsi: template.suggested_description,
        };
    };

    const applyMeetingTemplate = () => {
        setFormData((prev) => applyMeetingTemplateToDraft(prev));
    };

    const updateField = <K extends keyof FormDataState>(
        field: K,
        value: FormDataState[K],
    ) => {
        setFormData((prev) => {
            const nextDraft = { ...prev, [field]: value } as FormDataState;

            if (field === 'mata_kuliah_id' || field === 'pertemuan') {
                return applyMeetingTemplateToDraft(nextDraft, {
                    mata_kuliah_id:
                        field === 'mata_kuliah_id'
                            ? (value as FormDataState['mata_kuliah_id'])
                            : nextDraft.mata_kuliah_id,
                    pertemuan:
                        field === 'pertemuan'
                            ? (value as FormDataState['pertemuan'])
                            : nextDraft.pertemuan,
                });
            }

            return nextDraft;
        });
    };

    const toggleMethod = (method: string) => {
        setFormData((prev: typeof formData) => ({
            ...prev,
            metode_absensi: prev.metode_absensi.includes(method)
                ? prev.metode_absensi.filter((m: string) => m !== method)
                : [...prev.metode_absensi, method],
        }));
    };

    const toggleChannel = (channel: string) => {
        setFormData((prev: typeof formData) => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter((c: string) => c !== channel)
                : [...prev.channels, channel],
        }));
    };

    const handleSetToNow = () => {
        const now = new Date();
        // Adjust to local timezone string formats
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeNow = `${hours}:${minutes}`;

        // Add 2 hours for end time
        now.setHours(now.getHours() + 2);
        const endHours = String(now.getHours()).padStart(2, '0');
        const endMinutes = String(now.getMinutes()).padStart(2, '0');
        const timeEnd = `${endHours}:${endMinutes}`;

        setFormData((prev: typeof formData) => ({
            ...prev,
            tanggal: `${year}-${month}-${day}`,
            waktu_mulai: timeNow,
            waktu_selesai: timeEnd,
            waktu_buka_absen: timeNow,
        }));
    };

    return (
        <AppLayout>
            <Head title="Buat Sesi Absen Baru" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* HEADER SECTION EXACT MATCH TO KAS ADMIN */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
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
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    className="relative shrink-0"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                    }}
                                >
                                    <img
                                        src={SesiBaruIcon}
                                        alt="Sesi Baru"
                                        className="pointer-events-none h-20 w-20 object-contain drop-shadow-2xl"
                                    />
                                </motion.div>
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="text-sm font-semibold text-white/70">
                                            Admin
                                        </span>
                                        <ChevronRight className="h-3 w-3 text-white/50" />
                                        <span className="text-sm font-semibold text-white/70">
                                            Sesi Absen
                                        </span>
                                        <ChevronRight className="h-3 w-3 text-white/50" />
                                        <span className="text-sm font-bold text-white">
                                            Buat Baru
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                                        Buat Sesi Absen Baru
                                    </h1>
                                    <p className="mt-1 max-w-lg text-indigo-100">
                                        Atur jadwal, lokasi, dan pengaturan
                                        absensi dengan mudah
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN CONTAINER */}
                <div className="mx-auto max-w-6xl">
                    <WizardStepTracker
                        currentStep={currentStep}
                        onStepSelect={(step) => setCurrentStep(step)}
                    />

                    {/* FORM AREA */}
                    <motion.div
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/40"
                        variants={itemVariants}
                    >
                        <div className="p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                {/* === STEP 1: INFORMASI DASAR === */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
                                                    Informasi Dasar
                                                </h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Lengkapi identitas detail
                                                    untuk sesi absensi ini.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-neutral-900/50 dark:to-fuchsia-950/30">
                                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                    <div>
                                                        <p className="text-[11px] font-semibold tracking-[0.28em] text-indigo-500 uppercase">
                                                            Pertemuan Otomatis
                                                        </p>
                                                        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                                                            Nama sesi dan
                                                            deskripsi akan
                                                            mengikuti template
                                                            pertemuan offline
                                                        </h3>
                                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                            Cukup pilih
                                                            pertemuan offline.
                                                            Sistem akan
                                                            membaca data RPS,
                                                            mengisi nama sesi
                                                            dan deskripsi, lalu
                                                            mengaktifkan sesi
                                                            otomatis saat
                                                            jadwal dimulai.
                                                        </p>
                                                    </div>
                                                    <div className="inline-flex items-center rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-indigo-600 uppercase dark:border-indigo-800/60 dark:bg-white/5 dark:text-indigo-300">
                                                        Aktif Sesuai Jadwal
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
                                                        <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                                                            Offline Di RPS
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                                                            {selectedCourse
                                                                ? formatMeetingBadges(
                                                                      selectedCourse.offline_meetings,
                                                                  )
                                                                : 'Pilih mata kuliah dulu'}
                                                        </p>
                                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                            Belum dijadwalkan:{' '}
                                                            {selectedCourse
                                                                ? formatMeetingBadges(
                                                                      availableOfflineMeetings,
                                                                  )
                                                                : '-'}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
                                                        <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                                                            Meeting Dipilih
                                                        </p>
                                                        {!selectedCourse ||
                                                        !selectedMeetingNumber ? (
                                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                                Pilih mata
                                                                kuliah dan nomor
                                                                pertemuan untuk
                                                                melihat template
                                                                RPS.
                                                            </p>
                                                        ) : selectedMeetingTemplate ? (
                                                            <>
                                                                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                                    P
                                                                    {
                                                                        selectedMeetingTemplate.meeting_number
                                                                    }{' '}
                                                                    •{' '}
                                                                    {selectedMeetingTemplate.mode ??
                                                                        'belum ditandai'}
                                                                </p>
                                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                                    {selectedMeetingTemplate.topic ??
                                                                        'Topik RPS belum diisi.'}
                                                                </p>
                                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={
                                                                            applyMeetingTemplate
                                                                        }
                                                                        disabled={
                                                                            !selectedMeetingTemplate.quick_ready
                                                                        }
                                                                        className="border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                                                                    >
                                                                        <Zap className="mr-2 h-4 w-4" />
                                                                        Terapkan
                                                                        Template
                                                                    </Button>
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                        {selectedMeetingTemplate.quick_ready
                                                                            ? 'Template offline siap dipakai.'
                                                                            : selectedMeetingTemplate.is_offline
                                                                              ? 'Meeting offline ada, tapi topik/deskripsinya belum lengkap.'
                                                                              : 'Sesi absensi offline hanya bisa dibuat dari pertemuan offline.'}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p className="mt-2 text-sm text-amber-600 dark:text-amber-300">
                                                                Pertemuan ini
                                                                belum punya data
                                                                RPS.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                    <FileText className="h-4 w-4" />{' '}
                                                    Nama Sesi{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    value={formData.nama_sesi}
                                                    onChange={(e) =>
                                                        updateField(
                                                            'nama_sesi',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-12 rounded-xl border-white/30 bg-white/50 dark:border-neutral-800 dark:bg-black/20"
                                                    placeholder="Contoh: Perkuliahan Algoritma - Pertemuan 1"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                        <BookOpen className="h-4 w-4" />{' '}
                                                        Mata Kuliah{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Select
                                                        value={
                                                            formData.mata_kuliah_id
                                                        }
                                                        onValueChange={(v) =>
                                                            updateField(
                                                                'mata_kuliah_id',
                                                                v,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-12 rounded-xl border-white/30 bg-white/50 dark:border-neutral-800 dark:bg-black/20">
                                                            <SelectValue placeholder="Pilih Mata Kuliah" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {courses &&
                                                                courses.map(
                                                                    (
                                                                        course,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                course.id
                                                                            }
                                                                            value={course.id.toString()}
                                                                        >
                                                                            {
                                                                                course.nama
                                                                            }{' '}
                                                                            (
                                                                            {
                                                                                course.sks
                                                                            }{' '}
                                                                            SKS)
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                        <Users className="h-4 w-4" />{' '}
                                                        Dosen (Otomatis)
                                                    </Label>
                                                    <Input
                                                        disabled
                                                        value={
                                                            selectedCourse?.dosen ||
                                                            '-'
                                                        }
                                                        className="h-12 rounded-xl border-white/30 bg-white/50 text-slate-500 dark:border-neutral-800 dark:bg-black/20"
                                                        placeholder="Pilih Mata Kuliah terlebih dahulu"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                        <FileText className="h-4 w-4" />{' '}
                                                        Pertemuan Ke-{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </Label>
                                                    {(() => {
                                                        const maxMeetings = selectedCourse?.sks === 3 ? 21 : 14;
                                                        const hasOffline = selectedCourse?.offline_meetings.length ? true : false;
                                                        const scheduled = selectedCourse?.scheduled_meetings || [];
                                                        
                                                        const allOptions = hasOffline 
                                                            ? (selectedCourse?.offline_meetings || []) 
                                                            : Array.from({ length: maxMeetings }, (_, i) => i + 1);

                                                        return (
                                                            <Select
                                                                value={selectedMeetingNumber ? selectedMeetingNumber.toString() : ''}
                                                                onValueChange={(value) =>
                                                                    updateField('pertemuan', value)
                                                                }
                                                            >
                                                                <SelectTrigger className="h-12 rounded-xl border-white/30 bg-white/50 dark:border-neutral-800 dark:bg-black/20">
                                                                    <SelectValue placeholder={`Pilih pertemuan ${hasOffline ? 'offline' : ''}`} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {allOptions.length === 0 ? (
                                                                        <SelectItem value="__empty__" disabled>
                                                                            Belum ada data pertemuan
                                                                        </SelectItem>
                                                                    ) : (
                                                                        allOptions.map((meetingNumber) => {
                                                                            const isScheduled = scheduled.includes(meetingNumber);
                                                                            return (
                                                                                <SelectItem
                                                                                    key={meetingNumber}
                                                                                    value={meetingNumber.toString()}
                                                                                    disabled={isScheduled}
                                                                                    className={isScheduled ? "text-slate-400 dark:text-slate-600 focus:bg-transparent" : ""}
                                                                                >
                                                                                    Pertemuan {meetingNumber} {isScheduled ? "(Sudah Selesai / Ada)" : ""}
                                                                                </SelectItem>
                                                                            );
                                                                        })
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                    <AlignLeft className="h-4 w-4" />{' '}
                                                    Deskripsi Sesi (Opsional)
                                                </Label>
                                                <Textarea
                                                    value={formData.deskripsi}
                                                    onChange={(e) =>
                                                        updateField(
                                                            'deskripsi',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-[120px] rounded-xl border-white/30 bg-white/50 dark:border-neutral-800 dark:bg-black/20"
                                                    placeholder="Tambahkan catatan khusus, instruksi, atau link materi untuk mahasiswa di sini..."
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 2: JADWAL & WAKTU === */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-xl bg-fuchsia-100 p-3 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400">
                                                    <Calendar className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h2 className="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent whitespace-nowrap dark:from-fuchsia-400 dark:to-pink-400">
                                                        Jadwal & Waktu
                                                    </h2>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Sesuaikan hari, jam tayang,
                                                        waktu buka dan tutup absensi.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={handleSetToNow}
                                                className="w-full shrink-0 border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600 shadow-sm hover:bg-fuchsia-100 md:w-auto dark:border-fuchsia-800/50 dark:bg-fuchsia-900/20 dark:hover:bg-fuchsia-900/40"
                                            >
                                                <Zap className="mr-2 h-4 w-4" />
                                                Isi Sesi Sekarang
                                            </Button>
                                        </div>

                                        <div className="space-y-8">
                                            {/* Waktu Sesi Utama */}
                                            <div className="grid grid-cols-1 gap-6 rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl md:grid-cols-3 dark:border-white/5 dark:bg-neutral-900/40">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                        <Calendar className="h-4 w-4" />{' '}
                                                        Tanggal Sesi{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.tanggal}
                                                        onChange={(e) =>
                                                            updateField(
                                                                'tanggal',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-12 rounded-xl border-white/30 bg-white/50 dark:border-neutral-800 dark:bg-black/20 dark:[color-scheme:dark]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                        <Clock className="h-4 w-4" />{' '}
                                                        Waktu Mulai{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={
                                                            formData.waktu_mulai
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                'waktu_mulai',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-12 rounded-xl border-white/30 bg-white/50 dark:border-neutral-800 dark:bg-black/20 dark:[color-scheme:dark]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                        <Clock className="h-4 w-4" />{' '}
                                                        Waktu Selesai{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={
                                                            formData.waktu_selesai
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                'waktu_selesai',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-12 rounded-xl border-white/30 bg-white/50 dark:border-neutral-800 dark:bg-black/20 dark:[color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Waktu Scan Absensi */}
                                            <h3 className="mt-4 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                                                <Scan className="h-5 w-5 text-indigo-500" />{' '}
                                                Interval Scan Absensi
                                            </h3>
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-800/50 dark:bg-emerald-900/10">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-emerald-200">
                                                        <Unlock className="h-4 w-4" />{' '}
                                                        Waktu Buka Absen
                                                    </Label>
                                                    <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                                                        Berapa menit sebelum
                                                        sesi mulai absen dibuka?
                                                    </p>
                                                    <Input
                                                        type="time"
                                                        value={
                                                            formData.waktu_buka_absen
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                'waktu_buka_absen',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-12 rounded-xl bg-white/80 dark:bg-black/40 dark:[color-scheme:dark]"
                                                    />
                                                </div>
                                                <div className="space-y-2 rounded-2xl border border-rose-100 bg-rose-50 p-5 dark:border-rose-800/50 dark:bg-rose-900/10">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-rose-200">
                                                        <Lock className="h-4 w-4" />{' '}
                                                        Waktu Tutup Absen
                                                    </Label>
                                                    <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                                                        Jam berapa mahasiswa
                                                        sudah tidak bisa absen?
                                                    </p>
                                                    <Input
                                                        type="time"
                                                        value={
                                                            formData.waktu_tutup_absen
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                'waktu_tutup_absen',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-12 rounded-xl bg-white/80 dark:bg-black/40 dark:[color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Toleransi & Recurring */}
                                            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                        <Timer className="h-4 w-4" />{' '}
                                                        Toleransi Keterlambatan
                                                        (Menit)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            formData.toleransi_keterlambatan
                                                        }
                                                        onChange={(e) =>
                                                            updateField(
                                                                'toleransi_keterlambatan',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="h-12 rounded-xl border-white/30 bg-white/50 dark:border-neutral-800 dark:bg-black/20"
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-4 rounded-xl border border-white/30 bg-white/30 p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
                                                    <div className="flex-1">
                                                        <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                                                            <Repeat className="h-4 w-4" />{' '}
                                                            Ulangi Otomatis
                                                            (Recurring)
                                                        </Label>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Buat sesi yang sama
                                                            setiap minggu
                                                            otomatis.
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={
                                                            formData.recurring
                                                        }
                                                        onCheckedChange={(v: boolean) =>
                                                            updateField(
                                                                'recurring',
                                                                v,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 3: LOKASI & ZONA === */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <Map className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent dark:from-emerald-400 dark:to-teal-400">
                                                    Lokasi & Zona
                                                </h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Dimana sesi ini berlangsung?
                                                    Atur geofencing untuk
                                                    physical class.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Label className="font-semibold text-slate-700 dark:text-slate-200">
                                                Jenis Sesi & Ruangan
                                            </Label>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div
                                                    onClick={() =>
                                                        updateField(
                                                            'tipe_lokasi',
                                                            'fisik',
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all',
                                                        formData.tipe_lokasi ===
                                                            'fisik'
                                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                            : 'border-white/30 bg-white/20 hover:bg-white/40 dark:border-neutral-800 dark:bg-neutral-800/20',
                                                    )}
                                                >
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900">
                                                        <Building className="h-6 w-6" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">
                                                            Fisik (Ruangan)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    onClick={() =>
                                                        updateField(
                                                            'tipe_lokasi',
                                                            'online',
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all',
                                                        formData.tipe_lokasi ===
                                                            'online'
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-white/30 bg-white/20 hover:bg-white/40 dark:border-neutral-800 dark:bg-neutral-800/20',
                                                    )}
                                                >
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900">
                                                        <Globe className="h-6 w-6" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">
                                                            Online (Virtual)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    onClick={() =>
                                                        updateField(
                                                            'tipe_lokasi',
                                                            'hybrid',
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all',
                                                        formData.tipe_lokasi ===
                                                            'hybrid'
                                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                            : 'border-white/30 bg-white/20 hover:bg-white/40 dark:border-neutral-800 dark:bg-neutral-800/20',
                                                    )}
                                                >
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900">
                                                        <Blend className="h-6 w-6" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">
                                                            Hybrid
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Launcher untuk Pengaturan Detail */}
                                            {(formData.tipe_lokasi ===
                                                'fisik' ||
                                                formData.tipe_lokasi ===
                                                    'hybrid') && (
                                                <div className="relative mt-8 animate-in fade-in slide-in-from-bottom-4">
                                                    {/* If zone is already saved, show success UI */}
                                                    {formData.zona_lat &&
                                                    formData.zona_lng ? (
                                                        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-white/40 p-8 shadow-2xl backdrop-blur-xl transition-all dark:bg-neutral-900/40">
                                                            {/* Background Glow */}
                                                            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                                                            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

                                                            <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
                                                                <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
                                                                    <motion.div
                                                                        className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-xl shadow-emerald-500/40"
                                                                        animate={{
                                                                            y: [
                                                                                0,
                                                                                -5,
                                                                                0,
                                                                            ],
                                                                        }}
                                                                        transition={{
                                                                            duration: 3,
                                                                            repeat: Infinity,
                                                                            ease: 'easeInOut',
                                                                        }}
                                                                    >
                                                                        <MapPin className="h-10 w-10" />
                                                                        <div className="absolute -top-2 -right-2 rounded-full border border-emerald-200 bg-emerald-100 p-1 text-emerald-700 shadow-md">
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        </div>
                                                                    </motion.div>
                                                                    <div>
                                                                        <h3 className="mb-1 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-black text-transparent dark:from-emerald-400 dark:to-teal-400">
                                                                            Geofencing
                                                                            Siap
                                                                            Digunakan
                                                                        </h3>
                                                                        <p className="mb-4 max-w-md text-slate-500 dark:text-slate-400">
                                                                            Titik
                                                                            koordinat
                                                                            dan
                                                                            radius
                                                                            pengawasan
                                                                            telah
                                                                            diatur.
                                                                            Sesi
                                                                            kelas
                                                                            fisik
                                                                            Anda
                                                                            sudah
                                                                            terlindungi.
                                                                        </p>

                                                                        <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                                                            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-900/30">
                                                                                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                                                                    {
                                                                                        formData.zona_lat
                                                                                    }
                                                                                    ,{' '}
                                                                                    {
                                                                                        formData.zona_lng
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-900/30">
                                                                                <Radar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                                                                    Radius:{' '}
                                                                                    {
                                                                                        formData.zona_radius
                                                                                    }{' '}
                                                                                    Meter
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            '/admin/zona?redirect=/admin/sesi-absen/create',
                                                                        )
                                                                    }
                                                                    variant="outline"
                                                                    size="lg"
                                                                    className="h-14 w-full rounded-xl border-emerald-300 bg-white/60 px-8 font-bold text-emerald-700 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-emerald-50 md:w-auto dark:border-emerald-700/50 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-800/60"
                                                                >
                                                                    <Edit className="mr-2 h-5 w-5" />
                                                                    Ubah
                                                                    Parameter
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/20 dark:hover:border-emerald-600/60 dark:hover:bg-emerald-900/30">
                                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm transition-transform group-hover:scale-110 group-hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-400 dark:group-hover:bg-emerald-800/80">
                                                                <MapPin className="h-8 w-8 transition-colors" />
                                                            </div>
                                                            <h3 className="mb-2 text-lg font-bold text-emerald-900 dark:text-emerald-100">
                                                                Tentukan Geofencing & Ruangan
                                                            </h3>
                                                            <p className="mb-6 max-w-md text-xs text-emerald-700/80 leading-relaxed dark:text-emerald-300/80">
                                                                Untuk kelas fisik, mahasiswa diwajibkan berada dalam radius yang Anda tentukan dari titik pusat kelas agar dapat melakukan presensi kehadiran.
                                                            </p>

                                                            <Button
                                                                onClick={() =>
                                                                    router.visit(
                                                                        '/admin/zona?redirect=/admin/sesi-absen/create',
                                                                    )
                                                                }
                                                                className="flex h-11 w-full items-center justify-center gap-2 transform rounded-xl border border-emerald-500 bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 hover:bg-emerald-700 sm:w-auto dark:border-emerald-500 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
                                                            >
                                                                <Settings className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
                                                                Atur Lokasi & Zona Sekarang
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Jika Online atau Hybrid */}
                                            {(formData.tipe_lokasi ===
                                                'online' ||
                                                formData.tipe_lokasi ===
                                                    'hybrid') && (
                                                <div className="mt-6 animate-in space-y-4 rounded-2xl border border-blue-500/30 bg-blue-50/50 p-5 duration-500 fade-in slide-in-from-top-4 dark:bg-blue-900/10">
                                                    <Label className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
                                                        <Video className="h-5 w-5" />{' '}
                                                        Meeting Online Settings
                                                        (Opsional)
                                                    </Label>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">
                                                            Link Platform
                                                            (Zoom/Meet/Teams)
                                                        </Label>
                                                        <Input
                                                            placeholder="https://zoom.us/j/123456789"
                                                            className="h-11 bg-white/80 dark:bg-black/40"
                                                            value={
                                                                formData.link_meeting
                                                            }
                                                            onChange={(e) =>
                                                                updateField(
                                                                    'link_meeting',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 4: METODE ABSENSI === */}
                                {currentStep === 4 && (
                                    <motion.div
                                        key="step4"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="rounded-xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                                <Fingerprint className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-2xl font-bold text-transparent dark:from-amber-400 dark:to-orange-400">
                                                    Metode Absensi
                                                </h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Pilih satu atau lebih cara
                                                    mahasiswa memvalidasi
                                                    kehadiran.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {[
                                                {
                                                    id: 'qr',
                                                    title: 'QR Code Dynamic',
                                                    desc: 'Scan QR di layar dosen yang refresh tiap detik',
                                                    icon: QrCode,
                                                    color: 'text-indigo-500',
                                                },
                                                {
                                                    id: 'gps',
                                                    title: 'Location Tracker',
                                                    desc: 'Wajib berada di zona radius kampus',
                                                    icon: MapPin,
                                                    color: 'text-emerald-500',
                                                },
                                                {
                                                    id: 'selfie',
                                                    title: 'AI Face Selfie',
                                                    desc: 'Verifikasi wajah dengan AI matching',
                                                    icon: Camera,
                                                    color: 'text-rose-500',
                                                },
                                                {
                                                    id: 'manual',
                                                    title: 'Manual Check-in',
                                                    desc: 'Klik tombol hadir di aplikasi',
                                                    icon: Smartphone,
                                                    color: 'text-blue-500',
                                                },
                                            ].map((method) => {
                                                const isSelected =
                                                    formData.metode_absensi.includes(
                                                        method.id,
                                                    );
                                                return (
                                                    <div
                                                        key={method.id}
                                                        onClick={() =>
                                                            toggleMethod(
                                                                method.id,
                                                            )
                                                        }
                                                        className={cn(
                                                            'relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 transition-all',
                                                            isSelected
                                                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20'
                                                                : 'border-white/30 bg-white/20 hover:bg-white/40 dark:border-neutral-800 dark:bg-neutral-800/20',
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-3 right-3 text-amber-500">
                                                                <CheckCircle className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={cn(
                                                                    'rounded-full bg-white p-3 shadow-sm dark:bg-black/50',
                                                                    method.color,
                                                                )}
                                                            >
                                                                <method.icon className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                                                    {
                                                                        method.title
                                                                    }
                                                                </h4>
                                                                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                                                    {
                                                                        method.desc
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Inline Settings Panel for QR and Selfie */}
                                        <AnimatePresence>
                                            {(formData.metode_absensi.includes(
                                                'qr',
                                            ) ||
                                                formData.metode_absensi.includes(
                                                    'selfie',
                                                )) && (
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
                                                    className="mt-6 overflow-hidden"
                                                >
                                                    <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 shadow-inner dark:border-amber-800/50 dark:bg-amber-900/10">
                                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                                                            <Settings className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                                            Parameter Metode
                                                            Lanjutan
                                                        </h3>

                                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                            {/* QR Settings */}
                                                            {formData.metode_absensi.includes(
                                                                'qr',
                                                            ) && (
                                                                <div className="space-y-3 rounded-xl border border-white/50 bg-white/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                                                                        <QrCode className="h-4 w-4 text-indigo-500" />{' '}
                                                                        Dynamic
                                                                        QR
                                                                        Interval
                                                                    </Label>
                                                                    <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                                                                        QR Code
                                                                        akan
                                                                        diperbarui
                                                                        otomatis
                                                                        setiap
                                                                        detik
                                                                        ini.
                                                                    </p>
                                                                    <Select
                                                                        value={
                                                                            formData.qr_settings.refresh_interval?.toString() ||
                                                                            '15'
                                                                        }
                                                                        onValueChange={(
                                                                            val,
                                                                        ) =>
                                                                            setFormData(
                                                                                (
                                                                                    prev: typeof formData,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    qr_settings:
                                                                                        {
                                                                                            ...prev.qr_settings,
                                                                                            refresh_interval:
                                                                                                parseInt(
                                                                                                    val,
                                                                                                ),
                                                                                        },
                                                                                }),
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="h-11 border-slate-200 bg-white dark:border-slate-800 dark:bg-black/50">
                                                                            <SelectValue placeholder="Pilih interval" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="5">
                                                                                Super
                                                                                Cepat
                                                                                (5
                                                                                Detik)
                                                                            </SelectItem>
                                                                            <SelectItem value="10">
                                                                                Cepat
                                                                                (10
                                                                                Detik)
                                                                            </SelectItem>
                                                                            <SelectItem value="15">
                                                                                Normal
                                                                                (15
                                                                                Detik)
                                                                            </SelectItem>
                                                                            <SelectItem value="30">
                                                                                Santai
                                                                                (30
                                                                                Detik)
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}

                                                            {/* Selfie Settings */}
                                                            {formData.metode_absensi.includes(
                                                                'selfie',
                                                            ) && (
                                                                <div className="space-y-4 rounded-xl border border-white/50 bg-white/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                                                                    <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                                                                        <Camera className="h-4 w-4 text-rose-500" />{' '}
                                                                        AI
                                                                        Selfie
                                                                        Configuration
                                                                    </Label>

                                                                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                                                                        <div className="space-y-0.5">
                                                                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                                                Liveness
                                                                                Check
                                                                            </Label>
                                                                            <p className="text-[10px] text-slate-500">
                                                                                Cegah
                                                                                foto
                                                                                palsu
                                                                                atau
                                                                                print
                                                                                foto.
                                                                            </p>
                                                                        </div>
                                                                        <Switch
                                                                            checked={
                                                                                formData
                                                                                    .selfie_settings
                                                                                    .liveness_check ??
                                                                                true
                                                                            }
                                                                            onCheckedChange={(
                                                                                val: boolean,
                                                                            ) =>
                                                                                setFormData(
                                                                                    (
                                                                                        prev: typeof formData,
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        selfie_settings:
                                                                                            {
                                                                                                ...prev.selfie_settings,
                                                                                                liveness_check:
                                                                                                    val,
                                                                                            },
                                                                                    }),
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                                            Tingkat
                                                                            Ketat
                                                                            (Strictness)
                                                                        </Label>
                                                                        <Select
                                                                            value={
                                                                                formData
                                                                                    .selfie_settings
                                                                                    .strictness_level ||
                                                                                'medium'
                                                                            }
                                                                            onValueChange={(
                                                                                val,
                                                                            ) => {
                                                                                if (
                                                                                    !isStrictnessLevel(
                                                                                        val,
                                                                                    )
                                                                                ) {
                                                                                    return;
                                                                                }

                                                                                setFormData(
                                                                                    (
                                                                                        prev: typeof formData,
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        selfie_settings:
                                                                                            {
                                                                                                ...prev.selfie_settings,
                                                                                                strictness_level:
                                                                                                    val,
                                                                                            },
                                                                                    }),
                                                                                );
                                                                            }
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="h-10 border-slate-200 bg-white dark:border-slate-800 dark:bg-black/50">
                                                                                <SelectValue placeholder="Pilih Strictness" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="low">
                                                                                    Rendah
                                                                                    (Mudah
                                                                                    cocok)
                                                                                </SelectItem>
                                                                                <SelectItem value="medium">
                                                                                    Sedang
                                                                                    (Rekomendasi)
                                                                                </SelectItem>
                                                                                <SelectItem value="high">
                                                                                    Tinggi
                                                                                    (Sangat
                                                                                    akurat)
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* === STEP 5: PENGATURAN LANJUTAN === */}
                                {currentStep === 5 && (
                                    <motion.div
                                        key="step5"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="rounded-xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                                <Settings className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-2xl font-bold text-transparent dark:from-rose-400 dark:to-red-400">
                                                    Pengaturan Lanjutan
                                                </h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Status, Visibilitas, Aturan
                                                    Ketat, dan Sanksi.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-3">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200">
                                                        Status Sesi
                                                    </Label>
                                                    <div className="flex gap-4">
                                                        <div
                                                            onClick={() =>
                                                                updateField(
                                                                    'status',
                                                                    'published',
                                                                )
                                                            }
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2',
                                                                formData.status ===
                                                                    'published'
                                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                    : 'border-white/30 dark:border-neutral-800',
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    'h-4 w-4 rounded-full border',
                                                                    formData.status ===
                                                                        'published'
                                                                        ? 'border-red-500 bg-red-500'
                                                                        : 'border-slate-400',
                                                                )}
                                                            />
                                                            <Label className="cursor-pointer">
                                                                Published
                                                            </Label>
                                                        </div>
                                                        <div
                                                            onClick={() =>
                                                                updateField(
                                                                    'status',
                                                                    'draft',
                                                                )
                                                            }
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2',
                                                                formData.status ===
                                                                    'draft'
                                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                    : 'border-white/30 dark:border-neutral-800',
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    'h-4 w-4 rounded-full border',
                                                                    formData.status ===
                                                                        'draft'
                                                                        ? 'border-red-500 bg-red-500'
                                                                        : 'border-slate-400',
                                                                )}
                                                            />
                                                            <Label className="cursor-pointer">
                                                                Draft
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200">
                                                        Visibilitas
                                                    </Label>
                                                    <div className="flex gap-4">
                                                        <div
                                                            onClick={() =>
                                                                updateField(
                                                                    'visibilitas',
                                                                    'all',
                                                                )
                                                            }
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2',
                                                                formData.visibilitas ===
                                                                    'all'
                                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                    : 'border-white/30 dark:border-neutral-800',
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    'h-4 w-4 rounded-full border',
                                                                    formData.visibilitas ===
                                                                        'all'
                                                                        ? 'border-red-500 bg-red-500'
                                                                        : 'border-slate-400',
                                                                )}
                                                            />
                                                            <Label className="cursor-pointer">
                                                                Semua Mahasiswa
                                                                Kelas
                                                            </Label>
                                                        </div>
                                                        <div
                                                            onClick={() =>
                                                                updateField(
                                                                    'visibilitas',
                                                                    'selected',
                                                                )
                                                            }
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2',
                                                                formData.visibilitas ===
                                                                    'selected'
                                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                    : 'border-white/30 dark:border-neutral-800',
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    'h-4 w-4 rounded-full border',
                                                                    formData.visibilitas ===
                                                                        'selected'
                                                                        ? 'border-red-500 bg-red-500'
                                                                        : 'border-slate-400',
                                                                )}
                                                            />
                                                            <Label className="cursor-pointer">
                                                                Mahasiswa
                                                                Tertentu
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-neutral-800">
                                                <h3 className="flex items-center gap-2 font-bold">
                                                    <Lock className="h-4 w-4" />{' '}
                                                    Aturan Absensi Ekstra
                                                </h3>
                                                <div className="flex items-center justify-between rounded-xl border border-white/30 bg-white/30 p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
                                                    <div>
                                                        <Label className="font-semibold text-slate-700 dark:text-slate-200">
                                                            Izinkan
                                                            Keterlambatan
                                                        </Label>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Mahasiswa tetap bisa
                                                            absen setelah waktu
                                                            mulai, status
                                                            (Terlambat)
                                                        </p>
                                                    </div>
                                                    <Switch defaultChecked />
                                                </div>
                                                <div className="flex items-center justify-between rounded-xl border border-white/30 bg-white/30 p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
                                                    <div>
                                                        <Label className="font-semibold text-slate-700 dark:text-slate-200">
                                                            Izinkan Izin/Sakit
                                                            via App
                                                        </Label>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Mahasiswa dapat
                                                            mengunggah surat
                                                            dokter langsung.
                                                        </p>
                                                    </div>
                                                    <Switch defaultChecked />
                                                </div>
                                                <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-50/50 p-4 dark:bg-red-900/10">
                                                    <div>
                                                        <Label className="font-semibold text-red-700 dark:text-red-400">
                                                            Aktifkan Sanksi Alpa
                                                        </Label>
                                                        <p className="text-xs text-red-600/70 dark:text-red-400/70">
                                                            Otomatis kirim surat
                                                            peringatan (SP) jika
                                                            alpa melebihi batas.
                                                        </p>
                                                    </div>
                                                    <Switch />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 6: NOTIFIKASI === */}
                                {currentStep === 6 && (
                                    <motion.div
                                        key="step6"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                <Bell className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-cyan-400">
                                                    Notifikasi & Broadcast
                                                </h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Kirim pengingat agar
                                                    mahasiswa tidak lupa
                                                    absensi.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {/* Notifikasi Toggle */}
                                            <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/40 p-5 shadow-sm backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                                        <Bell className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <Label className="text-base font-bold text-slate-800 dark:text-slate-200">
                                                            Aktifkan Notifikasi Mahasiswa
                                                        </Label>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                            Izinkan sistem mengirimkan pengingat ke mahasiswa tergabung.
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={formData.notifikasi_mahasiswa}
                                                    onCheckedChange={(val) => updateField('notifikasi_mahasiswa', val)}
                                                    className="scale-110"
                                                />
                                            </div>

                                            <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr] transition-opacity duration-300", formData.notifikasi_mahasiswa ? "opacity-100" : "opacity-40 pointer-events-none")}>
                                                {/* Kustomisasi Teks */}
                                                <div className="space-y-5 rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                                    <Label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                                        <MessageSquare className="h-5 w-5 text-blue-500" />
                                                        Kustomisasi Pesan 
                                                    </Label>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                                Judul Notifikasi
                                                            </Label>
                                                            <Input
                                                                value={formData.notification_title}
                                                                onChange={(e) => updateField('notification_title', e.target.value)}
                                                                placeholder="Contoh: Sesi Absen Kuliah Pengganti"
                                                                className="h-12 rounded-xl bg-white/60 dark:bg-black/40"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                                Isi Pesan Pendek
                                                            </Label>
                                                            <Textarea
                                                                value={formData.notification_message}
                                                                onChange={(e) => updateField('notification_message', e.target.value)}
                                                                placeholder="Contoh: Jangan lupa untuk absen tepat waktu hari ini."
                                                                className="rounded-xl bg-white/60 dark:bg-black/40"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {/* Delivery Channels */}
                                                    <div className="space-y-4 rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                                        <Label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                                            <Zap className="h-5 w-5 text-indigo-500" />
                                                            Kirim Melalui
                                                        </Label>
                                                        <div className="flex flex-col gap-3">
                                                            {[
                                                                { id: 'push', label: 'In-App / Push', icon: Smartphone },
                                                                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                                                                { id: 'email', label: 'Email', icon: Mail },
                                                            ].map((channel) => (
                                                                <div
                                                                    key={channel.id}
                                                                    onClick={() => toggleChannel(channel.id)}
                                                                    className={cn(
                                                                        'flex cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 transition-all',
                                                                        formData.channels.includes(channel.id)
                                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                                                            : 'border-white/30 bg-white/20 hover:bg-white/40 dark:border-neutral-800 dark:bg-neutral-800/20'
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <channel.icon className={cn("h-5 w-5", formData.channels.includes(channel.id) ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400")} />
                                                                        <span className={cn("text-sm font-semibold", formData.channels.includes(channel.id) ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300")}>
                                                                            {channel.label}
                                                                        </span>
                                                                    </div>
                                                                    <div className={cn("flex h-5 w-5 items-center justify-center rounded-full border", formData.channels.includes(channel.id) ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-600")}>
                                                                        {formData.channels.includes(channel.id) && <CheckCircle className="h-3 w-3 text-white" />}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Reminder Timing */}
                                                    <div className="space-y-4 rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                                        <Label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                                            <TrendingUp className="h-5 w-5 text-rose-500" />
                                                            Auto Reminder
                                                        </Label>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 rounded-lg bg-white/50 p-2 dark:bg-black/20">
                                                                <Checkbox id="t1" defaultChecked className="border-slate-400 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500" />
                                                                <Label htmlFor="t1" className="cursor-pointer text-sm font-medium">1 Hari Sebelum</Label>
                                                            </div>
                                                            <div className="flex items-center gap-3 rounded-lg bg-white/50 p-2 dark:bg-black/20">
                                                                <Checkbox id="t2" defaultChecked className="border-slate-400 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500" />
                                                                <Label htmlFor="t2" className="cursor-pointer text-sm font-medium">30 Menit Sebelum</Label>
                                                            </div>
                                                            <div className="flex items-center gap-3 rounded-lg bg-white/50 p-2 dark:bg-black/20">
                                                                <Checkbox id="t3" defaultChecked className="border-slate-400 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500" />
                                                                <Label htmlFor="t3" className="cursor-pointer text-xs font-medium">15 Menit Sebelum Tutup</Label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 7: REVIEW & PUBLISH === */}
                                {currentStep === 7 && (
                                    <motion.div
                                        key="step7"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                                <CheckCircle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-2xl font-bold text-transparent dark:from-green-400 dark:to-emerald-400">
                                                    Review & Publish
                                                </h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Pastikan semua data sudah
                                                    benar sebelum menyimpan.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="group relative space-y-3 rounded-2xl border border-white/30 bg-white/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/50">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={() =>
                                                        setCurrentStep(1)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase">
                                                    <FileText className="h-4 w-4" />{' '}
                                                    Info Dasar
                                                </h3>
                                                <p className="text-lg font-bold">
                                                    {formData.nama_sesi ||
                                                        'Belum diisi'}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                    Dosen:{' '}
                                                    {selectedCourse?.dosen ||
                                                        '-'}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                    Pertemuan Ke:{' '}
                                                    {selectedMeetingNumber || '-'}
                                                </p>
                                            </div>
                                            <div className="group relative space-y-3 rounded-2xl border border-white/30 bg-white/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/50">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={() =>
                                                        setCurrentStep(2)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase">
                                                    <Clock className="h-4 w-4" />{' '}
                                                    Waktu Sesi
                                                </h3>
                                                <p className="text-lg font-bold">
                                                    {formData.tanggal
                                                        ? formData.tanggal
                                                        : 'XX-XX-XXXX'}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                    {formData.waktu_mulai ||
                                                        '00:00'}{' '}
                                                    s/d{' '}
                                                    {formData.waktu_selesai ||
                                                        '00:00'}{' '}
                                                    WIB
                                                </p>
                                            </div>
                                            <div className="group relative space-y-3 rounded-2xl border border-white/30 bg-white/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/50">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={() =>
                                                        setCurrentStep(3)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase">
                                                    <MapPin className="h-4 w-4" />{' '}
                                                    Lokasi
                                                </h3>
                                                <p className="text-lg font-bold capitalize">
                                                    {formData.tipe_lokasi}
                                                </p>
                                                {formData.tipe_lokasi ===
                                                    'fisik' && (
                                                    <p className="text-sm text-emerald-600 dark:text-emerald-300">
                                                        <CheckCircle className="mr-1 inline h-3 w-3" />{' '}
                                                        Geofencing Aktif
                                                    </p>
                                                )}
                                            </div>
                                            <div className="relative space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 dark:bg-emerald-900/10">
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase">
                                                    <ShieldCheck className="h-4 w-4" />{' '}
                                                    Siap dipublish
                                                </h3>
                                                <p className="text-sm">
                                                    Semua notifikasi aktif. QR
                                                    Code dan Geofence akan
                                                    otomatis dibuat setelah
                                                    publish.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* BOTTOM NAVIGATION ACTIONS */}
                            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-neutral-800">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="h-12 rounded-xl px-6"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    {currentStep === 1 ? 'Batal' : 'Kembali'}
                                </Button>

                                <div className="flex gap-3">
                                    {currentStep < steps.length ? (
                                        <Button
                                            onClick={handleNext}
                                            className="h-12 rounded-xl border-0 bg-gradient-to-r from-indigo-500 to-purple-600 px-8 text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700"
                                        >
                                            Lanjut
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={handleSaveDraft}
                                                className="h-12 rounded-xl px-6"
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                Simpan Draft
                                            </Button>
                                            <Button
                                                onClick={handlePublish}
                                                className="h-12 rounded-xl border-0 bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600"
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                Publish Sesi
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AppLayout>
    );
}

// Icon fallbacks due to missing imports or missing lucide components used below
const CheckCircle = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const ShieldCheck = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
const Scan = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
);
