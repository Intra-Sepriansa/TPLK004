import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    Bell, Clock, Megaphone, AlertTriangle, Award, Info, CheckCircle, 
    ExternalLink, X, Trash2, Filter, Search, Archive, Star
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Input } from '@/components/ui/input';

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
    dosen: { id: number; nama: string };
    notifications: { data: Notification[]; current_page: number; last_page: number };
    unreadCount: number;
}

export default function Notifications({ dosen, notifications, unreadCount }: Props) {
    const [detailModal, setDetailModal] = useState<{ open: boolean; notification: Notification | null }>({ open: false, notification: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');

    // Filter notifications
    const filteredNotifications = notifications.data.filter(notif => {
        const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            notif.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' ||
                            (filterType === 'unread' && !notif.read_at) ||
                            (filterType === 'read' && notif.read_at);
        return matchesSearch && matchesFilter;
    });

    // Calculate stats
    const stats = {
        total: notifications.data.length,
        unread: unreadCount,
        read: notifications.data.length - unreadCount,
    };

    const handleMarkAsRead = (id: number) => router.post(`/dosen/notifications/${id}/read`);
    const handleMarkAllAsRead = () => router.post('/dosen/notifications/read-all');
    
    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/dosen/notifications/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
            setDetailModal({ open: false, notification: null });
        }
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
            case 'reminder': return 'bg-blue-100 text-blue-700';
            case 'announcement': return 'bg-purple-100 text-purple-700';
            case 'alert': return 'bg-red-100 text-red-700';
            case 'achievement': return 'bg-yellow-100 text-yellow-700';
            case 'warning': return 'bg-orange-100 text-orange-700';
            default: return 'bg-slate-100 text-slate-700';
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
            case 'urgent': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Urgent</span>;
            case 'high': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Penting</span>;
            default: return null;
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
        <DosenLayout dosen={dosen}>
            <Head title="Notifikasi" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    animate={{ rotate: unreadCount > 0 ? [0, -10, 10, -10, 0] : 0 }}
                                    transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                >
                                    <Bell className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-blue-100">Pemberitahuan</p>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        Notifikasi
                                        {unreadCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="px-2 py-0.5 rounded-full text-sm bg-white/20"
                                            >
                                                <AnimatedCounter value={unreadCount} duration={1000} />
                                            </motion.span>
                                        )}
                                    </h1>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button onClick={handleMarkAllAsRead} className="bg-white/20 hover:bg-white/30 text-white border-0">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Tandai Semua Dibaca
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                        <p className="mt-4 text-blue-100">Pemberitahuan dan pengumuman terbaru</p>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                            >
                                <Bell className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-gray-500">Total Notifikasi</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    <AnimatedCounter value={stats.total} duration={1500} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                animate={{ scale: stats.unread > 0 ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 1, repeat: stats.unread > 0 ? Infinity : 0, repeatDelay: 2 }}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                            >
                                <AlertTriangle className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-gray-500">Belum Dibaca</p>
                                <p className="text-xl font-bold text-orange-600">
                                    <AnimatedCounter value={stats.unread} duration={1500} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30"
                            >
                                <CheckCircle className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-gray-500">Sudah Dibaca</p>
                                <p className="text-xl font-bold text-green-600">
                                    <AnimatedCounter value={stats.read} duration={1500} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Search & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari notifikasi..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterType === 'all'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        >
                            Semua
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterType('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterType === 'unread'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        >
                            Belum Dibaca
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterType('read')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterType === 'read'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        >
                            Sudah Dibaca
                        </motion.button>
                    </div>
                </motion.div>

                {/* Notifications List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black overflow-hidden"
                >
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notif, idx) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                    className={`p-4 transition-colors cursor-pointer ${!notif.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${getTypeColor(notif.type)}`}
                                        >
                                            {getTypeIcon(notif.type)}
                                        </motion.div>
                                        <div className="flex-1 min-w-0" onClick={() => openDetail(notif)}>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-gray-900 dark:text-white">{notif.title}</span>
                                                {getPriorityBadge(notif.priority)}
                                                {!notif.read_at && (
                                                    <motion.span
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 1, repeat: Infinity }}
                                                        className="w-2 h-2 rounded-full bg-blue-500"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(notif.created_at)}
                                                </span>
                                                <motion.span
                                                    whileHover={{ x: 5 }}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Baca selengkapnya →
                                                </motion.span>
                                            </div>
                                        </div>
                                        <motion.div whileTap={{ scale: 0.9 }}>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-600 shrink-0"
                                                onClick={(e) => { e.stopPropagation(); openDeleteDialog(notif.id); }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {filteredNotifications.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-12 text-center"
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                </motion.div>
                                <p className="text-gray-500">
                                    {searchQuery || filterType !== 'all' 
                                        ? 'Tidak ada notifikasi yang sesuai' 
                                        : 'Tidak ada notifikasi'}
                                </p>
                            </motion.div>
                        )}
                    </div>
                    {notifications.last_page > 1 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-center gap-2">
                            {Array.from({ length: notifications.last_page }, (_, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.get('/dosen/notifications', { page: i + 1 })}
                                    className={`px-3 py-1 rounded text-sm ${notifications.current_page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
                                >
                                    {i + 1}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {detailModal.open && detailModal.notification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setDetailModal({ open: false, notification: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-black max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${getTypeColor(detailModal.notification.type)}`}
                                    >
                                        {getTypeIcon(detailModal.notification.type)}
                                    </motion.div>
                                    <div>
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(detailModal.notification.type)}`}
                                        >
                                            {getTypeLabel(detailModal.notification.type)}
                                        </motion.span>
                                        <motion.h3
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="text-lg font-semibold text-gray-900 dark:text-white mt-1"
                                        >
                                            {detailModal.notification.title}
                                        </motion.h3>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDetailModal({ open: false, notification: null })}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mb-4 flex items-center gap-2 text-sm text-gray-500"
                            >
                                <Clock className="h-4 w-4" />
                                {formatFullDate(detailModal.notification.created_at)}
                                {getPriorityBadge(detailModal.notification.priority)}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="prose prose-slate dark:prose-invert max-w-none"
                            >
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {detailModal.notification.message}
                                </div>
                            </motion.div>

                            {detailModal.notification.action_url && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-4"
                                >
                                    <motion.a
                                        whileHover={{ x: 5 }}
                                        href={detailModal.notification.action_url}
                                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Lihat Detail Terkait
                                    </motion.a>
                                </motion.div>
                            )}

                            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <motion.div whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => openDeleteDialog(detailModal.notification!.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus
                                    </Button>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.95 }} className="ml-auto">
                                    <Button onClick={() => setDetailModal({ open: false, notification: null })}>
                                        Tutup
                                    </Button>
                                </motion.div>
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
        </DosenLayout>
    );
}
