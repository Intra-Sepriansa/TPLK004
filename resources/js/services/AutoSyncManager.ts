import axios from 'axios';
import { toast } from 'sonner';
import { NetworkMonitor } from './NetworkMonitor';
import { OfflineStorage, type OfflineAttendance } from './OfflineStorage';

type AutoSyncSubscriber = (pendingCount: number) => void;

class AutoSyncService {
    private syncIntervalId: number | null = null;
    private isSyncing = false;
    private subscribers: Set<AutoSyncSubscriber> = new Set();
    private pendingCount = 0;

    constructor() {
        if (typeof window !== 'undefined') {
            NetworkMonitor.subscribe((state) => {
                if (state.isOnline) {
                    this.triggerSync();
                }
            });

            // Periodically check for sync if online
            this.syncIntervalId = window.setInterval(() => {
                if (NetworkMonitor.getNetworkQuality().isOnline && !this.isSyncing) {
                    this.triggerSync();
                }
            }, 30000); // 30s check
            
            this.refreshPendingCount();
        }
    }

    public subscribe(callback: AutoSyncSubscriber): () => void {
        this.subscribers.add(callback);
        this.refreshPendingCount().then(() => {
            callback(this.pendingCount);
        });

        return () => {
            this.subscribers.delete(callback);
        };
    }

    private notifySubscribers() {
        this.subscribers.forEach((cb) => cb(this.pendingCount));
    }

    public async refreshPendingCount() {
        const items = await OfflineStorage.getAllAttendances();
        this.pendingCount = items.length;
        this.notifySubscribers();
    }

    public async triggerSync(): Promise<void> {
        if (this.isSyncing) return;
        
        await this.refreshPendingCount();
        if (this.pendingCount === 0) return;

        this.isSyncing = true;
        
        try {
            const pendingItems = await OfflineStorage.getPendingAttendances();
            
            for (const item of pendingItems) {
                // If we go offline midpoint, abort
                if (!NetworkMonitor.getNetworkQuality().isOnline) {
                    console.log('[AutoSync] Network lost during sync, aborting.');
                    break;
                }

                await this.syncItem(item);
            }
        } finally {
            this.isSyncing = false;
            await this.refreshPendingCount();
        }
    }

    private async syncItem(item: OfflineAttendance) {
        await OfflineStorage.updateStatus(item.id, { status: 'syncing' });
        
        try {
            const formData = new FormData();
            formData.append('token', item.token);
            formData.append('latitude', item.latitude.toString());
            formData.append('longitude', item.longitude.toString());
            formData.append('location_accuracy_m', item.location_accuracy_m.toString());
            formData.append('location_captured_at', item.location_captured_at);
            
            item.location_samples.forEach((sample, i) => {
                formData.append(`location_samples[${i}][latitude]`, sample.latitude.toString());
                formData.append(`location_samples[${i}][longitude]`, sample.longitude.toString());
                formData.append(`location_samples[${i}][accuracy_m]`, sample.accuracy_m.toString());
                formData.append(`location_samples[${i}][captured_at]`, sample.captured_at);
            });
            
            formData.append('device_info', item.device_info);
            formData.append('offline_mode', 'true');
            formData.append('client_timestamp', item.client_timestamp);

            if (item.selfieBlob) {
                // Convert blob to file if needed or just send blob
                formData.append('selfie', item.selfieBlob, 'offline_selfie.jpg');
            }

            // Using axios directly or inertia (but we aren't in a react context, so axios is safer)
            // Inertia CSRF is automatically handled by axios if window.axios is set up correctly in TPLK004
            
            await window.axios.post('/user/absen', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Success
            await OfflineStorage.removeAttendance(item.id);
            toast.success(`Absensi offline berhasil disinkronisasi: ${item.sessionLabel || 'Berhasil'}`);
            
        } catch (error: any) {
            console.error('[AutoSync] Failed to sync item', item.id, error);
            
            const isClientError = error.response && error.response.status >= 400 && error.response.status < 500;
            // E.g. 422 Validation Error -> Maybe already absentee, or token expired. 
            // We should remove it or mark it failed permanently.
            if (isClientError) {
                let errorMsg = 'Gagal validasi server';
                if (error.response.data && error.response.data.errors) {
                    errorMsg = Object.values(error.response.data.errors).flat().join(', ');
                }
                await OfflineStorage.updateStatus(item.id, { 
                    status: 'failed', 
                    lastError: errorMsg 
                });
                toast.error(`Sinkronisasi gagal: ${errorMsg}`);
            } else {
                // Keep for retry (e.g. 500 or Network Error)
                await OfflineStorage.updateStatus(item.id, { 
                    status: 'pending', 
                    retryCount: item.retryCount + 1,
                    lastError: 'Gagal terhubung ke server' 
                });
            }
        }
    }
}

export const AutoSyncManager = new AutoSyncService();

// Define global interface for axios if not present to appease TS
declare global {
    interface Window {
        axios: any;
    }
}
