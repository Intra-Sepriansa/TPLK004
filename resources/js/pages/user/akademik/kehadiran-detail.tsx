import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import StudentLayout from '@/layouts/student-layout';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    ExternalLink,
    Flame,
    Globe,
    GraduationCap,
    Grid3X3,
    Info,
    List,
    Loader2,
    MapPin,
    MessageSquare,
    Printer,
    RefreshCw,
    Send,
    Shield,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    User,
    Wifi,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import hadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import selfieIcon from '@/assets/admin/dashboard/selfie-icon.png';
import terlambatIcon from '@/assets/admin/dashboard/terlambat-icon.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import kehadiranIcon from '@/assets/mahasiswa/monitoring/monitoring.png';

interface Meeting {
    number: number;
    date: string | null;
    rawDate: string | null;
    status: 'hadir' | 'tidak-hadir' | 'aktif' | 'belum-dimulai' | 'belum-dibuat';
    mode: 'online' | 'offline';
    notes: string | null;
    completedAt: string | null;
}

interface Course {
    id: number;
    name: string;
    code: string;
    sks: 2 | 3;
    period: 1 | 2;
    mode: string;
    modeName: string;
    day: string;
    time: string;
    room: string;
    lecturer: string;
}

interface Stats {
    totalPertemuan: number;
    hadir: number;
    tidakHadir: number;
    persentase: number;
}

interface Prediction {
    remainingMeetings: number;
    requiredAttendance: number;
    canAchieve75: boolean;
    maxPossiblePercentage: number;
    projectedPercentage: number;
}

interface Pattern {
    currentStreak: number;
    longestStreak: number;
    onlineTotal: number;
    onlineAttended: number;
    onlinePercentage: number;
    offlineTotal: number;
    offlineAttended: number;
    offlinePercentage: number;
}

interface Props {
    course: Course;
    meetings: Meeting[];
    stats: Stats;
    prediction: Prediction;
    pattern: Pattern;
    isBeforeUTS: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;
const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

/* ═══════════════════════════════════════════════════ */
/*         ULTRA-ADVANCE MEETING MODAL                 */
/* ═══════════════════════════════════════════════════ */
const modalStagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.15 },
    },
} as const;
const modalItem = {
    hidden: { opacity: 0, y: 16, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 400, damping: 22 },
    },
} as const;

const statusConfig = {
    hadir: {
        gradient: 'from-emerald-500 via-teal-500 to-green-600',
        glow: 'shadow-emerald-500/40',
        icon: CheckCircle2,
        label: 'Hadir',
        badgeBg: 'bg-emerald-500/20 border-emerald-400/30',
        textColor: 'text-emerald-300',
    },
    'tidak-hadir': {
        gradient: 'from-red-500 via-rose-500 to-pink-600',
        glow: 'shadow-red-500/40',
        icon: XCircle,
        label: 'Tidak Hadir',
        badgeBg: 'bg-red-500/20 border-red-400/30',
        textColor: 'text-red-300',
    },
    aktif: {
        gradient: 'from-blue-500 via-cyan-500 to-indigo-600',
        glow: 'shadow-blue-500/40',
        icon: Zap,
        label: 'Sedang Aktif',
        badgeBg: 'bg-blue-500/20 border-blue-400/30',
        textColor: 'text-blue-300',
    },
    'belum-dimulai': {
        gradient: 'from-amber-500 via-orange-500 to-yellow-600',
        glow: 'shadow-amber-500/40',
        icon: Clock,
        label: 'Belum Dimulai',
        badgeBg: 'bg-amber-500/20 border-amber-400/30',
        textColor: 'text-amber-300',
    },
    'belum-dibuat': {
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
        glow: 'shadow-violet-500/40',
        icon: Sparkles,
        label: 'Belum Dibuat',
        badgeBg: 'bg-violet-500/20 border-violet-400/30',
        textColor: 'text-violet-300',
    },
} as const;

