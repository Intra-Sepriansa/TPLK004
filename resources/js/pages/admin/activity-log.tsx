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
    create: { label: 'Tambah', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Plus },
    update: { label: 'Update', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Pencil },
    delete: { label: 'Hapus', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Trash2 },
    login: { label: 'Login', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: LogIn },
    view: { label: 'Lihat', color: 'bg-slate-100 text-slate-700 dark:bg-black/30 dark:text-slate-400', icon: Eye },
    settings: { label: 'Pengaturan', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Settings },
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
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <ScrollText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-100">Monitoring</p>
                                <h1 className="text-2xl font-bold">Log Aktivitas Admin</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-indigo-100">
                            Pantau semua aktivitas yang dilakukan di sistem
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Aktivitas</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Hari Ini</p>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.today}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Minggu Ini</p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.this_week}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFilter()}
                                placeholder="Cari aktivitas..."
                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-black dark:text-white"
                            />
                        </div>
                        <div>
                            <select
                                value={action}
                                onChange={e => setAction(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-black dark:text-white"
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
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-black dark:text-white"
                            />
                        </div>
                        <div>
                            <button
                                onClick={handleFilter}
                                className="flex items-center justify-center gap-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Logs Table */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Riwayat Aktivitas</h2>
                            </div>
                            <span className="text-sm text-slate-500">
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
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <Activity className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                            <p className="text-slate-500">Tidak ada log aktivitas</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map(log => (
                                        <>
                                            <tr
                                                key={log.id}
                                                className="hover:bg-slate-50 dark:hover:bg-black/30 transition-colors cursor-pointer"
                                                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                            >
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {log.created_at}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
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
                                                            <Database className="h-3 w-3 text-slate-400" />
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                {log.model_type}
                                                                {log.model_id && <span className="text-slate-400"> #{log.model_id}</span>}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                    {log.description}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                                                    {log.ip_address || '-'}
                                                </td>
                                            </tr>
                                            {expandedLog === log.id && (log.old_values || log.new_values) && (
                                                <tr key={`${log.id}-detail`}>
                                                    <td colSpan={6} className="px-4 py-4 bg-slate-50 dark:bg-black/50">
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {log.old_values && Object.keys(log.old_values).length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-slate-500 mb-2">Nilai Lama:</p>
                                                                    <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded-lg overflow-auto text-red-700 dark:text-red-300">
                                                                        {JSON.stringify(log.old_values, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {log.new_values && Object.keys(log.new_values).length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-slate-500 mb-2">Nilai Baru:</p>
                                                                    <pre className="text-xs bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg overflow-auto text-emerald-700 dark:text-emerald-300">
                                                                        {JSON.stringify(log.new_values, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {logs.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            : 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-black'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
