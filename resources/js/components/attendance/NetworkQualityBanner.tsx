import { useNetworkQuality, type NetworkQuality } from '@/hooks/use-network-quality';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { SignalLow, SignalZero, Wifi, WifiOff, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const RECOVERY_DISPLAY_MS = 4000;

// ─── Color palette per state ───────────────────────────────────────
const STATE_COLORS = {
    slow: {
        from: '#f59e0b',   // amber-500
        to: '#f97316',     // orange-500
        glow: '#fbbf24',   // amber-400
        particle: '#fde68a', // amber-200
    },
    unstable: {
        from: '#ef4444',   // red-500
        to: '#e11d48',     // rose-600
        glow: '#f87171',   // red-400
        particle: '#fecaca', // red-200
    },
    offline: {
        from: '#334155',   // slate-700
        to: '#1e293b',     // slate-800
        glow: '#64748b',   // slate-500
        particle: '#94a3b8', // slate-400
    },
    recovering: {
        from: '#10b981',   // emerald-500
        to: '#059669',     // emerald-600
        glow: '#34d399',   // emerald-400
        particle: '#a7f3d0', // emerald-200
    },
};

interface BannerConfig {
    icon: React.ElementType;
    title: string;
    message: string;
}

const BANNER_CONFIG: Record<Exclude<NetworkQuality, 'good'>, BannerConfig> = {
    slow: {
        icon: SignalLow,
        title: 'Jaringan Lambat',
        message: 'Koneksi internet kamu lambat. Jangan khawatir — jika pengiriman absen gagal, data akan otomatis tersimpan offline dan dikirim saat sinyal pulih.',
    },
    unstable: {
        icon: SignalZero,
        title: 'Koneksi Tidak Stabil',
        message: 'Sinyal internet tidak stabil. Lanjutkan saja absennya — data kamu akan tersimpan otomatis dan dikirim begitu koneksi pulih.',
    },
    offline: {
        icon: WifiOff,
        title: 'Mode Offline',
        message: 'Tidak ada koneksi internet. Kamu tetap bisa absen — data akan tersimpan di perangkat dan otomatis terkirim saat online kembali.',
    },
};

// ─── Particle burst effect ─────────────────────────────────────────
function ParticleBurst({ color, count = 8 }: { color: string; count?: number }) {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: count }).map((_, i) => {
                const angle = (360 / count) * i;
                const distance = 60 + Math.random() * 40;
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * distance;
                const y = Math.sin(rad) * distance;
                const size = 3 + Math.random() * 4;

                return (
                    <motion.div
                        key={i}
                        className="absolute left-1/2 top-1/2 rounded-full"
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: color,
                            marginLeft: -size / 2,
                            marginTop: -size / 2,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                            x,
                            y,
                            opacity: 0,
                            scale: 0.2,
                        }}
                        transition={{
                            duration: 0.7 + Math.random() * 0.3,
                            ease: 'easeOut',
                            delay: Math.random() * 0.15,
                        }}
                    />
                );
            })}
        </div>
    );
}

// ─── Scanning wave animation (for offline state) ───────────────────
function ScanningWaves() {
    return (
        <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-white/20"
                    style={{
                        width: 40 + i * 20,
                        height: 40 + i * 20,
                        top: -(20 + i * 10),
                        left: -(20 + i * 10),
                    }}
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.05, 0.3],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

// ─── Signal bars animation ─────────────────────────────────────────
function AnimatedSignalBars({ quality }: { quality: NetworkQuality }) {
    const bars = quality === 'slow' ? 1 : quality === 'unstable' ? 0 : 0;

    return (
        <div className="flex items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ height: 6 + i * 3 }}
                    animate={{
                        backgroundColor: i <= bars ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                        scaleY: quality === 'unstable' && i > 0
                            ? [1, 0.3, 1, 0.5, 1]
                            : 1,
                    }}
                    transition={{
                        backgroundColor: { duration: 0.3 },
                        scaleY: {
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                        },
                    }}
                />
            ))}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────
