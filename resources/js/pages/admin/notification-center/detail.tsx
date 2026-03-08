import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
    ArrowLeft, Bell, Clock, Eye, AlertTriangle, CheckCircle,
    FileText, Download, RotateCcw, XCircle, Users, Activity,
    Target, Zap, MousePointerClick, TrendingUp, Filter, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface Recipient {
    id: number;
    target_type: string;
    target_id: number | null;
    name: string;
    identifier: string;
    status: string;
    read_at: string | null;
    read_time_seconds: number | null;
}

interface DetailProps {
    notification: {
        id: number;
        title: string;
        message: string;
        type: string;
        priority: string;
        created_at: string;
        scheduled_at: string | null;
        action_url: string | null;
    };
    campaign_stats: {
        total: number;
        sent: number;
        read: number;
        failed: number;
        clicked: number;
        avg_read_time: string;
    };
    timeline: {
        status: string;
        title: string;
        date: string;
        description: string;
    }[];
    charts: {
        hourly: { hour: string; count: number }[];
        status: { name: string; value: number; color: string }[];
    };
    recipients: Recipient[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function NotificationDetail({ notification, campaign_stats, timeline, charts, recipients }: DetailProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [actionDialog, setActionDialog] = useState<{ open: boolean; type: 'resend' | 'cancel' | null }>({
        open: false,
        type: null,
    });
    const [showExportMenu, setShowExportMenu] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reminder': return Clock;
            case 'announcement': return Bell;
            case 'alert': return AlertTriangle;
            case 'achievement': return CheckCircle;
            case 'warning': return AlertTriangle;
            default: return Bell;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">URGENT</span>;
            case 'high': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">HIGH</span>;
            case 'normal': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">NORMAL</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30">LOW</span>;
        }
    };

    const TypeIcon = getTypeIcon(notification.type);

    const handleActionConfirm = () => {
        if (actionDialog.type === 'resend') {
            router.post(`/admin/notification-center/${notification.id}/resend`, {}, {
                onSuccess: () => setActionDialog({ open: false, type: null })
            });
        } else if (actionDialog.type === 'cancel') {
            router.post(`/admin/notification-center/${notification.id}/cancel`, {}, {
                onSuccess: () => setActionDialog({ open: false, type: null })
            });
        }
    };

