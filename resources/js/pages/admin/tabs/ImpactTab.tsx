import { motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    Database,
    DollarSign,
    Server,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { RiskAssessment } from '../audit-detail';

interface Props {
    riskAssessment: RiskAssessment;
}

const cardVariants: any = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
};

const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export default function ImpactTab({ riskAssessment }: Props) {
    const isCritical = riskAssessment.overall_risk >= 75;
    const isHigh =
        riskAssessment.overall_risk >= 50 && riskAssessment.overall_risk < 75;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Risk Radar / Overview */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative flex-1 overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl md:p-8 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-8 flex items-center gap-4">
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${
                                isCritical
                                    ? 'bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-500/30'
                                    : isHigh
                                      ? 'bg-gradient-to-br from-orange-400 to-amber-600 shadow-orange-500/30'
                                      : 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-amber-500/30'
                            }`}
                        >
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                Business Impact Assessment
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Quantitative risk profiling
                            </p>
                        </div>
                    </div>

                    <div className="relative mb-8">
                        <div className="mb-2 flex items-end justify-between">
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                Overall Risk Severity
                            </span>
                            <span
                                className={`text-2xl font-black ${
                                    isCritical
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : isHigh
                                          ? 'text-orange-600 dark:text-orange-400'
                                          : 'text-amber-600 dark:text-amber-400'
                                }`}
                            >
                                {riskAssessment.overall_risk}%
                            </span>
                        </div>
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${riskAssessment.overall_risk}%`,
                                }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full ${
                                    isCritical
                                        ? 'bg-rose-500'
                                        : isHigh
                                          ? 'bg-orange-500'
                                          : 'bg-amber-500'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                            Identified Risk Factors
                        </h4>
                        {riskAssessment.risk_factors &&
                        riskAssessment.risk_factors.length > 0 ? (
                            riskAssessment.risk_factors.map((factor, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/50 p-3 dark:border-white/5 dark:bg-black/20"
                                >
                                    <ShieldAlert
                                        className={`h-5 w-5 shrink-0 ${
                                            factor.severity === 'critical'
                                                ? 'text-rose-500'
                                                : 'text-orange-500'
                                        }`}
                                    />
                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        {factor.factor}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <Activity className="h-5 w-5 shrink-0" />
                                <span className="text-sm font-medium">
                                    No immediate critical risk factors
                                    identified.
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* System Impact Blast Radius */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 space-y-4"
                >
                    <h3 className="mb-4 px-2 text-lg font-bold text-neutral-900 dark:text-white">
                        Potential Blast Radius
                    </h3>

                    {[
                        {
                            title: 'Data Integrity',
                            icon: Database,
                            risk: isCritical ? 'High' : 'Low',
                            color: isCritical ? 'rose' : 'emerald',
                        },
                        {
                            title: 'System Availability',
                            icon: Server,
                            risk: 'Low',
                            color: 'emerald',
                        },
                        {
                            title: 'User Trust & Compliance',
                            icon: Users,
                            risk: isHigh || isCritical ? 'Medium' : 'Low',
                            color: isHigh || isCritical ? 'orange' : 'emerald',
                        },
                        {
                            title: 'Financial/Reputation',
                            icon: DollarSign,
                            risk: 'Low',
                            color: 'emerald',
                        },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className={`flex items-center justify-between rounded-2xl border bg-white/40 p-4 shadow-sm backdrop-blur-md dark:bg-neutral-900/40 ${
                                item.color === 'rose'
                                    ? 'border-rose-500/30 shadow-rose-500/10 dark:border-rose-500/20'
                                    : item.color === 'orange'
                                      ? 'border-orange-500/30 shadow-orange-500/10 dark:border-orange-500/20'
                                      : 'border-emerald-500/30 shadow-emerald-500/10 dark:border-emerald-500/20'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`rounded-xl p-2 bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400`}
                                >
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <span className="font-semibold text-neutral-900 dark:text-white">
                                    {item.title}
                                </span>
                            </div>
                            <span
                                className={`rounded-lg px-3 py-1 text-xs font-bold tracking-wider uppercase bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-400`}
                            >
                                {item.risk} Risk
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
