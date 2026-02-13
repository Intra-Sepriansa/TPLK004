import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NotificationComposer } from '@/components/dosen/notification-composer';
import { 
    Bell, Clock, Megaphone, AlertTriangle, Award, Info, CheckCircle, 
    ExternalLink, X, Trash2, Filter, Search, Archive, Star, Plus, Send, Sparkles
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
    created_by_type?: string;
    created_by_id?: number;
    metadata?: any;
}

interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
}

interface Course {
    id: number;
    nama: string;
}

interface Props {
    dosen: { id: number; nama: string };
    notifications: { data: Notification[]; current_page: number; last_page: number };
    unreadCount: number;
    course: Course | null;
    mahasiswa: Mahasiswa[];
    sentNotifications: Notification[];
}

export default function Notifications({ dosen, notifications, unreadCount, course, mahasiswa, sentNotifications }: Props) {
    const [detailModal, setDetailModal] = useState<{ open: boolean; notification: Notification | null }>({ open: false, notification: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
    const [composerOpen, setComposerOpen] = useState(false);

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
                {/* Header - Enhanced Black Theme */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Orbs */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1], 
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, 30, 0],
                            y: [0, -20, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1], 
                            opacity: [0.2, 0.4, 0.2],
                            x: [0, -30, 0],
                            y: [0, 20, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.25, 1], 
                            opacity: [0.25, 0.45, 0.25],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl"
                    />

                    {/* Floating Icons */}
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-8 right-32 opacity-10"
                    >
                        <Bell className="h-16 w-16" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-8 left-32 opacity-10"
                    >
                        <Megaphone className="h-12 w-12" />
                    </motion.div>
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2, rotate: 10 }}
                                    whileTap={{ scale: 0.95 }}
                                    animate={{ rotate: unreadCount > 0 ? [0, -10, 10, -10, 0] : 0 }}
                                    transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
                                >
                                    <Bell className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-gray-400"
                                    >
                                        Pemberitahuan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-2"
                                    >
                                        Notifikasi
                                        {unreadCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="px-3 py-1 rounded-full text-lg bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30"
                                            >
                                                <AnimatedCounter value={unreadCount} duration={1000} />
                                            </motion.span>
                                        )}
                                    </motion.h1>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {course && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button 
                                            onClick={() => setComposerOpen(true)}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/30"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Buat Notifikasi
                                        </Button>
                                    </motion.div>
                                )}
                                {unreadCount > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button onClick={handleMarkAllAsRead} className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Tandai Semua Dibaca
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-4 text-gray-400 flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            Pemberitahuan dan pengumuman terbaru untuk Anda
                        </motion.p>
                    </div>
                </motion.div>

                {/* Stats Cards - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="rounded-2xl border-2 border-gray-200/70 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-lg backdrop-blur dark:border-gray-800/70 dark:from-black dark:to-gray-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Notifikasi</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    <AnimatedCounter value={stats.total} duration={1500} />
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Semua pemberitahuan</p>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
                            >
                                <Bell className="h-7 w-7 text-white" />
                            </motion.div>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="rounded-2xl border-2 border-gray-200/70 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-lg backdrop-blur dark:border-gray-800/70 dark:from-black dark:to-gray-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Belum Dibaca</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">
                                    <AnimatedCounter value={stats.unread} duration={1500} />
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Perlu perhatian</p>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                animate={{ scale: stats.unread > 0 ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 1, repeat: stats.unread > 0 ? Infinity : 0, repeatDelay: 2 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30"
                            >
                                <AlertTriangle className="h-7 w-7 text-white" />
                            </motion.div>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="rounded-2xl border-2 border-gray-200/70 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-lg backdrop-blur dark:border-gray-800/70 dark:from-black dark:to-gray-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sudah Dibaca</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">
                                    <AnimatedCounter value={stats.read} duration={1500} />
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Telah ditinjau</p>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
                            >
                                <CheckCircle className="h-7 w-7 text-white" />
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Search & Filter - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="rounded-2xl border-2 border-gray-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <motion.div 
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600"
                        >
                            <Filter className="h-5 w-5 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Filter & Pencarian</h3>
                            <p className="text-xs text-gray-500">Temukan notifikasi dengan mudah</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari notifikasi..."
                                className="pl-10 border-2 focus:ring-4 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    filterType === 'all'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                Semua
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterType('unread')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    filterType === 'unread'
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                Belum Dibaca
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterType('read')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    filterType === 'read'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                Sudah Dibaca
                            </motion.button>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Menampilkan {filteredNotifications.length} dari {notifications.data.length} notifikasi</span>
                        {searchQuery && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSearchQuery('')}
                                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                            >
                                <X className="h-3 w-3" />
                                Clear
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Notifications List - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="rounded-2xl border-2 border-gray-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
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
                                    whileHover={{ 
                                        x: 5, 
                                        backgroundColor: !notif.read_at ? 'rgba(99, 102, 241, 0.08)' : 'rgba(59, 130, 246, 0.05)',
                                        scale: 1.01
                                    }}
                                    className={`p-5 transition-all cursor-pointer relative overflow-hidden ${
                                        !notif.read_at ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10' : ''
                                    }`}
                                >
                                    {/* Gradient Border Effect */}
                                    {!notif.read_at && (
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600"
                                        />
                                    )}

                                    <div className="flex items-start gap-4">
                                        <motion.div
                                            whileHover={{ scale: 1.15, rotate: 10 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 shadow-lg ${getTypeColor(notif.type)}`}
                                        >
                                            {getTypeIcon(notif.type)}
                                        </motion.div>
                                        <div className="flex-1 min-w-0" onClick={() => openDetail(notif)}>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-semibold text-gray-900 dark:text-white">{notif.title}</span>
                                                {getPriorityBadge(notif.priority)}
                                                {/* Show "Terkirim" badge for sent notifications */}
                                                {(notif as any).created_by_type === 'dosen' && (notif as any).created_by_id === dosen.id && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                                                        <Send className="h-3 w-3" />
                                                        Terkirim
                                                    </span>
                                                )}
                                                {!notif.read_at && (
                                                    <motion.span
                                                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(notif.created_at)}
                                                </span>
                                                <motion.span
                                                    whileHover={{ x: 5 }}
                                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                                >
                                                    Baca selengkapnya
                                                    <motion.span
                                                        animate={{ x: [0, 3, 0] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        →
                                                    </motion.span>
                                                </motion.span>
                                            </div>
                                        </div>
                                        <motion.div 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
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
                                className="p-16 text-center"
                            >
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="mb-6"
                                >
                                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                        <Bell className="h-12 w-12 text-gray-400" />
                                    </div>
                                </motion.div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {searchQuery || filterType !== 'all' 
                                        ? 'Tidak ada notifikasi yang sesuai' 
                                        : 'Tidak ada notifikasi'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {searchQuery || filterType !== 'all'
                                        ? 'Coba ubah filter atau kata kunci pencarian'
                                        : 'Notifikasi baru akan muncul di sini'}
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

            {/* Notification Composer */}
            <NotificationComposer
                isOpen={composerOpen}
                course={course}
                mahasiswa={mahasiswa}
                onClose={() => setComposerOpen(false)}
            />
        </DosenLayout>
    );
}
