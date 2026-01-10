import { useState, useEffect, useCallback } from 'react';

interface UseOnlineStatusResult {
    isOnline: boolean;
    wasOffline: boolean;
    lastOnline: Date | null;
    lastOffline: Date | null;
}

export function useOnlineStatus(): UseOnlineStatusResult {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [wasOffline, setWasOffline] = useState(false);
    const [lastOnline, setLastOnline] = useState<Date | null>(
        typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null
    );
    const [lastOffline, setLastOffline] = useState<Date | null>(null);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        setLastOnline(new Date());
        if (!isOnline) {
            setWasOffline(true);
            // Reset wasOffline after 5 seconds
            setTimeout(() => setWasOffline(false), 5000);
        }
    }, [isOnline]);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        setLastOffline(new Date());
    }, []);

    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return {
        isOnline,
        wasOffline,
        lastOnline,
        lastOffline,
    };
}
