import StudentLayout from '@/layouts/student-layout';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Clock,
    Megaphone,
    AlertTriangle,
    Award,
    Info,
    CheckCircle,
    ExternalLink,
    X,
    Trash2,
    Filter,
    RefreshCw,
    TrendingUp,
    BarChart3,
    Calendar,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    priority: string;
    action_url: string | null;
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: { data: Notification[]; current_page: number; last_page: number };
    unreadCount: number;
    stats: {
        total: number;
        unread: number;
        read: number;
        today: number;
        thisWeek: number;
        urgent: number;
    };
}

export default function Notifications({ notifications, unreadCount, stats }: Props) {
    const [detailModal, setDetailModal] = useState<{ open: boolean; notification: Notification | null }>({ 
        open: false, 
        notification: null 
    });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ 
        open: false, 
        id: null 
    });
    const [filterType, setFilterType] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleMarkAsRead = (id: number) => router.post(`/user/notifications/${id}/read`);
    const handleMarkAllAsRead = () => router.post('/user/notifications/read-all');
    
    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/notifications/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
            setDetailModal({ open: false, notification: null });
        }
    };

    const handleFilter = () => {
        router.get('/user/notifications', { 
            type: filterType, 
            priority: filterPriority, 
            status: filterStatus 
        }, { preserveState: true });
    };

    const openDetail = (notif: Notification) => {
        setDetailModal({ open: true, notification: notif });
        if (!notif.read_at) {
            handleMarkAsRead(notif.id);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reminder': return <Clock className="h-5 w-5" />;
            case 'announcement': return <Megaphone className="h-5 w-5" />;
            case 'alert': return <AlertTriangle className="h-5 w-5" />;
            case 'achievement': return <Award className="h-5 w-5" />;
            case 'warning': return <AlertTriangle className="h-5 w-5" />;
            default: return <Info className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'reminder': return 'from-blue-500 to-cyan-600';
            case 'announcement': return 'from-purple-500 to-violet-600';
            case 'alert': return 'from-red-500 to-rose-600';
            case 'achievement': return 'from-amber-500 to-orange-600';
            case 'warning': return 'from-orange-500 to-red-600';
            default: return 'from-slate-500 to-slate-600';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'reminder': return 'Pengingat';
            case 'announcement': return 'Pengumuman';
            case 'alert': return 'Peringatan';
            case 'achievement': return 'Pencapaian';
            case 'warning': return 'Peringatan';
            default: return 'Informasi';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': 
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Urgent</span>;
            case 'high': 
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Penting</span>;
            default: 
                return null;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        if (days < 7) return `${days} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <StudentLayout>
            <Head title="Notifikasi" />

            <div className="p-6 space-y-6">
                {/* Header dengan animasi masuk - sama seperti rekap kehadiran */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-2xl border border-slate-700/50"
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl"
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50"
                                >
                                    <Bell className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-slate-400 font-medium"
                                    >
                                        Pusat Pemberitahuan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                                    >
                                        Notifikasi
                                    </motion.h1>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Tandai Semua Dibaca
                                </motion.button>
                            )}
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-slate-400"
                        >
                            Pemberitahuan dan pengumuman terbaru untuk Anda
                        </motion.p>
                    </div>
                </motion.div>

                {/* Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl border border-slate-200 dark:border-slate-800/50"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="font-semibold text-slate-900 dark:text-white text-lg">Filter Notifikasi</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipe</label>
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="all">Semua Tipe</option>
                                <option value="reminder">Pengingat</option>
                                <option value="announcement">Pengumuman</option>
                                <option value="alert">Peringatan</option>
                                <option value="achievement">Pencapaian</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prioritas</label>
                            <select
                                value={filterPriority}
                                onChange={e => setFilterPriority(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="all">Semua Prioritas</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">Penting</option>
                                <option value="normal">Normal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="all">Semua Status</option>
                                <option value="unread">Belum Dibaca</option>
                                <option value="read">Sudah Dibaca</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFilter}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Terapkan Filter
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards dengan animasi dock-style */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        { icon: Bell, label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-600', delay: 0.05 },
                        { icon: EyeOff, label: 'Belum Dibaca', value: stats.unread, color: 'from-red-500 to-rose-600', delay: 0.1 },
                        { icon: Eye, label: 'Sudah Dibaca', value: stats.read, color: 'from-emerald-500 to-green-600', delay: 0.15 },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl border border-slate-200 dark:border-slate-800/50 cursor-pointer"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                    <stat.icon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: stat.delay + 0.1, type: "spring" }}
                                        className="text-2xl font-bold text-slate-900 dark:text-white"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                            </div>
                            
                            {/* Animated border */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-900 dark:via-white to-transparent"
                                initial={{ width: "0%", opacity: 0 }}
                                whileHover={{ width: "100%", opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Stats Cards Row 2 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        { icon: Calendar, label: 'Hari Ini', value: stats.today, color: 'from-purple-500 to-violet-600', delay: 0.2 },
                        { icon: TrendingUp, label: 'Minggu Ini', value: stats.thisWeek, color: 'from-indigo-500 to-blue-600', delay: 0.25 },
                        { icon: AlertTriangle, label: 'Urgent', value: stats.urgent, color: 'from-orange-500 to-red-600', delay: 0.3 },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl border border-slate-200 dark:border-slate-800/50 cursor-pointer"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                    <stat.icon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: stat.delay + 0.1, type: "spring" }}
                                        className="text-2xl font-bold text-slate-900 dark:text-white"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                            </div>
                            
                            {/* Animated border */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-900 dark:via-white to-transparent"
                                initial={{ width: "0%", opacity: 0 }}
                                whileHover={{ width: "100%", opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Notifications List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black shadow-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                                <Bell className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="font-semibold text-slate-900 dark:text-white text-lg">Daftar Notifikasi</h2>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <AnimatePresence>
                            {notifications.data.map((notif, index) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.3)" }}
                                    className={`p-4 transition-colors cursor-pointer ${!notif.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    onClick={() => openDetail(notif)}
                                >
                                    <div className="flex items-start gap-4">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getTypeColor(notif.type)} shadow-lg shrink-0`}
                                        >
                                            {getTypeIcon(notif.type)}
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-semibold text-slate-900 dark:text-white">{notif.title}</span>
                                                {getPriorityBadge(notif.priority)}
                                                {!notif.read_at && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-2 h-2 rounded-full bg-blue-500"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(notif.created_at)}
                                                </span>
                                                <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                                    Baca selengkapnya →
                                                </span>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                openDeleteDialog(notif.id); 
                                            }}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {notifications.data.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-12 text-center"
                            >
                                <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada notifikasi</p>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                    Notifikasi baru akan muncul di sini
                                </p>
                            </motion.div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {notifications.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {Array.from({ length: notifications.last_page }, (_, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.get('/user/notifications', { page: i + 1 })}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        notifications.current_page === i + 1 
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {i + 1}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {detailModal.open && detailModal.notification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setDetailModal({ open: false, notification: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-2xl border border-slate-200 dark:border-slate-800/50 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${getTypeColor(detailModal.notification.type)} shadow-lg`}>
                                        {getTypeIcon(detailModal.notification.type)}
                                    </div>
                                    <div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium bg-gradient-to-r ${getTypeColor(detailModal.notification.type)} text-white`}>
                                            {getTypeLabel(detailModal.notification.type)}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                                            {detailModal.notification.title}
                                        </h3>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDetailModal({ open: false, notification: null })}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>
                            
                            <div className="mb-4 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatFullDate(detailModal.notification.created_at)}
                                </div>
                                {getPriorityBadge(detailModal.notification.priority)}
                            </div>

                            <div className="mb-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {detailModal.notification.message}
                                    </p>
                                </div>
                            </div>

                            {detailModal.notification.action_url && (
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href={detailModal.notification.action_url}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg hover:shadow-blue-500/50 transition-all mb-6"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Lihat Detail Terkait
                                </motion.a>
                            )}

                            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openDeleteDialog(detailModal.notification!.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDetailModal({ open: false, notification: null })}
                                    className="ml-auto px-6 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white font-medium hover:from-slate-600 hover:to-slate-800 transition-all"
                                >
                                    Tutup
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                onConfirm={handleDelete}
                title="Hapus Notifikasi"
                message="Yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </StudentLayout>
    );
}
