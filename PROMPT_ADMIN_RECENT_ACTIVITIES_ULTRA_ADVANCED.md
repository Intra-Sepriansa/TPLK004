# PROMPT: ADMIN AKTIVITAS TERBARU (RECENT ACTIVITY DETAIL PAGE) - ULTRA ADVANCED

## TUJUAN
Membuat halaman detail Aktivitas Terbaru untuk Admin (`resources/js/pages/admin/aktivitas-terbaru.tsx`) dengan UI/UX yang SANGAT SANGAT ADVANCE dan COMPREHENSIVE, mengadopsi FULL warna, gradient, dan style dari Kas Admin (indigo-purple-pink).

**PENTING:** Halaman ini adalah halaman TERPISAH yang diakses ketika user klik section "Aktivitas Terbaru" di menu Live Monitor. Fokus utama adalah menampilkan real-time scan logs dalam format feed yang detail, interaktif, dan sangat informatif.

**Route:** `/admin/aktivitas-terbaru` atau `/admin/live-monitor/aktivitas-terbaru`

---

## UI/UX REFERENCE - WAJIB IKUTI 100%

### Warna & Gradient (EXACT dari Kas Admin)
```tsx
// Header Background - INDIGO-PURPLE-PINK
bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500

// Animated Background Position
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

// Activity Cards
rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 backdrop-blur-xl
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  hover: {
    scale: 1.03,
    y: -8,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
} as const;

const pulseVariants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 0.6,
      repeat: 3,
    },
  },
} as const;
```

---

## LAYOUT STRUCTURE

Halaman ini menggunakan **2-COLUMN LAYOUT**:
- **Main Content (70%):** Activity feed dengan header, stats, filters, dan real-time logs
- **Sidebar (30%):** Active sessions panel (sticky) + Quick actions

**Navigation:**
- Tombol "← Kembali ke Live Monitor" di header
- Breadcrumb: Dashboard > Live Monitor > Aktivitas Terbaru

---

## STRUKTUR HALAMAN

### 1. HEADER SECTION

**Back Button:**
```tsx
<Button
  variant="ghost"
  onClick={() => router.visit('/admin/live-monitor')}
  className="mb-4 text-white hover:bg-white/20"
>
  <ChevronLeft className="h-4 w-4 mr-2" />
  Kembali ke Live Monitor
</Button>
```

