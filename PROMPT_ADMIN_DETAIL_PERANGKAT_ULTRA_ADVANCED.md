# 💻 PROMPT ULTRA ADVANCED: ADMIN DETAIL PERANGKAT
## Full Page Device Details dengan UI/UX Dashboard Admin Style

---

## 📋 OVERVIEW SISTEM

### Tujuan Halaman
Halaman **Detail Perangkat** adalah interface full-page yang menampilkan informasi lengkap tentang perangkat yang digunakan mahasiswa untuk absensi, dengan fitur:
- Informasi device lengkap (OS, Browser, Model, Specs)
- Timeline penggunaan perangkat
- Deteksi anomali dan suspicious activity
- Geolocation history dengan maps
- Session history dan analytics
- Device fingerprinting details
- Security risk assessment
- Remote actions (block, flag, monitor)

### Color Scheme (Purple/Violet Theme - Sesuai Modal)
```typescript
const deviceColors = {
  primary: {
    purple: '#8b5cf6',       // Violet 500
    purpleDark: '#7c3aed',   // Violet 600
    purpleLight: '#a78bfa',  // Violet 400
    purpleGlow: 'rgba(139, 92, 246, 0.3)',
  },
  gradients: {
    main: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    soft: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
    card: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
    header: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
  },
  backgrounds: {
    dark: '#0f172a',
    darker: '#020617',
    card: '#1e293b',
    cardHover: '#334155',
  },
  status: {
    safe: '#10b981',      // Green
    warning: '#f59e0b',   // Amber
    danger: '#ef4444',    // Red
    info: '#3b82f6',      // Blue
  }
}
```

---

## 🎨 LAYOUT STRUCTURE

### Full Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER BAR (Fixed Top - Purple Gradient)                   │
│  - Back Button                                              │
│  - Device Name & Icon                                       │
│  - Status Badge                                             │
│  - Action Buttons (Block, Flag, Monitor)                    │
└─────────────────────────────────────────────────────────────┘
│
├─ TOP SECTION (Grid 3 Columns)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ DEVICE INFO  │ │ STUDENT INFO │ │ RISK SCORE   │       │
│  │ - OS Icon    │ │ - Avatar     │ │ - Gauge      │       │
│  │ - Model      │ │ - Name       │ │ - Level      │       │
│  │ - Browser    │ │ - NIM        │ │ - Factors    │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│
├─ MAIN CONTENT (Tabbed Interface)                           │
│  ┌─────┬─────────┬──────────┬─────────┬──────────┐        │
│  │ 📊  │ 🗺️      │ 📜       │ 🔍      │ ⚙️       │        │
│  │ Info│ Location│ Sessions │ Anomaly │ Actions  │        │
│  └─────┴─────────┴──────────┴─────────┴──────────┘        │
│                                                             │
│  TAB CONTENT AREA                                          │
│  - Dynamic content based on active tab                     │
│  - Charts, maps, tables, timelines                         │
│  - Interactive components                                  │
│                                                             │
├─ TIMELINE SECTION (Bottom)                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  DEVICE USAGE TIMELINE                                │ │
│  │  - Horizontal scrollable timeline                     │ │
│  │  - Events markers                                     │ │
│  │  - Anomaly highlights                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│
└─ FOOTER BAR (Fixed Bottom)                                 │
   - Last Activity                                           │
   - Total Sessions                                          │
   - Export Options                                          │
```

---

## 🎯 COMPONENT DETAILS

### 1. HEADER BAR COMPONENT

```tsx
interface DeviceHeaderProps {
  device: {
    id: string;
    name: string;
    model: string;
    os: string;
    status: 'safe' | 'warning' | 'danger';
    isBlocked: boolean;
    isFlagged: boolean;
    isMonitored: boolean;
  };
  onBack: () => void;
  onBlock: () => void;
  onFlag: () => void;
  onMonitor: () => void;
}

