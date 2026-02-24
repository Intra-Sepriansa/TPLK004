import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Shield, Clock, User, MapPin, Activity, AlertCircle,
    CheckCircle, XCircle, BookOpen, Smartphone, Globe, Eye,
    Download, Share2, AlertTriangle, ShieldCheck, Zap,
    TrendingUp, BarChart3, Calendar, Hash, FileText,
    Database, Server, Cpu, HardDrive, Layers, Terminal
} from 'lucide-react';
import { useState } from 'react';

interface AuditLog {
    id: number;
    event_type: string;
    message: string;
    created_at: string;
    mahasiswa?: { nama: string; nim: string; email?: string; kelas?: string } | null;
    session?: {
        meeting_number?: number;
        course?: { nama: string; kode?: string; dosen?: { nama: string } }
    } | null;
    ip_address?: string;
    user_agent?: string;
    device_info?: string;
    location?: string;
    metadata?: any;
}

interface PageProps {
    auditLog: AuditLog;
    relatedLogs: AuditLog[];
}

const eventTypeConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    token_expired: { label: 'Token Expired', color: 'text-amber-700', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
    token_duplicate: { label: 'Token Duplikat', color: 'text-red-700', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: AlertTriangle },
    geofence_violation: { label: 'Pelanggaran Zona', color: 'text-rose-700', bgColor: 'bg-rose-100 dark:bg-rose-900/30', icon: MapPin },
    login_failed: { label: 'Login Gagal', color: 'text-orange-700', bgColor: 'bg-orange-100 dark:bg-orange-900/30', icon: XCircle },
    login_success: { label: 'Login Berhasil', color: 'text-emerald-700', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle },
    suspicious_activity: { label: 'Aktivitas Mencurigakan', color: 'text-purple-700', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: AlertCircle },
    attendance_success: { label: 'Absensi Berhasil', color: 'text-green-700', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
    selfie_uploaded: { label: 'Selfie Diupload', color: 'text-blue-700', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: Eye },
};

// Animation variants matching Uang Kas page
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
            type: 'spring',
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
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.02,
        y: -5,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
} as const;

