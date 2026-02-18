import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    Brain,
    ScanFace,
    UserCheck,
    ShieldCheck,
    ImageIcon,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Clock,
    XCircle,
} from 'lucide-react';

interface AIStep {
    key: string;
    label: string;
    description: string;
    icon: typeof Brain;
}

const AI_STEPS: AIStep[] = [
    {
        key: 'face_detection',
        label: 'Face Detection',
        description: 'Mendeteksi wajah dalam foto selfie',
        icon: ScanFace,
    },
    {
        key: 'face_matching',
        label: 'Face Matching',
        description: 'Mencocokkan wajah dengan foto referensi',
        icon: UserCheck,
    },
    {
        key: 'liveness_detection',
        label: 'Liveness Detection',
        description: 'Memverifikasi bahwa foto bukan spoof',
        icon: ShieldCheck,
    },
    {
        key: 'quality_analysis',
        label: 'Quality Analysis',
        description: 'Menganalisis kualitas gambar',
        icon: ImageIcon,
    },
    {
        key: 'fraud_detection',
        label: 'Fraud Detection',
        description: 'Memeriksa indikator kecurangan',
        icon: AlertTriangle,
    },
];

function getStepStatus(
    stepKey: string,
    currentProcessingStep: string | null,
): 'pending' | 'processing' | 'completed' | 'failed' {
    if (!currentProcessingStep) return 'pending';
    if (currentProcessingStep === 'failed') return 'failed';
    if (currentProcessingStep === 'completed') return 'completed';

    const stepIndex = AI_STEPS.findIndex((s) => s.key === stepKey);
    const currentIndex = AI_STEPS.findIndex((s) => s.key === currentProcessingStep);

    if (currentIndex < 0) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'processing';
    return 'pending';
}

interface AIProcessAnimationProps {
    attendanceLogId: number | null;
    initialStep: string | null;
    aiConfidence?: number | null;
    aiRecommendation?: string | null;
}

export default function AIProcessAnimation({
    attendanceLogId,
    initialStep,
    aiConfidence,
    aiRecommendation,
}: AIProcessAnimationProps) {
    const [currentStep, setCurrentStep] = useState<string | null>(initialStep);
    const [confidence, setConfidence] = useState<number | null>(aiConfidence ?? null);
    const [recommendation, setRecommendation] = useState<string | null>(aiRecommendation ?? null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isProcessing = currentStep !== null && currentStep !== 'completed' && currentStep !== 'failed';

    // Poll for updates while processing
    useEffect(() => {
        if (!attendanceLogId || !isProcessing) return;

        intervalRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`/api/attendance/${attendanceLogId}/ai-status`);
                const data = res.data;
                setCurrentStep(data.ai_processing_step);
                if (data.ai_confidence != null) setConfidence(data.ai_confidence);
                if (data.ai_recommendation != null) setRecommendation(data.ai_recommendation);

                if (data.ai_processing_step === 'completed' || data.ai_processing_step === 'failed') {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
            } catch {
                // Silently ignore polling errors
            }
        }, 2000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [attendanceLogId, isProcessing]);

    const statusColors = {
        pending: 'text-slate-400 border-slate-600/30 bg-slate-800/30',
        processing: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10',
        completed: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
        failed: 'text-red-400 border-red-500/50 bg-red-500/10',
    };

    const recommendationStyles: Record<string, { bg: string; text: string; label: string }> = {
        approve: { bg: 'from-emerald-500/20 to-green-500/20 border-emerald-500/50', text: 'text-emerald-300', label: 'Direkomendasikan Disetujui' },
        review: { bg: 'from-amber-500/20 to-yellow-500/20 border-amber-500/50', text: 'text-amber-300', label: 'Perlu Review Manual' },
        reject: { bg: 'from-red-500/20 to-rose-500/20 border-red-500/50', text: 'text-red-300', label: 'Direkomendasikan Ditolak' },
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/20 ring-1 ring-cyan-500/30">
                        <Brain className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">AI Verification Pipeline</h3>
                        <p className="text-xs text-slate-400">
                            {isProcessing
                                ? 'Sedang memproses...'
                                : currentStep === 'completed'
                                    ? 'Verifikasi selesai'
                                    : currentStep === 'failed'
                                        ? 'Verifikasi gagal'
                                        : 'Menunggu verifikasi'}
                        </p>
                    </div>
                    {isProcessing && (
                        <motion.div
                            className="ml-auto"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                            <Loader2 className="h-5 w-5 text-cyan-400" />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Steps */}
            <div className="p-6 space-y-3">
                <AnimatePresence>
                    {AI_STEPS.map((step, i) => {
                        const status = getStepStatus(step.key, currentStep);
                        const Icon = step.icon;

                        return (
                            <motion.div
                                key={step.key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.3 }}
                                className={`flex items-center gap-4 p-3 rounded-xl border ${statusColors[status]} transition-all duration-500`}
                            >
                                {/* Status icon */}
                                <div className="flex-shrink-0 relative">
                                    {status === 'processing' ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="p-2 rounded-lg bg-cyan-500/20"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            >
                                                <Loader2 className="h-4 w-4 text-cyan-400" />
                                            </motion.div>
                                        </motion.div>
                                    ) : status === 'completed' ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 400 }}
                                            className="p-2 rounded-lg bg-emerald-500/20"
                                        >
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        </motion.div>
                                    ) : status === 'failed' ? (
                                        <div className="p-2 rounded-lg bg-red-500/20">
                                            <XCircle className="h-4 w-4 text-red-400" />
                                        </div>
                                    ) : (
                                        <div className="p-2 rounded-lg bg-slate-700/50">
                                            <Clock className="h-4 w-4 text-slate-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Step info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-3.5 w-3.5 ${status === 'completed' ? 'text-emerald-400' : status === 'processing' ? 'text-cyan-400' : 'text-slate-500'}`} />
                                        <span className={`text-xs font-medium ${status === 'completed' ? 'text-emerald-300' : status === 'processing' ? 'text-cyan-300' : 'text-slate-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{step.description}</p>
                                </div>

                                {/* Status badge */}
                                <div className="flex-shrink-0">
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status === 'completed'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : status === 'processing'
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : status === 'failed'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-slate-700/50 text-slate-500'
                                        }`}>
                                        {status === 'completed' ? 'Done' : status === 'processing' ? 'Processing' : status === 'failed' ? 'Failed' : 'Waiting'}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                        <span>Progress</span>
                        <span>{AI_STEPS.filter((s) => getStepStatus(s.key, currentStep) === 'completed').length}/{AI_STEPS.length}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${(AI_STEPS.filter((s) => getStepStatus(s.key, currentStep) === 'completed').length / AI_STEPS.length) * 100}%`,
                            }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Result card - shown when completed */}
                {currentStep === 'completed' && confidence !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`mt-4 p-4 rounded-xl border bg-gradient-to-br ${recommendationStyles[recommendation ?? 'review']?.bg ?? recommendationStyles.review.bg}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-slate-400 uppercase tracking-wider">AI Recommendation</p>
                                <p className={`text-sm font-semibold mt-0.5 ${recommendationStyles[recommendation ?? 'review']?.text ?? 'text-slate-300'}`}>
                                    {recommendationStyles[recommendation ?? 'review']?.label ?? 'Menunggu'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] text-slate-400">Confidence</p>
                                <p className={`text-xl font-bold ${confidence >= 80 ? 'text-emerald-400' : confidence >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {confidence}%
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
