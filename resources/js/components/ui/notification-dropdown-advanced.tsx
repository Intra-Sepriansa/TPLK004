import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { 
    Bell, X, Check, CheckCheck, Clock, AlertTriangle, Megaphone, 
    Award, Info, Trash2, ExternalLink, Volume2, VolumeX, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'reminder' | 'announcement' | 'alert' | 'achievement' | 'warning' | 'info' | 'attendance' | 'system';
    priority: 'normal' | 'high' | 'urgent';
    action_url: string | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationDropdownAdvancedProps {
    notifications: Notification[];
    unreadCount: number;
    baseUrl: string; // e.g., '/user/notifications', '/dosen/notifications', '/admin/notifications'
    allNotificationsUrl?: string; // URL to full notifications page
    onRefresh?: () => void;
    className?: string;
}

const typeConfig = {
    reminder: { icon: Clock, color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400', label: 'Pengingat' },
    announcement: { icon: Megaphone, color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400', label: 'Pengumuman' },
    alert: { icon: AlertTriangle, color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400', label: 'Peringatan' },
    achievement: { icon: Award, color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400', label: 'Pencapaian' },
    warning: { icon: AlertTriangle, color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400', label: 'Peringatan' },
    info: { icon: Info, color: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400', label: 'Informasi' },
    attendance: { icon: Check, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', label: 'Kehadiran' },
    system: { icon: Bell, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400', label: 'Sistem' },
};

const priorityConfig = {
    urgent: { badge: 'bg-red-500 text-white', label: 'Urgent', pulse: true },
    high: { badge: 'bg-orange-500 text-white', label: 'Penting', pulse: false },
    normal: { badge: '', label: '', pulse: false },
};

export function NotificationDropdownAdvanced({
    notifications,
    unreadCount,
    baseUrl,
    allNotificationsUrl,
    onRefresh,
    className,
}: NotificationDropdownAdvancedProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);

    // Play notification sound when new notification arrives
    useEffect(() => {
        if (soundEnabled && unreadCount > prevUnreadCount) {
            playNotificationSound();
        }
        setPrevUnreadCount(unreadCount);
    }, [unreadCount, soundEnabled, prevUnreadCount]);

    const playNotificationSound = useCallback(() => {
        try {
            // Try to play notification sound if available
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Silently fail if sound file doesn't exist or can't play
            });
        } catch {
            // Silently fail
        }
    }, []);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes}m lalu`;
        if (hours < 24) return `${hours}j lalu`;
        if (days < 7) return `${days}h lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const groupByDate = (items: Notification[]) => {
        const groups: { [key: string]: Notification[] } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        items.forEach(item => {
            const date = new Date(item.created_at);
            date.setHours(0, 0, 0, 0);
            let key: string;
            if (date.getTime() === today.getTime()) key = 'Hari Ini';
            else if (date.getTime() === yesterday.getTime()) key = 'Kemarin';
            else key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return groups;
    };

    const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(`${baseUrl}/${id}/read`, {}, { preserveScroll: true });
    };

    const handleMarkAllAsRead = () => {
        router.post(`${baseUrl}/read-all`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.delete(`${baseUrl}/${id}`, { preserveScroll: true });
    };

    const handleNotificationClick = (notif: Notification) => {
        if (!notif.read_at) {
            router.post(`${baseUrl}/${notif.id}/read`, {}, { preserveScroll: true });
        }
        if (notif.action_url) {
            router.visit(notif.action_url);
        }
        setIsOpen(false);
    };

    const groupedNotifications = groupByDate(notifications.slice(0, 10));
    const hasUrgent = notifications.some(n => n.priority === 'urgent' && !n.read_at);

    return (
        <div className={cn("relative", className)}>
            {/* Bell Button with Animation */}
            <Button
                variant="ghost"
                size="icon"
                className="relative group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={cn(
                    "relative",
                    hasUrgent && "animate-bounce"
                )}>
                    <Bell className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isOpen && "text-primary",
                        unreadCount > 0 && "text-primary"
                    )} />
                    {/* Pulse ring for unread */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                    )}
                </div>
                {/* Badge count */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-96 rounded-2xl border border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/95 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <Bell className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Notifikasi
                                    </h3>
                                    {unreadCount > 0 && (
                                        <p className="text-xs text-slate-500">{unreadCount} belum dibaca</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    title={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
                                >
                                    {soundEnabled ? (
                                        <Volume2 className="h-4 w-4 text-slate-500" />
                                    ) : (
                                        <VolumeX className="h-4 w-4 text-slate-400" />
                                    )}
                                </Button>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs text-primary hover:text-primary"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                        Baca Semua
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                        <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Tidak ada notifikasi
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        Notifikasi baru akan muncul di sini
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedNotifications).map(([date, items]) => (
                                    <div key={date}>
                                        {/* Date Header */}
                                        <div className="sticky top-0 px-4 py-2 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700/50">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                {date}
                                            </span>
                                        </div>
                                        {/* Items */}
                                        {items.map(notif => {
                                            const config = typeConfig[notif.type] || typeConfig.info;
                                            const Icon = config.icon;
                                            const priority = priorityConfig[notif.priority];
                                            return (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={cn(
                                                        "flex gap-3 p-4 border-b border-slate-100 dark:border-slate-800/50 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                                        !notif.read_at && "bg-blue-50/50 dark:bg-blue-900/10"
                                                    )}
                                                >
                                                    {/* Icon */}
                                                    <div className={cn(
                                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-105",
                                                        config.color
                                                    )}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className={cn(
                                                                    "text-sm text-slate-900 dark:text-white line-clamp-1",
                                                                    !notif.read_at && "font-semibold"
                                                                )}>
                                                                    {notif.title}
                                                                </p>
                                                                {priority.badge && (
                                                                    <span className={cn(
                                                                        "px-1.5 py-0.5 rounded text-[10px] font-medium",
                                                                        priority.badge
                                                                    )}>
                                                                        {priority.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {!notif.read_at && (
                                                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(notif.created_at)}
                                                            </span>
                                                            {/* Quick Actions */}
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {!notif.read_at && (
                                                                    <button
                                                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-600"
                                                                        title="Tandai dibaca"
                                                                    >
                                                                        <Check className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={(e) => handleDelete(notif.id, e)}
                                                                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-600"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && allNotificationsUrl && (
                            <div className="p-3 border-t border-slate-200/70 dark:border-slate-700/70 bg-slate-50/50 dark:bg-slate-800/50">
                                <Button
                                    variant="ghost"
                                    className="w-full text-sm text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => {
                                        router.visit(allNotificationsUrl);
                                        setIsOpen(false);
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Lihat Semua Notifikasi
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
