import { useEffect, useState } from 'react';
import { OfflineStorage, type OfflineAttendance } from '@/services/OfflineStorage';
import { AutoSyncManager } from '@/services/AutoSyncManager';
import { NetworkMonitor } from '@/services/NetworkMonitor';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CloudOff, RefreshCw, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function PendingSyncList() {
    const [pendingItems, setPendingItems] = useState<OfflineAttendance[]>([]);
    const [isOnline, setIsOnline] = useState(NetworkMonitor.getNetworkQuality().isOnline);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        loadData();
        
        const unsubNet = NetworkMonitor.subscribe((q) => setIsOnline(q.isOnline));
        const unsubSync = AutoSyncManager.subscribe(() => {
            loadData();
        });

        // polling purely for UI refresh (time ago)
        const interval = setInterval(() => {
            setPendingItems(prev => [...prev]);
        }, 60000);

        return () => {
            unsubNet();
            unsubSync();
            clearInterval(interval);
        };
    }, []);

    const loadData = async () => {
        const items = await OfflineStorage.getAllAttendances();
        setPendingItems(items);
    };

    const handleSyncAll = async () => {
        setIsSyncing(true);
        try {
            await AutoSyncManager.triggerSync();
        } finally {
            setIsSyncing(false);
            await loadData();
        }
    };

    const handleDelete = async (itemId: string) => {
        if (confirm('Yakin ingin menghapus data absen offline ini? Kamu harus mengulang absen.')) {
            await OfflineStorage.removeAttendance(itemId);
            await loadData();
        }
    };

    if (pendingItems.length === 0) return null;

    return (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 shadow-md">
            <CardHeader className="pb-3 border-b border-amber-100 dark:border-amber-500/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-amber-800 dark:text-amber-500 text-lg flex items-center gap-2">
                        <CloudOff className="h-5 w-5" />
                        Tunda Sinkronisasi ({pendingItems.length})
                    </CardTitle>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white/50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                        onClick={handleSyncAll}
                        disabled={!isOnline || isSyncing}
                    >
                        <RefreshCw className={`h-3 w-3 mr-2 \${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Sinkronisasi...' : 'Sync Sekarang'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-4 grid gap-3">
                {pendingItems.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-amber-100 dark:border-slate-800">
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                {item.sessionLabel || 'Sesi Absensi'}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="h-3 w-3" />
                                Disimpan {formatDistanceToNow(new Date(item.client_timestamp), { addSuffix: true, locale: id })}
                            </div>
                            {item.status === 'failed' && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-rose-500 font-medium">
                                    <AlertTriangle className="h-3 w-3" />
                                    Gagal: {item.lastError || 'Kendala server'}
                                </div>
                            )}
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 self-end sm:self-auto"
                            onClick={() => handleDelete(item.id)}
                            disabled={isSyncing}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

