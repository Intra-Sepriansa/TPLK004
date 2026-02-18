import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    Bot,
    Camera,
    User,
    Eye,
    Image as ImageIcon,
    MapPin,
    Smartphone,
    Shield,
    Brain,
    CheckCircle,
    XCircle,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Reuse types from verification-detail or define subset needed
interface AIAnalysisJSON {
    face_detection?: { processing_time?: number; landmarks_count?: number; emotion?: string };
    liveness?: { processing_time?: number; confidence?: number };
    quality?: { processing_time?: number; resolution?: string; format?: string };
    location?: { processing_time?: number };
    device?: { processing_time?: number; trust_score?: number };
    fraud?: { processing_time?: number };
}

interface VerificationData {
    id: number;
    mahasiswa: { nama: string; photo_url: string | null };
    selfie_url: string | null;
    reference_photo_url: string | null;
    device_model: string;
    device_os: string;
    scanned_at: string;
    face_match_score: number;
    face_detected: boolean;
    is_live_photo: boolean;
    image_quality_score: number;
    distance_m: number;
    accuracy: number;
    is_location_valid: boolean;
    is_device_trusted: boolean;
    risk_score: number;
    fraud_flags: string[] | string | null; // Can be JSON string or array
    ai_recommendation: string;
    ai_confidence: number;
    ai_analysis_json?: AIAnalysisJSON | null;
    is_suspicious: boolean;
    spoofing_detected: boolean;
    lighting_score?: number;
    blur_score?: number;
}

interface Props {
    verification: VerificationData;
    onClose: () => void;
}

function ScanningAnimation({ steps, currentStep }: { steps: any[]; currentStep: number }) {
    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0"
                >
                    <Bot className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                    <h2 className="text-2xl font-bold text-white">AI Verification Pipeline</h2>
                    <p className="text-violet-300">Memproses data real-time...</p>
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const Icon = step.icon;

                    return (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                'relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all overflow-hidden',
                                isActive && 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20',
                                isCompleted && 'border-emerald-500 bg-emerald-500/10',
                                !isActive && !isCompleted && 'border-slate-700 bg-slate-800/50',
                            )}
                        >
                            {/* Icon */}
                            <div
                                className={cn(
                                    'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 z-10',
                                    isActive && 'bg-gradient-to-br from-violet-500 to-purple-600 animate-pulse',
                                    isCompleted && 'bg-gradient-to-br from-emerald-500 to-green-600',
                                    !isActive && !isCompleted && 'bg-slate-700',
                                )}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="h-6 w-6 text-white" />
                                ) : isActive ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Icon className="h-6 w-6 text-white" />
                                    </motion.div>
                                ) : (
                                    <Icon className="h-6 w-6 text-slate-400" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 z-10 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-white truncate">{step.title}</h3>
                                    {isActive && <span className="text-xs font-mono text-violet-300">+{step.duration}ms</span>}
                                </div>
                                <p className="text-sm text-slate-400 truncate">{step.description}</p>
                            </div>

                            {/* Status Badge */}
                            {isActive && (
                                <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-bold z-10 hidden sm:inline-block"
                                >
                                    Processing
                                </motion.span>
                            )}

                            {/* Scanning Effect */}
                            {isActive && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Progress</span>
                    <span className="text-sm font-mono text-violet-300">
                        {Math.min(currentStep + 1, steps.length)}/{steps.length}
                    </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </div>
    );
}

