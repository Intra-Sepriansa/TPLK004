# PROMPT: OFFLINE MODE & NETWORK QUALITY MONITORING - ULTRA ADVANCED COMPLETE

## 🎯 OBJEKTIF UTAMA
Membuat sistem absensi yang ROBUST dengan:
- **Offline Mode** - tetap bisa absen meski tanpa internet
- **Network Quality Monitoring** - analisis real-time kualitas jaringan
- **Smart Alerts** - notifikasi cerdas berdasarkan kondisi jaringan
- **Device Network Analytics** - baca kekuatan sinyal, jenis jaringan, ping, dll
- **Auto Sync** - sinkronisasi otomatis saat jaringan kembali
- **Progressive Enhancement** - pengalaman optimal di semua kondisi jaringan

---

## 📊 NETWORK QUALITY INDICATORS

### 1. NETWORK STATUS DETECTION

```typescript
interface NetworkQuality {
  // Connection Status
  isOnline: boolean;
  connectionType: 'wifi' | '4g' | '5g' | '3g' | '2g' | 'ethernet' | 'unknown';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  
  // Signal Strength
  signalStrength: number; // 0-100%
  signalQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'no-signal';
  
  // Speed Metrics
  downlink: number; // Mbps
  uplink: number; // Mbps
  rtt: number; // Round Trip Time (ping) in ms
  
  // Stability
  isStable: boolean;
  packetLoss: number; // percentage
  jitter: number; // ms
  
  // Battery & Data Saver
  saveData: boolean;
  batteryLevel: number;
  isCharging: boolean;
}
```

### 2. REAL-TIME NETWORK MONITOR

```typescript
class NetworkMonitor {
  private quality: NetworkQuality;
  private pingInterval: NodeJS.Timer;
  private speedTestInterval: NodeJS.Timer;
  
  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Monitor connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', this.handleConnectionChange);
    }
    
    // Start continuous monitoring
    this.startPingMonitoring();
    this.startSpeedTest();
  }

  private async startPingMonitoring() {
    this.pingInterval = setInterval(async () => {
      const pingResult = await this.measurePing();
      this.quality.rtt = pingResult.rtt;
      this.quality.packetLoss = pingResult.packetLoss;
      this.quality.jitter = pingResult.jitter;
      
      this.updateQualityStatus();
      this.emitQualityUpdate();
    }, 5000); // Check every 5 seconds
  }

  private async measurePing(): Promise<PingResult> {
    const pings: number[] = [];
    const attempts = 5;
    let packetLoss = 0;

    for (let i = 0; i < attempts; i++) {
      const start = performance.now();
      
      try {
        await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        const end = performance.now();
        pings.push(end - start);
      } catch (error) {
        packetLoss++;
      }
    }

    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = this.calculateJitter(pings);

    return {
      rtt: Math.round(avgPing),
      packetLoss: (packetLoss / attempts) * 100,
      jitter: Math.round(jitter)
    };
  }

  private calculateJitter(pings: number[]): number {
    if (pings.length < 2) return 0;
    
    let totalDiff = 0;
    for (let i = 1; i < pings.length; i++) {
      totalDiff += Math.abs(pings[i] - pings[i - 1]);
    }
    
    return totalDiff / (pings.length - 1);
  }

  private async measureSpeed() {
    // Download speed test
    const downloadStart = performance.now();
    const response = await fetch('/api/speed-test/download', {
      cache: 'no-cache'
    });
    const blob = await response.blob();
    const downloadEnd = performance.now();
    
    const downloadTime = (downloadEnd - downloadStart) / 1000; // seconds
    const downloadSize = blob.size / (1024 * 1024); // MB
    this.quality.downlink = downloadSize / downloadTime; // Mbps

    // Upload speed test (optional, can be heavy)
    // ... similar logic for upload
  }

  private getSignalStrength(): number {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Try to get signal strength from various APIs
      if ('signalStrength' in connection) {
        return connection.signalStrength;
      }
      
      // Estimate from effective type
      switch (connection.effectiveType) {
        case '4g': return 85;
        case '3g': return 60;
        case '2g': return 35;
        case 'slow-2g': return 15;
        default: return 50;
      }
    }
    
    return 50; // Default
  }

  private updateQualityStatus() {
    const { rtt, packetLoss, downlink } = this.quality;
    
    // Determine signal quality based on metrics
    if (rtt < 50 && packetLoss < 1 && downlink > 10) {
      this.quality.signalQuality = 'excellent';
    } else if (rtt < 100 && packetLoss < 3 && downlink > 5) {
      this.quality.signalQuality = 'good';
    } else if (rtt < 200 && packetLoss < 5 && downlink > 2) {
      this.quality.signalQuality = 'fair';
    } else if (rtt < 500 && packetLoss < 10) {
      this.quality.signalQuality = 'poor';
    } else {
      this.quality.signalQuality = 'no-signal';
    }
    
    // Check stability
    this.quality.isStable = packetLoss < 5 && this.quality.jitter < 50;
  }

  public getQuality(): NetworkQuality {
    return this.quality;
  }

  public destroy() {
    clearInterval(this.pingInterval);
    clearInterval(this.speedTestInterval);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}
```


---

## 🎨 UI/UX NETWORK INDICATOR

### 1. FLOATING NETWORK STATUS BADGE

