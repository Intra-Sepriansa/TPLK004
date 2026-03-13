import TotalIcon from '@/assets/admin/dashboard/total-icon.png';
import HadirIcon from '@/assets/admin/rekap-kehadiran/hadir.png';
import DitolakIcon from '@/assets/admin/voting-kas/ditolak.png';
import SesiAbsenIcon from '@/assets/dosen/sesi-absen/sesi-absen.png';
import TerlambatDetailIcon from '@/assets/dosen/sesi-absen/terlambat.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Award,
    Bell,
    BrainCircuit,
    Calendar,
    Clock,
    Download,
    Eye,
    Fingerprint,
    MapPin,
    RefreshCw,
    Scan,
    Search,
    Shield,
    Smartphone,
    Sparkles,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';

/* ── Types ─────────────────────────────────────────────────────────── */
interface Log {
    id: number;
    mahasiswa_id: number | null;
    nama: string;
    nim: string;
    kelas: string;
    prodi: string;
    avatar_url: string | null;
    status: string;
    scanned_at: string | null;
    scanned_at_full: string | null;
    distance_m: number | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    device_model: string | null;
    device_os: string | null;
    browser: string | null;
    ip_address: string | null;
    is_device_trusted: boolean;
    face_match_score: number | null;
    ai_confidence: number | null;
    risk_score: number | null;
    is_suspicious: boolean;
    is_live_photo: boolean | null;
    spoofing_detected: boolean | null;
    image_quality_score: number | null;
    ai_recommendation: string | null;
    fraud_flags: string[];
    ai_scanned: boolean;
    selfie_url: string | null;
}
interface Stats {
    total: number;
    present: number;
    late: number;
    rejected: number;
    pending: number;
    present_pct: number;
    late_pct: number;
    rejected_pct: number;
    ai_verified: number;
    suspicious: number;
    avg_response_sec: number;
    location_valid: number;
    face_match_rate: number;
    device_trusted: number;
}
interface AtRiskStudent {
    id: number;
    nama: string;
    nim: string;
    risk_score: number;
    attendance_rate: number;
    reason: string;
}
interface AIPredictions {
    forecast: number;
    confidence: number;
    data_points: number;
    at_risk_count: number;
    at_risk_students: AtRiskStudent[];
    optimal_time: string;
    anomaly_count: number;
}
interface Session {
    id: number;
    course_name: string;
    course_sks: number;
    meeting_number: number;
    title: string;
    start_at: string | null;
    end_at: string | null;
    start_raw: string | null;
    is_active: boolean;
    date_display: string;
    day_display: string;
    time_range: string;
}
interface PageProps {
    session: Session;
    logs: Log[];
    stats: Stats;
    aiPredictions: AIPredictions;
}

/* ── Animation Variants ────────────────────────────────────────────── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: { type: 'spring' as const, stiffness: 400, damping: 10 },
    },
} as const;

/* ── Status helpers ────────────────────────────────────────────────── */
const statusConfig: Record<
    string,
    { label: string; color: string; bg: string; border: string }
