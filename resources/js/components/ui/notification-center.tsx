import { useState } from 'react';
import { Bell, X, Check, Clock, AlertTriangle, User, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface Notification {
    id: string;
    type: 'attendance' | 'selfie' | 'alert' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onDismiss?: (id: string) => void;
}

const typeIcons = {
    attendance: User,
    selfie: Camera,
    alert: AlertTriangle,
    system: Bell,
};

const typeColors = {
    attendance: 'bg-emerald-500/10 text-emerald-600',
    selfie: 'bg-sky-500/10 text-sky-600',
    alert: 'bg-amber-500/10 text-amber-600',
    system: 'bg-slate-500/10 text-slate-600',
};

export function NotificationCenter({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDismiss,
}: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/95">
                        <div className="flex items-center justify-between border-b border-slate-200/70 p-4 dark:border-slate-800/70">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Notifikasi
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="text-xs text-emerald-600 hover:text-emerald-700"
                                >
                                    Tandai semua dibaca
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="mx-auto h-8 w-8 text-slate-300" />
                                    <p className="mt-2 text-sm text-slate-500">
                                        Tidak ada notifikasi
                                    </p>
                                </div>
                            ) : (
                                notifications.map(notification => {
                                    const Icon = typeIcons[notification.type];
                                    return (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                'flex gap-3 p-4 border-b border-slate-100 dark:border-slate-800/50 transition-colors',
                                                !notification.read && 'bg-slate-50/50 dark:bg-slate-900/50'
                                            )}
                                        >
                                            <div className={cn(
                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                                                typeColors[notification.type]
                                            )}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    <span className="text-[10px] text-slate-400">
                                                        {notification.time}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => onMarkAsRead?.(notification.id)}
                                                        className="p-1 text-slate-400 hover:text-emerald-600"
                                                        title="Tandai dibaca"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onDismiss?.(notification.id)}
                                                    className="p-1 text-slate-400 hover:text-rose-600"
                                                    title="Hapus"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
