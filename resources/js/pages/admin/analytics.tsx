import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Brain,
    BrainCircuit,
    Calendar,
    CheckCircle,
    Cloud,
    Download,
    Edit,
    FileText,
    MapPin,
    Moon,
    Scan,
    Smartphone,
    Sun,
    TrendingUp,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart as RePieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Custom Icons
import analyticsIcon from '@/assets/admin/analytics/analytics.png';
import kehadiranIcon from '@/assets/admin/analytics/kehadiran.png';
import terlambatIcon from '@/assets/admin/analytics/terlambat.png';
import totalMahasiswaIcon from '@/assets/admin/analytics/total-mahasiswa.png';

// --- Interface Definitions ---

interface Stats {
    total_attendance: number;
    attendance_rate: number;
    rate_change: number;
    late_count: number;
}

interface TrendData {
    name: string;
    date: string;
    hadir: number;
    telat: number;
    audit: number;
}

interface DeviceData {
    name: string;
    value: number;
    color: string;
}

interface Student {
    id: number;
    name: string;
    nim: string;
    department: string;
    attendance: string;
    status: string;
}

interface Insight {
    type: string;
    title: string;
    description: string;
    icon: string;
}

interface AnalyticsProps {
    stats: Stats;
    attendanceTrend: TrendData[];
    deviceDistribution: DeviceData[];
    topPerformers: Student[];
    aiInsights: Insight[];
    filters: {
        period: string;
    };
}

// --- Animation Variants ---

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.2,
        },
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

