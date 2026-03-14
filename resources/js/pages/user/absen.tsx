import absenIcon from '@/assets/dosen/sesi-absen/sesi-absen.png';
import { BiometricSetup } from '@/components/attendance/BiometricSetup';
import { GamificationRewards } from '@/components/attendance/GamificationRewards';
import { NotificationManager } from '@/components/attendance/NotificationManager';
import { PendingSyncList } from '@/components/network/PendingSyncList';
import { NetworkDiagnosticsTool } from '@/components/network/NetworkDiagnosticsTool';
import { OfflineStorage } from '@/services/OfflineStorage';
import { SocialProof } from '@/components/attendance/SocialProof';
import InputError from '@/components/input-error';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentLayout from '@/layouts/student-layout';
import { saveOfflineAttendance } from '@/lib/offline-sync';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { captureDeviceInfo } from '@/utils/deviceCapture';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import {
    AlertCircle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    Clock,
    Clock3,
    Fingerprint,
    Flashlight,
    FlashlightOff,
    FlipHorizontal,
    Loader2,
    MapPin,
    Navigation,
    QrCode,
    RefreshCcw,
    RefreshCw,
    ScanLine,
    Send,
    Shield,
    Sparkles,
    SwitchCamera,
    Trophy,
    Users,
    Wifi,
    X,
    type LucideIcon,
} from 'lucide-react';
import {
    useEffect,
    useEffectEvent,
    useId,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type ReactNode,
} from 'react';
import { toast } from 'sonner';

type CameraPhase = 'idle' | 'scanning' | 'flipping' | 'selfie' | 'done';
type ScanState = 'idle' | 'scanning' | 'success' | 'error';
type SelfieState = 'idle' | 'ready' | 'capturing' | 'captured' | 'error';
type LocationState = 'idle' | 'fetching' | 'success' | 'error';

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
    user?: { name?: string } | null;
};

type GeofenceInfo = {
    lat: number;
    lng: number;
    radius_m: number;
};

type LocationSample = {
    latitude: number;
    longitude: number;
    accuracy_m: number;
    captured_at: string;
};

type TorchTrackCapabilities = MediaTrackCapabilities & {
    torch?: boolean;
};

type TorchConstraintSet = MediaTrackConstraintSet & {
    torch?: ConstrainBoolean;
};

type AttendanceSessionInfo = {
    id: number;
    courseName: string;
    meetingNumber: number;
    title: string | null;
    startAt: string | null;
    endAt: string | null;
    dosenName?: string | null;
    attendanceStatus?: string | null;
    attendanceLabel?: string | null;
    alreadySubmitted?: boolean;
};

type PageProps = {
    mahasiswa: MahasiswaInfo;
    geofence: GeofenceInfo;
    selfieRequired: boolean;
    locationSampleCount?: number;
    locationSampleWindowSeconds?: number;
    gamification: {
        xpGained: number;
        currentStreak: number;
        longestStreak: number;
        totalPoints: number;
        comboMultiplier: number;
        leaderboardPosition: number;
        achievements: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
            unlocked: boolean;
            progress: number;
            total: number;
        }>;
    };
    socialProof: {
        totalStudents: number;
        attendedCount: number;
        isFirstAttendee: boolean;
        recentAttendees: string[];
        leaderboard: Array<{
            rank: number;
            name: string;
            streak: number;
            points: number;
        }>;
    };
    activeSession: AttendanceSessionInfo | null;
    activeSessions?: AttendanceSessionInfo[];
};

const FLOW_TOTAL = 4;
const CAMERA_FLIP_MS = 600;
const CAMERA_RETRY_DELAY_MS = 700;
const GLASS_CARD =
    'rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40';

const ERROR_MESSAGES = {
    CAMERA_DENIED:
        'Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.',
    CAMERA_NOT_FOUND: 'Kamera tidak ditemukan pada perangkat ini.',
    CAMERA_IN_USE:
        'Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.',
    CAMERA_UNSUPPORTED:
        'Browser ini belum mendukung akses kamera untuk absensi.',
    CAMERA_PLAYBACK:
        'Kamera terbuka tetapi video gagal diputar. Coba ulangi sekali lagi.',
    CAMERA_GENERIC: 'Gagal mengakses kamera. Pastikan memberikan izin kamera di pengaturan browser (Site Settings/Permissions) atau pastikan jaringan Anda mendukung.',
    QR_SCAN_FAILED:
        'QR code belum terbaca. Pastikan QR terlihat jelas dan tetap di dalam frame.',
    SELFIE_FAILED: 'Gagal mengambil selfie. Silakan coba lagi.',
    LOCATION_DENIED:
        'Akses lokasi ditolak. Aktifkan GPS dan izinkan browser membaca lokasi.',
    LOCATION_TIMEOUT:
        'Waktu tunggu lokasi habis. Pastikan GPS aktif lalu coba lagi.',
    LOCATION_OUTSIDE_ZONE:
        'Lokasi Anda masih di luar radius absensi. Dekati area kampus dan coba lagi.',
    SUBMIT_FAILED:
        'Gagal mengirim absensi. Periksa koneksi internet lalu coba lagi.',
} as const;

function wait(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isRetryableCameraError(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const rawMessage =
        'message' in error && typeof error.message === 'string'
            ? error.message.toLowerCase()
            : '';
    const name = (error as DOMException).name?.toLowerCase() ?? '';

    return (
        name === 'notreadableerror' ||
        name === 'aborterror' ||
        rawMessage.includes('notreadable') ||
        rawMessage.includes('track start error') ||
        rawMessage.includes('device in use') ||
        rawMessage.includes('could not start video source')
    );
}

async function getUserMediaWithRetry(
    constraints: MediaStreamConstraints,
    retries = 1,
) {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
            lastError = error;
            if (!isRetryableCameraError(error) || attempt === retries) {
                throw error;
            }
            await wait(CAMERA_RETRY_DELAY_MS);
        }
    }

    throw lastError;
}

function revokeObjectUrl(url: string | null) {
    if (url) URL.revokeObjectURL(url);
}

function hasTorchCapability(
    capabilities?: MediaTrackCapabilities | null,
): boolean {
    return Boolean((capabilities as TorchTrackCapabilities | null)?.torch);
}

function isFrontCameraLabel(label: string | undefined | null) {
    if (!label) return false;
    return /(front|user|face|facetime|selfie)/i.test(label);
}

function createTorchConstraints(enabled: boolean): MediaTrackConstraints {
    return {
        advanced: [{ torch: enabled } as TorchConstraintSet],
    };
}

function serializeDeviceInfo(): string {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return '';
    }

    return JSON.stringify(captureDeviceInfo());
}

function shouldOpenCameraPermissionGuide(
    reason: string | null | undefined,
    permission: PermissionState | 'unknown',
): boolean {
    return permission === 'denied' || reason === ERROR_MESSAGES.CAMERA_DENIED;
}

function formatSessionPrimaryLabel(session: AttendanceSessionInfo): string {
    return `${session.courseName} - Pertemuan ${session.meetingNumber}`;
}

function formatSessionSecondaryLabel(session: AttendanceSessionInfo): string {
    const bits = [
        session.startAt && session.endAt
            ? `${session.startAt} - ${session.endAt}`
            : null,
        session.title,
        session.dosenName,
    ].filter(Boolean);

    return bits.join(' • ');
}

function PermissionPill({
    label,
    state,
}: {
    label: string;
    state: PermissionState | 'unknown';
}) {
    const tone =
        state === 'granted'
            ? 'border-emerald-300/70 bg-emerald-500/15 text-emerald-50'
            : state === 'denied'
              ? 'border-rose-300/70 bg-rose-500/15 text-rose-50'
              : 'border-white/20 bg-white/10 text-white/80';

    const text =
        state === 'granted'
            ? 'Diizinkan'
            : state === 'denied'
              ? 'Ditolak'
              : 'Belum dicek';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur-sm',
                tone,
            )}
        >
            <span
                className={cn(
                    'h-2 w-2 rounded-full',
                    state === 'granted'
                        ? 'bg-emerald-300'
                        : state === 'denied'
                          ? 'bg-rose-300'
                          : 'bg-white/60',
                )}
            />
            {label}: {text}
        </span>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200/80 bg-white/55 px-6 py-12 text-center dark:border-white/10 dark:bg-white/5"
        >
            <div className="rounded-full bg-slate-100 p-5 text-slate-400 dark:bg-white/10 dark:text-white/40">
                <Icon className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
                {title}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {description}
            </p>
        </motion.div>
    );
}

