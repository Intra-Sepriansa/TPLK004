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
    Bookmark,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    Copy,
    ExternalLink,
    Eye,
    Info,
    Mail,
    Megaphone,
    MessageCircle,
    MousePointer,
    Send,
    Share2,
    Sparkles,
    Trash2,
    User,
    Volume2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import NotificationIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import NotificationTotalIcon from '@/assets/admin/notification-center/total.png';
import NotificationUnreadIcon from '@/assets/admin/notification-center/unread.png';
import NotificationRecipientsIcon from '@/assets/admin/notification-center/recipients.png';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    priority: string;
    action_url: string | null;
    created_at: string;
    read_at: string | null;
    metadata: Record<string, string> | null;
}

interface RelatedNotification {
    id: number;
    title: string;
    type: string;
    priority: string;
    created_at: string;
    read_at: string | null;
}

interface SenderInfo {
    type: string;
    name: string;
    identifier: string;
    email: string | null;
}

interface Props {
    notification: Notification;
    relatedNotifications: RelatedNotification[];
    senderInfo: SenderInfo;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

export default function NotificationDetail({ notification, relatedNotifications, senderInfo }: Props) {
    const [isSaved, setIsSaved] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

    const typeConfig: Record<string, { icon: typeof Info; color: string; label: string; bg: string }> = {
        info: { icon: Info, color: 'blue', label: 'Informasi', bg: 'from-blue-500 to-cyan-500' },
        reminder: { icon: Clock, color: 'amber', label: 'Pengingat', bg: 'from-amber-500 to-orange-500' },
        announcement: { icon: Megaphone, color: 'purple', label: 'Pengumuman', bg: 'from-purple-500 to-violet-500' },
        alert: { icon: AlertTriangle, color: 'red', label: 'Peringatan', bg: 'from-red-500 to-rose-500' },
        warning: { icon: AlertTriangle, color: 'orange', label: 'Perhatian', bg: 'from-orange-500 to-amber-500' },
        achievement: { icon: Award, color: 'emerald', label: 'Pencapaian', bg: 'from-emerald-500 to-teal-500' },
    };

    const config = typeConfig[notification.type] || typeConfig.info;
    const TypeIcon = config.icon;

    const formattedDate = useMemo(() => {
        return new Date(notification.created_at).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, [notification.created_at]);

    const getTimeAgo = (dateStr: string) => {
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

    const readingTime = useMemo(() => {
        const words = notification.message.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return minutes < 1 ? '< 1 menit' : `${minutes} menit`;
    }, [notification.message]);

    const handleShare = (platform: string) => {
        const text = `${notification.title}\n\n${notification.message}`;
        const url = window.location.href;
        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
                break;
            case 'telegram':
                window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(text + '\n\n' + url);
                toast.success('Link berhasil disalin!');
                break;
        }
        setShowShareMenu(false);
    };

    const handleTextToSpeech = () => {
        if (!('speechSynthesis' in window)) {
            toast.error('Browser Anda tidak mendukung fitur text-to-speech');
            return;
        }
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(`${notification.title}. ${notification.message}`);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/notifications/${deleteDialog.id}`, {
                onSuccess: () => {
                    setDeleteDialog({ open: false, id: null });
                },
            });
        }
    };

    const getTypeBadgeClasses = (type: string) => {
        const map: Record<string, string> = {
            info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            reminder: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            announcement: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            alert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            achievement: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        };
        return map[type] || map.info;
    };

    return (
        <StudentLayout>
            <Head title={`Detail Notifikasi - ${notification.title}`} />

            <motion.div className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">
                {/* ═══════ HEADER ═══════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/notifications')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar
                        </motion.button>

                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                >
                                    <img
                                        src={NotificationIcon}
                                        alt="Detail Notifikasi"
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
                                        Detail Notifikasi
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Informasi lengkap notifikasi yang diterima
                                    </motion.p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsSaved(!isSaved)}
                                    className={cn(
                                        'flex items-center gap-2 rounded-2xl border px-4 py-3 font-semibold text-white shadow-lg backdrop-blur-xl transition-all',
                                        isSaved ? 'border-amber-400/40 bg-amber-500/30' : 'border-white/10 bg-white/20 hover:bg-white/30',
                                    )}
                                >
                                    <Bookmark className={cn('h-5 w-5', isSaved && 'fill-current')} />
                                    <span className="hidden sm:inline">{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                                </motion.button>

                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/20 px-4 py-3 font-semibold text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
                                    >
                                        <Share2 className="h-5 w-5" />
                                        <span className="hidden sm:inline">Bagikan</span>
                                    </motion.button>

                                    <AnimatePresence>
                                        {showShareMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
                                            >
                                                <div className="p-2">
                                                    <button
                                                        onClick={() => handleShare('whatsapp')}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                    >
                                                        <MessageCircle className="h-4 w-4 text-green-600" />
                                                        WhatsApp
                                                    </button>
                                                    <button
                                                        onClick={() => handleShare('telegram')}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                    >
                                                        <Send className="h-4 w-4 text-blue-600" />
                                                        Telegram
                                                    </button>
                                                    <button
                                                        onClick={() => handleShare('copy')}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        Salin Link
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ STATS CARDS ═══════ */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                    {[
                        {
                            icon: NotificationTotalIcon,
                            label: 'Tipe Notifikasi',
                            value: config.label,
                            gradientBg: 'from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10',
                            orbColor: 'bg-indigo-500',
                        },
                        {
                            icon: NotificationRecipientsIcon,
                            label: 'Pengirim',
                            value: senderInfo.name,
                            subtext: senderInfo.type,
                            gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                            orbColor: 'bg-emerald-500',
                        },
                        {
                            icon: NotificationUnreadIcon,
                            label: 'Waktu Diterima',
                            value: getTimeAgo(notification.created_at),
                            subtext: formattedDate.split(',')[0],
                            gradientBg: 'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10',
                            orbColor: 'bg-blue-500',
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: { delay: 0.1 + index * 0.05, type: 'spring', stiffness: 300, damping: 20 },
                            }}
                            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradientBg}`} />
                            <motion.div
                                className={cn('absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl', stat.orbColor)}
                            />
                            <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                <motion.div whileHover={{ scale: 1.1 }} className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14">
                                    <img src={stat.icon} alt={stat.label} className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]" loading="lazy" />
                                </motion.div>
                                <div>
                                    <p className="text-[10px] font-medium leading-tight text-neutral-500 sm:text-sm dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <div className="mt-0.5 sm:mt-1">
                                        <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">{stat.value}</span>
                                    </div>
                                    {stat.subtext && <p className="mt-0.5 text-[10px] text-neutral-400 sm:text-xs">{stat.subtext}</p>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ═══════ MAIN CONTENT GRID ═══════ */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN - Main Content */}
                    <motion.div variants={itemVariants} className="space-y-6 lg:col-span-2">
                        {/* Main Notification Card */}
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl md:p-8 dark:border-white/5 dark:bg-neutral-900/40">
                            {/* Type & Priority Badges */}
                            <div className="mb-6 flex flex-wrap items-center gap-2">
                                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium', getTypeBadgeClasses(notification.type))}>
                                    <TypeIcon className="h-4 w-4" />
                                    {config.label}
                                </span>
                                {notification.priority === 'urgent' && (
                                    <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        🔥 Mendesak
                                    </span>
                                )}
                                {notification.priority === 'high' && (
                                    <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                        ⚠️ Penting
                                    </span>
                                )}
                                {notification.read_at && (
                                    <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
                                        Sudah Dibaca
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h2 className="mb-4 text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">{notification.title}</h2>

                            {/* Metadata Line */}
                            <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-neutral-200/50 pb-6 text-sm text-neutral-500 dark:border-white/5 dark:text-neutral-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formattedDate}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Waktu baca: {readingTime}
                                </div>
                                {notification.read_at && (
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Dibaca {getTimeAgo(notification.read_at)}
                                    </div>
                                )}
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <p className="text-lg leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{notification.message}</p>
                            </div>

                            {/* Action URL */}
                            {notification.action_url && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-900/30 dark:from-blue-900/20 dark:to-cyan-900/20"
                                >
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <MousePointer className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-blue-900 dark:text-blue-100">Action Tersedia</p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">Klik tombol di bawah untuk melanjutkan</p>
                                        </div>
                                    </div>
                                    <motion.a
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        href={notification.action_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-cyan-600"
                                    >
                                        Lihat Detail
                                        <ExternalLink className="h-4 w-4" />
                                    </motion.a>
                                </motion.div>
                            )}

                            {/* Metadata */}
                            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                <div className="mt-6 border-t border-neutral-200/50 pt-6 dark:border-white/5">
                                    <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Informasi Tambahan</h3>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {Object.entries(notification.metadata).map(([key, value]) => (
                                            <div key={key} className="rounded-xl bg-neutral-50/80 p-3 dark:bg-neutral-800/50">
                                                <p className="mb-1 text-xs text-neutral-500">
                                                    {key
                                                        .replace(/_/g, ' ')
                                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </p>
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bottom Actions */}
                            <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-200/50 pt-6 dark:border-white/5">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleTextToSpeech}
                                    className={cn(
                                        'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                                        isSpeaking
                                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800',
                                    )}
                                >
                                    <Volume2 className={cn('h-4 w-4', isSpeaking && 'animate-pulse')} />
                                    {isSpeaking ? 'Hentikan' : 'Baca Keras'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDeleteDialog({ open: true, id: notification.id })}
                                    className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </motion.button>
                            </div>
                        </div>

                        {/* Related Notifications */}
                        {relatedNotifications.length > 0 && (
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    Notifikasi Terkait
                                </h3>

                                <div className="space-y-3">
                                    {relatedNotifications.map((related, idx) => {
                                        const relatedConfig = typeConfig[related.type] || typeConfig.info;
                                        const RelIcon = relatedConfig.icon;
                                        return (
                                            <motion.button
                                                key={related.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.08 }}
                                                onClick={() => router.visit(`/user/notifications/${related.id}`)}
                                                className="group flex w-full items-center gap-4 rounded-xl border border-neutral-200/50 p-4 text-left transition-all hover:bg-neutral-50 dark:border-white/5 dark:hover:bg-neutral-800/50"
                                            >
                                                <div
                                                    className={cn(
                                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg',
                                                        relatedConfig.bg,
                                                    )}
                                                >
                                                    <RelIcon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-neutral-900 dark:text-white">{related.title}</p>
                                                    <p className="text-sm text-neutral-500">{getTimeAgo(related.created_at)}</p>
                                                </div>
                                                {!related.read_at && <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                                                <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* RIGHT COLUMN */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        {/* Sender Info */}
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                <User className="h-5 w-5 text-blue-500" />
                                Informasi Pengirim
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-lg font-bold text-white">
                                        {senderInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">{senderInfo.name}</p>
                                        <p className="text-sm text-neutral-500">{senderInfo.type}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t border-neutral-200/50 pt-4 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                            <User className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500">ID</p>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{senderInfo.identifier}</p>
                                        </div>
                                    </div>

                                    {senderInfo.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                                <Mail className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-neutral-500">Email</p>
                                                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{senderInfo.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Quick Actions</h3>

                            <div className="space-y-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.visit('/user/notifications')}
                                    className="flex w-full items-center gap-3 rounded-xl border border-neutral-200/50 px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-white/5 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    <Bell className="h-4 w-4" />
                                    Lihat Semua Notifikasi
                                </motion.button>

                                {notification.action_url && (
                                    <motion.a
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        href={notification.action_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center gap-3 rounded-xl border border-neutral-200/50 px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-white/5 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Buka Link
                                    </motion.a>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setIsSaved(!isSaved);
                                        toast.success(isSaved ? 'Dihapus dari tersimpan' : 'Notifikasi disimpan!');
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl border border-neutral-200/50 px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-white/5 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current text-amber-500')} />
                                    {isSaved ? 'Hapus dari Tersimpan' : 'Simpan Notifikasi'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleTextToSpeech}
                                    className="flex w-full items-center gap-3 rounded-xl border border-neutral-200/50 px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-white/5 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    <Volume2 className={cn('h-4 w-4', isSpeaking && 'animate-pulse text-indigo-500')} />
                                    {isSpeaking ? 'Hentikan Pembacaan' : 'Baca Notifikasi'}
                                </motion.button>
                            </div>
                        </div>

                        

                        {/* Stats Card */}
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Statistik</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Status</span>
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-1 text-xs font-medium',
                                            notification.read_at
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                        )}
                                    >
                                        {notification.read_at ? 'Sudah Dibaca' : 'Belum Dibaca'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Prioritas</span>
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-1 text-xs font-medium',
                                            notification.priority === 'urgent'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : notification.priority === 'high'
                                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
                                        )}
                                    >
                                        {notification.priority === 'urgent' ? 'Mendesak' : notification.priority === 'high' ? 'Penting' : 'Normal'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Waktu Baca</span>
                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{readingTime}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Tersimpan</span>
                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{isSaved ? 'Ya' : 'Tidak'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
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