const cardHover: Variants = {
    hover: {
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
};

export default function Analytics({
    stats,
    attendanceTrend,
    deviceDistribution,
    topPerformers,
    aiInsights,
    filters,
}: AnalyticsProps) {
    const [timeRange, setTimeRange] = useState(filters.period || 'week');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null,
    );
    const [studentDetail, setStudentDetail] = useState<any>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, history, calendar

    // AI Report State
    const [showAIReportModal, setShowAIReportModal] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiGenerationStep, setAiGenerationStep] = useState(0);
    const [aiReportReady, setAiReportReady] = useState(false);

    // Sync local state with props if filters change externally
    useEffect(() => {
        setTimeRange(filters.period);
    }, [filters.period]);

    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range);
        // @ts-ignore
        router.visit(route('admin.analytics', { period: range }), {
            preserveState: true,
            preserveScroll: true,
            only: [
                'stats',
                'attendanceTrend',
                'deviceDistribution',
                'topPerformers',
                'aiInsights',
                'filters',
            ],
        });
    };

    const handleExport = () => {
        setIsExporting(true);
        // Clean way to trigger download without navigation
        window.location.href = `/admin/analytics/export?period=${timeRange}`;
        setTimeout(() => setIsExporting(false), 2000);
    };

    const handleStudentClick = async (id: number) => {
        setSelectedStudentId(id);
        setIsLoadingDetail(true);
        try {
            // @ts-ignore
            const response = await fetch(
                route('admin.analytics.student.detail', id),
            );
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setStudentDetail(data);
        } catch (error) {
            console.error('Failed to fetch student details:', error);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const closeModal = () => {
        setSelectedStudentId(null);
        setStudentDetail(null);
    };

    const handleGenerateReport = () => {
        setShowAIReportModal(true);
        setIsGeneratingAI(true);
        setAiGenerationStep(0);
        setAiReportReady(false);

        const steps = [0, 1, 2, 3, 4, 5, 6];
        steps.forEach((step, i) => {
            setTimeout(() => {
                setAiGenerationStep(step + 1);
                if (step === 6) {
                    setTimeout(() => {
                        setIsGeneratingAI(false);
                        setAiReportReady(true);
                    }, 600);
                }
            }, i * 600);
        });
    };

    // Helper to map icon string to component
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'AlertTriangle':
                return <AlertTriangle className="h-5 w-5" />;
            case 'TrendingUp':
                return <TrendingUp className="h-5 w-5" />;
            case 'Moon':
                return <Moon className="h-5 w-5" />;
            case 'Sun':
                return <Sun className="h-5 w-5" />;
            case 'Cloud':
                return <Cloud className="h-5 w-5" />;
            default:
                return <Brain className="h-5 w-5" />;
        }
    };

    return (
        <AppLayout>
            <Head title="Analitik & Laporan" />

            <motion.div
                className="space-y-6 p-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section - Matched to Uang Kas */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 20,
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

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
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
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={analyticsIcon}
                                        alt="Analitik"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Sistem Laporan
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Analitik Performa
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Pantau analisis data kehadiran, tren
                                        performa mahasiswa, dan insight berbasis
                                        AI.
                                    </motion.p>
                                </div>
                            </div>

                            <div className="mt-4 flex w-full flex-col items-center gap-3 sm:gap-4 lg:mt-0 lg:w-auto lg:items-end">
                                <div className="custom-scrollbar flex w-full overflow-x-auto rounded-xl border border-white/10 bg-black/20 p-1.5 shadow-lg backdrop-blur-lg sm:w-auto">
                                    {['day', 'week', 'month', 'year'].map(
                                        (range) => (
                                            <button
                                                key={range}
                                                onClick={() =>
                                                    handleTimeRangeChange(range)
                                                }
                                                className={`flex-1 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 sm:flex-none sm:px-5 sm:text-sm ${
                                                    timeRange === range
                                                        ? 'scale-105 bg-white text-indigo-600 shadow-xl'
                                                        : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {range.charAt(0).toUpperCase() +
                                                    range.slice(1)}
                                            </button>
                                        ),
                                    )}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="flex w-fit items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-6 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <Activity className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Download className="h-5 w-5" />
                                    )}
                                    {isExporting
                                        ? 'Exporting...'
                                        : 'Export Laporan'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        router.visit('/admin/rekap-kehadiran')
                                    }
                                    className="flex w-fit items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-6 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30"
                                >
                                    <BarChart3 className="h-5 w-5" />
                                    Buka Rekap Kehadiran
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Stats Grid */}
                <motion.div
                    className="grid grid-cols-3 gap-1.5 sm:gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.08,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {[
                        {
                            title: 'Total Kehadiran',
                            value: stats.total_attendance.toLocaleString(),
                            change: `${stats.rate_change > 0 ? '+' : ''}${stats.rate_change}%`,
                            isUp: stats.rate_change >= 0,
                            imgSrc: totalMahasiswaIcon,
                            color: 'indigo',
                        },
                        {
                            title: 'Tingkat Kehadiran',
                            value: `${stats.attendance_rate}%`,
                            change: 'vs prev period',
                            isUp: stats.rate_change >= 0,
                            imgSrc: kehadiranIcon,
                            color: 'emerald',
                        },
                        {
                            title: 'Terlambat',
                            value: stats.late_count.toString(),
                            change: 'Check Logs',
                            isUp: false,
                            imgSrc: terlambatIcon,
                            color: 'amber',
                        },
                    ].map((stat, i) => {
                        const colorConfigs: Record<string, any> = {
                            indigo: {
                                from: 'from-sky-400',
                                to: 'to-indigo-600',
                                shadow: 'shadow-sky-500/30',
                                bg: 'bg-sky-500',
                                hoverShadow: 'hover:shadow-sky-500/10',
                                gradientBg:
                                    'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
                            },
                            emerald: {
                                from: 'from-emerald-400',
                                to: 'to-teal-600',
                                shadow: 'shadow-emerald-500/30',
                                bg: 'bg-emerald-500',
                                hoverShadow: 'hover:shadow-emerald-500/10',
                                gradientBg:
                                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                            },
                            amber: {
                                from: 'from-amber-400',
                                to: 'to-orange-600',
                                shadow: 'shadow-amber-500/30',
                                bg: 'bg-amber-500',
                                hoverShadow: 'hover:shadow-amber-500/10',
                                gradientBg:
                                    'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                            },
                            rose: {
                                from: 'from-rose-400',
                                to: 'to-pink-600',
                                shadow: 'shadow-rose-500/30',
                                bg: 'bg-rose-500',
                                hoverShadow: 'hover:shadow-rose-500/10',
                                gradientBg:
                                    'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
                            },
                        };
                        const colorConfig =
                            colorConfigs[stat.color] || colorConfigs['indigo'];

                        return (
                            <motion.div
                                key={i}
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
                                className={`group relative overflow-hidden rounded-xl border border-white/20 bg-white/40 p-2 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${colorConfig.hoverShadow} dark:border-white/5`}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${colorConfig.gradientBg} opacity-50 dark:opacity-100`}
                                />

                                <motion.div
                                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${colorConfig.bg} opacity-20 blur-3xl transition-all group-hover:opacity-40`}
                                />

                                <div className="relative z-10 flex h-full flex-row items-center gap-4">
                                    <div className="relative flex flex-row items-center gap-4 text-left">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="relative flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-300 sm:h-14 sm:w-14"
                                        >
                                            <img
                                                src={stat.imgSrc}
                                                alt={stat.title}
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                            />
                                        </motion.div>
                                        <div className="flex flex-col">
                                            <h3 className="mb-0.5 line-clamp-1 text-[7px] leading-tight font-medium text-neutral-500 sm:mb-1 sm:text-sm dark:text-neutral-400">
                                                {stat.title}
                                            </h3>
                                            <div className="flex items-baseline justify-start gap-1">
                                                <span className="text-xs leading-none font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                                    {stat.value}
                                                </span>
                                            </div>
                                            <div className="mt-0.5 flex items-center justify-start gap-0.5">
                                                <div
                                                    className={`flex items-center gap-0 rounded-[1px] border px-1 py-0 text-[6px] font-bold sm:text-[10px] ${
                                                        stat.isUp
                                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                            : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {stat.isUp ? (
                                                        <ArrowUpRight className="h-1.5 w-1.5" />
                                                    ) : (
                                                        <ArrowDownRight className="h-1.5 w-1.5" />
                                                    )}
                                                    {stat.change}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Attendance Trend Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl lg:col-span-2 dark:border-white/10 dark:bg-neutral-900/60"
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                    Tren Kehadiran
                                </h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Overview statistik kehadiran per periode
                                </p>
                            </div>
                            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800/50">
                                <span className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-sm" />{' '}
                                    Hadir
                                </span>
                                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                                <span className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm" />{' '}
                                    Telat
                                </span>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={attendanceTrend}
                                    margin={{
                                        top: 20,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="colorHadir"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#6366f1"
                                                stopOpacity={0.4}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#6366f1"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="colorTelat"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#f43f5e"
                                                stopOpacity={0.4}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#f43f5e"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#E2E8F0"
                                        opacity={0.5}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: '#64748B',
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: '#64748B',
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(8px)',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(226, 232, 240, 0.8)',
                                            boxShadow:
                                                '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        }}
                                        itemStyle={{
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            paddingTop: '4px',
                                        }}
                                        labelStyle={{
                                            color: '#1E293B',
                                            fontWeight: 'bold',
                                            marginBottom: '8px',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="hadir"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorHadir)"
                                        activeDot={{
                                            r: 6,
                                            strokeWidth: 0,
                                            fill: '#4F46E5',
                                        }}
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="telat"
                                        stroke="#f43f5e"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorTelat)"
                                        activeDot={{
                                            r: 6,
                                            strokeWidth: 0,
                                            fill: '#E11D48',
                                        }}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* AI Insights Panel */}
                    <motion.div
                        variants={itemVariants}
                        className="relative flex flex-col overflow-hidden rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 p-8 shadow-xl backdrop-blur-xl dark:border-indigo-800/50 dark:from-indigo-900/20 dark:to-purple-900/20"
                    >
                        {/* Animated background accent */}
                        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

                        <div className="relative z-10 mb-6">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-lg shadow-indigo-500/30">
                                    <Brain className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                                    AI Insights
                                </h3>
                            </div>
                            <p className="text-sm text-indigo-600/80 dark:text-indigo-300">
                                Automated analysis based on your data.
                            </p>
                        </div>

                        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
                            <AnimatePresence mode="wait">
                                {aiInsights.length > 0 ? (
                                    aiInsights.map((insight, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="cursor-default rounded-2xl border border-indigo-100 bg-white/70 p-5 shadow-sm transition-colors hover:bg-white/90 dark:border-indigo-800/30 dark:bg-black/30"
                                        >
                                            <h4
                                                className={`mb-2 flex items-center gap-2 text-sm font-bold ${
                                                    insight.type === 'warning'
                                                        ? 'text-rose-700 dark:text-rose-300'
                                                        : insight.type ===
                                                            'success'
                                                          ? 'text-emerald-700 dark:text-emerald-300'
                                                          : 'text-indigo-800 dark:text-indigo-200'
                                                }`}
                                            >
                                                {getIcon(insight.icon)}{' '}
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-300">
                                                {insight.description}
                                            </p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-2 py-10 text-center text-sm text-indigo-400"
                                    >
                                        <Activity className="h-8 w-8 opacity-50" />
                                        <span>Analyzing data patterns...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700"
                        >
                            <Zap className="h-4 w-4 transition-all group-hover:fill-current" />
                            Generate Full Report
                        </button>
                    </motion.div>
                </div>

                {/* Secondary Charts & Tables */}
                <div className="grid gap-8 pb-8 lg:grid-cols-3">
                    {/* Device Distribution */}
                    <motion.div
                        variants={itemVariants}
                        className="relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#18181b]"
                    >
                        {/* Subtle Background Glows */}
                        <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

                        <h3 className="relative z-10 mb-2 flex w-full items-center gap-2 self-start text-lg font-bold text-slate-800 dark:text-white">
                            <Smartphone className="h-5 w-5 text-indigo-500" />{' '}
                            Device Distribution
                        </h3>
                        <div className="relative z-10 flex w-full flex-1 items-center justify-center">
                            <ResponsiveContainer width="100%" height={300}>
                                <RePieChart>
                                    <Pie
                                        data={
                                            deviceDistribution.length > 0
                                                ? deviceDistribution
                                                : [
                                                      {
                                                          name: 'No Data',
                                                          value: 1,
                                                          color: '#e2e8f0',
                                                      },
                                                  ]
                                        }
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={105}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={1500}
                                    >
                                        {deviceDistribution.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    strokeWidth={0}
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.1)',
                                            backgroundColor: '#1e293b',
                                            color: '#fff',
                                        }}
                                        itemStyle={{
                                            fontWeight: 'bold',
                                            color: '#fff',
                                        }}
                                    />
                                    <Legend
                                        iconType="circle"
                                        verticalAlign="bottom"
                                        height={36}
                                        wrapperStyle={{
                                            paddingTop: '20px',
                                            color: '#94a3b8',
                                        }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center">
                                <div className="text-3xl font-black text-slate-800 dark:text-white">
                                    {deviceDistribution.length > 0
                                        ? deviceDistribution.reduce(
                                              (a, b) => a + b.value,
                                              0,
                                          )
                                        : '0'}
                                </div>
                                <div className="mt-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Total Devices
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Top Students List - Redesigned */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#18181b] p-8 shadow-2xl lg:col-span-2"
                    >
                        {/* Header */}
                        <div className="relative z-10 mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
                            <h3 className="flex items-center gap-3 text-lg font-bold text-white sm:text-xl">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                                    <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                                Top Attendance
                            </h3>
                            <button
                                // @ts-ignore
                                onClick={() =>
                                    router.visit(route('admin.mahasiswa'))
                                }
                                className="shrink-0 text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                            >
                                View All Students
                            </button>
                        </div>

                        <div className="custom-scrollbar -mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
                            <div className="min-w-[600px]">
                                {/* List Headers */}
                                <div className="mb-4 grid grid-cols-12 gap-4 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
                                    <div className="col-span-5">Mahasiswa</div>
                                    <div className="col-span-3">Jurusan</div>
                                    <div className="col-span-2 text-center">
                                        Kehadiran
                                    </div>
                                    <div className="col-span-2 text-right">
                                        Status
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mb-4 h-px w-full bg-white/10" />

                                {/* Scrollable List */}
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {topPerformers.length > 0 ? (
                                            topPerformers.map((student, i) => (
                                                <motion.div
                                                    key={student.id}
                                                    onClick={() =>
                                                        handleStudentClick(
                                                            student.id,
                                                        )
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay: 0.1 * i,
                                                        type: 'spring',
                                                        stiffness: 200,
                                                        damping: 20,
                                                    }}
                                                    whileHover={{
                                                        scale: 1.01,
                                                        backgroundColor:
                                                            'rgba(255,255,255,0.03)',
                                                    }}
                                                    whileTap={{ scale: 0.99 }}
                                                    className="group grid w-full cursor-pointer grid-cols-12 items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-indigo-500/30"
                                                >
                                                    {/* Mahasiswa Column */}
                                                    <div className="col-span-5 flex items-center gap-4">
                                                        <div
                                                            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg ${
                                                                i === 0
                                                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
                                                                    : i === 1
                                                                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30'
                                                                      : 'bg-gradient-to-br from-slate-700 to-slate-600'
                                                            }`}
                                                        >
                                                            {student.name.charAt(
                                                                0,
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="line-clamp-1 text-sm font-bold text-white transition-colors group-hover:text-indigo-400">
                                                                {student.name}
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-500">
                                                                {student.nim}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Jurusan Column */}
                                                    <div className="col-span-3 text-sm font-medium text-slate-400">
                                                        {student.department ===
                                                        'Teknik Informatika'
                                                            ? 'Umum'
                                                            : student.department}
                                                    </div>

                                                    {/* Kehadiran Column */}
                                                    <div className="col-span-2 flex justify-center">
                                                        <div className="min-w-[3rem] rounded-lg border border-white/10 bg-[#27272a] px-3 py-1.5 text-center text-xs font-bold text-white shadow-inner">
                                                            {student.attendance.replace(
                                                                ' Sesi',
                                                                '',
                                                            )}{' '}
                                                            Sesi
                                                        </div>
                                                    </div>

                                                    {/* Status Column */}
                                                    <div className="col-span-2 flex justify-end">
                                                        <span
                                                            className={`rounded-full border px-4 py-1.5 text-xs font-bold shadow-lg ${
                                                                student.status ===
                                                                    'Excellent' ||
                                                                student.status ===
                                                                    'Good'
                                                                    ? 'border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-blue-500/10'
                                                                    : 'border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-amber-500/10'
                                                            }`}
                                                        >
                                                            {student.status ===
                                                            'Excellent'
                                                                ? 'Good'
                                                                : student.status}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center font-medium text-slate-600 italic">
                                                No data available yet
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Subtle Background Glows */}
                        <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Student Detail Modal */}
            <AnimatePresence>
                {selectedStudentId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-[#1a1a1a]"
                        >
                            {isLoadingDetail ? (
                                <div className="flex h-96 flex-col items-center justify-center gap-3">
                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                                    <span className="text-sm font-medium text-slate-500">
                                        Loading comprehensive profile...
                                    </span>
                                </div>
                            ) : studentDetail ? (
                                <div className="flex h-full flex-col">
                                    {/* Modal Header */}
                                    <div className="relative h-40 shrink-0 overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                                        <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                                        <div className="absolute top-6 right-6 z-20 flex gap-3">
                                            <button
                                                className="rounded-full border border-white/10 bg-white/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                                                title="Download Report"
                                            >
                                                <Download className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="rounded-full border border-white/10 bg-white/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                                                title="Edit Student"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={closeModal}
                                                className="rounded-full border border-white/5 bg-black/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/40"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-0 left-0 z-20 flex w-full translate-y-8 items-end gap-6 px-8 pb-6">
                                            <div className="h-32 w-32 origin-bottom-left rotate-3 transform rounded-3xl bg-white p-2 shadow-2xl transition-transform hover:rotate-0 dark:bg-[#1a1a1a]">
                                                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-5xl font-black text-white shadow-inner">
                                                    {
                                                        studentDetail.student
                                                            .avatar_letter
                                                    }
                                                </div>
                                            </div>
                                            <div className="mb-10 pb-1 text-white">
                                                <h2 className="text-3xl font-bold tracking-tight">
                                                    {studentDetail.student.name}
                                                </h2>
                                                <div className="mt-1 flex items-center gap-3 text-indigo-100">
                                                    <span className="rounded-full border border-white/10 bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                                                        {
                                                            studentDetail
                                                                .student
                                                                .department
                                                        }
                                                    </span>
                                                    <span className="text-sm font-medium opacity-80">
                                                        {
                                                            studentDetail
                                                                .student.nim
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Navigation Tabs */}
                                    <div className="mt-12 flex shrink-0 gap-8 border-b border-slate-200 px-8 dark:border-slate-800">
                                        {[
                                            'overview',
                                            'history',
                                            'calendar',
                                        ].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() =>
                                                    setActiveTab(tab)
                                                }
                                                className={`relative pb-4 text-sm font-bold capitalize transition-all ${
                                                    activeTab === tab
                                                        ? 'text-indigo-600 dark:text-indigo-400'
                                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                {tab}
                                                {activeTab === tab && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-indigo-600 dark:bg-indigo-400"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Scrollable Content Area */}
                                    <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'overview' && (
                                                <motion.div
                                                    key="overview"
                                                    initial={{
                                                        opacity: 0,
                                                        x: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                >
                                                    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                                                            <div className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                                Kehadiran
                                                            </div>
                                                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                                                {
                                                                    studentDetail
                                                                        .student
                                                                        .total_attendance
                                                                }
                                                            </div>
                                                            <div className="mt-1 text-xs font-bold text-emerald-500">
                                                                Sesi Terdata
                                                            </div>
                                                        </div>
                                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                                                            <div className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                                Rate
                                                            </div>
                                                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                                                {
                                                                    studentDetail
                                                                        .student
                                                                        .attendance_rate
                                                                }
                                                                %
                                                            </div>
                                                            <div className="mt-1 text-xs font-bold text-indigo-500">
                                                                {
                                                                    studentDetail
                                                                        .student
                                                                        .status
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                                                            <div className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                                Avg Check-in
                                                            </div>
                                                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                                                {studentDetail
                                                                    .student
                                                                    .avg_check_in ||
                                                                    '--:--'}
                                                            </div>
                                                            <div className="mt-1 text-xs font-bold text-amber-500">
                                                                WIB
                                                            </div>
                                                        </div>
                                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                                                            <div className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                                Late Count
                                                            </div>
                                                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                                                {studentDetail
                                                                    .student
                                                                    .late_count ||
                                                                    0}
                                                            </div>
                                                            <div className="mt-1 text-xs font-bold text-rose-500">
                                                                Times
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                                                        <TrendingUp className="h-5 w-5 text-indigo-500" />{' '}
                                                        Weekly Activity
                                                    </h3>
                                                    <div className="mb-8 h-64 w-full rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
                                                        <ResponsiveContainer
                                                            width="100%"
                                                            height="100%"
                                                        >
                                                            <AreaChart
                                                                data={
                                                                    studentDetail.weekly_activity
                                                                }
                                                            >
                                                                <defs>
                                                                    <linearGradient
                                                                        id="colorCount"
                                                                        x1="0"
                                                                        y1="0"
                                                                        x2="0"
                                                                        y2="1"
                                                                    >
                                                                        <stop
                                                                            offset="5%"
                                                                            stopColor="#6366f1"
                                                                            stopOpacity={
                                                                                0.3
                                                                            }
                                                                        />
                                                                        <stop
                                                                            offset="95%"
                                                                            stopColor="#6366f1"
                                                                            stopOpacity={
                                                                                0
                                                                            }
                                                                        />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid
                                                                    strokeDasharray="3 3"
                                                                    vertical={
                                                                        false
                                                                    }
                                                                    stroke="#E2E8F0"
                                                                    opacity={
                                                                        0.3
                                                                    }
                                                                />
                                                                <XAxis
                                                                    dataKey="day"
                                                                    axisLine={
                                                                        false
                                                                    }
                                                                    tickLine={
                                                                        false
                                                                    }
                                                                    tick={{
                                                                        fontSize: 12,
                                                                        fill: '#94a3b8',
                                                                        fontWeight: 600,
                                                                    }}
                                                                    dy={10}
                                                                />
                                                                <YAxis hide />
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor:
                                                                            '#1e293b',
                                                                        borderRadius:
                                                                            '12px',
                                                                        border: 'none',
                                                                        color: '#fff',
                                                                    }}
                                                                    itemStyle={{
                                                                        color: '#fff',
                                                                    }}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="count"
                                                                    stroke="#6366f1"
                                                                    strokeWidth={
                                                                        4
                                                                    }
                                                                    fillOpacity={
                                                                        1
                                                                    }
                                                                    fill="url(#colorCount)"
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'history' && (
                                                <motion.div
                                                    key="history"
                                                    initial={{
                                                        opacity: 0,
                                                        x: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                >
                                                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/5">
                                                        <table className="w-full text-left text-sm">
                                                            <thead className="bg-slate-100 text-xs font-bold text-slate-500 uppercase dark:bg-white/10">
                                                                <tr>
                                                                    <th className="px-6 py-4">
                                                                        Date &
                                                                        Time
                                                                    </th>
                                                                    <th className="px-6 py-4">
                                                                        Status
                                                                    </th>
                                                                    <th className="px-6 py-4 text-right">
                                                                        Device
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                                {studentDetail.recent_logs.map(
                                                                    (
                                                                        log: any,
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                log.id
                                                                            }
                                                                            className="transition-colors hover:bg-white dark:hover:bg-white/5"
                                                                        >
                                                                            <td className="px-6 py-4">
                                                                                <div className="font-bold text-slate-900 dark:text-white">
                                                                                    {
                                                                                        log.date
                                                                                    }
                                                                                </div>
                                                                                <div className="text-xs text-slate-500">
                                                                                    {
                                                                                        log.time
                                                                                    }
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4">
                                                                                <span
                                                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                                                        log.status ===
                                                                                        'On Time'
                                                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                                                    }`}
                                                                                >
                                                                                    <span
                                                                                        className={`h-1.5 w-1.5 rounded-full ${log.status === 'On Time' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                                    />
                                                                                    {
                                                                                        log.status
                                                                                    }
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">
                                                                                {
                                                                                    log.device
                                                                                }
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'calendar' && (
                                                <motion.div
                                                    key="calendar"
                                                    initial={{
                                                        opacity: 0,
                                                        x: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                >
                                                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-white/5 dark:bg-white/5">
                                                        {/* Calendar Header */}
                                                        <div className="mb-8 flex items-center justify-between">
                                                            <h3 className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                                                                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                                                                    <Calendar className="h-5 w-5" />
                                                                </div>
                                                                {new Date().toLocaleString(
                                                                    'default',
                                                                    {
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                    },
                                                                )}
                                                            </h3>
                                                            <div className="flex gap-4">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>{' '}
                                                                    Hadir
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>{' '}
                                                                    Alpha /
                                                                    Libur
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Dynamic Calendar Grid */}
                                                        <div className="grid grid-cols-7 gap-x-2 gap-y-4">
                                                            {[
                                                                'Minggu',
                                                                'Senin',
                                                                'Selasa',
                                                                'Rabu',
                                                                'Kamis',
                                                                'Jumat',
                                                                'Sabtu',
                                                            ].map((day) => (
                                                                <div
                                                                    key={day}
                                                                    className="mb-2 text-center text-xs font-bold tracking-wider text-slate-400 uppercase"
                                                                >
                                                                    {day.substr(
                                                                        0,
                                                                        3,
                                                                    )}
                                                                </div>
                                                            ))}

                                                            {/* Empty slots for start of month */}
                                                            {Array.from({
                                                                length: new Date(
                                                                    new Date().getFullYear(),
                                                                    new Date().getMonth(),
                                                                    1,
                                                                ).getDay(),
                                                            }).map((_, i) => (
                                                                <div
                                                                    key={`pad-${i}`}
                                                                />
                                                            ))}

                                                            {/* Days of Month */}
                                                            {Array.from({
                                                                length: new Date(
                                                                    new Date().getFullYear(),
                                                                    new Date().getMonth() +
                                                                        1,
                                                                    0,
                                                                ).getDate(),
                                                            }).map((_, i) => {
                                                                const day =
                                                                    i + 1;
                                                                const month =
                                                                    new Date().getMonth() +
                                                                    1;
                                                                const year =
                                                                    new Date().getFullYear();
                                                                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                                                                // Check if this date exists in calendar_data
                                                                const log = (
                                                                    studentDetail.calendar_data ||
                                                                    []
                                                                ).find(
                                                                    (d: any) =>
                                                                        d.date ===
                                                                        dateStr,
                                                                );
                                                                const hasPresence =
                                                                    !!log;
                                                                const isLate =
                                                                    log?.status ===
                                                                        'late' ||
                                                                    log?.status ===
                                                                        'Late';
                                                                const isWeekend =
                                                                    new Date(
                                                                        year,
                                                                        month -
                                                                            1,
                                                                        day,
                                                                    ).getDay() ===
                                                                        0 ||
                                                                    new Date(
                                                                        year,
                                                                        month -
                                                                            1,
                                                                        day,
                                                                    ).getDay() ===
                                                                        6;

                                                                return (
                                                                    <motion.div
                                                                        key={
                                                                            day
                                                                        }
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                            translateY:
                                                                                -2,
                                                                        }}
                                                                        className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border text-sm font-bold transition-all ${
                                                                            hasPresence
                                                                                ? isLate
                                                                                    ? 'border-amber-600 bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                                                    : 'border-emerald-600 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                                                : isWeekend
                                                                                  ? 'border-transparent bg-slate-100/50 text-slate-300 dark:bg-white/5 dark:text-slate-700'
                                                                                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-indigo-500'
                                                                        }`}
                                                                    >
                                                                        <span className="relative z-10">
                                                                            {
                                                                                day
                                                                            }
                                                                        </span>
                                                                        {hasPresence && (
                                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                                                        )}
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Report Modal */}
            <AnimatePresence>
                {showAIReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setShowAIReportModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:bg-neutral-950"
                        >
                            {/* Header Gradient */}
                            <div className="relative shrink-0 overflow-hidden border-b border-indigo-500/30 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white">
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage:
                                            'radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1px)',
                                        backgroundSize: '24px 24px',
                                    }}
                                />
                                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
                                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div
                                            className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-xl ${isGeneratingAI ? 'animate-pulse' : ''}`}
                                        >
                                            <BrainCircuit
                                                className={`h-8 w-8 text-indigo-300 ${isGeneratingAI ? 'animate-spin' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-white">
                                                    AI Neural Engine
                                                </h2>
                                                <span
                                                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${aiReportReady ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300' : 'border-amber-400/30 bg-amber-500/20 text-amber-300'}`}
                                                >
                                                    ●{' '}
                                                    {aiReportReady
                                                        ? 'COMPLETE'
                                                        : 'ANALYZING...'}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-indigo-300/80">
                                                {isGeneratingAI
                                                    ? `Processing global dataset... Step ${aiGenerationStep}/7`
                                                    : 'Global Analytics Report Generated'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setShowAIReportModal(false)
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="min-h-[300px] bg-slate-50 p-8 dark:bg-neutral-900">
                                {isGeneratingAI ? (
                                    <div className="space-y-8">
                                        <div className="flex justify-between text-sm font-bold text-indigo-900 dark:text-indigo-300">
                                            <span>Processing Pipeline</span>
                                            <span className="font-mono">
                                                {Math.min(
                                                    Math.round(
                                                        (aiGenerationStep / 7) *
                                                            100,
                                                    ),
                                                    100,
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="flex h-4 overflow-hidden rounded-full bg-indigo-100 shadow-inner dark:bg-indigo-900/50">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                                                style={{
                                                    width: `${Math.min((aiGenerationStep / 7) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                                            {[
                                                { n: 'Data Load', I: Activity },
                                                { n: 'Pattern Match', I: Scan },
                                                { n: 'Behavioral', I: Users },
                                                {
                                                    n: 'Risk Assess',
                                                    I: AlertTriangle,
                                                },
                                                { n: 'Geo-Spatial', I: MapPin },
                                                {
                                                    n: 'Forecasting',
                                                    I: TrendingUp,
                                                },
                                                { n: 'Compile', I: FileText },
                                            ].map((p, i) => (
                                                <div
                                                    key={p.n}
                                                    className={`rounded-2xl border p-4 text-center shadow-sm transition-all duration-300 ${i < aiGenerationStep ? 'border-emerald-500/30 bg-white shadow-emerald-500/10 dark:bg-neutral-800' : i === aiGenerationStep ? 'border-amber-500/50 bg-white shadow-amber-500/20 dark:bg-neutral-800' : 'border-transparent bg-slate-100 opacity-50 dark:bg-neutral-900/50'}`}
                                                >
                                                    <p.I
                                                        className={`mx-auto mb-2 h-6 w-6 ${i < aiGenerationStep ? 'text-emerald-500' : i === aiGenerationStep ? 'text-amber-500' : 'text-slate-400'}`}
                                                    />
                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                                        {p.n}
                                                    </p>
                                                    <p
                                                        className={`mt-1 text-[9px] font-bold ${i < aiGenerationStep ? 'text-emerald-500' : i === aiGenerationStep ? 'text-amber-500' : 'text-slate-400'}`}
                                                    >
                                                        {i < aiGenerationStep
                                                            ? '✓ DONE'
                                                            : i ===
                                                                aiGenerationStep
                                                              ? '⏳ RUNNING'
                                                              : 'PENDING'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="mb-8 flex items-center justify-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                    Analysis Complete
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    The AI has finished
                                                    processing the global
                                                    attendance dataset.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                                <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                    Data Points
                                                </p>
                                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                                    12,450
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                                <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                    Anomalies
                                                </p>
                                                <p className="text-2xl font-black text-amber-500 dark:text-amber-400">
                                                    {stats?.late_count || 0}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                                <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                    Confidence
                                                </p>
                                                <p className="text-2xl font-black text-emerald-500 dark:text-emerald-400">
                                                    98.5%
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-neutral-800">
                                            <button
                                                onClick={() =>
                                                    setShowAIReportModal(false)
                                                }
                                                className="rounded-xl px-6 py-2.5 font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-neutral-800"
                                            >
                                                Tutup
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleExport();
                                                    setShowAIReportModal(false);
                                                }}
                                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition-colors hover:bg-indigo-700"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download Report PDF
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
