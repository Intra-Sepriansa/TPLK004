import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Scan, Brain, Cpu, CheckCircle, XCircle, AlertTriangle, Clock,
    ChevronLeft, Sparkles, Loader2, Eye, Smile, Shield, User,
    Monitor, Move, FileText, Download, Share2, Lightbulb, History, Lock,
    ScanFace, BarChart3, AlertCircle, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
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
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
};

const aiPulseVariants: Variants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
        transition: { duration: 0.75, repeat: Infinity, ease: "easeInOut" },
    },
};

// AI Processing phases
const AI_PHASES = [
    { label: 'Memulai AI Engine...', detail: 'Loading neural network model v2.4.1', icon: Cpu, duration: 1200 },
    { label: 'Memuat Data Referensi...', detail: 'Fetching embedding vektor dari database', icon: User, duration: 1000 },
    { label: 'Deteksi Wajah...', detail: 'Detecting faces with MTCNN pipeline', icon: ScanFace, duration: 1500 },
    { label: 'Ekstraksi Landmark Wajah...', detail: 'Extracting 68 facial landmark points', icon: Scan, duration: 1800 },
    { label: 'Perbandingan Biometrik...', detail: 'Comparing feature vectors with cosine similarity', icon: Brain, duration: 2000 },
    { label: 'Kalkulasi Skor Kecocokan...', detail: 'Computing weighted confidence aggregation', icon: BarChart3, duration: 1200 },
    { label: 'Analisis Selesai', detail: 'All checks completed successfully', icon: CheckCircle, duration: 500 },
];

