import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, AlertTriangle, MapPin, Camera, Clock, Smartphone,
    Eye, CheckCircle, XCircle, Search, RefreshCw, Filter,
    BrainCircuit, Activity,
    ShieldAlert, ShieldCheck, ShieldX, BarChart3,
    Minimize2, CheckCheck, FileWarning,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FraudScanOverlay } from '@/components/admin/fraud-scan-overlay';

interface FraudAlert {
    id: number;
    mahasiswa_id: number;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: Record<string, any>;
    status: 'pending' | 'investigating' | 'confirmed' | 'dismissed';
    created_at: string;
    mahasiswa?: { nama: string; nim: string };
    session?: { course?: { nama: string } };
}

interface Props {
    alerts: { data: FraudAlert[]; links: any; current_page: number; last_page: number };
    stats: {
        total: number; pending: number; investigating: number; critical: number;
        confirmed: number; dismissed: number; today: number; this_week: number;
        resolved_today: number;
        by_type: Record<string, number>;
        by_severity: Record<string, number>;
        recent_trend: Record<string, number>;
    };
    filters: { status: string; severity: string; type: string };
    lastScan: { scanned: number; alerts_created: number; duration_seconds: number; scanned_at: string } | null;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};
const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
    hover: { scale: 1.03, y: -8, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
};

