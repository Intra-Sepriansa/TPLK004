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
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

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
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black p-8 text-white shadow-2xl border border-slate-200 dark:border-slate-800/50"
                >
                    <motion.div 
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        <motion.div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur border border-indigo-500/30"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.15, duration: 0.3, type: "spring", stiffness: 200 }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                            <ScrollText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </motion.div>
                        <div>
                            <motion.p 
                                className="text-sm text-indigo-200/80"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                            >
                                Monitoring
                            </motion.p>
                            <motion.h1 
                                className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.2 }}
                            >
                                Log Aktivitas Admin
                            </motion.h1>
                        </div>
                    </motion.div>
                    <motion.p 
                        className="mt-4 text-indigo-100/70 max-w-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.2 }}
                    >
                        Pantau semua aktivitas yang dilakukan di sistem
                    </motion.p>
                </motion.div>

                {/* Stats - Dock Style */}
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { icon: Activity, label: 'Total Aktivitas', value: stats.total, color: 'from-indigo-500/20 to-purple-500/20', iconColor: 'text-indigo-600 dark:text-indigo-400', borderColor: 'border-indigo-500/30' },
                        { icon: Clock, label: 'Hari Ini', value: stats.today, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-500/30' },
                        { icon: Calendar, label: 'Minggu Ini', value: stats.this_week, color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-500/30' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                                delay: 0.05 + index * 0.015, 
                                duration: 0.15,
                                ease: "easeOut"
                            }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, ${stat.color})` }} />
                            
                            <div className="relative z-10 flex items-center gap-4">
                                <motion.div
                                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} backdrop-blur border ${stat.borderColor}`}
                                    whileHover={{ rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 dark:text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFilter()}
                                placeholder="Cari aktivitas..."
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <select
                                value={action}
                                onChange={e => setAction(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            >
                                <option value="all">Semua Aksi</option>
                                {actions.map(a => (
                                    <option key={a} value={a}>{actionConfig[a]?.label || a}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFilter}
                                className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Filter
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Activity Logs Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.2, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black shadow-xl overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Riwayat Aktivitas</h2>
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Halaman {logs.current_page} dari {logs.last_page}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Model</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                <AnimatePresence>
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center">
                                                <Activity className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                                                <p className="text-slate-600 dark:text-slate-400">Tidak ada log aktivitas</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log, index) => (
                                            <>
                                                <motion.tr
                                                    key={log.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ delay: 0.14 + index * 0.01, duration: 0.15 }}
                                                    whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
                                                    className="transition-colors cursor-pointer"
                                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                                >
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                        {log.created_at}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                                                                <User className="h-4 w-4" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{log.user}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getActionBadge(log.action)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {log.model_type ? (
                                                            <div className="flex items-center gap-1">
                                                                <Database className="h-3 w-3 text-slate-500" />
                                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {log.model_type}
                                                                    {log.model_id && <span className="text-slate-500"> #{log.model_id}</span>}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-500">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                        {log.description}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                                                        {log.ip_address || '-'}
                                                    </td>
                                                </motion.tr>
                                                {expandedLog === log.id && (log.old_values || log.new_values) && (
                                                    <motion.tr
                                                        key={`${log.id}-detail`}
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <td colSpan={6} className="px-4 py-4 bg-slate-50 dark:bg-black/50">
                                                            <div className="grid md:grid-cols-2 gap-4">
                                                                {log.old_values && Object.keys(log.old_values).length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Nilai Lama:</p>
                                                                        <pre className="text-xs bg-red-900/20 p-3 rounded-lg overflow-auto text-red-300 border border-red-500/30">
                                                                            {JSON.stringify(log.old_values, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {log.new_values && Object.keys(log.new_values).length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Nilai Baru:</p>
                                                                        <pre className="text-xs bg-emerald-900/20 p-3 rounded-lg overflow-auto text-emerald-300 border border-emerald-500/30">
                                                                            {JSON.stringify(log.new_values, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 flex justify-center gap-2">
                            {logs.links.map((link, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: link.url ? 1.05 : 1 }}
                                    whileTap={{ scale: link.url ? 0.95 : 1 }}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded text-sm transition-all ${
                                        link.active
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                            : link.url
                                            ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-700/50'
                                            : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}
