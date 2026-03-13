import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Layers,
    MapPin,
    Share2,
    Terminal,
    TrendingUp,
    XCircle,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ActionsTab from './tabs/ActionsTab';
import ForensicsTab from './tabs/ForensicsTab';
import ImpactTab from './tabs/ImpactTab';
import OverviewTab from './tabs/OverviewTab';
import RelatedTab from './tabs/RelatedTab';
import TimelineTab from './tabs/TimelineTab';

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
    const [securityScore, setSecurityScore] = useState(
        auditLog.security_score ?? 50,
    );
    const [threatLevel, setThreatLevel] = useState(
        auditLog.threat_level ?? 'medium',
    );
    const [status, setStatus] = useState(auditLog.status ?? 'open');
    const [relatedEvents, setRelatedEvents] = useState(
        initialRelatedEvents || [],
    );
    const [actionHistory, setActionHistory] = useState(
        initialActionHistory || [],
    );

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel(`security-audit.${auditLog.id}`);

        channel.listen('.SecurityEventUpdated', (event: any) => {
            if (event.newScore !== undefined) setSecurityScore(event.newScore);
            if (event.newThreatLevel !== undefined)
                setThreatLevel(event.newThreatLevel);
            // Optionally toast success
        });

        channel.listen('.RelatedEventDetected', (event: any) => {
            setRelatedEvents((prev) => [event.newEvent, ...prev]);
        });

        channel.listen('.ActionExecuted', (event: any) => {
            setActionHistory((prev) => [event.action, ...prev]);
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
        token_duplicate: {
            label: 'Token Duplikat',
            color: 'red',
            icon: AlertTriangle,
        },
        geofence_violation: {
            label: 'Pelanggaran Zona',
            color: 'rose',
            icon: MapPin,
        },
        login_failed: { label: 'Login Gagal', color: 'orange', icon: XCircle },
        login_success: {
            label: 'Login Berhasil',
            color: 'emerald',
            icon: CheckCircle,
        },
        suspicious_activity: {
            label: 'Aktivitas Mencurigakan',
            color: 'purple',
            icon: AlertCircle,
        },
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
                className="min-h-screen space-y-4 p-4 sm:space-y-6 sm:p-6"
            >
                {/* Header Section */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
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
                    <div className="absolute -top-20 -right-20 z-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 z-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <Link
                            href="/admin/audit"
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
                            Audit
                        </Link>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                                {/* Raw icon without background container exactly per user instruction */}
                                <IconComponent className="h-20 w-20 flex-shrink-0 text-white drop-shadow-2xl sm:h-24 sm:w-24" />

                                <div>
                                    <h1 className="text-2xl leading-tight font-bold text-white sm:text-3xl">
                                        {auditLog.mahasiswa?.nama ||
                                            'System Event'}
                                    </h1>
                                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/70">
                                        <span className="rounded bg-white/10 px-2 py-0.5 font-mono">
                                            {auditLog.mahasiswa?.nim ||
                                                'SYSTEM'}
                                        </span>
                                        <span>•</span>
                                        <span>{auditLog.event_type}</span>
                                        <span>•</span>
                                        <span className="opacity-90">
                                            {new Date(
                                                auditLog.created_at,
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="hidden gap-2 sm:flex"
                            >
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-black/20"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-black/20"
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span>Share</span>
                                </button>
                            </motion.div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                                Security Score: {securityScore}/100
                            </div>
                            <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white uppercase backdrop-blur-md">
                                {threatLevel === 'critical'
                                    ? '🔴'
                                    : threatLevel === 'high'
                                      ? '🟠'
                                      : threatLevel === 'medium'
                                        ? '🟡'
                                        : '🟢'}
                                Threat Level: {threatLevel}
                            </div>
                            <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white uppercase backdrop-blur-md">
                                Status: {status}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mobile Actions Header */}
                <div className="flex gap-2 sm:hidden">
                    <button
                        onClick={handleExport}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                    </button>
                </div>

                {/* Navigation Tabs */}
                <motion.div
                    variants={itemVariants}
                    className="scrollbar-hide -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
                >
                    <div className="flex w-fit gap-1 rounded-2xl border border-neutral-200/50 bg-white/50 p-1 backdrop-blur-xl dark:border-neutral-800/50 dark:bg-neutral-900/50">
                        {[
                            { id: 'overview', label: 'Overview', icon: Eye },
                            { id: 'timeline', label: 'Timeline', icon: Clock },
                            {
                                id: 'forensics',
                                label: 'Forensics',
                                icon: Terminal,
                            },
                            { id: 'impact', label: 'Impact', icon: TrendingUp },
                            { id: 'actions', label: 'Actions', icon: Zap },
                            { id: 'related', label: 'Related', icon: Layers },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all sm:px-6 sm:text-sm ${
                                    activeTab === tab.id
                                        ? 'text-indigo-700 dark:text-indigo-400'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeAuditTab"
                                        className="absolute inset-0 rounded-xl border border-neutral-200/50 bg-white shadow-sm dark:border-neutral-700/50 dark:bg-neutral-800"
                                        transition={{
                                            type: 'spring',
                                            bounce: 0.2,
                                            duration: 0.6,
                                        }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <tab.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {tab.label}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Content Area */}
                <div className="min-h-[400px] rounded-3xl border border-neutral-200 bg-white/60 p-4 backdrop-blur-xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/60">
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
                            <TimelineTab key="timeline" auditLog={auditLog} />
                        )}
                        {activeTab === 'forensics' && (
                            <ForensicsTab key="forensics" auditLog={auditLog} />
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
