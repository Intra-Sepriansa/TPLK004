import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, RefreshCcw, CheckCircle, XCircle, AlertTriangle, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationSample {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

interface LocationValidatorProps {
    targetLat: number;
    targetLng: number;
    radiusMeters: number;
    requiredSamples?: number;
    maxSpreadMeters?: number;
    onSuccess: (samples: LocationSample[]) => void;
    onFailure: (reason: string) => void;
}

export function LocationValidator({
    targetLat,
    targetLng,
    radiusMeters,
    requiredSamples = 3,
    maxSpreadMeters = 50,
    onSuccess,
    onFailure,
}: LocationValidatorProps) {
    const {
        latitude,
        longitude,
        accuracy,
        timestamp,
        error,
        loading,
        refresh,
        calculateDistance,
        isWithinRadius,
    } = useGeolocation({ watch: true, enableHighAccuracy: true });

    const [samples, setSamples] = useState<LocationSample[]>([]);
    const [status, setStatus] = useState<'idle' | 'collecting' | 'validating' | 'success' | 'failed'>('idle');
    const [failureReason, setFailureReason] = useState<string | null>(null);

    const distance = latitude && longitude ? calculateDistance(targetLat, targetLng) : null;
    const isInRange = latitude && longitude ? isWithinRadius(targetLat, targetLng, radiusMeters) : false;

    // Collect samples
    useEffect(() => {
        if (status !== 'collecting' || !latitude || !longitude || !timestamp) return;

        const newSample: LocationSample = {
            latitude,
            longitude,
            accuracy: accuracy || 0,
            timestamp,
        };

        // Check if this is a new sample (different timestamp)
        const lastSample = samples[samples.length - 1];
        if (lastSample && lastSample.timestamp === timestamp) return;

        setSamples((prev) => [...prev, newSample]);
    }, [status, latitude, longitude, accuracy, timestamp, samples]);

    // Validate samples when we have enough
    useEffect(() => {
        if (status !== 'collecting' || samples.length < requiredSamples) return;

        setStatus('validating');
        validateSamples();
    }, [samples.length, status, requiredSamples]);

    const validateSamples = () => {
        // Check 1: All samples within geofence
        const allInRange = samples.every((sample) => {
            const dist = calculateDistanceBetween(
                sample.latitude,
                sample.longitude,
                targetLat,
                targetLng
            );
            return dist <= radiusMeters;
        });

        if (!allInRange) {
            setStatus('failed');
            setFailureReason('Beberapa sampel lokasi berada di luar area yang diizinkan');
            onFailure('Location samples outside geofence');
            return;
        }

        // Check 2: Samples are consistent (not jumping around)
        const spread = calculateSpread(samples);
        if (spread > maxSpreadMeters) {
            setStatus('failed');
            setFailureReason('Lokasi tidak konsisten. Kemungkinan GPS spoofing terdeteksi.');
            onFailure('Location spread too large - possible spoofing');
            return;
        }

        // Check 3: Reasonable accuracy
        const avgAccuracy = samples.reduce((sum, s) => sum + s.accuracy, 0) / samples.length;
        if (avgAccuracy > 100) {
            setStatus('failed');
            setFailureReason('Akurasi GPS terlalu rendah. Coba di area terbuka.');
            onFailure('GPS accuracy too low');
            return;
        }

        // All checks passed
        setStatus('success');
        onSuccess(samples);
    };

    const calculateDistanceBetween = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const calculateSpread = (samples: LocationSample[]): number => {
        if (samples.length < 2) return 0;

        let maxDist = 0;
        for (let i = 0; i < samples.length; i++) {
            for (let j = i + 1; j < samples.length; j++) {
                const dist = calculateDistanceBetween(
                    samples[i].latitude,
                    samples[i].longitude,
                    samples[j].latitude,
                    samples[j].longitude
                );
                maxDist = Math.max(maxDist, dist);
            }
        }
        return maxDist;
    };

    const startCollection = () => {
        setSamples([]);
        setStatus('collecting');
        setFailureReason(null);
    };

    const reset = () => {
        setSamples([]);
        setStatus('idle');
        setFailureReason(null);
        refresh();
    };

    return (
        <div className="space-y-4">
            {/* Status Card */}
            <div className={cn(
                'rounded-2xl border p-6 transition-colors',
                status === 'success' && 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
                status === 'failed' && 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30',
                status !== 'success' && status !== 'failed' && 'border-slate-200/70 bg-white/80 dark:border-slate-800/70 dark:bg-slate-950/70'
            )}>
                <div className="flex items-start gap-4">
                    <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full',
                        status === 'success' && 'bg-emerald-500 text-white',
                        status === 'failed' && 'bg-rose-500 text-white',
                        status !== 'success' && status !== 'failed' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    )}>
                        {status === 'success' ? (
                            <CheckCircle className="h-6 w-6" />
                        ) : status === 'failed' ? (
                            <XCircle className="h-6 w-6" />
                        ) : loading ? (
                            <Navigation className="h-6 w-6 animate-pulse" />
                        ) : (
                            <MapPin className="h-6 w-6" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            {status === 'success' && 'Lokasi Terverifikasi'}
                            {status === 'failed' && 'Verifikasi Gagal'}
                            {status === 'collecting' && 'Mengumpulkan Data Lokasi...'}
                            {status === 'validating' && 'Memvalidasi Lokasi...'}
                            {status === 'idle' && (loading ? 'Mencari Lokasi...' : 'Validasi Lokasi')}
                        </h3>

                        {error && (
                            <p className="text-sm text-rose-600 mt-1">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                {error.message}
                            </p>
                        )}

                        {failureReason && (
                            <p className="text-sm text-rose-600 mt-1">{failureReason}</p>
                        )}

                        {distance !== null && status !== 'success' && status !== 'failed' && (
                            <div className="mt-2 space-y-1">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Jarak ke titik absen: <span className="font-medium">{Math.round(distance)}m</span>
                                </p>
                                <p className={cn(
                                    'text-sm font-medium',
                                    isInRange ? 'text-emerald-600' : 'text-rose-600'
                                )}>
                                    {isInRange ? '✓ Dalam radius yang diizinkan' : '✗ Di luar radius yang diizinkan'}
                                </p>
                            </div>
                        )}

                        {status === 'collecting' && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Sampel terkumpul</span>
                                    <span>{samples.length}/{requiredSamples}</span>
                                </div>
                                <Progress value={(samples.length / requiredSamples) * 100} className="h-2" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Details */}
            {latitude && longitude && status !== 'success' && status !== 'failed' && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200/70 bg-white/50 p-3 dark:border-slate-800/70 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500">Latitude</p>
                        <p className="font-mono text-slate-900 dark:text-white">{latitude.toFixed(6)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/50 p-3 dark:border-slate-800/70 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500">Longitude</p>
                        <p className="font-mono text-slate-900 dark:text-white">{longitude.toFixed(6)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/50 p-3 dark:border-slate-800/70 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500">Akurasi</p>
                        <p className="font-mono text-slate-900 dark:text-white">{accuracy ? `±${Math.round(accuracy)}m` : '-'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/50 p-3 dark:border-slate-800/70 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500">Radius Target</p>
                        <p className="font-mono text-slate-900 dark:text-white">{radiusMeters}m</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                {status === 'idle' && (
                    <Button
                        onClick={startCollection}
                        className="flex-1"
                        disabled={loading || !isInRange}
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        {!isInRange ? 'Di Luar Jangkauan' : 'Mulai Validasi'}
                    </Button>
                )}
                {(status === 'success' || status === 'failed') && (
                    <Button onClick={reset} variant="outline" className="flex-1">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Ulangi
                    </Button>
                )}
            </div>
        </div>
    );
}