    const filteredRecipients = useMemo(() => {
        return recipients.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.identifier.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            const matchesType = typeFilter === 'all' || r.target_type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [recipients, searchTerm, statusFilter, typeFilter]);

    const readRate = campaign_stats.total > 0 ? Math.round((campaign_stats.read / campaign_stats.total) * 100) : 0;
    const clickRate = campaign_stats.read > 0 ? Math.round((campaign_stats.clicked / campaign_stats.read) * 100) : 0;

    return (
        <AppLayout>
            <Head title={`Detail | ${notification.title}`} />

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">

                {/* ═══════ HEADER ═══════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] p-6 lg:p-10 text-white shadow-2xl">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
                    <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px]" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div className="flex flex-col gap-4">
                            <motion.button
                                type="button"
                                onClick={() => window.history.back()}
                                whileHover={{ x: -4 }}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors w-fit"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Daftar
                            </motion.button>

                            <div>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm backdrop-blur-md font-medium">
                                        <TypeIcon className="h-4 w-4" />
                                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                    </span>
                                    {getPriorityBadge(notification.priority)}
                                </div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-4xl text-pretty drop-shadow-lg">
                                    {notification.title}
                                </h1>
                                <p className="mt-2 text-white/80 font-medium flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Dibuat pada {new Date(notification.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="relative">
                                <Button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl h-11 px-5 font-semibold"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Laporan
                                    {showExportMenu ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                                </Button>

                                <AnimatePresence>
                                    {showExportMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-neutral-800 shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50 p-1"
                                        >
                                            <button
                                                onClick={() => { window.open(`/admin/notification-center/${notification.id}/export/pdf`, '_blank'); setShowExportMenu(false); }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-2"
                                            >
                                                <FileText className="h-4 w-4 text-red-500" /> Export PDF
                                            </button>
                                            <button
                                                onClick={() => { window.location.href = `/admin/notification-center/${notification.id}/export/excel`; setShowExportMenu(false); }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-2"
                                            >
                                                <FileText className="h-4 w-4 text-emerald-500" /> Export Excel
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1">
                                <button
                                    onClick={() => setActionDialog({ open: true, type: 'resend' })}
                                    className="p-2.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                                    title="Resend to Unread"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setActionDialog({ open: true, type: 'cancel' })}
                                    className="p-2.5 rounded-lg hover:bg-red-500/50 text-red-200 hover:text-white transition-colors"
                                    title="Cancel Unsent/Unread"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ KEY METRICS ═══════ */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    {[
                        { label: 'Total Penerima', value: campaign_stats.total, sub: 'Users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                        { label: 'Tingkat Baca', value: `${readRate}%`, sub: `${campaign_stats.read} dari ${campaign_stats.total}`, icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                        { label: 'Rata-rata Waktu', value: campaign_stats.avg_read_time, sub: 'Waktu baca (HH:MM:SS)', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                        { label: 'Click Rate', value: `${clickRate}%`, sub: `Est. dari pembaca`, icon: MousePointerClick, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-5 lg:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group"
                        >
                            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-500`} />

                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 leading-tight">{stat.label}</h3>
                            </div>
                            <div className="relative z-10">
                                <div className="text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                                    {stat.sub}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════ MAIN CONTENT GRID ═══════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column (Content & Timeline) */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">

                        {/* Message Card */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-6 lg:p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Isi Notifikasi</h2>
                            </div>

                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700/50">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">{notification.title}</h3>
                                <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300 leading-relaxed text-[15px]">
                                    {notification.message.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2 last:mb-0">{line}</p>
                                    ))}
                                </div>
                                {notification.action_url && (
                                    <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                                        <Button variant="outline" className="gap-2 pointer-events-none opacity-80" onClick={(e) => e.preventDefault()}>
                                            Aksi URL:<span className="font-mono text-xs text-blue-500 ml-1">{notification.action_url}</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Status Pie */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-neutral-400" />
                                    Distribusi Status
                                </h2>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={charts.status}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {charts.status.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Engagement Area Chart */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-neutral-400" />
                                    Aktivitas (Per Jam)
                                </h2>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={charts.hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-neutral-800" />
                                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column (Insights & Timeline) */}
                    <div className="col-span-1 space-y-6">

                        {/* AI Insights Panel */}
                        <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 dark:border-indigo-500/30 rounded-[1.5rem] p-6 relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Activity className="h-32 w-32 text-indigo-500" />
                            </div>
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">AI Insights</h2>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="bg-white/60 dark:bg-neutral-900/60 rounded-xl p-4 border border-white/20 dark:border-neutral-800 backdrop-blur-md">
                                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Performa Kampanye</p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                        Tingkat baca mencapai <span className="font-bold text-emerald-500">{readRate}%</span>.
                                        {readRate > 50 ? ' Kampanye ini berjalan sangat baik dan mendapatkan perhatian yang tinggi dari target.'
                                            : ' Pertimbangkan untuk menggunakan kalimat subjek yang lebih menarik atau mengirim ulang.'}
                                    </p>
                                </div>

                                <div className="bg-white/60 dark:bg-neutral-900/60 rounded-xl p-4 border border-white/20 dark:border-neutral-800 backdrop-blur-md">
                                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">Saran Waktu</p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                        Berdasarkan aktivitas, penerima cenderung membaca notifikasi pada {charts.hourly.length > 0 ? charts.hourly.reduce((max, h) => h.count > max.count ? h : max, charts.hourly[0]).hour : 'pagi hari'}.
                                        Jadwalkan notifikasi serupa di jam ini.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Campaign Timeline */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-neutral-400" />
                                Timeline Kampanye
                            </h2>

                            <div className="relative border-l-2 border-neutral-100 dark:border-neutral-800 ml-3 space-y-6">
                                {timeline.map((event, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className={cn(
                                            "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white dark:border-neutral-900",
                                            event.status === 'created' ? 'bg-indigo-500' :
                                                event.status === 'scheduled' ? 'bg-amber-500' :
                                                    event.status === 'read' ? 'bg-emerald-500' : 'bg-neutral-400'
                                        )} />
                                        <div>
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-none mb-1">{event.title}</h4>
                                            <p className="text-[11px] font-medium text-neutral-400 mb-2">{new Date(event.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* ═══════ RECIPIENTS TABLE ═══════ */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Users className="h-5 w-5 text-neutral-400" />
                            Detail Penerima ({filteredRecipients.length})
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Cari penerima..."
                                    className="pl-9 bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 w-full sm:w-[250px] rounded-xl h-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 rounded-xl h-10">
                                    <Filter className="h-4 w-4 mr-2 text-neutral-400" />
                                    <SelectValue placeholder="Tipe" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-700">
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                                    <SelectItem value="dosen">Dosen</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 rounded-xl h-10">
                                    <Filter className="h-4 w-4 mr-2 text-neutral-400" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-700">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="read">Dibaca</SelectItem>
                                    <SelectItem value="sent">Terkirim</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Nama Penerima</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4">Waktu Baca</th>
                                    <th scope="col" className="px-6 py-4">Durasi Respon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filteredRecipients.length > 0 ? (
                                    filteredRecipients.map((recipient) => (
                                        <tr key={recipient.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex font-semibold text-neutral-900 dark:text-white flex-col">
                                                    {recipient.name}
                                                    <span className="text-xs font-medium text-neutral-500">{recipient.identifier} &bull; {recipient.target_type ? recipient.target_type.charAt(0).toUpperCase() + recipient.target_type.slice(1) : ''}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {recipient.status === 'read' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Dibaca
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                                        <CheckCircle className="h-3 w-3" /> Terkirim
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                {recipient.read_at ? new Date(recipient.read_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                                                {recipient.read_time_seconds ? `${Math.round(recipient.read_time_seconds / 60)} mnt` : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Users className="h-10 w-10 text-neutral-300 mb-2" />
                                                <p>Tidak ada penerima yang cocok dengan filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Action Dialog */}
                <ConfirmDialog
                    open={actionDialog.open}
                    onOpenChange={(open) => setActionDialog(prev => ({ ...prev, open }))}
                    onConfirm={handleActionConfirm}
                    title={actionDialog.type === 'resend' ? 'Kirim Ulang Notifikasi' : 'Batalkan Notifikasi'}
                    message={
                        actionDialog.type === 'resend'
                            ? 'Yakin ingin mengirim ulang notifikasi kepada penerima yang belum membacanya?'
                            : 'Yakin ingin MEMBATALKAN notifikasi ini? Notifikasi akan dihapus dari antrean dan kotak masuk bagi mereka yang belum membacanya.'
                    }
                    variant={actionDialog.type === 'resend' ? 'info' : 'danger'}
                    confirmText={actionDialog.type === 'resend' ? 'Ya, Kirim Ulang' : 'Ya, Batalkan'}
                />

            </motion.div>
        </AppLayout>
    );
}
