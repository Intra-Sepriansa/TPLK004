interface NotificationConfig {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
}

class SmartNotificationService {
    private permission: NotificationPermission = 'default';
    private watchId: number | null = null;

    constructor() {
        this.checkPermission();
    }

    async checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
            if (this.permission === 'default') {
                this.permission = await Notification.requestPermission();
            }
        }
    }

    async send(config: NotificationConfig) {
        if (this.permission !== 'granted') return;
        const notification = new Notification(config.title, {
            body: config.body,
            icon: config.icon || '/logo.png',
            tag: config.tag,
            requireInteraction: config.requireInteraction,
        });
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        return notification;
    }

    scheduleClassReminder(classTime: Date, className: string) {
        const reminderTime = new Date(classTime.getTime() - 15 * 60 * 1000);
        const now = new Date();
        if (reminderTime > now) {
            const delay = reminderTime.getTime() - now.getTime();
            setTimeout(() => {
                this.send({
                    title: '⏰ Jangan Lupa Absen!',
                    body: `Kelas ${className} dimulai 15 menit lagi`,
                    tag: 'class-reminder',
                    requireInteraction: true,
                });
            }, delay);
        }
    }

    startLocationWatch(campusLocation: { lat: number; lng: number }) {
        if (!('geolocation' in navigator)) return;
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const distance = this.calculateDistance(
                    position.coords.latitude,
                    position.coords.longitude,
                    campusLocation.lat,
                    campusLocation.lng,
                );
                if (distance < 0.5) {
                    this.send({
                        title: '📍 Kamu Sudah di Kampus!',
                        body: 'Jangan lupa absen!',
                        tag: 'location-reminder',
                    });
                }
            },
            (error) => console.error('Location error:', error),
            { enableHighAccuracy: true, maximumAge: 30000 },
        );
    }

    stopLocationWatch() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    sendSelfieReminder() {
        this.send({
            title: '📸 Belum Selfie!',
            body: 'Jangan lupa ambil foto selfie untuk verifikasi',
            tag: 'selfie-reminder',
        });
    }

    async sendSuccessNotification(message: string) {
        await this.send({
            title: '✅ Absensi Berhasil!',
            body: message,
            tag: 'success',
        });
        if (typeof window !== 'undefined') {
        }
    }
}

export const notificationService = new SmartNotificationService();