function MeetingModal({
    meeting,
    courseName,
    courseId,
    onClose,
}: {
    meeting: Meeting;
    courseName: string;
    courseId: number;
    onClose: () => void;
}) {
    const [fordisStep, setFordisStep] = useState(0); // 0=idle, 1=opened link, 2=confirmed, 3=submitting
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const config = statusConfig[meeting.status] || statusConfig['belum-dibuat'];
    const StatusIcon = config.icon;

    const canClaimFordis =
        meeting.mode === 'online' &&
        (meeting.status === 'aktif' ||
            meeting.status === 'belum-dimulai' ||
            meeting.status === 'belum-dibuat');

    const handleOpenMentari = () => {
        window.open('https://mentari.unpam.ac.id/', '_blank');
        setFordisStep(1);
    };

    const handleConfirmFordis = () => {
        setFordisStep(2);
    };

    const handleClaimOnline = () => {
        if (fordisStep < 2) return;
        setIsSubmitting(true);
        setFordisStep(3);
        router.post(
            '/user/akademik/kehadiran/online-claim',
            {
                mahasiswa_course_id: courseId,
                meeting_number: meeting.number,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    setShowSuccess(true);
                    setTimeout(() => {
                        setShowSuccess(false);
                        onClose();
                    }, 1800);
                },
                onError: () => {
                    setIsSubmitting(false);
                    setFordisStep(2);
                },
            },
        );
    };

    const infoItems = [
        meeting.date
            ? { icon: Calendar, label: 'Tanggal', value: meeting.date }
            : null,
        {
            icon: meeting.mode === 'online' ? Wifi : MapPin,
            label: 'Mode',
            value:
                meeting.mode === 'online'
                    ? 'Online (Daring)'
                    : 'Offline (Tatap Muka)',
        },
        meeting.completedAt
            ? { icon: Clock, label: 'Waktu Absen', value: meeting.completedAt }
            : null,
        meeting.notes
            ? { icon: BookOpen, label: 'Catatan', value: meeting.notes }
            : null,
    ].filter(Boolean) as {
        icon: React.ElementType;
        label: string;
        value: string;
    }[];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.88, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.88, opacity: 0, y: 40 }}
                    transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 28,
                    }}
                    className={`relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl ${config.glow}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ═══ Success Overlay ═══ */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-xl"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        delay: 0.1,
                                    }}
                                    className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/40"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </motion.div>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg font-bold text-white"
                                >
                                    Kehadiran Berhasil Dicatat!
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                    className="mt-1 text-sm text-neutral-400"
                                >
                                    Pertemuan {meeting.number} •{' '}
                                    {courseName}
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ═══ GRADIENT HEADER WITH FLOATING ORBS ═══ */}
                    <div className="relative overflow-hidden">
                        {/* Animated gradient background */}
                        <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
                            animate={{
                                backgroundPosition: [
                                    '0% 0%',
                                    '100% 100%',
                                    '0% 0%',
                                ],
                            }}
                            transition={{
                                duration: 12,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        {/* Grain overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                        <div className="absolute inset-0 opacity-30 mix-blend-soft-light" />

                        {/* Floating orbs */}
                        <motion.div
                            className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/15 blur-2xl"
                            animate={{
                                x: [0, 15, 0],
                                y: [0, -10, 0],
                                scale: [1, 1.15, 1],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"
                            animate={{
                                x: [0, -10, 0],
                                y: [0, 8, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />

                        {/* Floating micro-particles */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={`p-${i}`}
                                    className="absolute"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 0.7, 0],
                                        scale: [0, 1, 0],
                                        y: [0, -40],
                                    }}
                                    transition={{
                                        duration: 2.5 + Math.random() * 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                    }}
                                    style={{
                                        left: `${15 + Math.random() * 70}%`,
                                        top: `${60 + Math.random() * 30}%`,
                                    }}
                                >
                                    <Sparkles className="h-2.5 w-2.5 text-white/50" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Header content */}
                        <div className="relative z-10 px-6 pt-6 pb-5">
                            <div className="flex items-start justify-between">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <motion.div
                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur-sm"
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 8,
                                            }}
                                        >
                                            <GraduationCap className="h-4.5 w-4.5 text-white" />
                                        </motion.div>
                                        <div>
                                            <p className="text-[10px] font-medium tracking-wider text-white/60 uppercase">
                                                Pertemuan
                                            </p>
                                            <p className="text-2xl leading-none font-extrabold tracking-tight text-white">
                                                #{meeting.number}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-1 max-w-[240px] text-sm leading-snug font-medium text-white/80">
                                        {courseName}
                                    </p>
                                </motion.div>

                                <motion.button
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors hover:bg-white/25"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="h-4 w-4 text-white" />
                                </motion.button>
                            </div>

                            {/* Status badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: 0.3,
                                    type: 'spring',
                                    stiffness: 400,
                                }}
                                className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-md ${config.badgeBg}`}
                            >
                                {meeting.status === 'aktif' ? (
                                    <span className="relative flex h-4 w-4 items-center justify-center">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white shadow-lg" />
                                    </span>
                                ) : (
                                    <StatusIcon className="h-4 w-4 text-white" />
                                )}
                                <span className="text-xs font-bold tracking-wide text-white">
                                    {config.label}
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    {/* ═══ CONTENT BODY — Glassmorphism ═══ */}
                    <div className="bg-neutral-950">
                        <motion.div
                            className="space-y-0"
                            variants={modalStagger}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Info Cards Grid */}
                            <motion.div
                                variants={modalItem}
                                className="border-b border-white/5 px-6 py-5"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    {infoItems.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 transition-colors hover:border-white/10 hover:bg-white/[0.06]"
                                            whileHover={{
                                                scale: 1.02,
                                                y: -2,
                                            }}
                                        >
                                            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-white/[0.02] blur-xl transition-all group-hover:bg-white/[0.05]" />
                                            <div className="relative">
                                                <item.icon className="mb-2 h-4 w-4 text-neutral-500" />
                                                <p className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
                                                    {item.label}
                                                </p>
                                                <p className="mt-0.5 text-sm leading-snug font-semibold text-white">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* ═══ FORDIS VERIFICATION FLOW ═══ */}
                            {canClaimFordis && (
                                <motion.div
                                    variants={modalItem}
                                    className="px-6 py-5"
                                >
                                    {/* Section header */}
                                    <div className="mb-4 flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-blue-400/20">
                                            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">
                                                Verifikasi Kehadiran
                                                Online
                                            </h4>
                                            <p className="text-[10px] text-neutral-500">
                                                Selesaikan 3 langkah di
                                                bawah
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress track */}
                                    <div className="mb-5 flex items-center gap-1">
                                        {[0, 1, 2].map((step) => (
                                            <React.Fragment key={step}>
                                                <motion.div
                                                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                                                        fordisStep >
                                                        step
                                                            ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-400'
                                                            : fordisStep ===
                                                                step
                                                              ? 'border-blue-400/50 bg-blue-500/20 text-blue-400'
                                                              : 'border-white/10 bg-white/[0.03] text-neutral-600'
                                                    }`}
                                                    animate={
                                                        fordisStep ===
                                                        step
                                                            ? {
                                                                  scale: [
                                                                      1,
                                                                      1.1,
                                                                      1,
                                                                  ],
                                                              }
                                                            : {}
                                                    }
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat:
                                                            fordisStep === step
                                                                ? Infinity
                                                                : 0,
                                                    }}
                                                >
                                                    {fordisStep >
                                                    step ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    ) : (
                                                        step + 1
                                                    )}
                                                </motion.div>
                                                {step < 2 && (
                                                    <div className="flex-1">
                                                        <div
                                                            className={`h-0.5 rounded-full transition-all duration-500 ${
                                                                fordisStep >
                                                                step
                                                                    ? 'bg-emerald-500/40'
                                                                    : 'bg-white/5'
                                                            }`}
                                                        />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Step 1: Open Mentari */}
                                    <motion.div
                                        className={`mb-3 overflow-hidden rounded-2xl border transition-all duration-300 ${
                                            fordisStep === 0
                                                ? 'border-blue-400/20 bg-blue-500/[0.06]'
                                                : fordisStep >= 1
                                                  ? 'border-emerald-400/15 bg-emerald-500/[0.04]'
                                                  : 'border-white/5 bg-white/[0.02]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 p-4">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                                                    fordisStep >= 1
                                                        ? 'bg-emerald-500/20'
                                                        : 'bg-blue-500/15'
                                                }`}
                                            >
                                                {fordisStep >= 1 ? (
                                                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                                                ) : (
                                                    <Globe className="h-4.5 w-4.5 text-blue-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-white">
                                                    Buka Forum Diskusi
                                                    di Mentari
                                                </p>
                                                <p className="mt-0.5 text-[10px] leading-tight text-neutral-500">
                                                    Kerjakan fordis
                                                    pertemuan{' '}
                                                    {meeting.number}{' '}
                                                    terlebih dahulu
                                                </p>
                                            </div>
                                            {fordisStep < 1 && (
                                                <motion.button
                                                    onClick={
                                                        handleOpenMentari
                                                    }
                                                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-500/20 px-3.5 py-2 text-[11px] font-bold text-blue-300 transition-colors hover:bg-blue-500/30"
                                                    whileHover={{
                                                        scale: 1.03,
                                                    }}
                                                    whileTap={{
                                                        scale: 0.97,
                                                    }}
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Buka
                                                </motion.button>
                                            )}
                                            {fordisStep >= 1 && (
                                                <span className="text-[10px] font-semibold text-emerald-400">
                                                    ✓ Dibuka
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Step 2: Confirm completion */}
                                    <motion.div
                                        className={`mb-3 overflow-hidden rounded-2xl border transition-all duration-300 ${
                                            fordisStep === 1
                                                ? 'border-blue-400/20 bg-blue-500/[0.06]'
                                                : fordisStep >= 2
                                                  ? 'border-emerald-400/15 bg-emerald-500/[0.04]'
                                                  : 'border-white/5 bg-white/[0.02] opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 p-4">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                                                    fordisStep >= 2
                                                        ? 'bg-emerald-500/20'
                                                        : fordisStep === 1
                                                          ? 'bg-blue-500/15'
                                                          : 'bg-white/5'
                                                }`}
                                            >
                                                {fordisStep >= 2 ? (
                                                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                                                ) : (
                                                    <MessageSquare
                                                        className={`h-4.5 w-4.5 ${
                                                            fordisStep >=
                                                            1
                                                                ? 'text-blue-400'
                                                                : 'text-neutral-600'
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`text-xs font-bold ${
                                                        fordisStep >= 1
                                                            ? 'text-white'
                                                            : 'text-neutral-600'
                                                    }`}
                                                >
                                                    Konfirmasi
                                                    Penyelesaian Fordis
                                                </p>
                                                <p className="mt-0.5 text-[10px] leading-tight text-neutral-500">
                                                    Pastikan fordis
                                                    sudah 100% selesai
                                                </p>
                                            </div>
                                            {fordisStep === 1 && (
                                                <motion.button
                                                    onClick={
                                                        handleConfirmFordis
                                                    }
                                                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-500/20 px-3.5 py-2 text-[11px] font-bold text-blue-300 transition-colors hover:bg-blue-500/30"
                                                    whileHover={{
                                                        scale: 1.03,
                                                    }}
                                                    whileTap={{
                                                        scale: 0.97,
                                                    }}
                                                >
                                                    <Shield className="h-3.5 w-3.5" />
                                                    Sudah
                                                </motion.button>
                                            )}
                                            {fordisStep >= 2 && (
                                                <span className="text-[10px] font-semibold text-emerald-400">
                                                    ✓ Dikonfirmasi
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Step 3: Submit */}
                                    <motion.div
                                        className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                                            fordisStep === 2
                                                ? 'border-blue-400/20 bg-blue-500/[0.06]'
                                                : fordisStep >= 3
                                                  ? 'border-emerald-400/15 bg-emerald-500/[0.04]'
                                                  : 'border-white/5 bg-white/[0.02] opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 p-4">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                                                    fordisStep >= 3
                                                        ? 'bg-emerald-500/20'
                                                        : fordisStep === 2
                                                          ? 'bg-blue-500/15'
                                                          : 'bg-white/5'
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-400" />
                                                ) : fordisStep >= 3 ? (
                                                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                                                ) : (
                                                    <Send
                                                        className={`h-4.5 w-4.5 ${
                                                            fordisStep >=
                                                            2
                                                                ? 'text-blue-400'
                                                                : 'text-neutral-600'
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`text-xs font-bold ${
                                                        fordisStep >= 2
                                                            ? 'text-white'
                                                            : 'text-neutral-600'
                                                    }`}
                                                >
                                                    Kirim & Tandai Hadir
                                                </p>
                                                <p className="mt-0.5 text-[10px] leading-tight text-neutral-500">
                                                    Kehadiran dicatat
                                                    otomatis
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Submit Button — animated glow */}
                                    <AnimatePresence>
                                        {fordisStep >= 2 &&
                                            !isSubmitting && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: 12,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: 12,
                                                    }}
                                                    className="mt-5"
                                                >
                                                    <motion.button
                                                        onClick={
                                                            handleClaimOnline
                                                        }
                                                        className="group relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20"
                                                        whileHover={{
                                                            scale: 1.01,
                                                            y: -1,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                    >
                                                        {/* Animated gradient background */}
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"
                                                            animate={{
                                                                backgroundPosition:
                                                                    [
                                                                        '0% 50%',
                                                                        '100% 50%',
                                                                        '0% 50%',
                                                                    ],
                                                            }}
                                                            transition={{
                                                                duration: 3,
                                                                repeat: Infinity,
                                                                ease: 'linear',
                                                            }}
                                                            style={{
                                                                backgroundSize:
                                                                    '200% 100%',
                                                            }}
                                                        />
                                                        {/* Glow ring pulse */}
                                                        <motion.div
                                                            className="absolute inset-0 rounded-2xl"
                                                            animate={{
                                                                boxShadow:
                                                                    [
                                                                        '0 0 15px rgba(59,130,246,0.3), inset 0 0 15px rgba(59,130,246,0.1)',
                                                                        '0 0 30px rgba(59,130,246,0.5), inset 0 0 30px rgba(59,130,246,0.15)',
                                                                        '0 0 15px rgba(59,130,246,0.3), inset 0 0 15px rgba(59,130,246,0.1)',
                                                                    ],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                            }}
                                                        />
                                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                                            <Zap className="h-4 w-4" />
                                                            Tandai Hadir
                                                            Sekarang
                                                        </span>
                                                    </motion.button>
                                                </motion.div>
                                            )}
                                    </AnimatePresence>

                                    {/* Info disclaimer */}
                                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                                        <p className="text-[10px] leading-relaxed text-neutral-500">
                                            Dengan menandai hadir, Anda
                                            menyatakan telah menyelesaikan
                                            Forum Diskusi (Fordis) pada
                                            pertemuan ini di{' '}
                                            <a
                                                href="https://mentari.unpam.ac.id/"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-semibold text-blue-400 hover:underline"
                                            >
                                                mentari.unpam.ac.id
                                            </a>
                                            . Data kehadiran akan dicatat
                                            secara permanen.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══ FOOTER ═══ */}
                            <motion.div
                                variants={modalItem}
                                className="border-t border-white/5 px-6 py-4"
                            >
                                <motion.button
                                    onClick={onClose}
                                    className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-neutral-300"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Tutup
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function DetailKehadiranMataKuliah({
    course,
    meetings,
    stats,
    prediction,
    pattern,
    isBeforeUTS,
}: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(
        null,
    );
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const recommendations = useMemo(() => {
        const recs: {
            type: 'success' | 'warning' | 'info';
            title: string;
            message: string;
        }[] = [];
        if (stats.persentase >= 80)
            recs.push({
                type: 'success',
                title: 'Kehadiran Sangat Baik!',
                message: 'Pertahankan kehadiran Anda untuk hasil yang optimal.',
            });
        else if (stats.persentase >= 75)
            recs.push({
                type: 'warning',
                title: 'Kehadiran Cukup',
                message: 'Anda memenuhi syarat minimal, usahakan meningkatkan.',
            });
        else if (stats.hadir + stats.tidakHadir > 0)
            recs.push({
                type: 'warning',
                title: 'Kehadiran Kurang',
                message: 'Tingkatkan kehadiran untuk memenuhi syarat ujian.',
            });
        if (prediction.canAchieve75 && prediction.requiredAttendance > 0)
            recs.push({
                type: 'info',
                title: 'Target Kehadiran',
                message: `Hadir di ${prediction.requiredAttendance} pertemuan lagi untuk mencapai 75%.`,
            });
        if (pattern.currentStreak >= 3)
            recs.push({
                type: 'success',
                title: 'Streak Bagus!',
                message: `Anda sudah hadir ${pattern.currentStreak} pertemuan berturut-turut.`,
            });
        return recs;
    }, [stats, prediction, pattern]);

    const statCards = [
        {
            icon: totalIcon,
            title: 'Total Pertemuan',
            value: stats.totalPertemuan,
            colorConfig: {
                from: 'from-sky-400',
                to: 'to-indigo-600',
                bg: 'bg-sky-500',
                hoverShadow: 'hover:shadow-sky-500/10',
                gradientBg:
                    'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
            },
        },
        {
            icon: hadirIcon,
            title: 'Hadir',
            value: stats.hadir,
            colorConfig: {
                from: 'from-emerald-400',
                to: 'to-teal-600',
                bg: 'bg-emerald-500',
                hoverShadow: 'hover:shadow-emerald-500/10',
                gradientBg:
                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
            },
        },
        {
            icon: terlambatIcon,
            title: 'Tidak Hadir',
            value: stats.tidakHadir,
            colorConfig: {
                from: 'from-rose-400',
                to: 'to-red-600',
                bg: 'bg-rose-500',
                hoverShadow: 'hover:shadow-rose-500/10',
                gradientBg:
                    'from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10',
            },
        },
        {
            icon: selfieIcon,
            title: 'Persentase',
            value: Math.round(stats.persentase),
            suffix: '%',
            colorConfig: {
                from: 'from-amber-400',
                to: 'to-orange-600',
                bg: 'bg-amber-500',
                hoverShadow: 'hover:shadow-amber-500/10',
                gradientBg:
                    'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            },
        },
    ];

    return (
        <StudentLayout>
            <Head title={`Kehadiran - ${course.name}`} />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8"
            >
                {/* ═══ HERO HEADER ═══ */}
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
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 0.5, 0],
                                    scale: [0, 1, 0],
                                    y: [0, -70],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                    ease: 'easeOut',
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${80 + Math.random() * 20}%`,
                                }}
                            >
                                {i % 3 === 0 ? (
                                    <BookOpen className="h-3 w-3 text-white/40" />
                                ) : i % 3 === 1 ? (
                                    <CheckCircle2 className="h-3 w-3 text-white/40" />
                                ) : (
                                    <Sparkles className="h-3 w-3 text-white/40" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                    <div className="relative z-10">
                        <Link
                            href="/user/akademik/kehadiran"
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-200 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke
                            Monitoring Kehadiran
                        </Link>
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
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
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={kehadiranIcon}
                                        alt="Detail Kehadiran"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                                            {course.code}
                                        </span>
                                        <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                                            SKS {course.sks}
                                        </span>
                                        <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                                            Periode {course.period}
                                        </span>
                                        <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                                            {isBeforeUTS
                                                ? 'Sebelum UTS'
                                                : 'Setelah UTS'}
                                        </span>
                                    </div>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-2xl font-bold text-white sm:text-3xl"
                                    >
                                        {course.name}
                                    </motion.h1>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-2 flex flex-wrap items-center gap-4 text-sm text-indigo-100"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <User className="h-4 w-4" />
                                            {course.lecturer}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {course.day}, {course.time}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {course.room}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            {course.mode === 'online' ? (
                                                <Wifi className="h-4 w-4" />
                                            ) : (
                                                <MapPin className="h-4 w-4" />
                                            )}
                                            {course.modeName}
                                        </span>
                                    </motion.div>
                                </div>
                            </div>
                            <div className="mt-4 flex w-full flex-col items-center gap-2 sm:mt-0 sm:w-auto sm:items-end">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-5 py-3 shadow-lg backdrop-blur-xl"
                                >
                                    <TrendingUp className="h-5 w-5" />
                                    <div className="text-center sm:text-right">
                                        <p className="text-2xl font-bold tabular-nums">
                                            {stats.persentase}%
                                        </p>
                                        <p className="text-[10px] text-indigo-200">
                                            Kehadiran
                                        </p>
                                    </div>
                                </motion.div>
                                {pattern.currentStreak > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.7,
                                            type: 'spring',
                                        }}
                                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/20 px-4 py-2 backdrop-blur-xl"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.15, 1] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                        >
                                            <Flame className="h-4 w-4 text-orange-300" />
                                        </motion.div>
                                        <span className="font-bold">
                                            {pattern.currentStreak}
                                        </span>
                                        <span className="text-xs text-indigo-100">
                                            streak
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.2,
                                    },
                                },
                            }}
                            className="mt-6 flex w-full flex-nowrap gap-2 overflow-x-auto border-t border-white/10 pt-6 pb-2 sm:gap-3 [&::-webkit-scrollbar]:hidden"
                        >
                            {[
                                {
                                    href: '/user/akademik/kehadiran',
                                    icon: ArrowLeft,
                                    label: 'Semua MK',
                                },
                                {
                                    href: '/user/akademik',
                                    icon: BookOpen,
                                    label: 'Akademik',
                                },
                            ].map((item, i) => (
                                <motion.a
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold shadow-lg transition hover:-translate-y-0.5 sm:px-4 sm:py-2 sm:text-xs ${i === 0 ? 'bg-white text-indigo-600' : 'border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30'}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <item.icon className="h-3.5 w-3.5" />
                                    {item.label}
                                </motion.a>
                            ))}
                            <motion.button
                                onClick={() => window.print()}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md hover:bg-white/30 sm:px-4 sm:py-2 sm:text-xs"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Printer className="h-3.5 w-3.5" />
                                Print
                            </motion.button>
                            <motion.button
                                onClick={() => router.reload()}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md hover:bg-white/30 sm:px-4 sm:py-2 sm:text-xs"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Refresh
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══ STATS CARDS ═══ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {statCards.map((stat, index) => {
                        const ck = `stat-${index}`;
                        return (
                            <motion.div
                                key={stat.title}
                                className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${stat.colorConfig.hoverShadow} dark:border-white/5`}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        },
                                    },
                                }}
                                whileHover={{ scale: 1.04, y: -4 }}
                                onHoverStart={() => setHoveredCard(ck)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`}
                                />
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: hoveredCard === ck ? 1.5 : 1,
                                        opacity: hoveredCard === ck ? 0.4 : 0.2,
                                    }}
                                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl`}
                                />
                                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                    >
                                        <img
                                            src={stat.icon}
                                            alt={stat.title}
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                        />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                            {stat.title}
                                        </p>
                                        <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                            <AnimatedCounter
                                                value={stat.value}
                                                suffix={stat.suffix}
                                            />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══ PROGRESS & PREDICTION ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                    {/* Progress */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-white">
                                    Progress Kehadiran
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    {stats.hadir} dari {stats.totalPertemuan}{' '}
                                    pertemuan
                                </p>
                            </div>
                        </div>
                        <div className="mb-6 flex items-center justify-center">
                            <div className="relative h-40 w-40">
                                <svg
                                    className="h-40 w-40 -rotate-90 transform"
                                    viewBox="0 0 160 160"
                                >
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-neutral-200 dark:text-neutral-700"
                                    />
                                    <motion.circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke={
                                            stats.persentase >= 75
                                                ? '#10b981'
                                                : '#ef4444'
                                        }
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: '0 440' }}
                                        animate={{
                                            strokeDasharray: `${stats.persentase * 4.4} 440`,
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            ease: 'easeOut',
                                        }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                                        {stats.persentase}%
                                    </span>
                                    <span className="mt-1 text-xs text-neutral-500">
                                        {stats.hadir}/{stats.totalPertemuan}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="mb-1 flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                    <span>Hadir</span>
                                    <span>{stats.hadir}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${stats.totalPertemuan > 0 ? (stats.hadir / stats.totalPertemuan) * 100 : 0}%`,
                                        }}
                                        transition={{ duration: 1 }}
                                        className="h-2 rounded-full bg-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                    <span>Tidak Hadir</span>
                                    <span>{stats.tidakHadir}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${stats.totalPertemuan > 0 ? (stats.tidakHadir / stats.totalPertemuan) * 100 : 0}%`,
                                        }}
                                        transition={{ duration: 1 }}
                                        className="h-2 rounded-full bg-red-500"
                                    />
                                </div>
                            </div>
                        </div>
                        {stats.persentase < 75 &&
                            stats.hadir + stats.tidakHadir > 0 && (
                                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                                    <p className="text-xs text-red-700 dark:text-red-400">
                                        Kehadiran di bawah 75%! Perlu hadir di{' '}
                                        {Math.ceil(
                                            stats.totalPertemuan * 0.75,
                                        ) - stats.hadir}{' '}
                                        pertemuan lagi.
                                    </p>
                                </div>
                            )}
                    </div>

                    {/* Prediction */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-white">
                                    Prediksi Kehadiran
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    {prediction.remainingMeetings} pertemuan
                                    tersisa
                                </p>
                            </div>
                        </div>
                        {prediction.canAchieve75 ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                            Anda Bisa Mencapai 75%!
                                        </p>
                                        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                                            Hadir di{' '}
                                            {prediction.requiredAttendance} dari{' '}
                                            {prediction.remainingMeetings}{' '}
                                            pertemuan tersisa
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Pertemuan Tersisa
                                        </span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            {prediction.remainingMeetings}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Harus Hadir Minimal
                                        </span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            {prediction.requiredAttendance}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Boleh Tidak Hadir
                                        </span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            {prediction.remainingMeetings -
                                                prediction.requiredAttendance}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
                                    <p className="mb-2 text-xs text-neutral-500">
                                        Proyeksi Akhir Semester
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${prediction.projectedPercentage}%`,
                                                }}
                                                transition={{ duration: 1 }}
                                                className="h-2.5 rounded-full bg-emerald-500"
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600">
                                            {prediction.projectedPercentage}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="text-sm font-bold text-red-800 dark:text-red-300">
                                            Tidak Bisa Mencapai 75%
                                        </p>
                                        <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                                            Maksimal:{' '}
                                            {prediction.maxPossiblePercentage}%
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Pertemuan Tersisa
                                        </span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            {prediction.remainingMeetings}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Maksimal Kehadiran
                                        </span>
                                        <span className="font-bold text-red-600">
                                            {stats.hadir +
                                                prediction.remainingMeetings}
                                            /{stats.totalPertemuan}
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                                    <p className="text-xs text-amber-800 dark:text-amber-300">
                                        💡 Hubungi dosen untuk konsultasi
                                        mengenai kehadiran Anda
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ═══ VIEW TOGGLE ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                            Tampilan Pertemuan
                        </h3>
                        <div className="flex gap-2">
                            {(
                                [
                                    ['grid', Grid3X3, 'Grid'],
                                    ['timeline', List, 'Timeline'],
                                ] as const
                            ).map(([mode, Icon, label]) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${viewMode === mode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ═══ GRID VIEW ═══ */}
                {viewMode === 'grid' && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <h3 className="mb-4 text-sm font-bold text-neutral-900 dark:text-white">
                            Daftar Pertemuan ({stats.totalPertemuan} — SKS{' '}
                            {course.sks})
                        </h3>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                            {meetings.map((m, idx) => {
                                const isH = m.status === 'hadir',
                                    isA = m.status === 'tidak-hadir',
                                    isAc = m.status === 'aktif',
                                    isU = m.status === 'belum-dibuat',
                                    isOn = m.mode === 'online';
                                const midPoint = course.sks === 2 ? 7 : 10;
                                const utsDone = !isBeforeUTS;
                                const uasDone =
                                    stats.hadir + stats.tidakHadir ===
                                    stats.totalPertemuan;

                                return (
                                    <React.Fragment key={m.number}>
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            whileHover={{ scale: 1.08, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                setSelectedMeeting(m)
                                            }
                                            className={`group relative cursor-pointer rounded-xl border-2 p-2.5 transition-all sm:p-3 ${isH ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-500/10 dark:border-emerald-600 dark:bg-emerald-900/20' : isA ? 'border-red-400 bg-red-50 shadow-md shadow-red-500/10 dark:border-red-600 dark:bg-red-900/20' : isAc ? 'border-blue-400 bg-blue-50 shadow-md shadow-blue-500/10 dark:border-blue-600 dark:bg-blue-900/20 ring-2 ring-blue-500/20' : isU ? 'border-neutral-200 border-dashed bg-transparent hover:border-neutral-300 dark:border-neutral-700/50 dark:hover:border-neutral-600' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/60 dark:hover:border-neutral-600'}`}
                                        >
                                            <div className="mb-1.5 text-center">
                                                <p className="text-[9px] font-medium text-neutral-400 sm:text-[10px]">
                                                    Pertemuan
                                                </p>
                                                <p
                                                    className={`text-xl font-extrabold tabular-nums sm:text-2xl ${isH ? 'text-emerald-600 dark:text-emerald-400' : isA ? 'text-red-600 dark:text-red-400' : isAc ? 'text-blue-600 dark:text-blue-400 animate-pulse' : isU ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}
                                                >
                                                    {m.number}
                                                </p>
                                            </div>
                                            <div
                                                className={`flex items-center justify-center gap-1 rounded-lg px-1.5 py-0.5 text-[9px] font-semibold sm:text-[10px] ${isOn ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}
                                            >
                                                {isOn ? (
                                                    <>
                                                        <Wifi className="h-2.5 w-2.5" />
                                                        <span>Online</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin className="h-2.5 w-2.5" />
                                                        <span>Offline</span>
                                                    </>
                                                )}
                                            </div>
                                            {isAc && (
                                                <div className="absolute -top-1.5 -right-1.5">
                                                    <div className="relative flex h-4 w-4">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></span>
                                                    </div>
                                                </div>
                                            )}
                                            {isH && (
                                                <div className="absolute -top-1.5 -right-1.5">
                                                    <div className="rounded-full bg-emerald-500 p-0.5 shadow-lg">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            {isA && (
                                                <div className="absolute -top-1.5 -right-1.5">
                                                    <div className="rounded-full bg-red-500 p-0.5 shadow-lg">
                                                        <X className="h-3.5 w-3.5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            {m.date && (
                                                <p className="mt-1.5 truncate text-center text-[8px] text-neutral-400 sm:text-[9px]">
                                                    {m.date}
                                                </p>
                                            )}
                                        </motion.button>
                                        {m.number === midPoint && (
                                            <div className="relative col-span-full my-2">
                                                <div
                                                    className="absolute inset-0 flex items-center"
                                                    aria-hidden="true"
                                                >
                                                    <div className="w-full border-t-2 border-dashed border-neutral-300 dark:border-neutral-700"></div>
                                                </div>
                                                <div className="relative flex justify-center">
                                                    <span
                                                        className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-[10px] font-bold tracking-wider shadow-sm sm:text-xs ${utsDone ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'border-indigo-100 bg-white text-indigo-600 dark:border-indigo-900/50 dark:bg-neutral-900 dark:text-indigo-400'}`}
                                                    >
                                                        <Calendar className="h-3.5 w-3.5" />{' '}
                                                        JEDA UTS{' '}
                                                        {utsDone
                                                            ? '(Selesai)'
                                                            : '(Belum)'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {m.number === stats.totalPertemuan && (
                                            <div className="relative col-span-full my-2">
                                                <div
                                                    className="absolute inset-0 flex items-center"
                                                    aria-hidden="true"
                                                >
                                                    <div className="w-full border-t-2 border-dashed border-neutral-300 dark:border-neutral-700"></div>
                                                </div>
                                                <div className="relative flex justify-center">
                                                    <span
                                                        className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-[10px] font-bold tracking-wider shadow-sm sm:text-xs ${uasDone ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'border-rose-100 bg-white text-rose-600 dark:border-rose-900/50 dark:bg-neutral-900 dark:text-rose-400'}`}
                                                    >
                                                        <GraduationCap className="h-3.5 w-3.5" />{' '}
                                                        JEDA UAS{' '}
                                                        {uasDone
                                                            ? '(Selesai)'
                                                            : '(Belum)'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-4 text-xs dark:border-neutral-700/50">
                            <div className="flex items-center gap-1.5">
                                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500">
                                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Hadir
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500">
                                    <X className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Tidak Hadir
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="h-3.5 w-3.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Akan Datang
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-500"></span>
                                </div>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Sedang Aktif
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="h-3.5 w-3.5 rounded-full border border-dashed border-neutral-400 bg-transparent dark:border-neutral-500" />
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Belum Dibuat
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Wifi className="h-3.5 w-3.5 text-cyan-600" />
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Online
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-purple-600" />
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Offline
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ TIMELINE VIEW ═══ */}
                {viewMode === 'timeline' && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <h3 className="mb-6 text-sm font-bold text-neutral-900 dark:text-white">
                            Timeline Pertemuan
                        </h3>
                        <div className="space-y-2">
                            {meetings.map((m, idx) => {
                                const isH = m.status === 'hadir',
                                    isA = m.status === 'tidak-hadir',
                                    isAc = m.status === 'aktif',
                                    isU = m.status === 'belum-dibuat';
                                return (
                                    <motion.div
                                        key={m.number}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="relative flex gap-4"
                                        onClick={() => setSelectedMeeting(m)}
                                    >
                                        {idx < meetings.length - 1 && (
                                            <div className="absolute top-12 bottom-0 left-[23px] w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                                        )}
                                        <div
                                            className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-white shadow-md dark:border-neutral-900 ${isH ? 'bg-emerald-500' : isA ? 'bg-red-500' : isAc ? 'bg-blue-500 border-blue-200 dark:border-blue-900' : isU ? 'bg-transparent border-dashed border-neutral-300 dark:border-neutral-700' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                                        >
                                            {isH ? (
                                                <CheckCircle2 className="h-5 w-5 text-white" />
                                            ) : isA ? (
                                                <XCircle className="h-5 w-5 text-white" />
                                            ) : isAc ? (
                                                <div className="relative flex h-5 w-5 items-center justify-center">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40"></span>
                                                    <div className="h-3 w-3 rounded-full bg-white text-blue-500" />
                                                </div>
                                            ) : isU ? (
                                                <span className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                            ) : (
                                                <Clock className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 cursor-pointer pb-4">
                                            <div className="rounded-xl border border-neutral-200/50 bg-neutral-50/80 p-4 backdrop-blur transition-colors hover:bg-neutral-100 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:hover:bg-neutral-700/60">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                                            <span className="rounded-lg bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                                P{m.number}
                                                            </span>
                                                            <span
                                                                className={`rounded-lg px-2 py-0.5 text-xs font-medium ${m.mode === 'online' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}
                                                            >
                                                                {m.mode ===
                                                                'online'
                                                                    ? 'Online'
                                                                    : 'Offline'}
                                                            </span>
                                                            <span
                                                                className={`rounded-lg px-2 py-0.5 text-xs font-medium ${isH ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : isA ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : isAc ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : isU ? 'bg-transparent border border-dashed border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'}`}
                                                            >
                                                                {isH
                                                                    ? 'Hadir'
                                                                    : isA
                                                                      ? 'Tidak Hadir'
                                                                      : isAc
                                                                      ? 'Sedang Aktif'
                                                                      : isU
                                                                      ? 'Belum Dibuat'
                                                                      : 'Akan Datang'}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                            Pertemuan {m.number}
                                                        </h4>
                                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                                            {m.date && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {m.date}
                                                                </span>
                                                            )}
                                                            {m.completedAt && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    Absen:{' '}
                                                                    {
                                                                        m.completedAt
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        {m.notes && (
                                                            <p className="mt-2 text-xs text-neutral-600 italic dark:text-neutral-400">
                                                                "{m.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-neutral-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ═══ PATTERN ANALYSIS & RECOMMENDATIONS ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                    {/* Pattern */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                <Flame className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-white">
                                    Pola Kehadiran
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    Analisis kehadiran Anda
                                </p>
                            </div>
                        </div>
                        {pattern.currentStreak > 0 && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
                                <Flame className="mt-0.5 h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-bold text-orange-800 dark:text-orange-300">
                                        Streak: {pattern.currentStreak}{' '}
                                        Pertemuan
                                    </p>
                                    <p className="mt-0.5 text-xs text-orange-700 dark:text-orange-400">
                                        Rekor terbaik: {pattern.longestStreak}{' '}
                                        berturut-turut
                                    </p>
                                </div>
                            </div>
                        )}
                        <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Kehadiran per Mode
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                                <div className="mb-1 flex items-center gap-2">
                                    <Wifi className="h-4 w-4 text-cyan-600" />
                                    <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                                        Online
                                    </span>
                                </div>
                                <p className="text-2xl font-extrabold text-cyan-900 dark:text-cyan-200">
                                    {pattern.onlinePercentage}%
                                </p>
                                <p className="mt-0.5 text-xs text-cyan-700 dark:text-cyan-400">
                                    {pattern.onlineAttended}/
                                    {pattern.onlineTotal} pertemuan
                                </p>
                            </div>
                            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                                <div className="mb-1 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-purple-600" />
                                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                        Offline
                                    </span>
                                </div>
                                <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-200">
                                    {pattern.offlinePercentage}%
                                </p>
                                <p className="mt-0.5 text-xs text-purple-700 dark:text-purple-400">
                                    {pattern.offlineAttended}/
                                    {pattern.offlineTotal} pertemuan
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30">
                                <Info className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-white">
                                    Rekomendasi
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    Saran untuk kehadiran Anda
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {recommendations.length === 0 ? (
                                <p className="py-4 text-center text-sm text-neutral-500">
                                    Belum ada data cukup untuk rekomendasi.
                                </p>
                            ) : (
                                recommendations.map((rec, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-start gap-3 rounded-xl border p-3 ${rec.type === 'success' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : rec.type === 'warning' ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' : 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-900/20'}`}
                                    >
                                        {rec.type === 'success' ? (
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                                        ) : rec.type === 'warning' ? (
                                            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                                        ) : (
                                            <Info className="mt-0.5 h-5 w-5 text-sky-600" />
                                        )}
                                        <div>
                                            <p
                                                className={`text-sm font-bold ${rec.type === 'success' ? 'text-emerald-800 dark:text-emerald-300' : rec.type === 'warning' ? 'text-amber-800 dark:text-amber-300' : 'text-sky-800 dark:text-sky-300'}`}
                                            >
                                                {rec.title}
                                            </p>
                                            <p
                                                className={`mt-0.5 text-xs ${rec.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : rec.type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 'text-sky-700 dark:text-sky-400'}`}
                                            >
                                                {rec.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {stats.persentase === 100 && stats.hadir > 0 && (
                            <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                <Award className="h-6 w-6 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                        Perfect Attendance! 🎉
                                    </p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                        Anda hadir di semua pertemuan
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
            {selectedMeeting && (
                <MeetingModal
                    meeting={selectedMeeting}
                    courseName={course.name}
                    courseId={course.id}
                    onClose={() => setSelectedMeeting(null)}
                />
            )}
        </StudentLayout>
    );
}
