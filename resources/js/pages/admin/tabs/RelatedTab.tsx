import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Layers, ShieldAlert } from 'lucide-react';
import { RelatedEvent } from '../audit-detail';

interface Props {
    relatedEvents: RelatedEvent[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
};

export default function RelatedTab({ relatedEvents }: Props) {
    return (
        <div className="space-y-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                        Related Events Correlation
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Events from the same user within 7 days
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <Layers className="h-4 w-4" />
                    <span>{relatedEvents.length} Events Detected</span>
                </div>
            </div>

            {relatedEvents && relatedEvents.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                    {relatedEvents.map((event) => (
                        <motion.div key={event.id} variants={itemVariants}>
                            <Link
                                href={`/admin/audit/${event.id}`}
                                className="group block rounded-3xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:shadow-indigo-500/10 dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`rounded-xl border p-2 ${
                                                event.severity === 'critical'
                                                    ? 'border-rose-200 bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                                                    : event.severity === 'high'
                                                      ? 'border-orange-200 bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                                                      : 'border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-800'
                                            }`}
                                        >
                                            <ShieldAlert className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="mb-0.5 block text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                                Event #{event.id}
                                            </span>
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {event.event_type.replace(
                                                    /_/g,
                                                    ' ',
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="rounded-lg bg-white/50 px-2 py-1 font-mono text-xs text-neutral-500 dark:bg-black/20">
                                        {new Date(
                                            event.created_at,
                                        ).toLocaleDateString('id-ID', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>

                                <p className="mb-4 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    {event.message}
                                </p>

                                <div className="flex items-center justify-between border-t border-neutral-200/50 pt-3 dark:border-neutral-800/50">
                                    <span
                                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                            event.severity === 'critical'
                                                ? 'bg-rose-500/10 text-rose-600'
                                                : event.severity === 'high'
                                                  ? 'bg-orange-500/10 text-orange-600'
                                                  : 'bg-slate-500/10 text-slate-600'
                                        }`}
                                    >
                                        {event.severity
                                            ? event.severity.toUpperCase()
                                            : 'UNKNOWN'}
                                    </span>
                                    <div className="flex translate-x-2 transform items-center text-sm font-medium text-indigo-600 opacity-0 transition-opacity group-hover:translate-x-0 group-hover:opacity-100 dark:text-indigo-400">
                                        <span>View Detail</span>
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/20 py-16 text-center backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/20">
                    <Activity className="mx-auto mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-700" />
                    <h4 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">
                        No Correlated Events
                    </h4>
                    <p className="mx-auto max-w-sm text-neutral-500 dark:text-neutral-400">
                        No active threats or related events detected for this
                        user or IP in the last 7 days.
                    </p>
                </div>
            )}
        </div>
    );
}