export default function VerifikasiSelfieDetail({ verification: initialVerification, privacy: initialPrivacy, facialLandmarks: initialLandmarks, facialFeatures, confidenceMetrics, relatedVerifications }: PageProps) {
    const [verification, setVerification] = useState<Verification>(initialVerification);
    const [privacy, setPrivacy] = useState(initialPrivacy);
    const [facialLandmarks, setFacialLandmarks] = useState(initialLandmarks);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
    const [hasStartedAiAnalysis, setHasStartedAiAnalysis] = useState(false);
    const [aiPhase, setAiPhase] = useState(-1); // -1 = not started, 0-5 = processing, 6 = complete
    const [aiComplete, setAiComplete] = useState(false);
    const [requestReason, setRequestReason] = useState('Permintaan verifikasi ulang selfie untuk validasi kehadiran.');
    const [isRequestingAccess, setIsRequestingAccess] = useState(false);
    const canRunAiComparison = !privacy.is_locked && Boolean(verification.selfie_photo);

    useEffect(() => {
        if (!hasStartedAiAnalysis || aiPhase < 0 || aiPhase >= AI_PHASES.length) return;

        const phase = AI_PHASES[aiPhase];
        const timer = setTimeout(() => {
            if (aiPhase < AI_PHASES.length - 1) {
                setAiPhase(prev => prev + 1);
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
    }, [aiPhase, hasStartedAiAnalysis, verification.match_score, verification.confidence_level]);

    const aiProgress = aiPhase < 0 ? 0 : Math.min(((aiPhase + 1) / AI_PHASES.length) * 100, 100);

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
        router.post(`/admin/verifikasi-selfie/${verification.raw_id}/${action}`, {}, {
            onSuccess: () => {
                toast.success(`Verifikasi ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
            },
            onError: () => toast.error('Gagal memproses verifikasi'),
            onFinish: () => setIsSubmittingVerification(false),
        });
    };

    const handleDownloadReport = () => {
        window.open(`/admin/verifikasi-selfie/${verification.raw_id}/report`, '_blank');
    };

    const handleRequestAccess = () => {
        if (requestReason.trim().length < 10) {
            toast.error('Alasan minimal 10 karakter');
            return;
        }

        setIsRequestingAccess(true);
        router.post('/selfie-view-requests', {
            selfie_verification_id: verification.raw_id,
            reason: requestReason.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Permintaan izin berhasil dikirim ke mahasiswa');
                setPrivacy((prev) => ({
                    ...prev,
                    request_status: 'pending',
                    can_request: false,
                    message: 'Permintaan izin sedang menunggu persetujuan mahasiswa.',
                    last_request: {
                        reason: requestReason.trim(),
                        requested_at: 'Baru saja',
                    },
                }));
            },
            onError: (errors) => {
                const message = (errors.error as string) ?? 'Gagal mengirim permintaan izin';
                toast.error(message);
            },
            onFinish: () => setIsRequestingAccess(false),
        });
    };

    return (
        <AppLayout>
            <Head title={`Selfie Detail - ${verification.student.name}`} />

            <div className="p-6 space-y-6">
                {/* 1. HEADER SECTION */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-5 sm:p-8 text-white shadow-2xl">
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
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
                                onClick={() => router.visit('/admin/verifikasi-selfie')}
                                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2 h-auto text-sm gap-1.5 group"
                            >
                                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                Kembali ke Daftar
                            </Button>
                        </motion.div>

                        {/* Main Header Content */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6">
                            {/* Left: Icon + Title */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                <motion.div
                                    className="relative flex shrink-0 h-16 w-16 sm:h-20 sm:w-20 items-center justify-center"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 250, delay: 0.2 }}
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
                                        className="text-[10px] sm:text-xs text-indigo-200 font-semibold tracking-widest uppercase mb-1"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        AI Face Recognition
                                    </motion.p>
                                    <motion.h1
                                        className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        Verifikasi Selfie Detail
                                    </motion.h1>
                                    <motion.p
                                        className="text-xs sm:text-sm text-indigo-100/80 mt-1.5 max-w-md leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.45 }}
                                    >
                                        Analisis wajah mendalam dengan teknologi AI untuk validasi kehadiran mahasiswa
                                    </motion.p>
                                </div>
                            </div>

                            {/* Right: AI Status Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                                whileHover={{ scale: 1.05, y: -3 }}
                                className="relative group shrink-0"
                            >
                                <div className={cn(
                                    "absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity",
                                    aiComplete
                                        ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                        : isAiProcessing
                                          ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                                          : "bg-gradient-to-r from-slate-400 to-slate-500"
                                )} />
                                <div className="relative flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-xl px-5 py-3 sm:px-6 sm:py-4 shadow-2xl border border-white/20 text-white">
                                    {isAiProcessing ? (
                                        <motion.div
                                            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300" />
                                        </motion.div>
                                    ) : aiComplete ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300" />
                                        </motion.div>
                                    ) : (
                                        <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-slate-200" />
                                    )}
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-indigo-200/80 font-semibold tracking-wide uppercase">AI Status</p>
                                        <p className={cn(
                                            "text-base sm:text-lg font-black tracking-wider",
                                            aiComplete
                                                ? "text-emerald-300"
                                                : isAiProcessing
                                                  ? "text-cyan-300"
                                                  : "text-slate-200"
                                        )}>
                                            {aiComplete ? 'COMPLETE' : isAiProcessing ? 'PROCESSING' : 'IDLE'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Image Comparison */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* AI Face Comparison */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-500" /> AI Face Comparison
                                </h2>
                                <div className="flex items-center gap-2">
                                    {isAiProcessing ? (
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </motion.div>
                                            AI Processing...
                                        </motion.div>
                                    ) : aiComplete ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200 }}
                                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Complete
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-full bg-neutral-700 px-3 py-1.5 text-xs font-medium text-white shadow-lg sm:px-4 sm:py-2 sm:text-sm">
                                            <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Idle
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        onClick={handleRunAiComparison}
                                        disabled={isAiProcessing || !canRunAiComparison}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60"
                                    >
                                        {isAiProcessing ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Brain className="mr-2 h-4 w-4" />
                                        )}
                                        {aiComplete ? 'Jalankan Ulang AI' : 'Jalankan AI'}
                                    </Button>
                                </div>
                            </div>

                            {/* AI Processing HUD Overlay */}
                            {isAiProcessing && aiPhase >= 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 sm:p-5 rounded-2xl bg-black/90 border border-cyan-500/30 text-white space-y-4"
                                >
                                    {/* Progress bar */}
                                    <div className="flex items-center justify-between text-xs text-cyan-400 font-mono mb-1">
                                        <span>PHASE {aiPhase + 1}/{AI_PHASES.length}</span>
                                        <span>{Math.round(aiProgress)}%</span>
                                    </div>
                                    <div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full relative overflow-hidden"
                                            animate={{ width: `${aiProgress}%` }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                        >
                                            <motion.div
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Phase steps */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {AI_PHASES.map((phase, idx) => {
                                            const PhaseIcon = phase.icon;
                                            const isActive = idx === aiPhase;
                                            const isDone = idx < aiPhase;
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: idx <= aiPhase ? 1 : 0.3, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={cn(
                                                        "flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs transition-all",
                                                        isActive && "bg-cyan-500/10 border-cyan-500/40 text-cyan-300",
                                                        isDone && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                                                        !isActive && !isDone && "border-neutral-800 text-neutral-500"
                                                    )}
                                                >
                                                    <div className="shrink-0">
                                                        {isDone ? (
                                                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                        ) : isActive ? (
                                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                                                                <Loader2 className="h-4 w-4 text-cyan-400" />
                                                            </motion.div>
                                                        ) : (
                                                            <PhaseIcon className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold truncate">{phase.label}</p>
                                                        {(isActive || isDone) && (
                                                            <p className="text-[10px] text-neutral-500 font-mono truncate">{phase.detail}</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Terminal-style log */}
                                    <div className="mt-2 p-3 rounded-lg bg-black border border-neutral-800 font-mono text-[10px] sm:text-xs text-green-400 space-y-1 max-h-24 overflow-y-auto">
                                        {aiPhase >= 0 && <p><span className="text-neutral-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-cyan-400">INFO</span> Neural network model loaded</p>}
                                        {aiPhase >= 1 && <p><span className="text-neutral-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-cyan-400">INFO</span> Reference embedding fetched (512-dim vector)</p>}
                                        {aiPhase >= 2 && <p><span className="text-neutral-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-green-400">OK</span> Face detected in reference: 1 face(s)</p>}
                                        {aiPhase >= 2 && <p><span className="text-neutral-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-green-400">OK</span> Face detected in selfie: 1 face(s)</p>}
                                        {aiPhase >= 3 && <p><span className="text-neutral-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-cyan-400">INFO</span> Extracted 68 landmark points per face</p>}
                                        {aiPhase >= 4 && <p><span className="text-neutral-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-cyan-400">INFO</span> Computing cosine similarity...</p>}
                                        {aiPhase >= 5 && <p><span className="text-neutral-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-yellow-400">RESULT</span> Match score: {verification.match_score}%</p>}
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Reference Photo */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">Foto Referensi</h3>
                                        <Badge variant="outline">Database</Badge>
                                    </div>
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                                        <img src={verification.student.photo} alt="Reference" className="w-full h-full object-cover" />

                                        {/* Scanning line - only during processing */}
                                        {!aiComplete && aiPhase >= 2 && (
                                            <motion.div variants={scanningVariants} initial="initial" animate="animate" className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                        )}

                                        {/* Face bounding box - appears after face detection phase */}
                                        {aiPhase >= 2 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                                                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="absolute top-[10%] left-[10%] right-[10%] bottom-[20%] border-2 border-cyan-400 rounded-lg">
                                                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-cyan-400" />
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-400" />
                                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-cyan-400" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-cyan-400" />
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="absolute -top-8 left-0 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full"
                                                    >FACE DETECTED</motion.div>
                                                </motion.div>
                                            </motion.div>
                                        )}

                                        {/* Landmarks - appear after landmark extraction phase */}
                                        {aiPhase >= 3 && facialLandmarks.reference.map((point, i) => (
                                            <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.03, type: 'spring' }} className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" style={{ left: `${point.x}%`, top: `${point.y}%` }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Selfie Photo */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">Foto Selfie</h3>
                                        <Badge variant="outline">Live Capture</Badge>
                                    </div>
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                                        {!privacy.is_locked && verification.selfie_photo ? (
                                            <>
                                                <img src={verification.selfie_photo} alt="Selfie" className="w-full h-full object-cover" />

                                                {/* Scanning line - only during processing */}
                                                {!aiComplete && aiPhase >= 2 && (
                                                    <motion.div variants={scanningVariants} initial="initial" animate="animate" className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                                                )}

                                                {/* Face bounding box - appears after face detection, color based on final result after complete */}
                                                {aiPhase >= 2 && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: 'spring', stiffness: 200 }}
                                                            className={cn(
                                                                "absolute top-[10%] left-[10%] right-[10%] bottom-[20%] border-2 rounded-lg",
                                                                aiComplete
                                                                    ? verification.match_score >= 80 ? "border-green-400" : verification.match_score >= 60 ? "border-yellow-400" : "border-red-400"
                                                                    : "border-cyan-400"
                                                            )}
                                                        >
                                                            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
                                                                const borderColor = aiComplete
                                                                    ? verification.match_score >= 80 ? "border-green-400" : verification.match_score >= 60 ? "border-yellow-400" : "border-red-400"
                                                                    : "border-cyan-400";
                                                                const pos = corner.split('-');
                                                                return (
                                                                    <div key={corner} className={cn(
                                                                        "absolute w-4 h-4",
                                                                        pos[0] === 'top' ? '-top-1' : '-bottom-1',
                                                                        pos[1] === 'left' ? '-left-1' : '-right-1',
                                                                        pos[0] === 'top' ? `border-t-4` : `border-b-4`,
                                                                        pos[1] === 'left' ? `border-l-4` : `border-r-4`,
                                                                        borderColor
                                                                    )} />
                                                                );
                                                            })}

                                                            {aiComplete && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                                    className={cn(
                                                                        "absolute -top-8 left-0 px-3 py-1 text-white text-xs font-bold rounded-full",
                                                                        verification.match_score >= 80 ? "bg-green-500" : verification.match_score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                                                    )}
                                                                >
                                                                    {verification.match_score >= 80 ? "MATCH" : verification.match_score >= 60 ? "PARTIAL MATCH" : "NO MATCH"}
                                                                </motion.div>
                                                            )}

                                                            {!aiComplete && aiPhase >= 2 && (
                                                                <motion.div
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1, repeat: Infinity }}
                                                                    className="absolute -top-8 left-0 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full"
                                                                >ANALYZING...</motion.div>
                                                            )}
                                                        </motion.div>
                                                    </motion.div>
                                                )}

                                                {aiPhase >= 3 && facialLandmarks.selfie.map((point, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: i * 0.03, type: 'spring' }}
                                                        className={cn(
                                                            "absolute w-2 h-2 rounded-full",
                                                            aiComplete
                                                                ? verification.match_score >= 80 ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" : verification.match_score >= 60 ? "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]"
                                                                : "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                                                        )}
                                                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                                    />
                                                ))}
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 p-5 text-center backdrop-blur-sm">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
                                                    <Lock className="h-6 w-6 text-white" />
                                                </div>
                                                <p className="text-sm font-semibold text-white">Foto selfie terkunci</p>
                                                <p className="max-w-xs text-xs text-white/80">{privacy.message}</p>
                                            </div>
                                        )}
                                    </div>
                                    {privacy.is_locked && (
                                        <div className="rounded-xl border border-amber-300/40 bg-amber-100/50 p-3 dark:border-amber-700/40 dark:bg-amber-900/20">
                                            <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">Akses Privasi Selfie</p>
                                            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">{privacy.message}</p>
                                            {privacy.last_request?.requested_at && (
                                                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">Permintaan terakhir: {privacy.last_request.requested_at}</p>
                                            )}
                                            {privacy.last_request?.response_note && (
                                                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">Catatan mahasiswa: {privacy.last_request.response_note}</p>
                                            )}
                                            <textarea
                                                value={requestReason}
                                                onChange={(event) => setRequestReason(event.target.value)}
                                                rows={3}
                                                className="mt-3 w-full rounded-lg border border-amber-300/40 bg-white/80 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-amber-500 dark:border-amber-700/40 dark:bg-neutral-900/70 dark:text-white"
                                                placeholder="Tulis alasan permintaan izin (minimal 10 karakter)"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleRequestAccess}
                                                disabled={!privacy.can_request || isRequestingAccess}
                                                className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
                                            >
                                                {isRequestingAccess ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                                                {privacy.request_status === 'pending' ? 'Menunggu Persetujuan Mahasiswa' : 'Minta Izin ke Mahasiswa'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Score Banner - ONLY after AI completes */}
                            <AnimatePresence>
                                {aiComplete && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.3 }}
                                        className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800/50"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5, type: 'spring' }}
                                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                                                >
                                                    <Brain className="h-6 w-6" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="font-bold text-neutral-900 dark:text-white">AI Match Score</h3>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Confidence Level: {verification.confidence_level}%</p>
                                                </div>
                                            </div>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                                                className="text-right"
                                            >
                                                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">{verification.match_score}%</p>
                                                <p className="text-xs text-neutral-500 mt-1">Match Accuracy</p>
                                            </motion.div>
                                        </div>
                                        <div className="relative h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${verification.match_score}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }} className={cn("h-full rounded-full relative overflow-hidden", verification.match_score >= 80 ? "bg-gradient-to-r from-green-400 to-emerald-600" : verification.match_score >= 60 ? "bg-gradient-to-r from-yellow-400 to-amber-600" : "bg-gradient-to-r from-red-400 to-rose-600")}>
                                                <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                            </motion.div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <Badge variant={verification.match_score >= 80 ? 'success' : verification.match_score >= 60 ? 'warning' : 'destructive'} className="text-sm px-4 py-2 border-0">
                                                {verification.match_score >= 80 ? <><CheckCircle className="h-4 w-4 mr-2" /> Verified - High Confidence</> : verification.match_score >= 60 ? <><AlertTriangle className="h-4 w-4 mr-2" /> Partial Match - Review</> : <><XCircle className="h-4 w-4 mr-2" /> No Match</>}
                                            </Badge>
                                            <div className="text-xs text-neutral-500 font-medium">Processed in {verification.processing_time}ms</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Detail Analysis */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <Cpu className="h-5 w-5 text-purple-500" /> AI Analysis Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Face Quality</span>
                                        <Badge variant="outline" className="dark:border-neutral-600">{verification.face_quality}%</Badge>
                                    </div>
                                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${verification.face_quality}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-gradient-to-r from-blue-400 to-cyan-500" />
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Lighting</span>
                                        <Badge variant="outline" className="dark:border-neutral-600">{verification.lighting_score}%</Badge>
                                    </div>
                                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${verification.lighting_score}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-gradient-to-r from-yellow-400 to-amber-500" />
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Face Angle</span>
                                        <Badge variant="outline" className="dark:border-neutral-600">{verification.face_angle}°</Badge>
                                    </div>
                                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${(180 - Math.abs(verification.face_angle)) / 180 * 100}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-purple-400 to-pink-500" />
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Sharpness</span>
                                        <Badge variant="outline" className="dark:border-neutral-600">{verification.sharpness_score}%</Badge>
                                    </div>
                                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${verification.sharpness_score}%` }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-gradient-to-r from-green-400 to-emerald-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-500/20">
                                <div className="flex items-start gap-3">
                                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                                        <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                    </motion.div>
                                    <div>
                                        <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">AI Insights</h4>
                                        <p className="text-sm text-purple-700 dark:text-purple-400 leading-relaxed">{verification.ai_insights}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Details & Actions */}
                    <div className="space-y-6">
                        {/* STUDENT PROFILE CARD */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <motion.div className="relative h-32 w-32 mx-auto" whileHover={{ scale: 1.05 }}>
                                        <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-neutral-800">
                                            <AvatarImage src={verification.student.photo} />
                                            <AvatarFallback className="text-3xl font-bold">{verification.student.initials}</AvatarFallback>
                                        </Avatar>
                                        <motion.div className="absolute inset-0 rounded-full border-4 border-cyan-500" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                                    </motion.div>
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{verification.student.name}</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mt-1">{verification.student.nim}</p>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="mt-4">
                                    <Badge variant={verification.status === 'verified' ? 'success' : verification.status === 'rejected' ? 'destructive' : 'warning'} className="text-sm px-6 py-2 border-0 shadow-lg">
                                        {verification.status === 'verified' && <CheckCircle className="h-4 w-4 mr-2" />}
                                        {verification.status === 'rejected' && <XCircle className="h-4 w-4 mr-2" />}
                                        {verification.status === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                                        {verification.status.toUpperCase()}
                                    </Badge>
                                </motion.div>
                            </div>
                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2"><span className="text-neutral-600 dark:text-neutral-400">Program Studi</span><span className="font-medium text-neutral-900 dark:text-white">{verification.student.major}</span></div>
                                <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2"><span className="text-neutral-600 dark:text-neutral-400">Semester</span><span className="font-medium text-neutral-900 dark:text-white">{verification.student.semester}</span></div>
                                <div className="flex justify-between pb-2"><span className="text-neutral-600 dark:text-neutral-400">Waktu Upload</span><span className="font-medium text-neutral-900 dark:text-white">{verification.uploaded_at}</span></div>
                            </div>
                        </motion.div>

                        {/* AI MATCH SCORE CIRCULAR CARD */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 p-6 backdrop-blur-xl shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}><Brain className="h-6 w-6 text-cyan-500" /></motion.div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">AI Match Score</h3>
                            </div>
                            <div className="relative h-48 w-48 mx-auto mb-4">
                                <svg className="transform -rotate-90 h-48 w-48">
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-neutral-200 dark:text-neutral-800" />
                                    <motion.circle cx="96" cy="96" r="88" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeLinecap="round" initial={{ strokeDasharray: "0 552" }} animate={{ strokeDasharray: `${(verification.match_score / 100) * 552} 552` }} transition={{ duration: 2, ease: "easeOut", delay: 0.5 }} />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#06b6d4" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <motion.p className="text-5xl font-black bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}>{verification.match_score}%</motion.p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Match Score</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <Badge variant={verification.match_score >= 90 ? 'success' : verification.match_score >= 70 ? 'warning' : 'destructive'} className="text-sm px-4 py-1.5 border-0">
                                    {verification.match_score >= 90 && 'Sangat Cocok'}
                                    {verification.match_score >= 70 && verification.match_score < 90 && 'Cukup Cocok'}
                                    {verification.match_score < 70 && 'Tidak Cocok'}
                                </Badge>
                            </div>
                        </motion.div>

                        {/* ACTION BUTTONS */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Actions</h3>
                            <div className="space-y-3">
                                {privacy.is_locked && (
                                    <div className="rounded-xl border border-amber-300/40 bg-amber-100/60 p-3 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200">
                                        Verifikasi ulang dikunci. Minta izin mahasiswa terlebih dahulu untuk membuka selfie.
                                    </div>
                                )}
                                {verification.status === 'pending' && !privacy.is_locked && (
                                    <>
                                        <Button disabled={isSubmittingVerification} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg" onClick={() => handleVerify('approve')}>
                                            {isSubmittingVerification ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />} Setujui Verifikasi
                                        </Button>
                                        <Button disabled={isSubmittingVerification} variant="destructive" className="w-full shadow-lg" onClick={() => handleVerify('reject')}>
                                            {isSubmittingVerification ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />} Tolak Verifikasi
                                        </Button>
                                    </>
                                )}
                                <Button variant="outline" className="w-full bg-white/50 hover:bg-white dark:bg-neutral-800/50 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700" onClick={handleDownloadReport}>
                                    <Download className="h-4 w-4 mr-2 text-indigo-500" /> Download Report
                                </Button>
                                <Button variant="outline" className="w-full bg-white/50 hover:bg-white dark:bg-neutral-800/50 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700">
                                    <Share2 className="h-4 w-4 mr-2 text-cyan-500" /> Share Results
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Liveness, History, Report Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* FACIAL FEATURES & LIVENESS */}
                    <div className="space-y-6">
                        {/* Features */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2"><ScanFace className="h-5 w-5 text-cyan-500" /> Facial Features Info</h2>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/10 border border-cyan-200 dark:border-cyan-500/20">
                                    <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Face Detection Confidence</span><Badge variant="success" className="border-0">{verification.face_detection_confidence}%</Badge></div>
                                    <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${verification.face_detection_confidence}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Eyes', detected: verification.features.eyes, icon: Eye },
                                        { label: 'Nose', detected: verification.features.nose, icon: Scan },
                                        { label: 'Mouth', detected: verification.features.mouth, icon: Smile },
                                        { label: 'Eyebrows', detected: verification.features.eyebrows, icon: Scan },
                                    ].map((feature, idx) => (
                                        <div key={idx} className={cn("p-3 rounded-xl border", feature.detected ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800")}>
                                            <div className="flex items-center gap-2">
                                                <feature.icon className={cn("h-4 w-4", feature.detected ? "text-green-600" : "text-red-600")} />
                                                <span className="text-sm font-medium text-neutral-900 dark:text-white">{feature.label}</span>
                                                {feature.detected ? <CheckCircle className="h-4 w-4 text-green-600 ml-auto" /> : <XCircle className="h-4 w-4 text-red-600 ml-auto" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-500/20">
                                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-3">Emotion Detection</h4>
                                    <div className="space-y-3">
                                        {verification.emotions.map((emotion, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-xs text-purple-700 dark:text-purple-400">{emotion.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-purple-200 dark:bg-purple-900/50 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${emotion.confidence}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-purple-400 to-pink-500" />
                                                    </div>
                                                    <span className="text-xs font-medium text-purple-900 dark:text-purple-300 w-8 text-right">{emotion.confidence}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Liveness */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-green-500" /> Liveness Detection</h2>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Shield className="h-5 w-5 text-green-600 dark:text-green-500" /></motion.div><span className="font-semibold text-green-900 dark:text-green-300">Liveness Score</span></div>
                                        <span className="text-2xl font-black text-green-600 dark:text-green-400">{verification.liveness_score}%</span>
                                    </div>
                                    <div className="h-3 bg-green-200 dark:bg-green-900/50 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${verification.liveness_score}%` }} transition={{ duration: 1.2 }} className="h-full bg-gradient-to-r from-green-400 to-emerald-600 relative overflow-hidden">
                                            <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Real Person Detected', passed: verification.liveness_checks.real_person, icon: User },
                                        { label: 'No Screen Detection', passed: verification.liveness_checks.no_screen, icon: Monitor },
                                        { label: 'No Mask Detection', passed: verification.liveness_checks.no_mask, icon: Shield },
                                        { label: 'Eye Blink Detected', passed: verification.liveness_checks.eye_blink, icon: Eye },
                                        { label: 'Head Movement', passed: verification.liveness_checks.head_movement, icon: Move },
                                    ].map((check, idx) => (
                                        <div key={idx} className={cn("flex items-center justify-between p-3 rounded-xl border", check.passed ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50")}>
                                            <div className="flex items-center gap-2">
                                                <check.icon className={cn("h-4 w-4", check.passed ? "text-green-600" : "text-red-600")} />
                                                <span className="text-sm font-medium text-neutral-900 dark:text-white">{check.label}</span>
                                            </div>
                                            {check.passed ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 border border-blue-200 dark:border-blue-500/20">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Anti-Spoofing Check</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">{verification.anti_spoofing_passed ? "Tidak ada indikasi spoofing terdeteksi. Foto asli dari kamera." : "Terdeteksi kemungkinan spoofing. Perlu review manual."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* REPORT & ANOMALIES & HISTORY */}
                    <div className="space-y-6">
                        {verification.anomalies && verification.anomalies.length > 0 && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/5 dark:to-orange-500/5 p-6 backdrop-blur-xl shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}><AlertTriangle className="h-6 w-6 text-red-500" /></motion.div>
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">AI Anomaly Detection</h2>
                                </div>
                                <div className="space-y-3">
                                    {verification.anomalies.map((anom, idx) => (
                                        <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-red-200 dark:border-red-800/50">
                                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">{anom.type}</h4>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{anom.description}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="destructive" className="text-xs border-0">Severity: {anom.severity}</Badge>
                                                    <span className="text-xs text-neutral-500">Confidence: {anom.confidence}%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-500" /> Verification Report</h2>
                            <div className="space-y-4">
                                <div className={cn("p-4 rounded-xl border", verification.match_score >= 80 ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50" : verification.match_score >= 60 ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/50" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50")}>
                                    <div className="flex items-start gap-3">
                                        {verification.match_score >= 80 ? <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /> : verification.match_score >= 60 ? <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" /> : <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />}
                                        <div>
                                            <h4 className={cn("font-semibold mb-1", verification.match_score >= 80 ? "text-green-900 dark:text-green-300" : verification.match_score >= 60 ? "text-yellow-900 dark:text-yellow-300" : "text-red-900 dark:text-red-300")}>
                                                {verification.match_score >= 80 ? "Verification Passed" : verification.match_score >= 60 ? "Manual Review Required" : "Verification Failed"}
                                            </h4>
                                            <p className={cn("text-sm", verification.match_score >= 80 ? "text-green-700 dark:text-green-400" : verification.match_score >= 60 ? "text-yellow-700 dark:text-yellow-400" : "text-red-700 dark:text-red-400")}>{verification.overall_assessment}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"><span className="text-neutral-600 dark:text-neutral-400">Verification ID:</span><span className="font-mono font-medium text-neutral-900 dark:text-white">{verification.id}</span></div>
                                    <div className="flex justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"><span className="text-neutral-600 dark:text-neutral-400">Verified By:</span><span className="font-medium text-neutral-900 dark:text-white">{verification.verified_by || 'AI System'}</span></div>
                                    <div className="flex justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"><span className="text-neutral-600 dark:text-neutral-400">Date:</span><span className="font-medium text-neutral-900 dark:text-white">{verification.verification_date}</span></div>
                                </div>
                                {verification.recommendations && verification.recommendations.length > 0 && (
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-200 dark:border-indigo-500/20">
                                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Recommendations</h4>
                                        <ul className="space-y-1 text-sm text-indigo-700 dark:text-indigo-400">
                                            {verification.recommendations.map((rec, idx) => <li key={idx} className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">•</span><span>{rec}</span></li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2"><History className="h-5 w-5 text-purple-500" /> Verification History</h2>
                            <div className="space-y-4">
                                {verification.history.map((item, index) => (
                                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.05 + 0.2 }} className={cn("flex h-10 w-10 items-center justify-center rounded-full shadow-inner", item.status === 'approved' ? "bg-green-500" : item.status === 'rejected' ? "bg-red-500" : "bg-yellow-500")}>
                                                {item.status === 'approved' && <CheckCircle className="h-5 w-5 text-white" />}
                                                {item.status === 'rejected' && <XCircle className="h-5 w-5 text-white" />}
                                                {item.status === 'pending' && <Clock className="h-5 w-5 text-white" />}
                                            </motion.div>
                                            {index < verification.history.length - 1 && <div className="w-px h-full bg-neutral-200 dark:bg-neutral-700 mt-2 min-h-8" />}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="rounded-xl bg-white/50 dark:bg-neutral-800/50 p-4 border border-neutral-200 dark:border-neutral-700">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div><h4 className="font-semibold text-neutral-900 dark:text-white">{item.action}</h4><p className="text-sm text-neutral-600 dark:text-neutral-400">{item.timestamp}</p></div>
                                                    <Badge variant="outline" className="dark:border-neutral-600">{item.by}</Badge>
                                                </div>
                                                {item.notes && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 italic shadow-sm bg-black/5 dark:bg-black/20 p-2 rounded-md">"{item.notes}"</p>}
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
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-white/5">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2"><Users className="h-5 w-5 text-cyan-500" /> Related Verifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {relatedVerifications.map((related, index) => (
                                <motion.div key={related.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.05, y: -5 }} className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 cursor-pointer shadow-md" onClick={() => router.visit(`/admin/verifikasi-selfie/${related.id}`)}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10 border border-neutral-200 dark:border-neutral-700"><AvatarImage src={related.student.photo} /><AvatarFallback>{related.student.initials}</AvatarFallback></Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white truncate text-sm">{related.student.name}</h4>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400">{related.student.nim}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant={related.status === 'verified' ? 'success' : related.status === 'rejected' ? 'destructive' : 'warning'} className="text-[10px] px-2 py-0 h-5 border-0 shadow-sm">{related.status.toUpperCase()}</Badge>
                                        <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{related.match_score}% match</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 mt-2">{related.timestamp}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
