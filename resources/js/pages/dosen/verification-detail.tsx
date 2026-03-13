import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Bot,
    Brain,
    Camera,
    Check,
    CheckCircle,
    Clock,
    Cpu,
    Eye,
    Fingerprint,
    Globe,
    Heart,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Shield,
    Smartphone,
    Sparkles,
    User,
    X,
    XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';

/* ═══════ TYPES ═══════ */
interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
    avatar_url: string | null;
    email: string;
    phone: string;
    kelas: string;
    prodi: string;
    fakultas: string;
    semester: string;
}
interface DeviceInfo {
    type?: string | null;
    model?: string | null;
    os?: string | null;
    browser?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    is_trusted?: boolean | null;
    device_id?: string | null;
    screen_resolution?: string | null;
    timezone?: string | null;
    platform?: string | null;
}
interface LocationData {
    latitude?: number | null;
    longitude?: number | null;
    accuracy?: number | null;
    address?: string | null;
    distance_m?: number | null;
}

interface VerificationDetail {
    id: number;
    mahasiswa: Mahasiswa;
    selfie_url: string | null;
    reference_photo_url: string | null;
    course: string;
    meeting_number: number;
    session_date: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
    date_display: string;
    time_display: string;
    rejection_reason: string | null;
    verified_by: string | null;
    verified_at: string | null;
    attendance_log_id: number;
    is_scanned: boolean;
    ai_processed_at: string | null;
    scanned_at: string | null;
    face_match_score: number | null;
    face_detected: boolean | null;
    is_live_photo: boolean | null;
    spoofing_detected: boolean | null;
    image_quality_score: number | null;
    ai_confidence: number | null;
    ai_recommendation: string | null;
    risk_score: number | null;
    fraud_flags: string[] | null;
    is_suspicious: boolean | null;
    ai_analysis: any | null;
    device_info: DeviceInfo | null;
    location_data: LocationData | null;
}
interface Props {
    verification: VerificationDetail;
}

/* ═══════ VARIANTS ═══════ */
const cV = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;
const iV = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

const statusCfg: Record<
    string,
    { label: string; gradient: string; icon: typeof CheckCircle }
> = {
    pending: {
        label: 'Menunggu Verifikasi',
        gradient: 'from-amber-500 via-orange-500 to-amber-600',
        icon: Clock,
    },
    approved: {
        label: 'Disetujui',
        gradient: 'from-emerald-500 via-teal-500 to-green-600',
        icon: CheckCircle,
    },
    rejected: {
        label: 'Ditolak',
        gradient: 'from-red-500 via-rose-500 to-red-600',
        icon: XCircle,
    },
};
const riskColors: Record<string, { text: string; bg: string; border: string }> =
    {
        low: {
            text: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800/30',
        },
        medium: {
            text: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800/30',
        },
        high: {
            text: 'text-orange-600',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-200 dark:border-orange-800/30',
        },
        critical: {
            text: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800/30',
        },
    };
const sColor = (s: number | null) =>
    s === null
        ? 'text-neutral-400'
        : s >= 85
          ? 'text-emerald-600'
          : s >= 70
            ? 'text-amber-600'
            : 'text-red-600';
const sBg = (s: number | null) =>
    s === null
        ? 'bg-neutral-300'
        : s >= 85
          ? 'bg-emerald-500'
          : s >= 70
            ? 'bg-amber-500'
            : 'bg-red-500';

function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700',
                className,
            )}
        />
    );
}

