import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    MapPin,
    QrCode,
    RefreshCcw,
} from 'lucide-react';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
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

type PageProps = {
    mahasiswa: MahasiswaInfo;
    geofence: GeofenceInfo;
    selfieRequired: boolean;
    locationSampleCount?: number;
    locationSampleWindowSeconds?: number;
};

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
        if (stored === '1') {
            setConsentAccepted(true);
        }
    }, []);

    useEffect(() => {
        if (!navigator.permissions?.query) return;
        navigator.permissions
            .query({ name: 'geolocation' as PermissionName })
            .then((result) => {
                setLocationPermission(result.state);
                result.onchange = () => setLocationPermission(result.state);
            })
            .catch(() => {
                setLocationPermission('unknown');
            });
        navigator.permissions
            .query({ name: 'camera' as PermissionName })
            .then((result) => {
                setCameraPermission(result.state);
                result.onchange = () => setCameraPermission(result.state);
            })
            .catch(() => {
                setCameraPermission('unknown');
            });
    }, []);

    useEffect(() => {
        if (!flash?.success) return;
        setSuccessToast(flash.success);
        setSubmitMessage(flash.success);
        setSubmitSuccess(true);
        const timer = window.setTimeout(() => {
            setSuccessToast(null);
        }, 4500);
        return () => window.clearTimeout(timer);
    }, [flash?.success]);

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

        if (!('BarcodeDetector' in window)) {
            setScanStatus('Browser tidak mendukung scan QR.');
            setScanning(false);
            return;
        }

        const start = async () => {
            try {
                setScanStatus('Menyalakan kamera...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                const detector = new (window as any).BarcodeDetector({
                    formats: ['qr_code'],
                });

                intervalRef.current = window.setInterval(async () => {
                    if (!videoRef.current) return;
                    const barcodes = await detector.detect(videoRef.current);
                    if (barcodes.length > 0) {
                        setScanStatus('QR terbaca.');
                        form.setData('token', barcodes[0].rawValue || '');
                        setScanning(false);
                    }
                }, 700);
            } catch (error) {
                const message = getCameraErrorMessage(error);
                if ((error as DOMException)?.name === 'NotAllowedError') {
                    setCameraPermission('denied');
                }
                setScanStatus(message);
                setScanning(false);
            }
        };

        start();

        return () => {
            stopScan();
        };
    }, [cameraPermission, consentAccepted, scanning]);

    useEffect(() => {
        return () => {
            stopSelfie();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const stopScan = () => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const getCameraErrorMessage = (error: unknown) => {
        if (!error || typeof error !== 'object') {
            return 'Gagal mengakses kamera.';
        }
        const name = (error as DOMException).name;
        if (name === 'NotAllowedError') {
            return 'Izin kamera ditolak. Aktifkan akses kamera di browser.';
        }
        if (name === 'NotFoundError') {
            return 'Kamera tidak ditemukan di perangkat ini.';
        }
        if (name === 'NotReadableError') {
            return 'Kamera sedang digunakan aplikasi lain.';
        }
        if (name === 'OverconstrainedError') {
            return 'Perangkat tidak mendukung mode kamera yang diminta.';
        }
        return 'Gagal mengakses kamera.';
    };

    const attachSelfieStream = async () => {
        const video = selfieVideoRef.current;
        const stream = selfieStreamRef.current;
        if (!video || !stream) return;

        if (video.srcObject !== stream) {
            video.srcObject = stream;
        }

        try {
            await video.play();
        } catch (error) {
            setSelfieStatus('Gagal menampilkan kamera. Coba ulangi.');
        }
    };

    const stopSelfie = () => {
        if (selfieStreamRef.current) {
            selfieStreamRef.current.getTracks().forEach((track) => track.stop());
            selfieStreamRef.current = null;
        }
        if (selfieVideoRef.current) {
            selfieVideoRef.current.srcObject = null;
        }
        setSelfieActive(false);
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
            if ((error as DOMException)?.name === 'NotAllowedError') {
                setCameraPermission('denied');
            }
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

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
        });

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
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(file));
        setSelfieStatus('Foto tersimpan. Kamu bisa foto ulang jika perlu.');
        stopSelfie();
    };

    const getLocationSample = () =>
        new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
            );
        });

    const pickBestSample = (samples: LocationSample[]) =>
        samples.reduce((best, sample) => {
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

        if (locationCollecting) {
            return;
        }

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
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    setLocationStatus(
                        'Izin lokasi ditolak. Aktifkan GPS di browser.',
                    );
                } else if (geoError.code === geoError.TIMEOUT) {
                    setLocationStatus(
                        'Waktu pengambilan lokasi habis. Coba ulangi.',
                    );
                } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
                    setLocationStatus(
                        'Lokasi tidak tersedia. Pastikan GPS aktif.',
                    );
                } else {
                    setLocationStatus('Gagal mengambil lokasi.');
                }
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
            setLocationStatus(
                `Lokasi berhasil diambil (${samples.length} sampel).`,
            );
        }
    };

    const handleSelfieChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('selfie', file);
        if (file) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const resetAttendance = () => {
        form.reset();
        form.setData('device_info', navigator.userAgent);
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
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!submitReady || submitSuccess) {
            return;
        }
        form.post('/user/absen', {
            forceFormData: true,
            onSuccess: () => {
                stopSelfie();
                setSelfieStatus('');
                stopScan();
                setScanning(false);
                setSubmitSuccess(true);
            },
        });
    };

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
    const cameraPermissionLabel =
        cameraPermission === 'granted'
            ? 'Diizinkan'
            : cameraPermission === 'denied'
              ? 'Ditolak'
              : 'Perlu izin';
    const locationPermissionLabel =
        locationPermission === 'granted'
            ? 'Diizinkan'
            : locationPermission === 'denied'
              ? 'Ditolak'
              : 'Perlu izin';
    const flowSteps = [
        { key: 'scan', label: 'Scan', done: tokenDone },
        {
            key: 'verify',
            label: 'Verifikasi',
            done: selfieDone && locationDone,
        },
        { key: 'recorded', label: 'Tercatat', done: submitSuccess },
    ];

    const missingInfo = useMemo(() => {
        if (submitSuccess) return [];
        const missing: string[] = [];
        if (!tokenDone) missing.push('Token belum diisi');
        if (selfieRequired && !selfieDone) missing.push('Selfie belum diambil');
        if (!samplesReady) {
            missing.push(
                `Sampel lokasi belum lengkap (${sampleCount}/${locationSampleCount})`,
            );
        } else if (!form.data.latitude || !form.data.longitude) {
            missing.push('Lokasi belum diambil');
        } else if (!accuracyOk) {
            missing.push(`Akurasi GPS belum cukup (<= ${accuracyThreshold}m)`);
        }
        return missing;
    }, [
        accuracyOk,
        accuracyThreshold,
        form.data.latitude,
        form.data.longitude,
        locationSampleCount,
        sampleCount,
        samplesReady,
        locationDone,
        selfieDone,
        selfieRequired,
        submitSuccess,
        tokenDone,
    ]);

    const canSubmit = submitReady && !submitSuccess;
    const step1Locked = submitSuccess;
    const step2Locked = submitSuccess || !tokenDone;
    const step3Locked = submitSuccess || !tokenDone || !selfieDone;

    useEffect(() => {
        if (
            step3Locked ||
            locationDone ||
            locationCollecting ||
            autoLocationTriggered ||
            !consentAccepted
        ) {
            return;
        }
        setAutoLocationTriggered(true);
        void requestLocation();
    }, [
        step3Locked,
        locationDone,
        locationCollecting,
        autoLocationTriggered,
        consentAccepted,
    ]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mahasiswa', href: '/user/absen' },
        { title: 'Absensi', href: '/user/absen' },
    ];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi Mahasiswa" />
            <main className="flex w-full flex-col gap-6 px-6 py-8">
                {successToast && (
                    <div className="fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg backdrop-blur dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                        <div>
                            <p className="font-semibold">Absensi terkirim</p>
                            <p className="text-xs text-emerald-700/70 dark:text-emerald-100/80">
                                {successToast}
                            </p>
                        </div>
                    </div>
                )}
                <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                                Geofence
                            </p>
                            <h1 className="font-display text-2xl">
                                Radius {geofence.radius_m} meter
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-white/60">
                                Titik pusat: {geofence.lat}, {geofence.lng}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-full border border-slate-200/70 bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            Lokasi wajib aktif
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                                Legal & Kepatuhan
                            </p>
                            <h2 className="font-display text-xl">
                                Persetujuan kamera & lokasi
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-white/60">
                                Dengan menggunakan kamera dan lokasi, kamu
                                menyetujui kebijakan privasi serta prosedur
                                penghapusan data.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-white/70">
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={consentAccepted}
                                    onCheckedChange={(value) => {
                                        const checked = Boolean(value);
                                        setConsentAccepted(checked);
                                        setConsentError(null);
                                        if (typeof window !== 'undefined') {
                                            window.localStorage.setItem(
                                                'tplk004_camera_consent',
                                                checked ? '1' : '0',
                                            );
                                        }
                                    }}
                                />
                                <span>Setuju penggunaan kamera & lokasi</span>
                            </label>
                            <a
                                href="/privacy"
                                className="text-xs text-slate-700 underline underline-offset-4 dark:text-white"
                            >
                                Baca kebijakan privasi
                            </a>
                        </div>
                    </div>
                    {consentError && (
                        <div className="mt-3 rounded-2xl border border-rose-200/60 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-200/20 dark:bg-rose-500/10 dark:text-rose-100">
                            {consentError}
                        </div>
                    )}
                </section>

                <section className="grid gap-6">
                    <form className="grid gap-6" onSubmit={submit}>
                        <div
                            className={`rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg ${
                                step1Locked ? 'pointer-events-none opacity-60' : ''
                            }`}
                        >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                                            Langkah 1
                                        </p>
                                        <h2 className="font-display text-xl">
                                            Token absensi
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-white/60">
                                            Scan QR dari admin atau input token
                                            manual.
                                        </p>
                                    </div>
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                            tokenDone
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                                                : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/50'
                                        }`}
                                    >
                                        {tokenDone ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-white/40" />
                                        )}
                                        {tokenDone ? 'Selesai' : 'Belum'}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    {scanAvailable ? (
                                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-black/40">
                                            <video
                                                ref={videoRef}
                                                className={`h-64 w-full object-cover md:h-72 ${
                                                    scanning ? '' : 'hidden'
                                                }`}
                                                playsInline
                                            />
                                            {!scanning && (
                                                <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-white/50 md:h-72">
                                                    Kamera siap digunakan.
                                                </div>
                                            )}
                                            {scanning && (
                                                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
                                                    <span className="h-2 w-2 rounded-full bg-white" />
                                                    Kamera aktif
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-slate-200/70 bg-slate-100 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/60">
                                            Browser tidak mendukung
                                            BarcodeDetector. Masukkan token
                                            manual.
                                        </div>
                                    )}
                                    {scanStatus && (
                                        <p className="mt-2 text-xs text-slate-600 dark:text-white/60">
                                            {scanStatus}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500 dark:text-white/50">
                                        Izin kamera: {cameraPermissionLabel}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                                        onClick={() => {
                                            if (!consentAccepted) {
                                                setConsentError(
                                                    'Setujui persetujuan kamera sebelum memulai.',
                                                );
                                                setScanStatus(
                                                    'Setujui penggunaan kamera terlebih dulu.',
                                                );
                                                return;
                                            }
                                            setConsentError(null);
                                            setScanning((prev) => !prev);
                                        }}
                                        disabled={!scanAvailable || step1Locked}
                                    >
                                        <QrCode className="h-4 w-4" />
                                        {scanning ? 'Stop' : 'Scan QR'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                                        onClick={() => {
                                            stopScan();
                                            setScanning(false);
                                            form.setData('token', '');
                                            setScanStatus('Scan diulang.');
                                        }}
                                        disabled={step1Locked}
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                        Ulang scan
                                    </Button>
                                </div>

                                <div className="mt-6 grid gap-2">
                                    <Label htmlFor="token" className="text-slate-700 dark:text-white">
                                        Token
                                    </Label>
                                    <Input
                                        id="token"
                                        name="token"
                                        value={form.data.token}
                                        onChange={(event) =>
                                            form.setData(
                                                'token',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Scan QR atau input manual"
                                        disabled={step1Locked}
                                    />
                                    <InputError message={form.errors.token} />
                                </div>
                        </div>

                        <div
                            className={`rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg ${
                                step2Locked ? 'pointer-events-none opacity-60' : ''
                            }`}
                        >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                                            Langkah 2
                                        </p>
                                        <h2 className="font-display text-xl">
                                            Selfie
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-white/60">
                                            Ambil foto dari kamera depan untuk
                                            verifikasi.
                                        </p>
                                    </div>
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                            selfieDone
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                                                : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/50'
                                        }`}
                                    >
                                        {selfieDone ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-white/40" />
                                        )}
                                        {selfieDone ? 'Selesai' : 'Belum'}
                                    </div>
                                </div>

                                {step2Locked && !submitSuccess && (
                                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-100 p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/60">
                                        Selesaikan langkah 1 terlebih dahulu
                                        untuk membuka selfie.
                                    </div>
                                )}

                                {selfieRequired ? (
                                    <div className="mt-4 grid gap-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <Label className="text-slate-700 dark:text-white">
                                                    Kamera selfie
                                                </Label>
                                                <p className="text-xs text-slate-600 dark:text-white/60">
                                                    Ambil foto langsung dari
                                                    kamera depan.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                                                    onClick={
                                                        selfieActive
                                                            ? stopSelfie
                                                            : startSelfie
                                                    }
                                                    disabled={
                                                        !selfieAvailable ||
                                                        step2Locked
                                                    }
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    {selfieActive
                                                        ? 'Matikan kamera'
                                                        : 'Aktifkan kamera'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                                                    onClick={captureSelfie}
                                                    disabled={
                                                        !selfieActive ||
                                                        step2Locked
                                                    }
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    Ambil foto
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-black/40">
                                            {selfieActive ? (
                                                <video
                                                    ref={selfieVideoRef}
                                                    className="h-64 w-full object-cover md:h-72"
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                />
                                            ) : previewUrl ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview selfie"
                                                    className="h-64 w-full object-cover md:h-72"
                                                />
                                            ) : (
                                                <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-white/50 md:h-72">
                                                    Kamera selfie belum aktif.
                                                </div>
                                            )}
                                            {selfieActive && (
                                                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
                                                    <span className="h-2 w-2 rounded-full bg-white" />
                                                    Kamera aktif
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-white/60">
                                            {selfieStatus && (
                                                <span>{selfieStatus}</span>
                                            )}
                                            {previewUrl && !selfieActive && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-600 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                                                    onClick={startSelfie}
                                                >
                                                    <RefreshCcw className="h-4 w-4" />
                                                    Foto ulang
                                                </Button>
                                            )}
                                        </div>

                                        <InputError
                                            message={form.errors.selfie}
                                        />

                                        {(!selfieAvailable ||
                                            cameraPermission === 'denied') && (
                                            <div className="rounded-2xl border border-slate-200/70 bg-slate-100 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/60">
                                                Kamera tidak tersedia atau izin
                                                ditolak. Upload foto selfie
                                                secara manual.
                                                <Input
                                                    id="selfie"
                                                    type="file"
                                                    name="selfie"
                                                    accept="image/*"
                                                    onChange={handleSelfieChange}
                                                    className="mt-2"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-100 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/60">
                                        Selfie tidak diwajibkan. Langkah ini
                                        otomatis selesai.
                                    </div>
                                )}
                        </div>

                        <div
                            className={`rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg ${
                                step3Locked ? 'pointer-events-none opacity-60' : ''
                            }`}
                        >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                                            Langkah 3
                                        </p>
                                        <h2 className="font-display text-xl">
                                            Lokasi
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-white/60">
                                            Ambil {locationSampleCount} sampel
                                            GPS agar absen valid.
                                        </p>
                                    </div>
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                            locationDone
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                                                : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/50'
                                        }`}
                                    >
                                        {locationDone ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-white/40" />
                                        )}
                                        {locationDone ? 'Selesai' : 'Belum'}
                                    </div>
                                </div>

                                {step3Locked && !submitSuccess && (
                                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-100 p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/60">
                                        Selesaikan langkah sebelumnya untuk
                                        membuka lokasi.
                                    </div>
                                )}

                                <div className="mt-4 grid gap-2">
                                    <Label className="text-slate-700 dark:text-white">
                                        Lokasi (otomatis)
                                    </Label>
                                    <div className="rounded-2xl border border-slate-200/70 bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/70">
                                        {locationDone
                                            ? `${form.data.latitude}, ${form.data.longitude}`
                                            : 'Lokasi belum tersedia.'}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-fit border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                                        onClick={requestLocation}
                                        disabled={step3Locked || locationCollecting}
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                        {locationCollecting
                                            ? 'Mengambil lokasi...'
                                            : `Ambil ulang lokasi (${locationSampleCount}x)`}
                                    </Button>
                                    {locationStatus && (
                                        <p className="text-xs text-slate-600 dark:text-white/60">
                                            {locationStatus}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500 dark:text-white/50">
                                        Izin lokasi: {locationPermissionLabel}
                                    </p>
                                    <InputError
                                        message={form.errors.location_samples}
                                    />
                                    {accuracyValue !== null && (
                                        <p className="text-xs text-slate-600 dark:text-white/60">
                                            Akurasi GPS:{' '}
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {Math.round(accuracyValue)}m
                                            </span>{' '}
                                            (maks {accuracyThreshold}m)
                                        </p>
                                    )}
                                    <InputError
                                        message={form.errors.latitude}
                                    />
                                    <InputError
                                        message={form.errors.longitude}
                                    />
                                    <InputError
                                        message={form.errors.location_accuracy_m}
                                    />
                                </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                                            Langkah 4
                                        </p>
                                        <h2 className="font-display text-xl">
                                            Kirim absensi
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-white/60">
                                            Pastikan semua langkah sudah
                                            lengkap.
                                        </p>
                                    </div>
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                            submitSuccess
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                                                : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/50'
                                        }`}
                                    >
                                        {submitSuccess ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-white/40" />
                                        )}
                                        {submitSuccess ? 'Selesai' : 'Belum'}
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    {flowSteps.map((step) => (
                                        <span
                                            key={step.key}
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${
                                                step.done
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/50'
                                            }`}
                                        >
                                            <span className="h-2 w-2 rounded-full bg-current" />
                                            {step.label}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-100 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/70">
                                    <div className="flex items-center justify-between">
                                        <span>Token</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {tokenDone
                                                ? form.data.token
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Selfie</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {selfieRequired
                                                ? selfieDone
                                                    ? 'Tersimpan'
                                                    : 'Belum'
                                                : 'Tidak wajib'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Lokasi</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {locationDone
                                                ? `${form.data.latitude}, ${form.data.longitude}`
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Akurasi GPS</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {accuracyValue !== null
                                                ? `${Math.round(accuracyValue)}m`
                                                : '-'}
                                        </span>
                                    </div>
                                </div>

                                {submitSuccess ? (
                                    <div className="mt-4 grid gap-3">
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                                            {submitMessage ??
                                                'Absensi berhasil terkirim.'}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                                            onClick={resetAttendance}
                                        >
                                            Mulai absen baru
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            type="submit"
                                            className="mt-4 w-full bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                                            disabled={
                                                form.processing || !canSubmit
                                            }
                                        >
                                            {form.processing
                                                ? 'Mengirim...'
                                                : 'Kirim absensi'}
                                        </Button>
                                        {!canSubmit && (
                                            <p className="mt-2 text-xs text-slate-600 dark:text-white/60">
                                                Lengkapi: {missingInfo.join(', ')}
                                                .
                                            </p>
                                        )}
                                    </>
                                )}
                        </div>
                    </form>
                </section>
            </main>
        </StudentLayout>
    );
}