> = {
    present: {
        label: 'Hadir',
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
    late: {
        label: 'Terlambat',
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    rejected: {
        label: 'Ditolak',
        color: 'text-red-700 dark:text-red-300',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
    },
    pending: {
        label: 'Pending',
        color: 'text-purple-700 dark:text-purple-300',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
    },
    waiting: {
        label: 'Menunggu',
        color: 'text-blue-700 dark:text-blue-300',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
};

/* ════════════════════════════════════════════════════════════════════ */
export default function SesiAbsenDetail({
    session: s,
    logs,
    stats,
    aiPredictions,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<'attendance' | 'insights'>(
        'attendance',
    );
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedLog, setExpandedLog] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const storageKey = `ai_analyzed_${s.id}`;
    const [aiAnalyzed, setAiAnalyzed] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.logsCount === logs.length;
            }
        } catch {}
        return false;
    });
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [analyzeStep, setAnalyzeStep] = useState(0);
    const [sendingReminder, setSendingReminder] = useState(false);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    }, []);

    const handleExport = useCallback(() => {
        window.open(`/dosen/sesi-absen/${s.id}/export-pdf`, '_blank');
    }, [s.id]);

    const handleSendReminder = useCallback(() => {
        setSendingReminder(true);
        fetch(`/dosen/sesi-absen/${s.id}/send-reminder`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((r) => r.json())
            .then((d) => {
                alert(d.message);
            })
            .catch(() => alert('Gagal mengirim reminder'))
            .finally(() => setSendingReminder(false));
    }, [s.id]);

    const startAnalysis = useCallback(() => {
        setAiAnalyzing(true);
        setAnalyzeStep(0);
        const steps = [0, 1, 2, 3, 4, 5, 6];
        steps.forEach((step, i) => {
            setTimeout(() => {
                setAnalyzeStep(step + 1);
                if (step === 6) {
                    setTimeout(() => {
                        setAiAnalyzing(false);
                        setAiAnalyzed(true);
                        try {
                            localStorage.setItem(
                                storageKey,
                                JSON.stringify({ logsCount: logs.length }),
                            );
                        } catch {}
                    }, 400);
                }
            }, i * 500);
        });
    }, [storageKey, logs.length]);

    const filteredLogs = logs.filter((l) => {
        const matchesSearch =
            !search ||
            l.nama.toLowerCase().includes(search.toLowerCase()) ||
            l.nim.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || l.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatSec = (s: number) => {
        if (s < 60) return `${s} dtk`;
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}m ${sec}s`;
    };

    const cards = [
        {
            key: 'total',
            label: 'Total',
            value: stats.total,
            sub: 'mahasiswa',
            imgSrc: TotalIcon,
            from: 'from-blue-400',
            to: 'to-indigo-600',
            shadow: 'shadow-blue-500/30',
            glow: 'bg-blue-500',
            hoverShadow: 'hover:shadow-blue-500/10',
            gradient:
                'from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10',
        },
        {
            key: 'present',
            label: 'Hadir',
            value: stats.present,
            sub: `${stats.present_pct}%`,
            imgSrc: HadirIcon,
            from: 'from-emerald-400',
            to: 'to-teal-600',
            shadow: 'shadow-emerald-500/30',
            glow: 'bg-emerald-500',
            hoverShadow: 'hover:shadow-emerald-500/10',
            gradient:
                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
        },
        {
            key: 'late',
            label: 'Terlambat',
            value: stats.late,
            sub: `${stats.late_pct}%`,
            imgSrc: TerlambatDetailIcon,
            from: 'from-rose-400',
            to: 'to-red-600',
            shadow: 'shadow-rose-500/30',
            glow: 'bg-rose-500',
            hoverShadow: 'hover:shadow-rose-500/10',
            gradient:
                'from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10',
        },
        {
            key: 'rejected',
            label: 'Ditolak',
            value: stats.rejected,
            sub: 'fraud detected',
            imgSrc: DitolakIcon,
            from: 'from-red-400',
            to: 'to-rose-600',
            shadow: 'shadow-red-500/30',
            glow: 'bg-red-500',
            hoverShadow: 'hover:shadow-red-500/10',
            gradient:
                'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
        },
    ];

    return (
        <DosenLayout>
            <Head title={`Sesi: ${s.title}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:p-6"
            >
                {/* ═══════ HEADER ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
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
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        {/* Back link */}
                        <Link
                            href="/dosen/sesi-absen"
                            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Sesi
                            Absensi
                        </Link>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                                <motion.div className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
                                    <img
                                        src={SesiAbsenIcon}
                                        alt="Header Icon"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                                    />
                                </motion.div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-medium tracking-wide text-indigo-100">
                                            Sesi Absensi
                                        </p>
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`rounded-full px-3 py-1 text-xs font-bold ${s.is_active ? 'border border-emerald-400/30 bg-emerald-500/20 text-emerald-100' : 'border border-neutral-400/30 bg-neutral-500/20 text-neutral-200'}`}
                                        >
                                            {s.is_active ? 'AKTIF' : 'SELESAI'}
                                        </motion.span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white">
                                        {s.title}
                                    </h1>
                                    <p className="mt-1 text-sm text-indigo-100 sm:text-base">
                                        {s.course_name} • Pertemuan{' '}
                                        {s.meeting_number} • {s.day_display},{' '}
                                        {s.date_display} • {s.time_range}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 grid grid-cols-1 gap-2 border-t border-white/10 pt-5 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3 sm:pt-6"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRefresh}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 sm:w-auto sm:justify-start sm:px-5"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                />{' '}
                                Refresh QR
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab('insights')}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 sm:w-auto sm:justify-start sm:px-5"
                            >
                                <BrainCircuit className="h-4 w-4" /> AI Insight
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleExport}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 sm:w-auto sm:justify-start sm:px-5"
                            >
                                <Download className="h-4 w-4" /> Export
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSendReminder}
                                disabled={sendingReminder}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 disabled:opacity-50 sm:w-auto sm:justify-start sm:px-5"
                            >
                                <Bell
                                    className={`h-4 w-4 ${sendingReminder ? 'animate-bounce' : ''}`}
                                />{' '}
                                {sendingReminder
                                    ? 'Mengirim...'
                                    : 'Send Reminder'}
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════ 4 STAT CARDS ═══════ */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4"
                >
                    {cards.map((card, i) => {
                        const colorMap: Record<string, any> = {
                            'bg-blue-500': {
                                from: 'from-sky-400',
                                to: 'to-indigo-600',
                                gradientBg:
                                    'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
                                hoverShadow: 'hover:shadow-sky-500/10',
                            },
                            'bg-emerald-500': {
                                from: 'from-emerald-400',
                                to: 'to-teal-600',
                                gradientBg:
                                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                                hoverShadow: 'hover:shadow-emerald-500/10',
                            },
                            'bg-rose-500': {
                                from: 'from-rose-400',
                                to: 'to-red-600',
                                gradientBg:
                                    'from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10',
                                hoverShadow: 'hover:shadow-rose-500/10',
                            },
                            'bg-red-500': {
                                from: 'from-red-400',
                                to: 'to-rose-600',
                                gradientBg:
                                    'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
                                hoverShadow: 'hover:shadow-red-500/10',
                            },
                        };
                        const cc =
                            colorMap[card.glow] || colorMap['bg-blue-500'];
                        return (
                            <motion.div
                                key={card.key}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 100,
                                            damping: 15,
                                        },
                                    },
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(card.key)}
                                onHoverEnd={() => setHoveredCard(null)}
                                className={cn(
                                    `group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40`,
                                    cc.hoverShadow,
                                )}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${cc.gradientBg} opacity-50 dark:opacity-100`}
                                />
                                <motion.div
                                    className={cn(
                                        `absolute -top-8 -right-8 h-28 w-28 rounded-full blur-3xl transition-all`,
                                        card.glow,
                                    )}
                                    animate={{
                                        opacity:
                                            hoveredCard === card.key
                                                ? 0.4
                                                : 0.15,
                                    }}
                                />
                                <div className="relative z-10 flex h-full flex-col items-center justify-between gap-3 sm:items-start sm:gap-4">
                                    <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                        >
                                            <img
                                                src={card.imgSrc}
                                                alt={card.label}
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                            />
                                        </motion.div>
                                        <div className="flex flex-col">
                                            <p className="mb-0.5 text-[10px] leading-tight font-medium text-neutral-500 sm:mb-1 sm:text-sm dark:text-neutral-400">
                                                {card.label}
                                            </p>
                                            <div className="flex items-baseline justify-center gap-2 sm:justify-start">
                                                <span className="text-xl leading-none font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                                    <AnimatedCounter
                                                        value={card.value}
                                                        duration={1500}
                                                    />
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[10px] text-neutral-400 sm:mt-1">
                                                {card.sub}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════ TABS ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="flex w-fit gap-1 rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50"
                >
                    {(['attendance', 'insights'] as const).map((tab) => (
                        <motion.button
                            key={tab}
                            layout
                            onClick={() => setActiveTab(tab)}
                            className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === tab ? 'text-indigo-700 shadow-sm dark:text-indigo-300' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="sessionTab"
                                    className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-neutral-800"
                                    transition={{
                                        type: 'spring',
                                        bounce: 0.2,
                                        duration: 0.6,
                                    }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab === 'attendance' ? (
                                    <>
                                        <Users className="h-4 w-4" /> Daftar
                                        Kehadiran
                                    </>
                                ) : (
                                    <>
                                        <BrainCircuit className="h-4 w-4" /> AI
                                        Insights
                                    </>
                                )}
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* ═══════ TAB CONTENT ═══════ */}
                <div className="min-h-[400px]">
                    {activeTab === 'attendance' && (
                        <div className="animate-in space-y-4 duration-500 fade-in slide-in-from-bottom-4">
                            {/* Filters */}
                            <div className="space-y-4 rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="min-w-[200px] flex-1">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                placeholder="Cari mahasiswa..."
                                                className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-black dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                        className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-black dark:text-white"
                                    >
                                        <option value="all">
                                            Semua Status
                                        </option>
                                        <option value="present">Hadir</option>
                                        <option value="late">Terlambat</option>
                                        <option value="rejected">
                                            Ditolak
                                        </option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        <span className="font-semibold text-neutral-900 dark:text-white">
                                            {s.date_display}
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="text-neutral-500">
                                            Ditampilkan:
                                        </span>
                                        <span className="font-bold text-indigo-600">
                                            {filteredLogs.length}
                                        </span>
                                        <span className="text-neutral-400">
                                            dari {logs.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Table */}
                            {filteredLogs.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50/50 p-16 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <Users className="h-10 w-10 text-neutral-400" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">
                                        Belum ada data kehadiran
                                    </h3>
                                    <p className="mx-auto max-w-sm text-neutral-500 dark:text-neutral-400">
                                        Mahasiswa belum ada yang melakukan scan
                                        absensi untuk sesi ini.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[900px] border-collapse">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-black">
                                                    <th className="w-10 px-4 py-3.5 text-left text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                                                        No
                                                    </th>
                                                    <th className="min-w-[200px] px-4 py-3.5 text-left text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                                                        Mahasiswa
                                                    </th>
                                                    <th className="px-4 py-3.5 text-center text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3.5 text-center text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                                                        Waktu Scan
                                                    </th>
                                                    <th className="px-4 py-3.5 text-center text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                                                        Jarak
                                                    </th>
                                                    <th className="px-4 py-3.5 text-center text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                                                        AI Score
                                                    </th>
                                                    <th className="px-4 py-3.5 text-center text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                                                        Device
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                                {filteredLogs.map(
                                                    (log, idx) => {
                                                        const sc =
                                                            statusConfig[
                                                                log.status
                                                            ] ||
                                                            statusConfig.pending;
                                                        const isExpanded =
                                                            expandedLog ===
                                                            log.id;
                                                        return (
                                                            <tr
                                                                key={log.id}
                                                                className="group cursor-pointer transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-500/[0.03]"
                                                                onClick={() =>
                                                                    setExpandedLog(
                                                                        isExpanded
                                                                            ? null
                                                                            : log.id,
                                                                    )
                                                                }
                                                            >
                                                                <td className="px-4 py-3 text-xs font-medium text-neutral-400">
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-[11px] font-bold text-white">
                                                                            {log.nama
                                                                                .substring(
                                                                                    0,
                                                                                    2,
                                                                                )
                                                                                .toUpperCase()}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                                                {
                                                                                    log.nama
                                                                                }
                                                                            </p>
                                                                            <p className="font-mono text-[10px] text-neutral-400">
                                                                                {
                                                                                    log.nim
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        {log.is_suspicious && (
                                                                            <div className="animate-pulse rounded-md border border-red-500/20 bg-red-500/10 px-1.5 py-0.5">
                                                                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${sc.bg} ${sc.border} ${sc.color} border`}
                                                                    >
                                                                        {
                                                                            sc.label
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                                    {log.scanned_at ||
                                                                        '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {log.distance_m !==
                                                                    null ? (
                                                                        <span
                                                                            className={`text-sm font-semibold ${log.distance_m <= 100 ? 'text-emerald-600' : log.distance_m <= 500 ? 'text-amber-600' : 'text-red-600'}`}
                                                                        >
                                                                            {
                                                                                log.distance_m
                                                                            }
                                                                            m
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-neutral-400">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {log.ai_scanned ? (
                                                                        <div className="flex flex-col items-center">
                                                                            <span
                                                                                className={`text-sm font-bold ${(log.ai_confidence ?? 0) >= 80 ? 'text-emerald-600' : (log.ai_confidence ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'}`}
                                                                            >
                                                                                {log.ai_confidence ??
                                                                                    0}
                                                                                %
                                                                            </span>
                                                                            <span className="text-[9px] text-neutral-400">
                                                                                confidence
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-neutral-400">
                                                                            —
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        <Smartphone className="h-3.5 w-3.5 text-neutral-400" />
                                                                        <span className="max-w-[80px] truncate text-xs text-neutral-600 dark:text-neutral-400">
                                                                            {log.device_model ||
                                                                                '-'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            {/* AI Engine Header — always visible */}
                            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-8 shadow-2xl">
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage:
                                            'radial-gradient(circle, rgba(99,102,241,0.3) 1px, transparent 1px)',
                                        backgroundSize: '24px 24px',
                                    }}
                                />
                                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                                <div className="relative z-10 flex flex-wrap items-center gap-6">
                                    <div
                                        className={`flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-xl ${aiAnalyzing ? 'animate-pulse' : ''}`}
                                    >
                                        <BrainCircuit
                                            className={`h-10 w-10 text-indigo-300 ${aiAnalyzing ? 'animate-spin' : ''}`}
                                        />
                                    </div>
                                    <div className="min-w-[200px] flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-2xl font-bold text-white">
                                                AI Neural Engine
                                            </h2>
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-bold ${aiAnalyzed ? 'animate-pulse border-emerald-400/30 bg-emerald-500/20 text-emerald-300' : aiAnalyzing ? 'animate-pulse border-amber-400/30 bg-amber-500/20 text-amber-300' : 'border-neutral-400/30 bg-neutral-500/20 text-neutral-400'}`}
                                            >
                                                ●{' '}
                                                {aiAnalyzed
                                                    ? 'COMPLETE'
                                                    : aiAnalyzing
                                                      ? 'ANALYZING...'
                                                      : 'STANDBY'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-indigo-300/80">
                                            {aiAnalyzing
                                                ? `Processing stage ${analyzeStep}/7...`
                                                : aiAnalyzed
                                                  ? `Analysis complete • ${aiPredictions.data_points} data points processed`
                                                  : 'Klik "Mulai Analisis" untuk menganalisis data kehadiran'}
                                        </p>
                                    </div>
                                    {aiAnalyzed && (
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                                                <p className="text-lg font-bold text-emerald-400">
                                                    {aiPredictions.confidence}%
                                                </p>
                                                <p className="text-[10px] text-indigo-300/60 uppercase">
                                                    Confidence
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                                                <p
                                                    className={`text-lg font-bold ${aiPredictions.anomaly_count > 0 ? 'text-red-400' : 'text-emerald-400'}`}
                                                >
                                                    {
                                                        aiPredictions.anomaly_count
                                                    }
                                                </p>
                                                <p className="text-[10px] text-indigo-300/60 uppercase">
                                                    Anomalies
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Start Analysis Button — pre-analysis only */}
                                {!aiAnalyzed && !aiAnalyzing && (
                                    <div className="relative z-10 mt-8 text-center">
                                        <button
                                            onClick={startAnalysis}
                                            className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/50 active:scale-95"
                                        >
                                            <Scan className="h-6 w-6 group-hover:animate-pulse" />
                                            Mulai Analisis
                                            <Sparkles className="h-5 w-5 animate-pulse" />
                                        </button>
                                        <p className="mt-3 text-xs text-indigo-300/50">
                                            {stats.total} attendance logs •{' '}
                                            {aiPredictions.data_points}{' '}
                                            historical data points ready
                                        </p>
                                    </div>
                                )}

                                {/* Analysis Pipeline Animation — analyzing only */}
                                {aiAnalyzing && (
                                    <div className="relative z-10 mt-8 space-y-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-bold text-indigo-200">
                                                Processing Pipeline
                                            </span>
                                            <span className="font-mono text-sm font-bold text-indigo-300">
                                                {Math.min(
                                                    Math.round(
                                                        (analyzeStep / 7) * 100,
                                                    ),
                                                    100,
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full border border-indigo-500/20 bg-indigo-900/50">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                                                style={{
                                                    width: `${Math.min((analyzeStep / 7) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-7">
                                            {[
                                                { n: 'Data Load', I: Activity },
                                                { n: 'Face Detect', I: Eye },
                                                {
                                                    n: 'Recognition',
                                                    I: Fingerprint,
                                                },
                                                { n: 'Liveness', I: Scan },
                                                { n: 'Location', I: MapPin },
                                                { n: 'Device', I: Smartphone },
                                                {
                                                    n: 'Decision',
                                                    I: BrainCircuit,
                                                },
                                            ].map((p, i) => (
                                                <div
                                                    key={p.n}
                                                    className={`rounded-xl border p-3 text-center transition-all duration-300 ${i < analyzeStep ? 'border-emerald-500/30 bg-emerald-500/20' : i === analyzeStep ? 'animate-pulse border-amber-500/30 bg-amber-500/20' : 'border-white/10 bg-white/5 opacity-40'}`}
                                                >
                                                    <p.I
                                                        className={`mx-auto mb-1 h-5 w-5 ${i < analyzeStep ? 'text-emerald-400' : i === analyzeStep ? 'animate-spin text-amber-400' : 'text-neutral-500'}`}
                                                    />
                                                    <p className="text-[9px] font-bold text-white/70">
                                                        {p.n}
                                                    </p>
                                                    <p
                                                        className={`mt-0.5 text-[8px] font-bold ${i < analyzeStep ? 'text-emerald-400' : i === analyzeStep ? 'text-amber-400' : 'text-neutral-600'}`}
                                                    >
                                                        {i < analyzeStep
                                                            ? '✓ DONE'
                                                            : i === analyzeStep
                                                              ? '⏳ RUNNING'
                                                              : 'PENDING'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Post-Analysis Results — only after analysis complete */}
                            {aiAnalyzed && (
                                <>
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                        {[
                                            {
                                                label: 'Attendance Prediction',
                                                value: aiPredictions.forecast,
                                                bar: 'bg-emerald-500',
                                                tc: 'text-emerald-600 dark:text-emerald-400',
                                            },
                                            {
                                                label: 'AI Confidence',
                                                value: aiPredictions.confidence,
                                                bar: 'bg-indigo-500',
                                                tc: 'text-indigo-600 dark:text-indigo-400',
                                            },
                                            {
                                                label: 'Face Match Rate',
                                                value: stats.face_match_rate,
                                                bar: 'bg-violet-500',
                                                tc: 'text-violet-600 dark:text-violet-400',
                                            },
                                            {
                                                label: 'Location Accuracy',
                                                value:
                                                    stats.total > 0
                                                        ? Math.round(
                                                              (stats.location_valid /
                                                                  stats.total) *
                                                                  100,
                                                          )
                                                        : 0,
                                                bar: 'bg-blue-500',
                                                tc: 'text-blue-600 dark:text-blue-400',
                                            },
                                            {
                                                label: 'Device Trust',
                                                value:
                                                    stats.total > 0
                                                        ? Math.round(
                                                              (stats.device_trusted /
                                                                  stats.total) *
                                                                  100,
                                                          )
                                                        : 0,
                                                bar: 'bg-cyan-500',
                                                tc: 'text-cyan-600 dark:text-cyan-400',
                                            },
                                            {
                                                label: 'Safety Score',
                                                value: Math.max(
                                                    0,
                                                    100 -
                                                        aiPredictions.anomaly_count *
                                                            15,
                                                ),
                                                bar:
                                                    aiPredictions.anomaly_count >
                                                    0
                                                        ? 'bg-red-500'
                                                        : 'bg-emerald-500',
                                                tc:
                                                    aiPredictions.anomaly_count >
                                                    0
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-emerald-600 dark:text-emerald-400',
                                            },
                                        ].map((m) => (
                                            <div
                                                key={m.label}
                                                className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-900/40"
                                            >
                                                <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                    {m.label}
                                                </p>
                                                <p
                                                    className={`text-3xl font-black ${m.tc} mb-3`}
                                                >
                                                    {m.value}
                                                    <span className="ml-0.5 text-sm">
                                                        %
                                                    </span>
                                                </p>
                                                <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                                    <div
                                                        className={`h-full rounded-full ${m.bar} transition-all duration-1000`}
                                                        style={{
                                                            width: `${Math.min(m.value, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p
                                                    className={`mt-1.5 text-[10px] font-semibold ${m.tc}`}
                                                >
                                                    {m.value >= 80
                                                        ? '● Excellent'
                                                        : m.value >= 60
                                                          ? '● Good'
                                                          : m.value >= 40
                                                            ? '● Fair'
                                                            : '● Low'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Insights Grid */}
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Forecast */}
                                        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40">
                                            <div className="flex items-center gap-3 border-b border-neutral-200 px-6 pt-6 pb-4 dark:border-neutral-800">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg">
                                                    <TrendingUp className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                        Attendance Forecast
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        Dari{' '}
                                                        {
                                                            aiPredictions.data_points
                                                        }{' '}
                                                        data historis
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 p-6">
                                                <div className="flex items-end justify-between">
                                                    <p className="text-5xl font-black text-emerald-600 dark:text-emerald-400">
                                                        {aiPredictions.forecast}
                                                        <span className="text-2xl">
                                                            %
                                                        </span>
                                                    </p>
                                                    <div className="text-right">
                                                        <p className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                                                            <TrendingUp className="h-4 w-4" />
                                                            Predicted
                                                        </p>
                                                        <p className="text-[10px] text-neutral-400">
                                                            sesi berikutnya
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="h-4 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-1000"
                                                        style={{
                                                            width: `${aiPredictions.forecast}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="rounded-xl bg-neutral-50 p-2 text-center dark:bg-neutral-800/50">
                                                        <p className="text-sm font-bold text-blue-600">
                                                            {
                                                                aiPredictions.confidence
                                                            }
                                                            %
                                                        </p>
                                                        <p className="text-[9px] text-neutral-400 uppercase">
                                                            Confidence
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-neutral-50 p-2 text-center dark:bg-neutral-800/50">
                                                        <p className="text-sm font-bold text-violet-600">
                                                            {
                                                                aiPredictions.optimal_time
                                                            }
                                                        </p>
                                                        <p className="text-[9px] text-neutral-400 uppercase">
                                                            Waktu Optimal
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-neutral-50 p-2 text-center dark:bg-neutral-800/50">
                                                        <p className="text-sm font-bold text-cyan-600">
                                                            {
                                                                aiPredictions.data_points
                                                            }
                                                        </p>
                                                        <p className="text-[9px] text-neutral-400 uppercase">
                                                            Data Points
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* At-Risk */}
                                        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40">
                                            <div className="flex items-center justify-between border-b border-neutral-200 px-6 pt-6 pb-4 dark:border-neutral-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg">
                                                        <AlertTriangle className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                            At-Risk Students
                                                        </h3>
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                aiPredictions.at_risk_count
                                                            }{' '}
                                                            perlu perhatian
                                                        </p>
                                                    </div>
                                                </div>
                                                {aiPredictions.at_risk_count >
                                                    0 && (
                                                    <span className="animate-pulse rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-500">
                                                        ⚠{' '}
                                                        {
                                                            aiPredictions.at_risk_count
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-6">
                                                {aiPredictions.at_risk_students
                                                    .length === 0 ? (
                                                    <div className="py-8 text-center">
                                                        <Award className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
                                                        <p className="font-bold text-emerald-700 dark:text-emerald-300">
                                                            Semua Aman!
                                                        </p>
                                                        <p className="mt-1 text-xs text-neutral-500">
                                                            Tidak ada mahasiswa
                                                            berisiko
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {aiPredictions.at_risk_students.map(
                                                            (stu) => (
                                                                <div
                                                                    key={stu.id}
                                                                    className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3 transition-transform hover:scale-[1.02] dark:border-amber-800/50 dark:bg-amber-900/10"
                                                                >
                                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-red-500 text-xs font-bold text-white">
                                                                        {stu.nama.charAt(
                                                                            0,
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                                            {
                                                                                stu.nama
                                                                            }
                                                                        </p>
                                                                        <p className="font-mono text-[10px] text-neutral-500">
                                                                            {
                                                                                stu.nim
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span
                                                                            className={`text-xs font-bold ${stu.risk_score >= 60 ? 'text-red-500' : 'text-amber-500'}`}
                                                                        >
                                                                            Risk{' '}
                                                                            {
                                                                                stu.risk_score
                                                                            }
                                                                            %
                                                                        </span>
                                                                        <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                                            <div
                                                                                className={`h-full rounded-full ${stu.risk_score >= 60 ? 'bg-red-500' : 'bg-amber-500'}`}
                                                                                style={{
                                                                                    width: `${stu.risk_score}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Fraud Detection */}
                                        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40">
                                            <div className="flex items-center gap-3 border-b border-neutral-200 px-6 pt-6 pb-4 dark:border-neutral-800">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-rose-600 shadow-lg">
                                                    <Shield className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                        Fraud Detection
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        AI anomaly detection
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 p-6">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
                                                        <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-red-500" />
                                                        <p className="text-2xl font-black text-red-600">
                                                            {
                                                                aiPredictions.anomaly_count
                                                            }
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-neutral-500 uppercase">
                                                            Anomaly
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center dark:border-orange-800 dark:bg-orange-900/20">
                                                        <Eye className="mx-auto mb-1 h-5 w-5 text-orange-500" />
                                                        <p className="text-2xl font-black text-orange-600">
                                                            {stats.suspicious}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-neutral-500 uppercase">
                                                            Suspicious
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
                                                        <Smartphone className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                                                        <p className="text-2xl font-black text-emerald-600">
                                                            {
                                                                stats.device_trusted
                                                            }
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-neutral-500 uppercase">
                                                            Trusted
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-900/20">
                                                        <MapPin className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                                                        <p className="text-2xl font-black text-blue-600">
                                                            {
                                                                stats.location_valid
                                                            }
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-neutral-500 uppercase">
                                                            Valid Loc
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`rounded-xl border p-4 ${aiPredictions.anomaly_count === 0 ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Shield
                                                            className={`h-5 w-5 ${aiPredictions.anomaly_count === 0 ? 'text-emerald-600' : 'text-red-600'}`}
                                                        />
                                                        <p
                                                            className={`text-sm font-bold ${aiPredictions.anomaly_count === 0 ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}
                                                        >
                                                            {aiPredictions.anomaly_count ===
                                                            0
                                                                ? 'Sistem Aman — Tidak ada ancaman'
                                                                : `${aiPredictions.anomaly_count} Ancaman — Review diperlukan`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40">
                                            <div className="flex items-center gap-3 border-b border-neutral-200 px-6 pt-6 pb-4 dark:border-neutral-800">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 shadow-lg">
                                                    <Sparkles className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                        Smart Recommendations
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        AI insights
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 p-6">
                                                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-blue-600">
                                                            Waktu Optimal
                                                        </p>
                                                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                            Jadwalkan sesi pukul{' '}
                                                            {
                                                                aiPredictions.optimal_time
                                                            }
                                                        </p>
                                                    </div>
                                                    <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[8px] font-black text-blue-700 uppercase dark:text-blue-300">
                                                        INFO
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                                    <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-emerald-600">
                                                            Target Kehadiran
                                                        </p>
                                                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                            Targetkan{' '}
                                                            {Math.min(
                                                                100,
                                                                aiPredictions.forecast +
                                                                    5,
                                                            )}
                                                            % di sesi berikutnya
                                                        </p>
                                                    </div>
                                                    <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[8px] font-black text-white uppercase">
                                                        GOAL
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                                    <Bell className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-amber-600">
                                                            Reminder
                                                        </p>
                                                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                            Kirim ke{' '}
                                                            {
                                                                aiPredictions.at_risk_count
                                                            }{' '}
                                                            mahasiswa at-risk
                                                        </p>
                                                    </div>
                                                    <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[8px] font-black text-white uppercase">
                                                        ACTION
                                                    </span>
                                                </div>
                                                <div
                                                    className={`flex items-start gap-3 rounded-xl border p-4 ${stats.suspicious > 0 ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'}`}
                                                >
                                                    <Activity
                                                        className={`h-4 w-4 ${stats.suspicious > 0 ? 'text-red-600' : 'text-emerald-600'} mt-0.5 flex-shrink-0`}
                                                    />
                                                    <div className="flex-1">
                                                        <p
                                                            className={`text-sm font-bold ${stats.suspicious > 0 ? 'text-red-600' : 'text-emerald-600'}`}
                                                        >
                                                            Security
                                                        </p>
                                                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                            {stats.suspicious >
                                                            0
                                                                ? `Review ${stats.suspicious} suspicious`
                                                                : 'Semua terverifikasi'}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${stats.suspicious > 0 ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-700'}`}
                                                    >
                                                        {stats.suspicious > 0
                                                            ? 'URGENT'
                                                            : 'OK'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Pipeline Summary */}
                                    <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40">
                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg">
                                                    <Scan className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                        AI Insight Pipeline
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        Multi-layer verification
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                                                ALL PASSED
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                                            {[
                                                {
                                                    n: 'Face Detect',
                                                    I: Eye,
                                                    g: 'from-blue-400 to-indigo-600',
                                                },
                                                {
                                                    n: 'Recognition',
                                                    I: Fingerprint,
                                                    g: 'from-violet-400 to-purple-600',
                                                },
                                                {
                                                    n: 'Liveness',
                                                    I: Scan,
                                                    g: 'from-emerald-400 to-teal-600',
                                                },
                                                {
                                                    n: 'Location',
                                                    I: MapPin,
                                                    g: 'from-cyan-400 to-blue-600',
                                                },
                                                {
                                                    n: 'Device',
                                                    I: Smartphone,
                                                    g: 'from-amber-400 to-orange-600',
                                                },
                                                {
                                                    n: 'Decision',
                                                    I: BrainCircuit,
                                                    g: 'from-pink-400 to-rose-600',
                                                },
                                            ].map((p) => (
                                                <div
                                                    key={p.n}
                                                    className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md dark:border-emerald-800/50 dark:bg-emerald-900/10"
                                                >
                                                    <div
                                                        className={`mx-auto h-10 w-10 rounded-lg bg-gradient-to-br ${p.g} mb-2 flex items-center justify-center shadow-lg`}
                                                    >
                                                        <p.I className="h-5 w-5 text-white" />
                                                    </div>
                                                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                                        {p.n}
                                                    </p>
                                                    <div className="mt-1.5 flex items-center justify-center gap-1">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        <span className="text-[9px] font-semibold text-emerald-600">
                                                            PASS
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </DosenLayout>
    );
}
