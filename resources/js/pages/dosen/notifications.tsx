import ReadNotifIcon from '@/assets/admin/bulk-import/berhasil.png';
import NotifIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import UnreadNotifIcon from '@/assets/admin/notification-center/scheduled.png';
import TotalNotifIcon from '@/assets/admin/notification-center/total.png';
import SentNotifIcon from '@/assets/admin/notification-center/unread.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Award,
    Bell,
    CheckCircle,
    Clock,
    ExternalLink,
    Filter,
    Inbox,
    Info,
    Megaphone,
    Plus,
    RefreshCw,
    Search,
    Send,
    ShieldAlert,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type:
        | 'reminder'
        | 'announcement'
        | 'alert'
        | 'achievement'
        | 'warning'
        | 'info';
    priority: 'normal' | 'high' | 'urgent';
    action_url: string | null;
    action_label: string | null;
    read_at: string | null;
    created_at: string;
    created_by_type: string;
    created_by_id: number;
    metadata: any;
}

interface NotificationStats {
    total: number;
    unread: number;
    read: number;
    sent_today: number;
    sent_this_week: number;
    sent_this_month: number;
}

interface Props {
    dosen: { id: number; nama: string; nidn: string; email: string };
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        total: number;
    };
    sentNotifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: NotificationStats;
    courses: Array<{ id: number; nama: string; kode: string }>;
    mahasiswa: Array<{ id: number; nama: string; nim: string }>;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
} as const;

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
            return <ShieldAlert className="h-5 w-5" />;
        default:
            return <Info className="h-5 w-5" />;
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'reminder':
            return 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
        case 'announcement':
            return 'text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
        case 'alert':
            return 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
        case 'achievement':
            return 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
        case 'warning':
            return 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
        default:
            return 'text-neutral-700 bg-neutral-100 dark:bg-neutral-900/30 dark:text-neutral-400';
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
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
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

