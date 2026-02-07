import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { QrCode, RefreshCw, Clock, Zap, Activity, CheckCircle, XCircle, Timer, Copy, Download, Play, History, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QRCode from 'qrcode';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface Session {
    id: number;
    title: string | null;
    meeting_number: number;
    course_name: string;
    is_active: boolean;
    start_at: string | null;
    end_at: string | null;
}

interface Token {
    id: number;
    token: string;
    created_at: string;
    expires_at: string | null;
    is_expired: boolean;
    scan_count: number;
}

interface TokenStats {
    total_generated: number;
    total_today: number;
    active_tokens: number;
    expired_tokens: number;
}

interface HourlyData {
    hour: string;
    tokens: number;
}

interface ActiveSession {
    id: number;
    title: string | null;
    meeting_number: number;
    course: { nama: string; sks: number } | null;
    start_at: string | null;
    end_at: string | null;
}

interface PageProps {
    activeSession: ActiveSession | null;
    tokenTtlSeconds: number;
    recentTokens: Token[];
    sessions: Session[];
    tokenStats: TokenStats;
    hourlyData: HourlyData[];
}

const formatTtl = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '-';
    if (seconds % 60 === 0) return `${seconds / 60} menit`;
    if (seconds >= 60) {
        const m = Math.floor(seconds / 60);
        const r = seconds % 60;
        return `${m}m ${r}s`;
    }
    return `${seconds} detik`;
};

