import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import StudentLayout from '@/layouts/student-layout';
import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    CheckCircle2,
    MapPin,
    QrCode,
    RefreshCcw,
    Shield,
    Wifi,
    Zap,
    ChevronRight,
    AlertCircle,
    Loader2,
    Sparkles,
    Navigation,
    User,
} from 'lucide-react';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type MahasiswaInfo = { id: number; nama: string; nim: string };
type GeofenceInfo = { lat: number; lng: number; radius_m: number };
type LocationSample = { latitude: number; longitude: number; accuracy_m: number; captured_at: string };

type PageProps = {
    mahasiswa: MahasiswaInfo;
    geofence: GeofenceInfo;
    selfieRequired: boolean;
    locationSampleCount?: number;
    locationSampleWindowSeconds?: number;
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 17,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
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

// Step indicator component
function StepIndicator({ steps, currentStep }: { steps: { key: string; label: string; done: boolean }[]; currentStep: number }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex items-center justify-between mb-6"
        >
            {steps.map((step, index) => (
                <div key={step.key} className="flex items-center flex-1">
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-sm',
                                step.done ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900/50' :
                                index === currentStep ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 shadow-emerald-100 dark:shadow-emerald-900/30' :
                                'border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900'
                            )}
                        >
                            {step.done ? (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                >
                                    <CheckCircle2 className="h-6 w-6" />
                                </motion.div>
                            ) : (
                                <span className="font-bold text-lg">{index + 1}</span>
                            )}
                        </motion.div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className={cn(
                                'mt-2 text-xs font-semibold',
                                step.done ? 'text-emerald-600 dark:text-emerald-400' : 
                                index === currentStep ? 'text-gray-900 dark:text-white' : 
                                'text-gray-400'
                            )}
                        >
                            {step.label}
                        </motion.span>
                    </motion.div>
                    {index < steps.length - 1 && (
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className="flex-1 mx-2 origin-left"
                        >
                            <div className={cn(
                                'h-1 rounded-full transition-all duration-500',
                                step.done ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gray-200 dark:bg-gray-700'
                            )} />
                        </motion.div>
                    )}
                </div>
            ))}
        </motion.div>
    );
}