**Header Card:**
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

  {/* Blur Orbs */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

  {/* Pulsating Rings */}
  <motion.div
    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
  />
  <motion.div
    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
  />

  <div className="relative">
    <div className="flex items-center justify-between flex-wrap gap-6">
      <div className="flex items-center gap-5">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
          whileHover={{ scale: 1.1, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Activity className="h-8 w-8 text-white" />
        </motion.div>
        <div>
          <p className="text-sm text-indigo-100 font-medium tracking-wide">Live Monitoring</p>
          <h1 className="text-3xl font-bold text-white">Aktivitas Terbaru</h1>
          <p className="mt-1 text-indigo-100 max-w-lg">
            Pantau semua aktivitas absensi secara real-time dengan detail lengkap
          </p>
        </div>
      </div>

      {/* Live Indicator Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
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

### 2. REAL-TIME STATS (4 Cards dengan Glassmorphism)

```tsx
<motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {[
    { 
      icon: Radio, 
      label: 'Sesi Aktif', 
      value: stats.activeSessions, 
      color: 'from-blue-400 to-cyan-600', 
      shadow: 'shadow-blue-500/30',
      gradientBg: 'from-blue-500/5 to-cyan-500/5', 
      blurColor: 'bg-blue-500',
      subtitle: 'sesi berlangsung',
      trend: '+2 dari 1 jam lalu'
    },
    { 
      icon: Scan, 
      label: 'Total Scan Hari Ini', 
      value: stats.totalScans, 
      color: 'from-emerald-400 to-teal-600', 
      shadow: 'shadow-emerald-500/30',
      gradientBg: 'from-emerald-500/5 to-teal-500/5', 
      blurColor: 'bg-emerald-500',
      subtitle: 'scan berhasil',
      trend: `${stats.scanRate}% dari target`
    },
    { 
      icon: Users, 
      label: 'Mahasiswa Aktif', 
      value: stats.activeStudents, 
      color: 'from-purple-400 to-pink-600', 
      shadow: 'shadow-purple-500/30',
      gradientBg: 'from-purple-500/5 to-pink-500/5', 
      blurColor: 'bg-purple-500',
      subtitle: 'sedang absen',
      trend: 'Live counter'
    },
    { 
      icon: AlertTriangle, 
      label: 'Anomali Terdeteksi', 
      value: stats.anomalyCount, 
      color: 'from-red-400 to-orange-600', 
      shadow: 'shadow-red-500/30',
      gradientBg: 'from-red-500/5 to-orange-500/5', 
      blurColor: 'bg-red-500',
      subtitle: 'perlu review',
      trend: stats.anomalyCount > 0 ? 'Perhatian!' : 'Aman'
    },
  ].map((stat) => (
    <motion.div
      key={stat.label}
      variants={cardVariants}
      whileHover="hover"
      className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all cursor-pointer"
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', stat.gradientBg)} />
      <motion.div
        animate={{
          scale: hoveredCard === stat.label ? 1.5 : 1,
          opacity: hoveredCard === stat.label ? 0.4 : 0.2,
        }}
        className={cn('absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500', stat.blurColor)}
      />
      <div className="relative flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', stat.color, stat.shadow)}
        >
          <stat.icon className="h-7 w-7" />
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{stat.label}</p>
          <div className="mt-1">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              <AnimatedCounter value={stat.value} duration={1200} />
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">{stat.subtitle}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">{stat.trend}</p>
        </div>
      </div>
    </motion.div>
  ))}
</motion.div>
```

### 3. MAIN CONTENT AREA (2-Column Grid)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* LEFT COLUMN: Activity Feed (70%) */}
  <div className="lg:col-span-2 space-y-6">

    {/* FILTER & SEARCH BAR */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <Filter className="h-5 w-5" />
        </div>
        <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Filter & Pencarian</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Cari nama, NIM, sesi..."
            className="pl-10 bg-white/60 dark:bg-neutral-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white/60 dark:bg-neutral-800">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="terlambat">Terlambat</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
            <SelectItem value="anomali">Anomali</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Session Filter */}
        <Select value={sessionFilter} onValueChange={setSessionFilter}>
          <SelectTrigger className="bg-white/60 dark:bg-neutral-800">
            <SelectValue placeholder="Semua Sesi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Sesi</SelectItem>
            {sessions.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Advanced Filters Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="mt-3"
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        {showAdvancedFilters ? 'Sembunyikan' : 'Tampilkan'} Filter Lanjutan
      </Button>
      
      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time Range */}
              <div>
                <Label>Rentang Waktu</Label>
                <div className="flex gap-2 mt-2">
                  <Input type="time" className="bg-white/60 dark:bg-neutral-800" />
                  <span className="self-center">-</span>
                  <Input type="time" className="bg-white/60 dark:bg-neutral-800" />
                </div>
              </div>
              
              {/* Method Filter */}
              <div>
                <Label>Metode Absensi</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['QR Code', 'GPS', 'Selfie', 'Manual', 'NFC'].map(method => (
                    <Badge
                      key={method}
                      variant="outline"
                      className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900"
                      onClick={() => toggleMethodFilter(method)}
                    >
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Distance Range */}
              <div>
                <Label>Jarak Maksimal (meter)</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 50"
                  className="mt-2 bg-white/60 dark:bg-neutral-800"
                />
              </div>
              
              {/* Device Type */}
              <div>
                <Label>Tipe Device</Label>
                <Select>
                  <SelectTrigger className="mt-2 bg-white/60 dark:bg-neutral-800">
                    <SelectValue placeholder="Semua Device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Device</SelectItem>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="ios">iOS</SelectItem>
                    <SelectItem value="web">Web Browser</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    {/* ACTIVITY FEED HEADER */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-3 w-3 rounded-full bg-green-500"
        />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Live Activity Feed
        </h2>
        <Badge variant="success" className="animate-pulse">
          <Radio className="h-3 w-3 mr-1" />
          {filteredActivities.length} aktivitas
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Auto-scroll Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
        >
          {autoScroll ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </>
          )}
        </Button>
        
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export ke Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export ke PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileDown className="h-4 w-4 mr-2" />
              Export ke CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Sound Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>

    {/* ACTIVITY FEED */}
    <div
      ref={feedRef}
      className="space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
    >
      <AnimatePresence>
        {filteredActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            variants={pulseVariants}
            whileHover={{ scale: 1.02, x: 5 }}
            onClick={() => setSelectedActivity(activity)}
            className={cn(
              "rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 backdrop-blur-xl cursor-pointer transition-all",
              "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg",
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
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                    {activity.student_name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {activity.nim}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {activity.session_name}
                  </p>
                </div>
              </div>
              
              {/* Right: Time & Status */}
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {activity.time}
                </p>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {activity.distance}m
                  </Badge>
                  <Badge
                    variant={
                      activity.status === 'hadir' ? 'success' :
                      activity.status === 'terlambat' ? 'warning' :
                      activity.status === 'izin' ? 'default' :
                      'destructive'
                    }
                  >
                    {activity.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {activity.method}
                </p>
              </div>
            </div>
            
            {/* Quick Info Bar */}
            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-neutral-500">Lokasi</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{activity.location}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Device</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{activity.device}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Akurasi GPS</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{activity.gps_accuracy}m</p>
                </div>
                <div>
                  <p className="text-neutral-500">IP Address</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{activity.ip_address}</p>
                </div>
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
      {filteredActivities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Activity className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500">Belum ada aktivitas</p>
          <p className="text-sm text-neutral-400 mt-2">
            Aktivitas akan muncul secara real-time ketika mahasiswa melakukan absensi
          </p>
        </motion.div>
      )}
    </div>
  </div>

  {/* RIGHT COLUMN: Sidebar (30%) */}
  <div className="space-y-6">

    {/* ACTIVE SESSIONS PANEL */}
    <div className="sticky top-6">
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
                <p className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {session.location}
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
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* QUICK ACTIONS */}
      <motion.div
        variants={itemVariants}
        className="mt-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
      >
        <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Quick Actions</h3>
        <div className="space-y-2">
          <Button className="w-full justify-start" variant="outline">
            <Pause className="h-4 w-4 mr-2" />
            Pause Monitoring
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Semua Data
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Pengaturan Alert
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Manual
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Pengaturan Tampilan
          </Button>
        </div>
      </motion.div>
      
      {/* STATISTICS SUMMARY */}
      <motion.div
        variants={itemVariants}
        className="mt-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
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
    </div>
  </div>
</div>
```

---

## FITUR ULTRA ADVANCED

### 1. Real-time Updates dengan WebSocket/Pusher

```tsx
useEffect(() => {
  // Initialize Pusher
  const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
  });

  const channel = pusher.subscribe('attendance-monitor');

  // Listen for new scan events
  channel.bind('new-scan', (data: Activity) => {
    // Add to activities list
    setActivities(prev => [{ ...data, isNew: true }, ...prev]);

    // Play notification sound
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show toast notification
    toast.success(`${data.student_name} telah melakukan absensi`, {
      description: `Status: ${data.status} • Waktu: ${data.time}`,
    });

    // Update stats
    updateStats();

    // Remove 'new' indicator after 5 seconds
    setTimeout(() => {
      setActivities(prev =>
        prev.map(a => a.id === data.id ? { ...a, isNew: false } : a)
      );
    }, 5000);
  });

  // Listen for anomaly detection
  channel.bind('anomaly-detected', (data: Anomaly) => {
    setAnomalies(prev => [data, ...prev]);

    if (soundEnabled) {
      playAlertSound();
    }

    toast.error(`Anomali terdeteksi!`, {
      description: data.message,
      action: {
        label: 'Lihat Detail',
        onClick: () => viewAnomaly(data),
      },
    });
  });

  // Listen for session updates
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

### 2. Activity Detail Modal (Comprehensive)

```tsx
<Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
  <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-2xl">Detail Aktivitas Absensi</DialogTitle>
    </DialogHeader>

    {selectedActivity && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Student Information */}
        <div className="space-y-4">
          {/* Student Profile Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-neutral-800">
                <AvatarImage src={selectedActivity.student.photo} />
                <AvatarFallback className="text-2xl font-bold">
                  {selectedActivity.student.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {selectedActivity.student.name}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {selectedActivity.student.nim}
                </p>
                <Badge
                  variant={
                    selectedActivity.status === 'hadir' ? 'success' :
                    selectedActivity.status === 'terlambat' ? 'warning' :
                    selectedActivity.status === 'izin' ? 'default' :
                    'destructive'
                  }
                  className="mt-2"
                >
                  {selectedActivity.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Program Studi:</span>
                <span className="font-medium">{selectedActivity.student.major}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Semester:</span>
                <span className="font-medium">{selectedActivity.student.semester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Email:</span>
                <span className="font-medium text-xs">{selectedActivity.student.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">No. HP:</span>
                <span className="font-medium">{selectedActivity.student.phone}</span>
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Riwayat Kehadiran (7 Hari Terakhir)
            </h4>
            <div className="space-y-2">
              {selectedActivity.student.recentAttendance.map((att, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">{att.date}</span>
                  <Badge variant={att.status === 'hadir' ? 'success' : 'warning'} className="text-xs">
                    {att.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Attendance Details */}
        <div className="space-y-4">
          {/* Scan Details */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Detail Scan
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">Waktu Scan:</dt>
                <dd className="font-medium">{selectedActivity.scan_time}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">Metode:</dt>
                <dd className="font-medium">{selectedActivity.method}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">Jarak:</dt>
                <dd className="font-medium">{selectedActivity.distance}m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">Akurasi GPS:</dt>
                <dd className="font-medium">{selectedActivity.gps_accuracy}m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">Koordinat:</dt>
                <dd className="font-medium text-xs">{selectedActivity.coordinates}</dd>
              </div>
            </dl>
          </div>

          {/* Device Information */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Informasi Device
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">Device:</dt>
                <dd className="font-medium">{selectedActivity.device}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">OS:</dt>
                <dd className="font-medium">{selectedActivity.os}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">Browser:</dt>
                <dd className="font-medium">{selectedActivity.browser}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">IP Address:</dt>
                <dd className="font-medium">{selectedActivity.ip_address}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">User Agent:</dt>
                <dd className="font-medium text-xs truncate">{selectedActivity.user_agent}</dd>
              </div>
            </dl>
          </div>

          {/* Selfie Verification (if available) */}
          {selectedActivity.selfie && (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Verifikasi Selfie
              </h4>
              <img
                src={selectedActivity.selfie}
                alt="Selfie"
                className="w-full rounded-lg mb-3"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Face Match Score:</span>
                <Badge variant={selectedActivity.face_match >= 80 ? 'success' : 'warning'}>
                  {selectedActivity.face_match}%
                </Badge>
              </div>
            </div>
          )}

          {/* Location Map */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lokasi Absensi
            </h4>
            <div className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
              {/* Google Maps integration */}
              <p className="text-neutral-500 text-sm">Map Preview</p>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              {selectedActivity.location}
            </p>
          </div>
        </div>
      </div>
    )}

    <DialogFooter>
      <Button variant="outline" onClick={() => setSelectedActivity(null)}>
        Tutup
      </Button>
      <Button onClick={() => exportActivityDetail(selectedActivity)}>
        <Download className="h-4 w-4 mr-2" />
        Export Detail
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
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
const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
  try {
    const response = await fetch('/api/admin/aktivitas-terbaru/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activities: filteredActivities,
        filters: {
          status: statusFilter,
          session: sessionFilter,
          dateRange: { start: startDate, end: endDate },
        },
        format,
      }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aktivitas-terbaru-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Data berhasil diexport ke ${format.toUpperCase()}`);
  } catch (error) {
    toast.error('Gagal mengexport data');
  }
};
```

### 5. Anomaly Alert System

```tsx
<AnimatePresence>
  {anomalies.length > 0 && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 right-6 z-50 max-w-md"
    >
      <Alert variant="destructive" className="shadow-2xl border-2 border-red-500">
        <AlertTriangle className="h-5 w-5 animate-pulse" />
        <AlertTitle className="text-lg font-bold">Anomali Terdeteksi!</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{anomalies[0].message}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => viewAnomaly(anomalies[0])}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Lihat Detail
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => dismissAnomaly(anomalies[0].id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  )}
</AnimatePresence>
```

### 6. Keyboard Shortcuts

```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    }

    // Ctrl/Cmd + E: Export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      handleExport('excel');
    }

    // Ctrl/Cmd + P: Pause/Resume
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      setAutoScroll(!autoScroll);
    }

    // Ctrl/Cmd + R: Refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      refreshData();
    }

    // ESC: Close modal
    if (e.key === 'Escape' && selectedActivity) {
      setSelectedActivity(null);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [autoScroll, selectedActivity]);
