import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, X, RefreshCw, Activity } from 'lucide-react';
import { useNetworkQuality, type NetworkQuality } from '@/hooks/use-network-quality';

/* ─────────────────────────────────────────────── */
/*  Network Quality Alert — Ultra Professional    */
/*  Minimal palette · Glassmorphism · Micro-anim  */
/* ─────────────────────────────────────────────── */

interface AlertConfig {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accentClass: string;
    pulseClass: string;
    barWidth: string;
}

const ALERT_MAP: Record<Exclude<NetworkQuality, 'good'>, AlertConfig> = {
    slow: {
        icon: <SignalLow className="h-4 w-4" />,
        title: 'Koneksi Lambat',
        subtitle: 'Beberapa fitur mungkin membutuhkan waktu lebih lama untuk dimuat',
        accentClass: 'bg-amber-500/80',
        pulseClass: 'bg-amber-400',
        barWidth: 'w-1/2',
    },
    unstable: {
        icon: <SignalMedium className="h-4 w-4" />,
        title: 'Koneksi Tidak Stabil',
        subtitle: 'Koneksi Anda sedang berfluktuasi. Data akan disinkronkan otomatis',
        accentClass: 'bg-orange-500/80',
        pulseClass: 'bg-orange-400',
        barWidth: 'w-1/3',
    },
    offline: {
        icon: <WifiOff className="h-4 w-4" />,
        title: 'Tidak Ada Koneksi',
        subtitle: 'Anda sedang offline. Perubahan akan disimpan dan dikirim saat online kembali',
        accentClass: 'bg-red-500/70',
        pulseClass: 'bg-red-400',
        barWidth: 'w-0',
    },
};

