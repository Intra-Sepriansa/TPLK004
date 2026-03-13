import localforage from 'localforage';

export interface OfflineAttendance {
    id: string; // unique identifier
    token: string;
    latitude: number;
    longitude: number;
    location_accuracy_m: number;
    location_captured_at: string; // ISO string
    location_samples: Array<{
        latitude: number;
        longitude: number;
        accuracy_m: number;
        captured_at: string;
    }>;
    device_info: string;
    selfieBlob?: Blob | null; // Storing blobs directly in IndexedDB is supported by localforage
    client_timestamp: string; // ISO string when user clicked submit
    
    // UI Metadata
    sessionLabel?: string; 
    status: 'pending' | 'syncing' | 'failed';
    lastError?: string;
    retryCount: number;
}

class OfflineStorageService {
    private store: LocalForage;

    constructor() {
        this.store = localforage.createInstance({
            name: 'AbsensiOfflineApp',
            storeName: 'pending_attendances',
            description: 'Stores attendance data when the user is offline'
        });
    }

    public async saveAttendance(data: Omit<OfflineAttendance, 'id' | 'status' | 'retryCount'>): Promise<OfflineAttendance> {
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        
        const record: OfflineAttendance = {
            ...data,
            id,
            status: 'pending',
            retryCount: 0,
        };

        await this.store.setItem(id, record);
        return record;
    }

    public async getPendingAttendances(): Promise<OfflineAttendance[]> {
        const items: OfflineAttendance[] = [];
        await this.store.iterate((value: OfflineAttendance) => {
            if (value && value.status !== 'syncing') {
                items.push(value);
            }
        });
        
        // Sort oldest first
        return items.sort((a, b) => new Date(a.client_timestamp).getTime() - new Date(b.client_timestamp).getTime());
    }

    public async getAllAttendances(): Promise<OfflineAttendance[]> {
        const items: OfflineAttendance[] = [];
        await this.store.iterate((value: OfflineAttendance) => {
            items.push(value);
        });
        return items.sort((a, b) => new Date(b.client_timestamp).getTime() - new Date(a.client_timestamp).getTime());
    }

    public async updateStatus(id: string, updates: Partial<Pick<OfflineAttendance, 'status' | 'lastError' | 'retryCount'>>): Promise<void> {
        const record = await this.store.getItem<OfflineAttendance>(id);
        if (record) {
            await this.store.setItem(id, { ...record, ...updates });
        }
    }

    public async removeAttendance(id: string): Promise<void> {
        await this.store.removeItem(id);
    }
    
    public async clearAll(): Promise<void> {
        await this.store.clear();
    }
}

export const OfflineStorage = new OfflineStorageService();