const DeviceHeader: React.FC<DeviceHeaderProps> = ({ device, ...actions }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-20 z-50 
      bg-gradient-to-r from-violet-600 to-violet-400
      border-b border-violet-500/30 shadow-lg shadow-violet-500/20">
      
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
        {/* Left: Back & Device Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={actions.onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            {/* Device Icon */}
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            
            {/* Device Name & Model */}
            <div>
              <h1 className="text-xl font-bold text-white">
                {device.name}
              </h1>
              <p className="text-sm text-violet-100">
                {device.model}
              </p>
            </div>
            
            {/* Status Badge */}
            <StatusBadge status={device.status} />
          </div>
        </div>
        
        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Block Button */}
          <button
            onClick={actions.onBlock}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-300
              ${device.isBlocked
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>{device.isBlocked ? 'Unblock' : 'Block'}</span>
            </div>
          </button>
          
          {/* Flag Button */}
          <button
            onClick={actions.onFlag}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-300
              ${device.isFlagged
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              <span>{device.isFlagged ? 'Unflag' : 'Flag'}</span>
            </div>
          </button>
          
          {/* Monitor Button */}
          <button
            onClick={actions.onMonitor}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-300
              ${device.isMonitored
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{device.isMonitored ? 'Stop Monitor' : 'Monitor'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 2. TOP SECTION - INFO CARDS

```tsx
<div className="grid grid-cols-3 gap-6 mt-24 mb-6">
  {/* Device Info Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6 hover:border-violet-500/50 
      transition-all duration-300"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-violet-500/10 rounded-xl">
        <Laptop className="w-6 h-6 text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">Device Info</h3>
    </div>
    
    <div className="space-y-3">
      {/* OS */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Operating System</span>
        <div className="flex items-center gap-2">
          <img src="/assets/os-icon.png" className="w-5 h-5" />
          <span className="text-sm font-medium text-white">macOS</span>
        </div>
      </div>
      
      {/* Browser */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Browser</span>
        <div className="flex items-center gap-2">
          <Chrome className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-white">Chrome 120</span>
        </div>
      </div>
      
      {/* Model */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Model</span>
        <span className="text-sm font-medium text-white">MacBook Pro</span>
      </div>
      
      {/* Screen Resolution */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Resolution</span>
        <span className="text-sm font-medium text-white">1920x1080</span>
      </div>
    </div>
  </motion.div>
  
  {/* Student Info Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6 hover:border-violet-500/50 
      transition-all duration-300"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-blue-500/10 rounded-xl">
        <User className="w-6 h-6 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">Student Info</h3>
    </div>
    
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full overflow-hidden 
          border-2 border-violet-500/50">
          <img src="/avatar.jpg" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 
          bg-emerald-500 rounded-full border-2 border-slate-800" />
      </div>
      
      {/* Info */}
      <div className="flex-1">
        <h4 className="text-base font-semibold text-white">
          SALSA NABILA
        </h4>
        <p className="text-sm text-slate-400 font-mono">
          2310140432
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 
            text-xs rounded-md">
            Aktif
          </span>
          <span className="text-xs text-slate-500">
            Semester 4
          </span>
        </div>
      </div>
    </div>
  </motion.div>
  
  {/* Risk Score Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6 hover:border-violet-500/50 
      transition-all duration-300"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-amber-500/10 rounded-xl">
        <AlertTriangle className="w-6 h-6 text-amber-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">Risk Score</h3>
    </div>
    
    {/* Circular Progress */}
    <div className="flex items-center justify-center mb-4">
      <CircularProgress value={25} max={100} color="emerald" />
    </div>
    
    {/* Risk Factors */}
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">GPS Spoofing</span>
        <span className="text-emerald-400">Low</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Device Change</span>
        <span className="text-amber-400">Medium</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Suspicious Pattern</span>
        <span className="text-emerald-400">Low</span>
      </div>
    </div>
  </motion.div>
</div>
```

---

### 3. TABBED INTERFACE

```tsx
const tabs = [
  { id: 'info', label: 'Device Info', icon: Info, color: 'violet' },
  { id: 'location', label: 'Location', icon: MapPin, color: 'blue' },
  { id: 'sessions', label: 'Sessions', icon: Clock, color: 'emerald' },
  { id: 'anomaly', label: 'Anomaly', icon: AlertTriangle, color: 'amber' },
  { id: 'actions', label: 'Actions', icon: Settings, color: 'red' },
];

<div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
  {/* Tab Navigation */}
  <div className="flex border-b border-slate-700">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            relative flex-1 flex items-center justify-center gap-2 
            px-6 py-4 font-medium transition-all duration-300
            ${isActive 
              ? `text-${tab.color}-400 bg-${tab.color}-500/10` 
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            }
          `}
        >
          <Icon className="w-5 h-5" />
          <span>{tab.label}</span>
          
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className={`absolute bottom-0 left-0 right-0 h-0.5 
                bg-${tab.color}-400`}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      );
    })}
  </div>
  
  {/* Tab Content */}
  <div className="p-6">
    <AnimatePresence mode="wait">
      {activeTab === 'info' && <DeviceInfoTab />}
      {activeTab === 'location' && <LocationTab />}
      {activeTab === 'sessions' && <SessionsTab />}
      {activeTab === 'anomaly' && <AnomalyTab />}
      {activeTab === 'actions' && <ActionsTab />}
    </AnimatePresence>
  </div>
