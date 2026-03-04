import { motion } from 'framer-motion';
import { Layers, Activity, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { RelatedEvent } from '../audit-detail';

interface Props {
    relatedEvents: RelatedEvent[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
};

export default function RelatedTab({ relatedEvents }: Props) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Related Events Correlation</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Events from the same user within 7 days</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>{relatedEvents.length} Events Detected</span>
                </div>
            </div>

            {relatedEvents && relatedEvents.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {relatedEvents.map((event) => (
                        <motion.div key={event.id} variants={itemVariants}>
                            <Link
                                href={`/admin/audit/${event.id}`}
                                className="group block p-5 rounded-3xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl border ${event.severity === 'critical' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 border-rose-200' :
                                                event.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 border-orange-200' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200'
                                            }`}>
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
                                                Event #{event.id}
                                            </span>
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {event.event_type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono text-neutral-500 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-lg">
                                        {new Date(event.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                                    {event.message}
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-neutral-200/50 dark:border-neutral-800/50">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${event.severity === 'critical' ? 'bg-rose-500/10 text-rose-600' :
                                            event.severity === 'high' ? 'bg-orange-500/10 text-orange-600' :
                                                'bg-slate-500/10 text-slate-600'
                                        }`}>
                                        {event.severity ? event.severity.toUpperCase() : 'UNKNOWN'}
                                    </span>
                                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        <span>View Detail</span>
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-16 rounded-3xl bg-white/20 dark:bg-neutral-900/20 border border-dashed border-neutral-300 dark:border-neutral-700 backdrop-blur-sm">
                    <Activity className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No Correlated Events</h4>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                        No active threats or related events detected for this user or IP in the last 7 days.
                    </p>
                </div>
            )}
        </div>
    );
}
