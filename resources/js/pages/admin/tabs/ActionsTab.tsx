import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    Lock,
    Mail,
    RefreshCw,
    Save,
    Send,
    ShieldAlert,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { ActionLog, AuditLog } from '../audit-detail';

interface Props {
    auditLog: AuditLog;
    actionHistory: ActionLog[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export default function ActionsTab({ auditLog, actionHistory }: Props) {
    const [actionType, setActionType] = useState('send_warning');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(
            `/admin/audit/${auditLog.id}/action`,
            {
                action_type: actionType,
                description: note,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setNote('');
                },
            },
        );
    };

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Action Panel */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
            >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Zap className="h-32 w-32" />
                </div>

                <h3 className="relative z-10 mb-6 text-xl font-bold text-neutral-900 dark:text-white">
                    Incident Response
                </h3>

                <form
                    onSubmit={handleSubmit}
                    className="relative z-10 space-y-6"
                >
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Select Action
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                {
                                    id: 'resolve',
                                    label: 'Mark as Resolved',
                                    icon: CheckCircle,
                                    color: 'emerald',
                                },
                                {
                                    id: 'escalate',
                                    label: 'Escalate & Investigate',
                                    icon: AlertTriangle,
                                    color: 'amber',
                                },
                                {
                                    id: 'send_warning',
                                    label: 'Send Warning Email',
                                    icon: Mail,
                                    color: 'blue',
                                },
                                {
                                    id: 'flag_device',
                                    label: 'Flag Device/IP',
                                    icon: ShieldAlert,
                                    color: 'purple',
                                },
                                {
                                    id: 'void_attendance',
                                    label: 'Void Attendance',
                                    icon: RefreshCw,
                                    color: 'orange',
                                },
                                {
                                    id: 'block_user',
                                    label: 'Temp Block User',
                                    icon: Lock,
                                    color: 'rose',
                                },
                            ].map((opt) => (
                                <label
                                    key={opt.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                                        actionType === opt.id
                                            ? `bg-${opt.color}-50 dark:bg-${opt.color}-900/20 border-${opt.color}-500 shadow-md`
                                            : 'border-transparent bg-white/50 hover:border-neutral-300 dark:bg-neutral-800/50 dark:hover:border-neutral-600'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="actionType"
                                        value={opt.id}
                                        checked={actionType === opt.id}
                                        onChange={(e) =>
                                            setActionType(e.target.value)
                                        }
                                        className="sr-only"
                                    />
                                    <opt.icon
                                        className={`h-5 w-5 ${actionType === opt.id ? `text-${opt.color}-600 dark:text-${opt.color}-400` : 'text-neutral-400'}`}
                                    />
                                    <span
                                        className={`font-semibold ${actionType === opt.id ? `text-${opt.color}-900 dark:text-${opt.color}-300` : 'text-neutral-700 dark:text-neutral-300'}`}
                                    >
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex justify-between text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Resolution Notes
                            <span className="font-normal text-neutral-400">
                                Optional
                            </span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-32 w-full resize-none rounded-xl border border-neutral-200 bg-white/50 p-4 text-sm shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                            placeholder="Add your investigation notes, resolution steps, or reason for action here..."
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-5 w-5" /> Execute Action
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Action History Logging */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Action History (Audit Trail)
                </h3>

                {actionHistory.length > 0 ? (
                    <div className="space-y-4">
                        {actionHistory.map((action, idx) => (
                            <motion.div
                                key={action.id || idx}
                                variants={itemVariants}
                                className="flex items-start gap-4 rounded-2xl border border-white/20 bg-white/60 p-5 shadow-md dark:border-white/5 dark:bg-neutral-800/60"
                            >
                                <div className="mt-1 rounded-xl bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="mb-1 flex items-start justify-between">
                                        <h4 className="font-bold text-neutral-900 dark:text-white">
                                            {action.action_type
                                                .replace(/_/g, ' ')
                                                .toUpperCase()}
                                        </h4>
                                        <span className="font-mono text-xs text-neutral-500">
                                            {new Date(
                                                action.created_at,
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        Executed by{' '}
                                        <span className="font-semibold">
                                            {action.actor?.name || 'Admin'}
                                        </span>
                                    </p>
                                    {action.description && (
                                        <div className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-700 italic dark:bg-neutral-900/50 dark:text-neutral-300">
                                            "{action.description}"
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white/40 p-10 text-center backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/40">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                            <Save className="h-8 w-8" />
                        </div>
                        <h4 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">
                            No Actions Yet
                        </h4>
                        <p className="max-w-sm text-sm text-neutral-500">
                            There are no administrative actions recorded for
                            this audit event yet.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
