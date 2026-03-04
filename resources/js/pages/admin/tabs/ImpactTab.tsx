import { motion } from 'framer-motion';
import {
    AlertTriangle, Server, Users, Database, Globe,
    TrendingDown, ShieldAlert, FileWarning, DollarSign, Activity
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
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
};

const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export default function ImpactTab({ riskAssessment }: Props) {
    const isCritical = riskAssessment.overall_risk >= 75;
    const isHigh = riskAssessment.overall_risk >= 50 && riskAssessment.overall_risk < 75;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Risk Radar / Overview */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 relative overflow-hidden rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl p-6 md:p-8"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`h-12 w-12 rounded-2xl text-white flex items-center justify-center shadow-lg ${isCritical ? 'bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-500/30' :
                            isHigh ? 'bg-gradient-to-br from-orange-400 to-amber-600 shadow-orange-500/30' :
                                'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-amber-500/30'
                            }`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Business Impact Assessment</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Quantitative risk profiling</p>
                        </div>
                    </div>

                    <div className="relative mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Overall Risk Severity</span>
                            <span className={`text-2xl font-black ${isCritical ? 'text-rose-600 dark:text-rose-400' :
                                isHigh ? 'text-orange-600 dark:text-orange-400' :
                                    'text-amber-600 dark:text-amber-400'
                                }`}>
                                {riskAssessment.overall_risk}%
                            </span>
                        </div>
                        <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${riskAssessment.overall_risk}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full ${isCritical ? 'bg-rose-500' :
                                    isHigh ? 'bg-orange-500' :
                                        'bg-amber-500'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">Identified Risk Factors</h4>
                        {riskAssessment.risk_factors && riskAssessment.risk_factors.length > 0 ? (
                            riskAssessment.risk_factors.map((factor, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/10 dark:border-white/5">
                                    <ShieldAlert className={`w-5 h-5 shrink-0 ${factor.severity === 'critical' ? 'text-rose-500' : 'text-orange-500'
                                        }`} />
                                    <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                                        {factor.factor}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                <Activity className="w-5 h-5 shrink-0" />
                                <span className="text-sm font-medium">No immediate critical risk factors identified.</span>
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
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 px-2">Potential Blast Radius</h3>

                    {[
                        { title: 'Data Integrity', icon: Database, risk: isCritical ? 'High' : 'Low', color: isCritical ? 'rose' : 'emerald' },
                        { title: 'System Availability', icon: Server, risk: 'Low', color: 'emerald' },
                        { title: 'User Trust & Compliance', icon: Users, risk: isHigh || isCritical ? 'Medium' : 'Low', color: isHigh || isCritical ? 'orange' : 'emerald' },
                        { title: 'Financial/Reputation', icon: DollarSign, risk: 'Low', color: 'emerald' },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className={`flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md border shadow-sm ${item.color === 'rose' ? 'border-rose-500/30 dark:border-rose-500/20 shadow-rose-500/10' :
                                item.color === 'orange' ? 'border-orange-500/30 dark:border-orange-500/20 shadow-orange-500/10' :
                                    'border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/10'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-neutral-900 dark:text-white">{item.title}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-400`}>
                                {item.risk} Risk
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