const formatCountdown = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '-';
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${s}s`;
};

// Advanced Animation Variants - UPGRADED
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
            when: "beforeChildren",
        },
    },
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 60,
        scale: 0.8,
        rotateX: -15,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring',
            stiffness: 150,
            damping: 20,
            mass: 0.8,
        },
    },
};

const headerVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: -50,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 25,
            delay: 0.1,
        },
    },
};

const qrVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0,
        rotate: -180,
        y: 50,
    },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2,
        },
    },
    exit: {
        opacity: 0,
        scale: 0,
        rotate: 180,
        y: -50,
        transition: {
            duration: 0.4,
            ease: "easeInOut",
        },
    },
};

const pulseVariants: Variants = {
    pulse: {
        scale: [1, 1.08, 1],
        opacity: [1, 0.7, 1],
        boxShadow: [
            '0 0 0 0 rgba(251, 191, 36, 0)',
            '0 0 0 20px rgba(251, 191, 36, 0.3)',
            '0 0 0 0 rgba(251, 191, 36, 0)',
        ],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const glowVariants: Variants = {
    glow: {
        boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.3)',
            '0 0 60px rgba(59, 130, 246, 0.6)',
            '0 0 20px rgba(59, 130, 246, 0.3)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const floatVariants: Variants = {
    float: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};


export default function QrBuilder({ activeSession, tokenTtlSeconds = 180, recentTokens: initialTokens, sessions, tokenStats, hourlyData }: PageProps) {
    const [token, setToken] = useState<string | null>(null);
    const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const rotatingRef = useRef(false);
    const ttlLabel = useMemo(() => formatTtl(tokenTtlSeconds), [tokenTtlSeconds]);

    useEffect(() => {
        if (!token) {
            setQrUrl(null);
            return;
        }

        // Generate QR code
        QRCode.toDataURL(token, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'M'
        })
            .then((url: string) => {
                setQrUrl(url);
            })
            .catch((err: unknown) => {
                console.error('QR Code generation error:', err);
                setQrUrl(null);
            });
    }, [token]);

    useEffect(() => {
        if (!expiresAtMs) { setTimeLeft(null); return; }
        const update = () => setTimeLeft(Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)));
        update();
        const i = window.setInterval(update, 500);
        return () => window.clearInterval(i);
    }, [expiresAtMs]);

    useEffect(() => { setToken(null); setExpiresAtMs(null); }, [activeSession?.id]);

    useEffect(() => {
        if (!expiresAtMs || !token) return;
        const t = window.setTimeout(() => void generateToken({ silent: true }), Math.max(0, expiresAtMs - Date.now() + 200));
        return () => window.clearTimeout(t);
    }, [expiresAtMs, token]);

    const generateToken = async ({ silent = false, force = false } = {}) => {
        if (!activeSession?.id || rotatingRef.current) return;
        rotatingRef.current = true;
        if (!silent) setLoading(true);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        try {
            const res = await fetch(`/attendance-sessions/${activeSession.id}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {})
                },
                body: JSON.stringify(force ? { force: true } : {}),
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Token generated:', data);
                setToken(data.token);
                if (typeof data.expires_at_ts === 'number') {
                    setExpiresAtMs(data.expires_at_ts * 1000);
                } else if (typeof data.expires_at === 'string') {
                    const p = Date.parse(data.expires_at);
                    if (!Number.isNaN(p)) setExpiresAtMs(p);
                }
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Failed to generate token:', res.status, errorData);
                alert(`Gagal generate token: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error generating token:', error);
            alert('Terjadi kesalahan saat generate token. Cek console untuk detail.');
        } finally {
            rotatingRef.current = false;
            if (!silent) setLoading(false);
        }
    };

    const copyToken = () => { if (!token) return; navigator.clipboard.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const downloadQr = () => { if (!qrUrl) return; const a = document.createElement('a'); a.download = `qr-${token}.png`; a.href = qrUrl; a.click(); };

    return (
        <AppLayout>
            <Head title="QR Builder" />
            <motion.div
                className="p-6 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header with Advanced Animation */}
                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {/* Animated Background Particles */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                            opacity: [0.1, 0.15, 0.1]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />

                    {/* Floating Sparkles with Enhanced Animation */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                y: [0, -40, -80],
                                x: [0, Math.sin(i) * 20, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random(),
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "easeOut"
                            }}
                            className="absolute rounded-full bg-white/40"
                            style={{
                                width: `${4 + Math.random() * 8}px`,
                                height: `${4 + Math.random() * 8}px`,
                                left: `${10 + i * 12}%`,
                                top: `${25 + (i % 3) * 25}%`,
                            }}
                        />
                    ))}

                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    delay: 0.3
                                }}
                                whileHover={{
                                    scale: 1.2,
                                    rotate: 360,
                                    transition: { duration: 0.6 }
                                }}
                            >
                                <QrCode className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <motion.p
                                    className="text-sm text-blue-100"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Generator Token
                                </motion.p>
                                <motion.h1
                                    className="text-2xl font-bold"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    QR Builder
                                </motion.h1>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, type: "spring" }}
                            className="mt-4 text-blue-100"
                        >
                            Generate QR code token untuk absensi dengan rotasi otomatis setiap {ttlLabel}
                        </motion.p>
                    </div>
                </motion.div>

                {/* Stats Cards with Stagger Animation */}
                <motion.div
                    className="grid gap-4 md:grid-cols-4"
                    variants={containerVariants}
                >
                    <StatCard icon={QrCode} label="Total Token" value={tokenStats.total_generated} color="blue" delay={0.1} />
                    <StatCard icon={Zap} label="Hari Ini" value={tokenStats.total_today} color="emerald" delay={0.2} />
                    <StatCard icon={CheckCircle} label="Token Aktif" value={tokenStats.active_tokens} color="green" delay={0.3} />
                    <StatCard icon={Clock} label="Token Expired" value={tokenStats.expired_tokens} color="amber" delay={0.4} />
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                        whileHover={{
                            scale: 1.01,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <QrCode className="h-5 w-5 text-blue-600" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">QR Code Generator</h2>
                            </motion.div>
                            {activeSession && (
                                <motion.span
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        delay: 0.4
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <Play className="h-3 w-3" />
                                    </motion.div>
                                    Sesi Aktif
                                </motion.span>
                            )}
                        </div>
                        {!activeSession ? (
                            <div className="text-center py-12">
                                <QrCode className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 mb-2 font-semibold">Belum ada sesi aktif</p>
                                <p className="text-sm text-slate-400 mb-4">
                                    Aktifkan sesi absensi terlebih dahulu untuk generate QR code
                                </p>
                                <a
                                    href="/attendance-sessions"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Play className="h-4 w-4" />
                                    Kelola Sesi Absensi
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="rounded-xl bg-slate-50 dark:bg-black/50 p-4">
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Mata Kuliah</span><span className="font-medium text-slate-900 dark:text-white">{activeSession.course?.nama ?? '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Pertemuan</span><span className="font-medium text-slate-900 dark:text-white">#{activeSession.meeting_number}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Token TTL</span><span className="font-medium text-blue-600">{ttlLabel}</span></div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <AnimatePresence mode="wait">
                                        {qrUrl ? (
                                            <motion.div
                                                key="qr-code"
                                                variants={qrVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="relative"
                                            >
                                                <motion.img
                                                    src={qrUrl}
                                                    alt="QR"
                                                    className="h-64 w-64 rounded-2xl border-4 border-white shadow-lg"
                                                    variants={timeLeft !== null && timeLeft <= 30 ? pulseVariants : {}}
                                                    animate={timeLeft !== null && timeLeft <= 30 ? "pulse" : ""}
                                                />
                                                {timeLeft !== null && timeLeft <= 30 && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold"
                                                    >
                                                        <motion.span
                                                            key={timeLeft}
                                                            initial={{ scale: 1.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            {timeLeft}
                                                        </motion.span>
                                                    </motion.div>
                                                )}
                                                {/* Glow Effect */}
                                                <motion.div
                                                    variants={glowVariants}
                                                    animate="glow"
                                                    className="absolute inset-0 rounded-2xl"
                                                    style={{ zIndex: -1 }}
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="placeholder"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-black"
                                            >
                                                <div className="text-center">
                                                    <motion.div
                                                        animate={{
                                                            rotate: 360,
                                                            scale: [1, 1.1, 1]
                                                        }}
                                                        transition={{
                                                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                                        }}
                                                    >
                                                        <QrCode className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                                                    </motion.div>
                                                    <p className="text-sm text-slate-500">Klik Generate QR</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {token && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-center space-y-2"
                                    >
                                        <p className="text-xs uppercase tracking-wider text-slate-400">Token Aktif</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <motion.code
                                                className="px-4 py-2 rounded-lg bg-black text-white font-mono text-lg tracking-wider"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                {token}
                                            </motion.code>
                                            <motion.button
                                                onClick={copyToken}
                                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <motion.div
                                                    animate={copied ? { rotate: 360 } : {}}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <Copy className={`h-4 w-4 ${copied ? 'text-emerald-500' : 'text-slate-600'}`} />
                                                </motion.div>
                                            </motion.button>
                                        </div>
                                        {timeLeft !== null && (
                                            <motion.p
                                                className="text-sm text-slate-500"
                                                animate={timeLeft <= 30 ? { scale: [1, 1.05, 1] } : {}}
                                                transition={{ duration: 1, repeat: timeLeft <= 30 ? Infinity : 0 }}
                                            >
                                                Sisa: <span className={`font-medium ${timeLeft <= 30 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                                                    {formatCountdown(timeLeft)}
                                                </span>
                                            </motion.p>
                                        )}
                                    </motion.div>
                                )}
                                <div className="flex gap-3 justify-center">
                                    <motion.button
                                        onClick={() => void generateToken({ force: true })}
                                        disabled={loading}
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-900 to-black px-6 py-3 text-sm font-medium text-white hover:from-gray-800 hover:to-gray-900 transition-all disabled:opacity-50"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div
                                            animate={loading ? { rotate: 360 } : {}}
                                            transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </motion.div>
                                        {loading ? 'Generating...' : 'Generate QR'}
                                    </motion.button>
                                    {qrUrl && (
                                        <motion.button
                                            onClick={downloadQr}
                                            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Download className="h-4 w-4" />
                                            Download
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <div className="space-y-6">
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                            whileHover={{ scale: 1.01 }}
                        >
                            <motion.div
                                className="flex items-center gap-2 mb-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Activity className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Token per Jam</h2>
                            </motion.div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={3} /><YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} /><Bar dataKey="tokens" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                            whileHover={{ scale: 1.01 }}
                        >
                            <motion.div
                                className="p-4 border-b border-slate-200 dark:border-slate-800"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Token Terbaru</h2>
                                </div>
                            </motion.div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-64 overflow-y-auto">
                                {initialTokens.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-8 text-center"
                                    >
                                        <QrCode className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                        <p className="text-slate-500">Belum ada token</p>
                                    </motion.div>
                                ) : (
                                    initialTokens.map((t, index) => (
                                        <motion.div
                                            key={t.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 5, backgroundColor: 'rgba(0,0,0,0.02)' }}
                                            className="p-3 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.is_expired ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    {t.is_expired ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </motion.div>
                                                <div>
                                                    <code className="text-sm font-mono text-slate-900 dark:text-white">{t.token}</code>
                                                    <p className="text-xs text-slate-500">{t.created_at}</p>
                                                </div>
                                            </div>
                                            <motion.span
                                                className={`text-xs px-2 py-1 rounded-full ${t.is_expired ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                {t.is_expired ? 'Expired' : 'Active'}
                                            </motion.span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                    whileHover={{ scale: 1.005 }}
                >
                    <motion.div
                        className="p-4 border-b border-slate-200 dark:border-slate-800"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="flex items-center gap-2">
                            <Timer className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Sesi</h2>
                        </div>
                    </motion.div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50 dark:bg-black/50"><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mata Kuliah</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Pertemuan</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Waktu</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th></tr></thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {sessions.map((s, index) => (
                                    <motion.tr
                                        key={s.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                        className="transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{s.course_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">#{s.meeting_number}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{s.start_at ?? '-'}</td>
                                        <td className="px-4 py-3">
                                            <motion.span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {s.is_active ? <Play className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                {s.is_active ? 'Aktif' : 'Nonaktif'}
                                            </motion.span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: number; color: string; delay?: number }) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 50,
                scale: 0.7,
                rotateY: -90,
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotateY: 0,
            }}
            transition={{
                delay,
                type: 'spring',
                stiffness: 200,
                damping: 20,
                mass: 0.8,
            }}
            whileHover={{
                scale: 1.08,
                y: -8,
                rotateY: 5,
                transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 10
                }
            }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 cursor-pointer"
            style={{ perspective: 1000 }}
        >
            <div className="flex items-center gap-3">
                <motion.div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}
                    whileHover={{
                        rotate: 360,
                        scale: 1.2,
                    }}
                    transition={{ duration: 0.6 }}
                >
                    <Icon className="h-5 w-5" />
                </motion.div>
                <div>
                    <motion.p
                        className="text-sm text-slate-500"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.1 }}
                    >
                        {label}
                    </motion.p>
                    <motion.p
                        className="text-xl font-bold text-slate-900 dark:text-white"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: delay + 0.2,
                            type: 'spring',
                            stiffness: 300,
                        }}
                    >
                        {value}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}
