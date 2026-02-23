# 📱 PROMPT ULTRA ADVANCED: ADMIN PERANGKAT DETAIL PAGE
## Halaman Detail Perangkat dengan UI/UX Dashboard Admin Style

---

## 📋 OVERVIEW HALAMAN

### Tujuan
Halaman **Detail Perangkat** menampilkan informasi lengkap tentang perangkat yang digunakan mahasiswa untuk melakukan absensi, termasuk:
- Informasi hardware dan software
- Riwayat penggunaan perangkat
- Deteksi anomali dan keamanan
- Lokasi akses
- Timeline aktivitas
- Analisis pola penggunaan

### Layout Style
Mengikuti style dashboard admin dengan:
- Full page layout
- Dark theme dengan gradient
- Card-based components
- Interactive charts dan visualizations
- Real-time data updates
- Smooth animations

---

## 🎨 COLOR SCHEME

### Primary Colors (Purple Theme - sesuai modal)
```typescript
const deviceColors = {
  primary: {
    purple: '#8b5cf6',      // Violet 500
    purpleDark: '#7c3aed',  // Violet 600
    purpleLight: '#a78bfa', // Violet 400
    purpleGlow: 'rgba(139, 92, 246, 0.3)',
  },
  
  secondary: {
    blue: '#3b82f6',        // Blue 500
    green: '#10b981',       // Emerald 500
    amber: '#f59e0b',       // Amber 500
    red: '#ef4444',         // Red 500
  },
  
  backgrounds: {
    dark: '#0f172a',        // Slate 900
    darker: '#020617',      // Slate 950
    card: '#1e293b',        // Slate 800
    cardHover: '#334155',   // Slate 700
  },
  
  text: {
    primary: '#f1f5f9',     // Slate 100
    secondary: '#94a3b8',   // Slate 400
    muted: '#64748b',       // Slate 500
  },
  
  borders: {
    default: '#334155',     // Slate 700
    hover: '#475569',       // Slate 600
    active: '#8b5cf6',      // Violet 500
  }
}
```

---

## 🏗️ PAGE STRUCTURE

### Full Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER SECTION (Fixed Top)                                 │
│  - Breadcrumb Navigation                                    │
│  - Device Title & Status Badge                              │
│  - Action Buttons (Block, Whitelist, Export)                │
└─────────────────────────────────────────────────────────────┘
│
├─ TOP SECTION (Grid 4 Columns)                               │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ Total    │ Waktu    │ OS       │ Status   │             │
│  │ Scan     │ Terakhir │ System   │ Keamanan │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
│
├─ MAIN CONTENT (Grid 2 Columns)                              │
│  ┌─────────────────────────┬─────────────────────────────┐ │
│  │ LEFT COLUMN (60%)       │ RIGHT COLUMN (40%)          │ │
│  │                         │                             │ │
│  │ ┌─────────────────────┐ │ ┌─────────────────────────┐ │ │
│  │ │ Device Info Card    │ │ │ Student Info Card       │ │ │
│  │ │ - Hardware Specs    │ │ │ - Profile               │ │ │
│  │ │ - Software Info     │ │ │ - Quick Stats           │ │ │
│  │ │ - Browser Details   │ │ │ - Contact Info          │ │ │
│  │ └─────────────────────┘ │ └─────────────────────────┘ │ │
│  │                         │                             │ │
│  │ ┌─────────────────────┐ │ ┌─────────────────────────┐ │ │
│  │ │ Usage Timeline      │ │ │ Location Map            │ │ │
│  │ │ - Activity Chart    │ │ │ - GPS Coordinates       │ │ │
│  │ │ - Frequency Graph   │ │ │ - Access Points         │ │ │
│  │ └─────────────────────┘ │ └─────────────────────────┘ │ │
│  │                         │                             │ │
│  │ ┌─────────────────────┐ │ ┌─────────────────────────┐ │ │
│  │ │ Security Analysis   │ │ │ Anomaly Detection       │ │ │
│  │ │ - Risk Score        │ │ │ - Suspicious Activity   │ │ │
│  │ │ - Threat Detection  │ │ │ - Alerts                │ │ │
│  │ └─────────────────────┘ │ └─────────────────────────┘ │ │
│  └─────────────────────────┴─────────────────────────────┘ │
│
├─ BOTTOM SECTION (Full Width)                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Activity History Table                                │ │
│  │ - Timestamp, Action, Location, Status                 │ │
│  │ - Pagination & Filters                                │ │
│  └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

