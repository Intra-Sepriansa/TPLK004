import { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera } from '@/hooks/use-camera';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, RefreshCcw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Challenge = 'blink' | 'smile' | 'turn_left' | 'turn_right' | 'nod';

interface LivenessDetectionProps {
    onSuccess: (imageData: string) => void;
    onFailure: (reason: string) => void;
    challenges?: Challenge[];
    maxAttempts?: number;
}

const challengeInstructions: Record<Challenge, string> = {
    blink: 'Kedipkan mata Anda',
    smile: 'Tersenyumlah',
    turn_left: 'Putar kepala ke kiri',
    turn_right: 'Putar kepala ke kanan',
    nod: 'Anggukkan kepala',
};

export function LivenessDetection({
    onSuccess,
    onFailure,
    challenges = ['blink', 'smile'],
    maxAttempts = 3,
}: LivenessDetectionProps) {
    const { videoRef, canvasRef, isActive, isLoading, error, start, stop, capture } = useCamera({
        facingMode: 'user',
        width: 640,
        height: 480,
    });

    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [status, setStatus] = useState<'idle' | 'detecting' | 'success' | 'failed'>('idle');
    const [progress, setProgress] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [showCountdown, setShowCountdown] = useState(false);
    const detectionRef = useRef<NodeJS.Timeout | null>(null);

    const currentChallenge = challenges[currentChallengeIndex];

    const startDetection = useCallback(() => {
        setShowCountdown(true);
        setCountdown(3);

        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setShowCountdown(false);
                    setStatus('detecting');
                    simulateDetection();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Simulated detection (in real app, this would use ML model)
    const simulateDetection = useCallback(() => {
        setProgress(0);
        let progressValue = 0;

        detectionRef.current = setInterval(() => {
            progressValue += Math.random() * 15 + 5;
            setProgress(Math.min(progressValue, 100));

            if (progressValue >= 100) {
                clearInterval(detectionRef.current!);
                
                // Simulate success/failure (80% success rate)
                const isSuccess = Math.random() > 0.2;

                if (isSuccess) {
                    if (currentChallengeIndex < challenges.length - 1) {
                        setCurrentChallengeIndex((prev) => prev + 1);
                        setProgress(0);
                        setTimeout(() => startDetection(), 1000);
                    } else {
                        setStatus('success');
                        const imageData = capture();
                        if (imageData) {
                            onSuccess(imageData);
                        }
                    }
                } else {
                    setAttempts((prev) => prev + 1);
                    if (attempts + 1 >= maxAttempts) {
                        setStatus('failed');
                        onFailure('Terlalu banyak percobaan gagal');
                    } else {
                        setProgress(0);
                        setTimeout(() => startDetection(), 1000);
                    }
                }
            }
        }, 100);
    }, [currentChallengeIndex, challenges.length, attempts, maxAttempts, capture, onSuccess, onFailure, startDetection]);

    const reset = useCallback(() => {
        if (detectionRef.current) {
            clearInterval(detectionRef.current);
        }
        setCurrentChallengeIndex(0);
        setAttempts(0);
        setStatus('idle');
        setProgress(0);
        setShowCountdown(false);
    }, []);

    useEffect(() => {
        return () => {
            if (detectionRef.current) {
                clearInterval(detectionRef.current);
            }
            stop();
        };
    }, [stop]);

    return (
        <div className="space-y-4">
            {/* Camera View */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                        'h-full w-full object-cover scale-x-[-1]',
                        !isActive && 'hidden'
                    )}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay */}
                {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Face Guide */}
                        <div className={cn(
                            'w-48 h-64 border-4 rounded-[50%] transition-colors duration-300',
                            status === 'detecting' && 'border-amber-400 animate-pulse',
                            status === 'success' && 'border-emerald-400',
                            status === 'failed' && 'border-rose-400',
                            status === 'idle' && 'border-white/50'
                        )} />

                        {/* Countdown */}
                        {showCountdown && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <span className="text-6xl font-bold text-white animate-ping">
                                    {countdown}
                                </span>
                            </div>
                        )}

                        {/* Status Overlay */}
                        {status === 'success' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/80">
                                <CheckCircle className="h-16 w-16 text-white" />
                                <p className="mt-2 text-lg font-semibold text-white">
                                    Verifikasi Berhasil!
                                </p>
                            </div>
                        )}

                        {status === 'failed' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-500/80">
                                <XCircle className="h-16 w-16 text-white" />
                                <p className="mt-2 text-lg font-semibold text-white">
                                    Verifikasi Gagal
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading/Error State */}
                {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {isLoading ? (
                            <div className="text-white">Memuat kamera...</div>
                        ) : error ? (
                            <div className="text-center text-rose-400">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">{error}</p>
                            </div>
                        ) : (
                            <Camera className="h-12 w-12 text-slate-600" />
                        )}
                    </div>
                )}
            </div>

            {/* Challenge Info */}
            {isActive && status !== 'success' && status !== 'failed' && (
                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">
                            Tantangan {currentChallengeIndex + 1} dari {challenges.length}
                        </span>
                        <span className="text-xs text-slate-500">
                            Percobaan: {attempts}/{maxAttempts}
                        </span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                        {challengeInstructions[currentChallenge]}
                    </p>
                    {status === 'detecting' && (
                        <Progress value={progress} className="h-2" />
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                {!isActive ? (
                    <Button onClick={start} className="flex-1" disabled={isLoading}>
                        <Camera className="h-4 w-4 mr-2" />
                        Mulai Kamera
                    </Button>
                ) : status === 'idle' ? (
                    <Button onClick={startDetection} className="flex-1">
                        Mulai Verifikasi
                    </Button>
                ) : status === 'success' || status === 'failed' ? (
                    <Button onClick={reset} variant="outline" className="flex-1">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Ulangi
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
