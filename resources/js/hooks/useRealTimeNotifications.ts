import { useEffect, useState } from 'react';
import Echo from '@/lib/echo';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    timestamp: string;
}

export function useRealTimeNotifications(userId: number, userType: 'mahasiswa' | 'dosen' | 'admin') {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const channelName = `${userType}.${userId}`;
        
        const channel = Echo.private(channelName);

        // Listen for QR Code Generated
        channel.listen('.qrcode.generated', (data: any) => {
            const notification: Notification = {
                id: `qr-${Date.now()}`,
                type: 'qrcode',
                title: '📱 QR Code Baru!',
                message: `QR Code untuk ${data.course_name} telah dibuat`,
                data,
                timestamp: data.timestamp,
            };
            addNotification(notification);
        });

        // Listen for Attendance Scanned
        channel.listen('.attendance.scanned', (data: any) => {
            const notification: Notification = {
                id: `attendance-${Date.now()}`,
                type: 'attendance',
                title: '✅ Absensi Baru',
                message: `${data.mahasiswa.nama} telah absen`,
                data,
                timestamp: data.timestamp,
            };
            addNotification(notification);
        });

        // Listen for Task Deadline Reminder
        channel.listen('.task.deadline.reminder', (data: any) => {
            const notification: Notification = {
                id: `task-${Date.now()}`,
                type: 'task',
                title: '⏰ Deadline Tugas!',
                message: `${data.title} - ${data.hours_remaining} jam lagi`,
                data,
                timestamp: data.timestamp,
            };
            addNotification(notification);
        });

        return () => {
            channel.stopListening('.qrcode.generated');
            channel.stopListening('.attendance.scanned');
            channel.stopListening('.task.deadline.reminder');
            Echo.leave(channelName);
        };
    }, [userId, userType]);

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
            });
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
    };
}
