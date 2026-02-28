import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Camera,
    Smartphone,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Share2,
    Printer,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    ZoomIn,
    ZoomOut,
    Wifi,
    Flag,
    FileText,
    TrendingUp,
    Users,
    Activity,
    X,
    Brain,
    Eye,
    Shield,
    ImageIcon,
    Copy,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ── types ──
interface DeviceInfo {
    model: string;
    os: string;
    browser: string;
    type: string;
}

interface SelfieVerification {
    status: 'approved' | 'pending' | 'rejected';
    verified_at: string | null;
    verified_by: string | null;
    notes: string | null;
}

interface SessionInfo {
    id: number;
    meeting_number: number;
    title: string;
    start_at: string;
    end_at: string;
    course: {
        nama: string;
        sks: number;
        dosen: { nama: string };
    };
}

interface AIInfo {
    face_detected: boolean | null;
    face_match_score: number | null;
    is_live_photo: boolean | null;
    ai_confidence: number | null;
    image_quality: number | null;
}

interface AttendanceRecord {
    id: number;
    status: 'present' | 'late' | 'rejected' | 'pending';
    scanned_at: string;
    distance: number;
    lat: number | null;
    long: number | null;
    selfie_url: string | null;
    note: string | null;
    device_info: DeviceInfo;
    selfie_verification: SelfieVerification;
    session: SessionInfo;
    ai_info: AIInfo;
}

interface RelatedRecord {
    id: number;
    course: string;
    status: string;
    scanned_at: string;
    checkInTime: string;
}

interface TimelineItem {
    type: string;
    time: string | null;
    status: string;
    description: string;
}

interface PageProps {
    record: AttendanceRecord;
    relatedRecords: RelatedRecord[];
    classAverage: {
        total: number;
        present_count: number;
        avg_distance: number;
    };
    timeline: TimelineItem[];
    prevId: number | null;
    nextId: number | null;
}

// ── animations ──
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

const statusConfig: Record<string, { label: string; color: string; gradient: string; icon: typeof CheckCircle }> = {
    present: {
        label: 'Hadir',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        gradient: 'from-emerald-500 to-teal-600',
        icon: CheckCircle,
    },
    late: {
        label: 'Terlambat',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        gradient: 'from-amber-500 to-orange-600',
        icon: Clock,
    },
    rejected: {
        label: 'Ditolak',
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        gradient: 'from-rose-500 to-pink-600',
        icon: XCircle,
    },
    pending: {
        label: 'Pending',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        gradient: 'from-blue-500 to-indigo-600',
        icon: Clock,
    },
};