export function NetworkQualityAlert() {
    const { quality, rtt, downlink, lastPingMs } = useNetworkQuality();
    const [dismissed, setDismissed] = useState(false);
    const [showMetrics, setShowMetrics] = useState(false);
    const [recovering, setRecovering] = useState(false);
    const [prevQuality, setPrevQuality] = useState<NetworkQuality>(quality);

    // Reset dismiss when quality changes significantly
    useEffect(() => {
        if (quality !== prevQuality) {
            // If recovering from bad → good, show brief recovery toast
            if (quality === 'good' && prevQuality !== 'good') {
                setRecovering(true);
                setDismissed(false);
                const t = setTimeout(() => setRecovering(false), 3000);
                return () => clearTimeout(t);
            }
            // If worsening, un-dismiss
            if (quality !== 'good') {
                setDismissed(false);
            }
            setPrevQuality(quality);
        }
    }, [quality, prevQuality]);

    const handleDismiss = useCallback(() => {
        setDismissed(true);
        setShowMetrics(false);
    }, []);

    const isVisible = (!dismissed && quality !== 'good') || recovering;
    const config = quality !== 'good' ? ALERT_MAP[quality] : null;

    return (
        <AnimatePresence mode="wait">
            {/* Recovery toast — brief "back online" notification */}
            {recovering && quality === 'good' && (
                <motion.div
                    key="recovery"
                    initial={{ y: -80, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -80, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="fixed left-1/2 top-4 z-[9999] -translate-x-1/2"
                >
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/80 px-5 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl dark:bg-neutral-950/80">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                            <Wifi className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Koneksi Pulih</p>
                            <p className="text-xs text-neutral-400">Jaringan Anda kembali normal</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main quality alert */}
            {isVisible && config && !recovering && (
                <motion.div
                    key={quality}
                    initial={{ y: -80, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -80, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="fixed left-1/2 top-4 z-[9999] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
                >
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/85 shadow-2xl shadow-black/40 backdrop-blur-xl dark:bg-neutral-950/85">
                        {/* Animated accent bar at top */}
                        <div className="relative h-[3px] w-full bg-neutral-800/60">
                            <motion.div
                                className={`absolute inset-y-0 left-0 ${config.accentClass}`}
                                initial={{ width: '100%' }}
                                animate={{ width: quality === 'offline' ? '0%' : quality === 'unstable' ? '40%' : '60%' }}
                                transition={{ duration: 1.5, ease: 'easeInOut' }}
                            />
                            {/* Subtle pulse shimmer */}
                            {quality !== 'offline' && (
                                <motion.div
                                    className={`absolute inset-y-0 left-0 w-16 ${config.pulseClass}`}
                                    animate={{ x: [0, 200, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    style={{ opacity: 0.3, filter: 'blur(8px)' }}
                                />
                            )}
                        </div>

                        <div className="px-4 py-3.5">
                            <div className="flex items-start gap-3">
                                {/* Icon with subtle pulse animation */}
                                <div className="relative mt-0.5 flex-shrink-0">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${config.accentClass} text-white`}>
                                        {config.icon}
                                    </div>
                                    {quality === 'offline' && (
                                        <motion.div
                                            className="absolute -inset-1 rounded-xl border-2 border-red-500/30"
                                            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[13px] font-semibold tracking-tight text-white">
                                            {config.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5">
                                            {/* Metrics toggle */}
                                            <button
                                                onClick={() => setShowMetrics(!showMetrics)}
                                                className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                                title="Lihat detail jaringan"
                                            >
                                                <Activity className="h-3.5 w-3.5 text-neutral-400" />
                                            </button>
                                            {/* Dismiss */}
                                            <button
                                                onClick={handleDismiss}
                                                className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                            >
                                                <X className="h-3.5 w-3.5 text-neutral-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">
                                        {config.subtitle}
                                    </p>

                                    {/* Expandable metrics panel */}
                                    <AnimatePresence>
                                        {showMetrics && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-3 grid grid-cols-3 gap-2">
                                                    <MetricCard
                                                        label="Ping"
                                                        value={lastPingMs ? `${lastPingMs}ms` : '—'}
                                                        status={lastPingMs ? (lastPingMs > 2000 ? 'bad' : lastPingMs > 800 ? 'warn' : 'ok') : 'bad'}
                                                    />
                                                    <MetricCard
                                                        label="RTT"
                                                        value={rtt ? `${rtt}ms` : '—'}
                                                        status={rtt ? (rtt > 1500 ? 'bad' : rtt > 600 ? 'warn' : 'ok') : 'bad'}
                                                    />
                                                    <MetricCard
                                                        label="Speed"
                                                        value={downlink ? `${downlink}Mbps` : '—'}
                                                        status={downlink ? (downlink < 1 ? 'bad' : downlink < 5 ? 'warn' : 'ok') : 'bad'}
                                                    />
                                                </div>

                                                {/* Signal strength visualization */}
                                                <div className="mt-2.5 flex items-center gap-2">
                                                    <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">
                                                        Kualitas
                                                    </span>
                                                    <div className="flex flex-1 gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((i) => {
                                                            const filled =
                                                                quality === 'offline' ? 0 :
                                                                    quality === 'unstable' ? 2 :
                                                                        quality === 'slow' ? 3 : 5;
                                                            return (
                                                                <motion.div
                                                                    key={i}
                                                                    className={`h-1 flex-1 rounded-full ${i <= filled
                                                                            ? quality === 'offline'
                                                                                ? 'bg-red-500/70'
                                                                                : quality === 'unstable'
                                                                                    ? 'bg-orange-500/70'
                                                                                    : 'bg-amber-500/70'
                                                                            : 'bg-neutral-700/50'
                                                                        }`}
                                                                    initial={{ scaleX: 0 }}
                                                                    animate={{ scaleX: 1 }}
                                                                    transition={{ delay: i * 0.05, duration: 0.3 }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ── Metric Card sub-component ── */
function MetricCard({ label, value, status }: { label: string; value: string; status: 'ok' | 'warn' | 'bad' }) {
    const dotColor = status === 'ok' ? 'bg-emerald-400' : status === 'warn' ? 'bg-amber-400' : 'bg-red-400';

    return (
        <div className="rounded-lg bg-white/[0.04] px-2.5 py-2">
            <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    {label}
                </span>
            </div>
            <p className="mt-1 text-xs font-semibold tabular-nums text-neutral-200">{value}</p>
        </div>
    );
}
