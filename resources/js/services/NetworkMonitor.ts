/**
 * NetworkMonitor.ts
 *
 * Provides real-time information about the exact connection status, 
 * ping, jitter, and perceived bandwidth using both the browser's NetworkInformation API 
 * and custom ping diagnostics.
 */

export interface NetworkQuality {
    isOnline: boolean;
    connectionType: 'wifi' | '4g' | '5g' | '3g' | '2g' | 'ethernet' | 'none' | 'unknown';
    effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
    downlink: number; // Mbps
    rtt: number; // Ping in ms
    saveData: boolean;
    signalQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'no-signal';
}

type Subscriber = (quality: NetworkQuality) => void;

class NetworkMonitorService {
    private quality: NetworkQuality = {
        isOnline: navigator.onLine,
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
        saveData: false,
        signalQuality: 'good',
    };

    private subscribers: Set<Subscriber> = new Set();
    private pingIntervalId: number | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initListeners();
            this.updateFromNavigator();
            this.startPingMonitor();
        }
    }

    private initListeners() {
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);

        const navConn = (navigator as any).connection;
        if (navConn) {
            navConn.addEventListener('change', this.handleConnectionChange);
        }
    }

    private handleOnline = () => {
        this.updateState({ isOnline: true });
        this.performPingTest();
    };

    private handleOffline = () => {
        this.updateState({
            isOnline: false,
            rtt: 0,
            downlink: 0,
            connectionType: 'none',
            signalQuality: 'no-signal',
        });
    };

    private handleConnectionChange = () => {
        this.updateFromNavigator();
    };

    private updateFromNavigator() {
        if (!navigator.onLine) return;

        const navConn = (navigator as any).connection;
        if (navConn) {
            this.updateState({
                effectiveType: navConn.effectiveType || 'unknown',
                downlink: navConn.downlink || 0,
                rtt: navConn.rtt || 0,
                saveData: navConn.saveData || false,
                connectionType: navConn.type || 'unknown',
            });
        }
        this.refreshSignalQuality();
    }

    private startPingMonitor() {
        if (this.pingIntervalId) {
            window.clearInterval(this.pingIntervalId);
        }
        // Ping every 10 seconds if online
        this.pingIntervalId = window.setInterval(() => {
            if (this.quality.isOnline) {
                this.performPingTest();
            }
        }, 10000);
    }

    private async performPingTest() {
        try {
            const start = performance.now();
            const response = await fetch('/api/network/health', {
                method: 'GET',
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' },
            });
            
            if (response.ok) {
                const end = performance.now();
                const pingMs = Math.round(end - start);
                
                this.updateState({
                    rtt: pingMs,
                });
                this.refreshSignalQuality();
            } else {
                throw new Error('Ping failed');
            }
        } catch (error) {
            // Wait, if it failed, maybe we are actually offline
            if (!navigator.onLine) {
                this.handleOffline();
            } else {
                // High ping / packet loss simulation
                this.updateState({ rtt: 999, signalQuality: 'poor' });
            }
        }
    }

    private refreshSignalQuality() {
        if (!this.quality.isOnline) {
            this.updateState({ signalQuality: 'no-signal' });
            return;
        }

        const rtt = this.quality.rtt;
        const down = this.quality.downlink;
        const type = this.quality.effectiveType;

        if (rtt < 50 && down > 5) {
            this.updateState({ signalQuality: 'excellent' });
        } else if (rtt < 100 && down > 1.5) {
            this.updateState({ signalQuality: 'good' });
        } else if (rtt < 250 && type !== 'slow-2g') {
            this.updateState({ signalQuality: 'fair' });
        } else {
            this.updateState({ signalQuality: 'poor' });
        }
    }

    private updateState(updates: Partial<NetworkQuality>) {
        let changed = false;
        for (const [key, value] of Object.entries(updates)) {
            if ((this.quality as any)[key] !== value) {
                (this.quality as any)[key] = value;
                changed = true;
            }
        }

        if (changed) {
            this.notifySubscribers();
        }
    }

    public getNetworkQuality(): NetworkQuality {
        return { ...this.quality };
    }

    public subscribe(callback: Subscriber): () => void {
        this.subscribers.add(callback);
        callback(this.getNetworkQuality()); // Initial emit

        return () => {
            this.subscribers.delete(callback);
        };
    }

    private notifySubscribers() {
        const qualityDetails = this.getNetworkQuality();
        this.subscribers.forEach((sub) => sub(qualityDetails));
    }

    public async performSpeedTest(): Promise<{ downloadMbps: number }> {
        if (!this.quality.isOnline) return { downloadMbps: 0 };
        
        try {
            const size = 1048576; // 1MB payload
            const start = performance.now();
            const res = await fetch(`/api/network/speed-test/download?size=${size}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Speedtest failed');
            await res.blob();
            const end = performance.now();
            
            const durationSec = (end - start) / 1000;
            const bits = size * 8;
            const mbps = (bits / durationSec) / 1000000;
            
            this.updateState({ downlink: Math.round(mbps * 10) / 10 });
            this.refreshSignalQuality();
            
            return { downloadMbps: mbps };
        } catch (e) {
            return { downloadMbps: 0 };
        }
    }
}

export const NetworkMonitor = new NetworkMonitorService();
