import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { QrCode, RefreshCw, Clock, Zap, Activity, CheckCircle, XCircle, Timer, Copy, Download, Play, History, Sparkles, AlertCircle, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QRCode from 'qrcode';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import QrBuilderIcon from '@/assets/admin/qr-builder/qr-icon.png';
import TokenIcon from '@/assets/admin/qr-builder/token-icon.png';
import TokenAktifIcon from '@/assets/admin/qr-builder/token-aktif-icon.png';
import HariIcon from '@/assets/admin/qr-builder/hari-icon.png';
import { QRCodeAnimated } from '@/components/ui/qr-code-animated';

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
    nama: string;
    sks: number;
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

// Advanced Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 24,
        },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 10,
        },
    },
} as const;

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
            duration: 0.75,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const glowVariants: Variants = {
    glow: {
        boxShadow: [
            '0 0 20px rgba(99, 102, 241, 0.3)',
            '0 0 60px rgba(99, 102, 241, 0.6)',
            '0 0 20px rgba(99, 102, 241, 0.3)',
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
    const [emptyQrKey, setEmptyQrKey] = useState(0);
    const rotatingRef = useRef(false);
    const ttlLabel = useMemo(() => formatTtl(tokenTtlSeconds), [tokenTtlSeconds]);

    useEffect(() => {
        if (!token) {
            setQrUrl(null);
            return;
        }

        // Generate QR code with UNPAM logo and blue-yellow gradient theme
        const generateQRWithLogo = async () => {
            try {
                const qrDataUrl = await QRCode.toDataURL(token, {
                    width: 300,
                    margin: 2,
                    errorCorrectionLevel: 'H',
                    color: {
                        dark: '#1e40af',
                        light: '#FFFFFF'
                    }
                });

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const qrImage = new Image();
                qrImage.onload = () => {
                    canvas.width = qrImage.width;
                    canvas.height = qrImage.height;
                    ctx.drawImage(qrImage, 0, 0);

                    const logo = new Image();
                    logo.onload = () => {
                        const logoSize = 50;
                        const logoX = canvas.width - logoSize - 10;
                        const logoY = canvas.height - logoSize - 10;

                        ctx.fillStyle = 'white';
                        const padding = 5;
                        const radius = 8;
                        const x = logoX - padding;
                        const y = logoY - padding;
                        const width = logoSize + (padding * 2);
                        const height = logoSize + (padding * 2);

                        ctx.beginPath();
                        ctx.moveTo(x + radius, y);
                        ctx.lineTo(x + width - radius, y);
                        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                        ctx.lineTo(x + width, y + height - radius);
                        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                        ctx.lineTo(x + radius, y + height);
                        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                        ctx.lineTo(x, y + radius);
                        ctx.quadraticCurveTo(x, y, x + radius, y);
                        ctx.closePath();
                        ctx.fill();

                        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                        setQrUrl(canvas.toDataURL());
                    };
                    logo.onerror = () => {
                        setQrUrl(qrDataUrl);
                    };
                    logo.src = '/logo-unpam.png';
                };
                qrImage.onerror = () => {
                    console.error('QR Code image load error');
                    setQrUrl(null);
                };
                qrImage.src = qrDataUrl;
            } catch (err: unknown) {
                console.error('QR Code generation error:', err);
                setQrUrl(null);
            }
        };

        generateQRWithLogo();
    }, [token]);

    useEffect(() => {
        if (!expiresAtMs) { setTimeLeft(null); return; }
        const update = () => setTimeLeft(Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)));
        update();
        const i = window.setInterval(update, 500);
        return () => window.clearInterval(i);
    }, [expiresAtMs]);

    useEffect(() => {
        setToken(null);
        setExpiresAtMs(null);
        if (activeSession?.id) {
            void generateToken({ silent: false });
        }
    }, [activeSession?.id]);

    useEffect(() => {
        if (!expiresAtMs || !token) return;
        const t = window.setTimeout(() => void generateToken({ silent: true }), Math.max(0, expiresAtMs - Date.now() + 200));
        return () => window.clearTimeout(t);
    }, [expiresAtMs, token]);

    const generateToken = async ({ silent = false, force = false } = {}) => {
        if (!activeSession?.id || rotatingRef.current) return;
        rotatingRef.current = true;
        if (!silent) setLoading(true);
        const getCsrfToken = () => {
            const xsrfMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
            if (xsrfMatch) return decodeURIComponent(xsrfMatch[1]);
            return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        };
        const csrf = getCsrfToken();
        try {
            const res = await fetch(`/attendance-sessions/${activeSession.id}/token`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrf ? { 'X-XSRF-TOKEN': csrf } : {})
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
                {/* ─── Hero Header with Animated Gradient ─── */}
                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-4">
                            <div className="text-center sm:text-left">
                                {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('redirect') && (
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => router.visit(new URLSearchParams(window.location.search).get('redirect')!)}
                                        className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors border border-white/20 backdrop-blur-md"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Kembali ke Form Sesi
                                    </motion.button>
                                )}
                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 mb-2">
                                    <motion.div
                                        className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 relative items-center justify-center"
                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                    >
                                        <img src={QrBuilderIcon} alt="QR Builder" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
                                    </motion.div>
                                    <div className="flex-1 mt-1 sm:mt-0">
                                        <motion.p
                                            className="text-sm text-indigo-200"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            Generator Token
                                        </motion.p>
                                        <motion.h1
                                            className="text-2xl sm:text-3xl font-bold"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            QR Builder
                                        </motion.h1>
                                    </div>
                                </div>
                                <motion.p
                                    className="text-indigo-100 max-w-xl mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Generate QR code token untuk absensi dengan rotasi otomatis setiap {ttlLabel}. Sistem akan memperbarui token secara otomatis untuk keamanan maksimal.
                                </motion.p>
                            </div>

                            <div className="flex flex-col items-center sm:items-end gap-2 text-center sm:text-right mt-4 sm:mt-0">
                                {activeSession ? (
                                    <>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 backdrop-blur mb-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-sm font-semibold">Sesi Aktif</span>
                                        </div>
                                        <p className="text-indigo-200 text-sm">
                                            {activeSession.course?.nama ?? '-'}
                                        </p>
                                        <p className="text-white font-semibold">
                                            Pertemuan #{activeSession.meeting_number}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 backdrop-blur mb-2">
                                            <AlertCircle className="h-4 w-4 text-amber-300" />
                                            <span className="text-sm font-semibold text-amber-200">Belum Ada Sesi</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Stats Cards ─── */}
                <motion.div
                    className="grid gap-4 grid-cols-2 md:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } }
                    }}
                >
                    <StatCard imageIcon={TokenIcon} label="Total Token" value={tokenStats.total_generated} color="purple" />
                    <StatCard imageIcon={HariIcon} label="Hari Ini" value={tokenStats.total_today} color="orange" />
                    <StatCard imageIcon={TokenAktifIcon} label="Token Aktif" value={tokenStats.active_tokens} color="green" />
                    <StatCard imageIcon={TokenIcon} label="Token Expired" value={tokenStats.expired_tokens} color="purple" />
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* ─── QR Code Generator Card ─── */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        whileHover={{
                            scale: 1.01,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <motion.div
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                    <QrCode className="h-5 w-5" />
                                </div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">QR Code Generator</h2>
                            </motion.div>
                            {activeSession && (
                                <motion.span
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur"
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

                        {/* ─── No Active Session — Advanced Guide UI ─── */}
                        {!activeSession ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-neutral-50/80 to-neutral-100/60 dark:from-neutral-800/60 dark:to-neutral-900/40 p-8 backdrop-blur"
                            >
                                {/* Animated background orbs */}
                                <motion.div
                                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <motion.div
                                    className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-2xl"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                />

                                <div className="relative text-center">
                                    {/* Floating QR Icon */}
                                    <div
                                        className="mx-auto mb-5 flex items-center justify-center"
                                    >
                                        <div className="flex items-center justify-center opacity-80 mix-blend-screen drop-shadow-xl">
                                            <QRCodeAnimated
                                                key={`empty-qr-${emptyQrKey}`}
                                                data="NO_SESSION_ACTIVE_WAITING"
                                                size={100}
                                                color="#818cf8"
                                                onComplete={() => {
                                                    setTimeout(() => setEmptyQrKey(prev => prev + 1), 2000);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                        Belum Ada Sesi Aktif
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                                        Untuk menggenerate QR code absensi, Anda perlu mengaktifkan sesi absensi terlebih dahulu. Buat atau aktifkan sesi untuk melanjutkan.
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <motion.a
                                            href="/admin/sesi-absen"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Buat Sesi Baru
                                            <ArrowRight className="h-4 w-4" />
                                        </motion.a>
                                        <motion.a
                                            href="/admin/sesi-absen"
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 text-sm font-medium text-neutral-700 dark:text-neutral-300 backdrop-blur hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-colors"
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Timer className="h-4 w-4" />
                                            Kelola Sesi
                                        </motion.a>
                                    </div>

                                    {/* Animated tip */}
                                    <motion.div
                                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <Sparkles className="h-3 w-3" />
                                        QR akan otomatis di-generate setelah sesi aktif
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {/* Session Info */}
                                <div className="rounded-xl bg-neutral-50/60 dark:bg-neutral-800/60 p-4 backdrop-blur border border-white/10">
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Mata Kuliah</span><span className="font-medium text-neutral-900 dark:text-white">{activeSession.course?.nama ?? '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Pertemuan</span><span className="font-medium text-neutral-900 dark:text-white">#{activeSession.meeting_number}</span></div>
                                        <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Token TTL</span><span className="font-medium text-indigo-600 dark:text-indigo-400">{ttlLabel}</span></div>
                                    </div>
                                </div>

                                {/* QR Display */}
                                <div className="flex flex-col items-center">
                                    <AnimatePresence mode="wait">
                                        {token ? (
                                            <motion.div
                                                key="qr-code"
                                                variants={qrVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="relative"
                                            >
                                                <div className={`p-4 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 ${timeLeft !== null && timeLeft <= 30 ? 'bg-amber-500/10 border-amber-500/50 shadow-amber-500/20' : 'bg-white/80 dark:bg-neutral-900/80 shadow-indigo-500/10'}`}>
                                                    <QRCodeAnimated
                                                        data={token}
                                                        size={280}
                                                        color="#4f46e5" /* indigo-600 */
                                                        logoUrl="/logo-unpam.png"
                                                    />
                                                </div>
                                                {timeLeft !== null && timeLeft <= 30 && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30 ring-4 ring-white dark:ring-neutral-900"
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
                                                    className="absolute inset-0 rounded-3xl"
                                                    style={{ zIndex: -1 }}
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="placeholder"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300/60 bg-neutral-50/50 dark:border-neutral-700/60 dark:bg-neutral-800/30 backdrop-blur"
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
                                                        <QrCode className="h-12 w-12 mx-auto text-neutral-400 mb-2" />
                                                    </motion.div>
                                                    <p className="text-sm text-neutral-500">Klik Generate QR</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Active Token Display */}
                                {token && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-center space-y-2"
                                    >
                                        <p className="text-xs uppercase tracking-wider text-neutral-400">Token Aktif</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <motion.code
                                                className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-black/80 text-white font-mono text-lg tracking-wider border border-white/10 shadow-lg"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                {token}
                                            </motion.code>
                                            <motion.button
                                                onClick={copyToken}
                                                className="p-2 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/80 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 border border-white/10 backdrop-blur transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <motion.div
                                                    animate={copied ? { rotate: 360 } : {}}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <Copy className={`h-4 w-4 ${copied ? 'text-emerald-500' : 'text-neutral-600 dark:text-neutral-400'}`} />
                                                </motion.div>
                                            </motion.button>
                                        </div>
                                        {timeLeft !== null && (
                                            <motion.p
                                                className="text-sm text-neutral-500"
                                                animate={timeLeft <= 30 ? { scale: [1, 1.05, 1] } : {}}
                                                transition={{ duration: 1, repeat: timeLeft <= 30 ? Infinity : 0 }}
                                            >
                                                Sisa: <span className={`font-medium ${timeLeft <= 30 ? 'text-amber-600' : 'text-neutral-900 dark:text-white'}`}>
                                                    {formatCountdown(timeLeft)}
                                                </span>
                                            </motion.p>
                                        )}
                                    </motion.div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-center">
                                    <motion.button
                                        onClick={() => void generateToken({ force: true })}
                                        disabled={loading}
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50"
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
                                            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 backdrop-blur hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-colors"
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

                    {/* ─── Right Column ─── */}
                    <div className="space-y-6">
                        {/* Token per Jam Chart */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            whileHover={{ scale: 1.01 }}
                        >
                            <motion.div
                                className="flex items-center gap-3 mb-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Token per Jam</h2>
                            </motion.div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:opacity-20" />
                                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#a3a3a3" interval={3} />
                                        <YAxis tick={{ fontSize: 10 }} stroke="#a3a3a3" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255,255,255,0.9)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '12px',
                                                backdropFilter: 'blur(12px)',
                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                            }}
                                        />
                                        <Bar dataKey="tokens" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#818cf8" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Token Terbaru */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                            whileHover={{ scale: 1.01 }}
                        >
                            <motion.div
                                className="p-4 border-b border-neutral-200/30 dark:border-neutral-800/30"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                        <History className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-semibold text-neutral-900 dark:text-white">Token Terbaru</h2>
                                </div>
                            </motion.div>
                            <div className="divide-y divide-neutral-200/30 dark:divide-neutral-800/30 max-h-64 overflow-y-auto">
                                {initialTokens.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-8 text-center"
                                    >
                                        <QrCode className="h-10 w-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
                                        <p className="text-neutral-500">Belum ada token</p>
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
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.is_expired
                                                        ? 'bg-neutral-100/80 text-neutral-400 dark:bg-neutral-800/80 dark:text-neutral-500'
                                                        : 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                                                        }`}
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    {t.is_expired ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </motion.div>
                                                <div>
                                                    <code className="text-sm font-mono text-neutral-900 dark:text-white">{t.token}</code>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.created_at}</p>
                                                </div>
                                            </div>
                                            <motion.span
                                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.is_expired
                                                    ? 'bg-neutral-100/80 text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400'
                                                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                                    }`}
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

                {/* ─── Daftar Sesi ─── */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                    whileHover={{ scale: 1.005 }}
                >
                    <motion.div
                        className="p-4 border-b border-neutral-200/30 dark:border-neutral-800/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                    <Timer className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Daftar Sesi</h2>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Semua sesi absensi yang tersedia</p>
                                </div>
                            </div>
                            <motion.div
                                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8, type: "spring" }}
                            >
                                {sessions.length} Sesi
                            </motion.div>
                        </div>
                    </motion.div>
                    <div className="p-3">
                        {sessions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Timer className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                                </motion.div>
                                <p className="text-sm text-neutral-500 font-medium mb-1">Belum ada sesi</p>
                                <p className="text-xs text-neutral-400">Buat sesi absensi baru untuk memulai</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-2">
                                {sessions.map((s, index) => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        transition={{
                                            delay: index * 0.05,
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20
                                        }}
                                        whileHover={{
                                            scale: 1.01,
                                            x: 3,
                                            transition: { duration: 0.2 }
                                        }}
                                        className={`relative overflow-hidden rounded-xl border p-3 cursor-pointer transition-all ${s.is_active
                                            ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 to-green-50/40 dark:from-emerald-900/20 dark:to-green-900/10 dark:border-emerald-500/20'
                                            : 'border-white/20 bg-white/30 dark:bg-neutral-800/30 dark:border-white/5 hover:bg-white/60 dark:hover:bg-neutral-800/50'
                                            }`}
                                    >
                                        {/* Active Session Glow */}
                                        {s.is_active && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10"
                                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                        )}

                                        <div className="relative flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <motion.div
                                                    className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm flex-shrink-0 ${s.is_active
                                                        ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-emerald-500/20'
                                                        : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 text-neutral-600 dark:text-neutral-300'
                                                        }`}
                                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    {s.is_active ? (
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </motion.div>
                                                    ) : (
                                                        <Clock className="h-4 w-4" />
                                                    )}
                                                </motion.div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                                            {s.course_name}
                                                        </h3>
                                                        <motion.span
                                                            className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold flex-shrink-0"
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            #{s.meeting_number}
                                                        </motion.span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{s.start_at ?? 'Belum dijadwalkan'}</span>
                                                        </div>
                                                        {s.title && (
                                                            <>
                                                                <span className="text-neutral-400">•</span>
                                                                <span className="truncate">{s.title}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{
                                                    delay: index * 0.05 + 0.2,
                                                    type: "spring",
                                                    stiffness: 300
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm flex-shrink-0 ${s.is_active
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/20'
                                                    : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border border-white/10'
                                                    }`}
                                            >
                                                {s.is_active ? (
                                                    <>
                                                        <motion.div
                                                            className="h-1.5 w-1.5 rounded-full bg-white"
                                                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                        />
                                                        <span>Aktif</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                                        <span>Nonaktif</span>
                                                    </>
                                                )}
                                            </motion.div>
                                        </div>

                                        {/* Bottom Border Animation for Active */}
                                        {s.is_active && (
                                            <motion.div
                                                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{
                                                    duration: 1.5,
                                                    delay: index * 0.05 + 0.3,
                                                    ease: "easeOut"
                                                }}
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}

/* ─── StatCard Component — Glassmorphism + Gradient Icons ─── */
function StatCard({ icon: Icon, imageIcon, label, value, color }: { icon?: any; imageIcon?: string; label: string; value: number; color: string }) {
    const [isHovered, setIsHovered] = useState(false);

    // Map colors to matching dashboard configurations
    const colorConfigs: Record<string, any> = {
        emerald: { bg: 'bg-emerald-500', hoverShadow: 'group-hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', iconBg: 'from-emerald-400 to-teal-600 shadow-emerald-500/30' },
        orange: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-orange-400 to-orange-600 shadow-orange-500/30' },
        amber: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-amber-400 to-orange-600 shadow-amber-500/30' },
        purple: { bg: 'bg-violet-500', hoverShadow: 'group-hover:shadow-violet-500/10', gradientBg: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10', iconBg: 'from-violet-400 to-purple-600 shadow-violet-500/30' },
        blue: { bg: 'bg-sky-500', hoverShadow: 'group-hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10', iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30' },
        green: { bg: 'bg-green-500', hoverShadow: 'group-hover:shadow-green-500/10', gradientBg: 'from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10', iconBg: 'from-green-400 to-emerald-600 shadow-green-500/30' },
    };
    const c = colorConfigs[color] ?? colorConfigs.blue;

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
            }}
            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
            className={`group h-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${c.hoverShadow} dark:border-white/5 cursor-pointer`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileTap={{ scale: 0.95 }}
            style={{ perspective: 1000 }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`} />

            <motion.div
                initial={false}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.bg} blur-3xl transition-all duration-500`}
            />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                {imageIcon ? (
                    <motion.div
                        className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src={imageIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" alt={label} />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.iconBg} text-white shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {Icon && <Icon className="h-4 w-4 sm:h-6 sm:w-6" />}
                    </motion.div>
                )}
                <div>
                    <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">
                        {label}
                    </p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                            {value?.toLocaleString?.() ?? value}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