```tsx
const NetworkStatusBadge = () => {
  const { quality, isOnline } = useNetworkMonitor();
  
  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    
    switch (quality.signalQuality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'no-signal': return 'bg-red-500';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    
    switch (quality.connectionType) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case '5g': return <Signal className="h-4 w-4" />;
      case '4g': return <Signal className="h-4 w-4" />;
      case '3g': return <SignalMedium className="h-4 w-4" />;
      case '2g': return <SignalLow className="h-4 w-4" />;
      default: return <SignalZero className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    return `${quality.connectionType.toUpperCase()} • ${quality.signalQuality}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed top-4 right-4 z-50",
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "text-white text-sm font-medium shadow-lg",
        getStatusColor()
      )}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      
      {/* Signal Strength Bars */}
      <div className="flex items-end gap-0.5 ml-2">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-1 rounded-sm transition-all",
              bar * 25 <= quality.signalStrength 
                ? "bg-white" 
                : "bg-white/30"
            )}
            style={{ height: `${bar * 3}px` }}
          />
        ))}
      </div>

      {/* Ping Indicator */}
      {isOnline && (
        <div className="ml-2 flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span className="text-xs">{quality.rtt}ms</span>
        </div>
      )}
    </motion.div>
  );
};
```

### 2. DETAILED NETWORK ANALYTICS PANEL

```tsx
const NetworkAnalyticsPanel = () => {
  const { quality, isOnline } = useNetworkMonitor();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-2">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isOnline ? "bg-green-100" : "bg-red-100"
            )}>
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">Status Jaringan</h3>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Terhubung' : 'Tidak Terhubung'}
              </p>
            </div>
          </div>
          <ChevronDown 
            className={cn(
              "h-5 w-5 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="space-y-4 pt-0">
              {/* Connection Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="h-4 w-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Jenis Koneksi</span>
                  </div>
                  <p className="font-semibold text-lg">
                    {quality.connectionType.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {quality.effectiveType}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Signal className="h-4 w-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Kualitas Sinyal</span>
                  </div>
                  <p className="font-semibold text-lg capitalize">
                    {quality.signalQuality}
                  </p>
                  <p className="text-xs text-gray-500">
                    {quality.signalStrength}%
                  </p>
                </div>
              </div>

              {/* Signal Strength Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Kekuatan Sinyal</span>
                  <span className="font-medium">{quality.signalStrength}%</span>
                </div>
                <Progress 
                  value={quality.signalStrength} 
                  className="h-2"
                  indicatorClassName={cn(
                    quality.signalStrength > 75 && "bg-green-500",
                    quality.signalStrength > 50 && quality.signalStrength <= 75 && "bg-blue-500",
                    quality.signalStrength > 25 && quality.signalStrength <= 50 && "bg-yellow-500",
                    quality.signalStrength <= 25 && "bg-red-500"
                  )}
                />
              </div>

              {/* Network Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {/* Ping/RTT */}
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <Activity className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-gray-600 mb-1">Ping</p>
                  <p className="font-bold text-lg">{quality.rtt}</p>
                  <p className="text-xs text-gray-500">ms</p>
                  <Badge 
                    variant={quality.rtt < 100 ? "success" : quality.rtt < 200 ? "warning" : "destructive"}
                    className="mt-1 text-xs"
                  >
                    {quality.rtt < 100 ? 'Bagus' : quality.rtt < 200 ? 'Cukup' : 'Lambat'}
                  </Badge>
                </div>

                {/* Download Speed */}
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <Download className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-gray-600 mb-1">Download</p>
                  <p className="font-bold text-lg">{quality.downlink.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Mbps</p>
                </div>

                {/* Packet Loss */}
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                  <p className="text-xs text-gray-600 mb-1">Packet Loss</p>
                  <p className="font-bold text-lg">{quality.packetLoss.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">%</p>
                </div>
              </div>

              {/* Jitter */}
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Jitter (Stabilitas)</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{quality.jitter}ms</p>
                    <Badge 
                      variant={quality.jitter < 30 ? "success" : quality.jitter < 50 ? "warning" : "destructive"}
                      className="text-xs"
                    >
                      {quality.isStable ? 'Stabil' : 'Tidak Stabil'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Battery & Data Saver */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Battery className="h-4 w-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Baterai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{quality.batteryLevel}%</p>
                    {quality.isCharging && (
                      <BatteryCharging className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Data Saver</span>
                  </div>
                  <p className="font-semibold text-lg">
                    {quality.saveData ? 'Aktif' : 'Nonaktif'}
                  </p>
                </div>
              </div>

              {/* Network Recommendation */}
              <Alert className={cn(
                quality.signalQuality === 'excellent' && "bg-green-50 border-green-200",
                quality.signalQuality === 'good' && "bg-blue-50 border-blue-200",
                quality.signalQuality === 'fair' && "bg-yellow-50 border-yellow-200",
                quality.signalQuality === 'poor' && "bg-orange-50 border-orange-200",
                quality.signalQuality === 'no-signal' && "bg-red-50 border-red-200"
              )}>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Rekomendasi</AlertTitle>
                <AlertDescription>
                  {getNetworkRecommendation(quality)}
                </AlertDescription>
              </Alert>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const getNetworkRecommendation = (quality: NetworkQuality): string => {
  if (!quality.isOnline) {
    return "Anda sedang offline. Data absensi akan disimpan secara lokal dan otomatis tersinkronisasi saat koneksi kembali.";
  }

  if (quality.signalQuality === 'excellent') {
    return "Koneksi Anda sangat baik! Semua fitur dapat digunakan dengan optimal.";
  }

  if (quality.signalQuality === 'good') {
    return "Koneksi Anda stabil. Absensi dapat dilakukan dengan lancar.";
  }

  if (quality.signalQuality === 'fair') {
    return "Koneksi Anda cukup. Disarankan untuk menunggu koneksi lebih stabil atau gunakan mode offline.";
  }

  if (quality.signalQuality === 'poor') {
    return "Koneksi Anda lemah. Sangat disarankan menggunakan mode offline untuk menghindari kegagalan absensi.";
  }

  return "Tidak ada sinyal. Gunakan mode offline untuk melakukan absensi.";
};
```


---

## 🚨 SMART ALERTS & NOTIFICATIONS

### 1. NETWORK QUALITY ALERTS

```tsx
const NetworkQualityAlerts = () => {
  const { quality, isOnline } = useNetworkMonitor();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newAlerts: Alert[] = [];

    // Offline Alert
    if (!isOnline) {
      newAlerts.push({
        id: 'offline',
        type: 'error',
        title: 'Tidak Ada Koneksi Internet',
        message: 'Anda sedang offline. Mode offline telah diaktifkan secara otomatis.',
        icon: <WifiOff className="h-5 w-5" />,
        action: {
          label: 'Gunakan Mode Offline',
          onClick: () => enableOfflineMode()
        },
        persistent: true
      });
    }

    // Poor Connection Alert
    if (isOnline && quality.signalQuality === 'poor') {
      newAlerts.push({
        id: 'poor-connection',
        type: 'warning',
        title: 'Koneksi Tidak Stabil',
        message: `Ping: ${quality.rtt}ms, Packet Loss: ${quality.packetLoss.toFixed(1)}%. Absensi mungkin gagal.`,
        icon: <AlertTriangle className="h-5 w-5" />,
        action: {
          label: 'Aktifkan Mode Offline',
          onClick: () => enableOfflineMode()
        }
      });
    }

    // High Ping Alert
    if (isOnline && quality.rtt > 500) {
      newAlerts.push({
        id: 'high-ping',
        type: 'warning',
        title: 'Ping Sangat Tinggi',
        message: `Ping Anda ${quality.rtt}ms. Ini dapat menyebabkan timeout saat absensi.`,
        icon: <Activity className="h-5 w-5" />,
        action: {
          label: 'Coba Lagi',
          onClick: () => retryConnection()
        }
      });
    }

    // Packet Loss Alert
    if (isOnline && quality.packetLoss > 10) {
      newAlerts.push({
        id: 'packet-loss',
        type: 'error',
        title: 'Packet Loss Tinggi',
        message: `${quality.packetLoss.toFixed(1)}% paket data hilang. Koneksi sangat tidak stabil.`,
        icon: <XCircle className="h-5 w-5" />
      });
    }

    // Unstable Connection Alert
    if (isOnline && !quality.isStable) {
      newAlerts.push({
        id: 'unstable',
        type: 'warning',
        title: 'Koneksi Tidak Stabil',
        message: `Jitter: ${quality.jitter}ms. Koneksi Anda berfluktuasi.`,
        icon: <TrendingDown className="h-5 w-5" />
      });
    }

    // Low Battery Alert (when not charging)
    if (quality.batteryLevel < 20 && !quality.isCharging) {
      newAlerts.push({
        id: 'low-battery',
        type: 'warning',
        title: 'Baterai Lemah',
        message: `Baterai ${quality.batteryLevel}%. Segera charge untuk menghindari data hilang.`,
        icon: <BatteryLow className="h-5 w-5" />
      });
    }

    // Connection Restored Alert
    if (isOnline && quality.signalQuality === 'excellent') {
      const hasOfflineData = checkOfflineData();
      if (hasOfflineData) {
        newAlerts.push({
          id: 'sync-ready',
          type: 'success',
          title: 'Koneksi Pulih!',
          message: 'Koneksi internet telah pulih. Sinkronisasi data offline?',
          icon: <CheckCircle className="h-5 w-5" />,
          action: {
            label: 'Sinkronkan Sekarang',
            onClick: () => syncOfflineData()
          }
        });
      }
    }

    setAlerts(newAlerts);
  }, [quality, isOnline]);

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-w-md">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <Alert 
              variant={alert.type}
              className={cn(
                "shadow-lg border-2",
                alert.type === 'error' && "bg-red-50 border-red-200",
                alert.type === 'warning' && "bg-yellow-50 border-yellow-200",
                alert.type === 'success' && "bg-green-50 border-green-200",
                alert.type === 'info' && "bg-blue-50 border-blue-200"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  alert.type === 'error' && "bg-red-100",
                  alert.type === 'warning' && "bg-yellow-100",
                  alert.type === 'success' && "bg-green-100",
                  alert.type === 'info' && "bg-blue-100"
                )}>
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <AlertTitle className="mb-1">{alert.title}</AlertTitle>
                  <AlertDescription className="text-sm">
                    {alert.message}
                  </AlertDescription>
                  {alert.action && (
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={alert.action.onClick}
                    >
                      {alert.action.label}
                    </Button>
                  )}
                </div>
                {!alert.persistent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

### 2. TOAST NOTIFICATIONS FOR NETWORK EVENTS

```tsx
const useNetworkToasts = () => {
  const { quality, isOnline } = useNetworkMonitor();
  const prevOnlineRef = useRef(isOnline);

  useEffect(() => {
    // Connection Lost
    if (prevOnlineRef.current && !isOnline) {
      toast({
        title: "Koneksi Terputus",
        description: "Mode offline diaktifkan. Data akan disimpan secara lokal.",
        variant: "destructive",
        duration: 5000,
        icon: <WifiOff className="h-5 w-5" />
      });
    }

    // Connection Restored
    if (!prevOnlineRef.current && isOnline) {
      toast({
        title: "Koneksi Pulih",
        description: "Terhubung kembali ke internet. Sinkronisasi data...",
        variant: "success",
        duration: 3000,
        icon: <Wifi className="h-5 w-5" />
      });
      
      // Auto sync
      syncOfflineData();
    }

    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    // Network Quality Changed
    const prevQuality = localStorage.getItem('prev_network_quality');
    
    if (prevQuality && prevQuality !== quality.signalQuality) {
      if (quality.signalQuality === 'poor' || quality.signalQuality === 'no-signal') {
        toast({
          title: "Kualitas Jaringan Menurun",
          description: `Koneksi Anda sekarang ${quality.signalQuality}. Pertimbangkan mode offline.`,
          variant: "warning",
          duration: 4000
        });
      } else if (quality.signalQuality === 'excellent' || quality.signalQuality === 'good') {
        toast({
          title: "Kualitas Jaringan Membaik",
          description: `Koneksi Anda sekarang ${quality.signalQuality}.`,
          variant: "success",
          duration: 3000
        });
      }
    }

    localStorage.setItem('prev_network_quality', quality.signalQuality);
  }, [quality.signalQuality]);
};
```


---

## 📴 OFFLINE MODE IMPLEMENTATION

### 1. OFFLINE STORAGE SYSTEM

```typescript
// IndexedDB for offline data storage
class OfflineStorage {
  private db: IDBDatabase;
  private readonly DB_NAME = 'attendance_offline_db';
  private readonly DB_VERSION = 1;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for attendance records
        if (!db.objectStoreNames.contains('attendances')) {
          const attendanceStore = db.createObjectStore('attendances', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          attendanceStore.createIndex('timestamp', 'timestamp', { unique: false });
          attendanceStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store for photos
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          photoStore.createIndex('attendanceId', 'attendanceId', { unique: false });
        }
      };
    });
  }

  async saveAttendance(data: OfflineAttendance): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['attendances'], 'readwrite');
      const store = transaction.objectStore('attendances');
      
      const request = store.add({
        ...data,
        synced: false,
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async savePhoto(attendanceId: number, photoBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');
      
      const request = store.add({
        attendanceId,
        photo: photoBlob,
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedAttendances(): Promise<OfflineAttendance[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['attendances'], 'readonly');
      const store = transaction.objectStore('attendances');
      const index = store.index('synced');
      
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['attendances'], 'readwrite');
      const store = transaction.objectStore('attendances');
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        data.synced = true;
        data.syncedAt = Date.now();
        
        const updateRequest = store.put(data);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearSyncedData(): Promise<void> {
    const synced = await this.getUnsyncedAttendances();
    // Only keep unsynced data
    // Clear synced data to save space
  }
}
```

### 2. OFFLINE ATTENDANCE UI

```tsx
const OfflineAttendancePage = () => {
  const { isOnline, quality } = useNetworkMonitor();
  const [offlineMode, setOfflineMode] = useState(!isOnline);
  const [pendingSync, setPendingSync] = useState<number>(0);

  useEffect(() => {
    // Auto enable offline mode if connection is poor
    if (quality.signalQuality === 'poor' || quality.signalQuality === 'no-signal') {
      setOfflineMode(true);
    }
  }, [quality]);

  useEffect(() => {
    // Check pending sync count
    const checkPending = async () => {
      const count = await offlineStorage.getUnsyncedCount();
      setPendingSync(count);
    };
    checkPending();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Network Status Banner */}
      <Card className={cn(
        "border-2",
        offlineMode ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {offlineMode ? (
                <div className="p-2 bg-orange-100 rounded-full">
                  <WifiOff className="h-6 w-6 text-orange-600" />
                </div>
              ) : (
                <div className="p-2 bg-green-100 rounded-full">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">
                  {offlineMode ? 'Mode Offline Aktif' : 'Mode Online'}
                </h3>
                <p className="text-sm text-gray-600">
                  {offlineMode 
                    ? 'Data akan disimpan secara lokal dan tersinkronisasi otomatis'
                    : 'Terhubung ke server'
                  }
                </p>
              </div>
            </div>

            {/* Toggle Offline Mode */}
            <div className="flex items-center gap-3">
              {pendingSync > 0 && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {pendingSync} menunggu sync
                </Badge>
              )}
              
              <Switch
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
                disabled={!isOnline}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Analytics */}
      <NetworkAnalyticsPanel />

      {/* Attendance Form */}
      <Card>
        <CardHeader>
          <CardTitle>Absensi {offlineMode && '(Offline)'}</CardTitle>
          <CardDescription>
            {offlineMode 
              ? 'Data akan tersimpan di perangkat Anda dan otomatis tersinkronisasi saat online'
              : 'Data akan langsung tersimpan ke server'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera for selfie */}
          <div className="relative">
            <Camera
              onCapture={handlePhotoCapture}
              disabled={false} // Always enabled in offline mode
            />
            
            {offlineMode && (
              <div className="absolute top-2 right-2">
                <Badge variant="warning" className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Offline
                </Badge>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <Label>Lokasi</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium">{location.address}</p>
                <p className="text-xs text-gray-500">
                  {location.lat}, {location.lng}
                </p>
              </div>
              {offlineMode && (
                <Badge variant="outline" size="sm">
                  Cached
                </Badge>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmitAttendance}
            className="w-full"
            size="lg"
          >
            {offlineMode ? (
              <>
                <Save className="mr-2 h-5 w-5" />
                Simpan Offline
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Kirim Absensi
              </>
            )}
          </Button>

          {/* Offline Info */}
          {offlineMode && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Data absensi akan disimpan di perangkat Anda dan otomatis 
                tersinkronisasi saat koneksi internet tersedia.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pending Sync List */}
      {pendingSync > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Menunggu Sinkronisasi</CardTitle>
                <CardDescription>
                  {pendingSync} absensi belum tersinkronisasi
                </CardDescription>
              </div>
              {isOnline && (
                <Button onClick={handleManualSync}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sinkronkan Sekarang
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <PendingSyncList />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```


### 3. AUTO SYNC MECHANISM

```typescript
class AutoSyncManager {
  private syncInterval: NodeJS.Timer;
  private isSyncing: boolean = false;
  private retryQueue: Map<number, number> = new Map(); // id -> retry count

  constructor(
    private offlineStorage: OfflineStorage,
    private networkMonitor: NetworkMonitor
  ) {
    this.initAutoSync();
  }

  private initAutoSync() {
    // Listen for online event
    window.addEventListener('online', () => {
      this.syncNow();
    });

    // Periodic sync check (every 30 seconds)
    this.syncInterval = setInterval(() => {
      if (this.networkMonitor.getQuality().isOnline && !this.isSyncing) {
        this.syncNow();
      }
    }, 30000);
  }

  async syncNow(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }

    this.isSyncing = true;

    try {
      const unsyncedData = await this.offlineStorage.getUnsyncedAttendances();
      
      if (unsyncedData.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      // Show sync progress
      toast({
        title: "Sinkronisasi Dimulai",
        description: `Mengirim ${unsyncedData.length} data absensi...`,
        duration: 3000
      });

      let synced = 0;
      let failed = 0;

      for (const data of unsyncedData) {
        try {
          // Check network quality before each sync
          const quality = this.networkMonitor.getQuality();
          
          if (!quality.isOnline || quality.signalQuality === 'no-signal') {
            console.log('Network lost during sync, pausing...');
            break;
          }

          // Get photo if exists
          const photo = await this.offlineStorage.getPhoto(data.id);

          // Send to server
          const response = await this.sendAttendanceToServer(data, photo);

          if (response.success) {
            await this.offlineStorage.markAsSynced(data.id);
            synced++;
            this.retryQueue.delete(data.id);
          } else {
            throw new Error(response.message);
          }

        } catch (error) {
          console.error('Sync failed for attendance:', data.id, error);
          failed++;
          
          // Retry logic
          const retryCount = this.retryQueue.get(data.id) || 0;
          if (retryCount < 3) {
            this.retryQueue.set(data.id, retryCount + 1);
          } else {
            // Mark as failed after 3 retries
            await this.offlineStorage.markAsFailed(data.id, error.message);
          }
        }
      }

      // Show result
      if (synced > 0) {
        toast({
          title: "Sinkronisasi Berhasil",
          description: `${synced} data berhasil tersinkronisasi${failed > 0 ? `, ${failed} gagal` : ''}`,
          variant: "success",
          duration: 5000
        });
      }

      if (failed > 0) {
        toast({
          title: "Beberapa Data Gagal Tersinkronisasi",
          description: `${failed} data akan dicoba lagi nanti`,
          variant: "warning",
          duration: 5000
        });
      }

      return { success: true, synced, failed };

    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sinkronisasi Gagal",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
      return { success: false, synced: 0, failed: 0 };
    } finally {
      this.isSyncing = false;
    }
  }

  private async sendAttendanceToServer(
    data: OfflineAttendance, 
    photo?: Blob
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('student_id', data.student_id.toString());
    formData.append('schedule_id', data.schedule_id.toString());
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('timestamp', data.timestamp.toString());
    formData.append('offline_mode', 'true');
    
    if (photo) {
      formData.append('photo', photo, 'attendance.jpg');
    }

    const response = await fetch('/api/attendance/submit', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Offline-Sync': 'true'
      }
    });

    return await response.json();
  }

  destroy() {
    clearInterval(this.syncInterval);
    window.removeEventListener('online', this.syncNow);
  }
}
```

### 4. PENDING SYNC LIST UI

```tsx
const PendingSyncList = () => {
  const [pendingData, setPendingData] = useState<OfflineAttendance[]>([]);
  const [syncing, setSyncing] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadPendingData();
  }, []);

  const loadPendingData = async () => {
    const data = await offlineStorage.getUnsyncedAttendances();
    setPendingData(data);
  };

  const handleSyncSingle = async (id: number) => {
    setSyncing(prev => new Set(prev).add(id));
    
    try {
      const data = pendingData.find(d => d.id === id);
      const photo = await offlineStorage.getPhoto(id);
      
      const response = await sendAttendanceToServer(data, photo);
      
      if (response.success) {
        await offlineStorage.markAsSynced(id);
        toast({
          title: "Berhasil Tersinkronisasi",
          variant: "success"
        });
        loadPendingData();
      }
    } catch (error) {
      toast({
        title: "Gagal Tersinkronisasi",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSyncing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteSingle = async (id: number) => {
    if (confirm('Yakin ingin menghapus data ini? Data tidak dapat dikembalikan.')) {
      await offlineStorage.deleteAttendance(id);
      loadPendingData();
      toast({
        title: "Data Dihapus",
        variant: "success"
      });
    }
  };

  return (
    <div className="space-y-3">
      {pendingData.map((data) => (
        <Card key={data.id} className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">
                  Absensi {format(new Date(data.timestamp), 'dd MMM yyyy HH:mm')}
                </p>
                <p className="text-sm text-gray-600">
                  {data.schedule_name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" size="sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                  </Badge>
                  {data.has_photo && (
                    <Badge variant="outline" size="sm">
                      <Camera className="h-3 w-3 mr-1" />
                      Dengan Foto
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSyncSingle(data.id)}
                disabled={syncing.has(data.id)}
              >
                {syncing.has(data.id) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteSingle(data.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {pendingData.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
          <p className="font-medium text-gray-700">Semua Data Tersinkronisasi</p>
          <p className="text-sm">Tidak ada data yang menunggu sinkronisasi</p>
        </div>
      )}
    </div>
  );
};
```


---

## 📊 NETWORK DIAGNOSTICS TOOL

### 1. ADVANCED DIAGNOSTICS PANEL

```tsx
const NetworkDiagnosticsTool = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    
    const results: DiagnosticsResult = {
      timestamp: Date.now(),
      tests: []
    };

    // Test 1: DNS Resolution
    results.tests.push(await testDNS());

    // Test 2: Server Connectivity
    results.tests.push(await testServerConnectivity());

    // Test 3: API Endpoint
    results.tests.push(await testAPIEndpoint());

    // Test 4: Upload Speed
    results.tests.push(await testUploadSpeed());

    // Test 5: Download Speed
    results.tests.push(await testDownloadSpeed());

    // Test 6: WebSocket Connection
    results.tests.push(await testWebSocket());

    setDiagnostics(results);
    setRunning(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Diagnostik Jaringan</CardTitle>
            <CardDescription>
              Uji koneksi dan identifikasi masalah jaringan
            </CardDescription>
          </div>
          <Button 
            onClick={runDiagnostics}
            disabled={running}
          >
            {running ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menguji...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Jalankan Diagnostik
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {diagnostics && (
        <CardContent className="space-y-3">
          {diagnostics.tests.map((test, index) => (
            <div 
              key={index}
              className={cn(
                "p-4 rounded-lg border-2",
                test.status === 'passed' && "bg-green-50 border-green-200",
                test.status === 'warning' && "bg-yellow-50 border-yellow-200",
                test.status === 'failed' && "bg-red-50 border-red-200"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {test.status === 'passed' && (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  )}
                  {test.status === 'warning' && (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  )}
                  {test.status === 'failed' && (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-semibold">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                    
                    {test.details && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(test.details).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {test.recommendation && (
                      <Alert className="mt-3 text-xs">
                        <Lightbulb className="h-3 w-3" />
                        <AlertDescription>{test.recommendation}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <Badge 
                  variant={
                    test.status === 'passed' ? 'success' : 
                    test.status === 'warning' ? 'warning' : 
                    'destructive'
                  }
                >
                  {test.duration}ms
                </Badge>
              </div>
            </div>
          ))}

          {/* Overall Score */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">Skor Kesehatan Jaringan</h4>
                  <p className="text-sm text-gray-600">
                    {diagnostics.tests.filter(t => t.status === 'passed').length} dari {diagnostics.tests.length} tes berhasil
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">
                    {Math.round((diagnostics.tests.filter(t => t.status === 'passed').length / diagnostics.tests.length) * 100)}%
                  </div>
                  <p className="text-xs text-gray-500">Health Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Report */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => exportDiagnostics(diagnostics)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Laporan
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => shareDiagnostics(diagnostics)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Bagikan ke Admin
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Diagnostic Test Functions
const testDNS = async (): Promise<DiagnosticTest> => {
  const start = performance.now();
  try {
    await fetch('https://dns.google/resolve?name=example.com', {
      method: 'GET',
      cache: 'no-cache'
    });
    const duration = Math.round(performance.now() - start);
    
    return {
      name: 'DNS Resolution',
      status: duration < 100 ? 'passed' : 'warning',
      message: duration < 100 ? 'DNS berfungsi normal' : 'DNS agak lambat',
      duration,
      details: { 'Response Time': `${duration}ms` }
    };
  } catch (error) {
    return {
      name: 'DNS Resolution',
      status: 'failed',
      message: 'Gagal resolve DNS',
      duration: Math.round(performance.now() - start),
      recommendation: 'Coba ganti DNS ke 8.8.8.8 atau 1.1.1.1'
    };
  }
};

const testServerConnectivity = async (): Promise<DiagnosticTest> => {
  const start = performance.now();
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      cache: 'no-cache'
    });
    const duration = Math.round(performance.now() - start);
    
    if (response.ok) {
      return {
        name: 'Server Connectivity',
        status: 'passed',
        message: 'Koneksi ke server berhasil',
        duration,
        details: { 
          'Status': response.status,
          'Response Time': `${duration}ms`
        }
      };
    } else {
      return {
        name: 'Server Connectivity',
        status: 'failed',
        message: `Server error: ${response.status}`,
        duration
      };
    }
  } catch (error) {
    return {
      name: 'Server Connectivity',
      status: 'failed',
      message: 'Tidak dapat terhubung ke server',
      duration: Math.round(performance.now() - start),
      recommendation: 'Periksa koneksi internet atau hubungi admin'
    };
  }
};

const testAPIEndpoint = async (): Promise<DiagnosticTest> => {
  const start = performance.now();
  try {
    const response = await fetch('/api/attendance/check', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    const duration = Math.round(performance.now() - start);
    
    return {
      name: 'API Endpoint',
      status: response.ok ? 'passed' : 'failed',
      message: response.ok ? 'API endpoint berfungsi' : 'API endpoint error',
      duration,
      details: { 'Status': response.status }
    };
  } catch (error) {
    return {
      name: 'API Endpoint',
      status: 'failed',
      message: 'Gagal mengakses API',
      duration: Math.round(performance.now() - start)
    };
  }
};

const testUploadSpeed = async (): Promise<DiagnosticTest> => {
  const start = performance.now();
  try {
    // Create 1MB test data
    const testData = new Blob([new ArrayBuffer(1024 * 1024)]);
    const formData = new FormData();
    formData.append('test', testData);
    
    await fetch('/api/speed-test/upload', {
      method: 'POST',
      body: formData
    });
    
    const duration = Math.round(performance.now() - start);
    const speed = (1 / (duration / 1000)).toFixed(2); // MB/s
    
    return {
      name: 'Upload Speed',
      status: parseFloat(speed) > 0.5 ? 'passed' : 'warning',
      message: `Kecepatan upload ${speed} MB/s`,
      duration,
      details: { 'Speed': `${speed} MB/s` }
    };
  } catch (error) {
    return {
      name: 'Upload Speed',
      status: 'failed',
      message: 'Gagal test upload',
      duration: Math.round(performance.now() - start)
    };
  }
};

const testDownloadSpeed = async (): Promise<DiagnosticTest> => {
  const start = performance.now();
  try {
    const response = await fetch('/api/speed-test/download');
    const blob = await response.blob();
    const duration = Math.round(performance.now() - start);
    const sizeMB = blob.size / (1024 * 1024);
    const speed = (sizeMB / (duration / 1000)).toFixed(2);
    
    return {
      name: 'Download Speed',
      status: parseFloat(speed) > 1 ? 'passed' : 'warning',
      message: `Kecepatan download ${speed} MB/s`,
      duration,
      details: { 'Speed': `${speed} MB/s` }
    };
  } catch (error) {
    return {
      name: 'Download Speed',
      status: 'failed',
      message: 'Gagal test download',
      duration: Math.round(performance.now() - start)
    };
  }
};

const testWebSocket = async (): Promise<DiagnosticTest> => {
  const start = performance.now();
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(getWebSocketURL());
      
      ws.onopen = () => {
        const duration = Math.round(performance.now() - start);
        ws.close();
        resolve({
          name: 'WebSocket Connection',
          status: 'passed',
          message: 'WebSocket terhubung',
          duration,
          details: { 'Connection Time': `${duration}ms` }
        });
      };
      
      ws.onerror = () => {
        const duration = Math.round(performance.now() - start);
        resolve({
          name: 'WebSocket Connection',
          status: 'failed',
          message: 'WebSocket gagal terhubung',
          duration,
          recommendation: 'Real-time features mungkin tidak berfungsi'
        });
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        ws.close();
        resolve({
          name: 'WebSocket Connection',
          status: 'failed',
          message: 'WebSocket timeout',
          duration: 5000
        });
      }, 5000);
    } catch (error) {
      resolve({
        name: 'WebSocket Connection',
        status: 'failed',
        message: 'WebSocket error',
        duration: Math.round(performance.now() - start)
      });
    }
  });
};
```


---

## 🎯 SMART NETWORK RECOMMENDATIONS

```tsx
const NetworkRecommendationEngine = () => {
  const { quality, isOnline } = useNetworkMonitor();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const recs: Recommendation[] = [];

    // Offline Recommendations
    if (!isOnline) {
      recs.push({
        priority: 'high',
        title: 'Aktifkan Mode Offline',
        description: 'Anda sedang offline. Aktifkan mode offline untuk tetap bisa absen.',
        action: 'enable_offline_mode',
        icon: <WifiOff />
      });
    }

    // Poor Signal Recommendations
    if (isOnline && quality.signalStrength < 30) {
      recs.push({
        priority: 'high',
        title: 'Pindah ke Area dengan Sinyal Lebih Baik',
        description: 'Sinyal Anda sangat lemah. Coba pindah ke dekat jendela atau area terbuka.',
        icon: <Signal />
      });
    }

    // High Ping Recommendations
    if (isOnline && quality.rtt > 300) {
      recs.push({
        priority: 'medium',
        title: 'Koneksi Lambat Terdeteksi',
        description: `Ping ${quality.rtt}ms. Pertimbangkan untuk:`,
        suggestions: [
          'Tutup aplikasi lain yang menggunakan internet',
          'Matikan download/upload yang sedang berjalan',
          'Restart router jika menggunakan WiFi',
          'Gunakan mode offline jika masalah berlanjut'
        ],
        icon: <Activity />
      });
    }

    // Packet Loss Recommendations
    if (isOnline && quality.packetLoss > 5) {
      recs.push({
        priority: 'high',
        title: 'Koneksi Tidak Stabil',
        description: `${quality.packetLoss.toFixed(1)}% packet loss terdeteksi.`,
        suggestions: [
          'Periksa kabel jaringan (jika ethernet)',
          'Pindah lebih dekat ke router (jika WiFi)',
          'Restart perangkat jaringan',
          'Gunakan mode offline untuk menghindari kegagalan'
        ],
        icon: <AlertTriangle />
      });
    }

    // WiFi vs Mobile Data
    if (quality.connectionType === 'wifi' && quality.signalQuality === 'poor') {
      recs.push({
        priority: 'medium',
        title: 'Coba Gunakan Data Seluler',
        description: 'WiFi Anda tidak stabil. Data seluler mungkin lebih baik.',
        action: 'suggest_mobile_data',
        icon: <Smartphone />
      });
    }

    // Battery Saver Impact
    if (quality.saveData) {
      recs.push({
        priority: 'low',
        title: 'Data Saver Aktif',
        description: 'Mode hemat data dapat mempengaruhi kecepatan. Nonaktifkan untuk performa optimal.',
        icon: <Database />
      });
    }

    // Low Battery Warning
    if (quality.batteryLevel < 15 && !quality.isCharging) {
      recs.push({
        priority: 'high',
        title: 'Baterai Hampir Habis',
        description: 'Segera charge perangkat untuk menghindari kehilangan data.',
        icon: <BatteryLow />
      });
    }

    // Optimal Conditions
    if (isOnline && quality.signalQuality === 'excellent' && quality.rtt < 100) {
      recs.push({
        priority: 'low',
        title: 'Kondisi Optimal',
        description: 'Koneksi Anda sangat baik. Ini waktu yang tepat untuk sinkronisasi data offline.',
        action: 'sync_now',
        icon: <CheckCircle />
      });
    }

    setRecommendations(recs);
  }, [quality, isOnline]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Rekomendasi Jaringan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <Alert 
            key={index}
            className={cn(
              rec.priority === 'high' && "border-red-200 bg-red-50",
              rec.priority === 'medium' && "border-yellow-200 bg-yellow-50",
              rec.priority === 'low' && "border-blue-200 bg-blue-50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-full",
                rec.priority === 'high' && "bg-red-100",
                rec.priority === 'medium' && "bg-yellow-100",
                rec.priority === 'low' && "bg-blue-100"
              )}>
                {rec.icon}
              </div>
              <div className="flex-1">
                <AlertTitle>{rec.title}</AlertTitle>
                <AlertDescription className="mt-1">
                  {rec.description}
                  {rec.suggestions && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {rec.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
                {rec.action && (
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => handleAction(rec.action)}
                  >
                    {getActionLabel(rec.action)}
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p className="font-medium text-gray-700">Tidak Ada Masalah</p>
            <p className="text-sm">Koneksi Anda berfungsi dengan baik</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 📱 MOBILE-SPECIFIC OPTIMIZATIONS

```tsx
// Detect mobile network type
const useMobileNetworkInfo = () => {
  const [networkInfo, setNetworkInfo] = useState<MobileNetworkInfo>({
    type: 'unknown',
    effectiveType: 'unknown',
    downlinkMax: 0,
    rtt: 0,
    saveData: false
  });

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      const updateNetworkInfo = () => {
        setNetworkInfo({
          type: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlinkMax: connection.downlinkMax || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
};

// Adaptive Image Quality
const AdaptiveImage = ({ src, alt }: { src: string; alt: string }) => {
  const { quality } = useNetworkMonitor();
  
  const getImageQuality = () => {
    if (quality.saveData) return 'low';
    if (quality.effectiveType === '4g') return 'high';
    if (quality.effectiveType === '3g') return 'medium';
    return 'low';
  };

  const imageSrc = `${src}?quality=${getImageQuality()}`;

  return <img src={imageSrc} alt={alt} loading="lazy" />;
};

// Adaptive Video Quality
const AdaptiveCamera = () => {
  const { quality } = useNetworkMonitor();
  
  const getVideoConstraints = () => {
    if (quality.saveData || quality.effectiveType === '2g') {
      return { width: 640, height: 480 };
    }
    if (quality.effectiveType === '3g') {
      return { width: 1280, height: 720 };
    }
    return { width: 1920, height: 1080 };
  };

  return (
    <Camera 
      constraints={{
        video: getVideoConstraints()
      }}
    />
  );
};
```

---

## 🔧 SERVICE WORKER FOR OFFLINE

```typescript
// service-worker.ts
const CACHE_NAME = 'attendance-offline-v1';
const urlsToCache = [
  '/',
  '/attendance',
  '/offline',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/images/logo.png'
];

// Install event
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response and cache it
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Return offline page
            return caches.match('/offline');
          });
      })
  );
});

// Background Sync
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendanceData());
  }
});