const ALERT_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; darkColor: string; bg: string; border: string }> = {
    gps_spoofing: { icon: MapPin, label: 'GPS Spoofing', color: 'text-red-600 dark:text-red-400', darkColor: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    rapid_location_change: { icon: MapPin, label: 'Perpindahan Cepat', color: 'text-orange-600 dark:text-orange-400', darkColor: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    duplicate_selfie: { icon: Camera, label: 'Selfie Duplikat', color: 'text-violet-600 dark:text-violet-400', darkColor: '#8b5cf6', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    device_mismatch: { icon: Smartphone, label: 'Perangkat Berbeda', color: 'text-cyan-600 dark:text-cyan-400', darkColor: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    time_anomaly: { icon: Clock, label: 'Anomali Waktu', color: 'text-amber-600 dark:text-amber-400', darkColor: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    suspicious_pattern: { icon: BrainCircuit, label: 'Pola Mencurigakan', color: 'text-emerald-600 dark:text-emerald-400', darkColor: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    critical: { label: 'Critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' },
    high: { label: 'High', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500' },
    medium: { label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500' },
    low: { label: 'Low', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-500/20', icon: Clock },
    investigating: { label: 'Investigating', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-500/20', icon: Search },
    confirmed: { label: 'Confirmed', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-500/20', icon: ShieldX },
    dismissed: { label: 'Dismissed', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10', icon: XCircle },
};

export default function FraudDetection({ alerts, stats, filters, lastScan }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reviewModal, setReviewModal] = useState<{ open: boolean; alert: FraudAlert | null }>({ open: false, alert: null });
    const [scanning, setScanning] = useState(false);
    const [showScanOverlay, setShowScanOverlay] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const reviewForm = useForm({ status: '', notes: '' });

    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/fraud-detection', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleScan = () => {
        setShowScanOverlay(true);
        setScanning(true);
        router.post('/admin/fraud-detection/scan', {}, {
            onFinish: () => setScanning(false),
        });
    };

    const handleScanComplete = useCallback(() => {
        setShowScanOverlay(false);
    }, []);

    const handleBulkAction = (action: string) => {
        if (selectedIds.length === 0) return;
        router.post('/admin/fraud-detection/bulk-action', { ids: selectedIds, action }, {
            onSuccess: () => setSelectedIds([]),
        });
    };

    const handleReview = () => {
        if (!reviewModal.alert) return;
        reviewForm.patch(`/admin/fraud-detection/${reviewModal.alert.id}/review`, {
            onSuccess: () => { setReviewModal({ open: false, alert: null }); reviewForm.reset(); },
        });
    };

    const getTypeConfig = (type: string) => ALERT_TYPE_CONFIG[type] || { icon: AlertTriangle, label: type, color: 'text-slate-600 dark:text-slate-400', darkColor: '#94a3b8', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    const getSeverityConfig = (s: string) => SEVERITY_CONFIG[s] || SEVERITY_CONFIG.low;
    const getStatusConfig = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;

    return (
        <AppLayout>
            <Head title="Fraud Detection" />
            <FraudScanOverlay isOpen={showScanOverlay} onComplete={handleScanComplete} />

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 space-y-8">

                {/* ═══════ HEADER — Matching Rekap Kehadiran Style ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500"
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

                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Shield className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-blue-100 font-medium tracking-wide">Sistem Keamanan</p>
                                    <h1 className="text-3xl font-bold text-white">Fraud Detection System</h1>
                                    <p className="mt-1 text-blue-100 max-w-lg">
                                        Deteksi kecurangan absensi: GPS spoofing, selfie duplikat, dan anomali lainnya
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleScan}
                                    disabled={scanning}
                                    className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg disabled:opacity-50"
                                >
                                    {scanning ? <><RefreshCw className="h-5 w-5 animate-spin" /> Scanning...</> : <><Search className="h-5 w-5" /> Jalankan Scan</>}
                                </motion.button>
                                {lastScan && (
                                    <p className="text-xs text-blue-100 opacity-70">
                                        Scan terakhir: {new Date(lastScan.scanned_at).toLocaleString('id-ID')} ({lastScan.duration_seconds}s)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ STAT CARDS — Glassmorphism ═══════ */}
                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        { icon: ShieldAlert, label: 'Total Alert', value: stats.total, color: 'from-blue-400 to-cyan-600', shadow: 'shadow-blue-500/30', hoverShadow: 'hover:shadow-blue-500/10', gradientBg: 'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10', blurColor: 'bg-blue-500' },
                        { icon: Clock, label: 'Pending', value: stats.pending, color: 'from-amber-400 to-orange-600', shadow: 'shadow-amber-500/30', hoverShadow: 'hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', blurColor: 'bg-amber-500' },
                        { icon: Search, label: 'Investigating', value: stats.investigating, color: 'from-indigo-400 to-blue-600', shadow: 'shadow-indigo-500/30', hoverShadow: 'hover:shadow-indigo-500/10', gradientBg: 'from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10', blurColor: 'bg-indigo-500' },
                        { icon: AlertTriangle, label: 'Critical', value: stats.critical, color: 'from-red-400 to-rose-600', shadow: 'shadow-red-500/30', hoverShadow: 'hover:shadow-red-500/10', gradientBg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10', blurColor: 'bg-red-500' },
                        { icon: ShieldX, label: 'Confirmed', value: stats.confirmed, color: 'from-rose-400 to-pink-600', shadow: 'shadow-rose-500/30', hoverShadow: 'hover:shadow-rose-500/10', gradientBg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10', blurColor: 'bg-rose-500' },
                        { icon: ShieldCheck, label: 'Dismissed', value: stats.dismissed, color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/30', hoverShadow: 'hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', blurColor: 'bg-emerald-500' },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            variants={cardVariants}
                            whileHover="hover"
                            onHoverStart={() => setHoveredCard(stat.label)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className={cn('group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5', stat.hoverShadow)}
                        >
                            <div className={cn('absolute inset-0 bg-gradient-to-br', stat.gradientBg)} />
                            <motion.div
                                animate={{
                                    scale: hoveredCard === stat.label ? 1.5 : 1,
                                    opacity: hoveredCard === stat.label ? 0.4 : 0.2,
                                }}
                                className={cn('absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500', stat.blurColor)}
                            />
                            <div className="relative flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', stat.color, stat.shadow)}
                                >
                                    <stat.icon className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                                    <div className="mt-1">
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            <AnimatedCounter value={stat.value} duration={1200} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════ DISTRIBUTION + SEVERITY ═══════ */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Alert Type Distribution */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/20">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Distribusi Tipe Alert</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            {Object.keys(stats.by_type).length === 0 ? (
                                <div className="text-center py-8">
                                    <ShieldCheck className="h-12 w-12 mx-auto text-emerald-500/30 mb-3" />
                                    <p className="text-neutral-500 text-sm">Belum ada alert terdeteksi</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(stats.by_type).sort(([, a], [, b]) => b - a).map(([type, count], idx) => {
                                        const config = getTypeConfig(type);
                                        const maxCount = Math.max(...Object.values(stats.by_type));
                                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                        return (
                                            <motion.div key={type}
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                whileHover={{ x: 4 }}
                                                className="flex items-center gap-4"
                                            >
                                                <div className={cn('p-2 rounded-lg', config.bg)}>
                                                    <config.icon className={cn('h-4 w-4', config.color)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm text-neutral-900 dark:text-white font-medium">{config.label}</span>
                                                        <span className={cn('text-sm font-bold', config.color)}>{count}</span>
                                                    </div>
                                                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                                                            transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                                            className="h-full rounded-full"
                                                            style={{ background: `linear-gradient(90deg, ${config.darkColor}, transparent)` }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Severity Breakdown */}
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/20">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Severity Level</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {['critical', 'high', 'medium', 'low'].map((severity, idx) => {
                                const count = stats.by_severity?.[severity] || 0;
                                const config = getSeverityConfig(severity);
                                return (
                                    <motion.div key={severity}
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5"
                                    >
                                        <div className={cn('w-3 h-3 rounded-full', config.bg)} />
                                        <span className="text-sm text-neutral-700 dark:text-neutral-300 flex-1 capitalize">{config.label}</span>
                                        <span className={cn('text-lg font-bold', config.color)}>{count}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* ═══════ FILTERS ═══════ */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
                            <Filter className="h-5 w-5" />
                        </div>
                        <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Filter & Actions</h2>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        {[
                            { key: 'status', value: filters.status, options: [['all', 'Semua Status'], ['pending', 'Pending'], ['investigating', 'Investigating'], ['confirmed', 'Confirmed'], ['dismissed', 'Dismissed']] },
                            { key: 'severity', value: filters.severity, options: [['all', 'Semua Level'], ['critical', 'Critical'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']] },
                            { key: 'type', value: filters.type, options: [['all', 'Semua Tipe'], ['gps_spoofing', 'GPS Spoofing'], ['rapid_location_change', 'Perpindahan Cepat'], ['duplicate_selfie', 'Selfie Duplikat'], ['device_mismatch', 'Perangkat Berbeda'], ['time_anomaly', 'Anomali Waktu'], ['suspicious_pattern', 'Pola Mencurigakan']] },
                        ].map(f => (
                            <select key={f.key} value={f.value} onChange={e => handleFilterChange(f.key, e.target.value)}
                                className="rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                            >
                                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        ))}
                        <AnimatePresence>
                            {selectedIds.length > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex gap-2 ml-auto">
                                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('dismiss')} className="border-neutral-200 dark:border-neutral-700">
                                        <XCircle className="h-4 w-4 mr-1" /> Dismiss ({selectedIds.length})
                                    </Button>
                                    <Button size="sm" onClick={() => handleBulkAction('confirm')} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                        <CheckCircle className="h-4 w-4 mr-1" /> Confirm ({selectedIds.length})
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ═══════ ALERTS LIST ═══════ */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-black/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20">
                                    <FileWarning className="h-5 w-5" />
                                </div>
                                <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Daftar Alert</h2>
                            </div>
                            <span className="text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700">
                                {alerts.data.length} alert
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                        <AnimatePresence>
                            {alerts.data.map((alert, index) => {
                                const typeConf = getTypeConfig(alert.alert_type);
                                const sevConf = getSeverityConfig(alert.severity);
                                const statusConf = getStatusConfig(alert.status);
                                const StatusIcon = statusConf.icon;
                                return (
                                    <motion.div key={alert.id}
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="p-5 transition-colors group hover:bg-white/60 dark:hover:bg-neutral-800/50"
                                    >
                                        <div className="flex items-start gap-4">
                                            <Checkbox
                                                checked={selectedIds.includes(alert.id)}
                                                onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, alert.id] : prev.filter(id => id !== alert.id))}
                                                className="mt-1"
                                            />
                                            <div className={cn('p-2.5 rounded-xl border', typeConf.bg, typeConf.border, 'group-hover:scale-110 transition-transform')}>
                                                <typeConf.icon className={cn('h-5 w-5', typeConf.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                    <span className="font-bold text-neutral-900 dark:text-white">{alert.mahasiswa?.nama}</span>
                                                    <span className="text-sm text-neutral-500">({alert.mahasiswa?.nim})</span>
                                                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', statusConf.bg, statusConf.color)}>
                                                        <StatusIcon className="h-3 w-3" /> {statusConf.label}
                                                    </span>
                                                    <span className={cn('px-2 py-0.5 rounded-lg text-xs font-bold', sevConf.bg, sevConf.color)}>
                                                        {sevConf.label}
                                                    </span>
                                                    <span className={cn('px-2 py-0.5 rounded-lg text-xs font-bold', typeConf.bg, typeConf.color)}>
                                                        {typeConf.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1.5 leading-relaxed">{alert.description}</p>
                                                <p className="text-xs text-neutral-500">
                                                    {new Date(alert.created_at).toLocaleString('id-ID')}
                                                    {alert.session?.course && ` • ${alert.session.course.nama}`}
                                                </p>
                                            </div>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => { setReviewModal({ open: true, alert }); reviewForm.setData({ status: alert.status, notes: '' }); }}
                                                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-400 hover:text-blue-500 hover:border-blue-500/30 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {alerts.data.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-16 text-center">
                                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                                    <ShieldCheck className="h-20 w-20 mx-auto text-emerald-500/20 mb-4" />
                                </motion.div>
                                <p className="text-neutral-700 dark:text-neutral-400 font-medium text-lg">Sistem Aman</p>
                                <p className="text-neutral-500 text-sm mt-1">Tidak ada alert yang ditemukan. Sistem keamanan berjalan normal.</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Pagination */}
                {alerts.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: alerts.last_page }, (_, i) => (
                            <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                onClick={() => router.get('/admin/fraud-detection', { ...filters, page: i + 1 })}
                                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', alerts.current_page === i + 1
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white/60 text-neutral-600 hover:bg-white/80 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                                )}
                            >
                                {i + 1}
                            </motion.button>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ═══════ REVIEW MODAL ═══════ */}
            <AnimatePresence>
                {reviewModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setReviewModal({ open: false, alert: null })}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="relative p-6 flex flex-col items-center text-center overflow-hidden">
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
                                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"
                                />
                                <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl ring-4 ring-white/10 bg-gradient-to-br from-blue-500 to-indigo-600 relative z-10"
                                >
                                    <Eye className="h-8 w-8 text-white" />
                                </motion.div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1 relative z-10">Review Alert</h2>
                            </div>

                            {reviewModal.alert && (
                                <div className="px-6 pb-4 overflow-y-auto flex-1 space-y-4">
                                    {/* Alert Info */}
                                    <div className="rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 p-4">
                                        <p className="font-semibold text-neutral-900 dark:text-white mb-1">{reviewModal.alert.mahasiswa?.nama} <span className="text-neutral-500 font-normal">({reviewModal.alert.mahasiswa?.nim})</span></p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{reviewModal.alert.description}</p>
                                    </div>
                                    {/* Evidence */}
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Evidence</label>
                                        <pre className="p-3 bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 overflow-auto max-h-[150px] font-mono">
                                            {JSON.stringify(reviewModal.alert.evidence, null, 2)}
                                        </pre>
                                    </div>
                                    {/* Status */}
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Status</label>
                                        <select value={reviewForm.data.status} onChange={(e) => reviewForm.setData('status', e.target.value)}
                                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        >
                                            <option value="investigating">Investigating</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="dismissed">Dismissed</option>
                                        </select>
                                    </div>
                                    {/* Notes */}
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Catatan</label>
                                        <Textarea
                                            className="bg-white/60 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            value={reviewForm.data.notes} onChange={(e) => reviewForm.setData('notes', e.target.value)}
                                            placeholder="Tambahkan catatan..." rows={3}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="p-4 border-t border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80">
                                <button onClick={() => setReviewModal({ open: false, alert: null })} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors">
                                    <Minimize2 className="h-5 w-5 text-neutral-400" />
                                </button>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setReviewModal({ open: false, alert: null })} className="rounded-full">
                                        Batal
                                    </Button>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button onClick={handleReview} disabled={reviewForm.processing} className="rounded-full px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                                            <CheckCheck className="h-4 w-4 mr-2" />
                                            {reviewForm.processing ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </motion.div>
                                </div>
                                <div className="w-9" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
