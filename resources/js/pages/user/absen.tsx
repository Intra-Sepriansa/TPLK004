import qrStepIcon from '@/assets/admin/qr-builder/qr-icon.png';
import submitStepIcon from '@/assets/admin/rekap-kehadiran/total-scan.png';
import selfieStepIcon from '@/assets/admin/verifikasi-selfie/verifikasi-selfie.png';
import locationStepIcon from '@/assets/admin/zona/icon-zona.png';
import absenIcon from '@/assets/dosen/sesi-absen/sesi-absen.png';
import { BiometricSetup } from '@/components/attendance/BiometricSetup';
import { GamificationRewards } from '@/components/attendance/GamificationRewards';
import { NotificationManager } from '@/components/attendance/NotificationManager';
import { OfflineIndicator } from '@/components/attendance/OfflineIndicator';
import { SocialProof } from '@/components/attendance/SocialProof';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeAnimated } from '@/components/ui/qr-code-animated';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { captureDeviceInfo } from '@/utils/deviceCapture';
import { Head, useForm, usePage } from '@inertiajs/react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import {
    AlertCircle,
    Camera,
    ChevronRight,
    CheckCircle2,
    Loader2,
    MapPin,
    Navigation,
    QrCode,
    RefreshCcw,
    Shield,
    Sparkles,
    Wifi,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import {
    type ChangeEvent,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
    user?: { name?: string } | null;
};
type GeofenceInfo = { lat: number; lng: number; radius_m: number };
type LocationSample = {
    latitude: number;
    longitude: number;
    accuracy_m: number;
    captured_at: string;
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
    activeSession: {
        courseName: string;
        meetingNumber: number;
        title: string | null;
        startAt: string;
        endAt: string;
    } | null;
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};