```

### 7. Performance Optimization

```tsx
// Virtual scrolling untuk large datasets
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const rowVirtualizer = useVirtualizer({
  count: filteredActivities.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 120,
  overscan: 5,
});

// Memoize filtered activities
const filteredActivities = useMemo(() => {
  return activities.filter(activity => {
    if (searchQuery && !activity.student_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !activity.nim.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== 'all' && activity.status !== statusFilter) {
      return false;
    }
    if (sessionFilter !== 'all' && activity.session_id !== sessionFilter) {
      return false;
    }
    return true;
  });
}, [activities, searchQuery, statusFilter, sessionFilter]);
```

---

## TECHNICAL REQUIREMENTS

### Imports
```tsx
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Radio, Scan, Users, AlertTriangle, CheckCircle,
  Filter, Download, Bell, Pause, Play, Eye, MapPin, Clock,
  Smartphone, Camera, X, ChevronLeft, Search, SlidersHorizontal,
  Volume2, VolumeX, FileSpreadsheet, FileText, FileDown,
  Info, History, User, GraduationCap, RefreshCw, Settings,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import Pusher from 'pusher-js';
```

### State Management
```tsx
const [activities, setActivities] = useState<Activity[]>([]);
const [activeSessions, setActiveSessions] = useState<Session[]>([]);
const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
const [stats, setStats] = useState({
  activeSessions: 0,
  totalScans: 0,
  activeStudents: 0,
  anomalyCount: 0,
  scanRate: 0,
});
const [todayStats, setTodayStats] = useState({
  hadir: 0,
  terlambat: 0,
  izin: 0,
  anomali: 0,
});
const [autoScroll, setAutoScroll] = useState(true);
const [soundEnabled, setSoundEnabled] = useState(true);
const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [sessionFilter, setSessionFilter] = useState('all');
const [hoveredCard, setHoveredCard] = useState<string | null>(null);
const feedRef = useRef<HTMLDivElement>(null);
```

---

## KESIMPULAN

Halaman Aktivitas Terbaru Admin ini adalah dashboard monitoring yang SANGAT SANGAT COMPREHENSIVE dengan:

1. **UI/UX Premium:** Mengadopsi 100% style dari Kas Admin (indigo-purple-pink gradient)
2. **Real-time Updates:** WebSocket/Pusher integration untuk live updates
3. **Live Activity Feed:** Auto-scroll dengan pulse animations dan new activity indicators
4. **Advanced Filtering:** Multi-criteria filtering dengan search, status, session, time range, method, distance, device
5. **Active Sessions Panel:** Sidebar dengan progress tracking dan live counter
6. **Comprehensive Detail Modal:** 2-column layout dengan student info, attendance details, device info, selfie verification, location map
7. **Sound Notifications:** Audio alerts untuk new activities dan anomalies (dapat di-toggle)
8. **Export Functionality:** Excel, PDF, CSV dengan custom filters
9. **Anomaly Detection:** Real-time alerts dengan action buttons
10. **Performance Optimized:** Virtual scrolling, memoization, efficient re-renders
11. **Keyboard Shortcuts:** Ctrl+F (search), Ctrl+E (export), Ctrl+P (pause), Ctrl+R (refresh)
12. **Quick Actions:** Pause monitoring, export, alert settings, refresh, display settings
13. **Statistics Summary:** Real-time stats dengan attendance rate calculation
14. **Mobile Responsive:** Touch-friendly, swipe gestures, bottom sheets
15. **Dark Mode Support:** Full dark mode dengan proper contrast

**FITUR TAMBAHAN YANG SANGAT BERGUNA:**
- New activity indicator dengan badge "Baru" dan pulse animation
- Live counter untuk active students
- Trend indicators pada stat cards
- Quick info bar pada setiap activity card
- Recent attendance history (7 hari terakhir) di detail modal
- Face match score untuk selfie verification
- Coordinate display untuk GPS tracking
- User agent dan device details untuk security audit
- Auto-dismiss untuk new activity indicators (5 detik)
- Empty state dengan helpful message
- Scrollbar styling untuk better UX
- Hover effects dengan scale dan shadow animations
- Ring animation untuk new activities
- Progress bars untuk session attendance
- Time remaining display untuk active sessions

Selamat mengimplementasikan! 🚀
