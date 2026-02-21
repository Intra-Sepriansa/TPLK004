# PROMPT: ADMIN LIVE MONITOR DASHBOARD - ULTRA ADVANCED

## TUJUAN
Membuat halaman Live Monitor Dashboard untuk Admin (`resources/js/pages/admin/live-monitor.tsx`) dengan UI/UX yang SANGAT SANGAT ADVANCE dan COMPREHENSIVE. Halaman ini adalah dashboard utama untuk monitoring real-time dengan overview lengkap, quick preview aktivitas terbaru, dan navigasi ke halaman detail.

**Route:** `/admin/live-monitor`

**PENTING:** Halaman ini adalah DASHBOARD UTAMA yang menampilkan:
- Real-time overview statistics
- Quick preview aktivitas terbaru (5-10 terakhir)
- Active sessions monitoring
- Anomaly alerts
- Quick actions
- Navigation ke halaman detail aktivitas terbaru

---

## UI/UX REFERENCE - WAJIB IKUTI 100%

### Warna & Gradient (EXACT dari Kas Admin)
```tsx
// Header Background - INDIGO-PURPLE-PINK
bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500

// Animated Background
animate={{
  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
}}
transition={{
  duration: 15,
  repeat: Infinity,
  ease: "linear"
}}
style={{
  backgroundSize: '200% 200%',
}}

// Container Cards - Glassmorphism
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl

// Quick Preview Cards (seperti screenshot)
rounded-2xl bg-neutral-900 dark:bg-neutral-800 p-4 border border-neutral-700
```

### Animation Variants
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
} as const;
```

---

## STRUKTUR HALAMAN

### 1. HEADER SECTION

```tsx
<motion.div
  variants={itemVariants}
  className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
