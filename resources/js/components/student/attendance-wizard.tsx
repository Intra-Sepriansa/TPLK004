import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useCamera } from '@/hooks/use-camera';
import {
    QrCode,
    MapPin,
    Camera,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    Loader2,
    AlertCircle,
    RefreshCcw,
    Scan,
    Navigation,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeofenceInfo {
    lat: number;
    lng: number;
    radius_m: number;
}

interface AttendanceWizardProps {
    geofence: GeofenceInfo;
    selfieRequired: boolean;
    locationSampleCount?: number;
    onSuccess?: () => void;
}

type Step = 'consent' | 'token' | 'location' | 'selfie' | 'confirm' | 'success';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: 'consent', label: 'Persetujuan', icon: Shield },
    { key: 'token', label: 'Token', icon: QrCode },
    { key: 'location', label: 'Lokasi', icon: MapPin },
    { key: 'selfie', label: 'Selfie', icon: Camera },
    { key: 'confirm', label: 'Konfirmasi', icon: CheckCircle },
];

export function AttendanceWizard({
    geofence,
    selfieRequired,
    locationSampleCount = 3,
    onSuccess,
}: AttendanceWizardProps) {
    const [currentStep, setCurrentStep] = useState<Step>('consent');
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [locationSamples, setLocationSamples] = useState<any[]>([]);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const scanIntervalRef = useRef<number | null>(null);
    const scanStreamRef = useRef<MediaStream | null>(null);

    const form = useForm({
        token: '',
        selfie: null as File | null,
        latitude: '',
        longitude: '',
        location_accuracy_m: null as number | null,
        location_samples: [] as any[],
        device_info: '',
    });

    const {
        latitude,
        longitude,
        accuracy,
        loading: locationLoading,
        error: locationError,
        refresh: refreshLocation,
        calculateDistance,
        isWithinRadius,
    } = useGeolocation({ watch: true, enableHighAccuracy: true });

    const {
        videoRef: selfieVideoRef,
        canvasRef: selfieCanvasRef,
        isActive: selfieActive,
        isLoading: selfieLoading,
        error: selfieError,
        start: startSelfie,
        stop: stopSelfie,
        capture: captureSelfie,
    } = useCamera({ facingMode: 'user' });

    const distance = latitude && longitude 
        ? calculateDistance(geofence.lat, geofence.lng) 
        : null;
    const isInRange = latitude && longitude 
        ? isWithinRadius(geofence.lat, geofence.lng, geofence.radius_m) 
        : false;

    const stepIndex = STEPS.findIndex(s => s.key === currentStep);
    const progress = ((stepIndex + 1) / STEPS.length) * 100;

    useEffect(() => {
        form.setData('device_info', navigator.userAgent);
    }, []);

    // QR Scanner
    const startScan = useCallback(async () => {
        if (!('BarcodeDetector' in window)) {
            setScanError('Browser tidak mendukung scan QR');
            return;
        }

        try {
            setScanning(true);
            setScanError(null);
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            scanStreamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            
            scanIntervalRef.current = window.setInterval(async () => {
                if (!videoRef.current) return;
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                    form.setData('token', barcodes[0].rawValue || '');
                    stopScan();
                }
            }, 500);
        } catch (err) {
            setScanError('Gagal mengakses kamera');
            setScanning(false);
        }
    }, [form]);

    const stopScan = useCallback(() => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (scanStreamRef.current) {
            scanStreamRef.current.getTracks().forEach(t => t.stop());
            scanStreamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setScanning(false);
    }, []);

    // Location sampling
    const collectLocationSamples = useCallback(async () => {
        const samples: any[] = [];
        
        for (let i = 0; i < locationSampleCount; i++) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    });
                });
                
                samples.push({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy_m: Math.round(position.coords.accuracy),
                    captured_at: new Date(position.timestamp).toISOString(),
                });
                
                setLocationSamples([...samples]);
                
                if (i < locationSampleCount - 1) {
                    await new Promise(r => setTimeout(r, 800));
                }
            } catch (err) {
                break;
            }
        }

        if (samples.length >= locationSampleCount) {
            const best = samples.reduce((a, b) => a.accuracy_m < b.accuracy_m ? a : b);
            form.setData('location_samples', samples);
            form.setData('latitude', best.latitude.toString());
            form.setData('longitude', best.longitude.toString());
            form.setData('location_accuracy_m', best.accuracy_m);
        }
    }, [locationSampleCount, form]);

    // Selfie capture
    const handleCaptureSelfie = useCallback(() => {
        const imageData = captureSelfie();
        if (imageData) {
            setSelfiePreview(imageData);
            
            // Convert to File
            fetch(imageData)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    form.setData('selfie', file);
                });
        }
    }, [captureSelfie, form]);

    // Submit
    const handleSubmit = () => {
        form.post('/user/absen', {
            forceFormData: true,
            onSuccess: () => {
                setCurrentStep('success');
                onSuccess?.();
            },
        });
    };

    // Navigation
    const canProceed = () => {
        switch (currentStep) {
            case 'consent': return consentAccepted;
            case 'token': return form.data.token.trim().length > 0;
            case 'location': return locationSamples.length >= locationSampleCount && isInRange;
            case 'selfie': return !selfieRequired || form.data.selfie !== null;
            case 'confirm': return true;
            default: return false;
        }
    };

    const nextStep = () => {
        const idx = STEPS.findIndex(s => s.key === currentStep);
        if (idx < STEPS.length - 1) {
            setCurrentStep(STEPS[idx + 1].key);
        }
    };

    const prevStep = () => {
        const idx = STEPS.findIndex(s => s.key === currentStep);
        if (idx > 0) {
            setCurrentStep(STEPS[idx - 1].key);
        }
    };

    useEffect(() => {
        return () => {
            stopScan();
            stopSelfie();
        };
    }, [stopScan, stopSelfie]);

    if (currentStep === 'success') {
        return <SuccessScreen onReset={() => window.location.reload()} />;
    }

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="flex items-center justify-between mb-3">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = step.key === currentStep;
                        const isCompleted = idx < stepIndex;
                        
                        return (
                            <div key={step.key} className="flex items-center">
                                <div className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                                    isCompleted && 'bg-emerald-500 text-white',
                                    isActive && 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500 dark:bg-emerald-900/30',
                                    !isActive && !isCompleted && 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                )}>
                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={cn(
                                        'h-1 w-8 mx-1 rounded-full transition-all hidden sm:block',
                                        isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                    )} />
                                )}
                            </div>
                        );
                    })}
                </div>
                <Progress value={progress} className="h-1.5" indicatorClassName="bg-emerald-500" />
                <p className="text-center text-sm text-slate-500 mt-2">
                    {STEPS[stepIndex]?.label}
                </p>
            </div>

            {/* Step Content */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 min-h-[400px]">
                {currentStep === 'consent' && (
                    <ConsentStep
                        accepted={consentAccepted}
                        onAccept={setConsentAccepted}
                    />
                )}
                
                {currentStep === 'token' && (
                    <TokenStep
                        token={form.data.token}
                        onTokenChange={(t) => form.setData('token', t)}
                        scanning={scanning}
                        scanError={scanError}
                        onStartScan={startScan}
                        onStopScan={stopScan}
                        videoRef={videoRef}
                    />
                )}
                
                {currentStep === 'location' && (
                    <LocationStep
                        geofence={geofence}
                        latitude={latitude}
                        longitude={longitude}
                        accuracy={accuracy}
                        distance={distance}
                        isInRange={isInRange}
                        loading={locationLoading}
                        error={locationError}
                        samples={locationSamples}
                        requiredSamples={locationSampleCount}
                        onCollect={collectLocationSamples}
                        onRefresh={refreshLocation}
                    />
                )}
                
                {currentStep === 'selfie' && (
                    <SelfieStep
                        required={selfieRequired}
                        preview={selfiePreview}
                        active={selfieActive}
                        loading={selfieLoading}
                        error={selfieError}
                        videoRef={selfieVideoRef}
                        canvasRef={selfieCanvasRef}
                        onStart={startSelfie}
                        onCapture={handleCaptureSelfie}
                        onRetake={() => {
                            setSelfiePreview(null);
                            form.setData('selfie', null);
                            startSelfie();
                        }}
                    />
                )}
                
                {currentStep === 'confirm' && (
                    <ConfirmStep
                        token={form.data.token}
                        location={{ lat: form.data.latitude, lng: form.data.longitude }}
                        accuracy={form.data.location_accuracy_m}
                        selfiePreview={selfiePreview}
                        processing={form.processing}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={stepIndex === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Kembali
                </Button>
                
                {currentStep !== 'confirm' ? (
                    <Button
                        onClick={nextStep}
                        disabled={!canProceed()}
                    >
                        Lanjut
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={form.processing}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {form.processing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Kirim Absensi
                    </Button>
                )}
            </div>
        </div>
    );
}

// Step Components
function ConsentStep({ accepted, onAccept }: { accepted: boolean; onAccept: (v: boolean) => void }) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Shield className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    Persetujuan Privasi
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Untuk melakukan absensi, kami memerlukan akses ke kamera dan lokasi Anda.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                    Data yang dikumpulkan:
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-emerald-600" />
                        <span>Lokasi GPS untuk verifikasi kehadiran di area kampus</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Camera className="h-4 w-4 mt-0.5 text-emerald-600" />
                        <span>Foto selfie untuk verifikasi identitas</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <QrCode className="h-4 w-4 mt-0.5 text-emerald-600" />
                        <span>Scan QR code untuk token absensi</span>
                    </li>
                </ul>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:hover:bg-slate-900">
                <Checkbox
                    checked={accepted}
                    onCheckedChange={(v) => onAccept(Boolean(v))}
                    className="mt-0.5"
                />
                <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                        Saya menyetujui penggunaan kamera dan lokasi
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Dengan mencentang ini, Anda menyetujui{' '}
                        <a href="/privacy" className="text-emerald-600 underline">
                            kebijakan privasi
                        </a>{' '}
                        kami.
                    </p>
                </div>
            </label>
        </div>
    );
}

function TokenStep({
    token,
    onTokenChange,
    scanning,
    scanError,
    onStartScan,
    onStopScan,
    videoRef,
}: {
    token: string;
    onTokenChange: (t: string) => void;
    scanning: boolean;
    scanError: string | null;
    onStartScan: () => void;
    onStopScan: () => void;
    videoRef: React.RefObject<HTMLVideoElement>;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                    <QrCode className="h-8 w-8 text-violet-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    Scan Token Absensi
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Scan QR code dari admin atau masukkan token manual
                </p>
            </div>

            {/* QR Scanner */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900">
                <video
                    ref={videoRef}
                    className={cn('h-full w-full object-cover', !scanning && 'hidden')}
                    playsInline
                    muted
                />
                {!scanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Scan className="h-12 w-12 text-slate-600 mb-3" />
                        <p className="text-slate-400 text-sm">Kamera siap digunakan</p>
                    </div>
                )}
                {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-emerald-400 rounded-lg animate-pulse" />
                    </div>
                )}
            </div>

            {scanError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm dark:bg-rose-900/30 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                    {scanError}
                </div>
            )}

            <div className="flex gap-2">
                {!scanning ? (
                    <Button onClick={onStartScan} className="flex-1">
                        <Camera className="h-4 w-4 mr-2" />
                        Mulai Scan
                    </Button>
                ) : (
                    <Button onClick={onStopScan} variant="outline" className="flex-1">
                        Berhenti
                    </Button>
                )}
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 dark:bg-slate-950">atau</span>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Input Token Manual
                </label>
                <Input
                    value={token}
                    onChange={(e) => onTokenChange(e.target.value)}
                    placeholder="Masukkan token absensi"
                    className="mt-1"
                />
            </div>

            {token && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm dark:bg-emerald-900/30 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    Token terisi: {token.substring(0, 20)}...
                </div>
            )}
        </div>
    );
}

