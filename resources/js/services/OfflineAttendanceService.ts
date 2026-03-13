import localforage from 'localforage';

interface QueuedAttendance {
    id: string;
    timestamp: number;
    data: {
        qrToken: string;
        selfieImage: string;
        location: { lat: number; lng: number };
        deviceInfo: Record<string, unknown>;
    };
    status: 'pending' | 'syncing' | 'failed';
    retryCount: number;
}

class OfflineAttendanceService {
    private queue: QueuedAttendance[] = [];
    private isOnline: boolean = navigator.onLine;
    private syncInProgress: boolean = false;

    constructor() {
        this.initializeStorage();
        this.setupEventListeners();
        this.loadQueue();
    }

    private async initializeStorage() {
        await localforage.config({
            name: 'AttendanceApp',
            storeName: 'attendance_queue',
        });
    }

    private setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    private async loadQueue() {
        try {
            const stored =
                await localforage.getItem<QueuedAttendance[]>('queue');
            if (stored) this.queue = stored;
        } catch (error) {
            console.error('Failed to load queue:', error);
        }
    }

    private async saveQueue() {
        try {
            await localforage.setItem('queue', this.queue);
        } catch (error) {
            console.error('Failed to save queue:', error);
        }
    }

    async queueAttendance(data: QueuedAttendance['data']): Promise<string> {
        const id = `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const queuedItem: QueuedAttendance = {
            id,
            timestamp: Date.now(),
            data,
            status: 'pending',
            retryCount: 0,
        };
        this.queue.push(queuedItem);
        await this.saveQueue();
        if (this.isOnline) this.syncQueue();
        return id;
    }

    async syncQueue() {
        if (this.syncInProgress || !this.isOnline) return;
        this.syncInProgress = true;
        const pendingItems = this.queue.filter(
            (item) => item.status === 'pending',
        );

        for (const item of pendingItems) {
            try {
                item.status = 'syncing';
                await this.saveQueue();
                const response = await fetch('/api/attendance/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.data),
                });
                if (response.ok) {
                    this.queue = this.queue.filter((q) => q.id !== item.id);
                    await this.saveQueue();
                    this.showNotification('✅ Absensi berhasil disinkronkan');
                } else {
                    throw new Error('Sync failed');
                }
            } catch {
                item.status = 'failed';
                item.retryCount++;
                if (item.retryCount >= 3) {
                    this.queue = this.queue.filter((q) => q.id !== item.id);
                    this.showNotification(
                        '❌ Gagal sinkronisasi setelah 3 percobaan',
                    );
                }
                await this.saveQueue();
            }
        }
        this.syncInProgress = false;
    }

    getQueueStatus() {
        return {
            total: this.queue.length,
            pending: this.queue.filter((q) => q.status === 'pending').length,
            syncing: this.queue.filter((q) => q.status === 'syncing').length,
            failed: this.queue.filter((q) => q.status === 'failed').length,
        };
    }

    private showNotification(message: string) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Absensi', { body: message });
        }
    }
}

export const offlineService = new OfflineAttendanceService();
