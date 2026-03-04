import { motion } from 'framer-motion';
import {
    AlertTriangle, ShieldCheck, Activity, Target,
    FileText, User, Smartphone, MapPin, Globe, Clock, Hash
} from 'lucide-react';
import { AuditLog, RiskAssessment, PatternAnalysis } from '../audit-detail';

interface Props {
    auditLog: AuditLog;
    riskAssessment: RiskAssessment;
    patternAnalysis: PatternAnalysis;
}

const cardVariants: any = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: {
        scale: 1.02,
        y: -5,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
    }
};

export default function OverviewTab({ auditLog, riskAssessment, patternAnalysis }: Props) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Security Score Widget */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="relative overflow-hidden rounded-3xl p-6 bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl"
                >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Security Score</p>
                            <h3 className="text-3xl font-black mt-2 text-neutral-900 dark:text-white">
                                {auditLog.security_score}
                                <span className="text-sm text-neutral-400 font-normal">/100</span>
                            </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${auditLog.security_score}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full rounded-full ${auditLog.security_score < 40 ? 'bg-red-500' :
                                auditLog.security_score < 70 ? 'bg-orange-500' : 'bg-emerald-500'
                                }`}
                        />
                    </div>
                </motion.div>

                {/* Threat Level Widget */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="relative overflow-hidden rounded-3xl p-6 bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl"
                >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/20 blur-2xl rounded-full" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Threat Level</p>
                            <h3 className="text-2xl font-black mt-2 text-neutral-900 dark:text-white capitalize">
                                {auditLog.threat_level}
                            </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-4 flex items-center gap-1">
                        <Activity className="h-4 w-4" /> Real-time assessed
                    </p>
                </motion.div>

                {/* Likelihood Widget */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="relative overflow-hidden rounded-3xl p-6 bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl"
                >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Likelihood</p>
                            <h3 className="text-3xl font-black mt-2 text-neutral-900 dark:text-white">
                                {riskAssessment.likelihood}%
                            </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Target className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${riskAssessment.likelihood}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="h-full rounded-full bg-purple-500"
                        />
                    </div>
                </motion.div>

                {/* Impact Widget */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="relative overflow-hidden rounded-3xl p-6 bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl"
                >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/20 blur-2xl rounded-full" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Impact Score</p>
                            <h3 className="text-3xl font-black mt-2 text-neutral-900 dark:text-white">
                                {riskAssessment.impact}/100
                            </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <FileText className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${riskAssessment.impact}%` }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="h-full rounded-full bg-amber-500"
                        />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event Details */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl p-6"
                >
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Event Details</h3>
                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 font-mono text-sm text-neutral-700 dark:text-neutral-300">
                        {auditLog.message}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/30 dark:bg-white/5">
                            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">User</p>
                                <p className="font-semibold text-neutral-900 dark:text-white">{auditLog.mahasiswa?.nama || 'System'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/30 dark:bg-white/5">
                            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">Timestamp</p>
                                <p className="font-semibold text-neutral-900 dark:text-white">{new Date(auditLog.created_at).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/30 dark:bg-white/5">
                            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">Location</p>
                                <p className="font-semibold text-neutral-900 dark:text-white">{auditLog.network_info?.location || auditLog.location || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/30 dark:bg-white/5">
                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">IP Address</p>
                                <p className="font-semibold text-neutral-900 dark:text-white">{auditLog.network_info?.ip_address || auditLog.ip_address || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Pattern Match */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl p-6"
                >
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Pattern Match</h3>
                    <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-neutral-200 dark:text-neutral-800" />
                            <motion.circle
                                cx="50" cy="50" r="45"
                                fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                                className="text-indigo-500"
                                initial={{ strokeDasharray: "0 283" }}
                                animate={{ strokeDasharray: `${(patternAnalysis.pattern_match / 100) * 283} 283` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black text-neutral-900 dark:text-white">{patternAnalysis.pattern_match}%</span>
                            <span className="text-[10px] text-neutral-500">Match</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/50 dark:bg-black/20">
                            <span className="text-sm text-neutral-500">Pattern ID</span>
                            <span className="text-sm font-mono font-semibold text-neutral-900 dark:text-white">{patternAnalysis.pattern_id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/50 dark:bg-black/20">
                            <span className="text-sm text-neutral-500">Similar Incidents</span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">{patternAnalysis.similar_incidents} / 30d</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
