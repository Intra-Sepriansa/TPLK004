import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart3, TrendingUp, Users, Clock, AlertTriangle, Filter,
    Calendar, Download, ChevronDown, ArrowUpRight, ArrowDownRight,
    Zap, Brain, Shield, Search, MoreHorizontal, PieChart,
    Activity, Target, Smartphone, Moon, Sun, Cloud, Edit, X,
    Sparkles, Scan, Eye, Fingerprint, MapPin, BrainCircuit, FileText, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

// Custom Icons
import analyticsIcon from '@/assets/admin/analytics/analytics.png';
import totalMahasiswaIcon from '@/assets/admin/analytics/total-mahasiswa.png';
import kehadiranIcon from '@/assets/admin/analytics/kehadiran.png';
import terlambatIcon from '@/assets/admin/analytics/terlambat.png';


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
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

const cardHover: Variants = {
    hover: { scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 10 } }
};

export default function Analytics({ stats, attendanceTrend, deviceDistribution, topPerformers, aiInsights, filters }: AnalyticsProps) {
    const [timeRange, setTimeRange] = useState(filters.period || 'week');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
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
            only: ['stats', 'attendanceTrend', 'deviceDistribution', 'topPerformers', 'aiInsights', 'filters'],
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
            const response = await fetch(route('admin.analytics.student.detail', id));
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setStudentDetail(data);
        } catch (error) {
            console.error("Failed to fetch student details:", error);
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
            case 'AlertTriangle': return <AlertTriangle className="h-5 w-5" />;
            case 'TrendingUp': return <TrendingUp className="h-5 w-5" />;
            case 'Moon': return <Moon className="h-5 w-5" />;
            case 'Sun': return <Sun className="h-5 w-5" />;
            case 'Cloud': return <Cloud className="h-5 w-5" />;
            default: return <Brain className="h-5 w-5" />;
        }
    };

    return (
        <AppLayout>
            <Head title="Analitik & Laporan" />

            <motion.div
                className="p-6 space-y-6"
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
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img src={analyticsIcon} alt="Analitik" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Sistem Laporan
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Analitik Performa
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Pantau analisis data kehadiran, tren performa mahasiswa, dan insight berbasis AI.
                                    </motion.p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center lg:items-end gap-3 sm:gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                                <div className="flex w-full sm:w-auto bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl p-1.5 shadow-lg overflow-x-auto custom-scrollbar">
                                    {['day', 'week', 'month', 'year'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => handleTimeRangeChange(range)}
                                            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${timeRange === range
                                                ? 'bg-white text-indigo-600 shadow-xl scale-105'
                                                : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {range.charAt(0).toUpperCase() + range.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="flex w-fit justify-center items-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg disabled:opacity-50"
                                >
                                    {isExporting ? <Activity className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                                    {isExporting ? 'Exporting...' : 'Export Laporan'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.visit('/admin/rekap-kehadiran')}
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
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } }
                    }}
                >
                    {[
                        { title: 'Total Kehadiran', value: stats.total_attendance.toLocaleString(), change: `${stats.rate_change > 0 ? '+' : ''}${stats.rate_change}%`, isUp: stats.rate_change >= 0, imgSrc: totalMahasiswaIcon, color: 'indigo' },
                        { title: 'Tingkat Kehadiran', value: `${stats.attendance_rate}%`, change: 'vs prev period', isUp: stats.rate_change >= 0, imgSrc: kehadiranIcon, color: 'emerald' },
                        { title: 'Terlambat', value: stats.late_count.toString(), change: 'Check Logs', isUp: false, imgSrc: terlambatIcon, color: 'amber' },
                    ].map((stat, i) => {
                        const colorConfigs: Record<string, any> = {
                            indigo: { from: 'from-sky-400', to: 'to-indigo-600', shadow: 'shadow-sky-500/30', bg: 'bg-sky-500', hoverShadow: 'hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10' },
                            emerald: { from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30', bg: 'bg-emerald-500', hoverShadow: 'hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' },
                            amber: { from: 'from-amber-400', to: 'to-orange-600', shadow: 'shadow-amber-500/30', bg: 'bg-amber-500', hoverShadow: 'hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10' },
                            rose: { from: 'from-rose-400', to: 'to-pink-600', shadow: 'shadow-rose-500/30', bg: 'bg-rose-500', hoverShadow: 'hover:shadow-rose-500/10', gradientBg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10' },
                        };
                        const colorConfig = colorConfigs[stat.color] || colorConfigs['indigo'];

                        return (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: { type: 'spring', stiffness: 100, damping: 15 }
                                    }
                                }}
                                whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${colorConfig.hoverShadow} dark:border-white/5`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.gradientBg} opacity-50 dark:opacity-100`} />

                                <motion.div
                                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${colorConfig.bg} blur-3xl transition-all opacity-20 group-hover:opacity-40`}
                                />

                                <div className="relative z-10 flex flex-col items-center sm:items-start gap-4 sm:gap-5 h-full justify-between">
                                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center transition-transform duration-300"
                                        >
                                            <img src={stat.imgSrc} alt={stat.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                                        </motion.div>
                                        <div className="flex flex-col">
                                            <h3 className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400 mb-0.5 sm:mb-1">{stat.title}</h3>
                                            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                                                <span className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-none">
                                                    {stat.value}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 justify-center sm:justify-start">
                                                <div className={`flex items-center gap-0.5 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${stat.isUp
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                                                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400'
                                                    }`}>
                                                    {stat.isUp ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}
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
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Attendance Trend Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-2 rounded-3xl border border-white/60 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl p-8 shadow-xl dark:border-white/10"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tren Kehadiran</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview statistik kehadiran per periode</p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 px-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" /> Hadir
                                </span>
                                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                                <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 px-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" /> Telat
                                </span>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attendanceTrend} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTelat" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 'bold', paddingTop: '4px' }}
                                        labelStyle={{ color: '#1E293B', fontWeight: 'bold', marginBottom: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="hadir" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorHadir)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }} animationDuration={1500} />
                                    <Area type="monotone" dataKey="telat" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorTelat)" activeDot={{ r: 6, strokeWidth: 0, fill: '#E11D48' }} animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* AI Insights Panel */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-xl p-8 shadow-xl relative overflow-hidden flex flex-col"
                    >
                        {/* Animated background accent */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />

                        <div className="relative z-10 mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                                    <Brain className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">AI Insights</h3>
                            </div>
                            <p className="text-indigo-600/80 dark:text-indigo-300 text-sm">Automated analysis based on your data.</p>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode='wait'>
                                {aiInsights.length > 0 ? (
                                    aiInsights.map((insight, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-5 rounded-2xl bg-white/70 dark:bg-black/30 border border-indigo-100 dark:border-indigo-800/30 shadow-sm hover:bg-white/90 transition-colors cursor-default"
                                        >
                                            <h4 className={`font-bold text-sm mb-2 flex items-center gap-2 ${insight.type === 'warning' ? 'text-rose-700 dark:text-rose-300' :
                                                insight.type === 'success' ? 'text-emerald-700 dark:text-emerald-300' :
                                                    'text-indigo-800 dark:text-indigo-200'
                                                }`}>
                                                {getIcon(insight.icon)} {insight.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                {insight.description}
                                            </p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-sm text-indigo-400 py-10 flex flex-col items-center gap-2"
                                    >
                                        <Activity className="h-8 w-8 opacity-50" />
                                        <span>Analyzing data patterns...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button onClick={handleGenerateReport} className="mt-6 w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group">
                            <Zap className="h-4 w-4 group-hover:fill-current transition-all" />
                            Generate Full Report
                        </button>
                    </motion.div>
                </div>

                {/* Secondary Charts & Tables */}
                <div className="grid lg:grid-cols-3 gap-8 pb-8">
                    {/* Device Distribution */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/60 bg-white/80 dark:bg-[#18181b] backdrop-blur-xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[400px] dark:border-white/10 relative overflow-hidden"
                    >
                        {/* Subtle Background Glows */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                        <h3 className="font-bold text-slate-800 dark:text-white mb-2 self-start w-full flex items-center gap-2 text-lg z-10 relative">
                            <Smartphone className="h-5 w-5 text-indigo-500" /> Device Distribution
                        </h3>
                        <div className="w-full flex-1 relative flex items-center justify-center z-10">
                            <ResponsiveContainer width="100%" height={300}>
                                <RePieChart>
                                    <Pie
                                        data={deviceDistribution.length > 0 ? deviceDistribution : [{ name: 'No Data', value: 1, color: '#e2e8f0' }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={105}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={1500}
                                    >
                                        {deviceDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                                        itemStyle={{ fontWeight: 'bold', color: '#fff' }}
                                    />
                                    <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', color: '#94a3b8' }} />
                                </RePieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                                <div className="text-3xl font-black text-slate-800 dark:text-white">
                                    {deviceDistribution.length > 0 ? deviceDistribution.reduce((a, b) => a + b.value, 0) : '0'}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Total Devices</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Top Students List - Redesigned */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-2 rounded-3xl bg-[#18181b] border border-white/10 shadow-2xl p-8 overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 z-10 relative">
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 shrink-0">
                                    <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                                Top Attendance
                            </h3>
                            <button
                                // @ts-ignore
                                onClick={() => router.visit(route('admin.mahasiswa'))}
                                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                            >
                                View All Students
                            </button>
                        </div>

                        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar">
                            <div className="min-w-[600px]">
                                {/* List Headers */}
                                <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">
                                    <div className="col-span-5">Mahasiswa</div>
                                    <div className="col-span-3">Jurusan</div>
                                    <div className="col-span-2 text-center">Kehadiran</div>
                                    <div className="col-span-2 text-right">Status</div>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-white/10 mb-4" />

                                {/* Scrollable List */}
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {topPerformers.length > 0 ? (
                                            topPerformers.map((student, i) => (
                                                <motion.div
                                                    key={student.id}
                                                    onClick={() => handleStudentClick(student.id)}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200, damping: 20 }}
                                                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                                    whileTap={{ scale: 0.99 }}
                                                    className="grid grid-cols-12 gap-4 items-center p-4 rounded-2xl cursor-pointer group transition-colors bg-white/5 border border-white/5 hover:border-indigo-500/30 w-full"
                                                >
                                                    {/* Mahasiswa Column */}
                                                    <div className="col-span-5 flex items-center gap-4">
                                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${i === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' :
                                                            i === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30' :
                                                                'bg-gradient-to-br from-slate-700 to-slate-600'
                                                            }`}>
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors line-clamp-1">{student.name}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{student.nim}</div>
                                                        </div>
                                                    </div>

                                                    {/* Jurusan Column */}
                                                    <div className="col-span-3 text-sm font-medium text-slate-400">
                                                        {student.department === 'Teknik Informatika' ? 'Umum' : student.department}
                                                    </div>

                                                    {/* Kehadiran Column */}
                                                    <div className="col-span-2 flex justify-center">
                                                        <div className="px-3 py-1.5 rounded-lg bg-[#27272a] border border-white/10 text-white font-bold text-xs min-w-[3rem] text-center shadow-inner">
                                                            {student.attendance.replace(' Sesi', '')} Sesi
                                                        </div>
                                                    </div>

                                                    {/* Status Column */}
                                                    <div className="col-span-2 flex justify-end">
                                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border ${student.status === 'Excellent' || student.status === 'Good'
                                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10'
                                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10'
                                                            }`}>
                                                            {student.status === 'Excellent' ? 'Good' : student.status}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-slate-600 font-medium italic">
                                                No data available yet
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Subtle Background Glows */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
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
                            className="relative w-full max-w-4xl bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden border border-white/10 z-10 flex flex-col max-h-[90vh]"
                        >
                            {isLoadingDetail ? (
                                <div className="h-96 flex items-center justify-center flex-col gap-3">
                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm font-medium text-slate-500">Loading comprehensive profile...</span>
                                </div>
                            ) : studentDetail ? (
                                <div className="flex flex-col h-full">
                                    {/* Modal Header */}
                                    <div className="relative h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
                                        <div className="absolute left-10 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                                        <div className="absolute top-6 right-6 flex gap-3 z-20">
                                            <button className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors backdrop-blur-md border border-white/10" title="Download Report">
                                                <Download className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors backdrop-blur-md border border-white/10" title="Edit Student">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={closeModal}
                                                className="p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors backdrop-blur-md border border-white/5"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-0 left-0 w-full px-8 pb-6 flex items-end gap-6 translate-y-8 z-20">
                                            <div className="h-32 w-32 rounded-3xl bg-white dark:bg-[#1a1a1a] p-2 shadow-2xl rotate-3 transform origin-bottom-left transition-transform hover:rotate-0">
                                                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-black text-white shadow-inner">
                                                    {studentDetail.student.avatar_letter}
                                                </div>
                                            </div>
                                            <div className="mb-10 text-white pb-1">
                                                <h2 className="text-3xl font-bold tracking-tight">{studentDetail.student.name}</h2>
                                                <div className="flex items-center gap-3 text-indigo-100 mt-1">
                                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">{studentDetail.student.department}</span>
                                                    <span className="text-sm font-medium opacity-80">{studentDetail.student.nim}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Navigation Tabs */}
                                    <div className="mt-12 px-8 border-b border-slate-200 dark:border-slate-800 flex gap-8 shrink-0">
                                        {['overview', 'history', 'calendar'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                    }`}
                                            >
                                                {tab}
                                                {activeTab === tab && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Scrollable Content Area */}
                                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                        <AnimatePresence mode='wait'>
                                            {activeTab === 'overview' && (
                                                <motion.div
                                                    key="overview"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                >
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kehadiran</div>
                                                            <div className="text-2xl font-black text-slate-900 dark:text-white">{studentDetail.student.total_attendance}</div>
                                                            <div className="text-xs text-emerald-500 font-bold mt-1">Sesi Terdata</div>
                                                        </div>
                                                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Rate</div>
                                                            <div className="text-2xl font-black text-slate-900 dark:text-white">{studentDetail.student.attendance_rate}%</div>
                                                            <div className="text-xs text-indigo-500 font-bold mt-1">{studentDetail.student.status}</div>
                                                        </div>
                                                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Avg Check-in</div>
                                                            <div className="text-2xl font-black text-slate-900 dark:text-white">{studentDetail.student.avg_check_in || '--:--'}</div>
                                                            <div className="text-xs text-amber-500 font-bold mt-1">WIB</div>
                                                        </div>
                                                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Late Count</div>
                                                            <div className="text-2xl font-black text-slate-900 dark:text-white">{studentDetail.student.late_count || 0}</div>
                                                            <div className="text-xs text-rose-500 font-bold mt-1">Times</div>
                                                        </div>
                                                    </div>

                                                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                                        <TrendingUp className="w-5 h-5 text-indigo-500" /> Weekly Activity
                                                    </h3>
                                                    <div className="h-64 w-full bg-slate-50 dark:bg-white/5 rounded-3xl p-4 mb-8 border border-slate-100 dark:border-white/5">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={studentDetail.weekly_activity}>
                                                                <defs>
                                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                                                <YAxis hide />
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                                                                    itemStyle={{ color: '#fff' }}
                                                                />
                                                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'history' && (
                                                <motion.div
                                                    key="history"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                >
                                                    <div className="bg-slate-50 dark:bg-white/5 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-slate-100 dark:bg-white/10 text-xs uppercase text-slate-500 font-bold">
                                                                <tr>
                                                                    <th className="px-6 py-4">Date & Time</th>
                                                                    <th className="px-6 py-4">Status</th>
                                                                    <th className="px-6 py-4 text-right">Device</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                                {studentDetail.recent_logs.map((log: any) => (
                                                                    <tr key={log.id} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                                                                        <td className="px-6 py-4">
                                                                            <div className="font-bold text-slate-900 dark:text-white">{log.date}</div>
                                                                            <div className="text-xs text-slate-500">{log.time}</div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${log.status === 'On Time'
                                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                                                }`}>
                                                                                <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'On Time' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                                                {log.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">
                                                                            {log.device}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'calendar' && (
                                                <motion.div
                                                    key="calendar"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                >
                                                    <div className="bg-slate-50 dark:bg-white/5 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 p-6">
                                                        {/* Calendar Header */}
                                                        <div className="flex items-center justify-between mb-8">
                                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                                                    <Calendar className="w-5 h-5" />
                                                                </div>
                                                                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                            </h3>
                                                            <div className="flex gap-4">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span> Hadir
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span> Alpha / Libur
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Dynamic Calendar Grid */}
                                                        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                                                            {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
                                                                <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                                    {day.substr(0, 3)}
                                                                </div>
                                                            ))}

                                                            {/* Empty slots for start of month */}
                                                            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                                                                <div key={`pad-${i}`} />
                                                            ))}

                                                            {/* Days of Month */}
                                                            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }).map((_, i) => {
                                                                const day = i + 1;
                                                                const month = new Date().getMonth() + 1;
                                                                const year = new Date().getFullYear();
                                                                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                                                                // Check if this date exists in calendar_data
                                                                const log = (studentDetail.calendar_data || []).find((d: any) => d.date === dateStr);
                                                                const hasPresence = !!log;
                                                                const isLate = log?.status === 'late' || log?.status === 'Late';
                                                                const isWeekend = new Date(year, month - 1, day).getDay() === 0 || new Date(year, month - 1, day).getDay() === 6;

                                                                return (
                                                                    <motion.div
                                                                        key={day}
                                                                        whileHover={{ scale: 1.1, translateY: -2 }}
                                                                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all cursor-pointer border relative overflow-hidden group ${hasPresence
                                                                            ? (isLate
                                                                                ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/30'
                                                                                : 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/30')
                                                                            : (isWeekend ? 'bg-slate-100/50 text-slate-300 dark:bg-white/5 dark:text-slate-700 border-transparent' : 'bg-white text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500')
                                                                            }`}
                                                                    >
                                                                        <span className="relative z-10">{day}</span>
                                                                        {hasPresence && (
                                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    </div >
                )
                }
            </AnimatePresence >

            {/* AI Report Modal */}
            <AnimatePresence>
                {showAIReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowAIReportModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-4xl rounded-3xl border border-white/20 bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden flex flex-col relative"
                        >
                            {/* Header Gradient */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white shrink-0 border-b border-indigo-500/30">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
                                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-xl border border-indigo-400/30 ${isGeneratingAI ? 'animate-pulse' : ''}`}>
                                            <BrainCircuit className={`h-8 w-8 text-indigo-300 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-white">AI Neural Engine</h2>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${aiReportReady ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' : 'bg-amber-500/20 border-amber-400/30 text-amber-300'}`}>
                                                    ● {aiReportReady ? 'COMPLETE' : 'ANALYZING...'}
                                                </span>
                                            </div>
                                            <p className="text-indigo-300/80 text-sm mt-1">
                                                {isGeneratingAI ? `Processing global dataset... Step ${aiGenerationStep}/7` : 'Global Analytics Report Generated'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAIReportModal(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-neutral-900 min-h-[300px]">
                                {isGeneratingAI ? (
                                    <div className="space-y-8">
                                        <div className="flex justify-between text-sm font-bold text-indigo-900 dark:text-indigo-300">
                                            <span>Processing Pipeline</span>
                                            <span className="font-mono">{Math.min(Math.round((aiGenerationStep / 7) * 100), 100)}%</span>
                                        </div>
                                        <div className="h-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full overflow-hidden shadow-inner flex">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.min((aiGenerationStep / 7) * 100, 100)}%` }} />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-8">
                                            {[
                                                { n: 'Data Load', I: Activity }, { n: 'Pattern Match', I: Scan }, { n: 'Behavioral', I: Users },
                                                { n: 'Risk Assess', I: AlertTriangle }, { n: 'Geo-Spatial', I: MapPin }, { n: 'Forecasting', I: TrendingUp }, { n: 'Compile', I: FileText },
                                            ].map((p, i) => (
                                                <div key={p.n} className={`rounded-2xl p-4 text-center border transition-all duration-300 shadow-sm ${i < aiGenerationStep ? 'bg-white dark:bg-neutral-800 border-emerald-500/30 shadow-emerald-500/10' : i === aiGenerationStep ? 'bg-white dark:bg-neutral-800 border-amber-500/50 shadow-amber-500/20' : 'bg-slate-100 dark:bg-neutral-900/50 border-transparent opacity-50'}`}>
                                                    <p.I className={`h-6 w-6 mx-auto mb-2 ${i < aiGenerationStep ? 'text-emerald-500' : i === aiGenerationStep ? 'text-amber-500' : 'text-slate-400'}`} />
                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{p.n}</p>
                                                    <p className={`text-[9px] font-bold mt-1 ${i < aiGenerationStep ? 'text-emerald-500' : i === aiGenerationStep ? 'text-amber-500' : 'text-slate-400'}`}>
                                                        {i < aiGenerationStep ? '✓ DONE' : i === aiGenerationStep ? '⏳ RUNNING' : 'PENDING'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-center gap-4 mb-8">
                                            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Complete</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">The AI has finished processing the global attendance dataset.</p>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-sm text-center">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Data Points</p>
                                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">12,450</p>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-sm text-center">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Anomalies</p>
                                                <p className="text-2xl font-black text-amber-500 dark:text-amber-400">{stats?.late_count || 0}</p>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-sm text-center">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                                                <p className="text-2xl font-black text-emerald-500 dark:text-emerald-400">98.5%</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-neutral-800">
                                            <button onClick={() => setShowAIReportModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors">
                                                Tutup
                                            </button>
                                            <button onClick={() => { handleExport(); setShowAIReportModal(false); }} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/30 transition-colors flex items-center gap-2">
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
        </AppLayout >
    );
}