export default function UserAbsensi() {
    const { props } = usePage<SharedData & PageProps>();
    const { mahasiswa, geofence, flash, selfieRequired } = props;
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
    const [cameraPermission, setCameraPermission] = useState<PermissionState | 'unknown'>('unknown');
    const [locationPermission, setLocationPermission] = useState<PermissionState | 'unknown'>('unknown');
    
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const intervalRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const selfieVideoRef = useRef<HTMLVideoElement | null>(null);
    const selfieStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        form.setData('device_info', navigator.userAgent);
        setScanAvailable('BarcodeDetector' in window);
        setSelfieAvailable(Boolean(navigator.mediaDevices?.getUserMedia));
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = window.localStorage.getItem('tplk004_camera_consent');
        if (stored === '1') setConsentAccepted(true);
    }, []);

    useEffect(() => {
        if (!navigator.permissions?.query) return;
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
            setLocationPermission(result.state);
            result.onchange = () => setLocationPermission(result.state);
        }).catch(() => setLocationPermission('unknown'));
        navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
            setCameraPermission(result.state);
            result.onchange = () => setCameraPermission(result.state);
        }).catch(() => setCameraPermission('unknown'));
    }, []);

    useEffect(() => {
        if (!flash?.success) return;
        setSuccessToast(flash.success);
        setSubmitMessage(flash.success);
        setSubmitSuccess(true);
        const timer = window.setTimeout(() => setSuccessToast(null), 4500);
        return () => window.clearTimeout(timer);
    }, [flash?.success]);

    // QR Scanner effect
    useEffect(() => {
        if (!scanning) { stopScan(); return; }
        if (!consentAccepted) {
            setConsentError('Setujui persetujuan kamera sebelum memulai.');
            setScanStatus('Setujui penggunaan kamera terlebih dulu.');
            setScanning(false);
            return;
        }
        if (cameraPermission === 'denied') {
            setScanStatus('Izin kamera ditolak. Aktifkan akses kamera di browser.');
            setScanning(false);
            return;
        }
        if (!('BarcodeDetector' in window)) {
            setScanStatus('Browser tidak mendukung scan QR.');
            setScanning(false);
            return;
        }

        const start = async () => {
            try {
                setScanStatus('Menyalakan kamera...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                intervalRef.current = window.setInterval(async () => {
                    if (!videoRef.current) return;
                    const barcodes = await detector.detect(videoRef.current);
                    if (barcodes.length > 0) {
                        setScanStatus('QR terbaca!');
                        form.setData('token', barcodes[0].rawValue || '');
                        setScanning(false);
                    }
                }, 700);
            } catch (error) {
                const message = getCameraErrorMessage(error);
                if ((error as DOMException)?.name === 'NotAllowedError') setCameraPermission('denied');
                setScanStatus(message);
                setScanning(false);
            }
        };
        start();
        return () => stopScan();
    }, [cameraPermission, consentAccepted, scanning]);

    useEffect(() => { return () => stopSelfie(); }, []);
    useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

    const stopScan = () => {
        if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach((track) => track.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
    };

    const getCameraErrorMessage = (error: unknown) => {
        if (!error || typeof error !== 'object') return 'Gagal mengakses kamera.';
        const name = (error as DOMException).name;
        if (name === 'NotAllowedError') return 'Izin kamera ditolak. Aktifkan akses kamera di browser.';
        if (name === 'NotFoundError') return 'Kamera tidak ditemukan di perangkat ini.';
        if (name === 'NotReadableError') return 'Kamera sedang digunakan aplikasi lain.';
        if (name === 'OverconstrainedError') return 'Perangkat tidak mendukung mode kamera yang diminta.';
        return 'Gagal mengakses kamera.';
    };

    const attachSelfieStream = async () => {
        const video = selfieVideoRef.current;
        const stream = selfieStreamRef.current;
        if (!video || !stream) return;
        if (video.srcObject !== stream) video.srcObject = stream;
        try { await video.play(); } catch { setSelfieStatus('Gagal menampilkan kamera. Coba ulangi.'); }
    };

    const stopSelfie = () => {
        if (selfieStreamRef.current) { selfieStreamRef.current.getTracks().forEach((track) => track.stop()); selfieStreamRef.current = null; }
        if (selfieVideoRef.current) selfieVideoRef.current.srcObject = null;
        setSelfieActive(false);
    };

    useEffect(() => {
        if (!consentAccepted) { stopScan(); setScanning(false); stopSelfie(); setSelfieStatus(''); setScanStatus(''); }
    }, [consentAccepted]);

    const startSelfie = async () => {
        if (!consentAccepted) { setConsentError('Setujui persetujuan kamera sebelum memulai.'); setSelfieStatus('Setujui penggunaan kamera terlebih dulu.'); return; }
        if (!navigator.mediaDevices?.getUserMedia) { setSelfieStatus('Kamera tidak didukung di perangkat ini.'); return; }
        if (cameraPermission === 'denied') { setSelfieStatus('Izin kamera ditolak. Aktifkan akses kamera di browser.'); return; }
        setSelfieStatus('Menyalakan kamera depan...');
        stopSelfie(); stopScan(); setScanning(false); setSelfieActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            selfieStreamRef.current = stream;
            const waitForVideo = () => {
                if (!selfieStreamRef.current) return;
                if (!selfieVideoRef.current) { window.requestAnimationFrame(waitForVideo); return; }
                void attachSelfieStream();
            };
            waitForVideo();
            setSelfieStatus('Kamera siap. Ambil foto.');
        } catch (error) {
            const message = getCameraErrorMessage(error);
            if ((error as DOMException)?.name === 'NotAllowedError') setCameraPermission('denied');
            setSelfieStatus(message);
            setSelfieActive(false);
        }
    };

    const captureSelfie = async () => {
        if (!selfieVideoRef.current) return;
        const video = selfieVideoRef.current;
        if (!video.videoWidth || !video.videoHeight) { setSelfieStatus('Kamera belum siap.'); return; }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) { setSelfieStatus('Gagal mengambil foto.'); return; }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        if (!blob) { setSelfieStatus('Gagal mengambil foto.'); return; }
        const file = new File([blob], `selfie-${mahasiswa.nim}-${Date.now()}.jpg`, { type: blob.type });
        form.setData('selfie', file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        setSelfieStatus('Foto tersimpan!');
        stopSelfie();
    };

    const getLocationSample = () => new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
    });

    const pickBestSample = (samples: LocationSample[]) => samples.reduce((best, sample) => {
        if (!best) return sample;
        if (sample.accuracy_m < best.accuracy_m) return sample;
        if (sample.accuracy_m === best.accuracy_m && Date.parse(sample.captured_at) > Date.parse(best.captured_at)) return sample;
        return best;
    }, samples[0]);

    // Calculate distance from geofence center (Haversine formula)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get current distance from geofence
    const currentDistance = useMemo(() => {
        if (!form.data.latitude || !form.data.longitude) return null;
        const lat = parseFloat(form.data.latitude);
        const lng = parseFloat(form.data.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;
        return Math.round(calculateDistance(lat, lng, geofence.lat, geofence.lng));
    }, [form.data.latitude, form.data.longitude, geofence.lat, geofence.lng]);

    const isInsideZone = currentDistance !== null && currentDistance <= geofence.radius_m;

    const requestLocation = async () => {
        if (!consentAccepted) { setConsentError('Setujui persetujuan lokasi sebelum memulai.'); setLocationStatus('Setujui penggunaan lokasi terlebih dulu.'); return; }
        if (!navigator.geolocation) { setLocationStatus('GPS tidak didukung browser.'); return; }
        if (locationPermission === 'denied') { setLocationStatus('Izin lokasi ditolak. Aktifkan GPS di pengaturan browser.'); return; }
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
                    setLocationStatus(`Mengambil lokasi (${index + 2}/${locationSampleCount})...`);
                    await new Promise((resolve) => window.setTimeout(resolve, 800));
                }
            } catch (error) {
                const geoError = error as GeolocationPositionError;
                if (geoError.code === geoError.PERMISSION_DENIED) setLocationStatus('Izin lokasi ditolak. Aktifkan GPS di browser.');
                else if (geoError.code === geoError.TIMEOUT) setLocationStatus('Waktu pengambilan lokasi habis. Coba ulangi.');
                else if (geoError.code === geoError.POSITION_UNAVAILABLE) setLocationStatus('Lokasi tidak tersedia. Pastikan GPS aktif.');
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
            setLocationStatus(`Akurasi GPS terlalu rendah (${bestSample.accuracy_m}m). Coba ulangi.`);
        } else {
            // Calculate distance from geofence
            const dist = Math.round(calculateDistance(bestSample.latitude, bestSample.longitude, geofence.lat, geofence.lng));
            if (dist <= geofence.radius_m) {
                setLocationStatus(`✓ Dalam zona! Jarak: ${dist}m dari titik pusat (maks ${geofence.radius_m}m)`);
            } else {
                setLocationStatus(`⚠ Di luar zona! Jarak: ${dist}m dari titik pusat (maks ${geofence.radius_m}m)`);
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
        form.setData('device_info', navigator.userAgent);
        stopSelfie(); stopScan(); setScanning(false);
        setLocationCollecting(false); setAutoLocationTriggered(false);
        setSelfieStatus(''); setScanStatus(''); setLocationStatus('');
        setConsentError(null); setPreviewUrl(null);
        setSubmitSuccess(false); setSubmitMessage(null); setSuccessToast(null);
        setSubmitError(null);
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
                const firstError = errorMessages.length > 0 ? String(errorMessages[0]) : 'Gagal mengirim absensi. Coba lagi.';
                setSubmitError(firstError);
            },
        });
    };

    // Computed values
    const tokenDone = form.data.token.trim().length > 0;
    const selfieDone = selfieRequired ? Boolean(form.data.selfie) : tokenDone;
    const accuracyThreshold = Math.min(50, geofence.radius_m);
    const sampleCount = form.data.location_samples.length;
    const samplesReady = sampleCount >= locationSampleCount;
    const accuracyValue = typeof form.data.location_accuracy_m === 'number' ? form.data.location_accuracy_m : null;
    const accuracyOk = accuracyValue !== null && Number.isFinite(accuracyValue) && accuracyValue <= accuracyThreshold;
    const locationDone = samplesReady && Boolean(form.data.latitude && form.data.longitude) && accuracyOk;
    const submitReady = tokenDone && selfieDone && locationDone;
    const canSubmit = submitReady && !submitSuccess;

    const step1Locked = submitSuccess;
    const step2Locked = submitSuccess || !tokenDone;
    const step3Locked = submitSuccess || !tokenDone || !selfieDone;

    const flowSteps = [
        { key: 'scan', label: 'Scan QR', done: tokenDone },
        { key: 'selfie', label: 'Selfie', done: selfieDone },
        { key: 'location', label: 'Lokasi', done: locationDone },
        { key: 'submit', label: 'Kirim', done: submitSuccess },
    ];

    const currentStep = submitSuccess ? 3 : locationDone ? 3 : selfieDone ? 2 : tokenDone ? 1 : 0;
    const progressPercent = submitSuccess ? 100 : (flowSteps.filter(s => s.done).length / flowSteps.length) * 100;

    const missingInfo = useMemo(() => {
        if (submitSuccess) return [];
        const missing: string[] = [];
        if (!tokenDone) missing.push('Token belum diisi');
        if (selfieRequired && !selfieDone) missing.push('Selfie belum diambil');
        if (!samplesReady) missing.push(`Sampel lokasi belum lengkap (${sampleCount}/${locationSampleCount})`);
        else if (!form.data.latitude || !form.data.longitude) missing.push('Lokasi belum diambil');
        else if (!accuracyOk) missing.push(`Akurasi GPS belum cukup (<= ${accuracyThreshold}m)`);
        return missing;
    }, [accuracyOk, accuracyThreshold, form.data.latitude, form.data.longitude, locationSampleCount, sampleCount, samplesReady, selfieDone, selfieRequired, submitSuccess, tokenDone]);

    useEffect(() => {
        if (step3Locked || locationDone || locationCollecting || autoLocationTriggered || !consentAccepted) return;
        setAutoLocationTriggered(true);
        void requestLocation();
    }, [step3Locked, locationDone, locationCollecting, autoLocationTriggered, consentAccepted]);

    return (
        <StudentLayout>
            <Head title="Absensi" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Success Toast */}
                <AnimatePresence>
                    {successToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-xl backdrop-blur dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 10, 0] }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500" />
                            </motion.div>
                            <div>
                                <p className="font-semibold">Absensi Berhasil!</p>
                                <p className="text-xs text-emerald-700/70 dark:text-emerald-100/80">{successToast}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Card */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 text-white shadow-2xl"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                >
                                    <User className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-emerald-100"
                                    >
                                        Selamat datang,
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl font-bold"
                                    >
                                        {mahasiswa.nama}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-emerald-100"
                                    >
                                        NIM: {mahasiswa.nim}
                                    </motion.p>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur shadow-lg"
                            >
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm font-semibold">Radius {geofence.radius_m}m</span>
                            </motion.div>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-emerald-100">Progress Absensi</span>
                                <motion.span
                                    key={progressPercent}
                                    initial={{ scale: 1.3, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-sm font-bold"
                                >
                                    {Math.round(progressPercent)}%
                                </motion.span>
                            </div>
                            <div className="relative h-3 rounded-full bg-white/20 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
                                    className="h-full rounded-full bg-white shadow-lg"
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Step Indicator */}
                <motion.div
                    variants={cardVariants}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black"
                >
                    <StepIndicator steps={flowSteps} currentStep={currentStep} />
                </motion.div>

                {/* Consent Card */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black"
                >
                    <div className="flex items-start gap-4">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                        >
                            <Shield className="h-6 w-6" />
                        </motion.div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Persetujuan Privasi</h2>
                            <p className="text-sm text-gray-500 mt-1">Dengan menggunakan kamera dan lokasi, kamu menyetujui kebijakan privasi.</p>
                            <motion.label
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-2 mt-3 cursor-pointer"
                            >
                                <Checkbox
                                    checked={consentAccepted}
                                    onCheckedChange={(value) => {
                                        const checked = Boolean(value);
                                        setConsentAccepted(checked);
                                        setConsentError(null);
                                        if (typeof window !== 'undefined') window.localStorage.setItem('tplk004_camera_consent', checked ? '1' : '0');
                                    }}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Setuju penggunaan kamera & lokasi</span>
                            </motion.label>
                            <AnimatePresence>
                                {consentError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 flex items-center gap-2 text-xs text-rose-600"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        {consentError}
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
                        whileHover={!step1Locked ? { scale: 1.01, y: -2 } : {}}
                        className={cn(
                            'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur transition-all dark:border-gray-800 dark:bg-black',
                            step1Locked && 'opacity-60 pointer-events-none'
                        )}
                    >
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className={cn(
                                        'flex h-12 w-12 items-center justify-center rounded-xl shadow-sm',
                                        tokenDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                                    )}
                                >
                                    <QrCode className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">Scan QR Code</h2>
                                    <p className="text-sm text-gray-500">Scan QR dari admin atau input token manual</p>
                                </div>
                            </div>
                            <AnimatePresence>
                                {tokenDone && (
                                    <motion.span
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                        className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    >
                                        <CheckCircle2 className="h-3 w-3" /> Selesai
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* QR Scanner */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900"
                        >
                            <video ref={videoRef} className={cn('h-56 w-full object-cover', !scanning && 'hidden')} playsInline />
                            <AnimatePresence mode="wait">
                                {!scanning && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex h-56 flex-col items-center justify-center text-gray-400"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <QrCode className="h-12 w-12 mb-2" />
                                        </motion.div>
                                        <span className="text-sm">Klik tombol untuk scan QR</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {scanning && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 border-2 border-emerald-500 rounded-lg"
                                    >
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute -top-0.5 -left-0.5 h-4 w-4 border-t-2 border-l-2 border-emerald-500"
                                        />
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                            className="absolute -top-0.5 -right-0.5 h-4 w-4 border-t-2 border-r-2 border-emerald-500"
                                        />
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                            className="absolute -bottom-0.5 -left-0.5 h-4 w-4 border-b-2 border-l-2 border-emerald-500"
                                        />
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                                            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 border-b-2 border-r-2 border-emerald-500"
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-lg"
                                    >
                                        <motion.span
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="h-2 w-2 rounded-full bg-white"
                                        />
                                        Scanning...
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>

                        <AnimatePresence>
                            {scanStatus && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-2 text-xs text-gray-500"
                                >
                                    {scanStatus}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button type="button" variant="outline" size="sm" onClick={() => { if (!consentAccepted) { setConsentError('Setujui persetujuan kamera sebelum memulai.'); return; } setScanning((prev) => !prev); }} disabled={!scanAvailable || step1Locked}>
                                    {scanning ? <><Loader2 className="h-4 w-4 animate-spin" /> Stop</> : <><QrCode className="h-4 w-4" /> Scan QR</>}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button type="button" variant="ghost" size="sm" onClick={() => { stopScan(); setScanning(false); form.setData('token', ''); setScanStatus(''); }} disabled={step1Locked}>
                                    <RefreshCcw className="h-4 w-4" /> Reset
                                </Button>
                            </motion.div>
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="token" className="text-sm">Token Manual</Label>
                            <Input id="token" value={form.data.token} onChange={(e) => form.setData('token', e.target.value)} placeholder="Masukkan token jika tidak bisa scan" className="mt-1" disabled={step1Locked} />
                            <InputError message={form.errors.token} />
                        </div>
                    </motion.div>

                    {/* Step 2: Selfie */}
                    <div className={cn(
                        'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur transition-all dark:border-gray-800 dark:bg-black',
                        step2Locked && 'opacity-60 pointer-events-none'
                    )}>
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-xl',
                                    selfieDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                )}>
                                    <Camera className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">Verifikasi Selfie</h2>
                                    <p className="text-sm text-gray-500">{selfieRequired ? 'Ambil foto wajah untuk verifikasi' : 'Selfie tidak diwajibkan'}</p>
                                </div>
                            </div>
                            {selfieDone && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" /> Selesai
                                </span>
                            )}
                        </div>

                        {step2Locked && !submitSuccess && (
                            <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-3 text-sm text-gray-500 dark:bg-gray-800">
                                <AlertCircle className="h-4 w-4" />
                                Selesaikan langkah 1 terlebih dahulu
                            </div>
                        )}

                        {!step2Locked && selfieRequired && (
                            <>
                                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
                                    {selfieActive ? (
                                        <video ref={selfieVideoRef} className="h-56 w-full object-cover" autoPlay playsInline muted />
                                    ) : previewUrl ? (
                                        <img src={previewUrl} alt="Preview selfie" className="h-56 w-full object-cover" />
                                    ) : (
                                        <div className="flex h-56 flex-col items-center justify-center text-gray-400">
                                            <Camera className="h-12 w-12 mb-2" />
                                            <span className="text-sm">Aktifkan kamera untuk selfie</span>
                                        </div>
                                    )}
                                    {selfieActive && (
                                        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                                            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                            Kamera Aktif
                                        </div>
                                    )}
                                </div>

                                {selfieStatus && <p className="mt-2 text-xs text-gray-500">{selfieStatus}</p>}

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={selfieActive ? stopSelfie : startSelfie} disabled={!selfieAvailable || step2Locked}>
                                        <Camera className="h-4 w-4" /> {selfieActive ? 'Matikan' : 'Aktifkan'} Kamera
                                    </Button>
                                    {selfieActive && (
                                        <Button type="button" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={captureSelfie}>
                                            <Zap className="h-4 w-4" /> Ambil Foto
                                        </Button>
                                    )}
                                    {previewUrl && !selfieActive && (
                                        <Button type="button" variant="ghost" size="sm" onClick={startSelfie}>
                                            <RefreshCcw className="h-4 w-4" /> Foto Ulang
                                        </Button>
                                    )}
                                </div>

                                {(!selfieAvailable || cameraPermission === 'denied') && (
                                    <div className="mt-4">
                                        <Label className="text-sm">Upload Manual</Label>
                                        <Input type="file" accept="image/*" onChange={handleSelfieChange} className="mt-1" />
                                    </div>
                                )}
                                <InputError message={form.errors.selfie} />
                            </>
                        )}

                        {!step2Locked && !selfieRequired && (
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Selfie tidak diwajibkan. Langkah ini otomatis selesai.
                            </div>
                        )}
                    </div>

                    {/* Step 3: Location */}
                    <div className={cn(
                        'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur transition-all dark:border-gray-800 dark:bg-black',
                        step3Locked && 'opacity-60 pointer-events-none'
                    )}>
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-xl',
                                    locationDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
                                )}>
                                    <Navigation className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">Verifikasi Lokasi</h2>
                                    <p className="text-sm text-gray-500">Ambil {locationSampleCount} sampel GPS untuk validasi</p>
                                </div>
                            </div>
                            {locationDone && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" /> Selesai
                                </span>
                            )}
                        </div>

                        {step3Locked && !submitSuccess && (
                            <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-3 text-sm text-gray-500 dark:bg-gray-800">
                                <AlertCircle className="h-4 w-4" />
                                Selesaikan langkah sebelumnya terlebih dahulu
                            </div>
                        )}

                        {!step3Locked && (
                            <>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">Koordinat</span>
                                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                                            {locationDone ? `${form.data.latitude}, ${form.data.longitude}` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">Akurasi GPS</span>
                                        <span className={cn(
                                            'font-semibold text-sm',
                                            accuracyOk ? 'text-emerald-600' : 'text-amber-600'
                                        )}>
                                            {accuracyValue !== null ? `${Math.round(accuracyValue)}m` : '-'} <span className="font-normal text-gray-400">(maks {accuracyThreshold}m)</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">Jarak dari Zona</span>
                                        <span className={cn(
                                            'font-semibold text-sm',
                                            isInsideZone ? 'text-emerald-600' : 'text-red-600'
                                        )}>
                                            {currentDistance !== null ? `${currentDistance}m` : '-'} <span className="font-normal text-gray-400">(maks {geofence.radius_m}m)</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Sampel</span>
                                        <span className="text-sm text-gray-900 dark:text-white">{sampleCount}/{locationSampleCount}</span>
                                    </div>
                                </div>

                                {/* Zone Status Alert */}
                                {currentDistance !== null && (
                                    <div className={cn(
                                        'mt-3 flex items-center gap-2 rounded-xl p-3 text-sm',
                                        isInsideZone 
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                                    )}>
                                        {isInsideZone ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>✓ Kamu berada dalam zona absensi ({currentDistance}m dari titik pusat)</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-4 w-4" />
                                                <span>⚠ Kamu di luar zona absensi! Jarak {currentDistance}m, maksimal {geofence.radius_m}m</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {locationStatus && !currentDistance && (
                                    <div className={cn(
                                        'mt-3 flex items-center gap-2 rounded-xl p-3 text-sm',
                                        locationDone ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                    )}>
                                        {locationCollecting ? <Loader2 className="h-4 w-4 animate-spin" /> : locationDone ? <CheckCircle2 className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                                        {locationStatus}
                                    </div>
                                )}

                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={requestLocation} disabled={step3Locked || locationCollecting}>
                                    {locationCollecting ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengambil...</> : <><RefreshCcw className="h-4 w-4" /> Ambil Ulang Lokasi</>}
                                </Button>

                                <InputError message={form.errors.location_samples} />
                                <InputError message={form.errors.latitude} />
                                <InputError message={form.errors.longitude} />
                                <InputError message={form.errors.location_accuracy_m} />
                            </>
                        )}
                    </div>

                    {/* Step 4: Submit */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-xl',
                                    submitSuccess ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                                )}>
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">Kirim Absensi</h2>
                                    <p className="text-sm text-gray-500">Pastikan semua langkah sudah lengkap</p>
                                </div>
                            </div>
                            {submitSuccess && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" /> Terkirim
                                </span>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Token</span>
                                <span className="font-mono text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{tokenDone ? form.data.token : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Selfie</span>
                                <span className={cn('text-sm font-medium', selfieDone ? 'text-emerald-600' : 'text-gray-400')}>
                                    {selfieRequired ? (selfieDone ? '✓ Tersimpan' : 'Belum') : 'Tidak wajib'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Lokasi</span>
                                <span className={cn('text-sm font-medium', locationDone ? 'text-emerald-600' : 'text-gray-400')}>
                                    {locationDone ? '✓ Valid' : 'Belum'}
                                </span>
                            </div>
                        </div>

                        {submitSuccess ? (
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    <Sparkles className="h-6 w-6" />
                                    <div>
                                        <p className="font-semibold">Absensi Berhasil!</p>
                                        <p className="text-sm">{submitMessage ?? 'Data absensi kamu sudah tercatat.'}</p>
                                    </div>
                                </div>
                                <Button type="button" variant="outline" className="w-full" onClick={resetAttendance}>
                                    <RefreshCcw className="h-4 w-4" /> Mulai Absen Baru
                                </Button>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {/* Error Alert */}
                                {submitError && (
                                    <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Absensi Gagal!</p>
                                            <p className="text-sm">{submitError}</p>
                                        </div>
                                    </div>
                                )}
                                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={form.processing || !canSubmit}>
                                    {form.processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim...</> : <><Zap className="h-4 w-4" /> Kirim Absensi</>}
                                </Button>
                                {!canSubmit && missingInfo.length > 0 && (
                                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>Lengkapi: {missingInfo.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </motion.div>
        </StudentLayout>
    );
}