export default function HistoryDetail() {
    const { props } = usePage();
    const { record, relatedRecords, classAverage, timeline, prevId, nextId } = props as unknown as PageProps;

    const [showFullscreenSelfie, setShowFullscreenSelfie] = useState(false);
    const [selfieZoom, setSelfieZoom] = useState(1);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showSharePreview, setShowSharePreview] = useState(false);

    const status = statusConfig[record.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const scannedAt = new Date(record.scanned_at);
    const scannedAtMobile = `${scannedAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} • ${scannedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    const scannedAtDesktop = scannedAt.toLocaleString('id-ID');
    const selfieStatusLabel = record.selfie_verification.status === 'approved'
        ? 'Terverifikasi'
        : record.selfie_verification.status === 'pending'
            ? 'Menunggu Verifikasi'
            : 'Ditolak';
    const distanceLabel = record.distance != null ? `${Number(record.distance).toFixed(0)} meter` : 'Tidak tersedia';
    const locationLabel = record.lat != null && record.long != null
        ? `${Number(record.lat).toFixed(6)}, ${Number(record.long).toFixed(6)}`
        : 'Tidak tersedia';
    const mapLink = record.lat != null && record.long != null
        ? `https://www.google.com/maps?q=${record.lat},${record.long}`
        : null;
    const buildShareMessage = (detailUrl: string) => ([
        '*LAPORAN KEHADIRAN MAHASISWA*',
        'Universitas Pamulang • Yayasan Sasmita Jaya',
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '*RINGKASAN UTAMA*',
        `• Status         : *${status.label}*`,
        `• Mata Kuliah    : *${record.session.course.nama}*`,
        `• Dosen          : ${record.session.course.dosen.nama}`,
        `• Pertemuan      : #${record.session.meeting_number}`,
        `• Waktu Scan     : ${scannedAtDesktop}`,
        '',
        '*DETAIL VERIFIKASI*',
        '```',
        `Selfie Verifikasi : ${selfieStatusLabel}`,
        `Jarak Lokasi      : ${distanceLabel}`,
        `Koordinat         : ${locationLabel}`,
        `Device            : ${record.device_info.model} (${record.device_info.os})`,
        `AI Confidence     : ${record.ai_info.ai_confidence !== null ? `${(Number(record.ai_info.ai_confidence) * 100).toFixed(1)}%` : '-'}`,
        '```',
        '',
        '*Catatan*',
        record.note || 'Tidak ada catatan tambahan.',
        '',
        mapLink ? `Lokasi: ${mapLink}` : 'Lokasi: Tidak tersedia',
        `Detail lengkap: ${detailUrl}`,
        '',
        'Dokumen ini dibuat otomatis dari Sistem Absensi Mahasiswa UNPAM.',
    ]).join('\n');

    const getShareMessage = () => {
        if (typeof window === 'undefined') {
            return buildShareMessage('');
        }
        return buildShareMessage(window.location.href);
    };

    const handleCopyShareText = async () => {
        try {
            await navigator.clipboard.writeText(getShareMessage());
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 1800);
        } catch {
            setCopySuccess(false);
        }
    };

    const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    const handleNativeShare = async () => {
        if (!canUseNativeShare || typeof window === 'undefined') return;

        try {
            await navigator.share({
                title: `Kehadiran - ${record.session.course.nama}`,
                text: getShareMessage(),
                url: window.location.href,
            });
            setShowShareModal(false);
        } catch {
            // Canceled by user or unsupported payload
        }
    };

    const handleShare = (platform: 'whatsapp' | 'twitter' | 'facebook') => {
        if (typeof window === 'undefined') return;

        const detailUrl = window.location.href;
        const richMessage = getShareMessage();
        const shortMessage = `Status ${status.label} untuk ${record.session.course.nama} (Pertemuan #${record.session.meeting_number})`;

        const shareUrls: Record<string, string> = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(richMessage)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortMessage)}&url=${encodeURIComponent(detailUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(detailUrl)}`,
        };

        window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=640,height=760');
        setShowShareModal(false);
    };

    const toAbsoluteUrl = (value: string | null) => {
        if (!value || typeof window === 'undefined') return '';
        if (value.startsWith('http://') || value.startsWith('https://')) return value;
        if (value.startsWith('/')) return `${window.location.origin}${value}`;
        return `${window.location.origin}/${value}`;
    };

    const handlePrint = () => {
        setShowShareModal(false);
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const printTime = new Date().toLocaleString('id-ID');
    const printDateOnly = new Date().toLocaleDateString('id-ID');
    const selfieImage = toAbsoluteUrl(record.selfie_url);
    const unpamLogo = typeof window !== 'undefined' ? `${window.location.origin}/logo-unpam.png` : '/logo-unpam.png';
    const sasmitaLogo = typeof window !== 'undefined' ? `${window.location.origin}/sasmita.png` : '/sasmita.png';
    const aiConfidence = record.ai_info.ai_confidence !== null ? `${(Number(record.ai_info.ai_confidence) * 100).toFixed(1)}%` : '-';
    const faceMatch = record.ai_info.face_match_score !== null ? `${(Number(record.ai_info.face_match_score) * 100).toFixed(1)}%` : '-';
    const imageQuality = record.ai_info.image_quality !== null ? `${(Number(record.ai_info.image_quality) * 100).toFixed(1)}%` : '-';
    const sessionTime = record.session.start_at
        ? `${new Date(record.session.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}${record.session.end_at ? ` - ${new Date(record.session.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ''}`
        : '-';

    return (
        <StudentLayout>
            <Head title={`Detail Kehadiran - ${record.session.course.nama}`} />

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 sm:p-6 space-y-6">

                {/* ── Breadcrumb & Navigation ── */}
                <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <Link href="/user/history">
                            <motion.button
                                whileHover={{ x: -4 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Riwayat
                            </motion.button>
                        </Link>
                        <div className="text-sm text-neutral-500 hidden sm:block">
                            <Link href="/user/history" className="hover:text-neutral-700 dark:hover:text-neutral-300">Riwayat</Link>
                            <span className="mx-2">/</span>
                            <span className="text-neutral-900 dark:text-white font-semibold">Detail</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {prevId ? (
                            <Link href={`/user/history/${prevId}`}>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 text-neutral-700 dark:text-neutral-300">
                                    <ChevronLeft className="h-5 w-5" />
                                </motion.button>
                            </Link>
                        ) : (
                            <button disabled className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 opacity-40 cursor-not-allowed"><ChevronLeft className="h-5 w-5" /></button>
                        )}
                        {nextId ? (
                            <Link href={`/user/history/${nextId}`}>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 text-neutral-700 dark:text-neutral-300">
                                    <ChevronRight className="h-5 w-5" />
                                </motion.button>
                            </Link>
                        ) : (
                            <button disabled className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 opacity-40 cursor-not-allowed"><ChevronRight className="h-5 w-5" /></button>
                        )}
                    </div>
                </motion.div>

                {/* ── Header Card ── */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ backgroundSize: '200% 200%' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <motion.div animate={{ y: [0, -15, 0], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-10 right-20 hidden sm:block text-white/15">
                        <FileText className="h-14 w-14" />
                    </motion.div>

                    <div className="relative">
                        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1 min-w-0">
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/25 backdrop-blur-xl mb-3 sm:mb-4">
                                    <StatusIcon className="h-5 w-5" />
                                    <span className="font-bold">{status.label}</span>
                                </motion.div>
                                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-2xl sm:text-3xl font-bold mb-2 leading-tight break-words">
                                    {record.session.course.nama}
                                </motion.h1>
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="grid gap-2 text-xs sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:text-sm text-indigo-100">
                                    <span className="flex items-center gap-2 min-w-0"><Users className="h-4 w-4 shrink-0" /><span className="truncate">{record.session.course.dosen.nama}</span></span>
                                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />Pertemuan #{record.session.meeting_number}</span>
                                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" /><span className="sm:hidden">{scannedAtMobile}</span><span className="hidden sm:inline">{scannedAtDesktop}</span></span>
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowShareModal(true);
                                        setShowSharePreview(false);
                                        setCopySuccess(false);
                                    }}
                                    className="flex min-w-[110px] flex-1 items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 hover:bg-white/30 transition-all text-sm font-semibold lg:min-w-0 lg:flex-none lg:px-4"
                                >
                                    <Share2 className="h-4 w-4" />Share
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrint} className="flex min-w-[110px] flex-1 items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 hover:bg-white/30 transition-all text-sm font-semibold lg:min-w-0 lg:flex-none lg:px-4">
                                    <Printer className="h-4 w-4" />Print
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Main Content Grid ── */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Selfie Viewer */}
                        {record.selfie_url && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <Camera className="h-5 w-5 text-emerald-500" />
                                        </motion.div>
                                        <div>
                                            <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Bukti Selfie</h2>
                                            <p className="text-xs text-neutral-500">
                                                Status: {record.selfie_verification.status === 'approved' ? 'Terverifikasi' : record.selfie_verification.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelfieZoom(Math.min(selfieZoom + 0.5, 3))} className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"><ZoomIn className="h-4 w-4" /></motion.button>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelfieZoom(Math.max(selfieZoom - 0.5, 1))} className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"><ZoomOut className="h-4 w-4" /></motion.button>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowFullscreenSelfie(true)} className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"><Maximize2 className="h-4 w-4" /></motion.button>
                                    </div>
                                </div>
                                <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-zoom-in" onClick={() => setShowFullscreenSelfie(true)}>
                                    <motion.img src={record.selfie_url} alt="Selfie" style={{ scale: selfieZoom }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-full h-auto max-h-[500px] object-contain" />
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-4 right-4">
                                        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl font-bold shadow-lg text-white",
                                            record.selfie_verification.status === 'approved' ? "bg-emerald-500/90" : record.selfie_verification.status === 'pending' ? "bg-amber-500/90" : "bg-rose-500/90")
                                        }>
                                            {record.selfie_verification.status === 'approved' && <CheckCircle className="h-4 w-4" />}
                                            {record.selfie_verification.status === 'pending' && <Clock className="h-4 w-4" />}
                                            {record.selfie_verification.status === 'rejected' && <XCircle className="h-4 w-4" />}
                                            {record.selfie_verification.status === 'approved' ? 'Terverifikasi' : record.selfie_verification.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                        </div>
                                    </motion.div>
                                </div>
                                {record.selfie_verification.notes && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Catatan Verifikator:</p>
                                        <p className="text-sm text-neutral-700 dark:text-neutral-300">{record.selfie_verification.notes}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* Location Map (Static fallback — no Leaflet required) */}
                        {record.lat && record.long && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                                        <MapPin className="h-5 w-5 text-sky-500" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Lokasi Absen</h2>
                                        <p className="text-xs text-neutral-500">Jarak: {record.distance != null ? Number(record.distance).toFixed(0) : '?'} meter dari zona</p>
                                    </div>
                                </div>
                                <div className="rounded-2xl overflow-hidden h-[300px] border border-white/20">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${record.long - 0.003},${record.lat - 0.002},${record.long + 0.003},${record.lat + 0.002}&layer=mapnik&marker=${record.lat},${record.long}`}
                                        style={{ border: 0 }}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center">
                                        <p className="text-xs text-neutral-500 mb-1">Jarak</p>
                                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{record.distance != null ? Number(record.distance).toFixed(0) : '–'}m</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center">
                                        <p className="text-xs text-neutral-500 mb-1">Latitude</p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{record.lat != null ? Number(record.lat).toFixed(6) : '–'}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center">
                                        <p className="text-xs text-neutral-500 mb-1">Longitude</p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{record.long != null ? Number(record.long).toFixed(6) : '–'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* AI Verification Info */}
                        {record.ai_info && (record.ai_info.face_detected !== null || record.ai_info.ai_confidence !== null) && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} animate={{ boxShadow: ['0 0 0 0 rgba(139,92,246,0)', '0 0 0 10px rgba(139,92,246,0.1)', '0 0 0 0 rgba(139,92,246,0)'] }} transition={{ duration: 2, repeat: Infinity }} className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                        <Brain className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white">AI Verification</h2>
                                        <p className="text-xs text-neutral-500">Analisis wajah otomatis</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {record.ai_info.face_detected !== null && (
                                        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                                            <div className="flex items-center gap-2 mb-2"><Eye className="h-4 w-4 text-neutral-500" /><span className="text-xs text-neutral-500">Wajah Terdeteksi</span></div>
                                            <p className={cn("text-lg font-bold", record.ai_info.face_detected ? "text-emerald-600" : "text-rose-600")}>{record.ai_info.face_detected ? 'Ya ✓' : 'Tidak ✗'}</p>
                                        </div>
                                    )}
                                    {record.ai_info.face_match_score !== null && (
                                        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                                            <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-neutral-500" /><span className="text-xs text-neutral-500">Face Match</span></div>
                                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{(Number(record.ai_info.face_match_score) * 100).toFixed(1)}%</p>
                                        </div>
                                    )}
                                    {record.ai_info.ai_confidence !== null && (
                                        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                                            <div className="flex items-center gap-2 mb-2"><Brain className="h-4 w-4 text-neutral-500" /><span className="text-xs text-neutral-500">AI Confidence</span></div>
                                            <div>
                                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{(Number(record.ai_info.ai_confidence) * 100).toFixed(1)}%</p>
                                                <div className="mt-2 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${Number(record.ai_info.ai_confidence) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-violet-500 to-purple-600" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {record.ai_info.image_quality !== null && (
                                        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                                            <div className="flex items-center gap-2 mb-2"><ImageIcon className="h-4 w-4 text-neutral-500" /><span className="text-xs text-neutral-500">Image Quality</span></div>
                                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{(Number(record.ai_info.image_quality) * 100).toFixed(1)}%</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">

                        {/* Verification Timeline */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                    <Activity className="h-5 w-5 text-violet-500" />
                                </motion.div>
                                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Timeline Verifikasi</h2>
                            </div>
                            <div className="space-y-6">
                                {timeline.map((item, index) => (
                                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.15 }} className="relative pl-10">
                                        {index < timeline.length - 1 && (
                                            <div className="absolute left-[15px] top-9 bottom-[-12px] w-0.5 bg-gradient-to-b from-neutral-300 to-neutral-200 dark:from-neutral-600 dark:to-neutral-700" />
                                        )}
                                        <motion.div whileHover={{ scale: 1.15 }} className={cn("absolute left-0 top-0.5 h-8 w-8 rounded-full flex items-center justify-center shadow-lg",
                                            item.status === 'completed' ? "bg-emerald-500 text-white" : item.status === 'pending' ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                                        )}>
                                            {item.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                                            {item.status === 'pending' && <Clock className="h-4 w-4" />}
                                            {item.status === 'rejected' && <XCircle className="h-4 w-4" />}
                                        </motion.div>
                                        <div>
                                            <p className="font-semibold text-neutral-900 dark:text-white">{item.description}</p>
                                            {item.time && <p className="text-xs text-neutral-500 mt-1">{new Date(item.time).toLocaleString('id-ID')}</p>}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Device Info */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                    <Smartphone className="h-5 w-5 text-indigo-500" />
                                </motion.div>
                                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Informasi Perangkat</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Model', value: record.device_info.model, icon: Smartphone },
                                    { label: 'OS', value: record.device_info.os, icon: Activity },
                                    { label: 'Browser', value: record.device_info.browser, icon: Wifi },
                                    { label: 'Type', value: record.device_info.type, icon: Flag },
                                ].map((item, index) => (
                                    <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ x: 3 }} className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 transition-all">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2"><item.icon className="h-4 w-4" />{item.label}</span>
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-[150px]">{item.value}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Class Comparison */}
                        {classAverage.total > 0 && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <TrendingUp className="h-5 w-5 text-amber-500" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Perbandingan Kelas</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-neutral-600 dark:text-neutral-400">Jarak Anda</span>
                                            <span className="font-bold text-neutral-900 dark:text-white">{record.distance != null ? Number(record.distance).toFixed(0) : '–'}m</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-neutral-600 dark:text-neutral-400">Rata-rata Kelas</span>
                                            <span className="font-bold text-neutral-900 dark:text-white">{classAverage.avg_distance != null ? Number(classAverage.avg_distance).toFixed(0) : '–'}m</span>
                                        </div>
                                        {classAverage.avg_distance > 0 && (
                                            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((Number(record.distance) / Math.max(Number(classAverage.avg_distance), 1)) * 100, 100)}%` }} transition={{ duration: 1, delay: 0.5 }} className={cn("h-full", Number(record.distance) <= Number(classAverage.avg_distance) ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-amber-500 to-orange-600")} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 border-t border-white/20 dark:border-white/5">
                                        <p className="text-xs text-neutral-500 text-center">{classAverage.present_count} dari {classAverage.total} mahasiswa hadir di sesi ini</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Session Info */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                    <Calendar className="h-5 w-5 text-cyan-500" />
                                </motion.div>
                                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Info Sesi</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Mata Kuliah</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{record.session.course.nama}</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Dosen</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{record.session.course.dosen.nama}</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Pertemuan</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">#{record.session.meeting_number}</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">SKS</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{record.session.course.sks}</span>
                                </div>
                                {record.session.start_at && (
                                    <div className="flex justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Waktu Sesi</span>
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {new Date(record.session.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            {record.session.end_at && <> — {new Date(record.session.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</>}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Related Records */}
                        {relatedRecords.length > 0 && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                        <FileText className="h-5 w-5 text-rose-500" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Kehadiran Lain Hari Ini</h2>
                                </div>
                                <div className="space-y-2">
                                    {relatedRecords.map((related, index) => (
                                        <Link key={related.id} href={`/user/history/${related.id}`}>
                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ x: 5, backgroundColor: 'rgba(139, 92, 246, 0.05)' }} className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 cursor-pointer transition-all mb-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{related.course}</p>
                                                        <p className="text-xs text-neutral-500 mt-1">{related.checkInTime}</p>
                                                    </div>
                                                    <div className={cn("px-2 py-1 rounded-full text-xs font-semibold",
                                                        statusConfig[related.status as keyof typeof statusConfig]?.color ?? 'bg-neutral-200 text-neutral-600'
                                                    )}>
                                                        {statusConfig[related.status as keyof typeof statusConfig]?.label ?? related.status}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Note */}
                        {record.note && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Catatan</h2>
                                </div>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">{record.note}</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="history-print-root hidden print:block">
                    <div className="history-print-sheet">
                        <div className="history-print-header">
                            <img src={unpamLogo} alt="Logo UNPAM" className="history-print-logo" />
                            <div className="history-print-title">
                                <h1>Laporan Detail Kehadiran Mahasiswa</h1>
                                <p>Universitas Pamulang • Yayasan Sasmita Jaya</p>
                            </div>
                            <img src={sasmitaLogo} alt="Logo Sasmita" className="history-print-logo" />
                        </div>

                        <div className="history-print-meta">
                            <span><strong>ID Dokumen:</strong> ABS-{record.id}</span>
                            <span><strong>Dicetak:</strong> {printTime}</span>
                            <span className="history-print-status">{status.label}</span>
                        </div>

                        <div className="history-print-main">
                            <section className="history-print-panel">
                                <h3>Data Kehadiran</h3>
                                <table>
                                    <tbody>
                                        <tr><td>Mata Kuliah</td><td>{record.session.course.nama}</td></tr>
                                        <tr><td>Dosen</td><td>{record.session.course.dosen.nama}</td></tr>
                                        <tr><td>Pertemuan</td><td>#{record.session.meeting_number}</td></tr>
                                        <tr><td>Status</td><td>{status.label}</td></tr>
                                        <tr><td>Waktu Scan</td><td>{scannedAtDesktop}</td></tr>
                                        <tr><td>Waktu Sesi</td><td>{sessionTime}</td></tr>
                                        <tr><td>Jarak Lokasi</td><td>{distanceLabel}</td></tr>
                                        <tr><td>Koordinat</td><td>{locationLabel}</td></tr>
                                        <tr><td>Lokasi Maps</td><td>{mapLink || '-'}</td></tr>
                                        <tr><td>Perangkat</td><td>{record.device_info.model} ({record.device_info.os})</td></tr>
                                        <tr><td>Selfie</td><td>{selfieStatusLabel}</td></tr>
                                    </tbody>
                                </table>
                            </section>

                            <section className="history-print-panel">
                                <h3>Bukti & AI</h3>
                                <div className="history-print-selfie">
                                    {selfieImage ? (
                                        <img src={selfieImage} alt="Bukti Selfie" />
                                    ) : (
                                        <div className="history-print-selfie-placeholder">Bukti selfie tidak tersedia</div>
                                    )}
                                </div>
                                <table className="history-print-ai">
                                    <tbody>
                                        <tr><td>Face Match</td><td>{faceMatch}</td></tr>
                                        <tr><td>AI Confidence</td><td>{aiConfidence}</td></tr>
                                        <tr><td>Image Quality</td><td>{imageQuality}</td></tr>
                                        <tr><td>URL Detail</td><td>{typeof window !== 'undefined' ? window.location.href : '-'}</td></tr>
                                    </tbody>
                                </table>
                            </section>
                        </div>

                        <section className="history-print-note">
                            <h4>Catatan</h4>
                            <p>{record.note || 'Tidak ada catatan tambahan.'}</p>
                        </section>

                        <div className="history-print-footer">
                            <div className="history-print-sign">
                                Mengetahui,<br />Petugas Akademik
                                <div className="history-print-line" />
                                (................................)
                            </div>
                            <div className="history-print-sign">
                                Tangerang Selatan, {printDateOnly}<br />Mahasiswa
                                <div className="history-print-line" />
                                (................................)
                            </div>
                        </div>
                    </div>
                </div>

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 8mm;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .history-print-root,
                    .history-print-root * {
                        visibility: visible !important;
                    }

                    .history-print-root {
                        position: fixed;
                        inset: 0;
                        display: block !important;
                        background: white;
                        color: #0f172a;
                    }

                    .history-print-sheet {
                        width: 194mm;
                        height: 281mm;
                        margin: 0 auto;
                        border: 1px solid #dbe3ef;
                        border-radius: 6mm;
                        padding: 7mm;
                        display: flex;
                        flex-direction: column;
                        gap: 4mm;
                        overflow: hidden;
                        font-family: "Segoe UI", Arial, sans-serif;
                    }

                    .history-print-header {
                        display: grid;
                        grid-template-columns: 18mm 1fr 18mm;
                        align-items: center;
                        gap: 4mm;
                        border-bottom: 1px solid #dbeafe;
                        padding-bottom: 3mm;
                    }

                    .history-print-logo {
                        width: 18mm;
                        height: 18mm;
                        object-fit: contain;
                    }

                    .history-print-title {
                        text-align: center;
                        line-height: 1.2;
                    }

                    .history-print-title h1 {
                        margin: 0;
                        font-size: 14.6px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #1e3a8a;
                        letter-spacing: .3px;
                    }

                    .history-print-title p {
                        margin: 2px 0 0;
                        font-size: 11px;
                        font-weight: 600;
                        color: #334155;
                    }

                    .history-print-meta {
                        display: grid;
                        grid-template-columns: 1fr 1fr auto;
                        gap: 2.5mm;
                        align-items: center;
                        font-size: 10.3px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 3mm;
                        padding: 2.5mm 3mm;
                    }

                    .history-print-status {
                        font-weight: 700;
                        background: #dcfce7;
                        border: 1px solid #86efac;
                        border-radius: 999px;
                        padding: 3px 8px;
                        white-space: nowrap;
                    }

                    .history-print-main {
                        display: grid;
                        grid-template-columns: 1.2fr .8fr;
                        gap: 3.5mm;
                        flex: 1;
                        min-height: 0;
                    }

                    .history-print-panel {
                        border: 1px solid #e2e8f0;
                        border-radius: 3mm;
                        padding: 2.8mm;
                        background: white;
                        min-height: 0;
                    }

                    .history-print-panel h3 {
                        margin: 0 0 2mm;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: .4px;
                        color: #1e293b;
                    }

                    .history-print-panel table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                    }

                    .history-print-panel td {
                        border-bottom: 1px solid #eef2f7;
                        padding: 1.25mm 1mm;
                        line-height: 1.3;
                        vertical-align: top;
                    }

                    .history-print-panel td:first-child {
                        width: 38%;
                        color: #475569;
                        font-weight: 600;
                    }

                    .history-print-panel td:last-child {
                        color: #0f172a;
                        font-weight: 700;
                        word-break: break-word;
                    }

                    .history-print-selfie {
                        border: 1px solid #e2e8f0;
                        border-radius: 2.8mm;
                        height: 66mm;
                        background: #f8fafc;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .history-print-selfie img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }

                    .history-print-selfie-placeholder {
                        font-size: 10px;
                        font-weight: 700;
                        color: #64748b;
                    }

                    .history-print-ai {
                        margin-top: 2.5mm;
                    }

                    .history-print-note {
                        border: 1px solid #fde68a;
                        border-radius: 3mm;
                        background: #fffbeb;
                        padding: 2.4mm 2.8mm;
                        min-height: 12mm;
                        max-height: 18mm;
                        overflow: hidden;
                    }

                    .history-print-note h4 {
                        margin: 0 0 1.2mm;
                        font-size: 10px;
                        text-transform: uppercase;
                        color: #92400e;
                        letter-spacing: .35px;
                    }

                    .history-print-note p {
                        margin: 0;
                        font-size: 10px;
                        line-height: 1.35;
                        color: #78350f;
                    }

                    .history-print-footer {
                        border-top: 1px solid #dbeafe;
                        padding-top: 3mm;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 6mm;
                        margin-top: auto;
                    }

                    .history-print-sign {
                        text-align: center;
                        font-size: 10.2px;
                        color: #334155;
                    }

                    .history-print-line {
                        margin: 16mm auto 2mm;
                        width: 85%;
                        border-top: 1px solid #334155;
                    }
                }
            `}</style>

            {/* ── Fullscreen Selfie Modal ── */}
            <AnimatePresence>
                {showFullscreenSelfie && record.selfie_url && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setShowFullscreenSelfie(false)}>
                        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowFullscreenSelfie(false)} className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl z-10">
                            <X className="h-6 w-6 text-white" />
                        </motion.button>
                        <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} src={record.selfie_url} alt="Selfie Fullscreen" className="max-w-full max-h-full object-contain rounded-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Share Modal ── */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-h-[88svh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl dark:bg-neutral-900 sm:mx-4 sm:max-w-2xl sm:rounded-3xl sm:p-6"
                        >
                            <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300 dark:bg-neutral-700 sm:hidden" />

                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Share Kehadiran</h3>
                                    <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                                        Semua konten share dihasilkan otomatis dari data kehadiran real.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowShareModal(false)}
                                    className="h-9 w-9 rounded-xl"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleShare('whatsapp')}
                                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25"
                                >
                                    <WhatsAppBrandIcon className="h-5 w-5" />
                                    WhatsApp
                                </motion.button>

                                {canUseNativeShare ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleNativeShare}
                                        className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
                                    >
                                        <Share2 className="h-5 w-5" />
                                        Share Device
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCopyShareText}
                                        className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
                                    >
                                        {copySuccess ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                                        {copySuccess ? 'Tersalin' : 'Copy Teks'}
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleShare('twitter')}
                                    className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <XBrandIcon className="h-5 w-5" />
                                    X / Twitter
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleShare('facebook')}
                                    className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <FacebookBrandIcon className="h-5 w-5" />
                                    Facebook
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCopyShareText}
                                    className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-950/40 dark:text-indigo-200"
                                >
                                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copySuccess ? 'Teks Berhasil Disalin' : 'Salin Format Pesan Lengkap'}
                                </motion.button>
                            </div>

                            <div className="mb-4 rounded-2xl border border-white/20 bg-neutral-50 p-4 dark:border-white/10 dark:bg-neutral-800/60">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Ringkasan Data</p>
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div className="rounded-xl bg-white/80 p-2 dark:bg-neutral-900/60">
                                        <p className="text-neutral-500">Status</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{status.label}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/80 p-2 dark:bg-neutral-900/60">
                                        <p className="text-neutral-500">Pertemuan</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">#{record.session.meeting_number}</p>
                                    </div>
                                    <div className="col-span-2 rounded-xl bg-white/80 p-2 dark:bg-neutral-900/60">
                                        <p className="text-neutral-500">Mata Kuliah</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{record.session.course.nama}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/80 p-2 dark:bg-neutral-900/60">
                                        <p className="text-neutral-500">Waktu Scan</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{scannedAtMobile}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/80 p-2 dark:bg-neutral-900/60">
                                        <p className="text-neutral-500">Jarak</p>
                                        <p className="font-bold text-neutral-900 dark:text-white">{distanceLabel}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-indigo-200/60 bg-indigo-50/60 px-4 py-3 dark:border-indigo-400/20 dark:bg-indigo-950/30">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                                        Preview Pesan WhatsApp
                                    </p>
                                    <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80">
                                        Opsional, tidak wajib dibuka.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowSharePreview((prev) => !prev)}
                                    className="rounded-xl border border-indigo-300/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-900/40 dark:text-indigo-200"
                                >
                                    {showSharePreview ? 'Sembunyikan' : 'Lihat'}
                                </button>
                            </div>

                            <AnimatePresence initial={false}>
                                {showSharePreview && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="mb-4 rounded-2xl border border-indigo-200/60 bg-indigo-50/60 p-4 dark:border-indigo-400/20 dark:bg-indigo-950/30"
                                    >
                                        <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-neutral-700 dark:text-neutral-200">
                                            {getShareMessage()}
                                        </pre>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <p className="mt-4 text-center text-[11px] leading-relaxed text-neutral-500">
                                Klik salah satu opsi di atas. Untuk WhatsApp, sistem akan langsung membuka chat dengan format laporan yang sudah rapi.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}

function WhatsAppBrandIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                fill="currentColor"
                d="M19.11 4.93A9.87 9.87 0 0 0 12.07 2C6.52 2 2 6.52 2 12.07c0 1.78.47 3.53 1.36 5.06L2 22l5.01-1.31a10.05 10.05 0 0 0 5.06 1.38h.01c5.55 0 10.07-4.52 10.07-10.07a10 10 0 0 0-3.04-7.07Zm-7.03 15.44h-.01a8.33 8.33 0 0 1-4.24-1.16l-.3-.18-2.97.78.79-2.89-.2-.3a8.32 8.32 0 1 1 6.93 3.75Zm4.57-6.24c-.25-.13-1.47-.72-1.7-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.01-.39.11-.52.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.41-.56-.42l-.48-.01c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.18 3.7.58.25 1.04.41 1.4.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.47-.29Z"
            />
        </svg>
    );
}

function XBrandIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                fill="currentColor"
                d="M18.244 2H21l-6.02 6.88L22 22h-5.46l-4.27-5.59L7.33 22H4.57l6.44-7.37L2 2h5.59l3.86 5.1L18.24 2Zm-.97 18h1.52L6.76 3.89H5.13L17.27 20Z"
            />
        </svg>
    );
}

function FacebookBrandIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                fill="currentColor"
                d="M13.5 22v-8h2.9l.45-3.5h-3.35V8.26c0-1.02.28-1.72 1.75-1.72H17V3.4c-.29-.04-1.28-.12-2.43-.12-2.4 0-4.05 1.47-4.05 4.18V10.5H8v3.5h2.52v8H13.5Z"
            />
        </svg>
    );
}
