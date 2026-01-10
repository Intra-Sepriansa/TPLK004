import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
    targetDate?: Date;
    seconds?: number;
    onComplete?: () => void;
    autoStart?: boolean;
}

interface CountdownResult {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isRunning: boolean;
    isComplete: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
    formatted: string;
}

export function useCountdown({
    targetDate,
    seconds: initialSeconds,
    onComplete,
    autoStart = true,
}: UseCountdownOptions): CountdownResult {
    const calculateTimeLeft = useCallback(() => {
        if (targetDate) {
            return Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000));
        }
        return initialSeconds || 0;
    }, [targetDate, initialSeconds]);

    const [totalSeconds, setTotalSeconds] = useState(calculateTimeLeft);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!isRunning || totalSeconds <= 0) {
            if (totalSeconds <= 0 && !isComplete) {
                setIsComplete(true);
                onComplete?.();
            }
            return;
        }

        const interval = setInterval(() => {
            setTotalSeconds((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, totalSeconds, isComplete, onComplete]);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const start = useCallback(() => {
        setIsRunning(true);
        setIsComplete(false);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        setTotalSeconds(calculateTimeLeft());
        setIsComplete(false);
        if (autoStart) {
            setIsRunning(true);
        }
    }, [calculateTimeLeft, autoStart]);

    const formatted = (() => {
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        }
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    })();

    return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isRunning,
        isComplete,
        start,
        pause,
        reset,
        formatted,
    };
}
