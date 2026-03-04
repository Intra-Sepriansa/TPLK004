import { motion } from 'framer-motion';
import {
    Zap, ShieldAlert, CheckCircle, Mail, AlertTriangle,
    Lock, RefreshCw, Send, Save, UserX, UserCheck
} from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { AuditLog, ActionLog } from '../audit-detail';

interface Props {
    auditLog: AuditLog;
    actionHistory: ActionLog[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export default function ActionsTab({ auditLog, actionHistory }: Props) {
    const [actionType, setActionType] = useState('send_warning');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(`/admin/audit/${auditLog.id}/action`, {
            action_type: actionType,
            description: note
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setNote('');
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Action Panel */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Zap className="w-32 h-32" />
                </div>

                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 relative z-10">Incident Response</h3>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Select Action</label>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'resolve', label: 'Mark as Resolved', icon: CheckCircle, color: 'emerald' },
                                { id: 'escalate', label: 'Escalate & Investigate', icon: AlertTriangle, color: 'amber' },
                                { id: 'send_warning', label: 'Send Warning Email', icon: Mail, color: 'blue' },
                                { id: 'flag_device', label: 'Flag Device/IP', icon: ShieldAlert, color: 'purple' },
                                { id: 'void_attendance', label: 'Void Attendance', icon: RefreshCw, color: 'orange' },
                                { id: 'block_user', label: 'Temp Block User', icon: Lock, color: 'rose' }
                            ].map(opt => (
                                <label
                                    key={opt.id}
                                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${actionType === opt.id
                                            ? `bg-${opt.color}-50 dark:bg-${opt.color}-900/20 border-${opt.color}-500 shadow-md`
                                            : 'bg-white/50 dark:bg-neutral-800/50 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="actionType"
                                        value={opt.id}
                                        checked={actionType === opt.id}
                                        onChange={(e) => setActionType(e.target.value)}
                                        className="sr-only"
                                    />
                                    <opt.icon className={`w-5 h-5 ${actionType === opt.id ? `text-${opt.color}-600 dark:text-${opt.color}-400` : 'text-neutral-400'}`} />
                                    <span className={`font-semibold ${actionType === opt.id ? `text-${opt.color}-900 dark:text-${opt.color}-300` : 'text-neutral-700 dark:text-neutral-300'}`}>
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex justify-between">
                            Resolution Notes
                            <span className="text-neutral-400 font-normal">Optional</span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full h-32 bg-white/50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm dark:text-white"
                            placeholder="Add your investigation notes, resolution steps, or reason for action here..."
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" /> Execute Action
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
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Action History (Audit Trail)</h3>

                {actionHistory.length > 0 ? (
                    <div className="space-y-4">
                        {actionHistory.map((action, idx) => (
                            <motion.div
                                key={action.id || idx}
                                variants={itemVariants}
                                className="bg-white/60 dark:bg-neutral-800/60 p-5 rounded-2xl border border-white/20 dark:border-white/5 shadow-md flex items-start gap-4"
                            >
                                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mt-1">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-neutral-900 dark:text-white">{action.action_type.replace(/_/g, ' ').toUpperCase()}</h4>
                                        <span className="text-xs font-mono text-neutral-500">{new Date(action.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                        Executed by <span className="font-semibold">{action.actor?.name || 'Admin'}</span>
                                    </p>
                                    {action.description && (
                                        <div className="p-3 bg-neutral-100 dark:bg-neutral-900/50 rounded-lg text-sm italic text-neutral-700 dark:text-neutral-300">
                                            "{action.description}"
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/40 dark:bg-neutral-900/40 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center backdrop-blur-xl">
                        <div className="h-16 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                            <Save className="h-8 w-8" />
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No Actions Yet</h4>
                        <p className="text-neutral-500 text-sm max-w-sm">There are no administrative actions recorded for this audit event yet.</p>
                    </div>
                )}
            </motion.div>

        </div>
    );
}
