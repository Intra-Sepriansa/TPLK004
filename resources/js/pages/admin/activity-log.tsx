import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    ScrollText,
    Search,
    Filter,
    RefreshCw,
    Activity,
    Calendar,
    User,
    Clock,
    Database,
    Eye,
    Plus,
    Pencil,
    Trash2,
    LogIn,
    Settings,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import activityIcon from '@/assets/admin/activity-log/activity-icon.png';
import totalActivityIcon from '@/assets/admin/activity-log/total-activity.png';
import hariIcon from '@/assets/admin/activity-log/hari.png';
import mingguIcon from '@/assets/admin/activity-log/minggu.png';

interface ActivityLog {
    id: number;
    user: string;
    action: string;
    model_type: string | null;
    model_id: number | null;
    description: string;
    ip_address: string | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    created_at: string;
}

interface PageProps {
    logs: {
        data: ActivityLog[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    actions: string[];
    stats: {
        total: number;
        today: number;
        this_week: number;
    };
    filters: {
        search: string;
        action: string;
        date: string | null;
    };
}

const actionConfig: Record<string, { label: string; color: string; icon: any }> = {
    create: { label: 'Tambah', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-600 dark:text-emerald-400', icon: Plus },
    update: { label: 'Update', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-600 dark:text-blue-400', icon: Pencil },
    delete: { label: 'Hapus', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-600 dark:text-red-400', icon: Trash2 },
    login: { label: 'Login', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-600 dark:text-purple-400', icon: LogIn },
    view: { label: 'Lihat', color: 'bg-slate-100 text-slate-700 dark:bg-black/30 dark:text-slate-600 dark:text-slate-400', icon: Eye },
    settings: { label: 'Pengaturan', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-600 dark:text-amber-400', icon: Settings },
};

export default function AdminActivityLog({ logs, actions, stats, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search);
    const [action, setAction] = useState(filters.action);
    const [date, setDate] = useState(filters.date || '');
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleFilter = () => {
        router.get('/admin/activity-log', { search, action, date: date || undefined }, { preserveState: true });
    };

    const getActionBadge = (actionType: string) => {
        const config = actionConfig[actionType] || { label: actionType, color: 'bg-slate-100 text-slate-700', icon: Activity };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Log Aktivitas" />

            <div className="p-6 space-y-6">
                {/* ═══════ HEADER — Advanced Animated Gradient ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Overlay & Glow Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />



                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full">
                            <motion.div
                                className="relative flex shrink-0 h-24 w-24 sm:h-20 sm:w-20"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img src={activityIcon} alt="Log Aktivitas Admin" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
                            </motion.div>
                            <div className="flex-1 mt-1 sm:mt-0">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm text-indigo-100 font-medium tracking-wide mb-1"
                                >
                                    Monitoring Sistem
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-2xl sm:text-3xl font-bold tracking-tight"
                                >
                                    Log Aktivitas Admin
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-2 text-indigo-50 border-l-2 border-indigo-300/50 pl-3 italic text-sm max-w-xl"
                                >
                                    Pantau dan audit setiap aksi yang dilakukan pengguna dalam sistem secara realtime.
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats - Staggered Spring Animations */}
                <motion.div
                    className="grid grid-cols-3 gap-2 sm:gap-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
                    }}
                >
                    {[
                        { imageIcon: totalActivityIcon, label: 'Total Aktivitas', value: stats.total, color: 'purple' },
                        { imageIcon: hariIcon, label: 'Hari Ini', value: stats.today, color: 'amber' },
                        { imageIcon: mingguIcon, label: 'Minggu Ini', value: stats.this_week, color: 'amber' },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.9 },
                                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
                            }}
                            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                        >
                            <StatCard imageIcon={card.imageIcon} label={card.label} value={card.value} color={card.color} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter Section - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="font-bold text-lg text-gray-800 dark:text-white">Filter Data</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pencarian</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleFilter()}
                                    placeholder="Cari aktivitas..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</label>
                            <div className="relative">
                                <select
                                    value={action}
                                    onChange={e => setAction(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    <option value="all">Semua Aksi</option>
                                    {actions.map(a => (
                                        <option key={a} value={a}>{actionConfig[a]?.label || a}</option>
                                    ))}
                                </select>
                                <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex items-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFilter}
                                className="flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Terapkan Filter
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Activity Logs Table - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="font-bold text-lg text-gray-800 dark:text-white">Riwayat Aktivitas</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                Halaman {logs.current_page} dari {logs.last_page}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Model</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <AnimatePresence>
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500 font-medium">Tidak ada log aktivitas</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log, index) => (
                                            <motion.tr
                                                key={log.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: 0.05 * index }}
                                                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                                                className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setShowDetailModal(true);
                                                }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {log.created_at}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white ml-1">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-800 dark:text-white">{log.user}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getActionBadge(log.action)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {log.model_type ? (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 w-fit">
                                                            <Database className="h-3 w-3 text-gray-500" />
                                                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                                                {log.model_type.split('\\').pop()}
                                                                {log.model_id && <span className="text-gray-400"> #{log.model_id}</span>}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                                    {log.description}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                    {log.ip_address || '-'}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-2">
                            {logs.links.map((link, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: link.url ? 1.05 : 1 }}
                                    whileTap={{ scale: link.url ? 0.95 : 1 }}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${link.active
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : link.url
                                            ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-900 dark:text-gray-600'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ═══════ DETAIL MODAL ═══════ */}
            <AnimatePresence>
                {showDetailModal && selectedLog && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailModal(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-white/20 dark:border-neutral-800 flex flex-col max-h-[90vh]"
                            >
                                {/* Modal Header with Gradient */}
                                <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex items-start justify-between overflow-hidden shrink-0">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl">
                                            <Activity className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">
                                                Detail Aktivitas
                                            </h3>
                                            <p className="text-blue-100 flex items-center gap-2">
                                                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-sm">#{selectedLog.id}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/50" />
                                                <span>{selectedLog.created_at}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="relative z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                                    >
                                        <div className="sr-only">Close</div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Modal Body - Scrollable */}
                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase">User</p>
                                                    <p className="font-bold text-gray-800 dark:text-white">{selectedLog.user}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                                    <Database className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase">Model Target</p>
                                                    <p className="font-bold text-gray-800 dark:text-white font-mono text-sm">
                                                        {selectedLog.model_type?.split('\\').pop() || '-'}
                                                        {selectedLog.model_id && <span className="text-gray-400"> #{selectedLog.model_id}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                    <Activity className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase">Action</p>
                                                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                                    <ScrollText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase">Deskripsi</p>
                                                    <p className="font-medium text-gray-800 dark:text-white text-sm">{selectedLog.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Comparison */}
                                    {(selectedLog.old_values || selectedLog.new_values) && (
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                                <Activity className="h-5 w-5 text-indigo-500" />
                                                Perubahan Data
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Old Values */}
                                                <div className="rounded-2xl border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10 overflow-hidden">
                                                    <div className="px-4 py-3 bg-red-100/50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800/30 flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                                        <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Data Lama</p>
                                                    </div>
                                                    <div className="p-4 overflow-auto max-h-96 custom-scrollbar">
                                                        {selectedLog.old_values ? (
                                                            <pre className="text-xs font-mono text-red-800 dark:text-red-300 whitespace-pre-wrap leading-relaxed">
                                                                {JSON.stringify(selectedLog.old_values, null, 2)}
                                                            </pre>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic text-center py-4">Tidak ada data lama</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* New Values */}
                                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10 overflow-hidden">
                                                    <div className="px-4 py-3 bg-emerald-100/50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800/30 flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Data Baru</p>
                                                    </div>
                                                    <div className="p-4 overflow-auto max-h-96 custom-scrollbar">
                                                        {selectedLog.new_values ? (
                                                            <pre className="text-xs font-mono text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap leading-relaxed">
                                                                {JSON.stringify(selectedLog.new_values, null, 2)}
                                                            </pre>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic text-center py-4">Tidak ada data baru</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 shrink-0">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, imageIcon, label, value, sub, color }: { icon?: any; imageIcon?: string; label: string; value: number | string; sub?: string; color: string }) {
    const [isHovered, setIsHovered] = useState(false);

    // Map colors to matching dashboard configurations
    const colorConfigs: Record<string, any> = {
        emerald: { bg: 'bg-emerald-500', hoverShadow: 'group-hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', iconBg: 'from-emerald-400 to-teal-600 shadow-emerald-500/30' },
        orange: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-orange-400 to-orange-600 shadow-orange-500/30' },
        amber: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-amber-400 to-orange-600 shadow-amber-500/30' },
        purple: { bg: 'bg-violet-500', hoverShadow: 'group-hover:shadow-violet-500/10', gradientBg: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10', iconBg: 'from-violet-400 to-purple-600 shadow-violet-500/30' },
        blue: { bg: 'bg-sky-500', hoverShadow: 'group-hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10', iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30' },
        red: { bg: 'bg-red-500', hoverShadow: 'group-hover:shadow-red-500/10', gradientBg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10', iconBg: 'from-red-400 to-rose-600 shadow-red-500/30' },
    };
    const c = colorConfigs[color] ?? colorConfigs.blue;

    return (
        <div
            className={`group h-full relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-2 sm:p-5 shadow-xl backdrop-blur-xl transition-all ${c.hoverShadow} dark:border-white/5 cursor-pointer flex flex-col justify-center`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`} />

            <motion.div
                initial={false}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.bg} blur-3xl transition-all duration-500`}
            />

            <div className="relative flex flex-col xl:flex-row items-center xl:items-start text-center xl:text-left gap-1.5 sm:gap-3">
                {imageIcon ? (
                    <motion.div
                        className="relative flex shrink-0 h-7 w-7 sm:h-12 sm:w-12 items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src={imageIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" alt={label} />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex shrink-0 h-7 w-7 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${c.iconBg} text-white shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {Icon && <Icon className="h-3 w-3 sm:h-5 sm:w-5" />}
                    </motion.div>
                )}
                <div>
                    <p className="text-[8px] sm:text-[11px] md:text-xs font-medium leading-tight text-neutral-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-sm sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-white">
                            {value}
                        </span>
                    </div>
                    {sub && <p className="text-[7px] sm:text-[10px] leading-tight text-neutral-400 mt-0.5">{sub}</p>}
                </div>
            </div>
        </div>
    );
}