function LocationStep({
    geofence,
    latitude,
    longitude,
    accuracy,
    distance,
    isInRange,
    loading,
    error,
    samples,
    requiredSamples,
    onCollect,
    onRefresh,
}: {
    geofence: GeofenceInfo;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    distance: number | null;
    isInRange: boolean;
    loading: boolean;
    error: GeolocationPositionError | null;
    samples: any[];
    requiredSamples: number;
    onCollect: () => void;
    onRefresh: () => void;
}) {
    const [collecting, setCollecting] = useState(false);

    const handleCollect = async () => {
        setCollecting(true);
        await onCollect();
        setCollecting(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className={cn(
                    'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
                    isInRange ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                )}>
                    <MapPin className={cn('h-8 w-8', isInRange ? 'text-emerald-600' : 'text-amber-600')} />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    Verifikasi Lokasi
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Pastikan Anda berada dalam radius {geofence.radius_m}m dari titik absensi
                </p>
            </div>

            {/* Location Status */}
            <div className={cn(
                'p-4 rounded-xl border',
                isInRange 
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
            )}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={cn('font-medium', isInRange ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400')}>
                            {isInRange ? '✓ Dalam jangkauan' : '⚠ Di luar jangkauan'}
                        </p>
                        {distance !== null && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Jarak: {Math.round(distance)}m dari titik absen
                            </p>
                        )}
                    </div>
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                </div>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Latitude</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-white">
                        {latitude?.toFixed(6) || '-'}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Longitude</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-white">
                        {longitude?.toFixed(6) || '-'}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Akurasi</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-white">
                        ±{accuracy ? Math.round(accuracy) : '-'}m
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Sampel</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-white">
                        {samples.length}/{requiredSamples}
                    </p>
                </div>
            </div>

            {/* Sample Progress */}
            <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Pengumpulan sampel lokasi</span>
                    <span>{samples.length}/{requiredSamples}</span>
                </div>
                <Progress value={(samples.length / requiredSamples) * 100} className="h-2" />
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm dark:bg-rose-900/30 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                    {error.message}
                </div>
            )}

            <div className="flex gap-2">
                <Button
                    onClick={handleCollect}
                    disabled={collecting || !isInRange}
                    className="flex-1"
                >
                    {collecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Navigation className="h-4 w-4 mr-2" />
                    )}
                    {collecting ? 'Mengumpulkan...' : 'Kumpulkan Lokasi'}
                </Button>
                <Button variant="outline" onClick={onRefresh}>
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function SelfieStep({
    required,
    preview,
    active,
    loading,
    error,
    videoRef,
    canvasRef,
    onStart,
    onCapture,
    onRetake,
}: {
    required: boolean;
    preview: string | null;
    active: boolean;
    loading: boolean;
    error: string | null;
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onStart: () => void;
    onCapture: () => void;
    onRetake: () => void;
}) {
    if (!required) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Camera className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    Selfie Tidak Diperlukan
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Admin tidak mewajibkan selfie untuk sesi ini. Anda bisa langsung lanjut.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
                    <Camera className="h-8 w-8 text-sky-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    Ambil Selfie
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Pastikan wajah Anda terlihat jelas di kamera
                </p>
            </div>

            {/* Camera/Preview */}
            <div className="relative aspect-[3/4] max-w-xs mx-auto rounded-2xl overflow-hidden bg-slate-900">
                {preview ? (
                    <img src={preview} alt="Selfie preview" className="h-full w-full object-cover" />
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            className={cn('h-full w-full object-cover scale-x-[-1]', !active && 'hidden')}
                            playsInline
                            muted
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        {!active && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Camera className="h-12 w-12 text-slate-600 mb-3" />
                                <p className="text-slate-400 text-sm">Kamera belum aktif</p>
                            </div>
                        )}
                    </>
                )}

                {/* Face Guide */}
                {active && !preview && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-40 h-52 border-2 border-white/50 rounded-[50%]" />
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm dark:bg-rose-900/30 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <div className="flex gap-2 justify-center">
                {!active && !preview && (
                    <Button onClick={onStart} disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Camera className="h-4 w-4 mr-2" />
                        )}
                        Nyalakan Kamera
                    </Button>
                )}
                {active && !preview && (
                    <Button onClick={onCapture} className="bg-sky-600 hover:bg-sky-700">
                        <Camera className="h-4 w-4 mr-2" />
                        Ambil Foto
                    </Button>
                )}
                {preview && (
                    <>
                        <Button variant="outline" onClick={onRetake}>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Foto Ulang
                        </Button>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                            Foto tersimpan
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ConfirmStep({
    token,
    location,
    accuracy,
    selfiePreview,
    processing,
    onSubmit,
}: {
    token: string;
    location: { lat: string; lng: string };
    accuracy: number | null;
    selfiePreview: string | null;
    processing: boolean;
    onSubmit: () => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    Konfirmasi Absensi
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Periksa kembali data sebelum mengirim
                </p>
            </div>

            <div className="space-y-4">
                {/* Token */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <QrCode className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Token</p>
                            <p className="font-mono text-sm text-slate-900 dark:text-white">
                                {token.substring(0, 30)}...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Lokasi</p>
                            <p className="font-mono text-sm text-slate-900 dark:text-white">
                                {location.lat}, {location.lng}
                            </p>
                            <p className="text-xs text-slate-400">
                                Akurasi: ±{accuracy}m
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selfie */}
                {selfiePreview && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <img
                                src={selfiePreview}
                                alt="Selfie"
                                className="h-16 w-16 rounded-lg object-cover"
                            />
                            <div>
                                <p className="text-xs text-slate-500">Selfie</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    ✓ Foto tersimpan
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                    ⚠️ Pastikan semua data sudah benar. Absensi tidak dapat diubah setelah dikirim.
                </p>
            </div>
        </div>
    );
}

function SuccessScreen({ onReset }: { onReset: () => void }) {
    return (
        <div className="text-center py-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-bounce">
                <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                Absensi Berhasil! 🎉
            </h2>
            <p className="mt-2 text-slate-500">
                Kehadiran Anda telah tercatat dalam sistem
            </p>
            <div className="mt-8 flex justify-center gap-3">
                <Button variant="outline" onClick={onReset}>
                    Absen Lagi
                </Button>
                <Button asChild>
                    <a href="/user/rekapan">Lihat Rekapan</a>
                </Button>
            </div>
        </div>
    );
}
