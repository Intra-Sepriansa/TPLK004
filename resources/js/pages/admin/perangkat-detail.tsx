import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { motion, Variants } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Ban,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Code,
    Cpu,
    Download,
    Eye,
    HardDrive,
    History,
    Info,
    Lightbulb,
    Loader2,
    LogIn,
    Mail,
    MapPin,
    MessageSquare,
    Monitor,
    MoreVertical,
    Phone,
    QrCode,
    Shield,
    Smartphone,
    TrendingDown,
    TrendingUp,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { toast } from 'sonner';

import iconPerangkat from '@/assets/admin/perangkat/perangkat-icon.png';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
);

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: any = {
        active: {
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/50',
            text: 'text-emerald-400',
            icon: CheckCircle,
            label: 'Aktif',
        },
        blocked: {
            bg: 'bg-red-500/20',
            border: 'border-red-500/50',
            text: 'text-red-400',
            icon: Ban,
            label: 'Diblokir',
        },
        suspicious: {
            bg: 'bg-amber-500/20',
            border: 'border-amber-500/50',
            text: 'text-amber-400',
            icon: AlertTriangle,
            label: 'Mencurigakan',
        },
        whitelisted: {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/50',
            text: 'text-blue-400',
            icon: Shield,
            label: 'Whitelist',
        },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${config.bg} ${config.border} ${config.text} border text-xs font-semibold`}
        >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </div>
    );
};

export default function PerangkatDetail({
    deviceInfo,
    student,
    stats,
    timeline,
    locations,
    security,
    anomalies,
    activities,
}: any) {
    const [filter, setFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const [isOpeningChat, setIsOpeningChat] = useState(false);
    const [showAllLocations, setShowAllLocations] = useState(false);

    const deviceIdentifier = String(
        deviceInfo?.deviceId || deviceInfo?.id || '-',
    );
    const deviceModel = String(deviceInfo?.model || '-');
    const safeLocations = Array.isArray(locations) ? locations : [];

    const handleBlock = () => {
        setIsExporting(true); // Reusing state for button loading temporarily if needed, or better just use toast
        toast.info('Memproses pemblokiran perangkat...');
        router.post(
            `/admin/perangkat/${deviceInfo.id}/block`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success(
                        (page.props as any).flash?.success ||
                            'Perangkat berhasil diblokir.',
                    );
                },
                onFinish: () => {
                    setIsExporting(false);
                },
            },
        );
    };

    const handleWhitelist = () => {
        setIsExporting(true);
        toast.info('Memproses verifikasi perangkat (Whitelist)...');
        router.post(
            `/admin/perangkat/${deviceInfo.id}/whitelist`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success(
                        (page.props as any).flash?.success ||
                            'Perangkat berhasil ditandai aman.',
                    );
                },
                onFinish: () => {
                    setIsExporting(false);
                },
            },
        );
    };

    const handleExport = () => {
        setIsExporting(true);
        toast.info('Menyiapkan file PDF detail perangkat...');

        setTimeout(() => {
            window.open(
                `/admin/perangkat/${deviceInfo.id}/export-pdf`,
                '_blank',
            );
            setIsExporting(false);
            toast.success('File PDF berhasil disiapkan dan diunduh.');
        }, 1500);
    };

    const openLocationInMaps = (location: any) => {
        const directUrl = location?.google_maps_url;
        if (typeof directUrl === 'string' && directUrl.startsWith('http')) {
            window.open(directUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        const coordinates = String(location?.coordinates || '')
            .split(',')
            .map((part: string) => Number(part.trim()));

        if (
            coordinates.length === 2 &&
            !Number.isNaN(coordinates[0]) &&
            !Number.isNaN(coordinates[1])
        ) {
            window.open(
                `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`,
                '_blank',
                'noopener,noreferrer',
            );
            return;
        }

        toast.error('Koordinat lokasi belum tersedia.');
    };

    const handleContactStudent = () => {
        if (!student?.id) {
            toast.error('Data mahasiswa tidak tersedia.');
            return;
        }

        setIsOpeningChat(true);
        toast.info('Membuka chat mahasiswa...');

        router.post(
            '/chat',
            {
                type: 'personal',
                participant_id: student.id,
                participant_type: 'App\\Models\\Mahasiswa',
            },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Gagal membuka chat mahasiswa.');
                },
                onFinish: () => {
                    setIsOpeningChat(false);
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title={`Detail Perangkat - ${deviceInfo.model}`} />

            <div className="min-h-screen bg-slate-50 pb-12 dark:bg-black">
                <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {/* ═══════ HEADER — Matching Perangkat Style ═══════ */}
                        <motion.div
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
                        >
                            {/* Animated Gradient Background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                                animate={{
                                    backgroundPosition: [
                                        '0% 0%',
                                        '100% 100%',
                                        '0% 0%',
                                    ],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                style={{
                                    backgroundSize: '200% 200%',
                                }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                            {/* Floating Animations (Pulses) */}

                            <div className="relative z-10">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                        router.visit('/admin/perangkat')
                                    }
                                    className="mb-4 -ml-4 text-white/80 hover:bg-white/10 hover:text-white"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Kembali ke Daftar Perangkat
                                </Button>
                                <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
                                    <div className="flex min-w-0 flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                        <motion.div
                                            className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
                                            initial={{
                                                opacity: 0,
                                                scale: 0.5,
                                                rotate: -10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                rotate: 0,
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                delay: 0.2,
                                            }}
                                            whileHover={{
                                                scale: 1.05,
                                                rotate: 5,
                                            }}
                                        >
                                            <img
                                                src={iconPerangkat}
                                                alt="Perangkat"
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                            />
                                        </motion.div>
                                        <div className="mt-1 min-w-0 flex-1 sm:mt-0">
                                            <p className="mb-1 text-[11px] font-medium tracking-wide text-indigo-100/90 sm:text-sm">
                                                <span className="mr-1">
                                                    ID:
                                                </span>
                                                <span
                                                    className="inline-block max-w-full align-middle font-mono leading-tight break-all text-indigo-50/95"
                                                    title={deviceIdentifier}
                                                >
                                                    {deviceIdentifier}
                                                </span>
                                            </p>
                                            <h1
                                                className="mb-2 line-clamp-2 text-xl leading-tight font-bold break-words text-white sm:line-clamp-1 sm:text-3xl"
                                                title={deviceModel}
                                            >
                                                {deviceModel}
                                            </h1>
                                            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-indigo-100 sm:justify-start sm:gap-3 sm:text-sm">
                                                <span>{deviceInfo.os}</span>
                                                <span className="hidden text-indigo-300 sm:inline">
                                                    •
                                                </span>
                                                <StatusBadge
                                                    status={deviceInfo.status}
                                                />
                                                <span className="hidden text-indigo-300 sm:inline">
                                                    •
                                                </span>
                                                <span className="max-w-full break-words">
                                                    Digunakan oleh:{' '}
                                                    <span className="font-semibold text-white">
                                                        {student.nama}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="z-10 flex shrink-0 flex-wrap items-center justify-center gap-2 sm:gap-3">
                                        <button
                                            onClick={handleExport}
                                            disabled={isExporting}
                                            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                                        >
                                            {isExporting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            <span className="hidden sm:inline">
                                                {isExporting
                                                    ? 'Mengekspor...'
                                                    : 'Export PDF'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={handleWhitelist}
                                            className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-500/30 sm:px-4"
                                        >
                                            <Shield className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                Whitelist
                                            </span>
                                        </button>

                                        <button
                                            onClick={handleBlock}
                                            className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-50 shadow-lg shadow-rose-500/10 backdrop-blur-sm transition-all duration-300 hover:border-rose-400/50 hover:bg-rose-500/30 sm:px-4"
                                        >
                                            <Ban className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                Block Device
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 1. TOP STATS CARDS */}
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                            {[
                                {
                                    label: 'Total Scan',
                                    value: stats.totalScans,
                                    icon: Activity,
                                    color: 'violet',
                                    trend: '+12%',
                                    trendUp: true,
                                },
                                {
                                    label: 'Waktu Terakhir',
                                    value:
                                        stats.lastAccess.split(',')[1] ??
                                        stats.lastAccess,
                                    icon: Clock,
                                    color: 'blue',
                                    subtitle: stats.lastAccess.split(',')[0],
                                },
                                {
                                    label: 'OS System',
                                    value: stats.osSystem,
                                    icon: Cpu,
                                    color: 'emerald',
                                    subtitle: stats.osVersion,
                                },
                                {
                                    label: 'Status Keamanan',
                                    value: stats.securityScore + '%',
                                    icon: Shield,
                                    color:
                                        stats.securityScore > 80
                                            ? 'emerald'
                                            : 'amber',
                                    subtitle:
                                        stats.securityScore > 80
                                            ? 'Aman'
                                            : 'Perlu Perhatian',
                                },
                            ].map((card, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 sm:p-6 hover:border-${card.color}-500/50 group relative overflow-hidden backdrop-blur-md`}
                                >
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br from-${card.color}-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                                    />
                                    <div className="relative z-10">
                                        <div
                                            className={`mb-4 inline-flex rounded-xl p-3 bg-${card.color}-500/10 border border-${card.color}-500/20 group-hover:bg-${card.color}-500/20 transition-all`}
                                        >
                                            <card.icon
                                                className={`h-5 w-5 sm:h-6 sm:w-6 text-${card.color}-400`}
                                            />
                                        </div>
                                        <div className="mb-1 text-xs text-slate-400 sm:mb-2 sm:text-sm">
                                            {card.label}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                                {card.value}
                                            </div>
                                            {card.trend && (
                                                <div
                                                    className={`flex items-center gap-1 text-xs font-semibold ${card.trendUp ? 'text-emerald-400' : 'text-red-400'}`}
                                                >
                                                    {card.trendUp ? (
                                                        <TrendingUp className="h-3 w-3" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3" />
                                                    )}
                                                    <span>{card.trend}</span>
                                                </div>
                                            )}
                                        </div>
                                        {card.subtitle && (
                                            <div className="mt-2 text-xs font-medium text-slate-500">
                                                {card.subtitle}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={`pointer-events-none absolute right-[-10%] bottom-[-10%] transform opacity-5 transition-transform duration-500 group-hover:scale-110`}
                                    >
                                        <card.icon
                                            className={`h-32 w-32 text-${card.color}-600`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* MAIN CONTENT GRID */}
                        <div className="grid gap-6 lg:grid-cols-5">
                            {/* LEFT COLUMN (60%) */}
                            <div className="space-y-6 lg:col-span-3">
                                {/* 2. Device Info Card */}
                                <motion.div
                                    variants={itemVariants}
                                    className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md"
                                >
                                    <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-5">
                                        <Smartphone className="h-48 w-48 text-violet-500" />
                                    </div>
                                    <div className="relative z-10 mb-6 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                            <Smartphone className="h-5 w-5 text-violet-400" />
                                            Informasi Perangkat
                                        </h3>
                                        <button className="rounded-lg p-2 transition-colors hover:bg-slate-800">
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </div>

                                    {/* Hardware Specs */}
                                    <div className="relative z-10 mb-6 space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-800/80 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5">
                                                    <Monitor className="h-4 w-4 text-violet-400" />
                                                </div>
                                                <div>
                                                    <div className="mb-0.5 text-xs font-medium text-slate-400">
                                                        Model
                                                    </div>
                                                    <div className="text-sm font-semibold text-white">
                                                        {deviceInfo.model}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-800/80 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                                                    <Cpu className="h-4 w-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="mb-0.5 text-xs font-medium text-slate-400">
                                                        Processor / Platform
                                                    </div>
                                                    <div className="text-sm font-semibold text-white">
                                                        {deviceInfo.processor}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-800/80 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
                                                    <HardDrive className="h-4 w-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="mb-0.5 text-xs font-medium text-slate-400">
                                                        Screen Resolution
                                                    </div>
                                                    <div className="text-sm font-semibold text-white">
                                                        {deviceInfo.resolution}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Software Info */}
                                    <div className="relative z-10 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
                                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
                                            <Code className="h-4 w-4 text-slate-400" />
                                            Software Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">
                                                    OS Version
                                                </span>
                                                <span className="rounded-md bg-slate-800 px-2 py-1 font-medium text-white">
                                                    {deviceInfo.osVersion}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">
                                                    Browser
                                                </span>
                                                <span className="rounded-md bg-slate-800 px-2 py-1 font-medium text-white">
                                                    {deviceInfo.browser}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Agent */}
                                    <div className="relative z-10 mt-5 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-slate-500" />
                                            <div className="text-xs font-medium text-slate-400">
                                                User Agent String (Raw)
                                            </div>
                                        </div>
                                        <div className="font-mono text-xs leading-relaxed break-all text-slate-500">
                                            {deviceInfo.userAgent}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 3. Usage Timeline Chart */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md"
                                >
                                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                            <Activity className="h-5 w-5 text-violet-400" />
                                            Timeline Penggunaan
                                        </h3>
                                        <Select defaultValue="7d">
                                            <SelectTrigger className="w-[160px] border-slate-700 bg-slate-800/80 text-slate-300">
                                                <SelectValue placeholder="Pilih Rentang" />
                                            </SelectTrigger>
                                            <SelectContent className="border-slate-700 bg-slate-800">
                                                <SelectItem value="7d">
                                                    7 Hari Terakhir
                                                </SelectItem>
                                                <SelectItem value="30d">
                                                    30 Hari Terakhir
                                                </SelectItem>
                                                <SelectItem value="3m">
                                                    3 Bulan Terakhir
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="mt-4 h-64 w-full sm:h-72">
                                        <Line
                                            data={{
                                                labels: timeline.labels,
                                                datasets: [
                                                    {
                                                        label: 'Jumlah Akses',
                                                        data: timeline.values,
                                                        borderColor: '#8b5cf6',
                                                        backgroundColor:
                                                            'rgba(139, 92, 246, 0.15)',
                                                        borderWidth: 2,
                                                        fill: true,
                                                        tension: 0.4,
                                                        pointRadius: 4,
                                                        pointHoverRadius: 6,
                                                        pointBackgroundColor:
                                                            '#8b5cf6',
                                                        pointBorderColor:
                                                            '#fff',
                                                        pointBorderWidth: 2,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        backgroundColor:
                                                            '#1e293b',
                                                        titleColor: '#f1f5f9',
                                                        bodyColor: '#94a3b8',
                                                        borderColor: '#334155',
                                                        borderWidth: 1,
                                                        padding: 12,
                                                        displayColors: false,
                                                    },
                                                },
                                                scales: {
                                                    x: {
                                                        grid: {
                                                            color: '#1e293b',
                                                        },
                                                        ticks: {
                                                            color: '#64748b',
                                                        },
                                                    },
                                                    y: {
                                                        grid: {
                                                            color: '#1e293b',
                                                        },
                                                        ticks: {
                                                            color: '#64748b',
                                                            stepSize: 1,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>

                                    <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6">
                                        <div className="rounded-2xl bg-slate-800/30 p-3 text-center">
                                            <div className="text-2xl font-bold text-violet-400">
                                                {timeline.avgDaily}
                                            </div>
                                            <div className="mt-1 text-xs font-medium text-slate-400">
                                                Rata-rata Harian
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-slate-800/30 p-3 text-center">
                                            <div className="text-2xl font-bold text-blue-400">
                                                {timeline.peakDay}
                                            </div>
                                            <div className="mt-1 text-xs font-medium text-slate-400">
                                                Hari Tersibuk
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-slate-800/30 p-3 text-center">
                                            <div className="text-2xl font-bold text-emerald-400">
                                                {timeline.totalWeek}
                                            </div>
                                            <div className="mt-1 text-xs font-medium text-slate-400">
                                                Total Minggu Ini
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 4. Security Analysis Card */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md"
                                >
                                    <h3 className="mb-8 flex items-center gap-2 text-lg font-semibold text-white">
                                        <Shield className="h-5 w-5 text-violet-400" />
                                        Analisis Keamanan
                                    </h3>

                                    <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
                                        {/* Score Gauge */}
                                        <div className="relative flex h-48 w-48 flex-shrink-0 flex-col items-center justify-center">
                                            <svg className="h-full w-full -rotate-90 transform">
                                                <circle
                                                    cx="96"
                                                    cy="96"
                                                    r="80"
                                                    stroke="#1e293b"
                                                    strokeWidth="12"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="96"
                                                    cy="96"
                                                    r="80"
                                                    stroke={
                                                        security.score >= 80
                                                            ? '#10b981'
                                                            : security.score >=
                                                                50
                                                              ? '#f59e0b'
                                                              : '#ef4444'
                                                    }
                                                    strokeWidth="12"
                                                    fill="none"
                                                    strokeDasharray={`${(security.score / 100) * 502} 502`}
                                                    strokeLinecap="round"
                                                    className="drop-shadow-lg transition-all duration-1000 ease-out"
                                                    style={{
                                                        filter: `drop-shadow(0 0 10px ${security.score >= 80 ? 'rgba(16,185,129,0.4)' : security.score >= 50 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'})`,
                                                    }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <div
                                                    className={`text-5xl font-bold ${security.score >= 80 ? 'text-emerald-400' : security.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}
                                                >
                                                    {security.score}
                                                </div>
                                                <div className="mt-1 text-xs font-medium text-slate-400">
                                                    Security Score
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checks & Recs */}
                                        <div className="w-full flex-1 space-y-4">
                                            <div
                                                className={`bg-opacity-10 inline-flex items-center gap-2 rounded-xl border px-4 py-2 ${security.score >= 80 ? 'border-emerald-500/30 bg-emerald-500/10' : security.score >= 50 ? 'border-amber-500/30 bg-amber-500/10' : 'border-red-500/30 bg-red-500/10'}`}
                                            >
                                                {security.score >= 80 ? (
                                                    <Shield className="h-4 w-4 text-emerald-400" />
                                                ) : (
                                                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                                                )}
                                                <span
                                                    className={`text-sm font-semibold ${security.score >= 80 ? 'text-emerald-400' : security.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}
                                                >
                                                    Risiko{' '}
                                                    {security.score >= 80
                                                        ? 'Rendah'
                                                        : security.score >= 50
                                                          ? 'Sedang'
                                                          : 'Tinggi'}
                                                </span>
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {security.checks.map(
                                                    (
                                                        check: any,
                                                        idx: number,
                                                    ) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 p-3.5 transition-colors hover:border-slate-600"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {check.passed ? (
                                                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-400" />
                                                                )}
                                                                <span className="text-sm font-medium text-slate-300">
                                                                    {
                                                                        check.label
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            {security.recommendations.length >
                                                0 && (
                                                <div className="mt-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4">
                                                    <div className="mb-2 flex items-start gap-2">
                                                        <Lightbulb className="mt-0.5 h-4 w-4 animate-pulse text-amber-400" />
                                                        <div className="text-sm font-semibold text-amber-400">
                                                            Rekomendasi
                                                        </div>
                                                    </div>
                                                    <ul className="ml-6 list-disc space-y-1.5 text-xs text-amber-200/80">
                                                        {security.recommendations.map(
                                                            (
                                                                rec: string,
                                                                idx: number,
                                                            ) => (
                                                                <li
                                                                    key={idx}
                                                                    className="leading-snug"
                                                                >
                                                                    {rec}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* RIGHT COLUMN (40%) */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* 5. Student Info Card */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md"
                                >
                                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
                                        <User className="h-5 w-5 text-violet-400" />
                                        Info Pengguna Dominan
                                    </h3>

                                    <div className="mb-6 flex items-center gap-5 border-b border-slate-800/80 pb-6">
                                        <div className="relative">
                                            <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-violet-500/30 shadow-lg shadow-violet-500/20">
                                                {student.foto ? (
                                                    <img
                                                        src={student.foto}
                                                        alt={student.nama}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-purple-600/10">
                                                        <User className="h-10 w-10 text-violet-400/50" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -right-2 -bottom-2 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-slate-900 bg-emerald-500 shadow-lg">
                                                <CheckCircle className="h-3 w-3 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="text-lg font-bold text-white">
                                                {student.nama}
                                            </div>
                                            <div className="mt-0.5 font-mono text-sm font-medium text-violet-400">
                                                {student.nim}
                                            </div>
                                            <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                                                <span>{student.prodi}</span>
                                                <span className="h-1 w-1 rounded-full bg-slate-600" />
                                                <span>
                                                    Semester {student.semester}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 text-center transition-colors hover:bg-slate-800/60">
                                            <div className="mb-1.5 text-xs font-medium text-slate-400">
                                                Total Absen
                                            </div>
                                            <div className="text-2xl font-bold tracking-tight text-white">
                                                {student.totalAbsen}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 text-center transition-colors hover:bg-slate-800/60">
                                            <div className="mb-1.5 text-xs font-medium text-slate-400">
                                                Kehadiran
                                            </div>
                                            <div className="text-2xl font-bold tracking-tight text-emerald-400">
                                                {student.kehadiran}%
                                            </div>
                                        </div>
                                    </div>

                                    {student.email !== '-' && (
                                        <div className="mb-6 space-y-3 rounded-xl border border-slate-800/50 bg-slate-950/30 p-4">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="rounded-lg bg-slate-800 p-1.5 text-slate-400">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-slate-300">
                                                    {student.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="rounded-lg bg-slate-800 p-1.5 text-slate-400">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-slate-300">
                                                    {student.phone}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            href={`/admin/mahasiswa/${student.id}`}
                                            className="w-full"
                                        >
                                            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-medium text-white shadow-lg shadow-violet-600/20 transition-all duration-300 hover:bg-violet-500">
                                                <Eye className="h-4 w-4" />
                                                <span>Profile Detail</span>
                                            </button>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleContactStudent}
                                            disabled={
                                                isOpeningChat || !student?.id
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isOpeningChat ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <MessageSquare className="h-4 w-4" />
                                            )}
                                            <span>
                                                {isOpeningChat
                                                    ? 'Membuka Chat...'
                                                    : 'Hubungi'}
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>

                                {/* 6. Location Map Card */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md"
                                >
                                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
                                        <MapPin className="h-5 w-5 text-violet-400" />
                                        Lokasi Akses
                                    </h3>

                                    <div className="group relative mb-5 h-48 cursor-crosshair overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950">
                                        {/* Stylized Grid pattern as map placeholder */}
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                backgroundImage:
                                                    'radial-gradient(#334155 1px, transparent 1px)',
                                                backgroundSize: '20px 20px',
                                                opacity: 0.3,
                                            }}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <MapPin className="mx-auto mb-2 h-10 w-10 text-violet-500/20" />
                                                <div className="text-xs font-medium tracking-widest text-slate-500 uppercase">
                                                    GPS Tracker Active
                                                </div>
                                            </div>
                                        </div>

                                        {safeLocations.map(
                                            (loc: any, index: number) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() =>
                                                        openLocationInMaps(loc)
                                                    }
                                                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-slate-900 bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.8)] transition-transform hover:scale-125"
                                                    style={{
                                                        left: `${loc.x}%`,
                                                        top: `${loc.y}%`,
                                                    }}
                                                    title={`Buka peta: ${loc.name}`}
                                                >
                                                    <span className="absolute inset-0 animate-ping rounded-full bg-violet-400 opacity-75"></span>
                                                </button>
                                            ),
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {(showAllLocations
                                            ? safeLocations
                                            : safeLocations.slice(0, 3)
                                        ).map((loc: any, index: number) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() =>
                                                    openLocationInMaps(loc)
                                                }
                                                className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 p-3.5 text-left transition-all hover:border-violet-500/50 hover:bg-slate-800"
                                                title="Buka lokasi di Google Maps"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-violet-500/10 p-2.5 transition-colors group-hover:bg-violet-500/20">
                                                        <MapPin className="h-4 w-4 text-violet-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-medium text-white">
                                                            {loc.name}
                                                        </div>
                                                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                                                            {loc.coordinates}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-violet-400">
                                                        {loc.count}x
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-violet-400" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (safeLocations.length === 0) {
                                                toast.error(
                                                    'Belum ada data lokasi untuk ditampilkan.',
                                                );
                                                return;
                                            }
                                            if (safeLocations.length > 3) {
                                                setShowAllLocations(
                                                    (prev) => !prev,
                                                );
                                                return;
                                            }
                                            openLocationInMaps(
                                                safeLocations[0],
                                            );
                                        }}
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>
                                            {safeLocations.length > 3
                                                ? showAllLocations
                                                    ? 'Sembunyikan Log Lokasi'
                                                    : `Log Lokasi Lengkap (${safeLocations.length})`
                                                : 'Buka Lokasi di Maps'}
                                        </span>
                                    </button>
                                </motion.div>

                                {/* 7. Anomaly Detection Card */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md"
                                >
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                            <AlertTriangle className="h-5 w-5 text-violet-400" />
                                            Deteksi Anomali
                                        </h3>
                                        {anomalies.active > 0 && (
                                            <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5">
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                                                <span className="text-xs font-bold text-red-400">
                                                    {anomalies.active} Aktif
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {anomalies.list.length > 0 ? (
                                        <div className="space-y-3">
                                            {anomalies.list.map(
                                                (
                                                    anomaly: any,
                                                    index: number,
                                                ) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{
                                                            opacity: 0,
                                                            x: -20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.05,
                                                        }}
                                                        className={`cursor-pointer rounded-xl border p-4 transition-all ${anomaly.severity === 'high' ? 'border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent hover:border-red-500/50' : anomaly.severity === 'medium' ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent hover:border-amber-500/50' : 'border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-transparent hover:border-blue-500/50'}`}
                                                    >
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <div className="flex items-center gap-2.5">
                                                                {anomaly.severity ===
                                                                'high' ? (
                                                                    <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />
                                                                ) : anomaly.severity ===
                                                                  'medium' ? (
                                                                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400" />
                                                                ) : (
                                                                    <Info className="mt-0.5 h-4 w-4 text-blue-400" />
                                                                )}
                                                                <span
                                                                    className={`text-sm font-bold ${anomaly.severity === 'high' ? 'text-red-400' : anomaly.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'}`}
                                                                >
                                                                    {
                                                                        anomaly.type
                                                                    }
                                                                </span>
                                                            </div>
                                                            <span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                                                {
                                                                    anomaly.timestamp
                                                                }
                                                            </span>
                                                        </div>
                                                        <p className="mx-1 mb-3 text-sm leading-relaxed text-slate-300">
                                                            {
                                                                anomaly.description
                                                            }
                                                        </p>
                                                        <div className="mt-3 flex items-center gap-3 border-t border-slate-800/50 pt-3">
                                                            <button className="text-xs font-semibold text-violet-400 transition-colors hover:text-violet-300">
                                                                Investigasi
                                                            </button>
                                                            <span className="h-1 w-1 rounded-full bg-slate-700" />
                                                            <button className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-300">
                                                                Tandai Aman
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
                                                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-400">
                                                Tidak ada anomali terdeteksi
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>

                        {/* 8. Bottom Section: Activity History Table */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md"
                        >
                            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <History className="h-5 w-5 text-violet-400" />
                                    Riwayat Aktivitas Session
                                </h3>
                                <div className="flex items-center gap-3">
                                    <Select
                                        value={filter}
                                        onValueChange={setFilter}
                                    >
                                        <SelectTrigger className="w-[180px] border-slate-700 bg-slate-800 text-slate-300 focus:ring-violet-500/50">
                                            <SelectValue placeholder="Filter Aktivitas" />
                                        </SelectTrigger>
                                        <SelectContent className="border-slate-700 bg-slate-800">
                                            <SelectItem value="all">
                                                Semua Aktivitas
                                            </SelectItem>
                                            <SelectItem value="scan">
                                                Scan QR
                                            </SelectItem>
                                            <SelectItem value="anomaly">
                                                Anomali
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-800">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-800/50">
                                            <th className="px-5 py-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                                Waktu
                                            </th>
                                            <th className="px-5 py-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                                Aktivitas
                                            </th>
                                            <th className="hidden px-5 py-4 text-xs font-semibold tracking-wider text-slate-400 uppercase md:table-cell">
                                                Lokasi
                                            </th>
                                            <th className="hidden px-5 py-4 text-xs font-semibold tracking-wider text-slate-400 uppercase lg:table-cell">
                                                IP Address
                                            </th>
                                            <th className="px-5 py-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activities.length > 0 ? (
                                            activities.map(
                                                (
                                                    activity: any,
                                                    index: number,
                                                ) => (
                                                    <tr
                                                        key={index}
                                                        className="group border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="text-sm font-medium text-white">
                                                                {activity.date}
                                                            </div>
                                                            <div className="mt-0.5 text-xs text-slate-500">
                                                                {activity.time}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`rounded-lg p-2 ${activity.type === 'scan' ? 'bg-violet-500/10 text-violet-400' : activity.type === 'login' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}
                                                                >
                                                                    {activity.type ===
                                                                        'scan' && (
                                                                        <QrCode className="h-4 w-4" />
                                                                    )}
                                                                    {activity.type ===
                                                                        'login' && (
                                                                        <LogIn className="h-4 w-4" />
                                                                    )}
                                                                    {activity.type ===
                                                                        'anomaly' && (
                                                                        <AlertTriangle className="h-4 w-4" />
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-300">
                                                                    {
                                                                        activity.action
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-5 py-4 md:table-cell">
                                                            <div className="flex items-center gap-1.5 text-sm text-slate-400">
                                                                <MapPin className="h-3 w-3" />
                                                                {
                                                                    activity.location
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-5 py-4 lg:table-cell">
                                                            <div className="inline-block rounded border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-500">
                                                                {activity.ip}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${activity.status === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : activity.status === 'warning' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}
                                                            >
                                                                {activity.status ===
                                                                    'success' && (
                                                                    <CheckCircle className="h-3 w-3" />
                                                                )}
                                                                {activity.status ===
                                                                    'warning' && (
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                )}
                                                                {activity.status ===
                                                                    'failed' && (
                                                                    <XCircle className="h-3 w-3" />
                                                                )}
                                                                <span className="capitalize">
                                                                    {
                                                                        activity.status
                                                                    }
                                                                </span>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-sm font-medium text-slate-500"
                                                >
                                                    Belaum ada record riwayat
                                                    aktivitas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
