import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    ArrowLeft, Shield, Clock,
    AlertCircle, AlertTriangle, ShieldCheck, Eye,
    FileText, Zap, Flag, Lock, Unlock, Mail, Bell, Activity,
    MapPin, XCircle, CheckCircle, Download, Share2, Terminal, TrendingUp, Layers
} from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import TimelineTab from './tabs/TimelineTab';
import ForensicsTab from './tabs/ForensicsTab';
import ImpactTab from './tabs/ImpactTab';
import ActionsTab from './tabs/ActionsTab';
import RelatedTab from './tabs/RelatedTab';

export interface AuditLog {
    id: number;
    event_type: string;
    message: string;
    created_at: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    security_score: number;
    threat_level: 'critical' | 'high' | 'medium' | 'low' | 'safe';
    mahasiswa?: {
        id: number;
        nama: string;
        nim: string;
        email: string;
        kelas: string;
    } | null;
    session?: {
        id: number;
        meeting_number: number;
        course: {
            nama: string;
            kode: string;
            dosen: { nama: string };
        };
    } | null;
    device_info?: {
        device_id: string;
        device_name: string;
        os: string;
        browser: string;
        screen_resolution: string;
        timezone: string;
        language: string;
    } | null;
    network_info?: {
        ip_address: string;
        location: string;
        isp: string;
        connection_type: string;
    } | null;
    metadata?: any;
    ip_address?: string;
    user_agent?: string;
    location?: string;
}

export interface RelatedEvent {
    id: number;
    event_type: string;
    message: string;
    created_at: string;
    severity: string;
    mahasiswa?: any;
}

export interface ActionLog {
    id: number;
    action_type: string;
    description: string;
    actor: {
        name: string;
    };
    created_at: string;
}

export interface RiskAssessment {
    likelihood: number;
    impact: number;
    overall_risk: number;
    risk_factors: Array<{ factor: string; severity: string }>;
}

export interface PatternAnalysis {
    pattern_match: number;
    pattern_id: string;
    similar_incidents: number;
}

interface PageProps {
    auditLog: AuditLog;
    relatedEvents: RelatedEvent[];
    actionHistory: ActionLog[];
    riskAssessment: RiskAssessment;
    patternAnalysis: PatternAnalysis;
}

// Animation variants
const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: any = {
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
};

