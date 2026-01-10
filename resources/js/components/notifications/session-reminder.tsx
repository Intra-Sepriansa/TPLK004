import { useEffect, useState } from 'react';
import { useCountdown } from '@/hooks/use-countdown';
import { Bell, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SessionReminderProps {
    sessionTitle: string;
    startTime: Date;
    onDismiss?: () => void;
    onNavigate?: () => void;
}

export function SessionReminder({
    sessionTitle,
    startTime,
    onDismiss,
    onNavigate,
}: SessionReminderProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    const { minutes, seconds, formatted, isComplete } = useCountdown({
        targetDate: startTime,
        autoStart: true,
    });

    // Show reminder 15 minutes before
    useEffect(() => {
        const totalMinutes = minutes + (seconds > 0 ? 1 : 0);
        if (totalMinutes <= 15 && totalMinutes > 0 && !isDismissed) {
            setIsVisible(true);
            
            // Request notification permission and show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Reminder Absensi', {
                    body: `Sesi "${sessionTitle}" akan dimulai dalam ${formatted}`,
                    icon: '/icons/icon-192x192.png',
                    tag: 'session-reminder',
                });
            }
        }
        
        if (isComplete) {
            setIsVisible(false);
        }
    }, [minutes, seconds, isDismissed, sessionTitle, formatted, isComplete]);

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsVisible(false);
        onDismiss?.();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-80 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-xl dark:border-amber-900 dark:bg-amber-950/90">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                        <Bell className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                                Reminder Absensi
                            </h4>
                            <button
                                onClick={handleDismiss}
                                className="text-amber-600 hover:text-amber-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            {sessionTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                {formatted}
                            </span>
                            <span className="text-xs text-amber-600">tersisa</span>
                        </div>
                        {onNavigate && (
                            <Button
                                size="sm"
                                className="mt-3 w-full bg-amber-600 hover:bg-amber-700"
                                onClick={onNavigate}
                            >
                                Pergi ke Halaman Absen
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook to request notification permission
export function useNotificationPermission() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        }
        return 'denied' as NotificationPermission;
    };

    return { permission, requestPermission };
}
