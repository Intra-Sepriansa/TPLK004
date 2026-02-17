import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, Play, Calendar, Timer, CheckCircle, AlertTriangle, XCircle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SessionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
}

export default function SessionDetailModal({ isOpen, onClose, session }: SessionDetailModalProps) {
    if (!session) return null;

    // Mock data for chart if not available
    const attendanceData = [
        { time: 'Start', count: 0 },
        { time: '15m', count: Math.floor(session.total_attendance * 0.3) },
        { time: '30m', count: Math.floor(session.total_attendance * 0.7) },
        { time: '45m', count: Math.floor(session.total_attendance * 0.9) },
        { time: 'End', count: session.total_attendance },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog static as={motion.div} open={isOpen} onClose={onClose} className="relative z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel
                            as={motion.div}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            {/* Header */}
                            <div className="relative p-6 px-8 text-center sm:text-left">
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                                    <div className={cn(
                                        "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10",
                                        session.is_active
                                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                    )}>
                                        {session.is_active ? <Play className="h-7 w-7 fill-current" /> : <Clock className="h-7 w-7" />}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <Dialog.Title as="h3" className="text-xl font-bold text-neutral-900 dark:text-white">
                                            {session.course_name}
                                        </Dialog.Title>
                                        <div className="mt-1.5 flex flex-wrap justify-center gap-2 sm:justify-start">
                                            <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                                                Pertemuan #{session.meeting_number}
                                            </span>
                                            {session.is_active && (
                                                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                    </span>
                                                    LIVE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content bg-neutral-50 dark:bg-neutral-950/50 */}
                            <div className="bg-neutral-50 p-6 dark:bg-neutral-950/50 space-y-5">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center dark:border-indigo-900/20 dark:bg-indigo-900/10">
                                        <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            <Users className="h-3.5 w-3.5" />
                                        </div>
                                        <p className="text-xl font-bold text-neutral-900 dark:text-white">{session.total_attendance}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Hadir</p>
                                    </div>
                                    {/* These could be real data if passed in session object */}
                                    {['Hadir', 'Terlambat', 'Ditolak'].map((label, idx) => (
                                        <div key={label} className="rounded-xl border border-neutral-200 bg-white p-3 text-center dark:border-neutral-800 dark:bg-neutral-900 opacity-75">
                                            <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
                                                {idx === 0 ? <CheckCircle className="h-3.5 w-3.5" /> : idx === 1 ? <Clock className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                            </div>
                                            <p className="text-xl font-bold text-neutral-900 dark:text-white">-</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart Area */}
                                <div className="h-40 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={attendanceData}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                                        <span className="font-medium text-neutral-500">Mulai</span>
                                        <span className="font-mono font-bold text-neutral-900 dark:text-white">08:00 WIB</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                                        <span className="font-medium text-neutral-500">Selesai</span>
                                        <span className="font-mono font-bold text-neutral-900 dark:text-white">10:00 WIB</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full rounded-xl bg-neutral-900 py-3 font-bold text-white shadow-lg transition-transform active:scale-[0.98] dark:bg-white dark:text-neutral-900 hover:opacity-90"
                                >
                                    Tutup Detail
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