>
  {/* Animated Gradient Background */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
    animate={{
      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
    }}
    transition={{
      duration: 15,
      repeat: Infinity,
      ease: "linear"
    }}
    style={{
      backgroundSize: '200% 200%',
    }}
  />

  {/* Blur Orbs & Rings */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
  
  <motion.div
    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
  />

  <div className="relative">
    <div className="flex items-center justify-between flex-wrap gap-6">
      <div className="flex items-center gap-5">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <Radio className="h-8 w-8 text-white" />
        </motion.div>
        <div>
          <p className="text-sm text-indigo-100 font-medium tracking-wide">Real-time Monitoring</p>
          <h1 className="text-3xl font-bold text-white">Live Monitor</h1>
          <p className="mt-1 text-indigo-100 max-w-lg">
            Dashboard monitoring aktivitas absensi secara real-time
          </p>
        </div>
      </div>

      {/* Live Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, y: -3 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-xl border border-white/30">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-3 w-3 rounded-full bg-green-400"
          />
          <div>
            <p className="text-xs text-gray-200 font-medium">Status</p>
            <p className="text-xl font-black">LIVE</p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</motion.div>
```

### 2. REAL-TIME STATS (6 Cards)

```tsx
<motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {[
    { 
      icon: Radio, 
      label: 'Sesi Aktif', 
      value: stats.activeSessions, 
      color: 'from-blue-400 to-cyan-600',
      subtitle: 'sesi berlangsung',
      trend: '+2 dari 1 jam lalu'
    },
    { 
      icon: Scan, 
      label: 'Scan Hari Ini', 
      value: stats.totalScans,
      color: 'from-emerald-400 to-teal-600',
      subtitle: 'total scan',
      trend: `${stats.scanRate}% dari target`
    },
    { 
      icon: Users, 
      label: 'Mahasiswa Aktif', 
      value: stats.activeStudents,
      color: 'from-purple-400 to-pink-600',
      subtitle: 'sedang absen',
      trend: 'Live'
    },
    { 
      icon: CheckCircle, 
      label: 'Hadir', 
      value: stats.present,
      color: 'from-green-400 to-emerald-600',
      subtitle: 'mahasiswa hadir',
      trend: `${stats.presentRate}%`
    },
    { 
      icon: Clock, 
      label: 'Terlambat', 
      value: stats.late,
      color: 'from-yellow-400 to-amber-600',
      subtitle: 'mahasiswa terlambat',
      trend: `${stats.lateRate}%`
    },
    { 
      icon: AlertTriangle, 
      label: 'Anomali', 
      value: stats.anomaly,
      color: 'from-red-400 to-orange-600',
      subtitle: 'perlu review',
      trend: stats.anomaly > 0 ? 'Perhatian!' : 'Aman'
    },
  ].map((stat) => (
    <motion.div
      key={stat.label}
      variants={cardVariants}
      whileHover="hover"
      className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl cursor-pointer"
    >
      <div className="relative flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', stat.color)}
        >
          <stat.icon className="h-7 w-7" />
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase">{stat.label}</p>
          <div className="mt-1">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              <AnimatedCounter value={stat.value} duration={1200} />
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">{stat.subtitle}</p>
        </div>
      </div>
    </motion.div>
  ))}
</motion.div>
```

### 3. MAIN CONTENT (2-Column Layout)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* LEFT: Aktivitas Terbaru Quick Preview (70%) */}
  <div className="lg:col-span-2 space-y-6">

    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-3 w-3 rounded-full bg-green-500"
          />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Aktivitas Terbaru
          </h3>
          <Badge variant="success" className="animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            {recentActivities.length}
          </Badge>
        </div>
        
        {/* Link to Detail Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.visit('/admin/aktivitas-terbaru')}
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950"
        >
          Lihat Semua
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Recent Activities List (Last 5) */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
        <AnimatePresence>
          {recentActivities.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              onClick={() => openActivityDetail(activity)}
              className={cn(
                "rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 backdrop-blur-xl cursor-pointer transition-all",
                "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg",
                activity.isNew && "ring-2 ring-green-400 animate-pulse"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0",
                    activity.status === 'hadir' && "bg-gradient-to-br from-green-400 to-emerald-600",
                    activity.status === 'terlambat' && "bg-gradient-to-br from-yellow-400 to-amber-600",
                    activity.status === 'izin' && "bg-gradient-to-br from-blue-400 to-cyan-600",
                    activity.status === 'anomali' && "bg-gradient-to-br from-red-400 to-rose-600 animate-pulse"
                  )}
                >
                  {activity.status === 'hadir' && <CheckCircle className="h-5 w-5 text-white" />}
                  {activity.status === 'terlambat' && <Clock className="h-5 w-5 text-white" />}
                  {activity.status === 'izin' && <Info className="h-5 w-5 text-white" />}
                  {activity.status === 'anomali' && <AlertTriangle className="h-5 w-5 text-white" />}
                </motion.div>
                
                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                    {activity.student_name}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                    {activity.nim} • {activity.session_name}
                  </p>
                </div>
                
                {/* Time & Status */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {activity.time}
                  </p>
                  <Badge
                    variant={
                      activity.status === 'hadir' ? 'success' :
                      activity.status === 'terlambat' ? 'warning' :
                      activity.status === 'izin' ? 'default' :
                      'destructive'
                    }
                    className="text-xs mt-1"
                  >
                    {activity.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {/* Quick Info */}
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{activity.distance}m</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                  <Smartphone className="h-3 w-3" />
                  <span className="truncate">{activity.device}</span>
                </div>
              </div>
              
              {/* New Activity Indicator */}
              {activity.isNew && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge className="bg-green-500 text-white animate-bounce text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Baru
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {recentActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Activity className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">Belum ada aktivitas</p>
            <p className="text-sm text-neutral-400 mt-2">
              Aktivitas akan muncul secara real-time
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  </div>

  {/* RIGHT COLUMN: Analytics & Insights (3 cols) */}
  <div className="lg:col-span-3 space-y-6">
    {/* Today's Summary */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Ringkasan Hari Ini</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Hadir</span>
          <span className="font-bold text-green-600">{todayStats.hadir}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Terlambat</span>
          <span className="font-bold text-yellow-600">{todayStats.terlambat}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Izin</span>
          <span className="font-bold text-blue-600">{todayStats.izin}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Anomali</span>
          <span className="font-bold text-red-600">{todayStats.anomali}</span>
        </div>
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-900 dark:text-white">Tingkat Kehadiran</span>
            <span className="font-bold text-lg text-indigo-600">
              {((todayStats.hadir / (todayStats.hadir + todayStats.terlambat + todayStats.izin)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Quick Actions */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Quick Actions</h3>
      <div className="space-y-2">
        <Button className="w-full justify-start" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Pengaturan Alert
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Pengaturan Monitor
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </motion.div>

    {/* System Status */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">System Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">WebSocket</span>
          <Badge variant="success">Connected</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Database</span>
          <Badge variant="success">Online</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">GPS Service</span>
          <Badge variant="success">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Last Update</span>
          <span className="text-xs text-neutral-500">2 detik lalu</span>
        </div>
      </div>
    </motion.div>
  </div>
</div>
```

---

## ACTIVITY DETAIL MODAL (ULTRA ADVANCED)

**PENTING:** Modal ini muncul ketika user klik activity card di section "Aktivitas Terbaru". Modal ini harus SANGAT DETAIL dan INFORMATIF seperti screenshot yang diberikan.

```tsx
<Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
  <DialogContent className="max-w-2xl bg-neutral-900 text-white border-neutral-800">
    {selectedActivity && (
      <div className="space-y-6">
        {/* Header dengan Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status Icon dengan Warning/Alert */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: selectedActivity.status === 'anomali' ? Infinity : 0 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl"
            >
              {selectedActivity.status === 'anomali' ? (
                <AlertTriangle className="h-8 w-8 text-red-400" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-400" />
              )}
            </motion.div>
            
            <div>
              <h2 className="text-2xl font-bold">{selectedActivity.student_name}</h2>
              <p className="text-neutral-400">{selectedActivity.nim}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedActivity(null)}
            className="text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge
            variant={
              selectedActivity.status === 'hadir' ? 'success' :
              selectedActivity.status === 'terlambat' ? 'warning' :
              selectedActivity.status === 'izin' ? 'default' :
              'destructive'
            }
            className="text-lg px-6 py-2"
          >
            {selectedActivity.status.toUpperCase()}
          </Badge>
        </div>

        {/* Detail Cards */}
        <div className="space-y-3">
          {/* Waktu Scan */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-neutral-800/50 backdrop-blur-xl p-4 border border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-400 uppercase tracking-wider">Waktu Scan</p>
                <p className="text-2xl font-bold">{selectedActivity.time}</p>
              </div>
            </div>
          </motion.div>

          {/* Mata Kuliah */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-neutral-800/50 backdrop-blur-xl p-4 border border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-400 uppercase tracking-wider">Mata Kuliah</p>
                <p className="text-xl font-bold">{selectedActivity.course}</p>
              </div>
            </div>
          </motion.div>

          {/* Lokasi / Jarak */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-neutral-800/50 backdrop-blur-xl p-4 border border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <MapPin className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-400 uppercase tracking-wider">Lokasi / Jarak</p>
                <p className="text-xl font-bold">{selectedActivity.distance} meter</p>
                <p className="text-sm text-neutral-500">dari pusat</p>
              </div>
            </div>
          </motion.div>

          {/* Perangkat */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-neutral-800/50 backdrop-blur-xl p-4 border border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                <Smartphone className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-400 uppercase tracking-wider">Perangkat</p>
                <p className="text-xl font-bold">{selectedActivity.device || 'Unknown Device'}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info (if anomaly) */}
        {selectedActivity.status === 'anomali' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-400 mb-1">Anomali Terdeteksi</h4>
                <p className="text-sm text-neutral-300">
                  {selectedActivity.anomaly_reason || 'Jarak terlalu jauh dari lokasi yang ditentukan'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <Button
          className="w-full bg-white text-neutral-900 hover:bg-neutral-100 font-bold py-6 text-lg"
          onClick={() => {
            setSelectedActivity(null);
            router.visit('/admin/aktivitas-terbaru');
          }}
        >
          Tutup Detail
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>
```

---

## FITUR ULTRA ADVANCED

### 1. Real-time Updates dengan WebSocket

```tsx
useEffect(() => {
  const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
  });

  const channel = pusher.subscribe('live-monitor');

  // New scan event
  channel.bind('new-scan', (data: Activity) => {
    setRecentActivities(prev => [{ ...data, isNew: true }, ...prev].slice(0, 10));
    
    if (soundEnabled) {
      playNotificationSound();
    }
    
    toast.success(`${data.student_name} telah melakukan absensi`);
    
    updateStats();
    
    setTimeout(() => {
      setRecentActivities(prev =>
        prev.map(a => a.id === data.id ? { ...a, isNew: false } : a)
      );
    }, 5000);
  });

  // Session update event
  channel.bind('session-updated', (data: Session) => {
    setActiveSessions(prev =>
      prev.map(s => s.id === data.id ? data : s)
    );
  });

  // Anomaly event
  channel.bind('anomaly-detected', (data: Anomaly) => {
    if (soundEnabled) {
      playAlertSound();
    }
    
    toast.error(`Anomali terdeteksi: ${data.message}`);
  });

  return () => {
    channel.unbind_all();
    channel.unsubscribe();
    pusher.disconnect();
  };
}, [soundEnabled]);
```

### 2. Sound Notifications

```tsx
const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.error('Audio play failed:', err));
};

const playAlertSound = () => {
  const audio = new Audio('/sounds/alert.mp3');
  audio.volume = 0.8;
  audio.play().catch(err => console.error('Audio play failed:', err));
};
```

### 3. Auto Refresh Data

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    refreshData();
  }, 30000); // Refresh every 30 seconds

  return () => clearInterval(interval);
}, []);

const refreshData = async () => {
  try {
    const response = await fetch('/api/admin/live-monitor/refresh');
    const data = await response.json();
    
    setStats(data.stats);
    setActiveSessions(data.activeSessions);
    setTodayStats(data.todayStats);
    
    toast.success('Data berhasil diperbarui');
  } catch (error) {
    toast.error('Gagal memperbarui data');
  }
};
```

---

## TECHNICAL REQUIREMENTS

### Imports
```tsx
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Users, CheckCircle, Clock, AlertTriangle, TrendingUp,
  Activity, MapPin, Smartphone, Eye, BarChart3, ChevronRight,
  Download, Bell, Settings, FileText, Volume2, VolumeX,
  RefreshCw, GraduationCap, User, Info, Sparkles, BookOpen, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Pusher from 'pusher-js';
```

### State Management
```tsx
const [stats, setStats] = useState({
  activeSessions: 0,
  onlineStudents: 0,
  presentToday: 0,
  lateToday: 0,
  anomalies: 0,
  attendanceRate: 0,
});
const [todayStats, setTodayStats] = useState({
  hadir: 0,
  terlambat: 0,
  izin: 0,
  anomali: 0,
});
const [activeSessions, setActiveSessions] = useState<Session[]>([]);
const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
const [soundEnabled, setSoundEnabled] = useState(true);
```

---

## KESIMPULAN

Halaman Live Monitor Dashboard ini adalah dashboard monitoring utama yang SANGAT COMPREHENSIVE dengan:

1. **Real-time Monitoring** - WebSocket integration untuk live updates
2. **6 Stat Cards** - Overview lengkap dengan animated counters
3. **3-Column Layout** - Sesi Aktif, Aktivitas Terbaru, Analytics
4. **Activity Detail Modal** - Modal yang SANGAT DETAIL seperti screenshot (dark theme, 4 info cards)
5. **Sound Notifications** - Audio alerts yang dapat di-toggle
6. **Auto Refresh** - Data refresh otomatis setiap 30 detik
7. **Quick Actions** - Export, settings, reports
8. **System Status** - Monitor status sistem real-time
9. **Link to Detail Page** - Button "Lihat Semua" ke halaman aktivitas-terbaru
10. **Mobile Responsive** - Full responsive design

**FITUR MODAL DETAIL (MATCHING SCREENSHOT):**
- Dark theme dengan bg-neutral-900
- Student name + NIM di header
- Status badge besar di tengah (PRESENT/LATE/etc)
- 4 Info cards dengan icons:
  * Waktu Scan (Clock icon, blue)
  * Mata Kuliah (BookOpen icon, purple)
  * Lokasi/Jarak (MapPin icon, green)
  * Perangkat (Smartphone icon, amber)
- Anomaly alert (jika ada)
- Button "Tutup Detail" di bawah

Selamat mengimplementasikan! 🚀

    {/* AKTIVITAS TERBARU SECTION */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-3 w-3 rounded-full bg-green-500"
          />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Aktivitas Terbaru
          </h2>
          <Badge variant="success" className="animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
        
        <Button
          onClick={() => router.visit('/admin/aktivitas-terbaru')}
          variant="outline"
          className="group"
        >
          Lihat Semua
          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* QUICK PREVIEW CARDS (seperti screenshot - Dark Theme) */}
      <div className="space-y-3">
        <AnimatePresence>
          {recentActivities.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              onClick={() => setSelectedActivity(activity)}
              className={cn(
                "rounded-2xl p-4 cursor-pointer transition-all",
                "bg-neutral-900 dark:bg-neutral-800 border border-neutral-700",
                "hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20",
                activity.isNew && "ring-2 ring-green-400 animate-pulse"
              )}
            >
              <div className="flex items-center justify-between">
                {/* Left: Student Info */}
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center shadow-lg",
                      activity.status === 'hadir' && "bg-gradient-to-br from-green-400 to-emerald-600",
                      activity.status === 'terlambat' && "bg-gradient-to-br from-yellow-400 to-amber-600",
                      activity.status === 'izin' && "bg-gradient-to-br from-blue-400 to-cyan-600",
                      activity.status === 'anomali' && "bg-gradient-to-br from-red-400 to-rose-600 animate-pulse"
                    )}
                  >
                    {activity.status === 'hadir' && <CheckCircle className="h-6 w-6 text-white" />}
                    {activity.status === 'terlambat' && <Clock className="h-6 w-6 text-white" />}
                    {activity.status === 'izin' && <Info className="h-6 w-6 text-white" />}
                    {activity.status === 'anomali' && <AlertTriangle className="h-6 w-6 text-white" />}
                  </motion.div>
                  
                  {/* Student Details */}
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {activity.student_name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {activity.nim}
                    </p>
                  </div>
                </div>
                
                {/* Right: Time & Status */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {activity.time}
                  </p>
                  <Badge
                    variant={
                      activity.status === 'hadir' ? 'success' :
                      activity.status === 'terlambat' ? 'warning' :
                      activity.status === 'izin' ? 'default' :
                      'destructive'
                    }
                    className="mt-1"
                  >
                    {activity.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {/* New Activity Indicator */}
              {activity.isNew && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge className="bg-green-500 text-white animate-bounce">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Baru
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {recentActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Activity className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">Belum ada aktivitas hari ini</p>
          </motion.div>
        )}
      </div>
    </motion.div>

    {/* CHART SECTION */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          Grafik Kehadiran Hari Ini
        </h2>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Per Jam</SelectItem>
            <SelectItem value="session">Per Sesi</SelectItem>
            <SelectItem value="status">Per Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Chart Component */}
      <div className="h-64">
        {/* Recharts or Chart.js implementation */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hadir" fill="#10b981" />
            <Bar dataKey="terlambat" fill="#f59e0b" />
            <Bar dataKey="izin" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  </div>

  {/* RIGHT: Sidebar (30%) */}
  <div className="space-y-6">
    {/* ACTIVE SESSIONS */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-900 dark:text-white">
        <Radio className="h-5 w-5 text-blue-500 animate-pulse" />
        Sesi Aktif
        <Badge variant="success" className="ml-auto">{activeSessions.length}</Badge>
      </h3>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
        {activeSessions.map(session => (
          <motion.div
            key={session.id}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 cursor-pointer hover:border-blue-500 transition-all bg-white/50 dark:bg-neutral-800/50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">
                {session.course}
              </h4>
              <Badge variant="success" className="text-xs">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1" />
                Live
              </Badge>
            </div>
            
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <p className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {session.class}
              </p>
              <p className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {session.lecturer}
              </p>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-neutral-900 dark:text-white">
                  {session.present}/{session.total}
                </span>
              </div>
              <div className="flex items-center gap-1 text-neutral-500">
                <Clock className="h-3 w-3" />
                {session.timeLeft}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(session.present / session.total) * 100}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* ANOMALY ALERTS */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-900 dark:text-white">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Anomali Terdeteksi
        <Badge variant="destructive" className="ml-auto">{anomalies.length}</Badge>
      </h3>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        {anomalies.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Tidak ada anomali terdeteksi
            </p>
          </div>
        ) : (
          anomalies.map(anomaly => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-red-200 dark:border-red-800 p-3 bg-red-50 dark:bg-red-950/30"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-red-900 dark:text-red-100">
                    {anomaly.type}
                  </h4>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {anomaly.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Detail
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>

    {/* QUICK ACTIONS */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Quick Actions</h3>
      <div className="space-y-2">
        <Button className="w-full justify-start" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data Hari Ini
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Kirim Notifikasi
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Pengaturan Monitor
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </motion.div>
  </div>
</div>
```

---

## ACTIVITY DETAIL MODAL (Quick Preview - seperti screenshot)

```tsx
<Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
  <DialogContent className="max-w-md bg-neutral-900 border-neutral-700 text-white">
    {/* Close Button */}
    <button
      onClick={() => setSelectedActivity(null)}
      className="absolute right-4 top-4 rounded-full p-2 hover:bg-neutral-800 transition-colors"
    >
      <X className="h-5 w-5" />
    </button>

    {selectedActivity && (
      <div className="space-y-4 pt-8">
        {/* Student Profile */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4"
          >
            <AlertTriangle className="h-10 w-10 text-neutral-900" />
          </motion.div>
          <h2 className="text-2xl font-bold">{selectedActivity.student_name}</h2>
          <p className="text-gray-400 mt-1">{selectedActivity.nim}</p>
          
          <Badge
            variant={
              selectedActivity.status === 'hadir' ? 'success' :
              selectedActivity.status === 'terlambat' ? 'warning' :
              'default'
            }
            className="mt-3"
          >
            {selectedActivity.status.toUpperCase()}
          </Badge>
        </div>

        {/* Quick Info Cards */}
        <div className="space-y-3">
          {/* Waktu Scan */}
          <div className="rounded-xl bg-neutral-800 border border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase">Waktu Scan</p>
                <p className="text-xl font-bold">{selectedActivity.time}</p>
              </div>
            </div>
          </div>

          {/* Mata Kuliah */}
          <div className="rounded-xl bg-neutral-800 border border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase">Mata Kuliah</p>
                <p className="text-lg font-bold">{selectedActivity.course}</p>
              </div>
            </div>
          </div>

          {/* Lokasi / Jarak */}
          <div className="rounded-xl bg-neutral-800 border border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase">Lokasi / Jarak</p>
                <p className="text-lg font-bold">{selectedActivity.distance} meter</p>
                <p className="text-xs text-gray-500">dari pusat</p>
              </div>
            </div>
          </div>

          {/* Perangkat */}
          <div className="rounded-xl bg-neutral-800 border border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase">Perangkat</p>
                <p className="text-lg font-bold">{selectedActivity.device || 'Unknown Device'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tutup Detail Button */}
        <Button
          onClick={() => router.visit(`/admin/aktivitas-terbaru?activity=${selectedActivity.id}`)}
          className="w-full bg-white text-neutral-900 hover:bg-gray-100 font-bold py-6 rounded-xl"
        >
          Tutup Detail
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>
```

---

## FITUR ULTRA ADVANCED

### 1. Real-time Updates dengan WebSocket

```tsx
useEffect(() => {
  const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  });

  const channel = pusher.subscribe('live-monitor');

  channel.bind('new-activity', (data: Activity) => {
    setRecentActivities(prev => [{ ...data, isNew: true }, ...prev].slice(0, 10));
    updateStats();
    
    if (soundEnabled) {
      playNotificationSound();
    }
    
    toast.success(`${data.student_name} telah absen`);
    
    setTimeout(() => {
      setRecentActivities(prev =>
        prev.map(a => a.id === data.id ? { ...a, isNew: false } : a)
      );
    }, 5000);
  });

  channel.bind('anomaly-detected', (data: Anomaly) => {
    setAnomalies(prev => [data, ...prev]);
    if (soundEnabled) {
      playAlertSound();
    }
    toast.error(`Anomali terdeteksi: ${data.type}`);
  });

  channel.bind('session-updated', (data: Session) => {
    setActiveSessions(prev =>
      prev.map(s => s.id === data.id ? data : s)
    );
  });

  return () => {
    channel.unbind_all();
    channel.unsubscribe();
    pusher.disconnect();
  };
}, [soundEnabled]);
```

### 2. Auto-refresh Data

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    refreshData();
  }, 30000); // Refresh every 30 seconds

  return () => clearInterval(interval);
}, []);

const refreshData = async () => {
  try {
    const response = await fetch('/api/admin/live-monitor/refresh');
    const data = await response.json();
    
    setStats(data.stats);
    setRecentActivities(data.recentActivities);
    setActiveSessions(data.activeSessions);
    setAnomalies(data.anomalies);
    
    toast.success('Data berhasil diperbarui');
  } catch (error) {
    toast.error('Gagal memperbarui data');
  }
};
```

### 3. Sound Notifications

```tsx
const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.error('Audio play failed:', err));
};

const playAlertSound = () => {
  const audio = new Audio('/sounds/alert.mp3');
  audio.volume = 0.8;
  audio.play().catch(err => console.error('Audio play failed:', err));
};
```

### 4. Export Functionality

```tsx
const handleExportToday = async () => {
  try {
    const response = await fetch('/api/admin/live-monitor/export-today', {
      method: 'POST',
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-monitor-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    
    toast.success('Data berhasil diexport');
  } catch (error) {
    toast.error('Gagal mengexport data');
  }
};
```

---

## TECHNICAL REQUIREMENTS

### Imports
```tsx
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Scan, Users, CheckCircle, Clock, AlertTriangle,
  Activity, ChevronRight, Eye, X, MapPin, Smartphone,
  BookOpen, Download, Bell, Settings, RefreshCw,
  BarChart3, GraduationCap, User, Info, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Pusher from 'pusher-js';
```

### State Management
```tsx
const [stats, setStats] = useState({
  activeSessions: 0,
  totalScans: 0,
  activeStudents: 0,
  present: 0,
  late: 0,
  anomaly: 0,
  scanRate: 0,
  presentRate: 0,
  lateRate: 0,
});
const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
const [activeSessions, setActiveSessions] = useState<Session[]>([]);
const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
const [soundEnabled, setSoundEnabled] = useState(true);
const [chartType, setChartType] = useState('hourly');
const [chartData, setChartData] = useState([]);
```

---

## KESIMPULAN

Halaman Live Monitor Dashboard ini adalah dashboard monitoring utama yang SANGAT COMPREHENSIVE dengan:

1. **Real-time Overview** - 6 stat cards dengan live counter dan trend indicators
2. **Quick Preview Aktivitas** - 5-10 aktivitas terakhir dengan dark theme (seperti screenshot)
3. **Activity Detail Modal** - Quick preview modal dengan 4 info cards (waktu, mata kuliah, lokasi, perangkat)
4. **Active Sessions Panel** - Live tracking dengan progress bars
5. **Anomaly Alerts** - Real-time anomaly detection dengan action buttons
6. **Chart Visualization** - Grafik kehadiran per jam/sesi/status
7. **Quick Actions** - Export, notifikasi, settings, refresh
8. **WebSocket Integration** - Real-time updates untuk semua data
9. **Sound Notifications** - Audio alerts yang dapat di-toggle
10. **Auto-refresh** - Data refresh otomatis setiap 30 detik
11. **Navigation** - Tombol "Lihat Semua" ke halaman detail aktivitas terbaru
12. **Mobile Responsive** - Touch-friendly dengan responsive layout
13. **Dark Mode Support** - Full dark mode untuk activity cards

**UI/UX HIGHLIGHTS:**
- Dark theme untuk activity preview cards (matching screenshot)
- Glassmorphism untuk container cards
- Indigo-purple-pink gradient header
- Pulse animations untuk live indicators
- New activity badges dengan sparkles icon
- Smooth hover effects dan transitions
- Progress bars untuk session attendance
- Color-coded status indicators
- Empty states dengan helpful messages

Selamat mengimplementasikan! 🚀
