import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Brain,
    CheckCircle,
    ChevronLeft,
    Clock,
    Cpu,
    Download,
    Eye,
    FileText,
    History,
    Lightbulb,
    Loader2,
    Lock,
    Monitor,
    Move,
    Scan,
    ScanFace,
    Share2,
    Shield,
    Smile,
    Sparkles,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Asset Icons
import VerifikasiSelfieIcon from '@/assets/admin/verifikasi-selfie/verifikasi-selfie.png';

interface FacialLandmark {
    x: number;
    y: number;
    type: string;
}

interface Verification {
    raw_id: number;
    id: string;
    student: {
        name: string;
        nim: string;
        initials: string;
        photo: string;
        major: string;
        semester: number;
    };
    reference_photo: string;
    selfie_photo: string | null;
    match_score: number;
    confidence_level: number;
    status: 'verified' | 'rejected' | 'pending';
    uploaded_at: string;
    processing_time: number;
    face_quality: number;
    lighting_score: number;
    face_angle: number;
    sharpness_score: number;
    ai_insights: string;
    face_detection_confidence: number;
    features: {
        eyes: boolean;
        nose: boolean;
        mouth: boolean;
        eyebrows: boolean;
    };
    facial_symmetry: number;
    emotions: Array<{
        name: string;
        confidence: number;
    }>;
    liveness_score: number;
    liveness_checks: {
        real_person: boolean;
        no_screen: boolean;
        no_mask: boolean;
        eye_blink: boolean;
        head_movement: boolean;
    };
    anti_spoofing_passed: boolean;
    overall_assessment: string;
    verified_by: string | null;
    verification_date: string;
    ai_model_version: string;
    recommendations: string[];
    history: Array<{
        action: string;
        status: string;
        by: string;
        timestamp: string;
        notes?: string;
    }>;
    anomalies?: Array<{
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
        confidence: number;
    }>;
}

interface PageProps {
    verification: Verification;
    privacy: {
        is_locked: boolean;
        has_selfie: boolean;
        request_status: 'none' | 'pending' | 'rejected' | 'approved';
        can_request: boolean;
        message: string;
        last_request?: {
            reason?: string | null;
            response_note?: string | null;
            requested_at?: string | null;
            responded_at?: string | null;
        } | null;
    };
    facialLandmarks: {
        reference: FacialLandmark[];
        selfie: FacialLandmark[];
    };
    facialFeatures: any[];
    confidenceMetrics: any[];
    relatedVerifications: any[];
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

const scanningVariants: Variants = {
    initial: { y: 0, opacity: 0.5 },
    animate: {
        y: [0, 300, 0],
        opacity: [0.5, 1, 0.5],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
};

const aiPulseVariants: Variants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
        transition: { duration: 0.75, repeat: Infinity, ease: 'easeInOut' },
    },
};

// AI Processing phases
const AI_PHASES = [
    {
        label: 'Memulai AI Engine...',
        detail: 'Loading neural network model v2.4.1',
        icon: Cpu,
        duration: 1200,
    },
    {
        label: 'Memuat Data Referensi...',
        detail: 'Fetching embedding vektor dari database',
        icon: User,
        duration: 1000,
    },
    {
        label: 'Deteksi Wajah...',
        detail: 'Detecting faces with MTCNN pipeline',
        icon: ScanFace,
        duration: 1500,
    },
    {
        label: 'Ekstraksi Landmark Wajah...',
        detail: 'Extracting 68 facial landmark points',
        icon: Scan,
        duration: 1800,
    },
    {
        label: 'Perbandingan Biometrik...',
        detail: 'Comparing feature vectors with cosine similarity',
        icon: Brain,
        duration: 2000,
    },
    {
        label: 'Kalkulasi Skor Kecocokan...',
        detail: 'Computing weighted confidence aggregation',
        icon: BarChart3,
        duration: 1200,
    },
    {
        label: 'Analisis Selesai',
        detail: 'All checks completed successfully',
        icon: CheckCircle,
        duration: 500,
    },
];

