import { motion } from 'framer-motion';
import {
    Activity,
    Cpu,
    Database,
    Fingerprint,
    Globe,
    Network,
    Smartphone,
    Terminal,
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
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
};

export default function ForensicsTab({ auditLog }: Props) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row">
                {/* Network Intel */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative flex-1 overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl md:p-8 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Network className="h-32 w-32" />
                    </div>

                    <div className="relative z-10 mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                            <Globe className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                            Network Intel
                        </h3>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/50 p-4 dark:border-white/5 dark:bg-black/20">
                            <div className="mt-1 flex-shrink-0 text-blue-500">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-neutral-500">
                                    IP Address & Proxy Status
                                </p>
                                <p className="mb-2 font-mono font-semibold text-neutral-900 dark:text-white">
                                    {auditLog.network_info?.ip_address ||
                                        auditLog.ip_address ||
                                        'Unknown'}
                                </p>
                                <div className="flex gap-2">
                                    <span className="rounded bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-600 uppercase">
                                        VPN/Proxy Unknown
                                    </span>
                                    <span className="rounded bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 uppercase">
                                        ISP Detected
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/50 p-4 dark:border-white/5 dark:bg-black/20">
                            <div className="mt-1 flex-shrink-0 text-indigo-500">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-neutral-500">
                                    Geolocation Data
                                </p>
                                <p className="font-semibold text-neutral-900 dark:text-white">
                                    {auditLog.network_info?.location ||
                                        auditLog.location ||
                                        'Unknown'}
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
                    className="relative flex-1 overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl md:p-8 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Cpu className="h-32 w-32" />
                    </div>

                    <div className="relative z-10 mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                            <Smartphone className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                            Device Intel
                        </h3>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/50 p-4 dark:border-white/5 dark:bg-black/20">
                            <div className="mt-1 flex-shrink-0 text-emerald-500">
                                <Terminal className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-neutral-500">
                                    User Agent & OS
                                </p>
                                <p className="line-clamp-2 font-mono text-xs break-all text-neutral-900 dark:text-white">
                                    {auditLog.user_agent ||
                                        auditLog.device_info?.browser ||
                                        'Unknown'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/50 p-4 dark:border-white/5 dark:bg-black/20">
                            <div className="mt-1 flex-shrink-0 text-teal-500">
                                <Fingerprint className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-neutral-500">
                                    Device Fingerprint Match
                                </p>
                                <p className="font-semibold text-neutral-900 dark:text-white">
                                    {auditLog.device_info?.device_id
                                        ? 'Known Device'
                                        : 'Unrecognized Device Pattern'}
                                </p>
                                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                    {auditLog.device_info?.device_id ||
                                        'Generating footprint...'}
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
                className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
            >
                <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-indigo-400" />
                        <h4 className="font-mono text-sm tracking-wider text-white uppercase">
                            Raw Request Payload
                        </h4>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-500" />
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl bg-black/50 p-4 font-mono text-xs leading-loose text-emerald-400/80">
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