</div>
```

---

## 📊 TAB CONTENT DETAILS

### TAB 1: DEVICE INFO

```tsx
const DeviceInfoTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Technical Specifications */}
      <div className="grid grid-cols-2 gap-6">
        {/* Hardware Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Hardware Information
          </h4>
          
          <div className="space-y-3">
            <InfoRow label="Processor" value="Apple M1 Pro" icon={Cpu} />
            <InfoRow label="RAM" value="16 GB" icon={HardDrive} />
            <InfoRow label="Storage" value="512 GB SSD" icon={Database} />
            <InfoRow label="GPU" value="Apple M1 Pro GPU" icon={Zap} />
          </div>
        </div>
        
        {/* Software Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Software Information
          </h4>
          
          <div className="space-y-3">
            <InfoRow label="OS Version" value="macOS 13.5.7" icon={Monitor} />
            <InfoRow label="Browser" value="Chrome 120.0.6099" icon={Globe} />
            <InfoRow label="User Agent" value="Mozilla/5.0..." icon={Code} />
            <InfoRow label="Language" value="en-US" icon={Languages} />
          </div>
        </div>
      </div>
      
      {/* Device Fingerprint */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">
          Device Fingerprint
        </h4>
        
        <div className="font-mono text-xs text-slate-400 bg-slate-950 
          rounded-lg p-4 overflow-x-auto">
          <code>
            {JSON.stringify({
              canvas: "a7f3d0e8b2c1...",
              webgl: "3d4e5f6a7b8c...",
              audio: "9e8d7c6b5a4f...",
              fonts: ["Arial", "Helvetica", "..."],
              plugins: ["Chrome PDF Plugin", "..."],
            }, null, 2)}
          </code>
        </div>
      </div>
    </motion.div>
  );
};
```

---

### TAB 2: LOCATION

```tsx
const LocationTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Map */}
      <div className="h-96 bg-slate-900 rounded-xl overflow-hidden 
        border border-slate-700">
        <InteractiveMap
          locations={locationHistory}
          center={lastLocation}
          zoom={15}
        />
      </div>
      
      {/* Location History */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-300">
          Location History
        </h4>
        
        {locationHistory.map((location, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-slate-900/50 
              border border-slate-700 rounded-xl hover:border-violet-500/50 
              transition-all"
          >
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">
                  {location.address}
                </span>
                <span className="text-xs text-slate-500">
                  {location.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Lat: {location.lat}</span>
                <span>Lng: {location.lng}</span>
                <span>Accuracy: {location.accuracy}m</span>
              </div>
            </div>
            
            {location.isSuspicious && (
              <div className="px-2 py-1 bg-red-500/10 text-red-400 
                text-xs rounded-md">
                Suspicious
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
```

---

## 🎬 ANIMATIONS & EFFECTS

### Page Load Animation
```tsx
const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, scale: 0.95 }
};
```

### Card Hover Effect
```tsx
const cardHoverEffect = {
  rest: { scale: 1, borderColor: 'rgba(100, 116, 139, 0.5)' },
  hover: { 
    scale: 1.02, 
    borderColor: 'rgba(139, 92, 246, 0.5)',
    transition: { duration: 0.3 }
  }
};
```

---

## 📦 DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0",
    "react-map-gl": "^7.1.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0"
  }
}
```

---

## 🚀 USAGE EXAMPLE

```tsx
import DeviceDetailPage from '@/pages/admin/device-detail';

// In router
<Route 
  path="/admin/perangkat/:deviceId" 
  element={<DeviceDetailPage />} 
/>
```

---

## ✅ FEATURES CHECKLIST

- [ ] Header dengan action buttons
- [ ] Top info cards (Device, Student, Risk)
- [ ] Tabbed interface (5 tabs)
- [ ] Device info dengan fingerprint
- [ ] Interactive map dengan location history
- [ ] Session history dengan timeline
- [ ] Anomaly detection display
- [ ] Remote actions panel
- [ ] Real-time updates
- [ ] Export functionality

Halaman ini akan memberikan kontrol penuh kepada admin untuk monitoring dan managing device mahasiswa! 💻✨


### TAB 3: SESSIONS

```tsx
const SessionsTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Session Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Sessions"
          value="127"
          icon={Activity}
          color="violet"
          trend="+12%"
        />
        <StatCard
          label="Avg Duration"
          value="45m"
          icon={Clock}
          color="blue"
          trend="+5%"
        />
        <StatCard
          label="Success Rate"
          value="98.4%"
          icon={CheckCircle}
          color="emerald"
          trend="+2%"
        />
        <StatCard
          label="Anomalies"
          value="3"
          icon={AlertTriangle}
          color="amber"
          trend="-1"
        />
      </div>
      
      {/* Session Timeline */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">
          Session Timeline
        </h4>
        
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="relative pl-8 pb-4 border-l-2 border-slate-700 
                last:border-l-0 last:pb-0"
            >
              {/* Timeline Dot */}
              <div className={`
                absolute left-0 top-0 -translate-x-[9px] w-4 h-4 
                rounded-full border-2 border-slate-800
                ${session.status === 'success' 
                  ? 'bg-emerald-500' 
                  : session.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
                }
              `} />
              
              {/* Session Card */}
              <div className="bg-slate-800/50 border border-slate-700 
                rounded-lg p-4 hover:border-violet-500/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    {session.activity}
                  </span>
                  <span className="text-xs text-slate-500">
                    {session.timestamp}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Duration: {session.duration}</span>
                  <span>IP: {session.ip}</span>
                  <span>Location: {session.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Session Chart */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">
          Session Activity (Last 30 Days)
        </h4>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sessionChartData}>
            <defs>
              <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="sessions" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#sessionGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
```

---

### TAB 4: ANOMALY DETECTION

```tsx
const AnomalyTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Anomaly Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 
          border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-slate-400">Critical</span>
          </div>
          <div className="text-3xl font-bold text-red-400">2</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 
          border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-slate-400">Warning</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">5</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 
          border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Info className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-slate-400">Info</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">12</div>
        </div>
      </div>
      
      {/* Anomaly List */}
      <div className="space-y-3">
        {anomalies.map((anomaly, index) => (
          <div
            key={index}
            className={`
              p-4 rounded-xl border-2 transition-all duration-300
              hover:scale-[1.02] cursor-pointer
              ${anomaly.severity === 'critical'
                ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                : anomaly.severity === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                : 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
              }
            `}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`
                p-3 rounded-lg
                ${anomaly.severity === 'critical'
                  ? 'bg-red-500/20'
                  : anomaly.severity === 'warning'
                  ? 'bg-amber-500/20'
                  : 'bg-blue-500/20'
                }
              `}>
                {anomaly.type === 'gps' && <MapPin className="w-5 h-5" />}
                {anomaly.type === 'device' && <Smartphone className="w-5 h-5" />}
                {anomaly.type === 'pattern' && <TrendingUp className="w-5 h-5" />}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">
                    {anomaly.title}
                  </h5>
                  <span className="text-xs text-slate-500">
                    {anomaly.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 mb-3">
                  {anomaly.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <span className={`
                    px-2 py-1 text-xs rounded-md font-medium
                    ${anomaly.severity === 'critical'
                      ? 'bg-red-500/20 text-red-400'
                      : anomaly.severity === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                    }
                  `}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                  
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 
                    text-xs rounded-md">
                    {anomaly.type}
                  </span>
                  
                  {anomaly.resolved && (
                    <span className="px-2 py-1 bg-emerald-500/20 
                      text-emerald-400 text-xs rounded-md">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Eye className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
```

---

### TAB 5: ACTIONS

```tsx
const ActionsTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Block Device */}
        <button className="group p-6 bg-gradient-to-br from-red-500/10 
          to-red-600/5 border-2 border-red-500/20 hover:border-red-500/50 
          rounded-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-500/20 rounded-xl 
              group-hover:bg-red-500/30 transition-colors">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-1">
                Block Device
              </h4>
              <p className="text-sm text-slate-400">
                Prevent this device from accessing the system
              </p>
            </div>
          </div>
        </button>
        
        {/* Flag for Review */}
        <button className="group p-6 bg-gradient-to-br from-amber-500/10 
          to-amber-600/5 border-2 border-amber-500/20 hover:border-amber-500/50 
          rounded-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-amber-500/20 rounded-xl 
              group-hover:bg-amber-500/30 transition-colors">
              <Flag className="w-8 h-8 text-amber-400" />
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-1">
                Flag for Review
              </h4>
              <p className="text-sm text-slate-400">
                Mark this device for manual review
              </p>
            </div>
          </div>
        </button>
        
        {/* Enable Monitoring */}
        <button className="group p-6 bg-gradient-to-br from-blue-500/10 
          to-blue-600/5 border-2 border-blue-500/20 hover:border-blue-500/50 
          rounded-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500/20 rounded-xl 
              group-hover:bg-blue-500/30 transition-colors">
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-1">
                Enable Monitoring
              </h4>
              <p className="text-sm text-slate-400">
                Track all activities from this device
              </p>
            </div>
          </div>
        </button>
        
        {/* Send Notification */}
        <button className="group p-6 bg-gradient-to-br from-violet-500/10 
          to-violet-600/5 border-2 border-violet-500/20 hover:border-violet-500/50 
          rounded-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-violet-500/20 rounded-xl 
              group-hover:bg-violet-500/30 transition-colors">
              <Bell className="w-8 h-8 text-violet-400" />
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-1">
                Send Notification
              </h4>
              <p className="text-sm text-slate-400">
                Send alert to device owner
              </p>
            </div>
          </div>
        </button>
      </div>
      
      {/* Advanced Actions */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">
          Advanced Actions
        </h4>
        
        <div className="space-y-3">
          <ActionButton
            icon={Download}
            label="Export Device Data"
            description="Download complete device information"
            onClick={() => {}}
          />
          
          <ActionButton
            icon={RefreshCw}
            label="Force Refresh"
            description="Request device to update information"
            onClick={() => {}}
          />
          
          <ActionButton
            icon={Trash2}
            label="Delete Device Record"
            description="Permanently remove this device from system"
            onClick={() => {}}
            danger
          />
        </div>
      </div>
      
      {/* Action History */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">
          Action History
        </h4>
        
        <div className="space-y-2">
          {actionHistory.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 
                bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <History className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {action.action}
                  </div>
                  <div className="text-xs text-slate-500">
                    by {action.admin} • {action.timestamp}
                  </div>
                </div>
              </div>
              
              <span className={`
                px-2 py-1 text-xs rounded-md
                ${action.status === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
                }
              `}>
                {action.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
```

---

## 🎨 ADDITIONAL COMPONENTS

### Circular Progress Component
```tsx
interface CircularProgressProps {
  value: number;
  max: number;
  color: 'emerald' | 'amber' | 'red';
  size?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  color,
  size = 120
}) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorMap = {
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444'
  };
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          stroke="#334155"
          strokeWidth="8"
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          stroke={colorMap[color]}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">
          {value}
        </span>
        <span className="text-xs text-slate-400">
          Risk Score
        </span>
      </div>
    </div>
  );
};
```

### Interactive Map Component
```tsx
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface InteractiveMapProps {
  locations: Location[];
  center: { lat: number; lng: number };
  zoom: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  center,
  zoom
}) => {
  return (
    <Map
      initialViewState={{
        latitude: center.lat,
        longitude: center.lng,
        zoom: zoom
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={process.env.MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />
      
      {locations.map((location, index) => (
        <Marker
          key={index}
          latitude={location.lat}
          longitude={location.lng}
        >
          <div className={`
            w-4 h-4 rounded-full border-2 border-white
            ${location.isSuspicious ? 'bg-red-500' : 'bg-emerald-500'}
          `} />
        </Marker>
      ))}
    </Map>
  );
};
```

---

## 🔔 REAL-TIME UPDATES

### WebSocket Integration
```typescript
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export const useDeviceRealtime = (deviceId: string) => {
  useEffect(() => {
    const socket = io(process.env.WEBSOCKET_URL);
    
    socket.emit('subscribe:device', deviceId);
    
    socket.on('device:update', (data) => {
      // Update device info
      console.log('Device updated:', data);
    });
    
    socket.on('device:session', (data) => {
      // New session detected
      console.log('New session:', data);
    });
    
    socket.on('device:anomaly', (data) => {
      // Anomaly detected
      console.log('Anomaly detected:', data);
    });
    
    return () => {
      socket.emit('unsubscribe:device', deviceId);
      socket.disconnect();
    };
  }, [deviceId]);
};
```

---

## 📤 EXPORT FUNCTIONALITY

```typescript
const exportDeviceData = async (deviceId: string, format: 'pdf' | 'excel' | 'json') => {
  try {
    const response = await fetch(`/api/admin/devices/${deviceId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format })
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-${deviceId}.${format}`;
    a.click();
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

---

## 🎯 API ENDPOINTS

```typescript
// Get device details
GET /api/admin/devices/:id

// Update device status
PUT /api/admin/devices/:id/status

// Block device
POST /api/admin/devices/:id/block

// Flag device
POST /api/admin/devices/:id/flag

// Get sessions
GET /api/admin/devices/:id/sessions

// Get anomalies
GET /api/admin/devices/:id/anomalies

// Export data
POST /api/admin/devices/:id/export
```

---

## 🎨 RESPONSIVE DESIGN

```typescript
const breakpoints = {
  mobile: '< 768px',
  tablet: '768px - 1024px',
  desktop: '> 1024px'
};

// Mobile: Stack layout, simplified tabs
// Tablet: 2-column grid, full tabs
// Desktop: 3-column grid, all features
```

---

## ✅ FINAL CHECKLIST

- [ ] Header dengan action buttons
- [ ] Top info cards responsive
- [ ] 5 tabs dengan smooth transitions
- [ ] Device fingerprint display
- [ ] Interactive map integration
- [ ] Session timeline dengan chart
- [ ] Anomaly detection UI
- [ ] Quick actions panel
- [ ] Real-time WebSocket updates
- [ ] Export functionality
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility (ARIA labels)

Halaman Detail Perangkat ini memberikan kontrol penuh dan visibility lengkap untuk admin dalam monitoring device mahasiswa! 💻🔒✨
