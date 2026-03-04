import { motion } from 'framer-motion';
import {
    Clock, Smartphone, Globe, Activity, ShieldAlert, Zap, Search, AlertCircle, Fingerprint
} from 'lucide-react';
import { AuditLog } from '../audit-detail';

interface Props {
    auditLog: AuditLog;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

export default function TimelineTab({ auditLog }: Props) {
    // Generate a simulated timeline block for the demonstration since we only have one log event
    // In a real scenario, this would be fueled by chronological breakdown of user behavior prior/during/after the event

    const timelineEvents = [
        {
            time: new Date(new Date(auditLog.created_at).getTime() - 1000 * 60 * 5).toLocaleTimeString('id-ID'),
            title: 'Initial Connection Established',
            desc: `IP: ${auditLog.network_info?.ip_address || auditLog.ip_address || 'Unknown'} connected via ${auditLog.network_info?.connection_type || 'Unknown'}`,
            icon: Globe,
            color: 'bg-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
        },
        {
            time: new Date(new Date(auditLog.created_at).getTime() - 1000 * 60 * 2).toLocaleTimeString('id-ID'),
            title: 'Device Fingerprint Registered',
            desc: `Device: ${auditLog.device_info?.device_name || auditLog.user_agent || 'Unknown'} (${auditLog.device_info?.os || 'Unknown'})`,
            icon: Fingerprint,
            color: 'bg-indigo-500',
            bg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
        },
        {
            time: new Date(auditLog.created_at).toLocaleTimeString('id-ID'),
            title: 'Trigger Event: ' + auditLog.event_type.replace(/_/g, ' ').toUpperCase(),
            desc: auditLog.message,
            icon: Zap,
            color: 'bg-rose-500',
            bg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
            active: true
        },
        {
            time: new Date(new Date(auditLog.created_at).getTime() + 1000).toLocaleTimeString('id-ID'),
            title: 'Automated Response Triggered',
            desc: `Risk assessed as ${auditLog.threat_level}. Status set to ${auditLog.status}.`,
            icon: ShieldAlert,
            color: 'bg-amber-500',
            bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
        }
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Attack Chain Analysis</h3>
                    <p className="text-sm text-neutral-500">Chronological breakdown of the event</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/50 dark:bg-neutral-800/50 backdrop-blur-md border border-white/20 dark:border-white/5 text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-neutral-700 dark:text-neutral-300">Duration: ~5m 01s</span>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative"
            >
                {/* Vertical Line */}
                <div className="absolute left-6 md:left-24 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />

                <div className="space-y-8">
                    {timelineEvents.map((evt, idx) => (
                        <motion.div key={idx} variants={itemVariants} className="relative flex items-start gap-6 md:gap-8 group">

                            {/* Time (Desktop) */}
                            <div className="hidden md:block w-16 text-right pt-2 shrink-0">
                                <span className="text-xs font-mono font-medium text-neutral-500">{evt.time}</span>
                            </div>

                            {/* Node */}
                            <div className="relative z-10 pt-1 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-2xl ${evt.bg} flex items-center justify-center shadow-lg border-2 ${evt.active ? 'border-rose-500 animate-pulse' : 'border-white dark:border-neutral-900'}`}>
                                    <evt.icon className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className={`flex-1 p-6 rounded-3xl border backdrop-blur-xl transition-all ${evt.active
                                    ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                                    : 'bg-white/40 dark:bg-neutral-900/40 border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-neutral-800/60 shadow-xl'
                                }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="md:hidden text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">{evt.time}</span>
                                </div>
                                <h4 className={`text-lg font-bold mb-1 ${evt.active ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}>
                                    {evt.title}
                                </h4>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                    {evt.desc}
                                </p>
                            </div>

                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