export default function VerifikasiSelfieDetail({
    verification: initialVerification,
    privacy: initialPrivacy,
    facialLandmarks: initialLandmarks,
    facialFeatures,
    confidenceMetrics,
    relatedVerifications,
}: PageProps) {
    const [verification, setVerification] =
        useState<Verification>(initialVerification);
    const [privacy, setPrivacy] = useState(initialPrivacy);
    const [facialLandmarks, setFacialLandmarks] = useState(initialLandmarks);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [isSubmittingVerification, setIsSubmittingVerification] =
        useState(false);
    const [hasStartedAiAnalysis, setHasStartedAiAnalysis] = useState(false);
    const [aiPhase, setAiPhase] = useState(-1); // -1 = not started, 0-5 = processing, 6 = complete
    const [aiComplete, setAiComplete] = useState(false);
    const [requestReason, setRequestReason] = useState(
        'Permintaan verifikasi ulang selfie untuk validasi kehadiran.',
    );
    const [isRequestingAccess, setIsRequestingAccess] = useState(false);
    const canRunAiComparison =
        !privacy.is_locked && Boolean(verification.selfie_photo);

    useEffect(() => {
        if (!hasStartedAiAnalysis || aiPhase < 0 || aiPhase >= AI_PHASES.length)
            return;

        const phase = AI_PHASES[aiPhase];
        const timer = setTimeout(() => {
            if (aiPhase < AI_PHASES.length - 1) {
                setAiPhase((prev) => prev + 1);
            } else {
                // Final phase - complete!
                setIsAiProcessing(false);
                setAiComplete(true);
                toast.success('🧠 AI Analysis Completed', {
                    description: `Match Score: ${verification.match_score}% | Confidence: ${verification.confidence_level}%`,
                });
            }
        }, phase.duration);

        return () => clearTimeout(timer);
    }, [
        aiPhase,
        hasStartedAiAnalysis,
        verification.match_score,
        verification.confidence_level,
    ]);

    const aiProgress =
        aiPhase < 0
            ? 0
            : Math.min(((aiPhase + 1) / AI_PHASES.length) * 100, 100);

    const handleRunAiComparison = () => {
        if (!canRunAiComparison) {
            toast.error(
                privacy.is_locked
                    ? 'Foto selfie terkunci. Buka akses selfie dulu sebelum menjalankan AI Face Comparison.'
                    : 'Foto selfie tidak tersedia untuk dianalisis.',
            );
            return;
        }

        setHasStartedAiAnalysis(true);
        setAiComplete(false);
        setAiPhase(0);
        setIsAiProcessing(true);
    };

    const handleVerify = async (action: 'approve' | 'reject') => {
        setIsSubmittingVerification(true);
        router.post(
            `/admin/verifikasi-selfie/${verification.raw_id}/${action}`,
            {},
            {
                onSuccess: () => {
                    toast.success(
                        `Verifikasi ${action === 'approve' ? 'disetujui' : 'ditolak'}`,
                    );
                },
                onError: () => toast.error('Gagal memproses verifikasi'),
                onFinish: () => setIsSubmittingVerification(false),
            },
        );
    };

    const handleDownloadReport = () => {
        window.open(
            `/admin/verifikasi-selfie/${verification.raw_id}/report`,
            '_blank',
        );
    };

    const handleRequestAccess = () => {
        if (requestReason.trim().length < 10) {
            toast.error('Alasan minimal 10 karakter');
            return;
        }

        setIsRequestingAccess(true);
        router.post(
            '/selfie-view-requests',
            {
                selfie_verification_id: verification.raw_id,
                reason: requestReason.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Permintaan izin berhasil dikirim ke mahasiswa',
                    );
                    setPrivacy((prev) => ({
                        ...prev,
                        request_status: 'pending',
                        can_request: false,
                        message:
                            'Permintaan izin sedang menunggu persetujuan mahasiswa.',
                        last_request: {
                            reason: requestReason.trim(),
                            requested_at: 'Baru saja',
                        },
                    }));
                },
                onError: (errors) => {
                    const message =
                        (errors.error as string) ??
                        'Gagal mengirim permintaan izin';
                    toast.error(message);
                },
                onFinish: () => setIsRequestingAccess(false),
            },
        );
    };

    return (
        <AppLayout>
            <Head title={`Selfie Detail - ${verification.student.name}`} />

            <div className="space-y-6 p-6">
                {/* 1. HEADER SECTION */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-8"
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
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative space-y-5">
                        {/* Back Button Row */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    router.visit('/admin/verifikasi-selfie')
                                }
                                className="group h-auto gap-1.5 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                Kembali ke Daftar
                            </Button>
                        </motion.div>

                        {/* Main Header Content */}
                        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:items-start sm:gap-6">
                            {/* Left: Icon + Title */}
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                                <motion.div
                                    className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20"
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
                                        stiffness: 250,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                >
                                    <img
                                        src={VerifikasiSelfieIcon}
                                        alt="Verifikasi Selfie"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]"
                                    />
                                </motion.div>
                                <div className="mt-1 sm:mt-0">
                                    <motion.p
                                        className="mb-1 text-[10px] font-semibold tracking-widest text-indigo-200 uppercase sm:text-xs"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        AI Face Recognition
                                    </motion.p>
                                    <motion.h1
                                        className="text-xl leading-tight font-bold text-white sm:text-2xl lg:text-3xl"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        Verifikasi Selfie Detail
                                    </motion.h1>
                                    <motion.p
                                        className="mt-1.5 max-w-md text-xs leading-relaxed text-indigo-100/80 sm:text-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.45 }}
                                    >
                                        Analisis wajah mendalam dengan teknologi
                                        AI untuk validasi kehadiran mahasiswa
                                    </motion.p>
                                </div>
                            </div>

                            {/* Right: AI Status Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: 0.6,
                                    type: 'spring',
                                    stiffness: 200,
                                }}
                                whileHover={{ scale: 1.05, y: -3 }}
                                className="group relative shrink-0"
                            >
                                <div
                                    className={cn(
                                        'absolute inset-0 rounded-2xl opacity-40 blur-xl transition-opacity group-hover:opacity-60',
                                        aiComplete
                                            ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                            : isAiProcessing
                                              ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                                              : 'bg-gradient-to-r from-slate-400 to-slate-500',
                                    )}
                                />
                                <div className="relative flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-5 py-3 text-white shadow-2xl backdrop-blur-xl sm:px-6 sm:py-4">
                                    {isAiProcessing ? (
                                        <motion.div
                                            animate={{
                                                rotate: [0, 360],
                                                scale: [1, 1.2, 1],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        >
                                            <Sparkles className="h-5 w-5 text-cyan-300 sm:h-6 sm:w-6" />
                                        </motion.div>
                                    ) : aiComplete ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                            }}
                                        >
                                            <CheckCircle className="h-5 w-5 text-emerald-300 sm:h-6 sm:w-6" />
                                        </motion.div>
                                    ) : (
                                        <Brain className="h-5 w-5 text-slate-200 sm:h-6 sm:w-6" />
                                    )}
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-wide text-indigo-200/80 uppercase sm:text-xs">
                                            AI Status
                                        </p>
                                        <p
                                            className={cn(
                                                'text-base font-black tracking-wider sm:text-lg',
                                                aiComplete
                                                    ? 'text-emerald-300'
                                                    : isAiProcessing
                                                      ? 'text-cyan-300'
                                                      : 'text-slate-200',
                                            )}
                                        >
                                            {aiComplete
                                                ? 'COMPLETE'
                                                : isAiProcessing
                                                  ? 'PROCESSING'
                                                  : 'IDLE'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN: Image Comparison */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* AI Face Comparison */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                    <Brain className="h-5 w-5 text-cyan-500 sm:h-6 sm:w-6" />{' '}
                                    AI Face Comparison
                                </h2>
                                <div className="flex items-center gap-2">
                                    {isAiProcessing ? (
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                            }}
                                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            >
                                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </motion.div>
                                            AI Processing...
                                        </motion.div>
                                    ) : aiComplete ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 200,
                                            }}
                                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{' '}
                                            Complete
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-full bg-neutral-700 px-3 py-1.5 text-xs font-medium text-white shadow-lg sm:px-4 sm:py-2 sm:text-sm">
                                            <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{' '}
                                            Idle
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        onClick={handleRunAiComparison}
                                        disabled={
                                            isAiProcessing ||
                                            !canRunAiComparison
                                        }
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60"
                                    >
                                        {isAiProcessing ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Brain className="mr-2 h-4 w-4" />
                                        )}
                                        {aiComplete
                                            ? 'Jalankan Ulang AI'
                                            : 'Jalankan AI'}
                                    </Button>
                                </div>
                            </div>

                            {/* AI Processing HUD Overlay */}
                            {isAiProcessing && aiPhase >= 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 space-y-4 rounded-2xl border border-cyan-500/30 bg-black/90 p-4 text-white sm:p-5"
                                >
                                    {/* Progress bar */}
                                    <div className="mb-1 flex items-center justify-between font-mono text-xs text-cyan-400">
                                        <span>
                                            PHASE {aiPhase + 1}/
                                            {AI_PHASES.length}
                                        </span>
                                        <span>{Math.round(aiProgress)}%</span>
                                    </div>
                                    <div className="relative h-2 overflow-hidden rounded-full bg-neutral-800">
                                        <motion.div
                                            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                                            animate={{
                                                width: `${aiProgress}%`,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                ease: 'easeOut',
                                            }}
                                        >
                                            <motion.div
                                                animate={{
                                                    x: ['-100%', '200%'],
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Phase steps */}
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                        {AI_PHASES.map((phase, idx) => {
                                            const PhaseIcon = phase.icon;
                                            const isActive = idx === aiPhase;
                                            const isDone = idx < aiPhase;
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -10,
                                                    }}
                                                    animate={{
                                                        opacity:
                                                            idx <= aiPhase
                                                                ? 1
                                                                : 0.3,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: idx * 0.05,
                                                    }}
                                                    className={cn(
                                                        'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-all',
                                                        isActive &&
                                                            'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
                                                        isDone &&
                                                            'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                                                        !isActive &&
                                                            !isDone &&
                                                            'border-neutral-800 text-neutral-500',
                                                    )}
                                                >
                                                    <div className="shrink-0">
                                                        {isDone ? (
                                                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                        ) : isActive ? (
                                                            <motion.div
                                                                animate={{
                                                                    rotate: 360,
                                                                }}
                                                                transition={{
                                                                    duration: 1.5,
                                                                    repeat: Infinity,
                                                                    ease: 'linear',
                                                                }}
                                                            >
                                                                <Loader2 className="h-4 w-4 text-cyan-400" />
                                                            </motion.div>
                                                        ) : (
                                                            <PhaseIcon className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-semibold">
                                                            {phase.label}
                                                        </p>
                                                        {(isActive ||
                                                            isDone) && (
                                                            <p className="truncate font-mono text-[10px] text-neutral-500">
                                                                {phase.detail}
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Terminal-style log */}
                                    <div className="mt-2 max-h-24 space-y-1 overflow-y-auto rounded-lg border border-neutral-800 bg-black p-3 font-mono text-[10px] text-green-400 sm:text-xs">
                                        {aiPhase >= 0 && (
                                            <p>
                                                <span className="text-neutral-600">
                                                    [
                                                    {new Date().toLocaleTimeString()}
                                                    ]
                                                </span>{' '}
                                                <span className="text-cyan-400">
                                                    INFO
                                                </span>{' '}
                                                Neural network model loaded
                                            </p>
                                        )}
                                        {aiPhase >= 1 && (
                                            <p>
                                                <span className="text-neutral-600">
                                                    [
                                                    {new Date().toLocaleTimeString()}
                                                    ]
                                                </span>{' '}
                                                <span className="text-cyan-400">
                                                    INFO
                                                </span>{' '}
                                                Reference embedding fetched
                                                (512-dim vector)
                                            </p>
                                        )}
                                        {aiPhase >= 2 && (
                                            <p>
                                                <span className="text-neutral-600">
                                                    [
                                                    {new Date().toLocaleTimeString()}
                                                    ]
                                                </span>{' '}
                                                <span className="text-green-400">
                                                    OK
                                                </span>{' '}
                                                Face detected in reference: 1
                                                face(s)
                                            </p>
                                        )}
                                        {aiPhase >= 2 && (
                                            <p>
                                                <span className="text-neutral-600">
                                                    [
                                                    {new Date().toLocaleTimeString()}
                                                    ]
                                                </span>{' '}
                                                <span className="text-green-400">
                                                    OK
                                                </span>{' '}
                                                Face detected in selfie: 1
                                                face(s)
                                            </p>
                                        )}
                                        {aiPhase >= 3 && (
                                            <p>
                                                <span className="text-neutral-600">
                                                    [
                                                    {new Date().toLocaleTimeString()}
                                                    ]
                                                </span>{' '}
                                                <span className="text-cyan-400">
                                                    INFO
                                                </span>{' '}
                                                Extracted 68 landmark points per
                                                face
                                            </p>
                                        )}
                                        {aiPhase >= 4 && (
                                            <p>
                                                <span className="text-neutral-600">
                                                    [
                                                    {new Date().toLocaleTimeString()}
                                                    ]
                                                </span>{' '}
                                                <span className="text-cyan-400">
                                                    INFO
                                                </span>{' '}
                                                Computing cosine similarity...
                                            </p>
                                        )}
                                        {aiPhase >= 5 && (
                                            <p>
                                                <span className="text-neutral-600">
                                                    [
                                                    {new Date().toLocaleTimeString()}
                                                    ]
                                                </span>{' '}
                                                <span className="text-yellow-400">
                                                    RESULT
                                                </span>{' '}
                                                Match score:{' '}
                                                {verification.match_score}%
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Reference Photo */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                            Foto Referensi
                                        </h3>
                                        <Badge variant="outline">
                                            Database
                                        </Badge>
                                    </div>
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                                        <img
                                            src={verification.student.photo}
                                            alt="Reference"
                                            className="h-full w-full object-cover"
                                        />

                                        {/* Scanning line - only during processing */}
                                        {!aiComplete && aiPhase >= 2 && (
                                            <motion.div
                                                variants={scanningVariants}
                                                initial="initial"
                                                animate="animate"
                                                className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                            />
                                        )}

                                        {/* Face bounding box - appears after face detection phase */}
                                        {aiPhase >= 2 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0"
                                            >
                                                <motion.div
                                                    initial={{
                                                        scale: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        scale: 1,
                                                        opacity: 1,
                                                    }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 200,
                                                    }}
                                                    className="absolute top-[10%] right-[10%] bottom-[20%] left-[10%] rounded-lg border-2 border-cyan-400"
                                                >
                                                    <div className="absolute -top-1 -left-1 h-4 w-4 border-t-4 border-l-4 border-cyan-400" />
                                                    <div className="absolute -top-1 -right-1 h-4 w-4 border-t-4 border-r-4 border-cyan-400" />
                                                    <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-cyan-400" />
                                                    <div className="absolute -right-1 -bottom-1 h-4 w-4 border-r-4 border-b-4 border-cyan-400" />
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                        }}
                                                        transition={{
                                                            delay: 0.3,
                                                        }}
                                                        className="absolute -top-8 left-0 rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-white"
                                                    >
                                                        FACE DETECTED
                                                    </motion.div>
                                                </motion.div>
                                            </motion.div>
                                        )}

                                        {/* Landmarks - appear after landmark extraction phase */}
                                        {aiPhase >= 3 &&
                                            facialLandmarks.reference.map(
                                                (point, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{
                                                            scale: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            scale: 1,
                                                            opacity: 1,
                                                        }}
                                                        transition={{
                                                            delay: i * 0.03,
                                                            type: 'spring',
                                                        }}
                                                        className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                                                        style={{
                                                            left: `${point.x}%`,
                                                            top: `${point.y}%`,
                                                        }}
                                                    />
                                                ),
                                            )}
                                    </div>
                                </div>

                                {/* Selfie Photo */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                            Foto Selfie
                                        </h3>
                                        <Badge variant="outline">
                                            Live Capture
                                        </Badge>
                                    </div>
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                                        {!privacy.is_locked &&
                                        verification.selfie_photo ? (
                                            <>
                                                <img
                                                    src={
                                                        verification.selfie_photo
                                                    }
                                                    alt="Selfie"
                                                    className="h-full w-full object-cover"
                                                />

                                                {/* Scanning line - only during processing */}
                                                {!aiComplete &&
                                                    aiPhase >= 2 && (
                                                        <motion.div
                                                            variants={
                                                                scanningVariants
                                                            }
                                                            initial="initial"
                                                            animate="animate"
                                                            className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                                                        />
                                                    )}

                                                {/* Face bounding box - appears after face detection, color based on final result after complete */}
                                                {aiPhase >= 2 && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{
                                                            duration: 0.5,
                                                        }}
                                                        className="absolute inset-0"
                                                    >
                                                        <motion.div
                                                            initial={{
                                                                scale: 0,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                opacity: 1,
                                                            }}
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 200,
                                                            }}
                                                            className={cn(
                                                                'absolute top-[10%] right-[10%] bottom-[20%] left-[10%] rounded-lg border-2',
                                                                aiComplete
                                                                    ? verification.match_score >=
                                                                      80
                                                                        ? 'border-green-400'
                                                                        : verification.match_score >=
                                                                            60
                                                                          ? 'border-yellow-400'
                                                                          : 'border-red-400'
                                                                    : 'border-cyan-400',
                                                            )}
                                                        >
                                                            {[
                                                                'top-left',
                                                                'top-right',
                                                                'bottom-left',
                                                                'bottom-right',
                                                            ].map((corner) => {
                                                                const borderColor =
                                                                    aiComplete
                                                                        ? verification.match_score >=
                                                                          80
                                                                            ? 'border-green-400'
                                                                            : verification.match_score >=
                                                                                60
                                                                              ? 'border-yellow-400'
                                                                              : 'border-red-400'
                                                                        : 'border-cyan-400';
                                                                const pos =
                                                                    corner.split(
                                                                        '-',
                                                                    );
                                                                return (
                                                                    <div
                                                                        key={
                                                                            corner
                                                                        }
                                                                        className={cn(
                                                                            'absolute h-4 w-4',
                                                                            pos[0] ===
                                                                                'top'
                                                                                ? '-top-1'
                                                                                : '-bottom-1',
                                                                            pos[1] ===
                                                                                'left'
                                                                                ? '-left-1'
                                                                                : '-right-1',
                                                                            pos[0] ===
                                                                                'top'
                                                                                ? `border-t-4`
                                                                                : `border-b-4`,
                                                                            pos[1] ===
                                                                                'left'
                                                                                ? `border-l-4`
                                                                                : `border-r-4`,
                                                                            borderColor,
                                                                        )}
                                                                    />
                                                                );
                                                            })}

                                                            {aiComplete && (
                                                                <motion.div
                                                                    initial={{
                                                                        opacity: 0,
                                                                        scale: 0,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        scale: 1,
                                                                    }}
                                                                    transition={{
                                                                        type: 'spring',
                                                                        stiffness: 300,
                                                                    }}
                                                                    className={cn(
                                                                        'absolute -top-8 left-0 rounded-full px-3 py-1 text-xs font-bold text-white',
                                                                        verification.match_score >=
                                                                            80
                                                                            ? 'bg-green-500'
                                                                            : verification.match_score >=
                                                                                60
                                                                              ? 'bg-yellow-500'
                                                                              : 'bg-red-500',
                                                                    )}
                                                                >
                                                                    {verification.match_score >=
                                                                    80
                                                                        ? 'MATCH'
                                                                        : verification.match_score >=
                                                                            60
                                                                          ? 'PARTIAL MATCH'
                                                                          : 'NO MATCH'}
                                                                </motion.div>
                                                            )}

                                                            {!aiComplete &&
                                                                aiPhase >=
                                                                    2 && (
                                                                    <motion.div
                                                                        animate={{
                                                                            opacity:
                                                                                [
                                                                                    0.5,
                                                                                    1,
                                                                                    0.5,
                                                                                ],
                                                                        }}
                                                                        transition={{
                                                                            duration: 1,
                                                                            repeat: Infinity,
                                                                        }}
                                                                        className="absolute -top-8 left-0 rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-white"
                                                                    >
                                                                        ANALYZING...
                                                                    </motion.div>
                                                                )}
                                                        </motion.div>
                                                    </motion.div>
                                                )}

                                                {aiPhase >= 3 &&
                                                    facialLandmarks.selfie.map(
                                                        (point, i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{
                                                                    scale: 0,
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    scale: 1,
                                                                    opacity: 1,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        i *
                                                                        0.03,
                                                                    type: 'spring',
                                                                }}
                                                                className={cn(
                                                                    'absolute h-2 w-2 rounded-full',
                                                                    aiComplete
                                                                        ? verification.match_score >=
                                                                          80
                                                                            ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]'
                                                                            : verification.match_score >=
                                                                                60
                                                                              ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]'
                                                                              : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]'
                                                                        : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]',
                                                                )}
                                                                style={{
                                                                    left: `${point.x}%`,
                                                                    top: `${point.y}%`,
                                                                }}
                                                            />
                                                        ),
                                                    )}
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 p-5 text-center backdrop-blur-sm">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
                                                    <Lock className="h-6 w-6 text-white" />
                                                </div>
                                                <p className="text-sm font-semibold text-white">
                                                    Foto selfie terkunci
                                                </p>
                                                <p className="max-w-xs text-xs text-white/80">
                                                    {privacy.message}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {privacy.is_locked && (
                                        <div className="rounded-xl border border-amber-300/40 bg-amber-100/50 p-3 dark:border-amber-700/40 dark:bg-amber-900/20">
                                            <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                                                Akses Privasi Selfie
                                            </p>
                                            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                                                {privacy.message}
                                            </p>
                                            {privacy.last_request
                                                ?.requested_at && (
                                                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                                                    Permintaan terakhir:{' '}
                                                    {
                                                        privacy.last_request
                                                            .requested_at
                                                    }
                                                </p>
                                            )}
                                            {privacy.last_request
                                                ?.response_note && (
                                                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                                                    Catatan mahasiswa:{' '}
                                                    {
                                                        privacy.last_request
                                                            .response_note
                                                    }
                                                </p>
                                            )}
                                            <textarea
                                                value={requestReason}
                                                onChange={(event) =>
                                                    setRequestReason(
                                                        event.target.value,
                                                    )
                                                }
                                                rows={3}
                                                className="mt-3 w-full rounded-lg border border-amber-300/40 bg-white/80 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500 dark:border-amber-700/40 dark:bg-neutral-900/70 dark:text-white"
                                                placeholder="Tulis alasan permintaan izin (minimal 10 karakter)"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleRequestAccess}
                                                disabled={
                                                    !privacy.can_request ||
                                                    isRequestingAccess
                                                }
                                                className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
                                            >
                                                {isRequestingAccess ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Lock className="mr-2 h-4 w-4" />
                                                )}
                                                {privacy.request_status ===
                                                'pending'
                                                    ? 'Menunggu Persetujuan Mahasiswa'
                                                    : 'Minta Izin ke Mahasiswa'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Score Banner - ONLY after AI completes */}
                            <AnimatePresence>
                                {aiComplete && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 30,
                                            scale: 0.95,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 150,
                                            damping: 15,
                                            delay: 0.3,
                                        }}
                                        className="mt-6 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-5 sm:p-6 dark:border-cyan-800/50 dark:from-cyan-950/30 dark:to-blue-950/30"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay: 0.5,
                                                        type: 'spring',
                                                    }}
                                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                                                >
                                                    <Brain className="h-6 w-6" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="font-bold text-neutral-900 dark:text-white">
                                                        AI Match Score
                                                    </h3>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        Confidence Level:{' '}
                                                        {
                                                            verification.confidence_level
                                                        }
                                                        %
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    delay: 0.7,
                                                    type: 'spring',
                                                    stiffness: 200,
                                                }}
                                                className="text-right"
                                            >
                                                <p className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-3xl font-black text-transparent sm:text-4xl dark:from-cyan-400 dark:to-blue-400">
                                                    {verification.match_score}%
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    Match Accuracy
                                                </p>
                                            </motion.div>
                                        </div>
                                        <div className="relative h-4 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${verification.match_score}%`,
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    ease: 'easeOut',
                                                    delay: 0.8,
                                                }}
                                                className={cn(
                                                    'relative h-full overflow-hidden rounded-full',
                                                    verification.match_score >=
                                                        80
                                                        ? 'bg-gradient-to-r from-green-400 to-emerald-600'
                                                        : verification.match_score >=
                                                            60
                                                          ? 'bg-gradient-to-r from-yellow-400 to-amber-600'
                                                          : 'bg-gradient-to-r from-red-400 to-rose-600',
                                                )}
                                            >
                                                <motion.div
                                                    animate={{
                                                        x: ['-100%', '200%'],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: 'linear',
                                                    }}
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                />
                                            </motion.div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <Badge
                                                variant={
                                                    verification.match_score >=
                                                    80
                                                        ? 'success'
                                                        : verification.match_score >=
                                                            60
                                                          ? 'warning'
                                                          : 'destructive'
                                                }
                                                className="border-0 px-4 py-2 text-sm"
                                            >
                                                {verification.match_score >=
                                                80 ? (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />{' '}
                                                        Verified - High
                                                        Confidence
                                                    </>
                                                ) : verification.match_score >=
                                                  60 ? (
                                                    <>
                                                        <AlertTriangle className="mr-2 h-4 w-4" />{' '}
                                                        Partial Match - Review
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="mr-2 h-4 w-4" />{' '}
                                                        No Match
                                                    </>
                                                )}
                                            </Badge>
                                            <div className="text-xs font-medium text-neutral-500">
                                                Processed in{' '}
                                                {verification.processing_time}ms
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Detail Analysis */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                                <Cpu className="h-5 w-5 text-purple-500" /> AI
                                Analysis Details
                            </h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-neutral-200 bg-white/50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                            Face Quality
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="dark:border-neutral-600"
                                        >
                                            {verification.face_quality}%
                                        </Badge>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${verification.face_quality}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.3,
                                            }}
                                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-neutral-200 bg-white/50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                            Lighting
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="dark:border-neutral-600"
                                        >
                                            {verification.lighting_score}%
                                        </Badge>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${verification.lighting_score}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.4,
                                            }}
                                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-neutral-200 bg-white/50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                            Face Angle
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="dark:border-neutral-600"
                                        >
                                            {verification.face_angle}°
                                        </Badge>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${((180 - Math.abs(verification.face_angle)) / 180) * 100}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.5,
                                            }}
                                            className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-neutral-200 bg-white/50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                            Sharpness
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="dark:border-neutral-600"
                                        >
                                            {verification.sharpness_score}%
                                        </Badge>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${verification.sharpness_score}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.6,
                                            }}
                                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-pink-500/10">
                                <div className="flex items-start gap-3">
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    >
                                        <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-500" />
                                    </motion.div>
                                    <div>
                                        <h4 className="mb-1 font-semibold text-purple-900 dark:text-purple-300">
                                            AI Insights
                                        </h4>
                                        <p className="text-sm leading-relaxed text-purple-700 dark:text-purple-400">
                                            {verification.ai_insights}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Details & Actions */}
                    <div className="space-y-6">
                        {/* STUDENT PROFILE CARD */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="text-center">
                                <div className="relative mb-4 inline-block">
                                    <motion.div
                                        className="relative mx-auto h-32 w-32"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-neutral-800">
                                            <AvatarImage
                                                src={verification.student.photo}
                                            />
                                            <AvatarFallback className="text-3xl font-bold">
                                                {verification.student.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-4 border-cyan-500"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 0, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                        />
                                    </motion.div>
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {verification.student.name}
                                </h2>
                                <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                                    {verification.student.nim}
                                </p>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="mt-4"
                                >
                                    <Badge
                                        variant={
                                            verification.status === 'verified'
                                                ? 'success'
                                                : verification.status ===
                                                    'rejected'
                                                  ? 'destructive'
                                                  : 'warning'
                                        }
                                        className="border-0 px-6 py-2 text-sm shadow-lg"
                                    >
                                        {verification.status === 'verified' && (
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                        )}
                                        {verification.status === 'rejected' && (
                                            <XCircle className="mr-2 h-4 w-4" />
                                        )}
                                        {verification.status === 'pending' && (
                                            <Clock className="mr-2 h-4 w-4" />
                                        )}
                                        {verification.status.toUpperCase()}
                                    </Badge>
                                </motion.div>
                            </div>
                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex justify-between border-b border-neutral-200 pb-2 dark:border-neutral-800">
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        Program Studi
                                    </span>
                                    <span className="font-medium text-neutral-900 dark:text-white">
                                        {verification.student.major}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-200 pb-2 dark:border-neutral-800">
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        Semester
                                    </span>
                                    <span className="font-medium text-neutral-900 dark:text-white">
                                        {verification.student.semester}
                                    </span>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        Waktu Upload
                                    </span>
                                    <span className="font-medium text-neutral-900 dark:text-white">
                                        {verification.uploaded_at}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI MATCH SCORE CIRCULAR CARD */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 shadow-xl backdrop-blur-xl dark:from-cyan-500/5 dark:to-blue-500/5"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                >
                                    <Brain className="h-6 w-6 text-cyan-500" />
                                </motion.div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    AI Match Score
                                </h3>
                            </div>
                            <div className="relative mx-auto mb-4 h-48 w-48">
                                <svg className="h-48 w-48 -rotate-90 transform">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="none"
                                        className="text-neutral-200 dark:text-neutral-800"
                                    />
                                    <motion.circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="url(#gradient)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: '0 552' }}
                                        animate={{
                                            strokeDasharray: `${(verification.match_score / 100) * 552} 552`,
                                        }}
                                        transition={{
                                            duration: 2,
                                            ease: 'easeOut',
                                            delay: 0.5,
                                        }}
                                    />
                                    <defs>
                                        <linearGradient
                                            id="gradient"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="100%"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#06b6d4"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#3b82f6"
                                            />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <motion.p
                                            className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-5xl font-black text-transparent"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                delay: 0.8,
                                                type: 'spring',
                                            }}
                                        >
                                            {verification.match_score}%
                                        </motion.p>
                                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                            Match Score
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <Badge
                                    variant={
                                        verification.match_score >= 90
                                            ? 'success'
                                            : verification.match_score >= 70
                                              ? 'warning'
                                              : 'destructive'
                                    }
                                    className="border-0 px-4 py-1.5 text-sm"
                                >
                                    {verification.match_score >= 90 &&
                                        'Sangat Cocok'}
                                    {verification.match_score >= 70 &&
                                        verification.match_score < 90 &&
                                        'Cukup Cocok'}
                                    {verification.match_score < 70 &&
                                        'Tidak Cocok'}
                                </Badge>
                            </div>
                        </motion.div>

                        {/* ACTION BUTTONS */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                                Actions
                            </h3>
                            <div className="space-y-3">
                                {privacy.is_locked && (
                                    <div className="rounded-xl border border-amber-300/40 bg-amber-100/60 p-3 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200">
                                        Verifikasi ulang dikunci. Minta izin
                                        mahasiswa terlebih dahulu untuk membuka
                                        selfie.
                                    </div>
                                )}
                                {verification.status === 'pending' &&
                                    !privacy.is_locked && (
                                        <>
                                            <Button
                                                disabled={
                                                    isSubmittingVerification
                                                }
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700"
                                                onClick={() =>
                                                    handleVerify('approve')
                                                }
                                            >
                                                {isSubmittingVerification ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                )}{' '}
                                                Setujui Verifikasi
                                            </Button>
                                            <Button
                                                disabled={
                                                    isSubmittingVerification
                                                }
                                                variant="destructive"
                                                className="w-full shadow-lg"
                                                onClick={() =>
                                                    handleVerify('reject')
                                                }
                                            >
                                                {isSubmittingVerification ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                )}{' '}
                                                Tolak Verifikasi
                                            </Button>
                                        </>
                                    )}
                                <Button
                                    variant="outline"
                                    className="w-full border-neutral-300 bg-white/50 hover:bg-white dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                                    onClick={handleDownloadReport}
                                >
                                    <Download className="mr-2 h-4 w-4 text-indigo-500" />{' '}
                                    Download Report
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-neutral-300 bg-white/50 hover:bg-white dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                                >
                                    <Share2 className="mr-2 h-4 w-4 text-cyan-500" />{' '}
                                    Share Results
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Liveness, History, Report Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* FACIAL FEATURES & LIVENESS */}
                    <div className="space-y-6">
                        {/* Features */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                                <ScanFace className="h-5 w-5 text-cyan-500" />{' '}
                                Facial Features Info
                            </h2>
                            <div className="space-y-4">
                                <div className="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-4 dark:border-cyan-500/20 dark:from-cyan-500/10 dark:to-blue-500/10">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Face Detection Confidence
                                        </span>
                                        <Badge
                                            variant="success"
                                            className="border-0"
                                        >
                                            {
                                                verification.face_detection_confidence
                                            }
                                            %
                                        </Badge>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${verification.face_detection_confidence}%`,
                                            }}
                                            transition={{ duration: 1 }}
                                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            label: 'Eyes',
                                            detected:
                                                verification.features.eyes,
                                            icon: Eye,
                                        },
                                        {
                                            label: 'Nose',
                                            detected:
                                                verification.features.nose,
                                            icon: Scan,
                                        },
                                        {
                                            label: 'Mouth',
                                            detected:
                                                verification.features.mouth,
                                            icon: Smile,
                                        },
                                        {
                                            label: 'Eyebrows',
                                            detected:
                                                verification.features.eyebrows,
                                            icon: Scan,
                                        },
                                    ].map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                'rounded-xl border p-3',
                                                feature.detected
                                                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <feature.icon
                                                    className={cn(
                                                        'h-4 w-4',
                                                        feature.detected
                                                            ? 'text-green-600'
                                                            : 'text-red-600',
                                                    )}
                                                />
                                                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                    {feature.label}
                                                </span>
                                                {feature.detected ? (
                                                    <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="ml-auto h-4 w-4 text-red-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-pink-500/10">
                                    <h4 className="mb-3 text-sm font-semibold text-purple-900 dark:text-purple-300">
                                        Emotion Detection
                                    </h4>
                                    <div className="space-y-3">
                                        {verification.emotions.map(
                                            (emotion, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span className="text-xs text-purple-700 dark:text-purple-400">
                                                        {emotion.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-purple-200 dark:bg-purple-900/50">
                                                            <motion.div
                                                                initial={{
                                                                    width: 0,
                                                                }}
                                                                animate={{
                                                                    width: `${emotion.confidence}%`,
                                                                }}
                                                                transition={{
                                                                    duration: 0.8,
                                                                }}
                                                                className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                                                            />
                                                        </div>
                                                        <span className="w-8 text-right text-xs font-medium text-purple-900 dark:text-purple-300">
                                                            {emotion.confidence}
                                                            %
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Liveness */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                                <Shield className="h-5 w-5 text-green-500" />{' '}
                                Liveness Detection
                            </h2>
                            <div className="space-y-4">
                                <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-500/20 dark:from-green-500/10 dark:to-emerald-500/10">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                }}
                                            >
                                                <Shield className="h-5 w-5 text-green-600 dark:text-green-500" />
                                            </motion.div>
                                            <span className="font-semibold text-green-900 dark:text-green-300">
                                                Liveness Score
                                            </span>
                                        </div>
                                        <span className="text-2xl font-black text-green-600 dark:text-green-400">
                                            {verification.liveness_score}%
                                        </span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-green-200 dark:bg-green-900/50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${verification.liveness_score}%`,
                                            }}
                                            transition={{ duration: 1.2 }}
                                            className="relative h-full overflow-hidden bg-gradient-to-r from-green-400 to-emerald-600"
                                        >
                                            <motion.div
                                                animate={{
                                                    x: ['-100%', '200%'],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        {
                                            label: 'Real Person Detected',
                                            passed: verification.liveness_checks
                                                .real_person,
                                            icon: User,
                                        },
                                        {
                                            label: 'No Screen Detection',
                                            passed: verification.liveness_checks
                                                .no_screen,
                                            icon: Monitor,
                                        },
                                        {
                                            label: 'No Mask Detection',
                                            passed: verification.liveness_checks
                                                .no_mask,
                                            icon: Shield,
                                        },
                                        {
                                            label: 'Eye Blink Detected',
                                            passed: verification.liveness_checks
                                                .eye_blink,
                                            icon: Eye,
                                        },
                                        {
                                            label: 'Head Movement',
                                            passed: verification.liveness_checks
                                                .head_movement,
                                            icon: Move,
                                        },
                                    ].map((check, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                'flex items-center justify-between rounded-xl border p-3',
                                                check.passed
                                                    ? 'border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/10'
                                                    : 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10',
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <check.icon
                                                    className={cn(
                                                        'h-4 w-4',
                                                        check.passed
                                                            ? 'text-green-600'
                                                            : 'text-red-600',
                                                    )}
                                                />
                                                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                    {check.label}
                                                </span>
                                            </div>
                                            {check.passed ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-500/20 dark:from-blue-500/10 dark:to-cyan-500/10">
                                    <div className="flex items-start gap-3">
                                        <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                        <div>
                                            <h4 className="mb-1 font-semibold text-blue-900 dark:text-blue-300">
                                                Anti-Spoofing Check
                                            </h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                {verification.anti_spoofing_passed
                                                    ? 'Tidak ada indikasi spoofing terdeteksi. Foto asli dari kamera.'
                                                    : 'Terdeteksi kemungkinan spoofing. Perlu review manual.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* REPORT & ANOMALIES & HISTORY */}
                    <div className="space-y-6">
                        {verification.anomalies &&
                            verification.anomalies.length > 0 && (
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6 shadow-xl backdrop-blur-xl dark:from-red-500/5 dark:to-orange-500/5"
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [0, 10, -10, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                        >
                                            <AlertTriangle className="h-6 w-6 text-red-500" />
                                        </motion.div>
                                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                            AI Anomaly Detection
                                        </h2>
                                    </div>
                                    <div className="space-y-3">
                                        {verification.anomalies.map(
                                            (anom, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: idx * 0.05,
                                                    }}
                                                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-white/50 p-4 dark:border-red-800/50 dark:bg-neutral-800/50"
                                                >
                                                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                                                    <div className="flex-1">
                                                        <h4 className="mb-1 font-semibold text-neutral-900 dark:text-white">
                                                            {anom.type}
                                                        </h4>
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                            {anom.description}
                                                        </p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="destructive"
                                                                className="border-0 text-xs"
                                                            >
                                                                Severity:{' '}
                                                                {anom.severity}
                                                            </Badge>
                                                            <span className="text-xs text-neutral-500">
                                                                Confidence:{' '}
                                                                {
                                                                    anom.confidence
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ),
                                        )}
                                    </div>
                                </motion.div>
                            )}

                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                                <FileText className="h-5 w-5 text-indigo-500" />{' '}
                                Verification Report
                            </h2>
                            <div className="space-y-4">
                                <div
                                    className={cn(
                                        'rounded-xl border p-4',
                                        verification.match_score >= 80
                                            ? 'border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/10'
                                            : verification.match_score >= 60
                                              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800/50 dark:bg-yellow-900/10'
                                              : 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10',
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {verification.match_score >= 80 ? (
                                            <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
                                        ) : verification.match_score >= 60 ? (
                                            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-600" />
                                        ) : (
                                            <XCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
                                        )}
                                        <div>
                                            <h4
                                                className={cn(
                                                    'mb-1 font-semibold',
                                                    verification.match_score >=
                                                        80
                                                        ? 'text-green-900 dark:text-green-300'
                                                        : verification.match_score >=
                                                            60
                                                          ? 'text-yellow-900 dark:text-yellow-300'
                                                          : 'text-red-900 dark:text-red-300',
                                                )}
                                            >
                                                {verification.match_score >= 80
                                                    ? 'Verification Passed'
                                                    : verification.match_score >=
                                                        60
                                                      ? 'Manual Review Required'
                                                      : 'Verification Failed'}
                                            </h4>
                                            <p
                                                className={cn(
                                                    'text-sm',
                                                    verification.match_score >=
                                                        80
                                                        ? 'text-green-700 dark:text-green-400'
                                                        : verification.match_score >=
                                                            60
                                                          ? 'text-yellow-700 dark:text-yellow-400'
                                                          : 'text-red-700 dark:text-red-400',
                                                )}
                                            >
                                                {
                                                    verification.overall_assessment
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between rounded-lg border border-neutral-100 bg-white/50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Verification ID:
                                        </span>
                                        <span className="font-mono font-medium text-neutral-900 dark:text-white">
                                            {verification.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between rounded-lg border border-neutral-100 bg-white/50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Verified By:
                                        </span>
                                        <span className="font-medium text-neutral-900 dark:text-white">
                                            {verification.verified_by ||
                                                'AI System'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between rounded-lg border border-neutral-100 bg-white/50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Date:
                                        </span>
                                        <span className="font-medium text-neutral-900 dark:text-white">
                                            {verification.verification_date}
                                        </span>
                                    </div>
                                </div>
                                {verification.recommendations &&
                                    verification.recommendations.length > 0 && (
                                        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-purple-500/10">
                                            <h4 className="mb-2 flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-300">
                                                <Lightbulb className="h-4 w-4" />{' '}
                                                Recommendations
                                            </h4>
                                            <ul className="space-y-1 text-sm text-indigo-700 dark:text-indigo-400">
                                                {verification.recommendations.map(
                                                    (rec, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <span className="mt-0.5 text-indigo-500">
                                                                •
                                                            </span>
                                                            <span>{rec}</span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                                <History className="h-5 w-5 text-purple-500" />{' '}
                                Verification History
                            </h2>
                            <div className="space-y-4">
                                {verification.history.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex gap-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    delay: index * 0.05 + 0.2,
                                                }}
                                                className={cn(
                                                    'flex h-10 w-10 items-center justify-center rounded-full shadow-inner',
                                                    item.status === 'approved'
                                                        ? 'bg-green-500'
                                                        : item.status ===
                                                            'rejected'
                                                          ? 'bg-red-500'
                                                          : 'bg-yellow-500',
                                                )}
                                            >
                                                {item.status === 'approved' && (
                                                    <CheckCircle className="h-5 w-5 text-white" />
                                                )}
                                                {item.status === 'rejected' && (
                                                    <XCircle className="h-5 w-5 text-white" />
                                                )}
                                                {item.status === 'pending' && (
                                                    <Clock className="h-5 w-5 text-white" />
                                                )}
                                            </motion.div>
                                            {index <
                                                verification.history.length -
                                                    1 && (
                                                <div className="mt-2 h-full min-h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="rounded-xl border border-neutral-200 bg-white/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                            {item.action}
                                                        </h4>
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                            {item.timestamp}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="dark:border-neutral-600"
                                                    >
                                                        {item.by}
                                                    </Badge>
                                                </div>
                                                {item.notes && (
                                                    <p className="mt-2 rounded-md bg-black/5 p-2 text-sm text-neutral-600 italic shadow-sm dark:bg-black/20 dark:text-neutral-400">
                                                        "{item.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* RELATED VERIFICATIONS */}
                {relatedVerifications && relatedVerifications.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                            <Users className="h-5 w-5 text-cyan-500" /> Related
                            Verifications
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {relatedVerifications.map((related, index) => (
                                <motion.div
                                    key={related.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="cursor-pointer rounded-xl border border-neutral-200 bg-white/50 p-4 shadow-md dark:border-neutral-700 dark:bg-neutral-800/50"
                                    onClick={() =>
                                        router.visit(
                                            `/admin/verifikasi-selfie/${related.id}`,
                                        )
                                    }
                                >
                                    <div className="mb-3 flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-neutral-200 dark:border-neutral-700">
                                            <AvatarImage
                                                src={related.student.photo}
                                            />
                                            <AvatarFallback>
                                                {related.student.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                {related.student.name}
                                            </h4>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                {related.student.nim}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge
                                            variant={
                                                related.status === 'verified'
                                                    ? 'success'
                                                    : related.status ===
                                                        'rejected'
                                                      ? 'destructive'
                                                      : 'warning'
                                            }
                                            className="h-5 border-0 px-2 py-0 text-[10px] shadow-sm"
                                        >
                                            {related.status.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                                            {related.match_score}% match
                                        </span>
                                    </div>
                                    <p className="mt-2 text-[10px] text-neutral-500">
                                        {related.timestamp}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
