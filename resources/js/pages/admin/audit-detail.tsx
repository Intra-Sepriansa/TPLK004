import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Shield,
    Clock,
    User,
    MapPin,
    Activity,
    AlertCircle,
    CheckCircle,
    XCircle,
    BookOpen,
    Smartphone,
    Globe,
    Eye,
    Download,
    Share2,
    AlertTriangle,
    ShieldCheck,
    Zap,
    TrendingUp,
    BarChart3,
    Calendar,
    Hash,
    FileText,
    Database,
    Server,
    Cpu,
    HardDrive,
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

export default function AuditDetail({ auditLog, relatedLogs }: PageProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'related'>('overview');
    
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

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-950 dark:via-blue-950 dark:to-indigo-950">

                {/* Floating Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                x: [0, Math.random() * 20 - 10, 0],
                                scale: [1, 1.5, 1],
                                opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 5,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
                    {/* Header with Back Button */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4"
                    >
                        <Link
                            href="/admin/audit"
                            className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 hover:scale-110 transition-all shadow-lg hover:shadow-xl"
                        >
                            <ArrowLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Audit Log Detail
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Event ID: #{auditLog.id}
                            </p>
                        </div>
                    </motion.div>

                    {/* Hero Section with Event Info */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl"
                    >
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '40px 40px'
                            }} />
                        </div>

                        {/* Floating Orbs */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
                                style={{
                                    left: `${i * 40}%`,
                                    top: `${i * 30}%`,
                                }}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    x: [0, 30, 0],
                                    y: [0, -30, 0],
                                }}
                                transition={{
                                    duration: 8 + i * 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}

                        <div className="relative z-10 flex items-start justify-between">
                            <div className="flex items-start gap-6">
                                {/* Event Icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl" />
                                    <div className="relative h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center">
                                        <Icon className="h-10 w-10 text-white" />
                                    </div>
                                </motion.div>

                                {/* Event Details */}
                                <div className="space-y-3">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm">
                                            <Icon className="h-4 w-4" />
                                            {config.label}
                                        </span>
                                    </motion.div>
                                    
                                    <motion.h2
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-3xl font-bold text-white"
                                    >
                                        {auditLog.mahasiswa?.nama || 'System Event'}
                                    </motion.h2>
                                    
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-white/80 text-lg"
                                    >
                                        {auditLog.mahasiswa?.nim || 'Automated Process'}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Timestamp */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-right"
                            >
                                <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                                        <Clock className="h-4 w-4" />
                                        <span>Timestamp</span>
                                    </div>
                                    <div className="text-white font-bold">
                                        {auditLog.created_at}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Tabs Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex gap-2 p-2 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 shadow-lg"
                    >
                        {[
                            { id: 'overview', label: 'Overview', icon: Eye },
                            { id: 'technical', label: 'Technical Details', icon: Server },
                            { id: 'related', label: 'Related Events', icon: TrendingUp },
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 relative px-6 py-3 rounded-xl font-bold transition-all ${
                                        activeTab === tab.id
                                            ? 'text-white'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <TabIcon className="h-5 w-5" />
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </motion.div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Event Message Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 p-8 shadow-xl"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                Event Message
                                            </h3>
                                        </div>
                                        <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                            {auditLog.message}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* User Info */}
                                    {auditLog.mahasiswa && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="relative group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                                            <div className="relative rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 p-6 shadow-lg hover:shadow-2xl transition-all">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h4 className="font-bold text-neutral-900 dark:text-white">User Info</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Name</p>
                                                        <p className="font-bold text-neutral-900 dark:text-white">{auditLog.mahasiswa.nama}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">NIM</p>
                                                        <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300">{auditLog.mahasiswa.nim}</p>
                                                    </div>
                                                    {auditLog.mahasiswa.kelas && (
                                                        <div>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Class</p>
                                                            <p className="text-sm text-neutral-700 dark:text-neutral-300">{auditLog.mahasiswa.kelas}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Course Info */}
                                    {auditLog.session?.course && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="relative group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                                            <div className="relative rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 p-6 shadow-lg hover:shadow-2xl transition-all">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                                        <BookOpen className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h4 className="font-bold text-neutral-900 dark:text-white">Course Info</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Course</p>
                                                        <p className="font-bold text-neutral-900 dark:text-white">{auditLog.session.course.nama}</p>
                                                    </div>
                                                    {auditLog.session.meeting_number && (
                                                        <div>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Meeting</p>
                                                            <p className="text-sm text-neutral-700 dark:text-neutral-300">Pertemuan ke-{auditLog.session.meeting_number}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Event Type */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                                        <div className="relative rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 p-6 shadow-lg hover:shadow-2xl transition-all">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                    <Activity className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="font-bold text-neutral-900 dark:text-white">Event Type</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Type</p>
                                                    <p className="font-bold text-neutral-900 dark:text-white">{config.label}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Event ID</p>
                                                    <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300">#{auditLog.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Security Notice */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 dark:from-red-900/20 dark:to-rose-900/20 p-6 border border-red-200 dark:border-red-800"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">
                                                Security Audit Trail
                                            </h4>
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                This event has been permanently recorded in the security audit trail for monitoring, compliance, and forensic analysis purposes. All audit logs are immutable and tamper-proof.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {activeTab === 'technical' && (
                            <motion.div
                                key="technical"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                            >
                                {/* System Information */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 p-6 shadow-lg space-y-4"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                            <Server className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">System Information</h3>
                                    </div>

                                    {[
                                        { icon: Globe, label: 'IP Address', value: auditLog.ip_address || 'N/A' },
                                        { icon: Smartphone, label: 'User Agent', value: auditLog.user_agent || 'N/A' },
                                        { icon: MapPin, label: 'Location', value: auditLog.location || 'N/A' },
                                        { icon: Cpu, label: 'Device Info', value: auditLog.device_info || 'N/A' },
                                    ].map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                                <item.icon className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{item.label}</p>
                                                <p className="text-sm font-mono text-neutral-900 dark:text-white break-all">{item.value}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Metadata */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 p-6 shadow-lg"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                            <Database className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Metadata</h3>
                                    </div>

                                    <div className="rounded-xl bg-neutral-900 dark:bg-neutral-950 p-4 overflow-auto max-h-96">
                                        <pre className="text-xs text-emerald-400 font-mono">
                                            {JSON.stringify(auditLog.metadata || {}, null, 2)}
                                        </pre>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {activeTab === 'related' && (
                            <motion.div
                                key="related"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                <div className="rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 p-6 shadow-lg">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Related Events</h3>
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
                                                        className="group relative"
                                                    >
                                                        <Link
                                                            href={`/admin/audit/${log.id}`}
                                                            className="block p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-indigo-500/50"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`h-12 w-12 rounded-lg ${relatedConfig.bgColor} flex items-center justify-center`}>
                                                                    <RelatedIcon className={`h-6 w-6 ${relatedConfig.color}`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${relatedConfig.bgColor} ${relatedConfig.color}`}>
                                                                            {relatedConfig.label}
                                                                        </span>
                                                                        <span className="text-xs text-neutral-500">#{log.id}</span>
                                                                    </div>
                                                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-1">{log.message}</p>
                                                                    <p className="text-xs text-neutral-500 mt-1">{log.created_at}</p>
                                                                </div>
                                                                <ArrowLeft className="h-5 w-5 text-neutral-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Activity className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                                            <p className="text-neutral-500 dark:text-neutral-400">No related events found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex gap-4"
                    >
                        <button className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                            <Download className="h-5 w-5" />
                            Export Report
                        </button>
                        <button className="flex-1 px-6 py-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                            <Share2 className="h-5 w-5" />
                            Share
                        </button>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
