import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, Variants } from 'framer-motion';
import {
    Monitor,
    Smartphone,
    Cpu,
    HardDrive,
    Activity,
    Clock,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Ban,
    Download,
    TrendingUp,
    TrendingDown,
    MapPin,
    History,
    MoreVertical,
    User,
    Mail,
    Phone,
    Eye,
    MessageSquare,
    Code,
    ChevronRight,
    AlertCircle,
    Info,
    Lightbulb,
    QrCode,
    LogIn,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
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
    Legend
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
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.border} ${config.text} border text-xs font-semibold`}>
            <Icon className="w-3 h-3" />
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
    activities
}: any) {
    const [filter, setFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const [isOpeningChat, setIsOpeningChat] = useState(false);
    const [showAllLocations, setShowAllLocations] = useState(false);

    const deviceIdentifier = String(deviceInfo?.deviceId || deviceInfo?.id || '-');
    const deviceModel = String(deviceInfo?.model || '-');
    const safeLocations = Array.isArray(locations) ? locations : [];

    const handleBlock = () => {
        setIsExporting(true); // Reusing state for button loading temporarily if needed, or better just use toast
        toast.info('Memproses pemblokiran perangkat...');
        router.post(`/admin/perangkat/${deviceInfo.id}/block`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success((page.props as any).flash?.success || 'Perangkat berhasil diblokir.');
            },
            onFinish: () => {
                setIsExporting(false);
            }
        });
    };

    const handleWhitelist = () => {
        setIsExporting(true);
        toast.info('Memproses verifikasi perangkat (Whitelist)...');
        router.post(`/admin/perangkat/${deviceInfo.id}/whitelist`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success((page.props as any).flash?.success || 'Perangkat berhasil ditandai aman.');
            },
            onFinish: () => {
                setIsExporting(false);
            }
        });
    };

    const handleExport = () => {
        setIsExporting(true);
        toast.info('Menyiapkan file PDF detail perangkat...');

        setTimeout(() => {
            window.open(`/admin/perangkat/${deviceInfo.id}/export-pdf`, '_blank');
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

        if (coordinates.length === 2 && !Number.isNaN(coordinates[0]) && !Number.isNaN(coordinates[1])) {
            window.open(`https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`, '_blank', 'noopener,noreferrer');
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

        router.post('/chat', {
            type: 'personal',
            participant_id: student.id,
            participant_type: 'App\\Models\\Mahasiswa',
        }, {
            preserveScroll: true,
            onError: () => {
                toast.error('Gagal membuka chat mahasiswa.');
            },
            onFinish: () => {
                setIsOpeningChat(false);
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Detail Perangkat - ${deviceInfo.model}`} />

            <div className="min-h-screen pb-12 bg-slate-50 dark:bg-black">
                <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        {/* ═══════ HEADER — Matching Perangkat Style ═══════ */}
                        <motion.div
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
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

                            {/* Floating Animations (Pulses) */}
                                                                                    
                            <div className="relative z-10">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.visit('/admin/perangkat')}
                                    className="mb-4 text-white/80 hover:text-white hover:bg-white/10 -ml-4"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Kembali ke Daftar Perangkat
                                </Button>
                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                    <div className="flex min-w-0 flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                                        <motion.div
                                            className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24 items-center justify-center"
                                            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                            whileHover={{ scale: 1.05, rotate: 5 }}
                                        >
                                            <img src={iconPerangkat} alt="Perangkat" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                        </motion.div>
                                        <div className="min-w-0 flex-1 mt-1 sm:mt-0">
                                            <p className="text-[11px] sm:text-sm font-medium tracking-wide text-indigo-100/90 mb-1">
                                                <span className="mr-1">ID:</span>
                                                <span
                                                    className="inline-block max-w-full align-middle font-mono text-indigo-50/95 leading-tight break-all"
                                                    title={deviceIdentifier}
                                                >
                                                    {deviceIdentifier}
                                                </span>
                                            </p>
                                            <h1
                                                className="text-xl sm:text-3xl font-bold text-white mb-2 leading-tight break-words line-clamp-2 sm:line-clamp-1"
                                                title={deviceModel}
                                            >
                                                {deviceModel}
                                            </h1>
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-indigo-100">
                                                <span>{deviceInfo.os}</span>
                                                <span className="text-indigo-300 hidden sm:inline">•</span>
                                                <StatusBadge status={deviceInfo.status} />
                                                <span className="text-indigo-300 hidden sm:inline">•</span>
                                                <span className="max-w-full break-words">
                                                    Digunakan oleh: <span className="font-semibold text-white">{student.nama}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 z-10 shrink-0">
                                        <button
                                            onClick={handleExport}
                                            disabled={isExporting}
                                            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 sm:px-4 text-sm font-medium text-white transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isExporting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            <span className="hidden sm:inline">
                                                {isExporting ? 'Mengekspor...' : 'Export PDF'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={handleWhitelist}
                                            className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-3 py-2 sm:px-4 text-sm font-medium text-emerald-50 transition-all duration-300 hover:bg-emerald-500/30 hover:border-emerald-400/50 backdrop-blur-sm"
                                        >
                                            <Shield className="h-4 w-4" />
                                            <span className="hidden sm:inline">Whitelist</span>
                                        </button>

                                        <button
                                            onClick={handleBlock}
                                            className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/20 px-3 py-2 sm:px-4 text-sm font-medium text-rose-50 shadow-lg shadow-rose-500/10 transition-all duration-300 hover:bg-rose-500/30 hover:border-rose-400/50 backdrop-blur-sm"
                                        >
                                            <Ban className="h-4 w-4" />
                                            <span className="hidden sm:inline">Block Device</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 1. TOP STATS CARDS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {[
                                { label: 'Total Scan', value: stats.totalScans, icon: Activity, color: 'violet', trend: '+12%', trendUp: true },
                                { label: 'Waktu Terakhir', value: stats.lastAccess.split(',')[1] ?? stats.lastAccess, icon: Clock, color: 'blue', subtitle: stats.lastAccess.split(',')[0] },
                                { label: 'OS System', value: stats.osSystem, icon: Cpu, color: 'emerald', subtitle: stats.osVersion },
                                { label: 'Status Keamanan', value: stats.securityScore + '%', icon: Shield, color: stats.securityScore > 80 ? 'emerald' : 'amber', subtitle: stats.securityScore > 80 ? 'Aman' : 'Perlu Perhatian', }
                            ].map((card, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-${card.color}-500/50 group relative overflow-hidden backdrop-blur-md`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br from-${card.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        <div className={`inline-flex p-3 rounded-xl mb-4 bg-${card.color}-500/10 border border-${card.color}-500/20 group-hover:bg-${card.color}-500/20 transition-all`}>
                                            <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${card.color}-400`} />
                                        </div>
                                        <div className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">{card.label}</div>
                                        <div className="flex items-end justify-between">
                                            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{card.value}</div>
                                            {card.trend && (
                                                <div className={`flex items-center gap-1 text-xs font-semibold ${card.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    <span>{card.trend}</span>
                                                </div>
                                            )}
                                        </div>
                                        {card.subtitle && (
                                            <div className="text-xs text-slate-500 mt-2 font-medium">{card.subtitle}</div>
                                        )}
                                    </div>
                                    <div className={`absolute right-[-10%] bottom-[-10%] opacity-5 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none`}>
                                        <card.icon className={`w-32 h-32 text-${card.color}-600`} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* MAIN CONTENT GRID */}
                        <div className="grid lg:grid-cols-5 gap-6">
                            {/* LEFT COLUMN (60%) */}
                            <div className="lg:col-span-3 space-y-6">

                                {/* 2. Device Info Card */}
                                <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                        <Smartphone className="w-48 h-48 text-violet-500" />
                                    </div>
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Smartphone className="w-5 h-5 text-violet-400" />
                                            Informasi Perangkat
                                        </h3>
                                        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>

                                    {/* Hardware Specs */}
                                    <div className="space-y-4 mb-6 relative z-10">
                                        <div className="flex items-center justify-between py-3 border-b border-slate-800/80">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                                                    <Monitor className="w-4 h-4 text-violet-400" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-slate-400 mb-0.5">Model</div>
                                                    <div className="text-sm font-semibold text-white">{deviceInfo.model}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b border-slate-800/80">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                                    <Cpu className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-slate-400 mb-0.5">Processor / Platform</div>
                                                    <div className="text-sm font-semibold text-white">{deviceInfo.processor}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b border-slate-800/80">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                    <HardDrive className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-slate-400 mb-0.5">Screen Resolution</div>
                                                    <div className="text-sm font-semibold text-white">{deviceInfo.resolution}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Software Info */}
                                    <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 relative z-10">
                                        <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                            <Code className="w-4 h-4 text-slate-400" />
                                            Software Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">OS Version</span>
                                                <span className="text-white font-medium bg-slate-800 px-2 py-1 rounded-md">{deviceInfo.osVersion}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Browser</span>
                                                <span className="text-white font-medium bg-slate-800 px-2 py-1 rounded-md">{deviceInfo.browser}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Agent */}
                                    <div className="mt-5 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80 relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-4 h-4 text-slate-500" />
                                            <div className="text-xs font-medium text-slate-400">User Agent String (Raw)</div>
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono break-all leading-relaxed">
                                            {deviceInfo.userAgent}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 3. Usage Timeline Chart */}
                                <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
                                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-violet-400" />
                                            Timeline Penggunaan
                                        </h3>
                                        <Select defaultValue="7d">
                                            <SelectTrigger className="w-[160px] bg-slate-800/80 border-slate-700 text-slate-300">
                                                <SelectValue placeholder="Pilih Rentang" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                                                <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                                                <SelectItem value="3m">3 Bulan Terakhir</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="h-64 sm:h-72 w-full mt-4">
                                        <Line
                                            data={{
                                                labels: timeline.labels,
                                                datasets: [
                                                    {
                                                        label: 'Jumlah Akses',
                                                        data: timeline.values,
                                                        borderColor: '#8b5cf6',
                                                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                                                        borderWidth: 2,
                                                        fill: true,
                                                        tension: 0.4,
                                                        pointRadius: 4,
                                                        pointHoverRadius: 6,
                                                        pointBackgroundColor: '#8b5cf6',
                                                        pointBorderColor: '#fff',
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
                                                        backgroundColor: '#1e293b',
                                                        titleColor: '#f1f5f9',
                                                        bodyColor: '#94a3b8',
                                                        borderColor: '#334155',
                                                        borderWidth: 1,
                                                        padding: 12,
                                                        displayColors: false,
                                                    },
                                                },
                                                scales: {
                                                    x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
                                                    y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', stepSize: 1 } },
                                                },
                                            }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
                                        <div className="text-center p-3 rounded-2xl bg-slate-800/30">
                                            <div className="text-2xl font-bold text-violet-400">{timeline.avgDaily}</div>
                                            <div className="text-xs font-medium text-slate-400 mt-1">Rata-rata Harian</div>
                                        </div>
                                        <div className="text-center p-3 rounded-2xl bg-slate-800/30">
                                            <div className="text-2xl font-bold text-blue-400">{timeline.peakDay}</div>
                                            <div className="text-xs font-medium text-slate-400 mt-1">Hari Tersibuk</div>
                                        </div>
                                        <div className="text-center p-3 rounded-2xl bg-slate-800/30">
                                            <div className="text-2xl font-bold text-emerald-400">{timeline.totalWeek}</div>
                                            <div className="text-xs font-medium text-slate-400 mt-1">Total Minggu Ini</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 4. Security Analysis Card */}
                                <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-8">
                                        <Shield className="w-5 h-5 text-violet-400" />
                                        Analisis Keamanan
                                    </h3>

                                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                                        {/* Score Gauge */}
                                        <div className="flex flex-col items-center justify-center relative w-48 h-48 flex-shrink-0">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="96" cy="96" r="80" stroke="#1e293b" strokeWidth="12" fill="none" />
                                                <circle
                                                    cx="96" cy="96" r="80"
                                                    stroke={security.score >= 80 ? '#10b981' : security.score >= 50 ? '#f59e0b' : '#ef4444'}
                                                    strokeWidth="12" fill="none"
                                                    strokeDasharray={`${(security.score / 100) * 502} 502`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out drop-shadow-lg"
                                                    style={{ filter: `drop-shadow(0 0 10px ${security.score >= 80 ? 'rgba(16,185,129,0.4)' : security.score >= 50 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'})` }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <div className={`text-5xl font-bold ${security.score >= 80 ? 'text-emerald-400' : security.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    {security.score}
                                                </div>
                                                <div className="text-xs font-medium text-slate-400 mt-1">Security Score</div>
                                            </div>
                                        </div>

                                        {/* Checks & Recs */}
                                        <div className="w-full flex-1 space-y-4">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-opacity-10 border ${security.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : security.score >= 50 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                {security.score >= 80 ? <Shield className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                                                <span className={`text-sm font-semibold ${security.score >= 80 ? 'text-emerald-400' : security.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    Risiko {security.score >= 80 ? 'Rendah' : security.score >= 50 ? 'Sedang' : 'Tinggi'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                                {security.checks.map((check: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            {check.passed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                                            <span className="text-sm font-medium text-slate-300">{check.label}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {security.recommendations.length > 0 && (
                                                <div className="mt-4 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 animate-pulse" />
                                                        <div className="text-sm font-semibold text-amber-400">Rekomendasi</div>
                                                    </div>
                                                    <ul className="space-y-1.5 text-xs text-amber-200/80 ml-6 list-disc">
                                                        {security.recommendations.map((rec: string, idx: number) => (
                                                            <li key={idx} className="leading-snug">{rec}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* RIGHT COLUMN (40%) */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* 5. Student Info Card */}
                                <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                                        <User className="w-5 h-5 text-violet-400" />
                                        Info Pengguna Dominan
                                    </h3>

                                    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-800/80">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-violet-500/30 shadow-lg shadow-violet-500/20">
                                                {student.foto ? (
                                                    <img src={student.foto} alt={student.nama} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-purple-600/10 flex items-center justify-center">
                                                        <User className="w-10 h-10 text-violet-400/50" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-slate-900 flex items-center justify-center shadow-lg">
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="text-lg text-white font-bold">{student.nama}</div>
                                            <div className="text-sm text-violet-400 font-mono font-medium mt-0.5">{student.nim}</div>
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-800 rounded-md text-xs text-slate-400 mt-2 font-medium">
                                                <span>{student.prodi}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span>Semester {student.semester}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 text-center hover:bg-slate-800/60 transition-colors">
                                            <div className="text-xs font-medium text-slate-400 mb-1.5">Total Absen</div>
                                            <div className="text-2xl font-bold text-white tracking-tight">{student.totalAbsen}</div>
                                        </div>
                                        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 text-center hover:bg-slate-800/60 transition-colors">
                                            <div className="text-xs font-medium text-slate-400 mb-1.5">Kehadiran</div>
                                            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{student.kehadiran}%</div>
                                        </div>
                                    </div>

                                    {student.email !== '-' && (
                                        <div className="space-y-3 mb-6 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400"><Mail className="w-4 h-4" /></div>
                                                <span className="text-slate-300 font-medium">{student.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400"><Phone className="w-4 h-4" /></div>
                                                <span className="text-slate-300 font-medium">{student.phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link href={`/admin/mahasiswa/${student.id}`} className="w-full">
                                            <button className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20">
                                                <Eye className="w-4 h-4" />
                                                <span>Profile Detail</span>
                                            </button>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleContactStudent}
                                            disabled={isOpeningChat || !student?.id}
                                            className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isOpeningChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                            <span>{isOpeningChat ? 'Membuka Chat...' : 'Hubungi'}</span>
                                        </button>
                                    </div>
                                </motion.div>

                                {/* 6. Location Map Card */}
                                <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                                        <MapPin className="w-5 h-5 text-violet-400" />
                                        Lokasi Akses
                                    </h3>

                                    <div className="relative h-48 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80 mb-5 relative group cursor-crosshair">
                                        {/* Stylized Grid pattern as map placeholder */}
                                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }} />

                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <MapPin className="w-10 h-10 text-violet-500/20 mx-auto mb-2" />
                                                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">GPS Tracker Active</div>
                                            </div>
                                        </div>

                                        {safeLocations.map((loc: any, index: number) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => openLocationInMaps(loc)}
                                                className="absolute w-4 h-4 bg-violet-500 rounded-full border-[3px] border-slate-900 shadow-[0_0_15px_rgba(139,92,246,0.8)] -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                                                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                                                title={`Buka peta: ${loc.name}`}
                                            >
                                                <span className="absolute inset-0 bg-violet-400 rounded-full animate-ping opacity-75"></span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        {(showAllLocations ? safeLocations : safeLocations.slice(0, 3)).map((loc: any, index: number) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => openLocationInMaps(loc)}
                                                className="w-full flex items-center justify-between p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-violet-500/50 transition-all cursor-pointer group text-left"
                                                title="Buka lokasi di Google Maps"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors">
                                                        <MapPin className="w-4 h-4 text-violet-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm text-white font-medium truncate">{loc.name}</div>
                                                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{loc.coordinates}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="px-2.5 py-1 bg-slate-900 rounded-md text-xs font-semibold text-violet-400 border border-slate-800">
                                                        {loc.count}x
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (safeLocations.length === 0) {
                                                toast.error('Belum ada data lokasi untuk ditampilkan.');
                                                return;
                                            }
                                            if (safeLocations.length > 3) {
                                                setShowAllLocations((prev) => !prev);
                                                return;
                                            }
                                            openLocationInMaps(safeLocations[0]);
                                        }}
                                        className="w-full mt-5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>
                                            {safeLocations.length > 3
                                                ? (showAllLocations ? 'Sembunyikan Log Lokasi' : `Log Lokasi Lengkap (${safeLocations.length})`)
                                                : 'Buka Lokasi di Maps'}
                                        </span>
                                    </button>
                                </motion.div>

                                {/* 7. Anomaly Detection Card */}
                                <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-violet-400" />
                                            Deteksi Anomali
                                        </h3>
                                        {anomalies.active > 0 && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                                                <span className="text-xs text-red-400 font-bold">{anomalies.active} Aktif</span>
                                            </div>
                                        )}
                                    </div>

                                    {anomalies.list.length > 0 ? (
                                        <div className="space-y-3">
                                            {anomalies.list.map((anomaly: any, index: number) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${anomaly.severity === 'high' ? 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30 hover:border-red-500/50' : anomaly.severity === 'medium' ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30 hover:border-amber-500/50' : 'bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500/30 hover:border-blue-500/50'}`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2.5">
                                                            {anomaly.severity === 'high' ? <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" /> : anomaly.severity === 'medium' ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" /> : <Info className="w-4 h-4 text-blue-400 mt-0.5" />}
                                                            <span className={`text-sm font-bold ${anomaly.severity === 'high' ? 'text-red-400' : anomaly.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'}`}>{anomaly.type}</span>
                                                        </div>
                                                        <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 bg-slate-900 rounded border border-slate-800">{anomaly.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm mx-1 text-slate-300 mb-3 leading-relaxed">{anomaly.description}</p>
                                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800/50">
                                                        <button className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">Investigasi</button>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        <button className="text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors">Tandai Aman</button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle className="w-8 h-8 text-emerald-500/50" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-400">Tidak ada anomali terdeteksi</p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>

                        {/* 8. Bottom Section: Activity History Table */}
                        <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-violet-400" />
                                    Riwayat Aktivitas Session
                                </h3>
                                <div className="flex items-center gap-3">
                                    <Select value={filter} onValueChange={setFilter}>
                                        <SelectTrigger className="w-[180px] bg-slate-800 focus:ring-violet-500/50 border-slate-700 text-slate-300">
                                            <SelectValue placeholder="Filter Aktivitas" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">Semua Aktivitas</SelectItem>
                                            <SelectItem value="scan">Scan QR</SelectItem>
                                            <SelectItem value="anomaly">Anomali</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-800">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800/50 border-b border-slate-800">
                                            <th className="py-4 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Waktu</th>
                                            <th className="py-4 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktivitas</th>
                                            <th className="py-4 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Lokasi</th>
                                            <th className="py-4 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">IP Address</th>
                                            <th className="py-4 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activities.length > 0 ? activities.map((activity: any, index: number) => (
                                            <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                                <td className="py-4 px-5">
                                                    <div className="text-sm font-medium text-white">{activity.date}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{activity.time}</div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${activity.type === 'scan' ? 'bg-violet-500/10 text-violet-400' : activity.type === 'login' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                            {activity.type === 'scan' && <QrCode className="w-4 h-4" />}
                                                            {activity.type === 'login' && <LogIn className="w-4 h-4" />}
                                                            {activity.type === 'anomaly' && <AlertTriangle className="w-4 h-4" />}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-300">{activity.action}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 hidden md:table-cell">
                                                    <div className="text-sm text-slate-400 flex items-center gap-1.5"><MapPin className="w-3 h-3" />{activity.location}</div>
                                                </td>
                                                <td className="py-4 px-5 hidden lg:table-cell">
                                                    <div className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded inline-block border border-slate-800">{activity.ip}</div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${activity.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : activity.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                        {activity.status === 'success' && <CheckCircle className="w-3 h-3" />}
                                                        {activity.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                                                        {activity.status === 'failed' && <XCircle className="w-3 h-3" />}
                                                        <span className="capitalize">{activity.status}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-500 text-sm font-medium">Belaum ada record riwayat aktivitas</td>
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
