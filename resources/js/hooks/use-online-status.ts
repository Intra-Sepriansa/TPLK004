import { useEffect, useState } from 'react';

interface OnlineUser {
    id: number;
    type: string;
    name: string;
}

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true); // Default to true
    const [wasOffline, setWasOffline] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Set initial online status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setWasOffline(true);
            // Reset wasOffline after 3 seconds
            setTimeout(() => setWasOffline(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        // Check if Echo is available
        if (typeof window === 'undefined' || !(window as any).Echo) {
            return;
        }

        const echo = (window as any).Echo;
        const channel = echo.join('online');

        channel
            .here((users: OnlineUser[]) => {
                setOnlineUsers(users);
                setIsConnected(true);
            })
            .joining((user: OnlineUser) => {
                setOnlineUsers(prev => [...prev, user]);
            })
            .leaving((user: OnlineUser) => {
                setOnlineUsers(prev => prev.filter(u => !(u.id === user.id && u.type === user.type)));
            })
            .listen('.user.status', (data: { user_id: number; user_type: string; is_online: boolean }) => {
                if (data.is_online) {
                    // User came online - they should be added via joining
                } else {
                    setOnlineUsers(prev => prev.filter(u => !(u.id === data.user_id && u.type === data.user_type)));
                }
            });

        return () => {
            echo.leave('online');
            setIsConnected(false);
        };
    }, []);

    const isUserOnline = (userId: number, userType: string): boolean => {
        return onlineUsers.some(u => u.id === userId && u.type === userType);
    };

    return {
        isOnline,
        wasOffline,
        onlineUsers,
        isUserOnline,
        isConnected,
    };
}
