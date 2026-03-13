import axios from 'axios';
import localforage from 'localforage';
import { toast } from 'sonner';

// Define the interface for the offline attendance payload
export interface OfflineAttendance {
    id: string; // unique identifier (UUID)
    token: string;
    latitude: string;
    longitude: string;
    location_accuracy_m: number;
    location_samples: any[];
    device_info: string;
    selfiePreview: string | null; // Base64 image
    timestamp: number; // when it was saved offline
}

// Ensure the localforage instance is properly configured
localforage.config({
    name: 'TPLK004_Attendance',
    storeName: 'offline_queue',
});

const STORE_KEY = 'attendance_sync_queue';

/**
 * Save an attendance payload to the offline queue
 */
export async function saveOfflineAttendance(
    data: Omit<OfflineAttendance, 'id' | 'timestamp'>,
): Promise<void> {
    try {
        const queue: OfflineAttendance[] =
            (await localforage.getItem(STORE_KEY)) || [];

        const newEntry: OfflineAttendance = {
            ...data,
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 15),
            timestamp: Date.now(),
        };

        queue.push(newEntry);
        await localforage.setItem(STORE_KEY, queue);

        console.log(`Saved offline attendance: ${newEntry.id}`);
    } catch (error) {
        console.error('Failed to save offline attendance', error);
        throw error;
    }
}

/**
 * Get all queued offline attendances
 */
export async function getOfflineAttendances(): Promise<OfflineAttendance[]> {
    try {
        return (await localforage.getItem(STORE_KEY)) || [];
    } catch (error) {
        console.error('Failed to get offline attendances', error);
        return [];
    }
}

/**
 * Remove a specific entry from the offline queue
 */
export async function removeOfflineAttendance(id: string): Promise<void> {
    try {
        const queue: OfflineAttendance[] =
            (await localforage.getItem(STORE_KEY)) || [];
        const newQueue = queue.filter((item) => item.id !== id);
        await localforage.setItem(STORE_KEY, newQueue);
    } catch (error) {
        console.error(`Failed to remove offline attendance ${id}`, error);
    }
}

/**
 * Convert base64 Data URL to a native File object
 */
function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

/**
 * Attempt to sync all queued attendances to the server
 */
export async function syncOfflineAttendances(): Promise<void> {
    // Only attempt sync if we believe we have connection
    if (!navigator.onLine) return;

    const queue = await getOfflineAttendances();
    if (queue.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    const syncToastId = toast.loading(
        `Mensinkronkan ${queue.length} absen offline...`,
    );

    for (const item of queue) {
        try {
            const formData = new FormData();
            formData.append('token', item.token);
            formData.append('latitude', item.latitude);
            formData.append('longitude', item.longitude);
            formData.append(
                'location_accuracy_m',
                item.location_accuracy_m.toString(),
            );

            // Add location_captured_at which may be missing from strict frontend form, but backend needs it
            const bestSample = item.location_samples.reduce((a, b) =>
                a.accuracy_m < b.accuracy_m ? a : b,
            );
            formData.append('location_captured_at', bestSample.captured_at);

            item.location_samples.forEach((sample, index) => {
                formData.append(
                    `location_samples[${index}][latitude]`,
                    sample.latitude.toString(),
                );
                formData.append(
                    `location_samples[${index}][longitude]`,
                    sample.longitude.toString(),
                );
                formData.append(
                    `location_samples[${index}][accuracy_m]`,
                    sample.accuracy_m.toString(),
                );
                formData.append(
                    `location_samples[${index}][captured_at]`,
                    sample.captured_at,
                );
            });

            formData.append('device_info', item.device_info);

            // Reconstruct the file if selfie was taken
            if (item.selfiePreview) {
                const selfieFile = dataURLtoFile(
                    item.selfiePreview,
                    `offline-selfie-${item.timestamp}.jpg`,
                );
                formData.append('selfie', selfieFile);
            }

            // Sync with backend using axios (assuming CSRF tokens are handled globally by axios/Inertia configuration)
            await axios.post('/user/absen', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // If success, remove from offline queue
            await removeOfflineAttendance(item.id);
            successCount++;
        } catch (error: any) {
            console.error(`Failed to sync attendance ${item.id}`, error);
            // We do NOT remove it from queue if it failed due to network.
            // If it failed due to validation (422), we should probably delete it to prevent infinite loops,
            // but for safety, we'll keep it simple for now, or you could implement specific 400/422 detection.
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status < 500 &&
                error.response.status !== 429
            ) {
                // Client error (e.g. invalid token, already submitted). Safest to drop it.
                await removeOfflineAttendance(item.id);
                console.log(
                    `Dropped invalid offline attendance ${item.id} due to ${error.response.status}`,
                );
            } else {
                failCount++;
            }
        }
    }

    toast.dismiss(syncToastId);

    if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} Absen offline berhasil disinkronkan!`);
        // Force reload to update stats on the page if they were observing the dashboard
        window.location.reload();
    } else if (successCount > 0 && failCount > 0) {
        toast.warning(
            `${successCount} sinkron, ${failCount} gagal tertunda. Berkas akan dicoba kembali nanti.`,
        );
    } else if (failCount > 0) {
        toast.error(
            `Gagal sinkron absen offline. Menunggu koneksi yang lebih stabil.`,
        );
    }
}
