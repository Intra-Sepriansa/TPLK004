import { AnimatedCounter } from '@/components/ui/animated-counter';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Award,
    Bell,
    CheckCircle,
    Clock,
    ExternalLink,
    Filter,
    Info,
    Megaphone,
    RefreshCw,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

import NotificationIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import NotificationTotalIcon from '@/assets/admin/notification-center/total.png';
import NotificationApprovedIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import NotificationRejectedIcon from '@/assets/admin/verifikasi-selfie/ditolak.png';
import NotificationPendingIcon from '@/assets/admin/verifikasi-selfie/pending.png';

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
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
    };
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

export default function Notifications({
    notifications,
    unreadCount,
    stats,
}: Props) {
    const [detailModal, setDetailModal] = useState<{
        open: boolean;
        notification: Notification | null;
    }>({
        open: false,
        notification: null,
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({
        open: false,
        id: null,
    });
    const [filterType, setFilterType] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const handleMarkAsRead = (id: number) =>
        router.post(`/user/notifications/${id}/read`);
    const handleMarkAllAsRead = () =>
        router.post('/user/notifications/read-all');

    const openDeleteDialog = (id: number) =>
        setDeleteDialog({ open: true, id });
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/notifications/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
            setDetailModal({ open: false, notification: null });
        }
    };

    const handleFilter = () => {
        router.get(
            '/user/notifications',
            {
                type: filterType,
                priority: filterPriority,
                status: filterStatus,
            },
            { preserveState: true },
        );
    };

    const openDetail = (notif: Notification) => {
        setDetailModal({ open: true, notification: notif });
        if (!notif.read_at) {
            handleMarkAsRead(notif.id);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reminder':
                return <Clock className="h-5 w-5" />;
            case 'announcement':
                return <Megaphone className="h-5 w-5" />;
            case 'alert':
                return <AlertTriangle className="h-5 w-5" />;
            case 'achievement':
                return <Award className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'reminder':
                return 'from-blue-500 to-cyan-600';
            case 'announcement':
                return 'from-purple-500 to-violet-600';
            case 'alert':
                return 'from-red-500 to-rose-600';
            case 'achievement':
                return 'from-amber-500 to-orange-600';
            case 'warning':
                return 'from-orange-500 to-red-600';
            default:
                return 'from-slate-500 to-slate-600';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'reminder':
                return 'Pengingat';
            case 'announcement':
                return 'Pengumuman';
            case 'alert':
                return 'Peringatan';
            case 'achievement':
                return 'Pencapaian';
            case 'warning':
                return 'Peringatan';
            default:
                return 'Informasi';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Urgent
                    </span>
                );
            case 'high':
                return (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Penting
                    </span>
                );
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
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
        });
    };

    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <StudentLayout>
            <Head title="Notifikasi" />

            <div className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/dashboard')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={NotificationIcon}
                                        alt="Notifikasi"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Pusat Pemberitahuan
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Notifikasi
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Pemberitahuan dan pengumuman terbaru
                                        untuk Anda
                                    </motion.p>
                                </div>
                            </div>

                            {unreadCount > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/20 px-6 py-3 font-semibold text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    Tandai Semua Dibaca
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {[
                        {
                            icon: NotificationTotalIcon,
                            label: 'Total Notifikasi',
                            value: stats.total,
                            gradientBg:
                                'from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10',
                            orbColor: 'bg-indigo-500',
                            delay: 0.1,
                        },
                        {
                            icon: NotificationRejectedIcon,
                            label: 'Belum Dibaca',
                            value: stats.unread,
                            gradientBg:
                                'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
                            orbColor: 'bg-rose-500',
                            delay: 0.15,
                        },
                        {
                            icon: NotificationApprovedIcon,
                            label: 'Sudah Dibaca',
                            value: stats.read,
                            gradientBg:
                                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                            orbColor: 'bg-emerald-500',
                            delay: 0.2,
                        },
                        {
                            icon: NotificationPendingIcon,
                            label: 'Urgent',
                            value: stats.urgent,
                            gradientBg:
                                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                            orbColor: 'bg-amber-500',
                            delay: 0.25,
                        },
                    ].map((stat, index) => {
                        const cardKey = `stat-${index}`;

                        return (
                            <motion.div
                                key={stat.label}
                                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all hover:shadow-indigo-500/10 sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        delay: stat.delay,
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    },
                                }}
                                whileHover={{
                                    scale: 1.04,
                                    y: -4,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 15,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(cardKey)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradientBg}`}
                                />
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale:
                                            hoveredCard === cardKey ? 1.5 : 1,
                                        opacity:
                                            hoveredCard === cardKey ? 0.4 : 0.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={cn(
                                        'absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500',
                                        stat.orbColor,
                                    )}
                                />

                                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                    >
                                        <img
                                            src={stat.icon}
                                            alt={stat.label}
                                            className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
                                            loading="lazy"
                                        />
                                    </motion.div>

                                    <div>
                                        <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                            {stat.label}
                                        </p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                                <AnimatedCounter
                                                    value={stat.value}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Filter Notifikasi
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Saring notifikasi berdasarkan kategori
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tipe
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full rounded-xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-neutral-900 backdrop-blur-xl transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/5 dark:bg-neutral-800/60 dark:text-white"
                            >
                                <option value="all">Semua Tipe</option>
                                <option value="reminder">Pengingat</option>
                                <option value="announcement">Pengumuman</option>
                                <option value="alert">Peringatan</option>
                                <option value="achievement">Pencapaian</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Prioritas
                            </label>
                            <select
                                value={filterPriority}
                                onChange={(e) =>
                                    setFilterPriority(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-neutral-900 backdrop-blur-xl transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/5 dark:bg-neutral-800/60 dark:text-white"
                            >
                                <option value="all">Semua Prioritas</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">Penting</option>
                                <option value="normal">Normal</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-neutral-900 backdrop-blur-xl transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/5 dark:bg-neutral-800/60 dark:text-white"
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
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Terapkan Filter
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Notifications List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-white/10 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                <Bell className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Daftar Notifikasi
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {notifications.data.length} notifikasi
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-white/10 dark:divide-white/5">
                        <AnimatePresence>
                            {notifications.data.map((notif, index) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{
                                        delay: 0.35 + index * 0.04,
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    className={cn(
                                        'group relative overflow-hidden',
                                        !notif.read_at &&
                                            'bg-indigo-50/30 dark:bg-indigo-900/10',
                                    )}
                                >
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        className={`absolute inset-0 bg-gradient-to-r ${getTypeColor(notif.type)} opacity-0 transition-opacity group-hover:opacity-5`}
                                    />

                                    <motion.div
                                        whileHover={{
                                            scale: 1.01,
                                            y: -2,
                                            transition: {
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 15,
                                            },
                                        }}
                                        className="relative cursor-pointer p-5"
                                        onClick={() => openDetail(notif)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.15,
                                                    rotate: [0, -5, 5, 0],
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="relative"
                                            >
                                                <div
                                                    className={`absolute inset-0 bg-gradient-to-br ${getTypeColor(notif.type)} rounded-xl opacity-50 blur-lg`}
                                                />
                                                <div
                                                    className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${getTypeColor(notif.type)} shrink-0 text-white shadow-xl`}
                                                >
                                                    {getTypeIcon(notif.type)}
                                                </div>
                                            </motion.div>

                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold tracking-wider uppercase ${getTypeColor(notif.type)} text-white shadow-lg`}
                                                    >
                                                        {getTypeLabel(
                                                            notif.type,
                                                        )}
                                                    </span>
                                                    {getPriorityBadge(
                                                        notif.priority,
                                                    )}
                                                    {!notif.read_at && (
                                                        <motion.div
                                                            initial={{
                                                                scale: 0,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                            }}
                                                            className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900/30"
                                                        >
                                                            <motion.span
                                                                animate={{
                                                                    scale: [
                                                                        1, 1.3,
                                                                        1,
                                                                    ],
                                                                }}
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Infinity,
                                                                }}
                                                                className="h-2 w-2 rounded-full bg-blue-500"
                                                            />
                                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                                Baru
                                                            </span>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <h3 className="mb-2 text-lg font-bold text-neutral-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                                                    {notif.title}
                                                </h3>
                                                <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {formatTime(
                                                            notif.created_at,
                                                        )}
                                                    </span>
                                                    <motion.span
                                                        whileHover={{ x: 3 }}
                                                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:underline dark:text-indigo-300"
                                                    >
                                                        Baca selengkapnya
                                                        <motion.span
                                                            animate={{
                                                                x: [0, 3, 0],
                                                            }}
                                                            transition={{
                                                                duration: 1.5,
                                                                repeat: Infinity,
                                                            }}
                                                        >
                                                            →
                                                        </motion.span>
                                                    </motion.span>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{
                                                    scale: 1.15,
                                                    rotate: 10,
                                                }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteDialog(notif.id);
                                                }}
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-red-600 transition-all hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900/50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ width: '0%' }}
                                        whileHover={{ width: '100%' }}
                                        transition={{ duration: 0.3 }}
                                        className={`h-1 bg-gradient-to-r ${getTypeColor(notif.type)}`}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {notifications.data.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-12 text-center"
                            >
                                <Bell className="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
                                <p className="font-medium text-neutral-500 dark:text-neutral-400">
                                    Tidak ada notifikasi
                                </p>
                                <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                                    Notifikasi baru akan muncul di sini
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Pagination */}
                    {notifications.last_page > 1 && (
                        <div className="flex justify-center gap-2 border-t border-white/10 p-4 dark:border-white/5">
                            {Array.from(
                                { length: notifications.last_page },
                                (_, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                            router.get('/user/notifications', {
                                                page: i + 1,
                                            })
                                        }
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                            notifications.current_page === i + 1
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                : 'border border-white/20 bg-white/60 text-neutral-700 backdrop-blur-xl hover:bg-white/80 dark:border-white/5 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-700/70'
                                        }`}
                                    >
                                        {i + 1}
                                    </motion.button>
                                ),
                            )}
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        onClick={() =>
                            setDetailModal({ open: false, notification: null })
                        }
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95"
                        >
                            <div className="mb-6 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${getTypeColor(detailModal.notification.type)} shadow-lg`}
                                    >
                                        {getTypeIcon(
                                            detailModal.notification.type,
                                        )}
                                    </div>
                                    <div>
                                        <span
                                            className={`rounded-full bg-gradient-to-r px-2 py-1 text-xs font-medium ${getTypeColor(detailModal.notification.type)} text-white`}
                                        >
                                            {getTypeLabel(
                                                detailModal.notification.type,
                                            )}
                                        </span>
                                        <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
                                            {detailModal.notification.title}
                                        </h3>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                        setDetailModal({
                                            open: false,
                                            notification: null,
                                        })
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            <div className="mb-4 flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatFullDate(
                                        detailModal.notification.created_at,
                                    )}
                                </div>
                                {getPriorityBadge(
                                    detailModal.notification.priority,
                                )}
                            </div>

                            <div className="mb-6">
                                <div className="rounded-2xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60">
                                    <p className="leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                        {detailModal.notification.message}
                                    </p>
                                </div>
                            </div>

                            {detailModal.notification.action_url && (
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href={detailModal.notification.action_url}
                                    className="mb-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white shadow-lg transition-all hover:shadow-purple-500/50"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Lihat Detail Terkait
                                </motion.a>
                            )}

                            <div className="flex gap-2 border-t border-white/10 pt-4 dark:border-white/5">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        openDeleteDialog(
                                            detailModal.notification!.id,
                                        )
                                    }
                                    className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        setDetailModal({
                                            open: false,
                                            notification: null,
                                        })
                                    }
                                    className="ml-auto rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-2 font-medium text-white transition-all hover:from-slate-600 hover:to-slate-800"
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
                onOpenChange={(open) =>
                    setDeleteDialog({ open, id: open ? deleteDialog.id : null })
                }
                onConfirm={handleDelete}
                title="Hapus Notifikasi"
                message="Yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                theme="admin-dashboard"
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </StudentLayout>
    );
}