---

## 🎯 COMPONENT DETAILS

### 1. HEADER SECTION

#### Design Specifications
```tsx
interface HeaderProps {
  deviceInfo: {
    model: string;
    os: string;
    status: 'active' | 'blocked' | 'suspicious' | 'whitelisted';
  };
  studentName: string;
  onBlock: () => void;
  onWhitelist: () => void;
  onExport: () => void;
}
```

#### Implementation

```tsx
const DeviceDetailHeader: React.FC<HeaderProps> = ({
  deviceInfo,
  studentName,
  onBlock,
  onWhitelist,
  onExport
}) => {
  return (
    <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl 
      border-b border-slate-700 px-8 py-6">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <Home className="w-4 h-4 text-slate-400" />
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <Link to="/admin/perangkat" 
          className="text-slate-400 hover:text-violet-400 transition-colors">
          Perangkat
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-violet-400 font-medium">Detail</span>
      </div>
      
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Device Icon */}
          <div className="p-4 bg-gradient-to-br from-violet-500/20 to-purple-600/10 
            border border-violet-500/30 rounded-2xl">
            <Monitor className="w-8 h-8 text-violet-400" />
          </div>
          
          {/* Device Info */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {deviceInfo.model}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                {deviceInfo.os}
              </span>
              <span className="text-slate-600">•</span>
              <StatusBadge status={deviceInfo.status} />
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">
                Digunakan oleh: <span className="text-violet-400 font-medium">
                  {studentName}
                </span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 
              border border-slate-600 rounded-xl text-slate-300 
              hover:text-white transition-all duration-300 
              flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={onWhitelist}
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 
              border border-emerald-500/30 rounded-xl text-emerald-400 
              hover:text-emerald-300 transition-all duration-300 
              flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>Whitelist</span>
          </button>
          
          <button
            onClick={onBlock}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
              border border-red-500/30 rounded-xl text-red-400 
              hover:text-red-300 transition-all duration-300 
              flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            <span>Block Device</span>
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### Status Badge Component
```tsx
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      icon: CheckCircle,
      label: 'Aktif',
    },
    blocked: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      icon: Ban,
      label: 'Diblokir',
    },
    suspicious: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      icon: AlertTriangle,
      label: 'Mencurigakan',
    },
    whitelisted: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      icon: Shield,
      label: 'Whitelist',
    },
  };
  
  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;
  
  return (
    <div className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full
      ${config.bg} ${config.border} ${config.text}
      border text-xs font-semibold
    `}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
};
```

---

### 2. TOP STATS CARDS

```tsx
const TopStatsCards = ({ stats }) => {
  const cards = [
    {
      label: 'Total Scan',
      value: stats.totalScans,
      icon: Activity,
      color: 'violet',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Waktu Terakhir',
      value: stats.lastAccess,
      icon: Clock,
      color: 'blue',
      subtitle: 'Hari ini, 08:31',
    },
    {
      label: 'OS System',
      value: stats.osSystem,
      icon: Cpu,
      color: 'emerald',
      subtitle: stats.osVersion,
    },
    {
      label: 'Status Keamanan',
      value: stats.securityScore + '%',
      icon: Shield,
      color: stats.securityScore > 80 ? 'emerald' : 'amber',
      subtitle: stats.securityScore > 80 ? 'Aman' : 'Perlu Perhatian',
    },
  ];
  
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              bg-gradient-to-br from-slate-800/50 to-slate-900/50
              border border-slate-700 hover:border-${card.color}-500/50
              rounded-2xl p-6 transition-all duration-300
              hover:shadow-lg hover:shadow-${card.color}-500/10
              group cursor-pointer
            `}
          >
            {/* Icon */}
            <div className={`
              inline-flex p-3 rounded-xl mb-4
              bg-${card.color}-500/10 border border-${card.color}-500/30
              group-hover:bg-${card.color}-500/20 transition-all
            `}>
              <Icon className={`w-6 h-6 text-${card.color}-400`} />
            </div>
            
            {/* Label */}
            <div className="text-sm text-slate-400 mb-2">
              {card.label}
            </div>
            
            {/* Value */}
            <div className="flex items-end justify-between">
              <div className={`
                text-3xl font-bold text-white
                group-hover:text-${card.color}-400 transition-colors
              `}>
                {card.value}
              </div>
              
              {card.trend && (
                <div className={`
                  flex items-center gap-1 text-xs font-semibold
                  ${card.trendUp ? 'text-emerald-400' : 'text-red-400'}
                `}>
                  {card.trendUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{card.trend}</span>
                </div>
              )}
            </div>
            
            {/* Subtitle */}
            {card.subtitle && (
              <div className="text-xs text-slate-500 mt-2">
                {card.subtitle}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
```

---

### 3. DEVICE INFO CARD

```tsx
const DeviceInfoCard = ({ device }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-violet-400" />
          Informasi Perangkat
        </h3>
        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      
      {/* Hardware Specs */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Monitor className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Model</div>
              <div className="text-white font-medium">{device.model}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Processor</div>
              <div className="text-white font-medium">{device.processor}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <HardDrive className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Memory</div>
              <div className="text-white font-medium">{device.memory}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Software Info */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">
          Software Information
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">OS Version</span>
            <span className="text-white font-medium">{device.osVersion}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Browser</span>
            <span className="text-white font-medium">{device.browser}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Screen Resolution</span>
            <span className="text-white font-medium">{device.resolution}</span>
          </div>
        </div>
      </div>
      
      {/* User Agent */}
      <div className="mt-4 p-4 bg-slate-900/30 rounded-xl border border-slate-700/30">
        <div className="flex items-start gap-2 mb-2">
          <Code className="w-4 h-4 text-slate-400 mt-0.5" />
          <div className="text-xs text-slate-400">User Agent String (Raw)</div>
        </div>
        <div className="text-xs text-slate-500 font-mono break-all">
          {device.userAgent}
        </div>
      </div>
    </div>
  );
};
```

---

### 4. STUDENT INFO CARD

```tsx
const StudentInfoCard = ({ student }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-violet-400" />
        Info Mahasiswa
      </h3>
      
      {/* Profile */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 
            border-violet-500/50">
            {student.foto ? (
              <img src={student.foto} alt={student.nama} 
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br 
                from-violet-500/20 to-purple-600/10 
                flex items-center justify-center">
                <User className="w-8 h-8 text-violet-400/50" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 
            bg-emerald-500 rounded-full border-2 border-slate-800" />
        </div>
        
        <div className="flex-1">
          <div className="text-white font-semibold">{student.nama}</div>
          <div className="text-sm text-violet-400 font-mono">{student.nim}</div>
          <div className="text-xs text-slate-400 mt-1">
            {student.prodi} • Semester {student.semester}
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Total Absen</div>
          <div className="text-xl font-bold text-white">{student.totalAbsen}</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Kehadiran</div>
          <div className="text-xl font-bold text-emerald-400">
            {student.kehadiran}%
          </div>
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300">{student.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300">{student.phone}</span>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-2">
        <button className="w-full px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 
          border border-violet-500/30 rounded-xl text-violet-400 
          transition-all duration-300 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          <span>Lihat Profile</span>
        </button>
        <button className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 
          border border-slate-600 rounded-xl text-slate-300 
          transition-all duration-300 flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>Kirim Pesan</span>
        </button>
      </div>
    </div>
  );
};
```


---

### 5. USAGE TIMELINE CHART

```tsx
import { Line } from 'react-chartjs-2';

const UsageTimelineChart = ({ data }) => {
  const chartData = {
    labels: data.labels, // ['Sen', 'Sel', 'Rab', ...]
    datasets: [
      {
        label: 'Jumlah Akses',
        data: data.values,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#334155',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
        },
      },
      y: {
        grid: {
          color: '#334155',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
        },
      },
    },
  };
  
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          Timeline Penggunaan
        </h3>
        
        <select className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 
          rounded-lg text-sm text-slate-300 focus:outline-none 
          focus:ring-2 focus:ring-violet-500/50">
          <option>7 Hari Terakhir</option>
          <option>30 Hari Terakhir</option>
          <option>3 Bulan Terakhir</option>
        </select>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
        <div className="text-center">
          <div className="text-2xl font-bold text-violet-400">
            {data.avgDaily}
          </div>
          <div className="text-xs text-slate-400 mt-1">Rata-rata Harian</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {data.peakDay}
          </div>
          <div className="text-xs text-slate-400 mt-1">Hari Tersibuk</div>
        </div>
        <div className="text-2xl font-bold text-emerald-400">
            {data.totalWeek}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Minggu Ini</div>
        </div>
      </div>
    </div>
  );
};
```

---

### 6. LOCATION MAP CARD

```tsx
const LocationMapCard = ({ locations }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-violet-400" />
        Lokasi Akses
      </h3>
      
      {/* Map Placeholder */}
      <div className="relative h-64 bg-slate-900/50 rounded-xl overflow-hidden 
        border border-slate-700/50 mb-4">
        {/* You can integrate Google Maps or Leaflet here */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-violet-400/30 mx-auto mb-2" />
            <div className="text-sm text-slate-400">Map View</div>
          </div>
        </div>
        
        {/* Location Markers */}
        {locations.map((loc, index) => (
          <div
            key={index}
            className="absolute w-3 h-3 bg-violet-500 rounded-full 
              border-2 border-white shadow-lg animate-pulse"
            style={{
              left: `${loc.x}%`,
              top: `${loc.y}%`,
            }}
          />
        ))}
      </div>
      
      {/* Location List */}
      <div className="space-y-2">
        {locations.slice(0, 3).map((loc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 
              bg-slate-900/50 rounded-lg border border-slate-700/50 
              hover:border-violet-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <MapPin className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <div className="text-sm text-white font-medium">
                  {loc.name}
                </div>
                <div className="text-xs text-slate-400">
                  {loc.coordinates}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {loc.count}x
            </div>
          </div>
        ))}
      </div>
      
      {/* View All Button */}
      <button className="w-full mt-4 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 
        border border-slate-600 rounded-xl text-slate-300 hover:text-white 
        transition-all duration-300 flex items-center justify-center gap-2">
        <Eye className="w-4 h-4" />
        <span>Lihat Semua Lokasi</span>
      </button>
    </div>
  );
};
```

---

### 7. SECURITY ANALYSIS CARD

```tsx
const SecurityAnalysisCard = ({ security }) => {
  const getRiskLevel = (score) => {
    if (score >= 80) return { label: 'Rendah', color: 'emerald', icon: Shield };
    if (score >= 50) return { label: 'Sedang', color: 'amber', icon: AlertTriangle };
    return { label: 'Tinggi', color: 'red', icon: AlertCircle };
  };
  
  const risk = getRiskLevel(security.score);
  const RiskIcon = risk.icon;
  
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-violet-400" />
        Analisis Keamanan
      </h3>
      
      {/* Risk Score Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#334155"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke={`var(--${risk.color}-500)`}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(security.score / 100) * 440} 440`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold text-${risk.color}-400`}>
              {security.score}
            </div>
            <div className="text-sm text-slate-400">Security Score</div>
          </div>
        </div>
      </div>
      
      {/* Risk Level Badge */}
      <div className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-xl mb-6
        bg-${risk.color}-500/10 border border-${risk.color}-500/30
      `}>
        <RiskIcon className={`w-4 h-4 text-${risk.color}-400`} />
        <span className={`text-sm font-semibold text-${risk.color}-400`}>
          Risiko {risk.label}
        </span>
      </div>
      
      {/* Security Checks */}
      <div className="space-y-3">
        {security.checks.map((check, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 
              bg-slate-900/50 rounded-lg border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              {check.passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-slate-300">{check.label}</span>
            </div>
            {check.passed ? (
              <span className="text-xs text-emerald-400 font-medium">Passed</span>
            ) : (
              <span className="text-xs text-red-400 font-medium">Failed</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Recommendations */}
      {security.recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 
          rounded-xl">
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5" />
            <div className="text-sm font-semibold text-amber-400">
              Rekomendasi
            </div>
          </div>
          <ul className="space-y-1 text-xs text-amber-300/80">
            {security.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

---

### 8. ANOMALY DETECTION CARD

```tsx
const AnomalyDetectionCard = ({ anomalies }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-violet-400" />
          Deteksi Anomali
        </h3>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 
          border border-red-500/30 rounded-full">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-xs text-red-400 font-semibold">
            {anomalies.active} Aktif
          </span>
        </div>
      </div>
      
      {/* Anomaly List */}
      <div className="space-y-3">
        {anomalies.list.map((anomaly, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 rounded-xl border transition-all cursor-pointer
              ${anomaly.severity === 'high'
                ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                : anomaly.severity === 'medium'
                ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                : 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {anomaly.severity === 'high' ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : anomaly.severity === 'medium' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400" />
                )}
                <span className={`
                  text-sm font-semibold
                  ${anomaly.severity === 'high' ? 'text-red-400' : ''}
                  ${anomaly.severity === 'medium' ? 'text-amber-400' : ''}
                  ${anomaly.severity === 'low' ? 'text-blue-400' : ''}
                `}>
                  {anomaly.type}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {anomaly.timestamp}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 mb-2">
              {anomaly.description}
            </p>
            
            <div className="flex items-center gap-2">
              <button className="text-xs text-violet-400 hover:text-violet-300 
                font-medium transition-colors">
                Investigasi
              </button>
              <span className="text-slate-600">•</span>
              <button className="text-xs text-slate-400 hover:text-slate-300 
                transition-colors">
                Tandai Aman
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* View All */}
      {anomalies.total > anomalies.list.length && (
        <button className="w-full mt-4 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 
          border border-slate-600 rounded-xl text-slate-300 hover:text-white 
          transition-all duration-300">
          Lihat Semua ({anomalies.total})
        </button>
      )}
    </div>
  );
};
```

---

### 9. ACTIVITY HISTORY TABLE

```tsx
const ActivityHistoryTable = ({ activities }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-violet-400" />
          Riwayat Aktivitas
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 
              rounded-lg text-sm text-slate-300 focus:outline-none 
              focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="all">Semua Aktivitas</option>
            <option value="login">Login</option>
            <option value="scan">Scan QR</option>
            <option value="anomaly">Anomali</option>
          </select>
          
          {/* Export */}
          <button className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 
            border border-slate-600 rounded-lg text-sm text-slate-300 
            hover:text-white transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                Timestamp
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                Aktivitas
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                Lokasi
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                IP Address
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                Status
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-400">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 
                  transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="text-sm text-white">
                    {activity.date}
                  </div>
                  <div className="text-xs text-slate-400">
                    {activity.time}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {activity.type === 'scan' && (
                      <QrCode className="w-4 h-4 text-violet-400" />
                    )}
                    {activity.type === 'login' && (
                      <LogIn className="w-4 h-4 text-blue-400" />
                    )}
                    {activity.type === 'anomaly' && (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-sm text-slate-300">
                      {activity.action}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-slate-300">
                    {activity.location}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-slate-400 font-mono">
                    {activity.ip}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                    ${activity.status === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : activity.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                    }
                  `}>
                    {activity.status === 'success' && <CheckCircle className="w-3 h-3" />}
                    {activity.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                    {activity.status === 'failed' && <XCircle className="w-3 h-3" />}
                    {activity.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-6 
        border-t border-slate-700/50">
        <div className="text-sm text-slate-400">
          Menampilkan {activities.length} dari {activities.total} aktivitas
        </div>
        
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 
              disabled:opacity-50 disabled:cursor-not-allowed
              border border-slate-600 rounded-lg text-sm text-slate-300 
              transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`
                px-3 py-1.5 rounded-lg text-sm transition-all
                ${currentPage === page
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }
              `}
            >
              {page}
            </button>
          ))}
          
          <button className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 
            border border-slate-600 rounded-lg text-sm text-slate-300 
            transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
```


---

## 🎬 ANIMATIONS & TRANSITIONS

### Page Load Animation
```tsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 }
};
```

### Hover Effects
```css
/* Card Hover */
.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(139, 92, 246, 0.1);
}

/* Button Hover */
.action-button:hover {
  transform: scale(1.05);
}

/* Glow Effect */
.glow-effect {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
  }
}
```

---

## 📊 DATA STRUCTURE

### Device Interface
```typescript
interface Device {
  id: string;
  model: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  processor: string;
  memory: string;
  resolution: string;
  userAgent: string;
  status: 'active' | 'blocked' | 'suspicious' | 'whitelisted';
  
  stats: {
    totalScans: number;
    lastAccess: string;
    securityScore: number;
  };
  
  student: {
    id: string;
    nama: string;
    nim: string;
    foto?: string;
    prodi: string;
    semester: number;
    email: string;
    phone: string;
    totalAbsen: number;
    kehadiran: number;
  };
  
  locations: Array<{
    name: string;
    coordinates: string;
    count: number;
    x: number;
    y: number;
  }>;
  
  security: {
    score: number;
    checks: Array<{
      label: string;
      passed: boolean;
    }>;
    recommendations: string[];
  };
  
  anomalies: {
    active: number;
    total: number;
    list: Array<{
      type: string;
      severity: 'high' | 'medium' | 'low';
      description: string;
      timestamp: string;
    }>;
  };
  
  activities: Array<{
    date: string;
    time: string;
    type: 'scan' | 'login' | 'anomaly';
    action: string;
    location: string;
    ip: string;
    status: 'success' | 'warning' | 'failed';
  }>;
  
  usageTimeline: {
    labels: string[];
    values: number[];
    avgDaily: number;
    peakDay: string;
    totalWeek: number;
  };
}
```

---

## 🔌 API ENDPOINTS

```typescript
// Get device detail
GET /api/admin/perangkat/:deviceId

// Block device
POST /api/admin/perangkat/:deviceId/block

// Whitelist device
POST /api/admin/perangkat/:deviceId/whitelist

// Get device activities
GET /api/admin/perangkat/:deviceId/activities?page=1&filter=all

// Export device data
GET /api/admin/perangkat/:deviceId/export?format=pdf|excel

// Get usage timeline
GET /api/admin/perangkat/:deviceId/timeline?period=7d|30d|3m

// Get security analysis
GET /api/admin/perangkat/:deviceId/security

// Get anomalies
GET /api/admin/perangkat/:deviceId/anomalies
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
```typescript
const breakpoints = {
  mobile: '< 768px',
  tablet: '768px - 1024px',
  desktop: '> 1024px',
};
```

### Mobile Layout
```tsx
// Stack all cards vertically
<div className="flex flex-col gap-6">
  <TopStatsCards /> {/* 2 columns */}
  <StudentInfoCard />
  <DeviceInfoCard />
  <UsageTimelineChart />
  <LocationMapCard />
  <SecurityAnalysisCard />
  <AnomalyDetectionCard />
  <ActivityHistoryTable />
</div>
```

### Tablet Layout
```tsx
// 2 column grid
<div className="grid grid-cols-2 gap-6">
  <div className="col-span-2">
    <TopStatsCards /> {/* 4 columns */}
  </div>
  <DeviceInfoCard />
  <StudentInfoCard />
  <UsageTimelineChart />
  <LocationMapCard />
  {/* ... */}
</div>
```

---

## 🎨 THEME CUSTOMIZATION

```typescript
const themes = {
  purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#60a5fa',
  },
  emerald: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
  },
};
```

---

## 🔒 SECURITY FEATURES

### 1. Device Fingerprinting
```typescript
const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  
  return {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    webglVendor: gl?.getParameter(gl.VENDOR),
    webglRenderer: gl?.getParameter(gl.RENDERER),
  };
};
```

### 2. Anomaly Detection Rules
```typescript
const anomalyRules = {
  multipleLocations: {
    threshold: 2, // locations in 1 hour
    severity: 'high',
  },
  unusualTime: {
    hours: [0, 1, 2, 3, 4, 5], // 00:00 - 05:00
    severity: 'medium',
  },
  frequentAccess: {
    threshold: 10, // scans per hour
    severity: 'medium',
  },
  deviceChange: {
    severity: 'high',
  },
};
```

---

## 📦 DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## 🚀 IMPLEMENTATION STEPS

### Phase 1: Setup & Layout (2-3 hours)
- [ ] Create page structure
- [ ] Setup routing
- [ ] Implement header section
- [ ] Create grid layout

### Phase 2: Core Components (4-5 hours)
- [ ] Build stats cards
- [ ] Implement device info card
- [ ] Create student info card
- [ ] Add usage timeline chart

### Phase 3: Advanced Features (3-4 hours)
- [ ] Implement location map
- [ ] Build security analysis
- [ ] Create anomaly detection
- [ ] Add activity history table

### Phase 4: Interactions & Polish (2-3 hours)
- [ ] Add animations
- [ ] Implement filters
- [ ] Add export functionality
- [ ] Optimize performance

### Phase 5: Testing & Refinement (2 hours)
- [ ] Test all features
- [ ] Fix bugs
- [ ] Optimize responsive design
- [ ] Final polish

**Total Estimated Time**: 13-17 hours

---

## 🎯 KEY FEATURES SUMMARY

✅ **Full Page Layout** - Dashboard admin style
✅ **Real-time Data** - Live updates dan monitoring
✅ **Interactive Charts** - Usage timeline visualization
✅ **Location Tracking** - GPS coordinates dan map view
✅ **Security Analysis** - Risk scoring dan threat detection
✅ **Anomaly Detection** - Suspicious activity alerts
✅ **Activity History** - Complete audit trail
✅ **Export Options** - PDF dan Excel export
✅ **Responsive Design** - Mobile, tablet, desktop
✅ **Smooth Animations** - Framer Motion powered
✅ **Dark Theme** - Consistent dengan dashboard admin
✅ **Purple Accent** - Sesuai dengan modal perangkat

---

## 💡 BEST PRACTICES

### Performance
- Use React.memo untuk components yang tidak sering berubah
- Implement virtual scrolling untuk activity table
- Lazy load charts dan maps
- Debounce filter inputs

### Security
- Sanitize all user inputs
- Implement rate limiting
- Log all admin actions
- Encrypt sensitive data

### UX
- Show loading states
- Provide clear feedback
- Use skeleton loaders
- Implement error boundaries

### Code Quality
- Use TypeScript untuk type safety
- Write unit tests
- Document complex logic
- Follow React best practices

---

## 🎨 FINAL NOTES

Halaman Detail Perangkat ini dirancang untuk memberikan:
- **Visibility** lengkap tentang perangkat mahasiswa
- **Security monitoring** yang comprehensive
- **User experience** yang smooth dan intuitive
- **Visual consistency** dengan dashboard admin
- **Actionable insights** untuk admin

Dengan implementasi yang tepat, halaman ini akan menjadi tool yang powerful untuk monitoring dan managing device access dalam sistem absensi! 🚀