export function NetworkQualityBanner() {
    const { quality, lastPingMs } = useNetworkQuality();
    const [displayState, setDisplayState] = useState<'hidden' | 'warning' | 'recovering'>('hidden');
    const [dismissed, setDismissed] = useState(false);
    const [prevQuality, setPrevQuality] = useState<NetworkQuality>(quality);
    const [showParticles, setShowParticles] = useState(false);
    const [transitionKey, setTransitionKey] = useState(0);

    // Animated gradient progress bar
    const progress = useMotionValue(0);
    const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);

    useEffect(() => {
        const wasProblematic = prevQuality !== 'good';
        const isNowGood = quality === 'good';
        const isNowBad = quality !== 'good';

        if (isNowBad) {
            setDisplayState('warning');
            setDismissed(false);

            // Trigger transition animation if switching between bad states
            if (prevQuality !== 'good' && prevQuality !== quality) {
                setTransitionKey(k => k + 1);
                setShowParticles(true);
                setTimeout(() => setShowParticles(false), 800);
            }
        } else if (isNowGood && wasProblematic) {
            // Recovery! Show celebration
            setDisplayState('recovering');
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 1000);

            // Animate progress bar, then hide
            progress.set(0);
            animate(progress, 1, {
                duration: RECOVERY_DISPLAY_MS / 1000,
                ease: 'linear',
            });

            const timer = setTimeout(() => {
                setDisplayState('hidden');
            }, RECOVERY_DISPLAY_MS);

            setPrevQuality(quality);
            return () => clearTimeout(timer);
        } else if (isNowGood && !wasProblematic) {
            setDisplayState('hidden');
        }

        setPrevQuality(quality);
    }, [quality]);

    if (displayState === 'hidden') return null;
    if (dismissed) return null;

    const isRecovering = displayState === 'recovering';
    const activeQuality = isRecovering ? prevQuality : quality;
    const config = activeQuality !== 'good' ? BANNER_CONFIG[activeQuality as Exclude<NetworkQuality, 'good'>] : null;
    const colors = isRecovering
        ? STATE_COLORS.recovering
        : STATE_COLORS[quality as keyof typeof STATE_COLORS] ?? STATE_COLORS.offline;

    // ─── Offline → Online (Recovery) banner ────────────────────────
    if (isRecovering) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="recovery"
                    initial={{ opacity: 0, y: -30, scale: 0.9, rotateX: 15 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(4px)' }}
                    transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 22,
                    }}
                    className="mb-4 perspective-[800px]"
                >
                    <div
                        className="relative overflow-hidden rounded-2xl p-4 text-white shadow-xl shadow-emerald-500/20"
                        style={{
                            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                        }}
                    >
                        {/* Shimmer sweep */}
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                            }}
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />

                        {/* Glow orb */}
                        <motion.div
                            className="absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl"
                            style={{ backgroundColor: colors.glow }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 0.25, scale: 1.2 }}
                            transition={{ duration: 0.8 }}
                        />

                        {/* Particle burst on recovery */}
                        {showParticles && (
                            <div className="absolute left-6 top-1/2">
                                <ParticleBurst color={colors.particle} count={12} />
                            </div>
                        )}

                        {/* Progress bar */}
                        <motion.div
                            className="absolute bottom-0 left-0 h-[3px] rounded-full bg-white/30"
                            style={{ width: progressWidth }}
                        />

                        <div className="relative flex items-center gap-3">
                            {/* Animated check icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                    delay: 0.15,
                                }}
                                className="relative"
                            >
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-white/20"
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 2, 2], opacity: [0.4, 0.1, 0] }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                />
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                    <Wifi className="h-4 w-4" />
                                </div>
                            </motion.div>

                            {/* Text */}
                            <div className="min-w-0 flex-1">
                                <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <p className="text-sm font-bold">Koneksi Pulih!</p>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.4 }}
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                                    </motion.div>
                                </motion.div>
                                <motion.p
                                    className="mt-0.5 text-xs text-white/80"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Internet kembali stabil. Absen yang tertunda akan otomatis dikirim.
                                </motion.p>
                            </div>

                            {/* Lightning bolt icon */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: 'spring', delay: 0.35 }}
                            >
                                <Zap className="h-5 w-5 text-emerald-200" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // ─── Warning states (slow / unstable / offline) ────────────────
    if (!config) return null;
    const Icon = config.icon;

    // Different entrance based on severity
    const entranceVariants = {
        slow: {
            initial: { opacity: 0, y: -15, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
        },
        unstable: {
            initial: { opacity: 0, x: [-4, 4, -4, 2, 0], y: -20, scale: 0.96 },
            animate: { opacity: 1, x: 0, y: 0, scale: 1 },
        },
        offline: {
            initial: { opacity: 0, y: -40, scale: 0.9, rotateX: 20 },
            animate: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
        },
    };

    const variant = entranceVariants[quality as keyof typeof entranceVariants] ?? entranceVariants.slow;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`warning-${quality}-${transitionKey}`}
                initial={variant.initial}
                animate={variant.animate}
                exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: -10,
                    filter: 'blur(4px)',
                    transition: { duration: 0.3 },
                }}
                transition={{
                    type: 'spring',
                    stiffness: quality === 'offline' ? 300 : 400,
                    damping: quality === 'offline' ? 20 : 25,
                }}
                className="mb-4 perspective-[800px]"
            >
                <motion.div
                    className="relative overflow-hidden rounded-2xl p-4 text-white shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                    }}
                    // Shake on unstable
                    animate={
                        quality === 'unstable'
                            ? { x: [0, -2, 2, -1, 1, 0] }
                            : {}
                    }
                    transition={
                        quality === 'unstable'
                            ? { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
                            : {}
                    }
                >
                    {/* Animated background orbs */}
                    <motion.div
                        className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl"
                        style={{ backgroundColor: colors.glow }}
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.12, 0.22, 0.12],
                            x: [0, 10, 0],
                            y: [0, -5, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full blur-2xl"
                        style={{ backgroundColor: colors.glow }}
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.08, 0.18, 0.08],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />

                    {/* Scanning waves for offline */}
                    {quality === 'offline' && <ScanningWaves />}

                    {/* State transition particles */}
                    {showParticles && (
                        <div className="absolute left-6 top-1/2">
                            <ParticleBurst color={colors.particle} count={10} />
                        </div>
                    )}

                    <div className="relative flex items-start gap-3">
                        {/* Icon container with animated ring */}
                        <div className="relative mt-0.5 shrink-0">
                            <motion.div
                                key={`icon-${quality}`}
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                className="relative"
                            >
                                {/* Pulse ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{ borderColor: colors.particle }}
                                    animate={{
                                        scale: [1, 1.8, 1.8],
                                        opacity: [0.5, 0, 0],
                                        borderWidth: [2, 0, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                    }}
                                />

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                                    <motion.div
                                        animate={
                                            quality === 'unstable'
                                                ? { rotate: [0, -10, 10, -5, 5, 0] }
                                                : quality === 'offline'
                                                    ? { y: [0, -1, 0, 1, 0] }
                                                    : {}
                                        }
                                        transition={{
                                            duration: quality === 'unstable' ? 0.6 : 2,
                                            repeat: Infinity,
                                            repeatDelay: quality === 'unstable' ? 2 : 0.5,
                                        }}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Signal bars (for slow/unstable) */}
                            {quality !== 'offline' && (
                                <motion.div
                                    className="absolute -bottom-1 -right-1"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                >
                                    <AnimatedSignalBars quality={quality} />
                                </motion.div>
                            )}
                        </div>

                        {/* Content with staggered entrance */}
                        <div className="min-w-0 flex-1">
                            <motion.div
                                className="flex items-center gap-2"
                                initial={{ x: -8, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <p className="text-sm font-bold">{config.title}</p>
                                {lastPingMs !== null && quality === 'slow' && (
                                    <motion.span
                                        className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.25, type: 'spring' }}
                                    >
                                        {lastPingMs}ms
                                    </motion.span>
                                )}
                            </motion.div>

                            <motion.p
                                className="mt-1 text-xs leading-relaxed text-white/90"
                                initial={{ x: -8, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.18 }}
                            >
                                {config.message}
                            </motion.p>

                            {/* Reassurance badge with animated entrance */}
                            <motion.div
                                className="mt-2.5 flex items-center gap-1.5"
                                initial={{ y: 6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.35 }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    <ShieldCheck className="h-3.5 w-3.5 text-white/70" />
                                </motion.div>
                                <span className="text-[11px] font-medium text-white/70">
                                    Absen offline mode aktif — data kamu aman
                                </span>
                            </motion.div>
                        </div>

                        {/* Dismiss button */}
                        <motion.button
                            onClick={() => setDismissed(true)}
                            className="shrink-0 rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                            aria-label="Tutup"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