export default function Notifications({
    dosen,
    notifications,
    sentNotifications,
    stats,
}: Props) {
    const [detailModal, setDetailModal] = useState<{
        open: boolean;
        notification: Notification | null;
    }>({ open: false, notification: null });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const activeNotifications =
        activeTab === 'inbox' ? notifications : sentNotifications;

    const filteredNotifications = activeNotifications.data.filter((notif) => {
        const matchesSearch =
            notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notif.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
            filterType === 'all' ||
            notif.type === filterType ||
            (filterType === 'urgent' && notif.priority === 'urgent');
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'unread' && !notif.read_at) ||
            (filterStatus === 'read' && notif.read_at);
        return matchesSearch && matchesType && matchesStatus;
    });

    const notifCards = [
        {
            key: 'total',
            label: 'Total Notifikasi',
            value: stats.total,
            sub: 'semua pemberitahuan',
            imgSrc: TotalNotifIcon,
            color: 'bg-indigo-500',
            from: 'from-indigo-400',
            to: 'to-purple-600',
            shadow: 'shadow-indigo-500/30',
            hoverShadow: 'hover:shadow-indigo-500/10',
            gradientBg:
                'from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10',
            float: false,
        },
        {
            key: 'unread',
            label: 'Belum Dibaca',
            value: stats.unread,
            sub: 'perlu perhatian',
            imgSrc: UnreadNotifIcon,
            color: 'bg-orange-500',
            from: 'from-orange-400',
            to: 'to-red-600',
            shadow: 'shadow-orange-500/30',
            hoverShadow: 'hover:shadow-orange-500/10',
            gradientBg:
                'from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10',
            float: stats.unread > 0,
        },
        {
            key: 'read',
            label: 'Sudah Dibaca',
            value: stats.read,
            sub: 'telah ditinjau',
            imgSrc: ReadNotifIcon,
            color: 'bg-emerald-500',
            from: 'from-emerald-400',
            to: 'to-teal-600',
            shadow: 'shadow-emerald-500/30',
            hoverShadow: 'hover:shadow-emerald-500/10',
            gradientBg:
                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
            float: false,
        },
        {
            key: 'sent',
            label: 'Terkirim Hari Ini',
            value: stats.sent_today,
            sub: 'notifikasi terkirim',
            imgSrc: SentNotifIcon,
            color: 'bg-blue-500',
            from: 'from-sky-400',
            to: 'to-cyan-600',
            shadow: 'shadow-blue-500/30',
            hoverShadow: 'hover:shadow-blue-500/10',
            gradientBg:
                'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10',
            float: false,
        },
    ];

    const handleMarkAsRead = (id: number) =>
        router.post(`/dosen/notifications/${id}/read`);
    const handleMarkAllAsRead = () =>
        router.post('/dosen/notifications/read-all');
    const handleRefresh = () =>
        router.reload({
            only: ['notifications', 'sentNotifications', 'stats'],
        });

    const openDeleteDialog = (id: number) =>
        setDeleteDialog({ open: true, id });
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/dosen/notifications/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
            setDetailModal({ open: false, notification: null });
        }
    };

    const handleOpenDetail = (notif: Notification) => {
        setDetailModal({ open: true, notification: notif });
        if (!notif.read_at && activeTab === 'inbox') {
            handleMarkAsRead(notif.id);
        }
    };

    const handleResetFilters = () => {
        setFilterType('all');
        setFilterStatus('all');
        setSearchQuery('');
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Notifikasi" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* HEADER SECTION */}
                <motion.div
                    variants={itemVariants}
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

                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute top-1/2 right-16 h-32 w-32 -translate-y-1/2 rounded-full border-2 border-white/10"
                            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeOut',
                                delay: i,
                            }}
                        />
                    ))}

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
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
                                >
                                    <img
                                        src={NotifIcon}
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
                                        Pemberitahuan
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 flex items-center justify-center gap-3 text-2xl font-bold text-white sm:justify-start sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Notifikasi
                                        {stats.unread > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-2.5 py-0.5 text-sm text-white shadow-lg shadow-red-500/30"
                                            >
                                                <AnimatedCounter
                                                    value={stats.unread}
                                                    duration={1000}
                                                />
                                            </motion.span>
                                        )}
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

                            <div className="mt-2 flex w-full flex-col items-center gap-3 lg:mt-0 lg:w-auto lg:items-end">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-6 py-3 shadow-lg backdrop-blur-xl"
                                >
                                    <div className="rounded-lg bg-indigo-500/20 p-2">
                                        <Send className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100">
                                            Terkirim Bulan Ini
                                        </p>
                                        <p className="text-2xl font-bold text-white">
                                            <AnimatedCounter
                                                value={stats.sent_this_month}
                                                duration={1500}
                                            />
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2"
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.25)',
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() =>
                                            router.visit(
                                                '/dosen/notifications/create',
                                            )
                                        }
                                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
                                    >
                                        <Plus className="h-4 w-4" /> Buat
                                        Notifikasi
                                    </motion.button>
                                    {stats.unread > 0 && (
                                        <motion.button
                                            whileHover={{
                                                scale: 1.02,
                                                backgroundColor:
                                                    'rgba(255, 255, 255, 0.25)',
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleMarkAllAsRead}
                                            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
                                        >
                                            <CheckCircle className="h-4 w-4" />{' '}
                                            Tandai Dibaca
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.25)',
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleRefresh}
                                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
                                    >
                                        <RefreshCw className="h-4 w-4" />{' '}
                                        Refresh
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* SUMMARY CARDS */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                >
                    {notifCards.map((c, i) => (
                        <motion.div
                            key={c.key}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.95 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 100,
                                        damping: 15,
                                    },
                                },
                            }}
                            whileHover={{
                                y: -5,
                                scale: 1.02,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                },
                            }}
                            onHoverStart={() => setHoveredCard(c.key)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className={cn(
                                `group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40`,
                                c.hoverShadow,
                            )}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg} opacity-50 dark:opacity-100`}
                            />
                            <motion.div
                                className={cn(
                                    `absolute -top-8 -right-8 h-28 w-28 rounded-full blur-3xl transition-all`,
                                    c.color,
                                )}
                                animate={{
                                    opacity: hoveredCard === c.key ? 0.4 : 0.15,
                                }}
                            />
                            <div className="relative z-10 flex h-full flex-col items-center justify-between gap-3 sm:items-start sm:gap-4">
                                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        animate={{
                                            scale: c.float ? [1, 1.1, 1] : 1,
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: c.float ? Infinity : 0,
                                            repeatDelay: 2,
                                        }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                    >
                                        <img
                                            src={c.imgSrc}
                                            alt={c.label}
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                        />
                                    </motion.div>
                                    <div className="flex flex-col">
                                        <p className="mb-0.5 text-[10px] leading-tight font-medium text-neutral-500 sm:mb-1 sm:text-sm dark:text-neutral-400">
                                            {c.label}
                                        </p>
                                        <div className="flex items-baseline justify-center gap-2 sm:justify-start">
                                            <span className="text-xl leading-none font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                                <AnimatedCounter
                                                    value={c.value}
                                                    duration={1500}
                                                />
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[10px] text-neutral-400 sm:mt-1">
                                            {c.sub}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* TABS NAVIGATION */}
                <motion.div
                    variants={itemVariants}
                    className="flex w-fit gap-1 rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50"
                >
                    <motion.button
                        layout
                        onClick={() => setActiveTab('inbox')}
                        className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === 'inbox' ? 'text-indigo-700 shadow-sm dark:text-indigo-300' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'}`}
                    >
                        {activeTab === 'inbox' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-neutral-800"
                                transition={{
                                    type: 'spring',
                                    bounce: 0.2,
                                    duration: 0.6,
                                }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Inbox className="h-4 w-4" /> Inbox
                            {stats.unread > 0 && (
                                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                    {stats.unread}
                                </span>
                            )}
                        </span>
                    </motion.button>
                    <motion.button
                        layout
                        onClick={() => setActiveTab('sent')}
                        className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === 'sent' ? 'text-indigo-700 shadow-sm dark:text-indigo-300' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'}`}
                    >
                        {activeTab === 'sent' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-neutral-800"
                                transition={{
                                    type: 'spring',
                                    bounce: 0.2,
                                    duration: 0.6,
                                }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Send className="h-4 w-4" /> Terkirim
                        </span>
                    </motion.button>
                </motion.div>

                {/* FILTER & SEARCH */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                    <div className="mb-5 flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                        >
                            <Filter className="h-6 w-6" />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">
                                Filter & Pencarian
                            </h3>
                            <p className="text-sm text-neutral-500">
                                Temukan notifikasi dengan mudah
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Cari Notifikasi
                            </label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari judul atau pesan..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="border-2 pl-10 focus:ring-4 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tipe
                            </label>
                            <Select
                                value={filterType}
                                onValueChange={setFilterType}
                            >
                                <SelectTrigger className="border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Tipe
                                    </SelectItem>
                                    <SelectItem value="reminder">
                                        Pengingat
                                    </SelectItem>
                                    <SelectItem value="announcement">
                                        Pengumuman
                                    </SelectItem>
                                    <SelectItem value="alert">
                                        Peringatan
                                    </SelectItem>
                                    <SelectItem value="achievement">
                                        Pencapaian
                                    </SelectItem>
                                    <SelectItem value="warning">
                                        Warning
                                    </SelectItem>
                                    <SelectItem value="info">
                                        Informasi
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Status
                            </label>
                            <Select
                                value={filterStatus}
                                onValueChange={setFilterStatus}
                            >
                                <SelectTrigger className="border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="unread">
                                        Belum Dibaca
                                    </SelectItem>
                                    <SelectItem value="read">
                                        Sudah Dibaca
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-200/50 pt-4 dark:border-neutral-800">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterStatus('unread')}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filterStatus === 'unread' ? 'bg-orange-500 text-white' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}
                        >
                            <AlertTriangle className="h-4 w-4" /> Belum Dibaca
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterType('urgent')}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filterType === 'urgent' ? 'bg-red-500 text-white' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}
                        >
                            <AlertTriangle className="h-4 w-4" /> Urgent
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleResetFilters}
                            className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        >
                            <X className="h-4 w-4" /> Reset
                        </motion.button>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-neutral-200/50 pt-2 dark:border-neutral-800">
                        <span className="text-sm text-neutral-500">
                            Menampilkan {filteredNotifications.length} dari{' '}
                            {activeNotifications.data.length} notifikasi
                        </span>
                    </div>
                </motion.div>

                {/* NOTIFICATION LIST */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/50 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notif, idx) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: idx * 0.05,
                                    }}
                                    whileHover={{
                                        x: 5,
                                        backgroundColor:
                                            !notif.read_at &&
                                            activeTab === 'inbox'
                                                ? 'rgba(99, 102, 241, 0.08)'
                                                : 'rgba(59, 130, 246, 0.05)',
                                        scale: 1.01,
                                    }}
                                    className={`relative cursor-pointer overflow-hidden p-5 transition-all ${!notif.read_at && activeTab === 'inbox' ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10' : ''}`}
                                    onClick={() => handleOpenDetail(notif)}
                                >
                                    {!notif.read_at &&
                                        activeTab === 'inbox' && (
                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: idx * 0.05,
                                                }}
                                                className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600"
                                            />
                                        )}
                                    <div className="flex items-start gap-4">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.15,
                                                rotate: 10,
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg ${getTypeColor(notif.type)}`}
                                        >
                                            {getTypeIcon(notif.type)}
                                        </motion.div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {notif.title}
                                                </span>
                                                {getPriorityBadge(
                                                    notif.priority,
                                                )}
                                                {!notif.read_at &&
                                                    activeTab === 'inbox' && (
                                                        <motion.span
                                                            animate={{
                                                                scale: [
                                                                    1, 1.3, 1,
                                                                ],
                                                                opacity: [
                                                                    1, 0.7, 1,
                                                                ],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                            }}
                                                            className="flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50"
                                                        />
                                                    )}
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                                {notif.message}
                                            </p>
                                            <div className="mt-2 flex items-center gap-4">
                                                <span className="flex items-center gap-1 text-xs text-neutral-500">
                                                    <Clock className="h-3 w-3" />{' '}
                                                    {formatTime(
                                                        notif.created_at,
                                                    )}
                                                </span>
                                                <motion.span
                                                    whileHover={{ x: 5 }}
                                                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                                >
                                                    Baca selengkapnya{' '}
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
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="shrink-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteDialog(notif.id);
                                                }}
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
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="mb-6"
                                >
                                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                                        <Bell className="h-12 w-12 text-neutral-400" />
                                    </div>
                                </motion.div>
                                <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    Tidak ada notifikasi
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Notifikasi baru akan muncul di sini
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Pagination */}
                {activeNotifications.last_page > 1 && (
                    <motion.div
                        variants={itemVariants}
                        className="mt-6 flex justify-center gap-2"
                    >
                        {Array.from(
                            { length: activeNotifications.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <motion.button
                                key={page}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                    router.get('/dosen/notifications', {
                                        [activeTab === 'inbox'
                                            ? 'page'
                                            : 'sent_page']: page,
                                    })
                                }
                                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-all ${
                                    activeNotifications.current_page === page
                                        ? 'border border-transparent bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30'
                                        : 'border border-white/20 bg-white/50 text-neutral-600 backdrop-blur-md hover:bg-white dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                }`}
                            >
                                {page}
                            </motion.button>
                        ))}
                    </motion.div>
                )}

                {/* MODALS */}
                <AnimatePresence>
                    {detailModal.open && detailModal.notification && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            onClick={() =>
                                setDetailModal({
                                    open: false,
                                    notification: null,
                                })
                            }
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 17,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/90"
                            >
                                <div className="mb-6 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 17,
                                            }}
                                            className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${getTypeColor(detailModal.notification.type)}`}
                                        >
                                            {getTypeIcon(
                                                detailModal.notification.type,
                                            )}
                                        </motion.div>
                                        <div>
                                            <div className="flex gap-2">
                                                <motion.span
                                                    initial={{
                                                        opacity: 0,
                                                        x: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{ delay: 0.1 }}
                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(detailModal.notification.type)}`}
                                                >
                                                    {detailModal.notification.type.toUpperCase()}
                                                </motion.span>
                                                {getPriorityBadge(
                                                    detailModal.notification
                                                        .priority,
                                                )}
                                            </div>
                                            <motion.h3
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 }}
                                                className="mt-1 text-xl font-bold text-neutral-900 dark:text-white"
                                            >
                                                {detailModal.notification.title}
                                            </motion.h3>
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
                                        className="rounded-full bg-neutral-100 p-2 text-neutral-400 hover:text-neutral-700 dark:bg-neutral-800 dark:hover:text-white"
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.button>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-6 flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />{' '}
                                        {formatFullDate(
                                            detailModal.notification.created_at,
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="prose prose-slate dark:prose-invert max-w-none"
                                >
                                    <div className="rounded-2xl border border-neutral-100 bg-white p-6 leading-relaxed whitespace-pre-wrap text-neutral-700 shadow-inner dark:border-neutral-800 dark:bg-black dark:text-neutral-300">
                                        {detailModal.notification.message}
                                    </div>
                                </motion.div>

                                {detailModal.notification.action_url && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-6 flex justify-end"
                                    >
                                        <Button
                                            asChild
                                            className="group rounded-xl border-0 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700"
                                        >
                                            <a
                                                href={
                                                    detailModal.notification
                                                        .action_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-md flex items-center gap-2 font-bold"
                                            >
                                                {detailModal.notification
                                                    .action_label ||
                                                    'Buka Tautan'}
                                                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </a>
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({
                            open,
                            id: open ? deleteDialog.id : null,
                        })
                    }
                    onConfirm={handleDelete}
                    title="Hapus Notifikasi"
                    message="Yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    theme="admin-dashboard"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </motion.div>
        </DosenLayout>
    );
}