/* ═══════ COMPONENT ═══════ */
export default function VerificationDetailPage({ verification: v }: Props) {
    const { flash } = usePage().props as any;
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanStage, setScanStage] = useState(-1);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanComplete, setScanComplete] = useState(false);

    const scanStages = [
        {
            icon: Camera,
            label: 'Detecting Face',
            desc: 'Menganalisis wajah pada selfie...',
            color: 'from-violet-500 to-purple-600',
        },
        {
            icon: User,
            label: 'Face Recognition',
            desc: 'Membandingkan dengan foto referensi...',
            color: 'from-blue-500 to-indigo-600',
        },
        {
            icon: Heart,
            label: 'Liveness Detection',
            desc: 'Memverifikasi foto asli bukan manipulasi...',
            color: 'from-pink-500 to-rose-600',
        },
        {
            icon: Shield,
            label: 'Image Quality',
            desc: 'Menganalisis kualitas gambar...',
            color: 'from-emerald-500 to-teal-600',
        },
        {
            icon: MapPin,
            label: 'Location Verification',
            desc: 'Memverifikasi lokasi GPS mahasiswa...',
            color: 'from-amber-500 to-orange-600',
        },
        {
            icon: Smartphone,
            label: 'Device Analysis',
            desc: 'Memeriksa keamanan perangkat...',
            color: 'from-cyan-500 to-blue-600',
        },
        {
            icon: AlertTriangle,
            label: 'Fraud Detection',
            desc: 'Mencari indikasi kecurangan...',
            color: 'from-red-500 to-rose-600',
        },
        {
            icon: Brain,
            label: 'Final Decision',
            desc: 'Menghitung skor AI dan keputusan...',
            color: 'from-indigo-500 to-violet-600',
        },
    ];

    const sc = statusCfg[v.status] ?? statusCfg.pending;
    const ai = v.ai_analysis;
    const scanned = v.is_scanned;
    const face = ai?.face_recognition;
    const liveness = ai?.liveness_detection;
    const quality = ai?.image_quality;
    const fraud = ai?.fraud_detection;
    const device = ai?.device_analysis;
    const location = ai?.location_verification;
    const behavior = ai?.behavioral_analysis;

    const riskLevel =
        fraud?.risk_level ??
        (v.risk_score !== null
            ? v.risk_score > 85
                ? 'critical'
                : v.risk_score > 65
                  ? 'high'
                  : v.risk_score > 40
                    ? 'medium'
                    : 'low'
            : 'low');
    const risk = riskColors[riskLevel] ?? riskColors.low;

    const doApprove = () => {
        setProcessingId(v.id);
        router.patch(
            `/dosen/verify/${v.id}/approve`,
            {},
            {
                onSuccess: () => {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                },
                onFinish: () => setProcessingId(null),
            },
        );
    };
    const doReject = () => {
        setProcessingId(v.id);
        router.patch(
            `/dosen/verify/${v.id}/reject`,
            { reason: rejectionReason },
            {
                onSuccess: () => {
                    setIsRejectOpen(false);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                },
                onFinish: () => setProcessingId(null),
            },
        );
    };
    const doScanAI = useCallback(async () => {
        setScanning(true);
        setScanStage(-1);
        setScanProgress(0);
        setScanComplete(false);

        // Start staged animation
        const stageDelay = (ms: number) =>
            new Promise((r) => setTimeout(r, ms));
        const fetchPromise = fetch(`/dosen/verify/${v.id}/scan-ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    (document.querySelector('meta[name="csrf-token"]') as any)
                        ?.content ?? '',
            },
        });

        // Animate through stages while waiting for response
        for (let i = 0; i < 8; i++) {
            setScanStage(i);
            const stageStart = (i / 8) * 100;
            const stageEnd = ((i + 1) / 8) * 100;
            const duration = 400 + Math.random() * 600;
            const steps = 20;
            for (let s = 0; s <= steps; s++) {
                setScanProgress(
                    Math.round(
                        stageStart + (stageEnd - stageStart) * (s / steps),
                    ),
                );
                await stageDelay(duration / steps);
            }
        }

        // Wait for API response
        try {
            const res = await fetchPromise;
            if (res.ok) {
                setScanComplete(true);
                setScanProgress(100);
                await stageDelay(1500);
                router.reload();
            }
        } catch {
            /* ignore */
        }
        setScanning(false);
        setScanStage(-1);
    }, [v.id]);

    /* ═══ Timeline ═══ */
    const timeline = !scanned
        ? []
        : [
              {
                  time: v.time_display,
                  label: 'Selfie Submitted',
                  type: 'info' as const,
                  desc: `${v.mahasiswa.nama} mengirim selfie via ${v.device_info?.model ?? v.device_info?.type ?? '-'}`,
              },
              {
                  time: `+${face?.processing_time_ms ?? 0}ms`,
                  label: 'Face Recognition',
                  type:
                      (face?.face_match_score ?? 0) >= 70
                          ? ('success' as const)
                          : ('warning' as const),
                  desc: `Face match: ${face?.face_match_score ?? 0}% • ${face?.face_landmarks_detected ?? 0} landmarks • Emotion: ${face?.emotion ?? '-'}`,
              },
              {
                  time: `+${liveness?.processing_time_ms ?? 0}ms`,
                  label: 'Liveness Detection',
                  type: liveness?.is_live
                      ? ('success' as const)
                      : ('danger' as const),
                  desc: `Score: ${liveness?.liveness_score ?? 0}% • ${liveness?.is_live ? 'Live confirmed' : 'NOT live'}`,
              },
              {
                  time: `+${quality?.processing_time_ms ?? 0}ms`,
                  label: 'Image Quality',
                  type:
                      (quality?.overall_score ?? 0) >= 70
                          ? ('success' as const)
                          : ('warning' as const),
                  desc: `Quality: ${quality?.overall_score ?? 0}% • ${quality?.resolution?.megapixels ?? 0}MP`,
              },
              {
                  time: `+${location?.processing_time_ms ?? 0}ms`,
                  label: 'Location Verification',
                  type: location?.is_verified
                      ? ('success' as const)
                      : ('danger' as const),
                  desc: `Distance: ${location?.distance_meters ?? v.location_data?.distance_m ?? '-'}m • ${location?.geofence_check === 'inside' ? 'Inside campus' : 'Outside campus'}`,
              },
              {
                  time: `+${device?.processing_time_ms ?? 0}ms`,
                  label: 'Device Analysis',
                  type: device?.is_trusted
                      ? ('success' as const)
                      : ('warning' as const),
                  desc: `${device?.device_name ?? '-'} • Trust: ${device?.trust_score ?? 0}%`,
              },
              {
                  time: `+${fraud?.processing_time_ms ?? 0}ms`,
                  label: 'Fraud Detection',
                  type:
                      riskLevel === 'low'
                          ? ('success' as const)
                          : riskLevel === 'medium'
                            ? ('warning' as const)
                            : ('danger' as const),
                  desc: `Risk: ${riskLevel.toUpperCase()} (${fraud?.risk_score ?? 0}%) • ${(fraud?.flags ?? []).length} flag(s)`,
              },
              {
                  time: `${ai?.total_processing_time_ms ?? 0}ms total`,
                  label: 'AI Decision',
                  type:
                      ai?.overall_decision === 'approve'
                          ? ('success' as const)
                          : ai?.overall_decision === 'reject'
                            ? ('danger' as const)
                            : ('warning' as const),
                  desc: `Decision: ${(ai?.overall_decision ?? '-').toUpperCase()} • Confidence: ${ai?.confidence_score ?? 0}%`,
              },
          ];

    return (
        <DosenLayout>
            <Head title={`Verifikasi — ${v.mahasiswa.nama}`} />

            {/* Success Toast */}
            <AnimatePresence>
                {(showSuccess || flash?.success) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-50 flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-2xl backdrop-blur dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200"
                    >
                        <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-500" />
                        <div>
                            <p className="font-bold">Berhasil!</p>
                            <p className="text-xs opacity-80">
                                {flash?.success || 'Aksi berhasil dilakukan!'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ ADVANCED AI SCAN OVERLAY ═══ */}
            <AnimatePresence>
                {scanning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, rgba(15,10,40,0.97) 0%, rgba(0,0,0,0.99) 100%)',
                        }}
                    >
                        {/* Animated grid background */}
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }}
                        />

                        {/* Floating particles */}

                        {/* Orbital rings */}

                        {/* Central scan container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="relative z-10 mx-4 w-full max-w-lg"
                        >
                            {/* Glowing backdrop */}
                            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-purple-600/20 blur-3xl" />

                            <div className="relative rounded-3xl border border-violet-500/30 bg-neutral-950/80 p-8 shadow-2xl shadow-violet-500/10 backdrop-blur-2xl">
                                {/* Top section: Brain icon + title */}
                                <div className="mb-8 text-center">
                                    <motion.div
                                        className="relative mx-auto mb-4 h-20 w-20"
                                        animate={
                                            scanComplete
                                                ? { scale: [1, 1.2, 1] }
                                                : {}
                                        }
                                    >
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 opacity-30" />
                                        <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-violet-400/50 bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/50">
                                            {scanComplete ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        delay: 0.2,
                                                    }}
                                                >
                                                    <CheckCircle className="h-10 w-10 text-emerald-300" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: 'linear',
                                                    }}
                                                >
                                                    <Brain className="h-10 w-10 text-violet-200" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                    <h2 className="mb-1 text-xl font-bold text-white">
                                        {scanComplete
                                            ? 'Analisis Selesai!'
                                            : 'AI Verification Scan'}
                                    </h2>
                                    <p className="text-sm text-violet-300/70">
                                        {scanComplete
                                            ? 'Semua data berhasil dianalisis'
                                            : `Menganalisis data presensi ${v.mahasiswa.nama}`}
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-6">
                                    <div className="mb-2 flex items-center justify-between text-xs">
                                        <span className="font-medium text-violet-300/70">
                                            Progress
                                        </span>
                                        <motion.span
                                            key={scanProgress}
                                            className="text-lg font-bold text-violet-200 tabular-nums"
                                            initial={{ y: -5, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                        >
                                            {scanProgress}%
                                        </motion.span>
                                    </div>
                                    <div className="relative h-2 overflow-hidden rounded-full bg-neutral-800">
                                        <motion.div
                                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500"
                                            style={{
                                                width: `${scanProgress}%`,
                                            }}
                                            transition={{ duration: 0.15 }}
                                        />
                                        <div
                                            className="absolute inset-y-0 left-0 rounded-full bg-white/20"
                                            style={{
                                                width: `${scanProgress}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Pipeline stages */}
                                <div className="space-y-2">
                                    {scanStages.map((stage, i) => {
                                        const StageIcon = stage.icon;
                                        const isDone =
                                            scanStage > i || scanComplete;
                                        const isActive =
                                            scanStage === i && !scanComplete;
                                        const isPending =
                                            scanStage < i && !scanComplete;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{
                                                    opacity: isPending
                                                        ? 0.4
                                                        : 1,
                                                    x: 0,
                                                }}
                                                transition={{
                                                    delay: i * 0.05,
                                                    duration: 0.3,
                                                }}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-all duration-300',
                                                    isActive
                                                        ? 'border-violet-500/50 bg-violet-950/80 shadow-lg shadow-violet-500/10'
                                                        : isDone
                                                          ? 'border-emerald-500/20 bg-emerald-950/30'
                                                          : 'border-neutral-800/50 bg-neutral-900/30',
                                                )}
                                            >
                                                {/* Icon */}
                                                <div
                                                    className={cn(
                                                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                                                        isDone
                                                            ? 'bg-emerald-500/20'
                                                            : isActive
                                                              ? `bg-gradient-to-br ${stage.color} shadow-md`
                                                              : 'bg-neutral-800',
                                                    )}
                                                >
                                                    {isDone ? (
                                                        <motion.div
                                                            initial={{
                                                                scale: 0,
                                                                rotate: -180,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                rotate: 0,
                                                            }}
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 500,
                                                            }}
                                                        >
                                                            <Check className="h-4 w-4 text-emerald-400" />
                                                        </motion.div>
                                                    ) : isActive ? (
                                                        <motion.div
                                                            animate={{
                                                                rotate: 360,
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: 'linear',
                                                            }}
                                                        >
                                                            <StageIcon className="h-4 w-4 text-white" />
                                                        </motion.div>
                                                    ) : (
                                                        <StageIcon className="h-4 w-4 text-neutral-500" />
                                                    )}
                                                </div>
                                                {/* Label */}
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className={cn(
                                                            'text-xs font-semibold',
                                                            isDone
                                                                ? 'text-emerald-300'
                                                                : isActive
                                                                  ? 'text-white'
                                                                  : 'text-neutral-500',
                                                        )}
                                                    >
                                                        {stage.label}
                                                    </p>
                                                    {isActive && (
                                                        <motion.p
                                                            initial={{
                                                                opacity: 0,
                                                                height: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                height: 'auto',
                                                            }}
                                                            className="mt-0.5 text-[10px] text-violet-300/60"
                                                        >
                                                            {stage.desc}
                                                        </motion.p>
                                                    )}
                                                </div>
                                                {/* Status indicator */}
                                                {isActive && (
                                                    <div className="flex gap-1">
                                                        {[0, 1, 2].map((d) => (
                                                            <div
                                                                key={d}
                                                                className="h-1.5 w-1.5 rounded-full bg-violet-400"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                {isDone && (
                                                    <span className="text-[9px] font-bold text-emerald-400">
                                                        DONE
                                                    </span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Scan line effect for active */}
                                {!scanComplete && scanStage >= 0 && (
                                    <div className="mt-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
                                )}

                                {/* Complete message */}
                                {scanComplete && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-center"
                                    >
                                        <p className="text-sm font-bold text-emerald-300">
                                            ✓ Verifikasi AI selesai
                                        </p>
                                        <p className="mt-1 text-[10px] text-emerald-400/60">
                                            Memuat hasil analisis...
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={cV}
                className="space-y-6 p-4 md:p-6"
            >
                {/* ═══ Back ═══ */}
                {/* ═══ Back ═══ */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-2"
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/dosen/verify')}
                        className="group text-neutral-500 transition-all duration-300 hover:bg-neutral-200/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-white"
                    >
                        <motion.div
                            whileHover={{ x: -4 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                            }}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </motion.div>
                        Kembali ke Daftar Verifikasi
                    </Button>
                </motion.div>

                {/* ═══ HEADER CARD ═══ */}
                <motion.div
                    variants={iV}
                    className="relative overflow-hidden rounded-3xl shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative p-8">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-white/80 shadow-2xl ring-4 ring-white/20">
                                    <AvatarImage
                                        src={
                                            v.mahasiswa.avatar_url || undefined
                                        }
                                    />
                                    <AvatarFallback className="bg-white/20 text-3xl font-bold text-white backdrop-blur-xl">
                                        {v.mahasiswa.nama?.[0] ?? '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={cn(
                                        'absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white',
                                        v.status === 'approved'
                                            ? 'bg-emerald-500'
                                            : v.status === 'rejected'
                                              ? 'bg-red-500'
                                              : 'bg-amber-500',
                                    )}
                                >
                                    <sc.icon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <Badge className="mb-2 border-white/10 bg-white/20 text-white backdrop-blur">
                                    {sc.label}
                                </Badge>
                                <h1 className="text-3xl font-bold text-white">
                                    {v.mahasiswa.nama}
                                </h1>
                                <p className="mt-1 text-sm text-white/80">
                                    {v.mahasiswa.nim} • {v.mahasiswa.kelas} •{' '}
                                    {v.mahasiswa.prodi}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/70">
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5" />{' '}
                                        {v.mahasiswa.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />{' '}
                                        {v.mahasiswa.phone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />{' '}
                                        {v.date_display} {v.time_display}
                                    </span>
                                </div>
                            </div>
                            {/* AI Confidence + Scan Button (Compact Dashboard Style) */}
                            <div className="mt-4 flex w-full flex-wrap items-center justify-start gap-3">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                    className="flex w-auto items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-4 py-2.5 shadow-lg backdrop-blur-xl"
                                >
                                    <div
                                        className={cn(
                                            'shrink-0 rounded-lg p-2',
                                            scanned
                                                ? 'bg-white/20'
                                                : 'bg-white/10',
                                        )}
                                    >
                                        <Sparkles
                                            className={cn(
                                                'h-5 w-5',
                                                scanned
                                                    ? 'text-white'
                                                    : 'text-white/50',
                                            )}
                                        />
                                    </div>
                                    <div className="flex flex-col whitespace-nowrap">
                                        <p className="text-[10px] font-semibold tracking-widest text-white/70 uppercase">
                                            AI Confidence
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-xl font-bold text-white">
                                                {scanned
                                                    ? `${v.ai_confidence ?? 0}%`
                                                    : '-'}
                                            </p>
                                            <span className="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-white/80">
                                                {!scanned
                                                    ? 'Pending'
                                                    : v.ai_recommendation ===
                                                        'approve'
                                                      ? 'Approve'
                                                      : v.ai_recommendation ===
                                                          'reject'
                                                        ? 'Reject'
                                                        : 'Review'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.button
                                    whileHover={{
                                        scale: 1.02,
                                        backgroundColor: 'rgba(139,92,246,0.9)',
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={doScanAI}
                                    disabled={scanning}
                                    className="flex h-[60px] w-auto shrink-0 items-center justify-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-600 px-5 py-3 font-semibold whitespace-nowrap text-white shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50"
                                >
                                    {scanning ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Bot className="h-5 w-5" />
                                    )}
                                    <span className="text-sm">
                                        {scanning
                                            ? 'Scanning...'
                                            : scanned
                                              ? 'Re-scan AI'
                                              : 'Scan AI'}
                                    </span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ AI ANALYSIS REPORT (Combined Container) ═══ */}
                <motion.div
                    variants={iV}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                        <Brain className="h-5 w-5 text-indigo-600" /> AI
                        Analysis Report
                        {scanned && (
                            <Badge className="ml-2 border-0 bg-emerald-100 text-[10px] text-emerald-700">
                                Scanned
                            </Badge>
                        )}
                        {!scanned && (
                            <Badge className="ml-2 border-0 bg-neutral-100 text-[10px] text-neutral-500">
                                Belum di-scan
                            </Badge>
                        )}
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* ─── LEFT: Face Comparison ─── */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-2 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Selfie Submitted
                                    </p>
                                    <div className="h-56 overflow-hidden rounded-2xl bg-neutral-100 shadow-inner dark:bg-neutral-800">
                                        {v.selfie_url ? (
                                            <img
                                                src={v.selfie_url}
                                                alt="Selfie"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Camera className="h-12 w-12 text-neutral-300" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-2 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Reference Photo
                                    </p>
                                    <div className="h-56 overflow-hidden rounded-2xl bg-neutral-100 shadow-inner dark:bg-neutral-800">
                                        {v.reference_photo_url ? (
                                            <img
                                                src={v.reference_photo_url}
                                                alt="Reference"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <User className="h-12 w-12 text-neutral-300" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Score Bars */}
                            <div className="space-y-3">
                                {[
                                    {
                                        label: 'Face Match Score',
                                        value: scanned
                                            ? (face?.face_match_score ??
                                              v.face_match_score)
                                            : null,
                                        icon: User,
                                    },
                                    {
                                        label: 'Liveness Detection',
                                        value: scanned
                                            ? (liveness?.liveness_score ?? null)
                                            : null,
                                        icon: Heart,
                                    },
                                    {
                                        label: 'Image Quality',
                                        value: scanned
                                            ? (quality?.overall_score ??
                                              v.image_quality_score)
                                            : null,
                                        icon: Shield,
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                                <item.icon className="h-3.5 w-3.5 text-purple-500" />{' '}
                                                {item.label}
                                            </span>
                                            {item.value !== null ? (
                                                <span
                                                    className={cn(
                                                        'font-bold',
                                                        sColor(item.value),
                                                    )}
                                                >
                                                    {item.value}%
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-neutral-400">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                            {item.value !== null ? (
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${item.value}%`,
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        delay: i * 0.2,
                                                    }}
                                                    className={cn(
                                                        'h-full rounded-full',
                                                        sBg(item.value),
                                                    )}
                                                />
                                            ) : (
                                                <Skeleton className="h-full w-full" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Face Details */}
                            {scanned ? (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-xl bg-purple-50 p-2.5 dark:bg-purple-900/15">
                                        <p className="text-[9px] font-bold text-purple-400 uppercase">
                                            Landmarks
                                        </p>
                                        <p className="text-sm font-bold text-purple-600">
                                            {face?.face_landmarks_detected ??
                                                '-'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-indigo-50 p-2.5 dark:bg-indigo-900/15">
                                        <p className="text-[9px] font-bold text-indigo-400 uppercase">
                                            Emotion
                                        </p>
                                        <p className="text-sm font-bold text-indigo-600 capitalize">
                                            {face?.emotion ?? '-'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-pink-50 p-2.5 dark:bg-pink-900/15">
                                        <p className="text-[9px] font-bold text-pink-400 uppercase">
                                            Age Est.
                                        </p>
                                        <p className="text-sm font-bold text-pink-600">
                                            {face?.age_estimation ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-14 rounded-xl"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Liveness Sub-scores */}
                            {scanned ? (
                                <div className="space-y-2 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                    <p className="flex items-center gap-2 text-xs font-semibold">
                                        <Heart className="h-3.5 w-3.5 text-pink-500" />{' '}
                                        Liveness Sub-Analysis
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div>
                                            <span className="text-neutral-400">
                                                Texture:
                                            </span>{' '}
                                            <span
                                                className={cn(
                                                    'font-bold',
                                                    sColor(
                                                        liveness
                                                            ?.texture_analysis
                                                            ?.score,
                                                    ),
                                                )}
                                            >
                                                {liveness?.texture_analysis
                                                    ?.score ?? '-'}
                                                %
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">
                                                Depth:
                                            </span>{' '}
                                            <span
                                                className={cn(
                                                    'font-bold',
                                                    sColor(
                                                        liveness?.depth_analysis
                                                            ?.score,
                                                    ),
                                                )}
                                            >
                                                {liveness?.depth_analysis
                                                    ?.score ?? '-'}
                                                %
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">
                                                Reflection:
                                            </span>{' '}
                                            <span
                                                className={cn(
                                                    'font-bold',
                                                    sColor(
                                                        liveness
                                                            ?.reflection_analysis
                                                            ?.score,
                                                    ),
                                                )}
                                            >
                                                {liveness?.reflection_analysis
                                                    ?.score ?? '-'}
                                                %
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">
                                                Micro-Expr:
                                            </span>{' '}
                                            <span
                                                className={cn(
                                                    'font-bold',
                                                    sColor(
                                                        liveness
                                                            ?.micro_expression
                                                            ?.naturalness_score,
                                                    ),
                                                )}
                                            >
                                                {liveness?.micro_expression
                                                    ?.naturalness_score ?? '-'}
                                                %
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">
                                                Eye Blink:
                                            </span>{' '}
                                            <span className="font-bold">
                                                {liveness?.eye_blink?.detected
                                                    ? '✓ Detected'
                                                    : '✗ Not detected'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">
                                                Moiré:
                                            </span>{' '}
                                            <span className="font-bold">
                                                {liveness?.moire_pattern_detected
                                                    ? '⚠ Detected'
                                                    : '✓ None'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Skeleton className="h-28 rounded-2xl" />
                            )}
                        </div>

                        {/* ─── RIGHT: AI Analysis + Device + Location ─── */}
                        <div className="max-h-[700px] space-y-4 overflow-y-auto pr-1">
                            {/* Risk Level */}
                            {scanned ? (
                                <div
                                    className={cn(
                                        'flex items-center gap-3 rounded-2xl border p-4',
                                        risk.bg,
                                        risk.border,
                                    )}
                                >
                                    <Shield
                                        className={cn('h-6 w-6', risk.text)}
                                    />
                                    <div>
                                        <p
                                            className={cn(
                                                'text-sm font-bold',
                                                risk.text,
                                            )}
                                        >
                                            Risk Level:{' '}
                                            {riskLevel.toUpperCase()}
                                        </p>
                                        <p className="text-[11px] text-neutral-500">
                                            {(fraud?.flags ?? []).length > 0
                                                ? `${fraud!.flags.length} flag(s)`
                                                : 'No fraud flags'}{' '}
                                            • Probability:{' '}
                                            {(
                                                (fraud?.fraud_probability ??
                                                    0) * 100
                                            ).toFixed(1)}
                                            %
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <Skeleton className="h-16 rounded-2xl" />
                            )}

                            {/* Location */}
                            {scanned ? (
                                <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                    <p className="flex items-center gap-2 text-sm font-semibold">
                                        <MapPin className="h-4 w-4 text-emerald-500" />{' '}
                                        Location Verification
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-neutral-400">
                                                Status
                                            </p>
                                            <p
                                                className={cn(
                                                    'font-bold',
                                                    location?.is_verified
                                                        ? 'text-emerald-600'
                                                        : 'text-red-600',
                                                )}
                                            >
                                                {location?.is_verified
                                                    ? '✓ Verified'
                                                    : '✗ Not Verified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                GPS Accuracy
                                            </p>
                                            <p className="font-bold">
                                                {location?.gps_accuracy ??
                                                    v.location_data?.accuracy ??
                                                    '-'}
                                                m
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                Distance
                                            </p>
                                            <p
                                                className={cn(
                                                    'font-bold',
                                                    (location?.distance_meters ??
                                                        0) <= 100
                                                        ? 'text-emerald-600'
                                                        : 'text-red-600',
                                                )}
                                            >
                                                {location?.distance_meters ??
                                                    v.location_data
                                                        ?.distance_m ??
                                                    '-'}
                                                m
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                Address
                                            </p>
                                            <p className="truncate font-semibold">
                                                {v.location_data?.address ??
                                                    '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Skeleton className="h-28 rounded-2xl" />
                            )}

                            {/* Device */}
                            <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                <p className="flex items-center gap-2 text-sm font-semibold">
                                    <Smartphone className="h-4 w-4 text-cyan-500" />{' '}
                                    Device Information
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-neutral-400">
                                            Device
                                        </p>
                                        <p className="font-semibold">
                                            {v.device_info?.model ??
                                                v.device_info?.type ??
                                                '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400">OS</p>
                                        <p className="font-semibold">
                                            {v.device_info?.os ?? '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400">
                                            Browser
                                        </p>
                                        <p className="font-semibold">
                                            {v.device_info?.browser ?? '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400">
                                            IP Address
                                        </p>
                                        <p className="font-mono text-[10px] font-semibold">
                                            {v.device_info?.ip_address ?? '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400">
                                            Resolution
                                        </p>
                                        <p className="font-semibold">
                                            {v.device_info?.screen_resolution ??
                                                '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400">
                                            Timezone
                                        </p>
                                        <p className="font-semibold">
                                            {v.device_info?.timezone ?? '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400">
                                            Trusted
                                        </p>
                                        <p
                                            className={cn(
                                                'font-bold',
                                                v.device_info?.is_trusted
                                                    ? 'text-emerald-600'
                                                    : 'text-red-600',
                                            )}
                                        >
                                            {v.device_info?.is_trusted === true
                                                ? '✓ Yes'
                                                : v.device_info?.is_trusted ===
                                                    false
                                                  ? '✗ No'
                                                  : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400">
                                            Fingerprint
                                        </p>
                                        <p className="truncate font-mono text-[10px] font-semibold">
                                            {v.device_info?.device_id ?? '-'}
                                        </p>
                                    </div>
                                </div>
                                {scanned && device && (
                                    <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                                        <Badge
                                            className={cn(
                                                'border text-[9px]',
                                                device.is_rooted
                                                    ? 'border-red-200 bg-red-50 text-red-600'
                                                    : 'border-emerald-200 bg-emerald-50 text-emerald-600',
                                            )}
                                        >
                                            <Lock className="mr-0.5 h-2.5 w-2.5" />{' '}
                                            {device.is_rooted
                                                ? 'Rooted'
                                                : 'Not Rooted'}
                                        </Badge>
                                        <Badge
                                            className={cn(
                                                'border text-[9px]',
                                                device.is_emulator
                                                    ? 'border-red-200 bg-red-50 text-red-600'
                                                    : 'border-emerald-200 bg-emerald-50 text-emerald-600',
                                            )}
                                        >
                                            <Cpu className="mr-0.5 h-2.5 w-2.5" />{' '}
                                            {device.is_emulator
                                                ? 'Emulator'
                                                : 'Real Device'}
                                        </Badge>
                                        {device.network?.vpn_detected && (
                                            <Badge className="border border-red-200 bg-red-50 text-[9px] text-red-600">
                                                <Globe className="mr-0.5 h-2.5 w-2.5" />{' '}
                                                VPN Detected
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Behavioral */}
                            {scanned ? (
                                <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                    <p className="flex items-center gap-2 text-sm font-semibold">
                                        <Activity className="h-4 w-4 text-violet-500" />{' '}
                                        Behavioral Analysis
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-neutral-400">
                                                Pattern
                                            </p>
                                            <p className="font-bold">
                                                {behavior?.submission_pattern
                                                    ?.is_normal
                                                    ? '✓ Normal'
                                                    : '⚠ Abnormal'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                Attempts
                                            </p>
                                            <p className="font-semibold">
                                                {behavior?.retry_analysis
                                                    ?.attempt_count ?? '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                Consistency
                                            </p>
                                            <p
                                                className={cn(
                                                    'font-bold',
                                                    sColor(
                                                        behavior
                                                            ?.historical_comparison
                                                            ?.consistency_score,
                                                    ),
                                                )}
                                            >
                                                {behavior?.historical_comparison
                                                    ?.consistency_score ?? '-'}
                                                %
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                Past Rejections
                                            </p>
                                            <p className="font-semibold">
                                                {behavior?.historical_comparison
                                                    ?.past_rejection_rate ??
                                                    '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Skeleton className="h-24 rounded-2xl" />
                            )}

                            {/* Metadata */}
                            {scanned ? (
                                <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                    <p className="flex items-center gap-2 text-sm font-semibold">
                                        <Fingerprint className="h-4 w-4 text-orange-500" />{' '}
                                        Metadata Analysis
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-neutral-400">
                                                EXIF Present
                                            </p>
                                            <p className="font-bold">
                                                {fraud?.metadata_analysis
                                                    ?.exif_present
                                                    ? '✓ Yes'
                                                    : '✗ No'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                Camera
                                            </p>
                                            <p className="font-semibold">
                                                {fraud?.metadata_analysis
                                                    ?.camera_model ?? '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                Software Modified
                                            </p>
                                            <p
                                                className={cn(
                                                    'font-bold',
                                                    fraud?.metadata_analysis
                                                        ?.software_modified
                                                        ? 'text-red-600'
                                                        : 'text-emerald-600',
                                                )}
                                            >
                                                {fraud?.metadata_analysis
                                                    ?.software_modified
                                                    ? '⚠ Yes'
                                                    : '✓ No'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400">
                                                Timestamp Valid
                                            </p>
                                            <p className="font-bold">
                                                {fraud?.metadata_analysis
                                                    ?.timestamp_valid
                                                    ? '✓ Yes'
                                                    : '⚠ No'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Skeleton className="h-24 rounded-2xl" />
                            )}

                            {/* Fraud Flags */}
                            {scanned && (fraud?.flags ?? []).length > 0 && (
                                <div className="space-y-2 rounded-2xl border border-red-200/50 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/10">
                                    <p className="flex items-center gap-2 text-sm font-bold text-red-600">
                                        <AlertTriangle className="h-4 w-4" />{' '}
                                        Fraud Flags ({fraud!.flags.length})
                                    </p>
                                    {fraud!.flags.map(
                                        (f: string, i: number) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300"
                                            >
                                                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                                                <span>{f}</span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                            {/* AI Recommendations */}
                            {scanned &&
                                (ai?.recommendations ?? []).length > 0 && (
                                    <div className="space-y-2 rounded-2xl border border-indigo-200/50 bg-indigo-50 p-4 dark:border-indigo-800/30 dark:bg-indigo-900/10">
                                        <p className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                                            <Sparkles className="h-4 w-4" /> AI
                                            Recommendations
                                        </p>
                                        {ai!.recommendations.map(
                                            (r: string, i: number) => (
                                                <p
                                                    key={i}
                                                    className="text-xs text-indigo-700 dark:text-indigo-300"
                                                >
                                                    • {r}
                                                </p>
                                            ),
                                        )}
                                    </div>
                                )}

                            {/* Not scanned placeholder */}
                            {!scanned && (
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 p-8 dark:border-neutral-700">
                                    <Bot className="mb-3 h-10 w-10 text-neutral-300" />
                                    <p className="text-sm font-semibold text-neutral-400">
                                        Scan AI terlebih dahulu
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                        Klik tombol "Scan AI" di header untuk
                                        memulai analisis
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ═══ VERIFICATION TIMELINE ═══ */}
                <motion.div
                    variants={iV}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                >
                    <h3 className="mb-5 flex items-center gap-2 text-lg font-bold">
                        <Activity className="h-5 w-5 text-indigo-600" />{' '}
                        Verification Timeline
                    </h3>
                    {timeline.length > 0 ? (
                        <div className="relative space-y-4 pl-6">
                            <div className="absolute top-2 bottom-2 left-[11px] w-0.5 rounded-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
                            {timeline.map((t, i) => {
                                const Icon =
                                    t.type === 'success'
                                        ? CheckCircle
                                        : t.type === 'warning'
                                          ? AlertTriangle
                                          : t.type === 'danger'
                                            ? XCircle
                                            : Eye;
                                const dotColor =
                                    t.type === 'success'
                                        ? 'bg-emerald-500'
                                        : t.type === 'warning'
                                          ? 'bg-amber-500'
                                          : t.type === 'danger'
                                            ? 'bg-red-500'
                                            : 'bg-indigo-500';
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="relative flex items-start gap-3"
                                    >
                                        <div
                                            className={cn(
                                                'absolute top-1 left-[-18px] h-3.5 w-3.5 rounded-full border-2 border-white shadow dark:border-neutral-900',
                                                dotColor,
                                            )}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold">
                                                    {t.label}
                                                </p>
                                                <span className="text-[10px] text-neutral-400">
                                                    {t.time}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-neutral-500">
                                                {t.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-10 text-neutral-400">
                            <Eye className="mb-3 h-8 w-8 opacity-40" />
                            <p className="text-sm font-semibold">
                                Belum ada data timeline
                            </p>
                            <p className="mt-1 text-xs">
                                Jalankan AI Scan untuk melihat hasil verifikasi
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* ═══ Sticky Action Bar ═══ */}
                {v.status === 'pending' && (
                    <motion.div
                        variants={iV}
                        className="sticky bottom-4 z-30 flex items-center justify-between rounded-2xl border border-white/30 bg-white/70 p-4 shadow-2xl backdrop-blur-xl dark:bg-neutral-900/70"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'rounded-xl p-2',
                                    scanned && v.ai_recommendation === 'approve'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                        : scanned &&
                                            v.ai_recommendation === 'reject'
                                          ? 'bg-red-100 dark:bg-red-900/30'
                                          : 'bg-amber-100 dark:bg-amber-900/30',
                                )}
                            >
                                <Sparkles
                                    className={cn(
                                        'h-5 w-5',
                                        scanned &&
                                            v.ai_recommendation === 'approve'
                                            ? 'text-emerald-600'
                                            : scanned &&
                                                v.ai_recommendation === 'reject'
                                              ? 'text-red-600'
                                              : 'text-amber-600',
                                    )}
                                />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">
                                    AI Recommendation
                                </p>
                                <p
                                    className={cn(
                                        'text-sm font-bold',
                                        scanned &&
                                            v.ai_recommendation === 'approve'
                                            ? 'text-emerald-600'
                                            : scanned &&
                                                v.ai_recommendation === 'reject'
                                              ? 'text-red-600'
                                              : 'text-amber-600',
                                    )}
                                >
                                    {!scanned
                                        ? 'Scan AI terlebih dahulu'
                                        : v.ai_recommendation === 'approve'
                                          ? 'Setujui Verifikasi'
                                          : v.ai_recommendation === 'reject'
                                            ? 'Tolak Verifikasi'
                                            : 'Perlu Review Manual'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="destructive"
                                onClick={() => setIsRejectOpen(true)}
                                disabled={processingId === v.id}
                                className="rounded-xl shadow-lg"
                            >
                                <X className="mr-2 h-4 w-4" /> Tolak
                            </Button>
                            <Button
                                onClick={doApprove}
                                disabled={processingId === v.id}
                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                            >
                                <Check className="mr-2 h-4 w-4" /> Setujui
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* ═══ Rejection Dialog ═══ */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-neutral-950">
                    <DialogHeader>
                        <div className="relative -m-6 mb-4 overflow-hidden rounded-t-xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 p-6">
                            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                            <div className="relative">
                                <DialogTitle className="flex items-center gap-3 text-xl text-white">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                        <XCircle className="h-5 w-5" />
                                    </div>
                                    Tolak Verifikasi
                                </DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                                    {v.mahasiswa.nama?.[0] ?? '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold">
                                    {v.mahasiswa.nama}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    {v.mahasiswa.nim}
                                </p>
                            </div>
                        </div>
                        <div>
                            <Label>Alasan Penolakan</Label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                                placeholder="Jelaskan alasan penolakan..."
                                rows={3}
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsRejectOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={doReject}
                                disabled={
                                    !rejectionReason || processingId === v.id
                                }
                                className="bg-gradient-to-r from-red-500 to-rose-600 text-white"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Tolak
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