function AnalysisCard({
    title,
    icon: Icon,
    data,
}: {
    title: string;
    icon: any;
    data: Record<string, any>;
}) {
    return (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-violet-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-violet-400" />
                <h4 className="font-semibold text-slate-200 text-sm">{title}</h4>
            </div>
            <div className="space-y-1">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                        <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-mono text-slate-200 font-medium truncate ml-2 max-w-[120px]">
                            {typeof value === 'boolean'
                                ? value
                                    ? 'Yes'
                                    : 'No'
                                : String(value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ResultsDisplay({ verification }: { verification: VerificationData }) {
    const analysis = verification.ai_analysis_json;
    const flags =
        typeof verification.fraud_flags === 'string'
            ? JSON.parse(verification.fraud_flags)
            : verification.fraud_flags ?? [];

    return (
        <div className="flex flex-col h-full overflow-y-auto max-h-[85vh]">
            <div className="p-8 pb-0">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-violet-400" /> AI Verification Results
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Face Comparison Section */}
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 relative group">
                                    {verification.selfie_url ? (
                                        <img
                                            src={verification.selfie_url}
                                            alt="Selfie"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Camera className="h-10 w-10 text-slate-600" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center text-xs text-white font-medium backdrop-blur-sm">
                                        Selfie
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 relative group">
                                    {verification.reference_photo_url ? (
                                        <img
                                            src={verification.reference_photo_url}
                                            alt="Reference"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="h-10 w-10 text-slate-600" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center text-xs text-white font-medium backdrop-blur-sm">
                                        Reference
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Match Score */}
                        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-300 font-medium">Face Match Score</span>
                                <span
                                    className={cn(
                                        'text-3xl font-black tracking-tight',
                                        verification.face_match_score >= 80
                                            ? 'text-emerald-400'
                                            : verification.face_match_score >= 60
                                                ? 'text-amber-400'
                                                : 'text-red-400',
                                    )}
                                >
                                    {verification.face_match_score}%
                                </span>
                            </div>
                            <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
                                <motion.div
                                    className={cn(
                                        'h-full',
                                        verification.face_match_score >= 80 && 'bg-gradient-to-r from-emerald-500 to-green-600',
                                        verification.face_match_score >= 60 &&
                                        verification.face_match_score < 80 &&
                                        'bg-gradient-to-r from-amber-500 to-orange-600',
                                        verification.face_match_score < 60 && 'bg-gradient-to-r from-red-500 to-rose-600',
                                    )}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${verification.face_match_score}%` }}
                                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Overall Decision Section */}
                    <div className="flex flex-col justify-center space-y-4">
                        <div
                            className={cn(
                                'p-6 rounded-3xl border-2 text-center transition-all duration-500',
                                verification.ai_recommendation === 'approve' &&
                                'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20 shadow-2xl',
                                verification.ai_recommendation === 'review' &&
                                'border-amber-500 bg-amber-500/10 shadow-amber-500/20 shadow-2xl',
                                verification.ai_recommendation === 'reject' &&
                                'border-red-500 bg-red-500/10 shadow-red-500/20 shadow-2xl',
                            )}
                        >
                            <span className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2 block">
                                AI Recommendation
                            </span>
                            <div
                                className={cn(
                                    'text-4xl font-black mb-2',
                                    verification.ai_recommendation === 'approve' && 'text-emerald-400',
                                    verification.ai_recommendation === 'review' && 'text-amber-400',
                                    verification.ai_recommendation === 'reject' && 'text-red-400',
                                )}
                            >
                                {(verification.ai_recommendation ?? 'N/A').toUpperCase()}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-slate-300 text-sm border border-white/10">
                                <Brain className="h-4 w-4" />
                                <span>Confidence: {verification.ai_confidence}%</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-violet-400" /> Fraud Analysis
                            </h4>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-slate-400">Risk Score</span>
                                <span className={cn("font-bold", verification.risk_score > 50 ? "text-red-400" : "text-emerald-400")}>{verification.risk_score}%</span>
                            </div>
                            {flags.length > 0 ? (
                                <div className="space-y-1">
                                    {flags.map((flag: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-red-300 bg-red-900/20 p-2 rounded border border-red-900/30">
                                            <Shield className="h-3 w-3 shrink-0 mt-0.5" /> {flag}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-emerald-400 bg-emerald-900/20 p-2 rounded border border-emerald-900/30 flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3" /> No fraud flags detected
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Details Grid */}
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnalysisCard
                    title="Face Detection"
                    icon={User}
                    data={{
                        detected: verification.face_detected,
                        landmarks: analysis?.face_detection?.landmarks_count || 0,
                        emotion: analysis?.face_detection?.emotion || 'neutral',
                    }}
                />
                <AnalysisCard
                    title="Liveness Check"
                    icon={Eye}
                    data={{
                        isLive: verification.is_live_photo,
                        score: analysis?.liveness?.confidence || 0,
                        spoofing: verification.spoofing_detected,
                    }}
                />
                <AnalysisCard
                    title="Image Quality"
                    icon={ImageIcon}
                    data={{
                        quality: verification.image_quality_score,
                        blur: verification.blur_score ?? 'N/A',
                        lighting: verification.lighting_score ?? 'N/A',
                    }}
                />
                <AnalysisCard
                    title="Location Check"
                    icon={MapPin}
                    data={{
                        distance: `${verification.distance_m}m`,
                        accuracy: `${verification.accuracy}m`,
                        valid: verification.is_location_valid,
                    }}
                />
                <AnalysisCard
                    title="Device Check"
                    icon={Smartphone}
                    data={{
                        model: verification.device_model,
                        os: verification.device_os,
                        trusted: verification.is_device_trusted,
                    }}
                />
                <AnalysisCard
                    title="Fraud Scan"
                    icon={Shield}
                    data={{
                        risk: `${verification.risk_score}%`,
                        flags: flags.length,
                        suspicious: verification.is_suspicious,
                    }}
                />
            </div>
        </div>
    );
}

export default function AIVerificationScanModal({ verification, onClose }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isScanning, setIsScanning] = useState(true);
    const [showResults, setShowResults] = useState(false);

    // REAL Data Steps
    // Times based on either recorded processing time or sensible defaults
    const analysis = verification.ai_analysis_json;
    const steps = [
        {
            step: 'submitted',
            icon: Camera,
            title: 'Selfie Submitted',
            duration: 500,
            description: `${verification.mahasiswa.nama} submitted selfie via ${verification.device_model}`,
        },
        {
            step: 'face_recognition',
            icon: User,
            title: 'Face Recognition',
            duration: analysis?.face_detection?.processing_time || 254,
            description: `Face match: ${verification.face_match_score}% • ${analysis?.face_detection?.landmarks_count || 0} landmarks`,
        },
        {
            step: 'liveness',
            icon: Eye,
            title: 'Liveness Detection',
            duration: analysis?.liveness?.processing_time || 477,
            description: `Score: ${analysis?.liveness?.confidence || 0}% • ${verification.is_live_photo ? 'Live face' : 'Spoofing'}`,
        },
        {
            step: 'quality',
            icon: ImageIcon,
            title: 'Image Quality',
            duration: analysis?.quality?.processing_time || 165,
            description: `Quality: ${verification.image_quality_score}% • ${analysis?.quality?.resolution || 'HD'}`,
        },
        {
            step: 'location',
            icon: MapPin,
            title: 'Location Verification',
            duration: analysis?.location?.processing_time || 241,
            description: `Distance: ${verification.distance_m}m • Accuracy: ${verification.accuracy}m`,
        },
        {
            step: 'device',
            icon: Smartphone,
            title: 'Device Analysis',
            duration: analysis?.device?.processing_time || 66,
            description: `${verification.device_model} • Trust: ${analysis?.device?.trust_score || 0}%`,
        },
        {
            step: 'fraud',
            icon: Shield,
            title: 'Fraud Detection',
            duration: analysis?.fraud?.processing_time || 577,
            description: `Risk: ${verification.risk_score}% • ${typeof verification.fraud_flags === 'string' ? JSON.parse(verification.fraud_flags).length : (verification.fraud_flags?.length || 0)} flags`,
        },
        {
            step: 'decision',
            icon: Brain,
            title: 'AI Decision',
            duration: 800,
            description: `Decision: ${(verification.ai_recommendation ?? 'N/A').toUpperCase()} • Confidence: ${verification.ai_confidence}%`,
        },
    ];

    useEffect(() => {
        if (!isScanning) return;

        let currentTime = 0;
        let mounted = true;

        steps.forEach((step, index) => {
            setTimeout(() => {
                if (mounted) {
                    setCurrentStep(index);
                    // If last step, show results
                    if (index === steps.length - 1) {
                        setTimeout(() => {
                            if (mounted) {
                                setIsScanning(false);
                                setShowResults(true);
                            }
                        }, step.duration);
                    }
                }
            }, currentTime);
            currentTime += step.duration;
        });

        return () => {
            mounted = false;
        };
    }, [isScanning]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-4xl bg-slate-900 rounded-3xl border border-violet-500/30 shadow-2xl shadow-violet-500/20 overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-50 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <XCircle className="h-6 w-6" />
                    </button>

                    {isScanning ? (
                        <ScanningAnimation steps={steps} currentStep={currentStep} />
                    ) : (
                        <ResultsDisplay verification={verification} />
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