export default function AuditDetail({
    auditLog,
    relatedEvents: initialRelatedEvents,
    actionHistory: initialActionHistory,
    riskAssessment,
    patternAnalysis,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<
        'overview' | 'timeline' | 'forensics' | 'impact' | 'actions' | 'related'
    >('overview');

    // Realtime States
    const [securityScore, setSecurityScore] = useState(auditLog.security_score ?? 50);
    const [threatLevel, setThreatLevel] = useState(auditLog.threat_level ?? 'medium');
    const [status, setStatus] = useState(auditLog.status ?? 'open');
    const [relatedEvents, setRelatedEvents] = useState(initialRelatedEvents || []);
    const [actionHistory, setActionHistory] = useState(initialActionHistory || []);

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel(`security-audit.${auditLog.id}`);

        channel.listen('.SecurityEventUpdated', (event: any) => {
            if (event.newScore !== undefined) setSecurityScore(event.newScore);
            if (event.newThreatLevel !== undefined) setThreatLevel(event.newThreatLevel);
            // Optionally toast success
        });

        channel.listen('.RelatedEventDetected', (event: any) => {
            setRelatedEvents(prev => [event.newEvent, ...prev]);
        });

        channel.listen('.ActionExecuted', (event: any) => {
            setActionHistory(prev => [event.action, ...prev]);
            if (event.newStatus) setStatus(event.newStatus);
        });

        return () => {
            channel.stopListening('.SecurityEventUpdated');
            channel.stopListening('.RelatedEventDetected');
            channel.stopListening('.ActionExecuted');
            window.Echo.leaveChannel(`security-audit.${auditLog.id}`);
        };
    }, [auditLog.id]);

    // Event type configuration
    const eventTypeConfig: Record<string, any> = {
        token_expired: { label: 'Token Expired', color: 'amber', icon: Clock },
        token_duplicate: { label: 'Token Duplikat', color: 'red', icon: AlertTriangle },
        geofence_violation: { label: 'Pelanggaran Zona', color: 'rose', icon: MapPin },
        login_failed: { label: 'Login Gagal', color: 'orange', icon: XCircle },
        login_success: { label: 'Login Berhasil', color: 'emerald', icon: CheckCircle },
        suspicious_activity: { label: 'Aktivitas Mencurigakan', color: 'purple', icon: AlertCircle },
    };

    const config = eventTypeConfig[auditLog.event_type] || {
        label: auditLog.event_type,
        color: 'slate',
        icon: Activity,
    };

    const IconComponent = config.icon;

    const handleExport = () => {
        window.open(`/admin/audit/${auditLog.id}/export`, '_blank');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Tautan berhasil disalin');
    };

    return (
        <AppLayout>
            <Head title={`Audit Log #${auditLog.id}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen"
            >
                {/* Header Section */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
                >
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
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl z-0" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl z-0" />

                    <div className="relative">
                        <Link
                            href="/admin/audit"
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Audit
                        </Link>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                                {/* Raw icon without background container exactly per user instruction */}
                                <IconComponent className="h-20 w-20 sm:h-24 sm:w-24 text-white flex-shrink-0 drop-shadow-2xl" />

                                <div>
                                    <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                                        {auditLog.mahasiswa?.nama || 'System Event'}
                                    </h1>
                                    <p className="mt-1 text-sm text-white/70 flex flex-wrap items-center gap-2">
                                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded">
                                            {auditLog.mahasiswa?.nim || 'SYSTEM'}
                                        </span>
                                        <span>•</span>
                                        <span>{auditLog.event_type}</span>
                                        <span>•</span>
                                        <span className="opacity-90">
                                            {new Date(auditLog.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="hidden sm:flex gap-2"
                            >
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-black/20"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-black/20"
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span>Share</span>
                                </button>
                            </motion.div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold">
                                Security Score: {securityScore}/100
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold uppercase flex items-center gap-1">
                                {threatLevel === 'critical' ? '🔴' : threatLevel === 'high' ? '🟠' : threatLevel === 'medium' ? '🟡' : '🟢'}
                                Threat Level: {threatLevel}
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold uppercase flex items-center gap-1">
                                Status: {status}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mobile Actions Header */}
                <div className="sm:hidden flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold"
                    >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                    </button>
                </div>

                {/* Navigation Tabs */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0"
                >
                    <div className="flex p-1 gap-1 bg-white/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 w-fit">
                        {[
                            { id: 'overview', label: 'Overview', icon: Eye },
                            { id: 'timeline', label: 'Timeline', icon: Clock },
                            { id: 'forensics', label: 'Forensics', icon: Terminal },
                            { id: 'impact', label: 'Impact', icon: TrendingUp },
                            { id: 'actions', label: 'Actions', icon: Zap },
                            { id: 'related', label: 'Related', icon: Layers },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                    ? 'text-indigo-700 dark:text-indigo-400'
                                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeAuditTab"
                                        className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <tab.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Content Area */}
                <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-6 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <OverviewTab
                                key="overview"
                                auditLog={auditLog}
                                riskAssessment={riskAssessment}
                                patternAnalysis={patternAnalysis}
                            />
                        )}
                        {activeTab === 'timeline' && (
                            <TimelineTab
                                key="timeline"
                                auditLog={auditLog}
                            />
                        )}
                        {activeTab === 'forensics' && (
                            <ForensicsTab
                                key="forensics"
                                auditLog={auditLog}
                            />
                        )}
                        {activeTab === 'impact' && (
                            <ImpactTab
                                key="impact"
                                riskAssessment={riskAssessment}
                            />
                        )}
                        {activeTab === 'actions' && (
                            <ActionsTab
                                key="actions"
                                auditLog={auditLog}
                                actionHistory={actionHistory}
                            />
                        )}
                        {activeTab === 'related' && (
                            <RelatedTab
                                key="related"
                                relatedEvents={relatedEvents}
                            />
                        )}
                    </AnimatePresence>
                </div>

            </motion.div>
        </AppLayout>
    );
}