function AbsensiHeader({
    mahasiswa,
    activeSession,
    activeSessions,
    detectedSession,
    consentAccepted,
    consentError,
    cameraPermission,
    locationPermission,
    onConsentChange,
    manuallySelectedSessionId,
}: {
    mahasiswa: MahasiswaInfo;
    activeSession: PageProps['activeSession'];
    activeSessions: AttendanceSessionInfo[];
    detectedSession: AttendanceSessionInfo | null;
    consentAccepted: boolean;
    consentError: string | null;
    cameraPermission: PermissionState | 'unknown';
    locationPermission: PermissionState | 'unknown';
    onConsentChange: (checked: boolean) => void | Promise<void>;
    manuallySelectedSessionId: number | null;
}) {
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const heroDescription = detectedSession
        ? `QR terhubung ke ${formatSessionPrimaryLabel(detectedSession)}. Lanjutkan selfie dan lokasi untuk menyelesaikan absensi.`
        : manuallySelectedSessionId
          ? `Target sesi telah dipilih. Silakan arahkan kamera ke QR Code untuk matkul ini.`
          : activeSessions.length > 1
            ? `Ada ${activeSessions.length} sesi aktif hari ini. Klik salah satu matkul di bawah untuk mengunci target, lalu scan QR.`
            : activeSession
              ? formatSessionPrimaryLabel(activeSession)
              : 'Sistem absensi berbasis QR code dinamis, verifikasi selfie, dan geofence untuk kehadiran yang akurat.';

    useEffect(() => {
        const timer = window.setInterval(
            () => setCurrentTime(new Date()),
            1000,
        );
        return () => window.clearInterval(timer);
    }, []);

    return (
        <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
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
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                        <motion.div
                            className="relative flex h-16 w-16 shrink-0 sm:h-20 sm:w-20 md:h-24 md:w-24"
                            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                delay: 0.2,
                            }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                            <img
                                src={absenIcon}
                                alt="Absensi Mahasiswa"
                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                            />
                        </motion.div>

                        <div className="mt-1 flex-1 sm:mt-0">
                            <motion.p
                                className="text-sm font-medium tracking-wide text-indigo-100"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Selamat datang, {mahasiswa.nama}
                            </motion.p>
                            <motion.h1
                                className="mt-1 text-xl font-bold text-white sm:text-2xl md:text-3xl"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Absensi Mahasiswa
                            </motion.h1>
                            <motion.p
                                className="mt-2 max-w-lg text-xs leading-relaxed text-indigo-100 sm:text-sm md:text-base"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {heroDescription}
                            </motion.p>
                        </div>
                    </div>

                    <div className="mt-4 flex w-full flex-col items-center gap-2 sm:mt-0 sm:w-auto sm:items-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring' }}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-4 py-2 shadow-lg backdrop-blur-xl sm:px-6 sm:py-3"
                        >
                            <div className="text-center sm:text-right">
                                <p className="text-2xl font-bold tabular-nums sm:text-3xl">
                                    {currentTime.toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <p className="text-[10px] text-indigo-200 sm:text-xs">
                                    {currentTime.toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </motion.div>
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
                    className="mt-6 flex w-full flex-nowrap gap-2 overflow-x-auto border-t border-white/10 pt-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-8 sm:gap-3 [&::-webkit-scrollbar]:hidden"
                >
                    <motion.a
                        href="/user/dashboard"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali
                    </motion.a>
                    <motion.button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                        whileHover={{
                            scale: 1.02,
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </motion.button>
                    <motion.a
                        href="/user/history"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                        whileHover={{
                            scale: 1.02,
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Riwayat
                    </motion.a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-4 rounded-3xl border border-white/15 bg-white/12 p-4 shadow-lg backdrop-blur-xl"
                >
                    <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                            checked={consentAccepted}
                            onCheckedChange={(value) =>
                                onConsentChange(Boolean(value))
                            }
                            className="mt-1 h-5 w-5 border-white/60 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-950"
                        />
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-white">
                                    Saya setuju menggunakan kamera dan lokasi
                                    untuk proses absensi.
                                </span>
                                {consentAccepted && (
                                    <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-white/75">
                                Data hanya dipakai untuk verifikasi QR, selfie,
                                dan geofence kehadiran.
                            </p>
                        </div>
                    </label>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PermissionPill
                            label="Camera"
                            state={cameraPermission}
                        />
                        <PermissionPill
                            label="Location"
                            state={locationPermission}
                        />
                    </div>

                    {consentError && (
                        <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                            {consentError}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.section>
    );
}

function SessionContextCard({
    activeSessions,
    detectedSession,
    resolvingToken,
    manuallySelectedSessionId,
    onSelectSession,
}: {
    activeSessions: AttendanceSessionInfo[];
    detectedSession: AttendanceSessionInfo | null;
    resolvingToken: boolean;
    manuallySelectedSessionId: number | null;
    onSelectSession: (id: number) => void;
}) {
    const hasActiveSessions = activeSessions.length > 0;

    return (
        <section className={cn(GLASS_CARD, 'overflow-hidden p-0')}>
            <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-indigo-500/12 p-3 text-indigo-600 shadow-sm dark:bg-indigo-500/15 dark:text-indigo-300">
                            {detectedSession ? (
                                <CheckCircle2 className="h-6 w-6" />
                            ) : (
                                <QrCode className="h-6 w-6" />
                            )}
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-500 uppercase dark:text-white/50">
                                Session Context
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                                {detectedSession
                                    ? 'Sesi berhasil dikenali'
                                    : manuallySelectedSessionId
                                      ? 'Target sesi telah dipilih'
                                      : hasActiveSessions
                                        ? `${activeSessions.length} sesi aktif siap dipindai`
                                        : 'Belum ada sesi aktif'}
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                {detectedSession
                                    ? 'Mahasiswa langsung tahu QR ini milik matkul apa sebelum lanjut ke selfie dan lokasi.'
                                    : manuallySelectedSessionId
                                      ? 'Anda telah mengunci target absensi. Arahkan kamera ke QR Code yang sesuai dengan matkul ini.'
                                      : hasActiveSessions
                                        ? activeSessions.length > 1
                                            ? 'Klik salah satu sesi di bawah untuk mengunci target absensi, kemudian scan QR.'
                                            : 'Satu sesi aktif tersedia sekarang. QR akan mengarah ke sesi ini secara otomatis.'
                                        : 'Saat dosen membuka absensi, daftar matkul aktif akan muncul di kartu ini.'}
                            </p>
                        </div>
                    </div>

                    {resolvingToken && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/[0.08] dark:text-indigo-200">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Memeriksa QR...
                        </div>
                    )}
                </div>

                {detectedSession && (
                    <div className="mt-5 rounded-[26px] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 shadow-sm dark:border-indigo-500/20 dark:from-indigo-500/[0.08] dark:to-cyan-500/[0.06]">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.24em] text-indigo-600 uppercase dark:text-indigo-200">
                                    Target absensi saat ini
                                </p>
                                <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                                    {formatSessionPrimaryLabel(detectedSession)}
                                </h3>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    {formatSessionSecondaryLabel(
                                        detectedSession,
                                    ) || 'Detail sesi sedang aktif.'}
                                </p>
                            </div>
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-white/10 dark:text-indigo-100">
                                <ScanLine className="h-3.5 w-3.5" />
                                Terkunci dari QR
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-2 [&::-webkit-scrollbar]:hidden">
                    {hasActiveSessions ? (
                        activeSessions.map((session) => {
                            const isDetected =
                                detectedSession?.id === session.id;
                            const isSelected = manuallySelectedSessionId === session.id;
                            const isTargeted = isDetected || (!detectedSession && isSelected);

                            const badgeClass = session.alreadySubmitted
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.08] dark:text-emerald-100'
                                : isTargeted
                                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/[0.08] dark:text-indigo-100'
                                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300';

                            return (
                                <div
                                    key={session.id}
                                    onClick={() => !session.alreadySubmitted && !detectedSession && onSelectSession(session.id)}
                                    className={cn(
                                        'w-[85vw] shrink-0 snap-center rounded-2xl border p-4 shadow-sm transition-colors sm:w-auto',
                                        isTargeted
                                            ? 'border-indigo-200 bg-indigo-50/80 dark:border-indigo-500/20 dark:bg-indigo-500/[0.08]'
                                            : 'border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]',
                                        !session.alreadySubmitted && !detectedSession
                                            ? 'cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/[0.04]'
                                            : ''
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                                                {formatSessionPrimaryLabel(
                                                    session,
                                                )}
                                            </h3>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                                {formatSessionSecondaryLabel(
                                                    session,
                                                ) || 'Sesi aktif tanpa detail tambahan.'}
                                            </p>
                                        </div>
                                        <span
                                            className={cn(
                                                'inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                                                badgeClass,
                                            )}
                                        >
                                            {session.alreadySubmitted ? (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            ) : isTargeted ? (
                                                <ScanLine className="h-3.5 w-3.5" />
                                            ) : (
                                                <Clock3 className="h-3.5 w-3.5" />
                                            )}
                                            {session.alreadySubmitted
                                                ? session.attendanceLabel ||
                                                  'Sudah absen'
                                                : isDetected
                                                  ? 'Sedang diproses'
                                                  : isSelected
                                                    ? 'Target Terpilih'
                                                    : 'Klik untuk pilih'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="lg:col-span-2">
                            <EmptyState
                                icon={Clock3}
                                title="Belum Ada Absensi Aktif"
                                description="Mahasiswa bisa kembali lagi saat dosen sudah membuka QR untuk mata kuliah yang sedang berjalan."
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function RealTimeProgressTracker({
    progressCount,
    totalSteps,
    consentAccepted,
    steps,
    idSuffix,
}: {
    progressCount: number;
    totalSteps: number;
    consentAccepted: boolean;
    steps: Array<{
        id: string;
        title: string;
        completed: boolean;
        active: boolean;
        timestamp: string | null;
        icon: LucideIcon;
    }>;
    idSuffix: string;
}) {
    const progress = totalSteps === 0 ? 0 : (progressCount / totalSteps) * 100;

    return (
        <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(GLASS_CARD, 'xl:sticky xl:top-6')}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                        Progress Absensi
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {progressCount} dari {totalSteps} langkah selesai
                    </p>
                </div>
                <ProgressRing
                    current={progressCount}
                    total={totalSteps}
                    size={68}
                    idSuffix={idSuffix}
                    label="Flow"
                    className="shrink-0 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-lg"
                />
            </div>

            <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-white/50">
                <span>{Math.round(progress)}% selesai</span>
                <span>
                    {consentAccepted ? 'Consent aktif' : 'Consent belum aktif'}
                </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.06 }}
                            className={cn(
                                'flex items-center gap-3 rounded-2xl p-3 transition-colors',
                                step.completed
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                    : step.active
                                      ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                      : 'bg-slate-50 dark:bg-white/5',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                    step.completed
                                        ? 'bg-emerald-500 text-white'
                                        : step.active
                                          ? 'bg-indigo-500 text-white'
                                          : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-white/65',
                                )}
                            >
                                {step.completed ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : step.active ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Icon className="h-4 w-4" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-950 dark:text-white">
                                    {step.title}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
                                    {step.timestamp
                                        ? new Date(
                                              step.timestamp,
                                          ).toLocaleTimeString('id-ID', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : step.active
                                          ? 'Sedang diproses'
                                          : 'Menunggu giliran'}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.section>
    );
}

function ProgressRing({
    current,
    total,
    size = 84,
    idSuffix,
    label = 'Selesai',
    className,
}: {
    current: number;
    total: number;
    size?: number;
    idSuffix: string;
    label?: string;
    className?: string;
}) {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const safeCurrent = Math.min(current, total);
    const strokeDashoffset =
        circumference - (safeCurrent / total) * circumference;

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center',
                className,
            )}
        >
            <svg
                width={size}
                height={size}
                className="-rotate-90 overflow-visible"
                aria-hidden="true"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="6"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#progress-gradient-${idSuffix})`}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                />
                <defs>
                    <linearGradient
                        id={`progress-gradient-${idSuffix}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="55%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-white">
                    {safeCurrent}
                    <span className="text-sm font-medium text-white/65">
                        /{total}
                    </span>
                </span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-white/70 uppercase">
                    {label}
                </span>
            </div>
        </div>
    );
}

function StatusRingOverlay({
    progressCount,
    total,
    title,
    hint,
    idSuffix,
    className,
}: {
    progressCount: number;
    total: number;
    title: string;
    hint: string;
    idSuffix: string;
    className?: string;
}) {
    const size = 58;
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
        circumference -
        (Math.min(progressCount, total) / total) * circumference;

    return (
        <div className={cn("pointer-events-none absolute top-4 right-4 z-10", className)}>
            <div className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-black/45 px-2.5 py-2 text-white shadow-2xl backdrop-blur-md">
                <div className="relative flex h-[58px] w-[58px] items-center justify-center">
                    <svg
                        width={size}
                        height={size}
                        className="-rotate-90 opacity-95"
                        aria-hidden="true"
                    >
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.12)"
                            strokeWidth="6"
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={`url(#status-gradient-${idSuffix})`}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500 ease-out"
                        />
                        <defs>
                            <linearGradient
                                id={`status-gradient-${idSuffix}`}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="45%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#f472b6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-base font-bold">
                            {progressCount}
                            <span className="text-[10px] font-medium text-white/65">
                                /{total}
                            </span>
                        </p>
                        <p className="text-[8px] font-semibold tracking-[0.22em] text-white/55 uppercase">
                            Flow
                        </p>
                    </div>
                </div>
                <div className="hidden max-w-[130px] sm:block">
                    <p className="text-[9px] font-semibold tracking-[0.24em] text-white/55 uppercase">
                        {title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed font-medium text-white/82">
                        {hint}
                    </p>
                </div>
            </div>
        </div>
    );
}

function RewardPreview({
    xpGained,
    currentStreak,
    leaderboardPosition,
    totalPoints,
}: {
    xpGained: number;
    currentStreak: number;
    leaderboardPosition: number;
    totalPoints: number;
}) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-500/15 p-3 text-amber-600">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium tracking-[0.2em] text-amber-700/80 uppercase">
                            Potensi XP
                        </p>
                        <p className="text-2xl font-bold text-amber-950">
                            +{xpGained}
                        </p>
                    </div>
                </div>
            </div>
            <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-sky-500/15 p-3 text-sky-600">
                        <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium tracking-[0.2em] text-sky-700/80 uppercase">
                            Streak
                        </p>
                        <p className="text-2xl font-bold text-sky-950">
                            {currentStreak} hari
                        </p>
                    </div>
                </div>
            </div>
            <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-600">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium tracking-[0.2em] text-emerald-700/80 uppercase">
                            Posisi / Total XP
                        </p>
                        <p className="text-2xl font-bold text-emerald-950">
                            #{leaderboardPosition}
                        </p>
                        <p className="text-xs text-emerald-800/80">
                            {totalPoints} poin terkumpul
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PermissionGuide({ title, steps }: { title: string; steps: string[] }) {
    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900 shadow-sm">
            <p className="font-semibold">{title}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-amber-800">
                {steps.map((step) => (
                    <li key={step}>{step}</li>
                ))}
            </ol>
        </div>
    );
}

function CameraPermissionGuide({
    open,
    reason,
    onClose,
}: {
    open: boolean;
    reason?: string;
    onClose: () => void;
}) {
    const browserType = useMemo(() => {
        if (typeof navigator === 'undefined') return 'other';
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('chrome') && !ua.includes('edg')) {
            return 'chrome';
        }
        if (ua.includes('safari') && !ua.includes('chrome')) {
            return 'safari';
        }
        if (ua.includes('firefox')) {
            return 'firefox';
        }
        return 'other';
    }, []);

    if (!open) return null;

    const guides = {
        chrome: [
            'Klik ikon kamera atau gembok di address bar.',
            'Pilih untuk selalu mengizinkan akses kamera.',
            'Tutup dialog pengaturan browser.',
            'Refresh halaman ini lalu mulai scan lagi.',
        ],
        safari: [
            'Buka menu Safari lalu pilih Pengaturan untuk Situs Web Ini.',
            'Di bagian Kamera, pilih Izinkan.',
            'Tutup pengaturan yang terbuka.',
            'Refresh halaman ini dan coba lagi.',
        ],
        firefox: [
            'Klik ikon kamera yang dicoret di address bar.',
            'Hapus pemblokiran kamera pada situs ini.',
            'Izinkan akses saat browser meminta ulang.',
            'Refresh halaman ini.',
        ],
        other: [
            'Cari ikon kamera atau gembok di address bar browser.',
            'Izinkan akses kamera untuk situs ini.',
            'Tutup panel pengaturan jika sudah selesai.',
            'Refresh halaman ini lalu ulangi flow absensi.',
        ],
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                GLASS_CARD,
                'border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/20 dark:to-orange-900/20',
            )}
        >
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
                    <Camera className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                        Cara Mengaktifkan Kamera
                    </h3>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                        Browser:{' '}
                        {browserType.charAt(0).toUpperCase() +
                            browserType.slice(1)}
                    </p>
                    {reason && (
                        <p className="mt-3 rounded-2xl border border-amber-200/80 bg-white/60 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-black/10 dark:text-amber-100">
                            {reason}
                        </p>
                    )}
                    <ol className="mt-4 space-y-2 text-sm text-amber-900 dark:text-amber-100">
                        {guides[browserType].map((step, index) => (
                            <li key={step} className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-700">
                                    {index + 1}
                                </span>
                                <span className="flex-1 leading-relaxed">
                                    {step}
                                </span>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={() => window.location.reload()}
                            size="sm"
                            className="bg-amber-600 text-white hover:bg-amber-700"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh halaman
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            size="sm"
                            variant="outline"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

function CameraQualityIndicator({
    videoRef,
}: {
    videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
    const [quality, setQuality] = useState<'excellent' | 'good' | 'poor'>(
        'good',
    );
    const [metrics, setMetrics] = useState({
        brightness: 0,
        sharpness: 0,
        faceDetected: false,
    });

    useEffect(() => {
        const analyzeCameraQuality = () => {
            const video = videoRef.current;
            if (!video || video.readyState < 2 || !video.videoWidth) return;

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d', {
                willReadFrequently: true,
            });

            if (!context) return;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
            );

            let totalBrightness = 0;
            let edgeContrast = 0;

            for (let index = 0; index < imageData.data.length; index += 4) {
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const brightness = (r + g + b) / 3;
                totalBrightness += brightness;

                if (index > 0) {
                    const prevBrightness =
                        (imageData.data[index - 4] +
                            imageData.data[index - 3] +
                            imageData.data[index - 2]) /
                        3;
                    edgeContrast += Math.abs(brightness - prevBrightness);
                }
            }

            const pixelCount = imageData.data.length / 4;
            const avgBrightness = totalBrightness / pixelCount;
            const sharpness = Math.min(
                100,
                Math.round(edgeContrast / pixelCount / 1.5),
            );
            const faceDetected = avgBrightness > 45;

            if (
                avgBrightness > 95 &&
                avgBrightness < 205 &&
                sharpness >= 18 &&
                faceDetected
            ) {
                setQuality('excellent');
            } else if (
                avgBrightness > 70 &&
                avgBrightness < 225 &&
                sharpness >= 10
            ) {
                setQuality('good');
            } else {
                setQuality('poor');
            }

            setMetrics({
                brightness: Math.round(avgBrightness),
                sharpness,
                faceDetected,
            });
        };

        const timer = window.setInterval(analyzeCameraQuality, 1200);
        analyzeCameraQuality();
        return () => window.clearInterval(timer);
    }, [videoRef]);

    const qualityConfig = {
        excellent: {
            color: 'text-green-600',
            bg: 'bg-green-500/20',
            border: 'border-green-400/70',
            label: 'Sempurna',
            icon: CheckCircle2,
        },
        good: {
            color: 'text-amber-600',
            bg: 'bg-amber-500/20',
            border: 'border-amber-400/70',
            label: 'Baik',
            icon: AlertCircle,
        },
        poor: {
            color: 'text-rose-600',
            bg: 'bg-rose-500/20',
            border: 'border-rose-400/70',
            label: 'Kurang',
            icon: X,
        },
    } as const;

    const config = qualityConfig[quality];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                'absolute top-4 right-4 rounded-xl border px-3 py-2 text-white backdrop-blur-md',
                config.bg,
                config.border,
            )}
        >
            <div className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4', config.color)} />
                <div>
                    <p className={cn('text-xs font-semibold', config.color)}>
                        Kualitas: {config.label}
                    </p>
                    <div className="mt-1 flex gap-2 text-[10px] text-white/85">
                        <span>Cahaya: {metrics.brightness}</span>
                        <span>•</span>
                        <span>Ketajaman: {metrics.sharpness}%</span>
                    </div>
                </div>
            </div>
            {!metrics.faceDetected && (
                <p className="mt-2 text-[10px] text-amber-100">
                    Pastikan wajah masuk ke frame.
                </p>
            )}
        </motion.div>
    );
}

function SuccessCelebration({
    open,
    offlineDraft,
    xpGained,
    currentStreak,
    onComplete,
}: {
    open: boolean;
    offlineDraft: boolean;
    xpGained: number;
    currentStreak: number;
    onComplete: () => void;
}) {
    useEffect(() => {
        if (!open) return;
        const timer = window.setTimeout(onComplete, 2600);
        return () => window.clearTimeout(timer);
    }, [onComplete, open]);

    const confettiBursts = useMemo(
        () =>
            Array.from({ length: 16 }, (_, index) => {
                const angle = (index / 16) * Math.PI * 2;
                const distance = 120 + (index % 4) * 28;
                return {
                    id: `confetti-${index}`,
                    color: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'][
                        index % 4
                    ],
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance * 0.82,
                    delay: index * 0.03,
                };
            }),
        [],
    );

    if (!open) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.7, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="relative w-full max-w-md"
            >
                {confettiBursts.map((burst) => (
                    <motion.span
                        key={burst.id}
                        className="absolute top-1/2 left-1/2 h-3 w-3 rounded-full"
                        style={{
                            backgroundColor: burst.color,
                        }}
                        animate={{
                            x: [0, burst.x],
                            y: [0, burst.y],
                            opacity: [1, 0],
                            scale: [1, 0],
                        }}
                        transition={{
                            duration: 1.2,
                            delay: burst.delay,
                            ease: 'easeOut',
                        }}
                    />
                ))}

                <div className={cn(GLASS_CARD, 'relative z-10 text-center')}>
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-2xl">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-slate-950 dark:text-white">
                        {offlineDraft
                            ? 'Draft Offline Tersimpan'
                            : 'Absensi Berhasil'}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {offlineDraft
                            ? 'Data akan otomatis disinkronkan saat koneksi kembali stabil.'
                            : 'Kehadiran Anda sudah tercatat dan siap masuk ke rekap kelas.'}
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">
                                +{xpGained}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-white/50">
                                XP Earned
                            </p>
                        </div>
                        <div className="h-12 w-px bg-slate-300 dark:bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">
                                {currentStreak}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-white/50">
                                Day Streak
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

type UnifiedCameraCardProps = {
    cameraPhase: CameraPhase;
    progressCount: number;
    total: number;
    statusTitle: string;
    statusHint: string;
    phaseTitle: string;
    phaseDescription: string;
    idSuffix: string;
    qrReaderDivId: string;
    selfieVideoRef: React.RefObject<HTMLVideoElement | null>;
    consentAccepted: boolean;
    currentToken: string;
    manualToken: string;
    previewUrl: string | null;
    selfieRequired: boolean;
    scanState: ScanState;
    scanMessage: string;
    selfieState: SelfieState;
    selfieMessage: string;
    selfieCountdown: number | null;
    locationState: LocationState;
    locationMessage: string;
    tokenError?: string;
    selfieError?: string;
    cameraPermission: PermissionState | 'unknown';
    rearFlashSupported: boolean;
    rearFlashEnabled: boolean;
    rearFlashBusy: boolean;
    scanMirrorEnabled: boolean;
    onToggleScanMirror: () => void;
    selfieTorchSupported: boolean;
    selfieFlashEnabled: boolean;
    selfieFlashBusy: boolean;
    selfieFlashOverlayVisible: boolean;
    selfieMirrorEnabled: boolean;
    onToggleSelfieMirror: () => void;
    onManualTokenChange: (value: string) => void;
    onApplyManualToken: () => void;
    onStartScanning: () => void;
    onCancelScanning: () => void;
    onToggleRearFlash: () => void;
    onSwitchCamera: () => void;
    canSwitchCamera: boolean;
    onRetryFlow: () => void;
    onRetrySelfieCamera: () => void;
    onToggleSelfieFlash: () => void;
    onStartSelfieCountdown: () => void;
    onRetakeSelfie: () => void;
    onSelfieFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function UnifiedCameraCard({
    cameraPhase,
    progressCount,
    total,
    statusTitle,
    statusHint,
    phaseTitle,
    phaseDescription,
    idSuffix,
    qrReaderDivId,
    selfieVideoRef,
    consentAccepted,
    currentToken,
    manualToken,
    previewUrl,
    selfieRequired,
    scanState,
    scanMessage,
    selfieState,
    selfieMessage,
    selfieCountdown,
    locationState,
    locationMessage,
    tokenError,
    selfieError,
    cameraPermission,
    rearFlashSupported,
    rearFlashEnabled,
    rearFlashBusy,
    scanMirrorEnabled,
    onToggleScanMirror,
    selfieTorchSupported,
    selfieFlashEnabled,
    selfieFlashBusy,
    selfieFlashOverlayVisible,
    selfieMirrorEnabled,
    onToggleSelfieMirror,
    onManualTokenChange,
    onApplyManualToken,
    onStartScanning,
    onCancelScanning,
    onToggleRearFlash,
    onSwitchCamera,
    canSwitchCamera,
    onRetryFlow,
    onRetrySelfieCamera,
    onToggleSelfieFlash,
    onStartSelfieCountdown,
    onRetakeSelfie,
    onSelfieFileChange,
}: UnifiedCameraCardProps) {
    const showSelfieFallback =
        selfieRequired &&
        (cameraPermission === 'denied' || selfieState === 'error');
    const showViewportProgress =
        cameraPhase !== 'idle' || progressCount > 0 || Boolean(currentToken);
    return (
        <section className={cn(GLASS_CARD, 'overflow-hidden p-0')}>
            <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.28em] text-sky-600 uppercase dark:text-sky-300">
                            Unified Camera Flow
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl dark:text-white">
                            {phaseTitle}
                        </h2>
                        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                            {phaseDescription}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm sm:px-4 sm:py-2 sm:text-xs dark:border-white/10 dark:bg-black/20 dark:text-white/80">
                        <span
                            className={cn(
                                'h-2.5 w-2.5 rounded-full',
                                cameraPhase === 'scanning'
                                    ? 'animate-pulse bg-emerald-500'
                                    : cameraPhase === 'selfie'
                                      ? 'animate-pulse bg-sky-500'
                                      : cameraPhase === 'flipping'
                                        ? 'animate-pulse bg-amber-500'
                                        : cameraPhase === 'done'
                                          ? 'bg-emerald-500'
                                          : 'bg-slate-300',
                            )}
                        />
                        {statusTitle}
                    </div>
                </div>

                <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
                    <div className="relative w-full overflow-hidden rounded-[30px] bg-neutral-950 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.2),transparent_34%)]" />
                        {showViewportProgress && (
                            <StatusRingOverlay
                                progressCount={progressCount}
                                total={total}
                                title={statusTitle}
                                hint={statusHint}
                                idSuffix={idSuffix}
                                className="origin-top-right scale-75 sm:scale-100"
                            />
                        )}

                        <div className="relative aspect-[4/5] w-full min-h-[500px] overflow-hidden sm:aspect-[4/5] sm:min-h-[560px] md:aspect-[5/4] md:min-h-[420px] xl:aspect-[4/3]">
                            <AnimatePresence mode="wait">
                                {cameraPhase === 'idle' && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -16 }}
                                        className="absolute inset-0 flex items-center justify-center px-3 py-5 text-center text-white sm:px-8 sm:py-8"
                                    >
                                        <div className="w-full max-w-[300px] rounded-[26px] border border-white/10 bg-black/28 p-4 shadow-2xl backdrop-blur-md sm:max-w-[680px] sm:rounded-[30px] sm:p-8">
                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-sky-500/25 via-cyan-400/20 to-emerald-400/25 text-white shadow-lg sm:h-20 sm:w-20 sm:rounded-[24px]">
                                                <Camera className="h-8 w-8 sm:h-10 sm:w-10" />
                                            </div>
                                            <p className="mt-4 text-[10px] font-semibold tracking-[0.26em] text-sky-200 uppercase sm:mt-5 sm:text-[11px] sm:tracking-[0.28em]">
                                                Siap Memulai
                                            </p>
                                            <h3 className="mt-2 text-lg font-bold sm:mt-3 sm:text-3xl">
                                                Siap untuk absen?
                                            </h3>
                                            <p className="mx-auto mt-2 max-w-[540px] text-[12px] leading-relaxed text-white/72 sm:mt-3 sm:text-base">
                                                Mulai dari scan QR di kartu ini.
                                                Jika sesi memerlukan selfie,
                                                sistem akan berpindah kamera
                                                otomatis tanpa pindah langkah.
                                            </p>
                                            <p className="mt-4 text-[11px] font-medium text-white/60 sm:hidden">
                                                QR, selfie, dan lokasi berjalan
                                                berurutan dalam satu flow.
                                            </p>
                                            <div className="mt-5 hidden flex-wrap items-center justify-center gap-2 text-xs font-medium text-white/70 sm:flex">
                                                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">
                                                    1 kartu kamera
                                                </span>
                                                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">
                                                    QR lalu selfie
                                                </span>
                                                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">
                                                    Lokasi otomatis
                                                </span>
                                            </div>
                                            <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
                                                <Button
                                                    type="button"
                                                    size="lg"
                                                    onClick={onStartScanning}
                                                    disabled={!consentAccepted}
                                                    className="h-11 rounded-full bg-white px-6 text-sm text-slate-950 shadow-xl hover:bg-white/90 sm:h-auto sm:px-7 sm:text-base"
                                                >
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    Mulai Scan QR
                                                </Button>
                                                {currentToken && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="lg"
                                                        onClick={onRetryFlow}
                                                        className="h-12 rounded-full border border-white/15 bg-white/10 px-6 text-sm text-white hover:bg-white/15 sm:h-auto sm:px-7 sm:text-base"
                                                    >
                                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                                        Mulai Ulang
                                                    </Button>
                                                )}
                                            </div>
                                            {!consentAccepted && (
                                                <p className="mt-3 text-[11px] font-medium text-amber-300 sm:mt-4 sm:text-xs">
                                                    Aktifkan persetujuan kamera
                                                    dan lokasi di bagian atas
                                                    sebelum memulai.
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {cameraPhase === 'scanning' && (
                                    <motion.div
                                        key="scanning"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0"
                                    >
                                        <style>{`#${qrReaderDivId}, #${qrReaderDivId} > div, #${qrReaderDivId} video, #${qrReaderDivId} canvas { width: 100% !important; height: 100% !important; } #${qrReaderDivId} { position: absolute; inset: 0; } #${qrReaderDivId} > div { display: flex; align-items: stretch; } #${qrReaderDivId} video, #${qrReaderDivId} canvas { object-fit: cover; transform: ${scanMirrorEnabled ? 'scaleX(-1)' : 'none'}; transform-origin: center; }`}</style>
                                        <div
                                            id={qrReaderDivId}
                                            className="h-full w-full [&>*]:!border-none"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_30%,rgba(0,0,0,0.42)_100%)]" />
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 sm:p-8">
                                            <div className="relative aspect-square w-full max-w-[220px] sm:max-w-[290px]">
                                                <div className="absolute top-0 left-0 h-12 w-12 rounded-tl-[22px] border-t-4 border-l-4 border-emerald-400 sm:h-16 sm:w-16 sm:rounded-tl-[26px]" />
                                                <div className="absolute top-0 right-0 h-12 w-12 rounded-tr-[22px] border-t-4 border-r-4 border-emerald-400 sm:h-16 sm:w-16 sm:rounded-tr-[26px]" />
                                                <div className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-[22px] border-b-4 border-l-4 border-emerald-400 sm:h-16 sm:w-16 sm:rounded-bl-[26px]" />
                                                <div className="absolute right-0 bottom-0 h-12 w-12 rounded-br-[22px] border-r-4 border-b-4 border-emerald-400 sm:h-16 sm:w-16 sm:rounded-br-[26px]" />
                                                <motion.div
                                                    animate={{
                                                        y: ['0%', '100%', '0%'],
                                                    }}
                                                    transition={{
                                                        duration: 2.2,
                                                        repeat: Infinity,
                                                        ease: 'linear',
                                                    }}
                                                    className="absolute inset-x-0 top-0 h-1 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_24px_rgba(52,211,153,0.8)]"
                                                />
                                            </div>
                                        </div>
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <QrCode className="h-7 w-7 text-emerald-300/70 sm:h-8 sm:w-8" />
                                        </div>
                                        <div className="absolute top-2 left-2 right-2 z-10 flex justify-start sm:top-4 sm:left-4 sm:right-auto sm:block">
                                            <div className="w-fit max-w-full rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs">
                                            {scanMirrorEnabled
                                                ? 'Kamera depan aktif'
                                                : 'Kamera belakang aktif'}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2 py-2 backdrop-blur-sm sm:bottom-6">
                                            {rearFlashSupported && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={onToggleRearFlash}
                                                    disabled={rearFlashBusy}
                                                    aria-pressed={
                                                        rearFlashEnabled
                                                    }
                                                    aria-label="Flash"
                                                    className="h-9 w-9 rounded-full border border-white/10 bg-white/5 p-0 text-white hover:bg-white/10 sm:h-10 sm:w-10"
                                                >
                                                    {rearFlashBusy ? (
                                                        <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                                                    ) : rearFlashEnabled ? (
                                                        <FlashlightOff className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    ) : (
                                                        <Flashlight className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    )}
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={onToggleScanMirror}
                                                aria-label="Mirror"
                                                className="h-9 w-9 rounded-full border border-white/10 bg-white/5 p-0 text-white hover:bg-white/10 sm:h-10 sm:w-10"
                                            >
                                                <FlipHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </Button>
                                            {canSwitchCamera && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={onSwitchCamera}
                                                    aria-label="Ganti kamera"
                                                    className="h-9 w-9 rounded-full border border-white/10 bg-white/5 p-0 text-white hover:bg-white/10 sm:h-10 sm:w-10"
                                                >
                                                    <SwitchCamera className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={onCancelScanning}
                                                aria-label="Batal"
                                                className="h-9 w-9 rounded-full border border-white/10 bg-white/5 p-0 text-white hover:bg-white/10 sm:h-10 sm:w-10"
                                            >
                                                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {cameraPhase === 'flipping' && (
                                    <motion.div
                                        key="flipping"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center p-6 text-white sm:p-8"
                                    >
                                        <motion.div
                                            initial={{ rotateY: 0 }}
                                            animate={{ rotateY: 180 }}
                                            transition={{
                                                duration: CAMERA_FLIP_MS / 1000,
                                                ease: [0.4, 0, 0.2, 1],
                                            }}
                                            style={{
                                                transformStyle: 'preserve-3d',
                                            }}
                                            className="relative h-[240px] w-full max-w-[280px] sm:h-[280px] sm:max-w-[320px]"
                                        >
                                            <div
                                                style={{
                                                    backfaceVisibility:
                                                        'hidden',
                                                }}
                                                className="absolute inset-0 flex flex-col items-center justify-center rounded-[30px] border border-emerald-300/25 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 text-center shadow-2xl"
                                            >
                                                <div className="rounded-full bg-emerald-500/20 p-5 text-emerald-300">
                                                    <CheckCircle2 className="h-10 w-10" />
                                                </div>
                                                <h3 className="mt-4 text-xl font-bold sm:mt-5 sm:text-2xl">
                                                    QR Berhasil
                                                </h3>
                                                <p className="mt-2 max-w-[220px] text-[13px] text-white/72 sm:text-sm">
                                                    Menyiapkan kamera depan
                                                    untuk verifikasi selfie.
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    backfaceVisibility:
                                                        'hidden',
                                                    transform:
                                                        'rotateY(180deg)',
                                                }}
                                                className="absolute inset-0 flex flex-col items-center justify-center rounded-[30px] border border-sky-300/25 bg-gradient-to-br from-sky-500/20 to-amber-500/10 text-center shadow-2xl"
                                            >
                                                <div className="rounded-full bg-sky-500/20 p-5 text-sky-300">
                                                    <Camera className="h-10 w-10" />
                                                </div>
                                                <h3 className="mt-4 text-xl font-bold sm:mt-5 sm:text-2xl">
                                                    Mode Selfie
                                                </h3>
                                                <p className="mt-2 max-w-[220px] text-[13px] text-white/72 sm:text-sm">
                                                    Jaga wajah tetap di tengah
                                                    untuk pengambilan foto.
                                                </p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {cameraPhase === 'selfie' && (
                                    <motion.div
                                        key="selfie"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0"
                                    >
                                        <video
                                            ref={selfieVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="h-full w-full object-cover"
                                            style={{
                                                transform: selfieMirrorEnabled
                                                    ? 'scaleX(-1)'
                                                    : 'none',
                                            }}
                                        />
                                        <CameraQualityIndicator
                                            videoRef={selfieVideoRef}
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.56)_100%)]" />
                                        {selfieFlashOverlayVisible && (
                                            <div className="pointer-events-none absolute inset-0 bg-white/95 transition-opacity duration-200" />
                                        )}
                                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 sm:px-8">
                                            <div className="relative">
                                                <svg
                                                    width="260"
                                                    height="330"
                                                    viewBox="0 0 260 330"
                                                    className="h-[280px] w-[220px] opacity-90 sm:h-[330px] sm:w-[260px]"
                                                >
                                                    <ellipse
                                                        cx="130"
                                                        cy="165"
                                                        rx="102"
                                                        ry="138"
                                                        fill="none"
                                                        stroke="rgba(255,255,255,0.85)"
                                                        strokeWidth="4"
                                                        strokeDasharray="12 10"
                                                    />
                                                </svg>
                                                {selfieCountdown !== null && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <motion.div
                                                            key={
                                                                selfieCountdown
                                                            }
                                                            initial={{
                                                                scale: 0.75,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                opacity: 1,
                                                            }}
                                                            className="rounded-full border border-white/20 bg-black/35 px-8 py-5 text-6xl font-black text-white shadow-2xl backdrop-blur-sm sm:px-10 sm:py-7 sm:text-7xl"
                                                        >
                                                            {selfieCountdown}
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute top-3 left-3 z-10 sm:top-4 sm:left-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={onRetryFlow}
                                                className="h-9 rounded-full border border-white/10 bg-black/35 px-3 text-xs text-white hover:bg-black/55 sm:px-4 sm:text-sm"
                                            >
                                                <RefreshCcw className="mr-2 h-4 w-4" />
                                                Scan Ulang
                                            </Button>
                                        </div>
                                        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 sm:bottom-8">
                                            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-2.5 py-2 backdrop-blur-sm">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={onToggleSelfieMirror}
                                                    aria-label="Mirror"
                                                    className="h-10 w-10 rounded-full border border-white/10 bg-white/5 p-0 text-white hover:bg-white/10"
                                                >
                                                    <FlipHorizontal className="h-4 w-4" />
                                                </Button>
                                                <button
                                                    type="button"
                                                    aria-label="Ambil selfie"
                                                    onClick={onStartSelfieCountdown}
                                                    disabled={
                                                        selfieCountdown !==
                                                            null ||
                                                        selfieState ===
                                                            'capturing'
                                                    }
                                                    className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/15 shadow-2xl backdrop-blur-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:h-20 sm:w-20"
                                                >
                                                    <span className="h-10 w-10 rounded-full border-[6px] border-white bg-sky-500/90 shadow-inner sm:h-12 sm:w-12" />
                                                </button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={onToggleSelfieFlash}
                                                    disabled={selfieFlashBusy}
                                                    aria-pressed={
                                                        selfieFlashEnabled
                                                    }
                                                    aria-label="Flash"
                                                    className="h-10 w-10 rounded-full border border-white/10 bg-white/5 p-0 text-white hover:bg-white/10"
                                                >
                                                    {selfieFlashBusy ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : selfieFlashEnabled ? (
                                                        <FlashlightOff className="h-4 w-4" />
                                                    ) : (
                                                        <Flashlight className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <p className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[11px] font-medium text-white/90 backdrop-blur-sm sm:text-xs">
                                                Tap sekali untuk foto otomatis
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {cameraPhase === 'done' && (
                                    <motion.div
                                        key="done"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        className="absolute inset-0 flex items-center justify-center p-6 text-white"
                                    >
                                        <div className="w-full max-w-[350px] rounded-[30px] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] bg-white/10">
                                                    {previewUrl ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview selfie"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <QrCode className="h-9 w-9 text-sky-200" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold tracking-[0.28em] text-white/60 uppercase">
                                                        Camera Summary
                                                    </p>
                                                    <h3 className="mt-1 text-2xl font-bold">
                                                        {previewUrl
                                                            ? 'Selfie tersimpan'
                                                            : 'Token siap diproses'}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-white/70">
                                                        {locationState ===
                                                        'fetching'
                                                            ? 'Lokasi sedang diambil otomatis.'
                                                            : locationMessage ||
                                                              'Lanjutkan ke pengiriman absensi.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-6 space-y-3">
                                                <CompletionItem
                                                    done={Boolean(currentToken)}
                                                    label="QR atau token manual terverifikasi"
                                                />
                                                <CompletionItem
                                                    done={
                                                        selfieRequired
                                                            ? Boolean(
                                                                  previewUrl,
                                                              )
                                                            : true
                                                    }
                                                    label={
                                                        selfieRequired
                                                            ? 'Selfie berhasil disimpan'
                                                            : 'Selfie tidak diwajibkan'
                                                    }
                                                />
                                                <CompletionItem
                                                    done={
                                                        locationState ===
                                                        'success'
                                                    }
                                                    loading={
                                                        locationState ===
                                                        'fetching'
                                                    }
                                                    label={
                                                        locationState ===
                                                        'success'
                                                            ? 'Lokasi sudah tervalidasi'
                                                            : 'Menunggu verifikasi lokasi'
                                                    }
                                                />
                                            </div>

                                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                                {selfieRequired && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={onRetakeSelfie}
                                                        className="flex-1 rounded-full border-white/15 bg-white/6 text-white hover:bg-white/10"
                                                    >
                                                        <Camera className="mr-2 h-4 w-4" />
                                                        Foto Ulang
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={onRetryFlow}
                                                    className="flex-1 rounded-full border border-white/15 bg-transparent text-white hover:bg-white/10"
                                                >
                                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                                    Ulang Flow
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-3xl border border-white/20 bg-white/65 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/45">
                            <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-500 uppercase dark:text-white/55">
                                Status
                            </p>
                            <div className="mt-4 grid gap-3">
                                <StatusRow
                                    icon={<Shield className="h-4 w-4" />}
                                    label="Persetujuan"
                                    value={
                                        consentAccepted
                                            ? 'Sudah aktif'
                                            : 'Belum aktif'
                                    }
                                    tone={
                                        consentAccepted ? 'success' : 'neutral'
                                    }
                                />
                                <StatusRow
                                    icon={<QrCode className="h-4 w-4" />}
                                    label="Token"
                                    value={
                                        currentToken
                                            ? currentToken
                                            : scanState === 'scanning'
                                              ? 'Sedang scan QR'
                                              : 'Belum ada token'
                                    }
                                    tone={
                                        currentToken
                                            ? 'success'
                                            : scanState === 'error'
                                              ? 'error'
                                              : 'neutral'
                                    }
                                />
                                <StatusRow
                                    icon={<Camera className="h-4 w-4" />}
                                    label="Selfie"
                                    value={
                                        selfieRequired
                                            ? previewUrl
                                                ? 'Tersimpan'
                                                : selfieState === 'capturing'
                                                  ? 'Sedang mengambil foto'
                                                  : selfieState === 'ready'
                                                    ? 'Kamera siap'
                                                    : 'Belum ada foto'
                                            : 'Tidak wajib'
                                    }
                                    tone={
                                        selfieRequired
                                            ? previewUrl
                                                ? 'success'
                                                : selfieState === 'error'
                                                  ? 'error'
                                                  : 'neutral'
                                            : 'success'
                                    }
                                />
                            </div>

                            {(scanMessage || selfieMessage) && (
                                <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
                                    {cameraPhase === 'selfie'
                                        ? selfieMessage
                                        : scanMessage}
                                </div>
                            )}
                        </div>

                        {cameraPermission === 'denied' && (
                            <PermissionGuide
                                title="Izin kamera diblokir"
                                steps={[
                                    'Klik ikon gembok atau info di address bar browser.',
                                    'Masuk ke site settings lalu ubah Camera menjadi Allow.',
                                    'Refresh halaman dan mulai ulang flow absensi.',
                                ]}
                            />
                        )}

                        <Accordion
                            type="single"
                            collapsible
                            className="rounded-3xl border border-white/20 bg-white/65 px-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/45"
                        >
                            <AccordionItem
                                value="manual-token"
                                className="border-none"
                            >
                                <AccordionTrigger className="py-5 text-left text-base font-semibold text-slate-900 hover:no-underline dark:text-white">
                                    Input token manual
                                </AccordionTrigger>
                                <AccordionContent className="pb-5">
                                    <div className="space-y-4">
                                        <div>
                                            <Label
                                                htmlFor="manual-token"
                                                className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                            >
                                                Token absensi
                                            </Label>
                                            <Input
                                                id="manual-token"
                                                value={manualToken}
                                                onChange={(event) =>
                                                    onManualTokenChange(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="UNPAM-7A8B..."
                                                className="mt-2 h-12 rounded-2xl border-slate-200 bg-white text-center font-mono tracking-[0.24em] uppercase dark:border-white/10 dark:bg-black/20"
                                            />
                                        </div>
                                        <p className="text-xs leading-relaxed text-slate-500 dark:text-white/60">
                                            Gunakan fallback ini jika QR di
                                            layar dosen sulit dibaca. Flow akan
                                            langsung melanjutkan ke selfie atau
                                            lokasi.
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={onApplyManualToken}
                                            className="w-full rounded-full bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-sky-500/20 hover:from-sky-500 hover:to-emerald-400"
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {selfieRequired
                                                ? 'Gunakan token & lanjut selfie'
                                                : 'Gunakan token manual'}
                                        </Button>
                                        {tokenError && (
                                            <InputError
                                                message={tokenError}
                                                className="mt-1"
                                            />
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {showSelfieFallback && (
                            <div className="rounded-3xl border border-white/20 bg-white/65 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/45">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Fallback selfie manual
                                </p>
                                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-white/60">
                                    Kamera depan gagal diakses. Kamu masih bisa
                                    upload foto langsung lalu lanjut ke lokasi.
                                </p>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={onSelfieFileChange}
                                    className="mt-4 rounded-2xl border-slate-200 bg-white dark:border-white/10 dark:bg-black/20"
                                />
                                <div className="mt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onRetrySelfieCamera}
                                        className="flex-1 rounded-full"
                                    >
                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                        Coba Kamera Lagi
                                    </Button>
                                </div>
                                {selfieError && (
                                    <InputError
                                        message={selfieError}
                                        className="mt-3"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CompletionItem({
    done,
    label,
    loading = false,
}: {
    done: boolean;
    label: string;
    loading?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm">
            <div
                className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    done
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : loading
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-white/10 text-white/70',
                )}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : done ? (
                    <CheckCircle2 className="h-4 w-4" />
                ) : (
                    <Clock3 className="h-4 w-4" />
                )}
            </div>
            <span className="text-white/88">{label}</span>
        </div>
    );
}

function StatusRow({
    icon,
    label,
    value,
    tone,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    tone: 'neutral' | 'success' | 'error';
}) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'rounded-xl p-2',
                        tone === 'success'
                            ? 'bg-emerald-500/12 text-emerald-600'
                            : tone === 'error'
                              ? 'bg-rose-500/12 text-rose-600'
                              : 'bg-slate-500/10 text-slate-600 dark:text-white/70',
                    )}
                >
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase dark:text-white/50">
                        {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function LocationStatusCard({
    locationState,
    locationMessage,
    locationCollecting,
    sampleCount,
    locationSampleCount,
    latitude,
    longitude,
    accuracyValue,
    accuracyThreshold,
    currentDistance,
    isInsideZone,
    onRetry,
    disabled,
    locationPermission,
}: {
    locationState: LocationState;
    locationMessage: string;
    locationCollecting: boolean;
    sampleCount: number;
    locationSampleCount: number;
    latitude: string;
    longitude: string;
    accuracyValue: number | null;
    accuracyThreshold: number;
    currentDistance: number | null;
    isInsideZone: boolean;
    onRetry: () => void;
    disabled: boolean;
    locationPermission: PermissionState | 'unknown';
}) {
    const tone =
        locationState === 'success'
            ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-500/20 dark:bg-emerald-500/[0.08]'
            : locationState === 'error'
              ? 'border-rose-200 bg-rose-50/90 dark:border-rose-500/20 dark:bg-rose-500/[0.08]'
              : 'border-slate-200 bg-slate-50/90 dark:border-white/10 dark:bg-white/[0.04]';

    const iconWrapTone =
        locationState === 'success'
            ? 'bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
            : locationState === 'error'
              ? 'bg-rose-500/12 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
              : 'bg-sky-500/12 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300';

    const distanceLabel =
        currentDistance === null
            ? 'Belum ada jarak'
            : `${currentDistance}m dari pusat zona`;

    return (
        <section className={cn(GLASS_CARD, 'overflow-hidden p-0')}>
            <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <div
                            className={cn(
                                'rounded-2xl p-3 shadow-sm',
                                iconWrapTone,
                            )}
                        >
                            {locationCollecting ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : locationState === 'success' ? (
                                <CheckCircle2 className="h-6 w-6" />
                            ) : locationState === 'error' ? (
                                <AlertCircle className="h-6 w-6" />
                            ) : (
                                <MapPin className="h-6 w-6" />
                            )}
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-500 uppercase dark:text-white/50">
                                Location Sync
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                                Verifikasi lokasi
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                Lokasi akan diambil otomatis setelah kamera
                                selesai. Sistem memilih sampel GPS terbaik
                                sebelum submit diaktifkan.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onRetry}
                            disabled={disabled || locationCollecting}
                            className="rounded-full"
                        >
                            {locationCollecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sinkronisasi...
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    {sampleCount > 0
                                        ? 'Perbarui lokasi'
                                        : 'Ambil lokasi'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div
                    className={cn(
                        'mt-5 rounded-[26px] border p-4 sm:p-5',
                        tone,
                    )}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <LocationMetric
                            icon={<Wifi className="h-4 w-4" />}
                            label="Sampel"
                            value={`${sampleCount}/${locationSampleCount}`}
                        />
                        <LocationMetric
                            icon={<Navigation className="h-4 w-4" />}
                            label="Akurasi"
                            value={
                                accuracyValue !== null
                                    ? `${Math.round(accuracyValue)}m`
                                    : '-'
                            }
                            hint={`Target <= ${accuracyThreshold}m`}
                        />
                        <LocationMetric
                            icon={<MapPin className="h-4 w-4" />}
                            label="Jarak"
                            value={distanceLabel}
                            tone={
                                currentDistance === null
                                    ? 'neutral'
                                    : isInsideZone
                                      ? 'success'
                                      : 'error'
                            }
                        />
                        <LocationMetric
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            label="Zona"
                            value={
                                currentDistance === null
                                    ? 'Belum dicek'
                                    : isInsideZone
                                      ? 'Dalam radius'
                                      : 'Di luar radius'
                            }
                            tone={
                                currentDistance === null
                                    ? 'neutral'
                                    : isInsideZone
                                      ? 'success'
                                      : 'error'
                            }
                        />
                    </div>

                    <div
                        className={cn(
                            'mt-4 rounded-2xl border px-4 py-3 text-sm',
                            locationState === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/[0.1] dark:text-emerald-100'
                                : locationState === 'error'
                                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/[0.1] dark:text-rose-100'
                                  : 'border-slate-200 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300',
                        )}
                    >
                        {locationMessage ||
                            'Belum ada data lokasi. Setelah token dan selfie selesai, sinkronisasi akan dimulai otomatis.'}
                    </div>

                    {locationPermission === 'denied' && (
                        <div className="mt-4">
                            <PermissionGuide
                                title="Izin lokasi diblokir"
                                steps={[
                                    'Aktifkan Location di site settings browser.',
                                    'Izinkan browser membaca GPS perangkat.',
                                    'Setelah aktif, klik perbarui lokasi.',
                                ]}
                            />
                        </div>
                    )}

                    {(latitude || longitude) && (
                        <details className="mt-4 rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                            <summary className="cursor-pointer text-sm font-medium text-sky-700 dark:text-sky-300">
                                Detail koordinat
                            </summary>
                            <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3 dark:text-slate-300">
                                <span>Lat: {latitude || '-'}</span>
                                <span>Lng: {longitude || '-'}</span>
                                <span>
                                    Akurasi: {accuracyValue ?? '-'}
                                    {accuracyValue !== null ? 'm' : ''}
                                </span>
                            </div>
                        </details>
                    )}
                </div>
            </div>
        </section>
    );
}

function LocationMetric({
    icon,
    label,
    value,
    hint,
    tone = 'neutral',
}: {
    icon: ReactNode;
    label: string;
    value: string;
    hint?: string;
    tone?: 'neutral' | 'success' | 'error';
}) {
    const cardTone =
        tone === 'success'
            ? 'border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-500/15 dark:bg-emerald-500/[0.06]'
            : tone === 'error'
              ? 'border-rose-200/80 bg-rose-50/80 dark:border-rose-500/15 dark:bg-rose-500/[0.06]'
              : 'border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.04]';

    return (
        <div className={cn('rounded-2xl border p-4 shadow-sm', cardTone)}>
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-slate-500 uppercase dark:text-white/50">
                <span
                    className={cn(
                        tone === 'success'
                            ? 'text-emerald-600 dark:text-emerald-300'
                            : tone === 'error'
                              ? 'text-rose-600 dark:text-rose-300'
                              : 'text-slate-500 dark:text-white/70',
                    )}
                >
                    {icon}
                </span>
                {label}
            </div>
            <p
                className={cn(
                    'mt-2 text-sm font-semibold',
                    tone === 'success'
                        ? 'text-emerald-700 dark:text-emerald-100'
                        : tone === 'error'
                          ? 'text-rose-700 dark:text-rose-100'
                          : 'text-slate-900 dark:text-white',
                )}
            >
                {value}
            </p>
            {hint && (
                <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                    {hint}
                </p>
            )}
        </div>
    );
}

function InfoAccordion({
    gamification,
    socialProof,
}: {
    gamification: PageProps['gamification'];
    socialProof: PageProps['socialProof'];
}) {
    const rewardsEmpty =
        gamification.xpGained === 0 &&
        gamification.currentStreak === 0 &&
        gamification.totalPoints === 0 &&
        gamification.achievements.length === 0;
    const activityEmpty =
        socialProof.totalStudents === 0 &&
        socialProof.attendedCount === 0 &&
        socialProof.recentAttendees.length === 0 &&
        socialProof.leaderboard.length === 0;

    return (
        <section className={cn(GLASS_CARD, 'overflow-hidden p-0')}>
            <Accordion type="single" collapsible className="px-5 sm:px-6">
                <AccordionItem value="info" className="border-none">
                    <AccordionTrigger className="py-5 text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg dark:bg-white/10">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-500 uppercase dark:text-white/50">
                                    Collapsible Info
                                </p>
                                <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                                    Reward, aktivitas, dan keamanan
                                </h2>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                        <Tabs defaultValue="rewards" className="w-full">
                            <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
                                <TabsTrigger
                                    value="rewards"
                                    className="gap-2 rounded-xl py-2.5"
                                >
                                    <Trophy className="h-4 w-4" />
                                    Rewards
                                </TabsTrigger>
                                <TabsTrigger
                                    value="activity"
                                    className="gap-2 rounded-xl py-2.5"
                                >
                                    <Users className="h-4 w-4" />
                                    Aktivitas
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="gap-2 rounded-xl py-2.5"
                                >
                                    <Fingerprint className="h-4 w-4" />
                                    Keamanan
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="rewards" className="mt-4">
                                {rewardsEmpty ? (
                                    <EmptyState
                                        icon={Trophy}
                                        title="Belum ada pencapaian"
                                        description="Mulai absen secara rutin untuk membuka reward, streak, dan bonus XP pertama Anda."
                                    />
                                ) : (
                                    <RewardPreview
                                        xpGained={gamification.xpGained}
                                        currentStreak={
                                            gamification.currentStreak
                                        }
                                        leaderboardPosition={
                                            gamification.leaderboardPosition
                                        }
                                        totalPoints={gamification.totalPoints}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="activity" className="mt-4">
                                {activityEmpty ? (
                                    <EmptyState
                                        icon={Users}
                                        title="Belum ada data kehadiran"
                                        description="Aktivitas teman sekelas akan muncul di sini setelah ada absensi yang tercatat pada sesi aktif."
                                    />
                                ) : (
                                    <SocialProof
                                        totalStudents={
                                            socialProof.totalStudents
                                        }
                                        attendedCount={
                                            socialProof.attendedCount
                                        }
                                        isFirstAttendee={
                                            socialProof.isFirstAttendee
                                        }
                                        recentAttendees={
                                            socialProof.recentAttendees
                                        }
                                        leaderboard={socialProof.leaderboard}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent
                                value="security"
                                className="mt-4 space-y-4"
                            >
                                <NotificationManager />
                                <BiometricSetup />
                            </TabsContent>
                        </Tabs>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
}

function StickySubmitFooter({
    submitSuccess,
    isOfflineDraft,
    submitMessage,
    progressSteps,
    progressCount,
    processing,
    canSubmit,
    consentAccepted,
    missingInfo,
    onReset,
}: {
    submitSuccess: boolean;
    isOfflineDraft: boolean;
    submitMessage: string | null;
    progressSteps: {
        qr: boolean;
        selfie: boolean;
        location: boolean;
        submit: boolean;
    };
    progressCount: number;
    processing: boolean;
    canSubmit: boolean;
    consentAccepted: boolean;
    missingInfo: string[];
    onReset: () => void;
}) {
    return (
        <div className="sticky bottom-0 z-30 rounded-t-3xl border-t border-slate-200/80 bg-white/92 px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+14px)] shadow-[0_-18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-6 sm:pt-4 sm:pb-[calc(env(safe-area-inset-bottom)+16px)] lg:px-8 dark:border-white/10 dark:bg-neutral-950/88">
            <div className="mx-auto w-full max-w-none">
                {submitSuccess ? (
                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800">
                            <div className="flex items-center gap-2 font-semibold">
                                <CheckCircle2 className="h-4 w-4" />
                                {isOfflineDraft
                                    ? 'Draft offline berhasil disimpan'
                                    : 'Absensi berhasil dikirim'}
                            </div>
                            <p className="mt-1 text-xs text-emerald-700/90">
                                {submitMessage ||
                                    'Data absensi sudah tercatat. Kamu bisa mulai sesi lain jika diperlukan.'}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onReset}
                            className="h-11 w-full rounded-full md:h-12 md:w-auto"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Mulai sesi baru
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
                        <div>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-700 sm:gap-2 sm:text-sm dark:text-slate-200">
                                <ProgressDot
                                    done={progressSteps.qr}
                                    label="QR"
                                />
                                <ProgressDot
                                    done={progressSteps.selfie}
                                    label="Selfie"
                                />
                                <ProgressDot
                                    done={progressSteps.location}
                                    label="Lokasi"
                                />
                                <ProgressDot
                                    done={progressSteps.submit}
                                    active={canSubmit && !submitSuccess}
                                    label="Submit"
                                />
                                <span className="ml-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] tracking-[0.18em] text-slate-500 uppercase sm:px-3 sm:text-[11px] sm:tracking-[0.22em] dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                                    {progressCount}/{FLOW_TOTAL} selesai
                                </span>
                                <span
                                    className={cn(
                                        'rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-[11px]',
                                        consentAccepted
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : 'border-amber-200 bg-amber-50 text-amber-700',
                                    )}
                                >
                                    {consentAccepted
                                        ? 'Consent aktif'
                                        : 'Consent wajib'}
                                </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                                {canSubmit
                                    ? 'Semua data siap. Tombol kirim akan menuntaskan langkah terakhir.'
                                    : missingInfo[0] ||
                                      'Lengkapi seluruh langkah sebelum mengirim absensi.'}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={!canSubmit || processing}
                            className={cn(
                                'h-12 w-full rounded-full px-6 text-sm font-semibold shadow-xl transition-all sm:h-14 sm:px-8 sm:text-base xl:w-auto',
                                canSubmit
                                    ? 'bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 text-white shadow-sky-500/25 hover:from-sky-500 hover:to-emerald-400'
                                    : 'bg-slate-200 text-slate-400 shadow-none dark:bg-white/10 dark:text-white/35',
                            )}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Kirim absensi
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProgressDot({
    done,
    label,
    active = false,
}: {
    done: boolean;
    label: string;
    active?: boolean;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
                done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : active
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55',
            )}
        >
            <span
                className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    done
                        ? 'bg-emerald-500'
                        : active
                          ? 'bg-indigo-500'
                          : 'bg-slate-300 dark:bg-white/20',
                )}
            />
            {label}
        </span>
    );
}

export default function UserAbsensi() {
    const { props } = usePage<SharedData & PageProps>();
    const {
        mahasiswa,
        geofence,
        flash,
        selfieRequired,
        gamification,
        socialProof,
        activeSession,
        activeSessions = [],
    } = props;

    const locationSampleCount = props.locationSampleCount ?? 3;

    const form = useForm({
        token: '',
        selfie: null as File | null,
        latitude: '',
        longitude: '',
        location_accuracy_m: null as number | null,
        location_captured_at: '',
        location_samples: [] as LocationSample[],
        device_info: serializeDeviceInfo(),
    });

    const [cameraPhase, setCameraPhase] = useState<CameraPhase>('idle');
    const [scanState, setScanState] = useState<ScanState>('idle');
    const [selfieState, setSelfieState] = useState<SelfieState>('idle');
    const [locationState, setLocationState] = useState<LocationState>('idle');
    const [scanMessage, setScanMessage] = useState('');
    const [selfieMessage, setSelfieMessage] = useState('');
    const [locationMessage, setLocationMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [manualToken, setManualToken] = useState('');
    const [consentAccepted, setConsentAccepted] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem('tplk004_camera_consent') === '1';
    });
    const [consentError, setConsentError] = useState<string | null>(null);
    const [cameraPermission, setCameraPermission] = useState<
        PermissionState | 'unknown'
    >('unknown');
    const [locationPermission, setLocationPermission] = useState<
        PermissionState | 'unknown'
    >('unknown');
    const [showPermissionGuide, setShowPermissionGuide] = useState(false);
    const [cameraPermissionReason, setCameraPermissionReason] = useState<
        string | null
    >(null);
    const [detectedSession, setDetectedSession] =
        useState<AttendanceSessionInfo | null>(null);
    const [manuallySelectedSessionId, setManuallySelectedSessionId] = useState<number | null>(null);
    const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
    const [scanMirrorEnabled, setScanMirrorEnabled] = useState(false);
    const [resolvingToken, setResolvingToken] = useState(false);
    const [locationCollecting, setLocationCollecting] = useState(false);
    const autoLocationTriggeredRef = useRef(false);
    const [submitSuccess, setSubmitSuccess] = useState(Boolean(flash?.success));
    const [isOfflineDraft, setIsOfflineDraft] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitMessage, setSubmitMessage] = useState<string | null>(
        flash?.success ?? null,
    );
    const [successToast, setSuccessToast] = useState<string | null>(
        flash?.success ?? null,
    );
    const [selfieCountdown, setSelfieCountdown] = useState<number | null>(null);
    const [rearFlashSupported, setRearFlashSupported] = useState(false);
    const [rearFlashEnabled, setRearFlashEnabled] = useState(false);
    const [rearFlashBusy, setRearFlashBusy] = useState(false);
    const [selfieTorchSupported, setSelfieTorchSupported] = useState(false);
    const [selfieTorchEnabled, setSelfieTorchEnabled] = useState(false);
    const [selfieFlashBusy, setSelfieFlashBusy] = useState(false);
    const [selfieScreenFlashEnabled, setSelfieScreenFlashEnabled] =
        useState(false);
    const [selfieFlashOverlayVisible, setSelfieFlashOverlayVisible] =
        useState(false);
    const [selfieMirrorEnabled, setSelfieMirrorEnabled] = useState(true);
    const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
    const [stepTimestamps, setStepTimestamps] = useState<{
        qr: string | null;
        selfie: string | null;
        location: string | null;
        submit: string | null;
    }>({
        qr: null,
        selfie: null,
        location: null,
        submit: flash?.success ? new Date().toISOString() : null,
    });

    const qrReaderDivId = `qr-reader-${useId().replace(/:/g, '-')}`;
    const progressRingId = useId().replace(/:/g, '-');
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const selfieVideoRef = useRef<HTMLVideoElement | null>(null);
    const selfieStreamRef = useRef<MediaStream | null>(null);
    const countdownIntervalRef = useRef<number | null>(null);
    const flipTimeoutRef = useRef<number | null>(null);
    const selfieFlashOverlayTimeoutRef = useRef<number | null>(null);
    const scanHandledRef = useRef(false);
    const lastPreviewAttemptRef = useRef<{
        token: string;
        at: number;
    } | null>(null);

    const accuracyThreshold = Math.min(50, geofence.radius_m);
    const sampleCount = form.data.location_samples.length;
    const accuracyValue =
        typeof form.data.location_accuracy_m === 'number'
            ? form.data.location_accuracy_m
            : null;

    const currentDistance = useMemo(() => {
        if (!form.data.latitude || !form.data.longitude) return null;
        const lat = parseFloat(form.data.latitude);
        const lng = parseFloat(form.data.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

        const radius = 6371000;
        const dLat = ((geofence.lat - lat) * Math.PI) / 180;
        const dLng = ((geofence.lng - lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
                Math.cos((geofence.lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(radius * c);
    }, [form.data.latitude, form.data.longitude, geofence.lat, geofence.lng]);

    const isInsideZone =
        currentDistance !== null && currentDistance <= geofence.radius_m;

    const tokenDone = form.data.token.trim().length > 0;
    const selfieDone = selfieRequired ? Boolean(form.data.selfie) : tokenDone;
    const samplesReady = sampleCount >= locationSampleCount;
    const accuracyOk =
        accuracyValue !== null &&
        Number.isFinite(accuracyValue) &&
        accuracyValue <= accuracyThreshold;
    const locationDone =
        samplesReady &&
        Boolean(form.data.latitude && form.data.longitude) &&
        accuracyOk &&
        isInsideZone;
    const cameraComplete = tokenDone && selfieDone;

    const progressSteps = useMemo(
        () => ({
            qr: submitSuccess || tokenDone,
            selfie: submitSuccess || (selfieRequired ? selfieDone : tokenDone),
            location: submitSuccess || locationDone,
            submit: submitSuccess,
        }),
        [locationDone, selfieDone, selfieRequired, submitSuccess, tokenDone],
    );

    const progressCount = useMemo(
        () => Object.values(progressSteps).filter(Boolean).length,
        [progressSteps],
    );

    const canSubmit =
        consentAccepted &&
        tokenDone &&
        selfieDone &&
        locationDone &&
        !submitSuccess;
    const shouldRenderCameraPermissionGuide = shouldOpenCameraPermissionGuide(
        cameraPermissionReason,
        cameraPermission,
    );

    const missingInfo = useMemo(() => {
        if (submitSuccess) return [];
        const missing: string[] = [];

        if (!consentAccepted)
            missing.push('Persetujuan kamera dan lokasi belum aktif.');
        if (!tokenDone)
            missing.push('Token QR atau token manual belum tersedia.');
        if (selfieRequired && !selfieDone)
            missing.push('Selfie belum diambil atau diunggah.');
        if (!samplesReady)
            missing.push(
                `Sampel lokasi belum lengkap (${sampleCount}/${locationSampleCount}).`,
            );
        else if (!form.data.latitude || !form.data.longitude)
            missing.push('Koordinat lokasi belum terekam.');
        else if (!accuracyOk)
            missing.push(`Akurasi GPS harus <= ${accuracyThreshold}m.`);
        else if (!isInsideZone)
            missing.push(
                `Kamu masih di luar radius absensi (${geofence.radius_m}m).`,
            );

        return missing;
    }, [
        accuracyOk,
        accuracyThreshold,
        consentAccepted,
        form.data.latitude,
        form.data.longitude,
        geofence.radius_m,
        isInsideZone,
        locationSampleCount,
        sampleCount,
        samplesReady,
        selfieDone,
        selfieRequired,
        submitSuccess,
        tokenDone,
    ]);

    const statusTitle = useMemo(() => {
        switch (cameraPhase) {
            case 'scanning':
                return 'Scan QR';
            case 'flipping':
                return 'Transisi';
            case 'selfie':
                return 'Mode Selfie';
            case 'done':
                return 'Ringkas';
            default:
                return 'Siap';
        }
    }, [cameraPhase]);

    const statusHint = useMemo(() => {
        if (cameraPhase === 'scanning')
            return (
                scanMessage ||
                'Arahkan QR ke area frame. Flash bisa dipakai bila tersedia.'
            );
        if (cameraPhase === 'flipping')
            return 'Perpindahan kamera berlangsung otomatis.';
        if (cameraPhase === 'selfie')
            return (
                selfieMessage ||
                'Wajah di tengah, mode mirror aktif, dan nyalakan flash bila perlu.'
            );
        if (cameraPhase === 'done')
            return (
                locationMessage ||
                (locationState === 'fetching'
                    ? 'Lokasi sedang diambil otomatis.'
                    : 'Lanjut ke verifikasi lokasi dan submit.')
            );
        return consentAccepted
            ? 'Mulai dari scan QR untuk membuka flow absensi.'
            : 'Aktifkan persetujuan sebelum membuka kamera.';
    }, [
        cameraPhase,
        consentAccepted,
        locationMessage,
        locationState,
        scanMessage,
        selfieMessage,
    ]);

    const phaseTitle = useMemo(() => {
        if (cameraPhase === 'scanning') return 'Scan QR berlangsung';
        if (cameraPhase === 'flipping') return 'QR valid, ganti ke selfie';
        if (cameraPhase === 'selfie') return 'Ambil selfie sekali saja';
        if (cameraPhase === 'done') return 'Capture selesai';
        return 'Satu kartu untuk seluruh kamera';
    }, [cameraPhase]);

    const phaseDescription = useMemo(() => {
        if (cameraPhase === 'scanning')
            return 'Kamera belakang aktif. Posisikan QR dosen tepat di tengah frame untuk verifikasi cepat, lalu nyalakan flash bila area kurang terang.';
        if (cameraPhase === 'flipping')
            return 'Flow berpindah otomatis ke kamera depan agar QR dan selfie terasa seperti satu aksi berurutan.';
        if (cameraPhase === 'selfie')
            return '';
        if (cameraPhase === 'done')
            return 'Token dan foto sudah siap. Lokasi akan diverifikasi sebelum tombol submit dibuka.';
        return 'UI lama yang terpisah dipecah menjadi satu viewport kamera yang lebih fokus dan minim distraksi.';
    }, [cameraPhase]);

    const announcement = useMemo(() => {
        if (submitSuccess)
            return 'Absensi berhasil direkam. Kamu bisa memulai sesi baru.';
        if (cameraPhase === 'scanning')
            return 'Kamera aktif. Arahkan ke kode QR untuk memindai.';
        if (cameraPhase === 'flipping')
            return 'Beralih ke kamera depan untuk selfie.';
        if (cameraPhase === 'selfie')
            return 'Kamera selfie aktif. Posisikan wajah dan gunakan tombol ambil foto.';
        if (cameraPhase === 'done')
            return 'Capture selesai. Menunggu verifikasi lokasi sebelum submit.';
        return 'Flow absensi siap dimulai.';
    }, [cameraPhase, submitSuccess]);

    const trackerSteps = useMemo(
        () => [
            {
                id: 'qr',
                title: 'Scan QR Code',
                completed: progressSteps.qr,
                active: !progressSteps.qr,
                timestamp: stepTimestamps.qr,
                icon: QrCode,
            },
            {
                id: 'selfie',
                title: selfieRequired ? 'Ambil Selfie' : 'Selfie Dilewati',
                completed: progressSteps.selfie,
                active: progressSteps.qr && !progressSteps.selfie,
                timestamp: stepTimestamps.selfie,
                icon: Camera,
            },
            {
                id: 'location',
                title: 'Verifikasi Lokasi',
                completed: progressSteps.location,
                active:
                    progressSteps.qr &&
                    progressSteps.selfie &&
                    !progressSteps.location,
                timestamp: stepTimestamps.location,
                icon: MapPin,
            },
            {
                id: 'submit',
                title: 'Kirim Absensi',
                completed: progressSteps.submit,
                active:
                    canSubmit &&
                    !submitSuccess &&
                    progressSteps.qr &&
                    progressSteps.selfie &&
                    progressSteps.location,
                timestamp: stepTimestamps.submit,
                icon: Send,
            },
        ],
        [
            canSubmit,
            progressSteps,
            selfieRequired,
            stepTimestamps,
            submitSuccess,
        ],
    );

    function clearSelfieFlashOverlay() {
        if (selfieFlashOverlayTimeoutRef.current) {
            window.clearTimeout(selfieFlashOverlayTimeoutRef.current);
            selfieFlashOverlayTimeoutRef.current = null;
        }
        setSelfieFlashOverlayVisible(false);
    }

    function scheduleSelfieFlashOverlayClear(delay = 180) {
        clearSelfieFlashOverlay();
        setSelfieFlashOverlayVisible(true);
        selfieFlashOverlayTimeoutRef.current = window.setTimeout(() => {
            setSelfieFlashOverlayVisible(false);
            selfieFlashOverlayTimeoutRef.current = null;
        }, delay);
    }

    function resetRearFlashState() {
        setRearFlashSupported(false);
        setRearFlashEnabled(false);
        setRearFlashBusy(false);
    }

    function resetSelfieFlashState() {
        setSelfieTorchSupported(false);
        setSelfieTorchEnabled(false);
        setSelfieFlashBusy(false);
        clearSelfieFlashOverlay();
    }

    function syncRearFlashState(scanner: Html5Qrcode | null) {
        if (!scanner) {
            resetRearFlashState();
            return false;
        }

        try {
            const capabilities = scanner.getRunningTrackCapabilities();
            const settings = scanner.getRunningTrackSettings();
            const supported = hasTorchCapability(capabilities);
            setRearFlashSupported(supported);
            setRearFlashEnabled(supported && Boolean(settings.torch));
            return supported;
        } catch {
            resetRearFlashState();
            return false;
        }
    }

    function syncSelfieFlashState(stream: MediaStream | null) {
        const track = stream?.getVideoTracks()[0] ?? null;
        if (!track) {
            resetSelfieFlashState();
            return false;
        }

        try {
            const capabilities = track.getCapabilities?.();
            const supported = hasTorchCapability(capabilities);
            setSelfieTorchSupported(supported);
            setSelfieTorchEnabled(
                supported && Boolean(track.getSettings().torch),
            );
            return supported;
        } catch {
            resetSelfieFlashState();
            return false;
        }
    }

    async function toggleRearFlash() {
        const scanner = qrScannerRef.current;
        if (
            !scanner ||
            rearFlashBusy ||
            cameraPhase !== 'scanning' ||
            !rearFlashSupported
        ) {
            return;
        }

        setRearFlashBusy(true);

        try {
            const nextEnabled = !rearFlashEnabled;
            await scanner.applyVideoConstraints(
                createTorchConstraints(nextEnabled),
            );
            syncRearFlashState(scanner);
            toast.success(
                nextEnabled
                    ? 'Flash kamera belakang aktif.'
                    : 'Flash kamera belakang dimatikan.',
            );
        } catch {
            resetRearFlashState();
            toast.error(
                'Flash kamera belakang tidak didukung oleh browser atau perangkat ini.',
            );
        } finally {
            setRearFlashBusy(false);
        }
    }

    async function toggleSelfieFlash() {
        if (selfieFlashBusy || cameraPhase !== 'selfie') return;

        if (!selfieTorchSupported) {
            const nextEnabled = !selfieScreenFlashEnabled;
            setSelfieScreenFlashEnabled(nextEnabled);
            toast.success(
                nextEnabled
                    ? 'Flash layar selfie aktif.'
                    : 'Flash layar selfie dimatikan.',
            );
            return;
        }

        const track = selfieStreamRef.current?.getVideoTracks()[0];
        if (!track) return;

        setSelfieFlashBusy(true);

        try {
            const nextEnabled = !selfieTorchEnabled;
            await track.applyConstraints(createTorchConstraints(nextEnabled));
            syncSelfieFlashState(selfieStreamRef.current);
            toast.success(
                nextEnabled ? 'Flash selfie aktif.' : 'Flash selfie dimatikan.',
            );
        } catch {
            resetSelfieFlashState();
            toast.error(
                'Flash selfie tidak didukung oleh browser atau perangkat ini.',
            );
        } finally {
            setSelfieFlashBusy(false);
        }
    }

    function triggerHaptic(type: 'light' | 'medium' | 'heavy') {
        if (!('vibrate' in navigator)) return;
        const patterns = {
            light: [10],
            medium: [18],
            heavy: [24, 12, 24],
        };
        navigator.vibrate(patterns[type]);
    }

    function getCameraErrorMessage(error: unknown) {
        if (!error || typeof error !== 'object') {
            return ERROR_MESSAGES.CAMERA_GENERIC;
        }

        const rawMessage =
            'message' in error && typeof error.message === 'string'
                ? error.message.toLowerCase()
                : '';
        const name = (error as DOMException).name || 'Unknown';
        if (name === 'NotAllowedError') return `${ERROR_MESSAGES.CAMERA_DENIED} (Err: ${name} - ${rawMessage})`;
        if (name === 'NotFoundError') return `${ERROR_MESSAGES.CAMERA_NOT_FOUND} (Err: ${name} - ${rawMessage})`;
        if (name === 'NotReadableError') return `${ERROR_MESSAGES.CAMERA_IN_USE} (Err: ${name} - ${rawMessage})`;
        if (name === 'OverconstrainedError')
            return `Perangkat tidak mendukung konfigurasi kamera yang diminta. (Err: ${name} - ${rawMessage})`;
        if (name === 'AbortError')
            return `Akses kamera terputus sebelum proses selesai. (Err: ${name} - ${rawMessage})`;
        if (
            rawMessage.includes('permission') ||
            rawMessage.includes('notallowed') ||
            rawMessage.includes('denied')
        ) {
            return `${ERROR_MESSAGES.CAMERA_DENIED} (Err: ${name} - ${rawMessage})`;
        }
        if (
            rawMessage.includes('notfound') ||
            rawMessage.includes('requested device not found') ||
            rawMessage.includes('no camera') ||
            rawMessage.includes('camera not found')
        ) {
            return `${ERROR_MESSAGES.CAMERA_NOT_FOUND} (Err: ${name} - ${rawMessage})`;
        }
        if (
            rawMessage.includes('notreadable') ||
            rawMessage.includes('track start error') ||
            rawMessage.includes('device in use') ||
            rawMessage.includes('could not start video source')
        ) {
            return `${ERROR_MESSAGES.CAMERA_IN_USE} (Err: ${name} - ${rawMessage})`;
        }
        if (
            rawMessage.includes('secure context') ||
            rawMessage.includes('https')
        ) {
            return `Akses kamera membutuhkan koneksi HTTPS yang aman. (Err: ${name} - ${rawMessage})`;
        }
        
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const httpsHint = !isHttps && window.location.hostname !== 'localhost' ? ' Akses kamera memerlukan koneksi HTTPS.' : '';

        return `Gagal mengakses kamera (${name}). Pastikan izin diberikan di browser dan OS.${httpsHint}`;
    }

    function getLocationErrorMessage(error: GeolocationPositionError | null) {
        if (!error) return ERROR_MESSAGES.LOCATION_DENIED;
        if (error.code === error.PERMISSION_DENIED)
            return ERROR_MESSAGES.LOCATION_DENIED;
        if (error.code === error.TIMEOUT)
            return ERROR_MESSAGES.LOCATION_TIMEOUT;
        if (error.code === error.POSITION_UNAVAILABLE) {
            return 'Lokasi tidak tersedia. Pastikan GPS perangkat aktif.';
        }
        return 'Gagal mengambil izin lokasi dari browser.';
    }

    async function checkCameraPermission(options?: { probe?: boolean }): Promise<{
        granted: boolean;
        error?: string;
    }> {
        const probe = options?.probe ?? true;
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraPermission('denied');
            return {
                granted: false,
                error: ERROR_MESSAGES.CAMERA_UNSUPPORTED,
            };
        }

        if (
            typeof window !== 'undefined' &&
            window.location.protocol !== 'https:' &&
            window.location.hostname !== 'localhost'
        ) {
            return {
                granted: false,
                error: 'Akses kamera membutuhkan koneksi HTTPS yang aman.',
            };
        }

        if (cameraPermission === 'granted') {
            return { granted: true };
        }

        if (cameraPermission === 'denied') {
            return {
                granted: false,
                error: ERROR_MESSAGES.CAMERA_DENIED,
            };
        }

        if (navigator.permissions?.query) {
            try {
                const result = await navigator.permissions.query({
                    name: 'camera' as PermissionName,
                });
                setCameraPermission(result.state);

                if (result.state === 'denied') {
                    return {
                        granted: false,
                        error: ERROR_MESSAGES.CAMERA_DENIED,
                    };
                }

                if (result.state === 'granted') {
                    return { granted: true };
                }
            } catch {
                setCameraPermission('unknown');
            }
        }

        if (!probe) {
            return { granted: true };
        }

        try {
            const testStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            testStream.getTracks().forEach((track) => {
                track.stop();
                track.enabled = false;
            });
            setCameraPermission('granted');

            return { granted: true };
        } catch (error) {
            const message = getCameraErrorMessage(error);
            if ((error as DOMException)?.name === 'NotAllowedError') {
                setCameraPermission('denied');
            }
            return { granted: false, error: message };
        }
    }

    async function requestLocationPermissionPrompt(): Promise<{
        granted: boolean;
        error?: string;
    }> {
        if (!navigator.geolocation) {
            setLocationPermission('denied');
            return {
                granted: false,
                error: 'Browser ini belum mendukung akses lokasi.',
            };
        }

        if (locationPermission === 'granted') {
            return { granted: true };
        }

        if (locationPermission === 'denied') {
            return {
                granted: false,
                error: ERROR_MESSAGES.LOCATION_DENIED,
            };
        }

        if (navigator.permissions?.query) {
            try {
                const result = await navigator.permissions.query({
                    name: 'geolocation' as PermissionName,
                });
                setLocationPermission(result.state);

                if (result.state === 'granted') {
                    return { granted: true };
                }

                if (result.state === 'denied') {
                    return {
                        granted: false,
                        error: ERROR_MESSAGES.LOCATION_DENIED,
                    };
                }
            } catch {
                setLocationPermission('unknown');
            }
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setLocationPermission('granted');
                    resolve({ granted: true });
                },
                (error) => {
                    const message = getLocationErrorMessage(error);
                    if (error.code === error.PERMISSION_DENIED) {
                        setLocationPermission('denied');
                    }
                    resolve({
                        granted: false,
                        error: message,
                    });
                },
                {
                    enableHighAccuracy: false,
                    timeout: 8000,
                    maximumAge: 60000,
                },
            );
        });
    }

    async function requestConsentPermissions() {
        const cameraResult = await checkCameraPermission();
        const locationResult = await requestLocationPermissionPrompt();

        const errors = [cameraResult.error, locationResult.error].filter(
            Boolean,
        ) as string[];

        if (cameraResult.granted && locationResult.granted) {
            setConsentError(null);
            setCameraPermissionReason(null);
            setShowPermissionGuide(false);
            toast.success('Izin kamera dan lokasi siap digunakan.');
            return;
        }

        if (!cameraResult.granted) {
            setCameraPermissionReason(
                cameraResult.error || ERROR_MESSAGES.CAMERA_GENERIC,
            );
            setShowPermissionGuide(true);
        }

        setConsentError(
            errors[0] ||
                'Browser belum memberikan semua izin yang dibutuhkan untuk absensi.',
        );
    }

    async function resolveScannerCamera(): Promise<{
        source: string | { facingMode: 'environment' | 'user' };
        label: string;
    }> {
        try {
            const cameras = await Html5Qrcode.getCameras();

            if (cameras.length === 0) {
                return {
                    source: { facingMode: 'environment' },
                    label: 'Kamera default',
                };
            }

            setAvailableCameras(cameras);

            if (selectedCameraId) {
                const selected = cameras.find(c => c.id === selectedCameraId);
                if (selected) {
                    setScanMirrorEnabled(isFrontCameraLabel(selected.label));
                    return {
                        source: selected.id,
                        label: selected.label || 'Kamera terpilih',
                    };
                }
            }

            const normalized = cameras.map((camera) => ({
                ...camera,
                normalizedLabel: camera.label.toLowerCase(),
            }));

            const preferred =
                normalized.find((camera) =>
                    /(back|rear|environment)/i.test(camera.normalizedLabel),
                ) ??
                normalized.find((camera) =>
                    /(front|user|face|webcam|camera)/i.test(
                        camera.normalizedLabel,
                    ),
                ) ??
                normalized[0];

            setSelectedCameraId(preferred.id);
            setScanMirrorEnabled(isFrontCameraLabel(preferred.label));

            return {
                source: preferred.id,
                label: preferred.label || 'Kamera perangkat',
            };
        } catch {
            return {
                source: { facingMode: 'environment' },
                label: 'Kamera default',
            };
        }
    }

    function releaseSelfieStream() {
        const track = selfieStreamRef.current?.getVideoTracks()[0];
        if (track && selfieTorchEnabled) {
            void track
                .applyConstraints(createTorchConstraints(false))
                .catch(() => {});
        }

        if (selfieStreamRef.current) {
            selfieStreamRef.current.getTracks().forEach((streamTrack) => {
                streamTrack.stop();
            });
            selfieStreamRef.current = null;
        }

        if (selfieVideoRef.current) {
            selfieVideoRef.current.srcObject = null;
        }

        resetSelfieFlashState();
    }

    function stopSelfieStream() {
        if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        setSelfieCountdown(null);
        releaseSelfieStream();
    }

    async function switchCamera() {
        if (availableCameras.length <= 1) {
            toast.error('Perangkat ini hanya memiliki satu kamera.', { id: 'single-camera-alert' });
            return;
        }

        const currentIndex = availableCameras.findIndex(c => c.id === selectedCameraId);
        const nextIndex = (currentIndex + 1) % availableCameras.length;
        const nextCamera = availableCameras[nextIndex];
        
        setSelectedCameraId(nextCamera.id);
        setScanMirrorEnabled(isFrontCameraLabel(nextCamera.label));
        
        setScanMessage('Mengganti kamera...');
        await stopScanEvent();
        
        setCameraPhase('flipping');
        setTimeout(() => setCameraPhase('scanning'), 150);
    }

    async function stopScan() {
        const scanner = qrScannerRef.current;
        qrScannerRef.current = null;

        if (!scanner) {
            resetRearFlashState();
            return;
        }

        try {
            if (rearFlashEnabled) {
                await scanner.applyVideoConstraints(
                    createTorchConstraints(false),
                );
            }
        } catch (error) {
            void error;
        }

        try {
            if (scanner.isScanning) {
                await scanner.stop();
            }
        } catch (error) {
            void error;
        }

        try {
            await scanner.clear();
        } catch (error) {
            void error;
        }

        resetRearFlashState();
    }

    function clearLocationData() {
        form.setData('latitude', '');
        form.setData('longitude', '');
        form.setData('location_accuracy_m', null);
        form.setData('location_captured_at', '');
        form.setData('location_samples', []);
        setLocationState('idle');
        setLocationMessage('');
        setLocationCollecting(false);
        autoLocationTriggeredRef.current = false;
        setStepTimestamps((current) => ({
            ...current,
            location: null,
            submit: null,
        }));
    }

    function clearSelfieData() {
        form.setData('selfie', null);
        revokeObjectUrl(previewUrl);
        setPreviewUrl(null);
        setSelfieState('idle');
        setSelfieMessage('');
        stopSelfieStream();
        setStepTimestamps((current) => ({
            ...current,
            selfie: null,
            location: null,
            submit: null,
        }));
    }

    function clearSubmitFeedback() {
        setSubmitSuccess(false);
        setIsOfflineDraft(false);
        setSubmitMessage(null);
        setSubmitError(null);
        setSuccessToast(null);
        setShowSuccessCelebration(false);
    }

    function resetForNewFlow() {
        clearSubmitFeedback();
        setCameraPhase('idle');
        setScanState('idle');
        setScanMessage('');
        setSelfieState('idle');
        setSelfieMessage('');
        setConsentError(null);
        setCameraPermissionReason(null);
        setShowPermissionGuide(false);
        setManualToken('');
        setDetectedSession(null);
        setResolvingToken(false);
        lastPreviewAttemptRef.current = null;
        scanHandledRef.current = false;
        setStepTimestamps({
            qr: null,
            selfie: null,
            location: null,
            submit: null,
        });
        form.setData('token', '');
        clearSelfieData();
        clearLocationData();
        void stopScan();
    }

    function resetAttendance() {
        resetForNewFlow();
        form.reset();
        form.setData('device_info', serializeDeviceInfo());
    }

    async function startScanning() {
        if (!consentAccepted) {
            setConsentError(
                'Setujui persetujuan penggunaan kamera dan lokasi terlebih dahulu.',
            );
            toast.error('Aktifkan persetujuan sebelum memulai.', { id: 'permission-consent-error' });
            return;
        }

        const permissionCheck = await checkCameraPermission({ probe: false });
        if (!permissionCheck.granted) {
            setScanState('error');
            setScanMessage(
                permissionCheck.error || ERROR_MESSAGES.CAMERA_GENERIC,
            );
            setCameraPermissionReason(
                permissionCheck.error || ERROR_MESSAGES.CAMERA_GENERIC,
            );
            setShowPermissionGuide(true);
            toast.error(permissionCheck.error || ERROR_MESSAGES.CAMERA_GENERIC, { id: 'camera-init-error' });
            return;
        }

        await stopScan();
        stopSelfieStream();
        await wait(500);
        resetForNewFlow();
        setCameraPhase('scanning');
        setScanState('scanning');
        setScanMessage('Menyalakan kamera belakang...');
        setCameraPermissionReason(null);
        setShowPermissionGuide(false);
        triggerHaptic('light');
    }

    async function cancelScanning() {
        await stopScan();
        setCameraPhase('idle');
        setScanState('idle');
        setScanMessage('');
        scanHandledRef.current = false;
    }

    async function startSelfieCamera() {
        const permissionCheck = await checkCameraPermission({ probe: false });
        if (!permissionCheck.granted) {
            setSelfieState('error');
            setSelfieMessage(
                permissionCheck.error || ERROR_MESSAGES.CAMERA_GENERIC,
            );
            setCameraPermissionReason(
                permissionCheck.error || ERROR_MESSAGES.CAMERA_GENERIC,
            );
            setShowPermissionGuide(true);
            toast.error(permissionCheck.error || ERROR_MESSAGES.CAMERA_GENERIC, { id: 'camera-init-error' });
            return;
        }

        await stopScan();
        stopSelfieStream();
        await wait(500);
        setSelfieState('ready');
        setSelfieMessage('Menyalakan kamera depan...');
        setSelfieMirrorEnabled(true);

        try {
            const stream = await getUserMediaWithRetry(
                {
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: false,
                },
                1,
            );

            selfieStreamRef.current = stream;
            const torchSupported = syncSelfieFlashState(stream);

            const attachStream = async (attempt = 0) => {
                const video = selfieVideoRef.current;
                if (!video) {
                    if (attempt < 10) {
                        window.setTimeout(() => {
                            void attachStream(attempt + 1);
                        }, 60);
                    }
                    return;
                }

                video.srcObject = stream;
                try {
                    await video.play();
                    setSelfieState('ready');
                    setSelfieMessage(
                        torchSupported
                            ? 'Posisikan wajah di dalam oval, lalu tap tombol shutter. Flash bisa dinyalakan bila perlu.'
                            : 'Posisikan wajah di dalam oval, lalu tap tombol shutter. Gunakan flash layar bila cahaya kurang.',
                    );
                    setCameraPermissionReason(null);
                    setShowPermissionGuide(false);
                } catch {
                    setSelfieState('error');
                    setSelfieMessage(ERROR_MESSAGES.CAMERA_PLAYBACK);
                }
            };

            void attachStream();
        } catch (error) {
            const message = getCameraErrorMessage(error);
            if ((error as DOMException)?.name === 'NotAllowedError') {
                setCameraPermission('denied');
            }
            setSelfieState('error');
            setSelfieMessage(message);
            setCameraPermissionReason(message);
            setShowPermissionGuide(true);
            toast.error(message, { id: 'camera-init-error' });
        }
    }

    async function transitionToSelfie(message: string) {
        await stopScan();
        if (flipTimeoutRef.current) {
            window.clearTimeout(flipTimeoutRef.current);
        }

        setCameraPhase('flipping');
        setScanMessage(message);
        triggerHaptic('medium');

        const reducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        flipTimeoutRef.current = window.setTimeout(
            () => {
                setCameraPhase('selfie');
                void startSelfieCamera();
            },
            reducedMotion ? 0 : CAMERA_FLIP_MS,
        );
    }

    async function previewTokenSession(token: string) {
        const normalized = token.trim().toUpperCase();
        setResolvingToken(true);

        try {
            const response = await axios.post<{
                session: AttendanceSessionInfo;
            }>('/user/absen/preview-token', {
                token: normalized,
            });

            const session = response.data.session;
            if (manuallySelectedSessionId && session.id !== manuallySelectedSessionId) {
                setDetectedSession(null);
                throw new Error(`QR tidak sesuai! Ini QR untuk ${formatSessionPrimaryLabel(session)}, tapi Anda memilih matkul lain.`);
            }

            setDetectedSession(session);
            return session;
        } catch (error) {
            const fallbackMessage =
                'QR terdeteksi tetapi sesi absensi belum bisa dikenali.';

            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data as
                    | {
                          message?: string;
                          session?: AttendanceSessionInfo;
                      }
                    | undefined;
                const message =
                    typeof responseData?.message === 'string'
                        ? responseData.message
                        : fallbackMessage;
                const session = responseData?.session;

                setDetectedSession(session ?? null);
                throw new Error(message);
            }

            setDetectedSession(null);
            throw new Error(fallbackMessage);
        } finally {
            setResolvingToken(false);
        }
    }

    async function handleTokenDetected(token: string) {
        const normalized = token.trim().toUpperCase();
        const now = Date.now();
        if (
            lastPreviewAttemptRef.current?.token === normalized &&
            now - lastPreviewAttemptRef.current.at < 1800
        ) {
            scanHandledRef.current = false;
            return;
        }

        lastPreviewAttemptRef.current = { token: normalized, at: now };

        try {
            const session = await previewTokenSession(normalized);
            form.setData('token', normalized);
            setManualToken(normalized);
            setScanState('success');
            setScanMessage(
                `QR valid untuk ${formatSessionPrimaryLabel(session)}.`,
            );
            setSubmitError(null);
            clearLocationData();
            clearSelfieData();
            setStepTimestamps((current) => ({
                ...current,
                qr: current.qr ?? new Date().toISOString(),
                selfie:
                    !selfieRequired && !current.selfie
                        ? new Date().toISOString()
                        : current.selfie,
            }));
            triggerHaptic('heavy');
            toast.success(
                `${formatSessionPrimaryLabel(session)} siap diproses.`,
            );

            if (selfieRequired) {
                await transitionToSelfie(
                    `QR valid untuk ${session.courseName}. Kamera depan akan aktif sebentar lagi.`,
                );
                return;
            }

            setSelfieState('captured');
            setSelfieMessage('Selfie tidak diwajibkan untuk sesi ini.');
            setCameraPhase('done');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : ERROR_MESSAGES.QR_SCAN_FAILED;
            form.setData('token', '');
            setScanState('error');
            setScanMessage(message);
            setSubmitError(null);
            scanHandledRef.current = false;
            toast.error(message);
        }
    }

    function handleManualTokenChange(value: string) {
        setManualToken(value.toUpperCase());
        setDetectedSession(null);
        setSubmitError(null);
    }

    async function applyManualToken() {
        const normalized = manualToken.trim().toUpperCase();
        if (!normalized) {
            setScanState('error');
            setScanMessage('Masukkan token manual terlebih dahulu.');
            toast.error('Token manual belum diisi.');
            return;
        }

        await stopScan();
        try {
            const session = await previewTokenSession(normalized);
            form.setData('token', normalized);
            setScanState('success');
            setScanMessage(
                `Token manual cocok untuk ${formatSessionPrimaryLabel(session)}.`,
            );
            setSubmitError(null);
            clearLocationData();
            clearSelfieData();
            scanHandledRef.current = true;
            setStepTimestamps((current) => ({
                ...current,
                qr: current.qr ?? new Date().toISOString(),
                selfie:
                    !selfieRequired && !current.selfie
                        ? new Date().toISOString()
                        : current.selfie,
            }));

            if (selfieRequired) {
                await transitionToSelfie(
                    `Token cocok untuk ${session.courseName}. Beralih ke kamera selfie.`,
                );
                return;
            }

            setSelfieState('captured');
            setSelfieMessage('Selfie tidak diwajibkan untuk sesi ini.');
            setCameraPhase('done');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Token manual belum bisa digunakan.';
            form.setData('token', '');
            setScanState('error');
            setScanMessage(message);
            setSubmitError(null);
            scanHandledRef.current = false;
            toast.error(message);
        }
    }

    async function captureSelfie() {
        const video = selfieVideoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight) {
            setSelfieState('error');
            setSelfieMessage('Kamera belum siap mengambil foto.');
            return;
        }

        setSelfieState('capturing');
        const useScreenFlash =
            !selfieTorchSupported && selfieScreenFlashEnabled;

        if (useScreenFlash) {
            scheduleSelfieFlashOverlayClear(240);
            await wait(90);
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');

        if (!context) {
            setSelfieState('error');
            setSelfieMessage('Gagal menyiapkan kanvas foto.');
            return;
        }

        if (selfieMirrorEnabled) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
        });

        if (!blob) {
            setSelfieState('error');
            setSelfieMessage('Gagal menyimpan hasil foto.');
            return;
        }

        const file = new File(
            [blob],
            `selfie-${mahasiswa.nim}-${Date.now()}.jpg`,
            { type: 'image/jpeg' },
        );

        form.setData('selfie', file);
        revokeObjectUrl(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        setSelfieState('captured');
        setSelfieMessage('Selfie berhasil disimpan.');
        setCameraPhase('done');
        stopSelfieStream();
        setStepTimestamps((current) => ({
            ...current,
            selfie: current.selfie ?? new Date().toISOString(),
        }));
        triggerHaptic('medium');
        toast.success('Selfie berhasil disimpan.');
    }

    function startSelfieCountdown() {
        if (selfieState === 'capturing') return;
        void captureSelfie();
    }

    async function retakeSelfie() {
        if (!tokenDone) {
            setCameraPhase('idle');
            return;
        }

        clearSelfieData();
        clearLocationData();
        setCameraPhase('selfie');
        await startSelfieCamera();
    }

    function handleSelfieFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        form.setData('selfie', file);

        revokeObjectUrl(previewUrl);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);

        if (file) {
            setSelfieState('captured');
            setSelfieMessage('Selfie manual berhasil dipilih.');
            setCameraPhase('done');
            clearLocationData();
            setStepTimestamps((current) => ({
                ...current,
                selfie: current.selfie ?? new Date().toISOString(),
            }));
            toast.success('Selfie manual berhasil dipilih.');
        } else {
            setSelfieState('idle');
            setSelfieMessage('');
        }
    }

    function getLocationSample() {
        return new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0,
            });
        });
    }

    function pickBestSample(samples: LocationSample[]) {
        return samples.reduce((best, sample) => {
            if (!best) return sample;
            if (sample.accuracy_m < best.accuracy_m) return sample;
            if (
                sample.accuracy_m === best.accuracy_m &&
                Date.parse(sample.captured_at) > Date.parse(best.captured_at)
            ) {
                return sample;
            }
            return best;
        }, samples[0]);
    }

    async function requestLocation() {
        if (!consentAccepted) {
            setConsentError(
                'Setujui persetujuan penggunaan lokasi sebelum mengambil GPS.',
            );
            setLocationState('error');
            setLocationMessage('Persetujuan lokasi belum aktif.');
            return;
        }

        if (!navigator.geolocation) {
            setLocationState('error');
            setLocationMessage('GPS tidak didukung di browser ini.');
            return;
        }

        if (locationPermission === 'denied') {
            setLocationState('error');
            setLocationMessage(ERROR_MESSAGES.LOCATION_DENIED);
            return;
        }

        if (locationCollecting) return;

        setLocationCollecting(true);
        setLocationState('fetching');
        form.setData('location_samples', []);
        form.setData('latitude', '');
        form.setData('longitude', '');
        form.setData('location_accuracy_m', null);
        form.setData('location_captured_at', '');
        setLocationMessage(`Mengambil lokasi (1/${locationSampleCount})...`);

        const samples: LocationSample[] = [];

        for (let index = 0; index < locationSampleCount; index += 1) {
            try {
                const position = await getLocationSample();
                samples.push({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy_m: Math.round(position.coords.accuracy),
                    captured_at: new Date(position.timestamp).toISOString(),
                });

                if (index < locationSampleCount - 1) {
                    setLocationMessage(
                        `Mengambil lokasi (${index + 2}/${locationSampleCount})...`,
                    );
                    await wait(700);
                }
            } catch (error) {
                const geoError = error as GeolocationPositionError;
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    setLocationPermission('denied');
                    setLocationMessage(ERROR_MESSAGES.LOCATION_DENIED);
                } else if (geoError.code === geoError.TIMEOUT) {
                    setLocationMessage(ERROR_MESSAGES.LOCATION_TIMEOUT);
                } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
                    setLocationMessage(
                        'Lokasi tidak tersedia. Pastikan GPS perangkat aktif.',
                    );
                } else {
                    setLocationMessage('Gagal mengambil lokasi.');
                }

                setLocationState('error');
                setLocationCollecting(false);
                toast.error('Gagal mengambil lokasi.');
                return;
            }
        }

        setLocationCollecting(false);

        const bestSample = pickBestSample(samples);
        form.setData('location_samples', samples);
        form.setData('latitude', bestSample.latitude.toString());
        form.setData('longitude', bestSample.longitude.toString());
        form.setData('location_accuracy_m', bestSample.accuracy_m);
        form.setData('location_captured_at', bestSample.captured_at);

        if (bestSample.accuracy_m > accuracyThreshold) {
            setLocationState('error');
            setLocationMessage(
                `Akurasi GPS terlalu rendah (${bestSample.accuracy_m}m). Coba ulangi.`,
            );
            toast.error('Akurasi GPS belum cukup.');
            return;
        }

        const distance = (() => {
            const radius = 6371000;
            const dLat = ((geofence.lat - bestSample.latitude) * Math.PI) / 180;
            const dLng =
                ((geofence.lng - bestSample.longitude) * Math.PI) / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((bestSample.latitude * Math.PI) / 180) *
                    Math.cos((geofence.lat * Math.PI) / 180) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return Math.round(radius * c);
        })();

        if (distance > geofence.radius_m) {
            setLocationState('error');
            setLocationMessage(
                `Lokasi terdeteksi ${distance}m dari pusat zona. Maksimal ${geofence.radius_m}m.`,
            );
            toast.error(ERROR_MESSAGES.LOCATION_OUTSIDE_ZONE);
            return;
        }

        setLocationState('success');
        setLocationMessage(
            `Dalam zona absensi. Jarak ${distance}m dari pusat dengan akurasi ${bestSample.accuracy_m}m.`,
        );
        setStepTimestamps((current) => ({
            ...current,
            location: current.location ?? new Date().toISOString(),
        }));
        toast.success('Lokasi berhasil diverifikasi.');
    }

    function fileToBase64(file: File) {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!canSubmit || submitSuccess) return;

        setSubmitError(null);

        if (!navigator.onLine) {
            try {
                await OfflineStorage.saveAttendance({
                    token: form.data.token,
                    latitude: Number(form.data.latitude),
                    longitude: Number(form.data.longitude),
                    location_accuracy_m: form.data.location_accuracy_m ?? 0,
                    location_captured_at: form.data.location_captured_at || new Date().toISOString(),
                    location_samples: form.data.location_samples,
                    device_info: form.data.device_info,
                    selfieBlob: form.data.selfie || null,
                    client_timestamp: new Date().toISOString(),
                    sessionLabel: formatSessionPrimaryLabel(activeSession || detectedSession!)
                });

                stopSelfieStream();
                await stopScan();
                setSubmitSuccess(true);
                setIsOfflineDraft(true);
                setSubmitMessage(
                    'Absen disimpan sebagai draft offline dan akan otomatis dikirim saat koneksi kembali stabil.',
                );
                setStepTimestamps((current) => ({
                    ...current,
                    submit: current.submit ?? new Date().toISOString(),
                }));
                setShowSuccessCelebration(true);
                toast.success('Absensi disimpan sebagai draft offline.');
            } catch {
                setSubmitError(ERROR_MESSAGES.SUBMIT_FAILED);
                toast.error('Gagal menyimpan draft offline.');
            }
            return;
        }

        form.post('/user/absen', {
            forceFormData: true,
            onSuccess: () => {
                stopSelfieStream();
                void stopScan();
                setSubmitSuccess(true);
                setIsOfflineDraft(false);
                setSubmitError(null);
                setSubmitMessage('Data absensi berhasil dikirim.');
                setStepTimestamps((current) => ({
                    ...current,
                    submit: current.submit ?? new Date().toISOString(),
                }));
                setShowSuccessCelebration(true);
                toast.success('Absensi berhasil dikirim.');
            },
            onError: async (errors) => {
                const errorMessages = Object.values(errors);

                if (errorMessages.length === 0) {
                    try {
                        await OfflineStorage.saveAttendance({
                            token: form.data.token,
                            latitude: Number(form.data.latitude),
                            longitude: Number(form.data.longitude),
                            location_accuracy_m: form.data.location_accuracy_m ?? 0,
                            location_captured_at: form.data.location_captured_at || new Date().toISOString(),
                            location_samples: form.data.location_samples,
                            device_info: form.data.device_info,
                            selfieBlob: form.data.selfie || null,
                            client_timestamp: new Date().toISOString(),
                            sessionLabel: formatSessionPrimaryLabel(activeSession || detectedSession!)
                        });

                        stopSelfieStream();
                        await stopScan();
                        setSubmitSuccess(true);
                        setIsOfflineDraft(true);
                        setSubmitError(null);
                        setSubmitMessage(
                            'Koneksi terputus saat submit. Data disimpan offline untuk sinkronisasi otomatis.',
                        );
                        setStepTimestamps((current) => ({
                            ...current,
                            submit: current.submit ?? new Date().toISOString(),
                        }));
                        setShowSuccessCelebration(true);
                        toast.success('Absensi disimpan offline.');
                    } catch {
                        setSubmitError(ERROR_MESSAGES.SUBMIT_FAILED);
                        toast.error(
                            'Gagal mengirim data dan gagal menyimpan offline.',
                        );
                    }
                    return;
                }

                const firstError = String(errorMessages[0]);
                setSubmitError(firstError);
                toast.error(firstError);
            },
        });
    }

    const handleTokenDetectedEvent = useEffectEvent(
        async (decodedText: string) => {
            await handleTokenDetected(decodedText);
        },
    );

    const requestLocationEvent = useEffectEvent(async () => {
        await requestLocation();
    });

    const stopScanEvent = useEffectEvent(async () => {
        await stopScan();
    });

    const releaseSelfieStreamEvent = useEffectEvent(() => {
        releaseSelfieStream();
    });

    const syncRearFlashStateEvent = useEffectEvent(
        (scanner: Html5Qrcode | null) => syncRearFlashState(scanner),
    );

    useEffect(() => {
        if (!navigator.permissions?.query) return;

        let cameraResult: PermissionStatus | null = null;
        let locationResult: PermissionStatus | null = null;

        const bindPermissions = async () => {
            try {
                locationResult = await navigator.permissions.query({
                    name: 'geolocation' as PermissionName,
                });
                setLocationPermission(locationResult.state);
                locationResult.onchange = () =>
                    setLocationPermission(locationResult?.state ?? 'unknown');
            } catch {
                setLocationPermission('unknown');
            }

            try {
                cameraResult = await navigator.permissions.query({
                    name: 'camera' as PermissionName,
                });
                setCameraPermission(cameraResult.state);
                cameraResult.onchange = () =>
                    setCameraPermission(cameraResult?.state ?? 'unknown');
            } catch {
                setCameraPermission('unknown');
            }
        };

        void bindPermissions();

        return () => {
            if (cameraResult) cameraResult.onchange = null;
            if (locationResult) locationResult.onchange = null;
        };
    }, []);

    useEffect(() => {
        if (!successToast) return;
        const timeout = window.setTimeout(() => setSuccessToast(null), 4200);
        return () => window.clearTimeout(timeout);
    }, [successToast]);

    useEffect(() => {
        if (showPermissionGuide && !shouldRenderCameraPermissionGuide) {
            setShowPermissionGuide(false);
        }
    }, [showPermissionGuide, shouldRenderCameraPermissionGuide]);

    useEffect(() => {
        return () => {
            if (countdownIntervalRef.current) {
                window.clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            if (flipTimeoutRef.current) {
                window.clearTimeout(flipTimeoutRef.current);
                flipTimeoutRef.current = null;
            }
            if (selfieFlashOverlayTimeoutRef.current) {
                window.clearTimeout(selfieFlashOverlayTimeoutRef.current);
                selfieFlashOverlayTimeoutRef.current = null;
            }
            void stopScanEvent();
            releaseSelfieStreamEvent();
            revokeObjectUrl(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        if (cameraPhase !== 'scanning') {
            void stopScanEvent();
        }

        if (cameraPhase !== 'selfie') {
            releaseSelfieStreamEvent();
        }
    }, [cameraPhase]);

    useEffect(() => {
        if (cameraPhase !== 'scanning') return;

        let cancelled = false;

        const startScanner = async () => {
            let lastError: unknown = null;
            for (let attempt = 0; attempt < 2; attempt += 1) {
                let scanner: Html5Qrcode | null = null;
                try {
                    scanHandledRef.current = false;
                    setScanState('scanning');
                    setScanMessage('Menyalakan kamera belakang...');
                    await stopScanEvent();
                    await wait(400); // Wait for release

                    scanner = new Html5Qrcode(qrReaderDivId);
                    qrScannerRef.current = scanner;
                    const scannerCamera = await resolveScannerCamera();

                    await scanner.start(
                        scannerCamera.source,
                        {
                            fps: 12,
                            qrbox: { width: 300, height: 300 },
                            disableFlip: false,
                        },
                        async (decodedText) => {
                            if (cancelled || scanHandledRef.current) return;
                            scanHandledRef.current = true;
                            await handleTokenDetectedEvent(decodedText);
                        },
                        () => {},
                    );

                    const flashSupported = syncRearFlashStateEvent(scanner);

                    if (cancelled) {
                        await stopScanEvent();
                        return;
                    }

                    setScanMessage(
                        `${scannerCamera.label} aktif. Arahkan QR ke dalam frame${flashSupported ? ' atau nyalakan flash bila gelap' : ''}.`,
                    );
                    return;
                } catch (error) {
                    lastError = error;
                    if (cancelled) return;
                    if (scanner) {
                        try {
                            if (scanner.isScanning) {
                                await scanner.stop();
                            }
                        } catch {
                            void 0;
                        }
                        try {
                            await scanner.clear();
                        } catch {
                            void 0;
                        }
                    }

                    if (!isRetryableCameraError(error) || attempt === 1) {
                        break;
                    }
                    await wait(CAMERA_RETRY_DELAY_MS);
                }
            }

            if (cancelled) return;
            const message = getCameraErrorMessage(lastError);
            if ((lastError as DOMException)?.name === 'NotAllowedError') {
                setCameraPermission('denied');
            }
            setScanState('error');
            setScanMessage(message);
            setCameraPermissionReason(message);
            setShowPermissionGuide(true);
            setCameraPhase('idle');
            toast.error(message, { id: 'camera-init-error' });
        };

        const timer = window.setTimeout(() => {
            void startScanner();
        }, 40);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
            void stopScanEvent();
        };
    }, [cameraPhase, qrReaderDivId]);

    useEffect(() => {
        if (
            !consentAccepted ||
            !cameraComplete ||
            locationDone ||
            locationCollecting ||
            autoLocationTriggeredRef.current
        ) {
            return;
        }

        autoLocationTriggeredRef.current = true;
        void requestLocationEvent();
    }, [cameraComplete, consentAccepted, locationCollecting, locationDone]);

    async function handleConsentChange(checked: boolean) {
        if (!checked) {
            resetForNewFlow();
            setConsentAccepted(false);
            setConsentError(null);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem('tplk004_camera_consent', '0');
            }
            return;
        }

        setConsentAccepted(checked);
        setConsentError(null);
        setCameraPermissionReason(null);
        setShowPermissionGuide(false);

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(
                'tplk004_camera_consent',
                checked ? '1' : '0',
            );
        }

        await requestConsentPermissions();
    }

    return (
        <StudentLayout>
            <Head title="Absensi" />

            <div className="w-full space-y-4 p-4 pt-6 pb-32 md:space-y-6 md:p-6 md:pt-8 md:pb-36 lg:p-8 lg:pt-8 lg:pb-40">
                <PendingSyncList />
                
                <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                >
                    {announcement}
                </div>

                <AnimatePresence>
                    {successToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.96 }}
                            className="fixed top-4 right-4 z-50 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-2xl"
                        >
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-emerald-500/12 p-2 text-emerald-600">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-emerald-900">
                                        Absensi berhasil
                                    </p>
                                    <p className="mt-1 text-sm text-emerald-700">
                                        {successToast}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    <SuccessCelebration
                        open={showSuccessCelebration}
                        offlineDraft={isOfflineDraft}
                        xpGained={gamification.xpGained}
                        currentStreak={gamification.currentStreak}
                        onComplete={() => setShowSuccessCelebration(false)}
                    />
                </AnimatePresence>

                <AbsensiHeader
                    mahasiswa={mahasiswa}
                    activeSession={activeSession}
                    activeSessions={activeSessions}
                    detectedSession={detectedSession}
                    consentAccepted={consentAccepted}
                    consentError={consentError}
                    cameraPermission={cameraPermission}
                    locationPermission={locationPermission}
                    onConsentChange={handleConsentChange}
                    manuallySelectedSessionId={manuallySelectedSessionId}
                />

                <CameraPermissionGuide
                    open={
                        showPermissionGuide && shouldRenderCameraPermissionGuide
                    }
                    reason={cameraPermissionReason ?? undefined}
                    onClose={() => setShowPermissionGuide(false)}
                />

                <SessionContextCard
                    activeSessions={activeSessions}
                    detectedSession={detectedSession}
                    resolvingToken={resolvingToken}
                    manuallySelectedSessionId={manuallySelectedSessionId}
                    onSelectSession={setManuallySelectedSessionId}
                />

                <form onSubmit={submit} className="space-y-4 md:space-y-6">
                    <div className="grid gap-4 md:gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.9fr)]">
                        <div className="space-y-4 sm:space-y-6">
                            <UnifiedCameraCard
                                cameraPhase={cameraPhase}
                                progressCount={progressCount}
                                total={FLOW_TOTAL}
                                statusTitle={statusTitle}
                                statusHint={statusHint}
                                phaseTitle={phaseTitle}
                                phaseDescription={phaseDescription}
                                idSuffix={progressRingId}
                                qrReaderDivId={qrReaderDivId}
                                selfieVideoRef={selfieVideoRef}
                                consentAccepted={consentAccepted}
                                currentToken={form.data.token}
                                manualToken={manualToken}
                                previewUrl={previewUrl}
                                selfieRequired={selfieRequired}
                                scanState={scanState}
                                scanMessage={scanMessage}
                                selfieState={selfieState}
                                selfieMessage={selfieMessage}
                                selfieCountdown={selfieCountdown}
                                locationState={locationState}
                                locationMessage={locationMessage}
                                tokenError={form.errors.token}
                                selfieError={form.errors.selfie}
                                cameraPermission={cameraPermission}
                                rearFlashSupported={rearFlashSupported}
                                rearFlashEnabled={rearFlashEnabled}
                                rearFlashBusy={rearFlashBusy}
                                scanMirrorEnabled={scanMirrorEnabled}
                                onToggleScanMirror={() =>
                                    setScanMirrorEnabled((prev: boolean) => !prev)
                                }
                                selfieTorchSupported={selfieTorchSupported}
                                selfieFlashEnabled={
                                    selfieTorchSupported
                                        ? selfieTorchEnabled
                                        : selfieScreenFlashEnabled
                                }
                                selfieFlashBusy={selfieFlashBusy}
                                selfieFlashOverlayVisible={
                                    selfieFlashOverlayVisible
                                }
                                selfieMirrorEnabled={selfieMirrorEnabled}
                                onToggleSelfieMirror={() =>
                                    setSelfieMirrorEnabled(
                                        (prev: boolean) => !prev,
                                    )
                                }
                                onManualTokenChange={handleManualTokenChange}
                                onApplyManualToken={applyManualToken}
                                onStartScanning={() => {
                                    void startScanning();
                                }}
                                onCancelScanning={() => {
                                    void cancelScanning();
                                }}
                                onToggleRearFlash={() => {
                                    void toggleRearFlash();
                                }}
                                onSwitchCamera={() => {
                                    void switchCamera();
                                }}
                                canSwitchCamera={true}
                                onRetryFlow={() => {
                                    resetForNewFlow();
                                }}
                                onRetrySelfieCamera={() => {
                                    void startSelfieCamera();
                                }}
                                onToggleSelfieFlash={() => {
                                    void toggleSelfieFlash();
                                }}
                                onStartSelfieCountdown={startSelfieCountdown}
                                onRetakeSelfie={() => {
                                    void retakeSelfie();
                                }}
                                onSelfieFileChange={handleSelfieFileChange}
                            />

                            {submitError && !submitSuccess && (
                                <section
                                    className={cn(
                                        GLASS_CARD,
                                        'overflow-hidden p-0',
                                    )}
                                >
                                    <div className="flex items-start gap-4 p-5 sm:p-6">
                                        <div className="rounded-2xl bg-rose-500/12 p-3 text-rose-600">
                                            <AlertCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-950 dark:text-white">
                                                Submit gagal
                                            </p>
                                            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                                {submitError}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <RealTimeProgressTracker
                                progressCount={progressCount}
                                totalSteps={FLOW_TOTAL}
                                consentAccepted={consentAccepted}
                                steps={trackerSteps}
                                idSuffix={progressRingId}
                            />

                            <LocationStatusCard
                                locationState={locationState}
                                locationMessage={locationMessage}
                                locationCollecting={locationCollecting}
                                sampleCount={sampleCount}
                                locationSampleCount={locationSampleCount}
                                latitude={form.data.latitude}
                                longitude={form.data.longitude}
                                accuracyValue={accuracyValue}
                                accuracyThreshold={accuracyThreshold}
                                currentDistance={currentDistance}
                                isInsideZone={isInsideZone}
                                onRetry={() => {
                                    void requestLocation();
                                }}
                                disabled={!cameraComplete}
                                locationPermission={locationPermission}
                            />

                            {(form.errors.location_samples ||
                                form.errors.latitude ||
                                form.errors.longitude ||
                                form.errors.location_accuracy_m) && (
                                <div className="rounded-3xl border border-rose-200 bg-rose-50/90 p-4 shadow-xl">
                                    <InputError
                                        message={form.errors.location_samples}
                                    />
                                    <InputError
                                        message={form.errors.latitude}
                                        className="mt-1"
                                    />
                                    <InputError
                                        message={form.errors.longitude}
                                        className="mt-1"
                                    />
                                    <InputError
                                        message={
                                            form.errors.location_accuracy_m
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            <NetworkDiagnosticsTool />

                            <InfoAccordion
                                gamification={gamification}
                                socialProof={{
                                    ...socialProof,
                                    attendedCount: submitSuccess
                                        ? socialProof.attendedCount + 1
                                        : socialProof.attendedCount,
                                }}
                            />
                        </div>
                    </div>

                    {submitSuccess && (
                        <section
                            className={cn(GLASS_CARD, 'overflow-hidden p-0')}
                        >
                            <div className="p-5 sm:p-6">
                                <div
                                    className={cn(
                                        'rounded-[28px] border p-5 sm:p-6',
                                        isOfflineDraft
                                            ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
                                            : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50',
                                    )}
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={cn(
                                                    'rounded-2xl p-3 shadow-sm',
                                                    isOfflineDraft
                                                        ? 'bg-amber-500/12 text-amber-600'
                                                        : 'bg-emerald-500/12 text-emerald-600',
                                                )}
                                            >
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-500 uppercase">
                                                    Attendance Saved
                                                </p>
                                                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                                                    {isOfflineDraft
                                                        ? 'Draft offline tersimpan'
                                                        : 'Absensi berhasil dikirim'}
                                                </h2>
                                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                                                    {submitMessage ||
                                                        (isOfflineDraft
                                                            ? 'Data akan otomatis disinkronkan saat koneksi internet kembali stabil.'
                                                            : 'Semua langkah selesai dan data kehadiran sudah tersimpan.')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetAttendance}
                                            className="rounded-full"
                                        >
                                            <RefreshCcw className="mr-2 h-4 w-4" />
                                            Mulai sesi baru
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <GamificationRewards
                                        xpGained={gamification.xpGained}
                                        currentStreak={
                                            gamification.currentStreak
                                        }
                                        achievements={gamification.achievements}
                                        leaderboardPosition={
                                            gamification.leaderboardPosition
                                        }
                                        comboMultiplier={
                                            gamification.comboMultiplier
                                        }
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    <StickySubmitFooter
                        submitSuccess={submitSuccess}
                        isOfflineDraft={isOfflineDraft}
                        submitMessage={submitMessage}
                        progressSteps={{
                            qr: progressSteps.qr,
                            selfie: progressSteps.selfie,
                            location: progressSteps.location,
                            submit: progressSteps.submit,
                        }}
                        progressCount={progressCount}
                        processing={form.processing}
                        canSubmit={canSubmit}
                        consentAccepted={consentAccepted}
                        missingInfo={missingInfo}
                        onReset={resetAttendance}
                    />
                </form>
            </div>
        </StudentLayout>
    );
}
