import { motion } from 'framer-motion';
import {
    Terminal, Globe, Smartphone, Fingerprint, Database,
    Zap, Activity, Cpu, Network, Search
} from 'lucide-react';
import { AuditLog } from '../audit-detail';

interface Props {
    auditLog: AuditLog;
}

const cardVariants: any = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
};

export default function ForensicsTab({ auditLog }: Props) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Network Intel */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 relative overflow-hidden rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl p-6 md:p-8"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Network className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Globe className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Network Intel</h3>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/10 dark:border-white/5">
                            <div className="mt-1 flex-shrink-0 text-blue-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 mb-1">IP Address & Proxy Status</p>
                                <p className="font-mono font-semibold text-neutral-900 dark:text-white mb-2">
                                    {auditLog.network_info?.ip_address || auditLog.ip_address || 'Unknown'}
                                </p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 text-[10px] font-bold uppercase">VPN/Proxy Unknown</span>
                                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">ISP Detected</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/10 dark:border-white/5">
                            <div className="mt-1 flex-shrink-0 text-indigo-500">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 mb-1">Geolocation Data</p>
                                <p className="font-semibold text-neutral-900 dark:text-white">
                                    {auditLog.network_info?.location || auditLog.location || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Device Intel */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 relative overflow-hidden rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl p-6 md:p-8"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Cpu className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Smartphone className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Device Intel</h3>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/10 dark:border-white/5">
                            <div className="mt-1 flex-shrink-0 text-emerald-500">
                                <Terminal className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 mb-1">User Agent & OS</p>
                                <p className="font-mono text-xs text-neutral-900 dark:text-white break-all line-clamp-2">
                                    {auditLog.user_agent || auditLog.device_info?.browser || 'Unknown'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/10 dark:border-white/5">
                            <div className="mt-1 flex-shrink-0 text-teal-500">
                                <Fingerprint className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 mb-1">Device Fingerprint Match</p>
                                <p className="font-semibold text-neutral-900 dark:text-white">
                                    {auditLog.device_info?.device_id ? 'Known Device' : 'Unrecognized Device Pattern'}
                                </p>
                                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                    {auditLog.device_info?.device_id || 'Generating footprint...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Raw JSON Dump */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="relative overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl p-6"
            >
                <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-white font-mono text-sm uppercase tracking-wider">Raw Request Payload</h4>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                </div>

                <div className="overflow-x-auto text-xs font-mono text-emerald-400/80 p-4 bg-black/50 rounded-xl leading-loose">
                    {/* Simulated RAW output for the effect of a forensics terminal */}
                    {`[${new Date(auditLog.created_at).toISOString()}] REQUEST_INBOUND
POST /api/v1/attendance
Headers:
  Host: api.unpam.ac.id
  User-Agent: ${auditLog.user_agent || 'Unknown'}
  X-Forwarded-For: ${auditLog.ip_address || 'Unknown'}
  Authorization: Bearer [REDACTED]...
  
Body:
${JSON.stringify(auditLog.metadata, null, 2) || '{ "empty": true }'}

// Analysis Engine Triggered -> Event: [${auditLog.event_type}]
// Threat Level Assigned: [${auditLog.threat_level.toUpperCase()}]
// Base Score Generated: [${auditLog.security_score}]
`}
                </div>
            </motion.div>
        </div>
    );
}