export default function AuditDetail({ auditLog, relatedLogs }: PageProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'related'>('overview');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const config = eventTypeConfig[auditLog.event_type] || {
        label: auditLog.event_type,
        color: 'text-slate-700',
        bgColor: 'bg-slate-100 dark:bg-slate-900/30',
        icon: Activity
    };
    const Icon = config.icon;

    return (
        <AppLayout>
            <Head title={`Audit Log #${auditLog.id}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6 min-h-screen"
            >
                {/* ═══════ HEADER — Matching Uang Kas Style ═══════ */}
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
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i }}
                        />
                    ))}

                    <div className="relative">
                        <Link
                            href="/admin/audit"
                            className="absolute -top-4 -left-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors backdrop-blur-md"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        <div className="flex flex-wrap items-center justify-between gap-6 pt-8">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Icon className="h-10 w-10 text-white" />
                                </motion.div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
                                            {config.label}
                                        </span>
                                        <span className="text-xs text-indigo-100 font-mono">#{auditLog.id}</span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white">
                                        {auditLog.mahasiswa?.nama || 'System Event'}
                                    </h1>
                                    <p className="mt-1 text-indigo-100 max-w-lg flex items-center gap-2">
                                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-sm">
                                            {auditLog.mahasiswa?.nim || 'SYSTEM'}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/50" />
                                        <span className="text-sm opacity-90">{auditLog.created_at}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="flex gap-2"
                            >
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-black/20">
                                    <Download className="h-4 w-4" />
                                    <span>Export</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-black/20">
                                    <Share2 className="h-4 w-4" />
                                    <span>Share</span>
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs Navigation */}
                <motion.div
                    variants={itemVariants}
                    className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit border border-white/10"
                >
                    {[
                        { id: 'overview', label: 'Overview', icon: Eye },
                        { id: 'technical', label: 'Technical Details', icon: Terminal },
                        { id: 'related', label: 'Related Events', icon: Layers },
                    ].map((tab) => (
                        <motion.button
                            key={tab.id}
                            layout
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id
                                ? 'text-indigo-700 dark:text-indigo-300 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <tab.icon className="h-4 w-4" /> {tab.label}
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Message Card */}
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                onHoverStart={() => setHoveredCard('message')}
                                onHoverEnd={() => setHoveredCard(null)}
                                className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:shadow-indigo-500/10 dark:border-white/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10" />
                                <motion.div
                                    animate={{
                                        scale: hoveredCard === 'message' ? 1.5 : 1,
                                        opacity: hoveredCard === 'message' ? 0.4 : 0.2,
                                    }}
                                    className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500 blur-3xl transition-all duration-500"
                                />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Event Message</h3>
                                    </div>
                                    <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                                        {auditLog.message}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* User Info */}
                                {auditLog.mahasiswa && (
                                    <motion.div
                                        variants={cardVariants}
                                        whileHover="hover"
                                        onHoverStart={() => setHoveredCard('user')}
                                        onHoverEnd={() => setHoveredCard(null)}
                                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-cyan-500/10 dark:border-white/5"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: hoveredCard === 'user' ? 1.5 : 1,
                                                opacity: hoveredCard === 'user' ? 0.4 : 0.2,
                                            }}
                                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500 blur-3xl transition-all duration-500"
                                        />
                                        <div className="relative flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                                <User className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">User Identity</p>
                                                <p className="font-bold text-neutral-900 dark:text-white mt-1">{auditLog.mahasiswa.nama}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-400">{auditLog.mahasiswa.nim}</span>
                                                    {auditLog.mahasiswa.kelas && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">{auditLog.mahasiswa.kelas}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Course/Session Info */}
                                {auditLog.session?.course && (
                                    <motion.div
                                        variants={cardVariants}
                                        whileHover="hover"
                                        onHoverStart={() => setHoveredCard('course')}
                                        onHoverEnd={() => setHoveredCard(null)}
                                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-white/5"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: hoveredCard === 'course' ? 1.5 : 1,
                                                opacity: hoveredCard === 'course' ? 0.4 : 0.2,
                                            }}
                                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
                                        />
                                        <div className="relative flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                <BookOpen className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Course Details</p>
                                                <p className="font-bold text-neutral-900 dark:text-white mt-1 line-clamp-1">{auditLog.session.course.nama}</p>
                                                {auditLog.session.meeting_number && (
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                                        Pertemuan ke-{auditLog.session.meeting_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Security Context */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover="hover"
                                    onHoverStart={() => setHoveredCard('security')}
                                    onHoverEnd={() => setHoveredCard(null)}
                                    className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-rose-500/10 dark:border-white/5"
                                >
                                    <motion.div
                                        animate={{
                                            scale: hoveredCard === 'security' ? 1.5 : 1,
                                            opacity: hoveredCard === 'security' ? 0.4 : 0.2,
                                        }}
                                        className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-500 blur-3xl transition-all duration-500"
                                    />
                                    <div className="relative flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-400 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
                                            <ShieldCheck className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Security Context</p>
                                            <p className="font-bold text-neutral-900 dark:text-white mt-1">Audit Recorded</p>
                                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                                                Immutable Log Entry
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'technical' && (
                        <motion.div
                            key="technical"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Device & Network */}
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                onHoverStart={() => setHoveredCard('device')}
                                onHoverEnd={() => setHoveredCard(null)}
                                className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-blue-500/10 dark:border-white/5"
                            >
                                <motion.div
                                    animate={{
                                        scale: hoveredCard === 'device' ? 1.5 : 1,
                                        opacity: hoveredCard === 'device' ? 0.4 : 0.2,
                                    }}
                                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500 blur-3xl transition-all duration-500"
                                />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <Server className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">System Info</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { icon: Globe, label: 'IP Address', value: auditLog.ip_address || 'N/A' },
                                            { icon: Smartphone, label: 'User Agent', value: auditLog.user_agent || 'N/A' },
                                            { icon: MapPin, label: 'Location', value: auditLog.location || 'N/A' },
                                            { icon: Cpu, label: 'Device Info', value: auditLog.device_info || 'N/A' },
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/10 dark:border-white/5">
                                                <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                                    <item.icon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{item.label}</p>
                                                    <p className="text-sm font-mono text-neutral-700 dark:text-neutral-200 break-all">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Metadata JSON */}
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                onHoverStart={() => setHoveredCard('metadata')}
                                onHoverEnd={() => setHoveredCard(null)}
                                className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-purple-500/10 dark:border-white/5"
                            >
                                <motion.div
                                    animate={{
                                        scale: hoveredCard === 'metadata' ? 1.5 : 1,
                                        opacity: hoveredCard === 'metadata' ? 0.4 : 0.2,
                                    }}
                                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500 blur-3xl transition-all duration-500"
                                />
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                                            <Database className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Raw Metadata</h3>
                                    </div>

                                    <div className="flex-1 w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-xs overflow-auto custom-scrollbar">
                                        <div className="flex gap-2 mb-2 pb-2 border-b border-neutral-800">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        </div>
                                        <pre className="text-emerald-400">
                                            {JSON.stringify(auditLog.metadata || {}, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'related' && (
                        <motion.div
                            key="related"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                onHoverStart={() => setHoveredCard('related')}
                                onHoverEnd={() => setHoveredCard(null)}
                                className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:shadow-indigo-500/10 dark:border-white/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                            <Layers className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Related Timeline</h3>
                                    </div>

                                    {relatedLogs && relatedLogs.length > 0 ? (
                                        <div className="space-y-3">
                                            {relatedLogs.map((log, index) => {
                                                const relatedConfig = eventTypeConfig[log.event_type] || {
                                                    label: log.event_type,
                                                    color: 'text-slate-700',
                                                    bgColor: 'bg-slate-100',
                                                    icon: Activity
                                                };
                                                const RelatedIcon = relatedConfig.icon;

                                                return (
                                                    <motion.div
                                                        key={log.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.05 * index }}
                                                    >
                                                        <Link
                                                            href={`/admin/audit/${log.id}`}
                                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-neutral-800 border border-transparent hover:border-indigo-500/30 transition-all group/item"
                                                        >
                                                            <div className={`h-12 w-12 rounded-xl ${relatedConfig.bgColor} flex items-center justify-center shrink-0`}>
                                                                <RelatedIcon className={`h-6 w-6 ${relatedConfig.color}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${relatedConfig.bgColor} ${relatedConfig.color}`}>
                                                                        {relatedConfig.label}
                                                                    </span>
                                                                    <span className="text-xs text-neutral-400">#{log.id}</span>
                                                                </div>
                                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200 truncate">{log.message}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs text-neutral-500 font-mono block">{log.created_at}</span>
                                                                <ArrowLeft className="h-4 w-4 text-neutral-400 rotate-180 ml-auto mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity transform group-hover/item:translate-x-1" />
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/20 border border-dashed border-neutral-300 dark:border-neutral-700">
                                            <Activity className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                                            <p className="text-neutral-500 dark:text-neutral-400">No related events found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AppLayout>
    );
}
