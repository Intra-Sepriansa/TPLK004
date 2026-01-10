import { useOnlineStatus } from '@/hooks/use-online-status';
import { Wifi, WifiOff, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
    const { isOnline, wasOffline } = useOnlineStatus();

    if (isOnline && !wasOffline) return null;

    return (
        <div
            className={cn(
                'fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-full px-4 py-2 shadow-lg transition-all duration-300',
                isOnline
                    ? 'bg-emerald-500 text-white animate-in fade-in slide-in-from-bottom-4'
                    : 'bg-slate-900 text-white animate-in fade-in slide-in-from-bottom-4'
            )}
        >
            {isOnline ? (
                <>
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm font-medium">Kembali online</span>
                </>
            ) : (
                <>
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-medium">Tidak ada koneksi</span>
                </>
            )}
        </div>
    );
}

interface OfflineBannerProps {
    onRetry?: () => void;
}

export function OfflineBanner({ onRetry }: OfflineBannerProps) {
    const { isOnline } = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="bg-amber-500 text-amber-950 px-4 py-2">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
                    </span>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                        <RefreshCcw className="h-3 w-3" />
                        Coba lagi
                    </button>
                )}
            </div>
        </div>
    );
}