async function syncAttendanceData() {
  const db = await openDB();
  const unsyncedData = await getUnsyncedAttendances(db);
  
  for (const data of unsyncedData) {
    try {
      await fetch('/api/attendance/submit', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      await markAsSynced(db, data.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```


---

## 📈 ANALYTICS & REPORTING

### 1. NETWORK QUALITY HISTORY

```tsx
const NetworkQualityHistory = () => {
  const [history, setHistory] = useState<NetworkQualitySnapshot[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('network_quality_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Kualitas Jaringan</CardTitle>
        <CardDescription>24 jam terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(ts) => format(new Date(ts), 'HH:mm')}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(ts) => format(new Date(ts), 'dd MMM HH:mm')}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rtt" 
              stroke="#8884d8" 
              name="Ping (ms)"
            />
            <Line 
              type="monotone" 
              dataKey="signalStrength" 
              stroke="#82ca9d" 
              name="Signal (%)"
            />
            <Line 
              type="monotone" 
              dataKey="downlink" 
              stroke="#ffc658" 
              name="Speed (Mbps)"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg Ping</p>
            <p className="text-2xl font-bold">
              {calculateAverage(history, 'rtt')}ms
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg Signal</p>
            <p className="text-2xl font-bold">
              {calculateAverage(history, 'signalStrength')}%
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg Speed</p>
            <p className="text-2xl font-bold">
              {calculateAverage(history, 'downlink').toFixed(1)} Mbps
            </p>
          </div>
        </div>

        {/* Connection Type Distribution */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Distribusi Jenis Koneksi</h4>
          <div className="space-y-2">
            {getConnectionTypeDistribution(history).map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.type.toUpperCase()}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 2. OFFLINE USAGE STATISTICS

```tsx
const OfflineUsageStats = () => {
  const [stats, setStats] = useState<OfflineStats | null>(null);

  useEffect(() => {
    loadOfflineStats();
  }, []);

  const loadOfflineStats = async () => {
    const data = await offlineStorage.getStatistics();
    setStats(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Penggunaan Offline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total Offline</span>
            </div>
            <p className="text-3xl font-bold">{stats?.totalOfflineAttendances}</p>
            <p className="text-xs text-gray-500">absensi offline</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Tersinkronisasi</span>
            </div>
            <p className="text-3xl font-bold">{stats?.syncedAttendances}</p>
            <p className="text-xs text-gray-500">berhasil sync</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-gray-600">Menunggu Sync</span>
            </div>
            <p className="text-3xl font-bold">{stats?.pendingSync}</p>
            <p className="text-xs text-gray-500">belum sync</p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-gray-600">Gagal Sync</span>
            </div>
            <p className="text-3xl font-bold">{stats?.failedSync}</p>
            <p className="text-xs text-gray-500">perlu retry</p>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Penggunaan Storage</span>
            <span className="text-sm text-gray-600">
              {formatBytes(stats?.storageUsed || 0)} / {formatBytes(stats?.storageQuota || 0)}
            </span>
          </div>
          <Progress 
            value={(stats?.storageUsed || 0) / (stats?.storageQuota || 1) * 100} 
          />
          <p className="text-xs text-gray-500 mt-1">
            {((stats?.storageUsed || 0) / (stats?.storageQuota || 1) * 100).toFixed(1)}% terpakai
          </p>
        </div>

        {/* Sync Success Rate */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Tingkat Keberhasilan Sync</span>
            <span className="text-2xl font-bold text-purple-600">
              {stats?.syncSuccessRate}%
            </span>
          </div>
          <Progress 
            value={stats?.syncSuccessRate || 0}
            indicatorClassName="bg-purple-600"
          />
        </div>

        {/* Average Sync Time */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium">Rata-rata Waktu Sync</span>
          </div>
          <span className="text-lg font-bold">{stats?.avgSyncTime}s</span>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🎓 USER EDUCATION

### 1. NETWORK TIPS MODAL

```tsx
const NetworkTipsModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <HelpCircle className="mr-2 h-4 w-4" />
        Tips Jaringan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tips Mengoptimalkan Koneksi</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* WiFi Tips */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Wifi className="h-5 w-5" />
                Tips WiFi
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Posisikan perangkat dekat dengan router</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Hindari penghalang seperti dinding tebal</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Gunakan WiFi 5GHz jika tersedia (lebih cepat tapi jangkauan lebih pendek)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Restart router jika koneksi lambat</span>
                </li>
              </ul>
            </div>

            {/* Mobile Data Tips */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Smartphone className="h-5 w-5" />
                Tips Data Seluler
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Pindah ke area dengan sinyal lebih kuat</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Aktifkan mode 4G/LTE untuk kecepatan optimal</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Matikan mode hemat data saat absen</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Restart ponsel jika sinyal tidak stabil</span>
                </li>
              </ul>
            </div>

            {/* Offline Mode Tips */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <WifiOff className="h-5 w-5" />
                Kapan Menggunakan Mode Offline
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span>Ping lebih dari 500ms</span>
                </li>
                <li className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span>Packet loss lebih dari 10%</span>
                </li>
                <li className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span>Sinyal sangat lemah (< 30%)</span>
                </li>
                <li className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span>Koneksi sering terputus</span>
                </li>
              </ul>
            </div>

            {/* Troubleshooting */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Settings className="h-5 w-5" />
                Troubleshooting
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-1">Absensi Gagal Terkirim</p>
                  <p className="text-gray-600">
                    Aktifkan mode offline, data akan otomatis tersinkronisasi saat koneksi pulih
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-1">Foto Tidak Terupload</p>
                  <p className="text-gray-600">
                    Foto akan disimpan lokal dan otomatis terupload saat koneksi membaik
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-1">Sinkronisasi Lambat</p>
                  <p className="text-gray-600">
                    Tunggu hingga koneksi lebih stabil atau gunakan WiFi untuk sync lebih cepat
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Mengerti</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Backend
- [ ] API endpoint untuk network health check
- [ ] API endpoint untuk speed test (upload/download)
- [ ] Endpoint untuk menerima offline sync data
- [ ] Validasi data offline saat sync
- [ ] Log offline attendance dengan flag khusus
- [ ] Queue system untuk retry failed sync

### Frontend
- [ ] Network monitor service
- [ ] IndexedDB offline storage
- [ ] Auto sync manager
- [ ] Network quality indicator UI
- [ ] Network analytics panel
- [ ] Smart alerts system
- [ ] Offline mode toggle
- [ ] Pending sync list
- [ ] Network diagnostics tool
- [ ] Recommendation engine
- [ ] Network quality history chart
- [ ] Offline usage statistics
- [ ] Network tips modal

### Service Worker
- [ ] Cache static assets
- [ ] Implement offline page
- [ ] Background sync for attendance
- [ ] Push notifications for sync status

### Testing
- [ ] Test offline mode functionality
- [ ] Test auto sync mechanism
- [ ] Test network quality detection
- [ ] Test with various network conditions (2G, 3G, 4G, 5G, WiFi)
- [ ] Test with poor signal
- [ ] Test with high latency
- [ ] Test with packet loss
- [ ] Test storage limits
- [ ] Test sync retry logic

### Documentation
- [ ] User guide untuk offline mode
- [ ] Network troubleshooting guide
- [ ] API documentation
- [ ] Developer documentation

---

**SELESAI! Prompt super advanced untuk Offline Mode & Network Quality Monitoring dengan analisis jaringan real-time yang sangat detail!** 🚀📡