// Step indicator component - Glassmorphism Style
function StepIndicator({
    steps,
    currentStep,
}: {
    steps: { key: string; label: string; done: boolean; icon: LucideIcon }[];
    currentStep: number;
}) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mx-auto w-full max-w-4xl overflow-hidden"
        >
            <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max min-w-full items-center gap-2 px-1 sm:justify-center">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = index === currentStep && !step.done;

                        return (
                            <motion.div
                                key={step.key}
                                variants={itemVariants}
                                className="flex shrink-0 items-center gap-2"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={cn(
                                        'flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm',
                                        step.done
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                            : isActive
                                                ? 'border-indigo-400 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                                                : 'border-white/20 bg-white/20 text-neutral-500 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300',
                                    )}
                                >
                                    {step.done ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                                    <span className="whitespace-nowrap">{step.label}</span>
                                </motion.div>
                                {index < steps.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
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
        device_info: '',
    });

    const [locationStatus, setLocationStatus] = useState('');
    const [locationCollecting, setLocationCollecting] = useState(false);
    const [autoLocationTriggered, setAutoLocationTriggered] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    const [scanResult, setScanResult] = useState<'success' | 'error' | null>(
        null,
    );
    const [qrLoopIndex, setQrLoopIndex] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scanAvailable, setScanAvailable] = useState(false);
    const [selfieActive, setSelfieActive] = useState(false);
    const [selfieAvailable, setSelfieAvailable] = useState(false);
    const [selfieStatus, setSelfieStatus] = useState('');
    const [successToast, setSuccessToast] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [consentError, setConsentError] = useState<string | null>(null);
    const [cameraPermission, setCameraPermission] = useState<
        PermissionState | 'unknown'
    >('unknown');
    const [locationPermission, setLocationPermission] = useState<
        PermissionState | 'unknown'
    >('unknown');

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const qrReaderDivId = `qr-reader-${useId().replace(/:/g, '-')}`;
    const intervalRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const selfieVideoRef = useRef<HTMLVideoElement | null>(null);
    const selfieStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        form.setData('device_info', JSON.stringify(captureDeviceInfo()));
        // html5-qrcode is always available
        setScanAvailable(true);
        setSelfieAvailable(Boolean(navigator.mediaDevices?.getUserMedia));
        console.log('🔍 Scan available:', true);
        console.log(
            '🔍 Selfie available:',
            Boolean(navigator.mediaDevices?.getUserMedia),
        );
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = window.localStorage.getItem('tplk004_camera_consent');
        if (stored === '1') setConsentAccepted(true);
    }, []);

    useEffect(() => {
        if (!navigator.permissions?.query) return;
        navigator.permissions
            .query({ name: 'geolocation' as PermissionName })
            .then((result) => {
                setLocationPermission(result.state);
                result.onchange = () => setLocationPermission(result.state);
            })
            .catch(() => setLocationPermission('unknown'));
        navigator.permissions
            .query({ name: 'camera' as PermissionName })
            .then((result) => {
                setCameraPermission(result.state);
                result.onchange = () => setCameraPermission(result.state);
            })
            .catch(() => setCameraPermission('unknown'));
    }, []);

    useEffect(() => {
        if (!flash?.success) return;
        setSuccessToast(flash.success);
        setSubmitMessage(flash.success);
        setSubmitSuccess(true);
        const timer = window.setTimeout(() => setSuccessToast(null), 4500);
        return () => window.clearTimeout(timer);
    }, [flash?.success]);

    useEffect(() => {
        if (!scanResult) return;
        if (scanResult === 'success') {
            confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.65 },
                colors: ['#10b981', '#14b8a6', '#34d399', '#ffffff'],
            });
        }
        const timer = window.setTimeout(
            () => setScanResult(null),
            scanResult === 'success' ? 1500 : 1200,
        );
        return () => window.clearTimeout(timer);
    }, [scanResult]);

    useEffect(() => {
        if (!submitSuccess) return;
        confetti({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.7 },
            colors: ['#4f46e5', '#9333ea', '#ec4899', '#10b981'],
        });
    }, [submitSuccess]);

    async function stopScan() {
        console.log('Stopping QR scanner...');
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (qrScannerRef.current) {
            try {
                const state = await qrScannerRef.current.getState();
                console.log('Scanner state:', state);
                if (state === 2) {
                    // 2 = SCANNING
                    console.log('Stopping scanner...');
                    await qrScannerRef.current.stop();
                    console.log('Scanner stopped');
                }
            } catch (error) {
                console.error('Error stopping scanner:', error);
                // Ignore errors when stopping
            }
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
    }

    function getCameraErrorMessage(error: unknown) {
        if (!error || typeof error !== 'object')
            return 'Gagal mengakses kamera.';
        const name = (error as DOMException).name;
        if (name === 'NotAllowedError')
            return 'Izin kamera ditolak. Aktifkan akses kamera di browser.';
        if (name === 'NotFoundError')
            return 'Kamera tidak ditemukan di perangkat ini.';
        if (name === 'NotReadableError')
            return 'Kamera sedang digunakan aplikasi lain.';
        if (name === 'OverconstrainedError')
            return 'Perangkat tidak mendukung mode kamera yang diminta.';
        return 'Gagal mengakses kamera.';
    }

    function stopSelfie() {
        if (selfieStreamRef.current) {
            selfieStreamRef.current
                .getTracks()
                .forEach((track) => track.stop());
            selfieStreamRef.current = null;
        }
        if (selfieVideoRef.current) selfieVideoRef.current.srcObject = null;
        setSelfieActive(false);
    }

    // QR Scanner effect - using html5-qrcode
    useEffect(() => {
        if (!scanning) {
            stopScan();
            return;
        }
        if (!consentAccepted) {
            setConsentError('Setujui persetujuan kamera sebelum memulai.');
            setScanStatus('Setujui penggunaan kamera terlebih dulu.');
            setScanning(false);
            return;
        }
        if (cameraPermission === 'denied') {
            setScanStatus(
                'Izin kamera ditolak. Aktifkan akses kamera di browser.',
            );
            setScanning(false);
            return;
        }

        const start = async () => {
            try {
                setScanStatus('Menyalakan kamera...');
                console.log('Starting QR scanner...');

                // Initialize Html5Qrcode if not already initialized
                if (!qrScannerRef.current) {
                    console.log(
                        'Initializing Html5Qrcode with ID:',
                        qrReaderDivId,
                    );
                    qrScannerRef.current = new Html5Qrcode(qrReaderDivId);
                }

                const qrScanner = qrScannerRef.current;

                // Check if already scanning
                if (qrScanner.isScanning) {
                    console.log('Scanner already running');
                    setScanStatus('Arahkan kamera ke QR code...');
                    return;
                }

                console.log('Starting camera...');
                // Start scanning
                await qrScanner.start(
                    { facingMode: 'environment' }, // Use back camera
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        // QR code detected
                        console.log('QR detected:', decodedText);
                        setScanStatus('QR terbaca!');
                        setScanResult('success');
                        form.setData('token', decodedText);
                        setScanning(false);
                    },
                    () => {
                        // Scanning error (can be ignored, happens frequently during scanning)
                    },
                );

                console.log('Camera started successfully');
                setScanStatus('Arahkan kamera ke QR code...');
            } catch (error) {
                console.error('QR Scanner error:', error);
                const message = getCameraErrorMessage(error);
                if ((error as DOMException)?.name === 'NotAllowedError') {
                    setCameraPermission('denied');
                }
                setScanStatus(message);
                setScanResult('error');
                setScanning(false);
            }
        };
        start();
        return () => {
            void stopScan();
        };
    }, [cameraPermission, consentAccepted, scanning]);

    useEffect(() => {
        return () => stopSelfie();
    }, []);
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const attachSelfieStream = async () => {
        const video = selfieVideoRef.current;
        const stream = selfieStreamRef.current;
        if (!video || !stream) return;
        if (video.srcObject !== stream) video.srcObject = stream;
        try {
            await video.play();
        } catch {
            setSelfieStatus('Gagal menampilkan kamera. Coba ulangi.');
        }
    };

    useEffect(() => {
        if (!consentAccepted) {
            stopScan();
            setScanning(false);
            stopSelfie();
            setSelfieStatus('');
            setScanStatus('');
        }
    }, [consentAccepted]);

    const startSelfie = async () => {
        if (!consentAccepted) {
            setConsentError('Setujui persetujuan kamera sebelum memulai.');
            setSelfieStatus('Setujui penggunaan kamera terlebih dulu.');
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            setSelfieStatus('Kamera tidak didukung di perangkat ini.');
            return;
        }
        if (cameraPermission === 'denied') {
            setSelfieStatus(
                'Izin kamera ditolak. Aktifkan akses kamera di browser.',
            );
            return;
        }
        setSelfieStatus('Menyalakan kamera depan...');
        stopSelfie();
        stopScan();
        setScanning(false);
        setSelfieActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
            });
            selfieStreamRef.current = stream;
            const waitForVideo = () => {
                if (!selfieStreamRef.current) return;
                if (!selfieVideoRef.current) {
                    window.requestAnimationFrame(waitForVideo);
                    return;
                }
                void attachSelfieStream();
            };
            waitForVideo();
            setSelfieStatus('Kamera siap. Ambil foto.');
        } catch (error) {
            const message = getCameraErrorMessage(error);
            if ((error as DOMException)?.name === 'NotAllowedError')
                setCameraPermission('denied');
            setSelfieStatus(message);
            setSelfieActive(false);
        }
    };

    const captureSelfie = async () => {
        if (!selfieVideoRef.current) return;
        const video = selfieVideoRef.current;
        if (!video.videoWidth || !video.videoHeight) {
            setSelfieStatus('Kamera belum siap.');
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            setSelfieStatus('Gagal mengambil foto.');
            return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.9),
        );
        if (!blob) {
            setSelfieStatus('Gagal mengambil foto.');
            return;
        }
        const file = new File(
            [blob],
            `selfie-${mahasiswa.nim}-${Date.now()}.jpg`,
            { type: blob.type },
        );
        form.setData('selfie', file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        setSelfieStatus('Foto tersimpan!');
        stopSelfie();
    };

    const getLocationSample = () =>
        new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0,
            });
        });

    const pickBestSample = (samples: LocationSample[]) =>
        samples.reduce((best, sample) => {
            if (!best) return sample;
            if (sample.accuracy_m < best.accuracy_m) return sample;
            if (
                sample.accuracy_m === best.accuracy_m &&
                Date.parse(sample.captured_at) > Date.parse(best.captured_at)
            )
                return sample;
            return best;
        }, samples[0]);

    // Calculate distance from geofence center (Haversine formula)
    const calculateDistance = (
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number,
    ): number => {
        const R = 6371000; // Earth's radius in meters
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get current distance from geofence
    const currentDistance = useMemo(() => {
        if (!form.data.latitude || !form.data.longitude) return null;
        const lat = parseFloat(form.data.latitude);
        const lng = parseFloat(form.data.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;
        return Math.round(
            calculateDistance(lat, lng, geofence.lat, geofence.lng),
        );
    }, [form.data.latitude, form.data.longitude, geofence.lat, geofence.lng]);

    const isInsideZone =
        currentDistance !== null && currentDistance <= geofence.radius_m;

    const requestLocation = async () => {
        if (!consentAccepted) {
            setConsentError('Setujui persetujuan lokasi sebelum memulai.');
            setLocationStatus('Setujui penggunaan lokasi terlebih dulu.');
            return;
        }
        if (!navigator.geolocation) {
            setLocationStatus('GPS tidak didukung browser.');
            return;
        }
        if (locationPermission === 'denied') {
            setLocationStatus(
                'Izin lokasi ditolak. Aktifkan GPS di pengaturan browser.',
            );
            return;
        }
        if (locationCollecting) return;

        setLocationCollecting(true);
        form.setData('location_samples', []);
        form.setData('latitude', '');
        form.setData('longitude', '');
        form.setData('location_accuracy_m', null);
        form.setData('location_captured_at', '');
        setLocationStatus(`Mengambil lokasi (1/${locationSampleCount})...`);
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
                    setLocationStatus(
                        `Mengambil lokasi (${index + 2}/${locationSampleCount})...`,
                    );
                    await new Promise((resolve) =>
                        window.setTimeout(resolve, 800),
                    );
                }
            } catch (error) {
                const geoError = error as GeolocationPositionError;
                if (geoError.code === geoError.PERMISSION_DENIED)
                    setLocationStatus(
                        'Izin lokasi ditolak. Aktifkan GPS di browser.',
                    );
                else if (geoError.code === geoError.TIMEOUT)
                    setLocationStatus(
                        'Waktu pengambilan lokasi habis. Coba ulangi.',
                    );
                else if (geoError.code === geoError.POSITION_UNAVAILABLE)
                    setLocationStatus(
                        'Lokasi tidak tersedia. Pastikan GPS aktif.',
                    );
                else setLocationStatus('Gagal mengambil lokasi.');
                setLocationCollecting(false);
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
            setLocationStatus(
                `Akurasi GPS terlalu rendah (${bestSample.accuracy_m}m). Coba ulangi.`,
            );
        } else {
            // Calculate distance from geofence
            const dist = Math.round(
                calculateDistance(
                    bestSample.latitude,
                    bestSample.longitude,
                    geofence.lat,
                    geofence.lng,
                ),
            );
            if (dist <= geofence.radius_m) {
                setLocationStatus(
                    `✓ Dalam zona! Jarak: ${dist}m dari titik pusat (maks ${geofence.radius_m}m)`,
                );
            } else {
                setLocationStatus(
                    `⚠ Di luar zona! Jarak: ${dist}m dari titik pusat (maks ${geofence.radius_m}m)`,
                );
            }
        }
    };

    const handleSelfieChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('selfie', file);
        if (file) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const resetAttendance = () => {
        form.reset();
        form.setData('device_info', JSON.stringify(captureDeviceInfo()));
        stopSelfie();
        stopScan();
        setScanning(false);
        setLocationCollecting(false);
        setAutoLocationTriggered(false);
        setSelfieStatus('');
        setScanStatus('');
        setLocationStatus('');
        setConsentError(null);
        setPreviewUrl(null);
        setSubmitSuccess(false);
        setSubmitMessage(null);
        setSuccessToast(null);
        setSubmitError(null);
        setScanResult(null);
        setQrLoopIndex(0);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!submitReady || submitSuccess) return;
        setSubmitError(null);
        form.post('/user/absen', {
            forceFormData: true,
            onSuccess: () => {
                stopSelfie();
                setSelfieStatus('');
                stopScan();
                setScanning(false);
                setSubmitSuccess(true);
                setSubmitError(null);
            },
            onError: (errors) => {
                // Get the first error message to display
                const errorMessages = Object.values(errors);
                const firstError =
                    errorMessages.length > 0
                        ? String(errorMessages[0])
                        : 'Gagal mengirim absensi. Coba lagi.';
                setSubmitError(firstError);
                if (
                    firstError.toLowerCase().includes('token') ||
                    firstError.toLowerCase().includes('qr')
                ) {
                    setScanResult('error');
                }
            },
        });
    };

    // Computed values
    const tokenDone = form.data.token.trim().length > 0;
    const selfieDone = selfieRequired ? Boolean(form.data.selfie) : tokenDone;
    const accuracyThreshold = Math.min(50, geofence.radius_m);
    const sampleCount = form.data.location_samples.length;
    const samplesReady = sampleCount >= locationSampleCount;
    const accuracyValue =
        typeof form.data.location_accuracy_m === 'number'
            ? form.data.location_accuracy_m
            : null;
    const accuracyOk =
        accuracyValue !== null &&
        Number.isFinite(accuracyValue) &&
        accuracyValue <= accuracyThreshold;
    const locationDone =
        samplesReady &&
        Boolean(form.data.latitude && form.data.longitude) &&
        accuracyOk;
    const submitReady = tokenDone && selfieDone && locationDone;
    const canSubmit = submitReady && !submitSuccess;

    const step1Locked = submitSuccess;
    const step2Locked = submitSuccess || !tokenDone;
    const step3Locked = submitSuccess || !tokenDone || !selfieDone;

    const flowSteps = [
        { key: 'scan', label: 'Scan QR', done: tokenDone, icon: QrCode },
        { key: 'selfie', label: 'Selfie', done: selfieDone, icon: Camera },
        { key: 'location', label: 'Lokasi', done: locationDone, icon: MapPin },
        { key: 'submit', label: 'Kirim', done: submitSuccess, icon: Zap },
    ];

    const currentStep = submitSuccess
        ? 3
        : locationDone
            ? 3
            : selfieDone
                ? 2
                : tokenDone
                    ? 1
                    : 0;
    const missingInfo = useMemo(() => {
        if (submitSuccess) return [];
        const missing: string[] = [];
        if (!tokenDone) missing.push('Token belum diisi');
        if (selfieRequired && !selfieDone) missing.push('Selfie belum diambil');
        if (!samplesReady)
            missing.push(
                `Sampel lokasi belum lengkap (${sampleCount}/${locationSampleCount})`,
            );
        else if (!form.data.latitude || !form.data.longitude)
            missing.push('Lokasi belum diambil');
        else if (!accuracyOk)
            missing.push(`Akurasi GPS belum cukup (<= ${accuracyThreshold}m)`);
        return missing;
    }, [
        accuracyOk,
        accuracyThreshold,
        form.data.latitude,
        form.data.longitude,
        locationSampleCount,
        sampleCount,
        samplesReady,
        selfieDone,
        selfieRequired,
        submitSuccess,
        tokenDone,
    ]);

    useEffect(() => {
        if (
            step3Locked ||
            locationDone ||
            locationCollecting ||
            autoLocationTriggered ||
            !consentAccepted
        )
            return;
        setAutoLocationTriggered(true);
        void requestLocation();
    }, [
        step3Locked,
        locationDone,
        locationCollecting,
        autoLocationTriggered,
        consentAccepted,
    ]);

    return (
        <StudentLayout>
            <Head title="Absensi" />
            <OfflineIndicator />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* Success Toast */}
                <AnimatePresence>
                    {successToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                            }}
                            className="fixed top-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-xl backdrop-blur dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    delay: 0.2,
                                }}
                            >
                                <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500" />
                            </motion.div>
                            <div>
                                <p className="font-semibold">
                                    Absensi Berhasil!
                                </p>
                                <p className="text-xs text-emerald-700/70 dark:text-emerald-100/80">
                                    {successToast}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ HEADER — Admin Dashboard Match ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
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

                    {/* Background Accents */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    className="relative flex h-16 w-16 shrink-0 items-center justify-center p-1 sm:h-20 sm:w-20"
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
                                        src={absenIcon}
                                        alt="Absensi"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                    />
                                </motion.div>
                                <div className="mt-2 flex-1 sm:mt-1">
                                    <motion.p
                                        className="text-xs font-medium tracking-wide text-indigo-100 sm:text-sm"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Absensi Mahasiswa
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Scan QR Code
                                    </motion.h1>
                                    <motion.p
                                        className="mt-1 max-w-lg text-[11px] leading-relaxed text-indigo-100 sm:mt-2 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Scan QR code untuk mencatat kehadiran
                                        Anda.
                                    </motion.p>
                                    <motion.p
                                        className="mt-2 text-xs text-indigo-100/90 sm:text-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.55 }}
                                    >
                                        {mahasiswa.user?.name || mahasiswa.nama}{' '}
                                        • NIM: {mahasiswa.nim}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Active Session Badge */}
                            {activeSession ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-5 py-3 shadow-lg backdrop-blur-xl sm:w-auto sm:px-6"
                                >
                                    <div className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/20 p-2">
                                        <div className="relative z-10 m-2 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                    </div>
                                    <div className="flex flex-col py-1">
                                        <p className="mb-1 max-w-[140px] truncate text-xs leading-tight font-medium text-indigo-100">
                                            {activeSession.courseName}
                                        </p>
                                        <p className="text-sm leading-none font-bold text-white">
                                            Pertemuan #
                                            {activeSession.meetingNumber}
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 backdrop-blur-xl sm:w-auto sm:justify-start lg:mt-0"
                                >
                                    <AlertCircle className="h-4 w-4 text-amber-300" />
                                    <span className="text-sm font-medium text-amber-200">
                                        Tidak ada sesi aktif
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Step Indicator - Enhanced Glassmorphism */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.005 }}
                    className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <StepIndicator
                        steps={flowSteps}
                        currentStep={currentStep}
                    />
                </motion.div>

                {/* Consent Card - ENHANCED with attention-grabbing design */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.005 }}
                    className={cn(
                        'relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40',
                        consentAccepted
                            ? 'border-emerald-200/50 dark:border-emerald-800/50'
                            : 'border-indigo-300/50 dark:border-indigo-700/50',
                    )}
                >
                    {/* Animated background pulse when not accepted */}
                    {!consentAccepted && (
                        <motion.div
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-purple-400/10"
                        />
                    )}

                    <div className="relative z-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            animate={
                                !consentAccepted
                                    ? {
                                        rotate: [0, -5, 5, -5, 0],
                                        scale: [1, 1.1, 1],
                                    }
                                    : {}
                            }
                            transition={
                                !consentAccepted
                                    ? {
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 1,
                                    }
                                    : {}
                            }
                            className={cn(
                                'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg',
                                consentAccepted
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
                            )}
                        >
                            <Shield className="h-7 w-7" />
                        </motion.div>
                        <div className="w-full flex-1">
                            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-start">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Persetujuan Privasi
                                </h2>
                                {!consentAccepted && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                        }}
                                        className="rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-semibold text-white"
                                    >
                                        Wajib
                                    </motion.span>
                                )}
                                {consentAccepted && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Disetujui
                                    </motion.span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                {consentAccepted
                                    ? 'Terima kasih! Kamu sudah dapat menggunakan kamera dan merekam lokasi.'
                                    : 'Centang kotak di bawah untuk mengaktifkan akses kamera dan merekam lokasi.'}
                            </p>
                            <motion.label
                                whileHover={{ x: 5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    'mt-4 flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-left transition-all',
                                    consentAccepted
                                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20'
                                        : 'border-indigo-200 bg-indigo-50 hover:border-indigo-400 dark:border-indigo-700 dark:bg-indigo-950/20 dark:hover:border-indigo-500',
                                )}
                            >
                                <Checkbox
                                    checked={consentAccepted}
                                    onCheckedChange={(value) => {
                                        const checked = Boolean(value);
                                        setConsentAccepted(checked);
                                        setConsentError(null);
                                        if (typeof window !== 'undefined')
                                            window.localStorage.setItem(
                                                'tplk004_camera_consent',
                                                checked ? '1' : '0',
                                            );
                                    }}
                                    className="h-5 w-5"
                                />
                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Saya setuju menggunakan kamera & lokasi
                                    untuk absensi
                                </span>
                            </motion.label>
                            <AnimatePresence>
                                {consentError && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            height: 'auto',
                                            y: 0,
                                        }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 sm:justify-start dark:border-rose-800 dark:bg-rose-950/20"
                                    >
                                        <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                                        <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                                            {consentError}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Step 1: QR Scanner */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={!step1Locked ? { scale: 1.005 } : {}}
                        className={cn(
                            'rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-8 dark:border-white/5 dark:bg-neutral-900/40',
                            step1Locked && 'pointer-events-none opacity-60',
                        )}
                    >
                        <div className="mb-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <motion.img
                                    src={qrStepIcon}
                                    alt="Icon Scan QR"
                                    whileHover={{
                                        rotate: [0, -10, 10, 0],
                                        scale: 1.1,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
                                />
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                                        Scan QR Code
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Arahkan kamera ke QR dosen atau isi
                                        token manual
                                    </p>
                                </div>
                            </div>
                            <AnimatePresence>
                                {tokenDone && (
                                    <motion.span
                                        initial={{
                                            scale: 0,
                                            opacity: 0,
                                            rotate: -120,
                                        }}
                                        animate={{
                                            scale: 1,
                                            opacity: 1,
                                            rotate: 0,
                                        }}
                                        exit={{
                                            scale: 0,
                                            opacity: 0,
                                            rotate: 120,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        }}
                                        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Selesai
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mx-auto w-full max-w-md">
                            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
                                <div
                                    id={qrReaderDivId}
                                    className={cn(
                                        'h-full w-full [&>*]:!border-none',
                                        scanning ? 'block' : 'hidden',
                                    )}
                                />

                                <AnimatePresence mode="wait">
                                    {!scanning && (
                                        <motion.div
                                            key="scanner-idle"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center text-neutral-300"
                                        >
                                            <div className="mb-4 opacity-80">
                                                <QRCodeAnimated
                                                    key={`empty-qr-placeholder-${qrLoopIndex}`}
                                                    data="TAP_TO_SCAN_WAITING"
                                                    size={120}
                                                    color="#6366f1"
                                                    onComplete={() =>
                                                        setQrLoopIndex(
                                                            (value) =>
                                                                value + 1,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <p className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-indigo-100">
                                                Klik tombol untuk mulai scan
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {scanning && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="pointer-events-none absolute inset-0"
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center p-7 sm:p-8">
                                                <div className="relative h-full max-h-[280px] w-full max-w-[280px]">
                                                    <motion.div
                                                        animate={{
                                                            opacity: [
                                                                0.5, 1, 0.5,
                                                            ],
                                                            scale: [1, 1.06, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                        }}
                                                        className="absolute top-0 left-0 h-16 w-16 rounded-tl-2xl border-t-4 border-l-4 border-emerald-500"
                                                    />
                                                    <motion.div
                                                        animate={{
                                                            opacity: [
                                                                0.5, 1, 0.5,
                                                            ],
                                                            scale: [1, 1.06, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: 0.4,
                                                        }}
                                                        className="absolute top-0 right-0 h-16 w-16 rounded-tr-2xl border-t-4 border-r-4 border-emerald-500"
                                                    />
                                                    <motion.div
                                                        animate={{
                                                            opacity: [
                                                                0.5, 1, 0.5,
                                                            ],
                                                            scale: [1, 1.06, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: 0.8,
                                                        }}
                                                        className="absolute bottom-0 left-0 h-16 w-16 rounded-bl-2xl border-b-4 border-l-4 border-emerald-500"
                                                    />
                                                    <motion.div
                                                        animate={{
                                                            opacity: [
                                                                0.5, 1, 0.5,
                                                            ],
                                                            scale: [1, 1.06, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: 1.2,
                                                        }}
                                                        className="absolute right-0 bottom-0 h-16 w-16 rounded-br-2xl border-r-4 border-b-4 border-emerald-500"
                                                    />

                                                    <motion.div
                                                        animate={{
                                                            y: [
                                                                '0%',
                                                                '100%',
                                                                '0%',
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                        }}
                                                        className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-lg shadow-emerald-500/50"
                                                    />

                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.15, 1],
                                                            opacity: [
                                                                0.35, 0.8, 0.35,
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 1.6,
                                                            repeat: Infinity,
                                                        }}
                                                        className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2"
                                                    >
                                                        <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-emerald-500" />
                                                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-emerald-500" />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            <motion.div
                                                initial={{ y: -16, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-500/95 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
                                            >
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: 'linear',
                                                    }}
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                </motion.div>
                                                <span>Scanning...</span>
                                            </motion.div>

                                            <motion.p
                                                initial={{ y: 16, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] text-white backdrop-blur-md"
                                            >
                                                Arahkan QR code ke dalam frame
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {scanResult && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
                                        >
                                            {scanResult === 'success' ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{
                                                        scale: 1,
                                                        rotate: 360,
                                                    }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 300,
                                                        damping: 20,
                                                    }}
                                                    className="text-center"
                                                >
                                                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/50">
                                                        <CheckCircle2 className="h-12 w-12 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">
                                                        Scan Berhasil!
                                                    </h3>
                                                    <p className="mt-1 text-sm text-emerald-300">
                                                        QR Code terverifikasi
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    animate={{
                                                        x: [
                                                            -10, 10, -10, 10, 0,
                                                        ],
                                                    }}
                                                    transition={{
                                                        duration: 0.45,
                                                    }}
                                                    className="text-center"
                                                >
                                                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 shadow-2xl shadow-rose-500/50">
                                                        <AlertCircle className="h-12 w-12 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">
                                                        QR Tidak Valid
                                                    </h3>
                                                    <p className="mt-1 text-sm text-rose-300">
                                                        Coba scan ulang
                                                    </p>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <AnimatePresence>
                            {scanStatus && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="mt-3 flex items-center justify-center gap-2 sm:justify-start"
                                >
                                    <Zap className="h-4 w-4 text-indigo-500" />
                                    <p className="text-xs font-medium text-indigo-700 sm:text-sm dark:text-indigo-400">
                                        {scanStatus}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative z-10 mt-5 flex w-full flex-col flex-wrap gap-2 sm:w-auto sm:flex-row sm:gap-3">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    type="button"
                                    className={cn(
                                        'w-full font-semibold shadow-lg transition-all sm:w-auto',
                                        scanning
                                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700',
                                    )}
                                    onClick={() => {
                                        if (!consentAccepted) {
                                            setConsentError(
                                                'Setujui persetujuan di atas sebelum memulai.',
                                            );
                                            return;
                                        }
                                        if (scanning) {
                                            void stopScan();
                                            setScanning(false);
                                            setScanStatus('');
                                            return;
                                        }
                                        setScanResult(null);
                                        setScanning(true);
                                    }}
                                    disabled={!scanAvailable || step1Locked}
                                >
                                    {scanning ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                            Stop Scan
                                        </>
                                    ) : (
                                        <>
                                            <QrCode className="mr-2 h-4 w-4" />{' '}
                                            Mulai Scan
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-white/40 sm:w-auto dark:border-white/10"
                                    onClick={() => {
                                        void stopScan();
                                        setScanning(false);
                                        setScanStatus('');
                                        setScanResult(null);
                                        form.setData('token', '');
                                    }}
                                    disabled={step1Locked}
                                >
                                    <RefreshCcw className="mr-2 h-4 w-4" />{' '}
                                    Reset
                                </Button>
                            </motion.div>
                        </div>

                        <div className="relative z-10 mt-6 border-t border-neutral-200/50 pt-4 sm:mt-8 sm:pt-6 dark:border-white/10">
                            <Label
                                htmlFor="token"
                                className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white"
                            >
                                Alternatif: Input Token Manual
                            </Label>
                            <Input
                                id="token"
                                value={form.data.token}
                                onChange={(e) =>
                                    form.setData(
                                        'token',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="Cth: UNPAM-7A8B..."
                                className="mt-1 h-12 rounded-xl border-white/40 bg-white/60 text-center font-mono tracking-widest shadow-inner transition-all focus:ring-indigo-500 sm:text-lg dark:border-white/10 dark:bg-black/40"
                                disabled={step1Locked}
                            />
                            <p className="mt-2 text-xs text-neutral-500">
                                Ketik manual token yang diberikan dosen jika
                                scan tidak berhasil.
                            </p>
                            <InputError
                                message={form.errors.token}
                                className="mt-1"
                            />
                        </div>
                    </motion.div>

                    {/* Step 2: Selfie */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={!step2Locked ? { scale: 1.005 } : {}}
                        className={cn(
                            'relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-8 dark:border-white/5 dark:bg-neutral-900/40',
                            step2Locked && 'pointer-events-none opacity-60',
                        )}
                    >
                        <div className="relative z-10 mb-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <img
                                    src={selfieStepIcon}
                                    alt="Icon Verifikasi Selfie"
                                    className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
                                />
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                                        Verifikasi Selfie
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {selfieRequired
                                            ? 'Ambil foto wajah untuk verifikasi'
                                            : 'Selfie tidak diwajibkan'}
                                    </p>
                                </div>
                            </div>
                            <AnimatePresence>
                                {selfieDone && (
                                    <motion.span
                                        initial={{
                                            scale: 0,
                                            opacity: 0,
                                            rotate: -120,
                                        }}
                                        animate={{
                                            scale: 1,
                                            opacity: 1,
                                            rotate: 0,
                                        }}
                                        exit={{
                                            scale: 0,
                                            opacity: 0,
                                            rotate: 120,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        }}
                                        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Selesai
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {step2Locked && !submitSuccess && (
                            <div className="rounded-xl border border-neutral-200 bg-neutral-100/80 p-3 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/80">
                                <div className="flex items-center justify-center gap-2 sm:justify-start">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>
                                        Selesaikan langkah sebelumnya terlebih
                                        dahulu
                                    </span>
                                </div>
                            </div>
                        )}

                        {!step2Locked && selfieRequired && (
                            <>
                                <div className="mx-auto flex aspect-[4/3] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-200/50 bg-gradient-to-br from-neutral-50 to-amber-50/30 shadow-lg sm:mx-0 md:aspect-video dark:border-amber-800/50 dark:from-neutral-900 dark:to-amber-950/20">
                                    {selfieActive ? (
                                        <video
                                            ref={selfieVideoRef}
                                            className="h-full w-full object-cover"
                                            autoPlay
                                            playsInline
                                            muted
                                        />
                                    ) : previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview selfie"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="relative flex flex-col items-center justify-center text-neutral-400">
                                            <Camera className="relative z-10 mb-4 h-16 w-16 text-amber-500/50" />
                                            <span className="relative z-10 rounded-full border border-amber-100 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-600 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                Aktifkan kamera untuk selfie
                                            </span>
                                            <span className="relative z-10 mt-3 text-xs text-neutral-400">
                                                Pastikan wajah terlihat jelas
                                            </span>
                                        </div>
                                    )}
                                    {selfieActive && (
                                        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                                            Kamera Aktif
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {selfieStatus && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-3 flex items-center justify-center gap-2 sm:justify-start"
                                        >
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            <p className="text-xs font-medium text-amber-700 sm:text-sm dark:text-amber-400">
                                                {selfieStatus}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative z-10 mt-5 flex w-full flex-col flex-wrap gap-2 sm:w-auto sm:flex-row sm:gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full sm:w-auto"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                'w-full border-white/40 font-semibold transition-all sm:w-auto dark:border-white/10',
                                                selfieActive
                                                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                    : '',
                                            )}
                                            onClick={
                                                selfieActive
                                                    ? stopSelfie
                                                    : startSelfie
                                            }
                                            disabled={
                                                !selfieAvailable || step2Locked
                                            }
                                        >
                                            <Camera className="mr-2 h-4 w-4" />{' '}
                                            {selfieActive
                                                ? 'Matikan'
                                                : 'Aktifkan'}{' '}
                                            Kamera
                                        </Button>
                                    </motion.div>
                                    {selfieActive && (
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full sm:w-auto"
                                        >
                                            <Button
                                                type="button"
                                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400 sm:w-auto"
                                                onClick={captureSelfie}
                                            >
                                                <Zap className="mr-2 h-4 w-4" />{' '}
                                                Ambil Foto Sekarang
                                            </Button>
                                        </motion.div>
                                    )}
                                    {previewUrl && !selfieActive && (
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full sm:w-auto"
                                        >
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full sm:w-auto"
                                                onClick={startSelfie}
                                            >
                                                <RefreshCcw className="mr-2 h-4 w-4" />{' '}
                                                Foto Ulang
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>

                                {(!selfieAvailable ||
                                    cameraPermission === 'denied') && (
                                        <div className="mt-6 border-t border-neutral-200/50 pt-4 dark:border-white/10">
                                            <Label className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                                Upload Manual (Alternatif)
                                            </Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleSelfieChange}
                                                className="mt-1 border-white/40 bg-white/60 dark:border-white/10 dark:bg-black/40"
                                            />
                                        </div>
                                    )}
                                <InputError
                                    message={form.errors.selfie}
                                    className="mt-2"
                                />
                            </>
                        )}

                        {!step2Locked && !selfieRequired && (
                            <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/80 p-4 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <div className="flex items-center justify-center gap-2 sm:justify-start">
                                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                                    <span className="font-medium">
                                        Selfie tidak diwajibkan untuk sesi ini.
                                        Langkah otomatis selesai.
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Step 3: Location */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={!step3Locked ? { scale: 1.005 } : {}}
                        className={cn(
                            'relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-8 dark:border-white/5 dark:bg-neutral-900/40',
                            step3Locked && 'pointer-events-none opacity-60',
                        )}
                    >
                        <div className="relative z-10 mb-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <img
                                    src={locationStepIcon}
                                    alt="Icon Verifikasi Lokasi"
                                    className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
                                />
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                                        Verifikasi Lokasi
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Pastikan GPS aktif untuk mengambil{' '}
                                        {locationSampleCount} sampel lokasi
                                    </p>
                                </div>
                            </div>
                            <AnimatePresence>
                                {locationDone && (
                                    <motion.span
                                        initial={{
                                            scale: 0,
                                            opacity: 0,
                                            rotate: -120,
                                        }}
                                        animate={{
                                            scale: 1,
                                            opacity: 1,
                                            rotate: 0,
                                        }}
                                        exit={{
                                            scale: 0,
                                            opacity: 0,
                                            rotate: 120,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        }}
                                        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Selesai
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {step3Locked && !submitSuccess && (
                            <div className="rounded-xl border border-neutral-200 bg-neutral-100/80 p-3 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/80">
                                <div className="flex items-center justify-center gap-2 sm:justify-start">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>
                                        Selesaikan langkah sebelumnya terlebih
                                        dahulu
                                    </span>
                                </div>
                            </div>
                        )}

                        {!step3Locked && (
                            <>
                                <div className="rounded-2xl border border-white/40 bg-white/60 p-5 shadow-inner dark:border-white/10 dark:bg-black/20">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="flex flex-col justify-center rounded-xl border border-white/40 bg-white/50 p-3 dark:border-white/5 dark:bg-black/30">
                                            <span className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                <MapPin className="h-3.5 w-3.5" />
                                                Koordinat
                                            </span>
                                            <span className="truncate font-mono text-xs text-neutral-900 sm:text-sm dark:text-white">
                                                {locationDone
                                                    ? `${form.data.latitude.slice(0, 10)}, ${form.data.longitude.slice(0, 10)}`
                                                    : '-'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col justify-center rounded-xl border border-white/40 bg-white/50 p-3 dark:border-white/5 dark:bg-black/30">
                                            <span className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                <Zap className="h-3.5 w-3.5" />
                                                Akurasi GPS
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-sm font-semibold',
                                                    accuracyOk
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-amber-600 dark:text-amber-500',
                                                )}
                                            >
                                                {accuracyValue !== null
                                                    ? `${Math.round(accuracyValue)}m`
                                                    : '-'}
                                                <span className="ml-1 text-xs font-normal text-neutral-400 dark:text-neutral-500">
                                                    (maks {accuracyThreshold}m)
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-4 border-t border-white/40 pt-4 sm:grid-cols-2 dark:border-white/5">
                                        <div>
                                            <span className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                <Navigation className="h-3.5 w-3.5" />
                                                Jarak dari Zona
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-sm font-semibold',
                                                    isInsideZone
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600 dark:text-rose-400',
                                                )}
                                            >
                                                {currentDistance !== null
                                                    ? `${currentDistance}m`
                                                    : '-'}
                                                <span className="ml-1 text-xs font-normal text-neutral-400 dark:text-neutral-500">
                                                    (maks {geofence.radius_m}m)
                                                </span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                <Wifi className="h-3.5 w-3.5" />
                                                Sampel Diambil
                                            </span>
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {sampleCount}/
                                                {locationSampleCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {currentDistance !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            'mt-4 flex items-center gap-3 rounded-xl border p-4 text-sm shadow-sm',
                                            isInsideZone
                                                ? 'border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                : 'border-rose-200/50 bg-rose-50 text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/40 dark:text-rose-300',
                                        )}
                                    >
                                        {isInsideZone ? (
                                            <>
                                                <div className="shrink-0 rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-800/60">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium">
                                                    Kamu berada dalam zona
                                                    absensi.
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="shrink-0 rounded-full bg-rose-100 p-1.5 dark:bg-rose-800/60">
                                                    <AlertCircle className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium">
                                                    Kamu di luar zona absensi.
                                                    Harus berjarak maksimal{' '}
                                                    {geofence.radius_m}m.
                                                </span>
                                            </>
                                        )}
                                    </motion.div>
                                )}

                                {locationStatus && currentDistance === null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            'mt-4 flex items-center gap-3 rounded-xl border p-4 text-sm shadow-sm',
                                            locationDone
                                                ? 'border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                : 'border-blue-200/50 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/40 dark:text-blue-300',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'shrink-0 rounded-full p-1.5',
                                                locationDone
                                                    ? 'bg-emerald-100 dark:bg-emerald-800/60'
                                                    : 'bg-blue-100 dark:bg-blue-800/60',
                                            )}
                                        >
                                            {locationCollecting ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : locationDone ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <Wifi className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span className="font-medium">
                                            {locationStatus}
                                        </span>
                                    </motion.div>
                                )}

                                <div className="relative z-10 mt-5 text-center sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-block w-full sm:w-auto"
                                    >
                                        <Button
                                            type="button"
                                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-400 hover:to-indigo-500 sm:w-auto"
                                            onClick={requestLocation}
                                            disabled={
                                                step3Locked ||
                                                locationCollecting
                                            }
                                        >
                                            {locationCollecting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                                    Sinkronisasi GPS...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCcw className="mr-2 h-4 w-4" />{' '}
                                                    {sampleCount > 0
                                                        ? 'Perbarui Lokasi'
                                                        : 'Verifikasi Lokasi'}
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>

                                <InputError
                                    message={form.errors.location_samples}
                                    className="mt-2 text-center sm:text-left"
                                />
                                <InputError
                                    message={form.errors.latitude}
                                    className="mt-1 text-center sm:text-left"
                                />
                                <InputError
                                    message={form.errors.longitude}
                                    className="mt-1 text-center sm:text-left"
                                />
                                <InputError
                                    message={form.errors.location_accuracy_m}
                                    className="mt-1 text-center sm:text-left"
                                />
                            </>
                        )}
                    </motion.div>

                    {/* Step 4: Submit */}
                    <motion.div
                        variants={cardVariants}
                        className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-8 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <img
                                    src={submitStepIcon}
                                    alt="Icon Kirim Absensi"
                                    className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
                                />
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                                        Kirim Absensi
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {canSubmit
                                            ? 'Semua langkah selesai.'
                                            : 'Pastikan semua langkah sudah lengkap.'}
                                    </p>
                                </div>
                            </div>
                            <AnimatePresence>
                                {submitSuccess && (
                                    <motion.span
                                        initial={{
                                            scale: 0,
                                            opacity: 0,
                                            rotate: -120,
                                        }}
                                        animate={{
                                            scale: 1,
                                            opacity: 1,
                                            rotate: 0,
                                        }}
                                        exit={{
                                            scale: 0,
                                            opacity: 0,
                                            rotate: 120,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        }}
                                        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Terkirim
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative z-10 space-y-3 rounded-2xl border border-white/40 bg-white/60 p-5 shadow-inner dark:border-white/10 dark:bg-black/20">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Token Scan
                                </span>
                                <span className="max-w-[180px] truncate font-mono text-sm font-bold text-neutral-900 dark:text-white">
                                    {tokenDone ? form.data.token : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Verifikasi Selfie
                                </span>
                                <span
                                    className={cn(
                                        'text-sm font-semibold',
                                        selfieDone
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-neutral-400',
                                    )}
                                >
                                    {selfieRequired
                                        ? selfieDone
                                            ? 'Tersimpan'
                                            : 'Belum'
                                        : 'Tidak wajib'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Verifikasi Lokasi
                                </span>
                                <span
                                    className={cn(
                                        'text-sm font-semibold',
                                        locationDone
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-neutral-400',
                                    )}
                                >
                                    {locationDone ? 'Valid' : 'Belum'}
                                </span>
                            </div>
                        </div>

                        {submitSuccess ? (
                            <div className="relative z-10 mt-6 space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-4 rounded-2xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 text-emerald-800 shadow-sm dark:border-emerald-700/50 dark:from-emerald-900/40 dark:to-teal-900/40 dark:text-emerald-200"
                                >
                                    <div className="shrink-0 rounded-xl bg-emerald-200 p-2 dark:bg-emerald-800">
                                        <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">
                                            Absensi Berhasil!
                                        </p>
                                        <p className="text-sm opacity-90">
                                            {submitMessage ??
                                                'Data absensi kamu sudah tercatat dengan aman.'}
                                        </p>
                                    </div>
                                </motion.div>

                                <GamificationRewards
                                    xpGained={gamification.xpGained}
                                    currentStreak={gamification.currentStreak}
                                    achievements={gamification.achievements}
                                    leaderboardPosition={
                                        gamification.leaderboardPosition
                                    }
                                    comboMultiplier={
                                        gamification.comboMultiplier
                                    }
                                />

                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-white/40 font-semibold dark:border-white/10"
                                        onClick={resetAttendance}
                                        size="lg"
                                    >
                                        <RefreshCcw className="mr-2 h-5 w-5" />{' '}
                                        Mulai Absen Sesi Lain
                                    </Button>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="relative z-10 mt-6 space-y-4">
                                <AnimatePresence>
                                    {submitError && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden rounded-xl border border-rose-200/50 bg-rose-50 p-4 text-rose-800 shadow-sm dark:border-rose-800/50 dark:bg-rose-900/40 dark:text-rose-200"
                                        >
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                                                <div>
                                                    <p className="font-bold">
                                                        Proses Gagal
                                                    </p>
                                                    <p className="mt-0.5 text-sm opacity-90">
                                                        {submitError}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    whileHover={
                                        canSubmit ? { scale: 1.02 } : {}
                                    }
                                    whileTap={canSubmit ? { scale: 0.98 } : {}}
                                >
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className={cn(
                                            'w-full text-lg font-bold shadow-lg transition-all',
                                            canSubmit
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500'
                                                : 'border-none bg-neutral-200 text-neutral-400 shadow-none dark:bg-neutral-800 dark:text-neutral-500',
                                        )}
                                        disabled={form.processing || !canSubmit}
                                    >
                                        {form.processing ? (
                                            <>
                                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />{' '}
                                                Mengirim Data Absensi...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="mr-2 h-5 w-5" />{' '}
                                                Kirim Absensi Sekarang
                                            </>
                                        )}
                                    </Button>
                                </motion.div>

                                {!canSubmit && missingInfo.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-xl border border-amber-200/50 bg-amber-50/80 p-4 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200"
                                    >
                                        <div className="mb-2 flex items-center justify-center gap-2 font-semibold sm:justify-start">
                                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                            <span>
                                                Harap lengkapi langkah berikut:
                                            </span>
                                        </div>
                                        <ul className="list-inside list-disc space-y-1 px-2 text-left text-xs">
                                            {missingInfo.map((info, index) => (
                                                <li key={index}>{info}</li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </form>

                <motion.div variants={cardVariants}>
                    <SocialProof
                        totalStudents={socialProof.totalStudents}
                        attendedCount={
                            submitSuccess
                                ? socialProof.attendedCount + 1
                                : socialProof.attendedCount
                        }
                        isFirstAttendee={socialProof.isFirstAttendee}
                        recentAttendees={socialProof.recentAttendees}
                        leaderboard={socialProof.leaderboard}
                    />
                </motion.div>

                <motion.div variants={cardVariants} className="space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                        <Shield className="h-5 w-5 text-purple-500" />
                        Pengaturan & Keamanan
                    </h2>
                    <NotificationManager />
                    <BiometricSetup />
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
