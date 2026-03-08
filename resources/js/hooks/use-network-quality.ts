import { useEffect, useRef, useState, useCallback } from 'react';

export type NetworkQuality = 'good' | 'slow' | 'unstable' | 'offline';

interface NetworkQualityState {
    quality: NetworkQuality;
    rtt: number | null;
    downlink: number | null;
    effectiveType: string | null;
    lastPingMs: number | null;
    failedPings: number;
}

const PING_INTERVAL_MS = 8000; // Check every 8 seconds
const PING_TIMEOUT_MS = 5000;
const SLOW_THRESHOLD_MS = 2000;
const PING_HISTORY_SIZE = 3;

/**
 * Hook to detect network quality in real-time.
 * Uses a combination of Navigator.connection API and periodic ping checks.
 *
 * Returns:
 * - `quality`: 'good' | 'slow' | 'unstable' | 'offline'
 * - Various raw metrics (rtt, downlink, lastPingMs, etc.)
 */
export function useNetworkQuality(): NetworkQualityState {
    const [state, setState] = useState<NetworkQualityState>(() => ({
        quality: navigator.onLine ? 'good' : 'offline',
        rtt: null,
        downlink: null,
        effectiveType: null,
        lastPingMs: null,
        failedPings: 0,
    }));

    const pingHistory = useRef<('ok' | 'fail')[]>([]);
    const pingTimings = useRef<number[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const evaluateQuality = useCallback((): NetworkQuality => {
        if (!navigator.onLine) return 'offline';

        const connection = (navigator as any).connection;
        const effectiveType: string | null = connection?.effectiveType ?? null;

        // Check Navigator.connection hints
        if (effectiveType === 'slow-2g') return 'slow';
        if (effectiveType === '2g') return 'unstable';

        // Check ping history
        const history = pingHistory.current;
        const timings = pingTimings.current;

        if (history.length >= 2) {
            const recentFails = history.slice(-PING_HISTORY_SIZE).filter(r => r === 'fail').length;

            // 2+ failures out of last 3 = unstable
            if (recentFails >= 2) return 'unstable';

            // 1 fail + slow timing = unstable
            if (recentFails >= 1 && timings.length > 0) {
                const lastTiming = timings[timings.length - 1];
                if (lastTiming > SLOW_THRESHOLD_MS) return 'unstable';
            }
        }

        // Check ping timing
        if (timings.length > 0) {
            const recentTimings = timings.slice(-PING_HISTORY_SIZE);
            const avgTiming = recentTimings.reduce((a, b) => a + b, 0) / recentTimings.length;
            if (avgTiming > SLOW_THRESHOLD_MS) return 'slow';
        }

        // Check connection RTT
        if (connection?.rtt && connection.rtt > 1500) return 'slow';

        return 'good';
    }, []);

    const doPing = useCallback(async () => {
        if (!navigator.onLine) {
            pingHistory.current.push('fail');
            if (pingHistory.current.length > PING_HISTORY_SIZE) pingHistory.current.shift();

            const connection = (navigator as any).connection;
            setState({
                quality: 'offline',
                rtt: connection?.rtt ?? null,
                downlink: connection?.downlink ?? null,
                effectiveType: connection?.effectiveType ?? null,
                lastPingMs: null,
                failedPings: pingHistory.current.filter(r => r === 'fail').length,
            });
            return;
        }

        const start = performance.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

        try {
            // Ping favicon with cache-busting query param
            await fetch(`/favicon.ico?_nc=${Date.now()}`, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
            });

            const elapsed = Math.round(performance.now() - start);
            clearTimeout(timeout);

            pingHistory.current.push('ok');
            pingTimings.current.push(elapsed);
            if (pingHistory.current.length > PING_HISTORY_SIZE) pingHistory.current.shift();
            if (pingTimings.current.length > PING_HISTORY_SIZE) pingTimings.current.shift();

            const connection = (navigator as any).connection;
            const quality = evaluateQuality();

            setState({
                quality,
                rtt: connection?.rtt ?? null,
                downlink: connection?.downlink ?? null,
                effectiveType: connection?.effectiveType ?? null,
                lastPingMs: elapsed,
                failedPings: pingHistory.current.filter(r => r === 'fail').length,
            });
        } catch {
            clearTimeout(timeout);
            pingHistory.current.push('fail');
            if (pingHistory.current.length > PING_HISTORY_SIZE) pingHistory.current.shift();

            const connection = (navigator as any).connection;
            const quality = evaluateQuality();

            setState({
                quality,
                rtt: connection?.rtt ?? null,
                downlink: connection?.downlink ?? null,
                effectiveType: connection?.effectiveType ?? null,
                lastPingMs: null,
                failedPings: pingHistory.current.filter(r => r === 'fail').length,
            });
        }
    }, [evaluateQuality]);

    useEffect(() => {
        // Initial ping
        doPing();

        // Periodic ping
        intervalRef.current = setInterval(doPing, PING_INTERVAL_MS);

        // Listen to online/offline events for immediate updates
        const handleOnline = () => {
            // Small delay to let the connection stabilize
            setTimeout(doPing, 1000);
        };
        const handleOffline = () => {
            setState(prev => ({ ...prev, quality: 'offline' }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Listen to connection change events (if available)
        const connection = (navigator as any).connection;
        const handleConnectionChange = () => doPing();
        if (connection?.addEventListener) {
            connection.addEventListener('change', handleConnectionChange);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (connection?.removeEventListener) {
                connection.removeEventListener('change', handleConnectionChange);
            }
        };
    }, [doPing]);

    return state;
}
