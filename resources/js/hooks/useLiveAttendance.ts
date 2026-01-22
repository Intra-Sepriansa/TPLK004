import { useEffect, useState } from 'react';
import Echo from '@/lib/echo';

interface AttendanceUpdate {
    id: number;
    mahasiswa: {
        nim: string;
        nama: string;
    };
    status: string;
    check_in_at: string;
    timestamp: string;
}

export function useLiveAttendance(sessionId: number) {
    const [attendances, setAttendances] = useState<AttendanceUpdate[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!sessionId) return;

        const channelName = `session.${sessionId}`;
        const channel = Echo.private(channelName);

        channel.listen('.attendance.scanned', (data: AttendanceUpdate) => {
            setAttendances(prev => [data, ...prev]);
            setTotalCount(prev => prev + 1);
            
            // Play sound notification
            playNotificationSound();
        });

        channel.subscribed(() => {
            setIsConnected(true);
        });

        channel.error((error: any) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        });

        return () => {
            channel.stopListening('.attendance.scanned');
            Echo.leave(channelName);
            setIsConnected(false);
        };
    }, [sessionId]);

    const playNotificationSound = () => {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => console.log('Audio play failed:', err));
    };

    return {
        attendances,
        totalCount,
        isConnected,
    };
}
