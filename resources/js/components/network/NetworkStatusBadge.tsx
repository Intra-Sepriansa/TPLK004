import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Activity, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NetworkMonitor, type NetworkQuality } from '@/services/NetworkMonitor';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { NetworkAnalyticsPanel } from '@/components/network/NetworkAnalyticsPanel';

export function NetworkStatusBadge() {
    const [quality, setQuality] = useState<NetworkQuality>(NetworkMonitor.getNetworkQuality());

    useEffect(() => {
        return NetworkMonitor.subscribe((q) => setQuality(q));
    }, []);

    const isOffline = !quality.isOnline;
    const isPoor = quality.signalQuality === 'poor';

    // Different styles based on state
    const bgClass = isOffline 
        ? 'bg-rose-500/90 text-white' 
        : isPoor 
            ? 'bg-amber-500/90 text-white' 
            : 'bg-white/90 text-slate-700 dark:bg-slate-800/90 dark:text-slate-200';
            
    const borderClass = isOffline
        ? 'border-rose-400'
        : isPoor
            ? 'border-amber-400'
            : 'border-slate-200 dark:border-slate-700';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                        'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 object-contain shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95',
                        bgClass,
                        borderClass
                    )}
                >
                    {isOffline ? (
                        <WifiOff className="h-4 w-4" />
                    ) : isPoor ? (
                        <AlertTriangle className="h-4 w-4" />
                    ) : (
                        <Wifi className="h-4 w-4 text-emerald-500" />
                    )}

                    <div className="flex flex-col text-xs font-semibold leading-none">
                        <span>
                            {isOffline ? 'Offline Mode' : quality.connectionType.toUpperCase()}
                        </span>
                        {!isOffline && (
                            <span className="text-[10px] font-medium opacity-80">
                                Ping: {quality.rtt}ms
                            </span>
                        )}
                    </div>
                    
                    {!isOffline && quality.downlink > 0 && (
                        <div className="ml-1 hidden items-center gap-1 border-l pl-2 opacity-80 sm:flex text-[10px]">
                            <Activity className="h-3 w-3" />
                            {quality.downlink} Mbps
                        </div>
                    )}
                </motion.div>
            </DialogTrigger>
            
            <DialogContent className="p-0 border-none bg-transparent shadow-none w-[90vw] max-w-md [&>button]:hidden">
                <NetworkAnalyticsPanel />
            </DialogContent>
        </Dialog>
    );
}
