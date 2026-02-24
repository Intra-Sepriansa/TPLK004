# 🎨 PROMPT ULTRA ADVANCED: FIX ADMIN UI/UX LAYOUT
## Perbaikan Layout dan Tata Letak Menu Admin untuk Konsistensi UI/UX

---

## 📋 OVERVIEW PERUBAHAN

### Tujuan
Memperbaiki layout dan tata letak di berbagai menu admin agar:
- **KONSISTEN** dengan design system yang ada
- **RESPONSIVE** dan tidak terlalu panjang/lebar
- **CLEAN** dengan spacing yang tepat
- **USER-FRIENDLY** dengan button placement yang optimal

### Scope Menu yang Diubah
```
1. ✅ Jadwal Sesi Absen       → Tombol tambah di tengah
2. ✅ Informasi Tugas          → Container tidak terlalu panjang
3. ✅ Voting Kas               → Layout sama dengan dashboard, card 2x2
4. ✅ Leaderboard              → Card jadi 1 baris
5. ✅ Rekap Kehadiran          → Export di tengah, card 2x2
6. ✅ Fraud Detection          → Card 2x2
7. ✅ Aktivitas Terbaru        → Card 1 baris
8. ✅ Panduan                  → Complete redesign (berantakan)
```

---

## 🎯 DESIGN PRINCIPLES

### Layout Standards
```tsx
// Container Width Standards
const CONTAINER_WIDTHS = {
  full: 'w-full',                    // Full width
  standard: 'max-w-7xl mx-auto',     // Standard content (1280px)
  narrow: 'max-w-5xl mx-auto',       // Narrow content (1024px)
  form: 'max-w-3xl mx-auto',         // Form content (768px)
}

// Grid Standards
const GRID_LAYOUTS = {
  cards_2x2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  cards_3x3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  cards_4x4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  single_row: 'grid grid-cols-1 gap-6',
}

// Button Placement
const BUTTON_POSITIONS = {
  center: 'flex justify-center',
  right: 'flex justify-end',
  left: 'flex justify-start',
  between: 'flex justify-between',
}
```

### Color Standards (HITAM Theme)
```tsx
// Container Colors - MUST USE THESE
bg-white/50 dark:bg-neutral-900/50           // Main container
bg-white dark:bg-neutral-800                 // Card background
bg-neutral-50 dark:bg-neutral-900            // Section background

// NO NAVY/BLUE COLORS!
❌ bg-blue-500, bg-navy-600, bg-indigo-700
✅ bg-neutral-800, bg-neutral-900, bg-black
```

---

## 🔧 FIX #1: JADWAL SESI ABSEN

### Current Problem
```
❌ Tombol "Tambah Jadwal" di pojok kanan
❌ Tidak terlihat jelas
❌ Tidak konsisten dengan menu lain
```

### Solution: Center Button Layout
```tsx
// File: resources/js/pages/admin/jadwal.tsx

<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Jadwal Sesi Absen
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Kelola jadwal sesi absensi mahasiswa
        </p>
      </div>
    </motion.div>

    {/* Stats Cards - 2x2 Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats cards here */}
    </div>

    {/* CENTER BUTTON - NEW LAYOUT */}
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-center py-8"
    >
      <Button
        onClick={() => setShowCreateModal(true)}
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="w-6 h-6 mr-2" />
        Tambah Jadwal Sesi Absen
      </Button>
    </motion.div>

    {/* Jadwal List */}
    <div className="space-y-4">
      {/* List items here */}
    </div>
  </div>
</div>
```

### Key Changes
- ✅ Button di tengah dengan `flex justify-center`
- ✅ Padding vertical `py-8` untuk spacing
- ✅ Size `lg` untuk button yang lebih besar
- ✅ Shadow dan hover effect untuk emphasis

---

## 🔧 FIX #2: INFORMASI TUGAS

### Current Problem
```
❌ Container terlalu panjang/lebar
❌ Form input terlalu stretched
❌ Tidak nyaman dibaca
```

### Solution: Narrow Container
```tsx
// File: resources/js/pages/dosen/tugas.tsx

<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
  {/* NARROW CONTAINER - max-w-5xl instead of max-w-7xl */}
  <div className="max-w-5xl mx-auto p-6 space-y-6">
    
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Informasi Tugas
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Kelola tugas dan assignment mahasiswa
        </p>
      </div>
    </div>

    {/* Stats - 2x2 Grid (not 4 columns) */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatsCard
        title="Total Tugas"
        value={stats.total}
        icon={FileText}
        color="blue"
      />
      <StatsCard
        title="Tugas Aktif"
        value={stats.active}
        icon={Clock}
        color="green"
      />
      <StatsCard
        title="Menunggu Review"
        value={stats.pending}
        icon={AlertCircle}
        color="yellow"
      />
      <StatsCard
        title="Selesai"
        value={stats.completed}
        icon={CheckCircle}
        color="emerald"
      />
    </div>

    {/* Tambah Tugas Button - Center */}
    <div className="flex justify-center py-6">
      <Button
        onClick={() => setShowCreateModal(true)}
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Plus className="w-5 h-5 mr-2" />
        Tambah Tugas Baru
      </Button>
    </div>

    {/* Tugas List - Narrow Cards */}
    <div className="space-y-4">
      {tugasList.map((tugas) => (
        <motion.div
          key={tugas.id}
          className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
        >
          {/* Card content */}
        </motion.div>
      ))}
    </div>
  </div>
</div>
```

### Key Changes
- ✅ Container: `max-w-5xl` (1024px) instead of `max-w-7xl`
- ✅ Stats grid: 2 columns instead of 4
- ✅ Button centered dengan padding
- ✅ Cards tidak terlalu lebar

---

## 🔧 FIX #3: VOTING KAS

### Current Problem
```
❌ Layout tidak konsisten dengan dashboard
❌ Card layout berbeda
❌ Tidak ada grid 2x2
```

### Solution: Dashboard-Style Layout
```tsx
// File: resources/js/pages/admin/kas-voting.tsx

<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    
    {/* Header - Same as Dashboard */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Voting Kas Kelas
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Kelola voting dan keputusan penggunaan kas kelas
        </p>
      </div>
      <Button
        onClick={() => setShowCreateModal(true)}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Plus className="w-5 h-5 mr-2" />
        Buat Voting
      </Button>
    </motion.div>

    {/* Stats Cards - 2x2 Grid (SAME AS DASHBOARD) */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Voting
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.totalVoting}
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Vote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Voting Aktif
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.activeVoting}
            </h3>
          </div>
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Partisipasi
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.totalParticipants}
            </h3>
          </div>
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Voting Selesai
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.completedVoting}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </motion.div>
    </div>

    {/* Voting List */}
    <div className="space-y-4">
      {/* Voting items */}
    </div>
  </div>
</div>
```

### Key Changes
- ✅ Grid 2x2: `grid-cols-1 md:grid-cols-2`
- ✅ Card style sama dengan dashboard
- ✅ Icon dengan background color
- ✅ Consistent spacing dan animations



---

## 🔧 FIX #4: LEADERBOARD

### Current Problem
```
❌ Card terlalu banyak kolom
❌ Tidak efisien untuk data leaderboard
❌ Sulit dibaca
```

### Solution: Single Row Cards
```tsx
// File: resources/js/pages/admin/leaderboard.tsx

<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
        Leaderboard Mahasiswa
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mt-1">
        Peringkat mahasiswa berdasarkan performa dan kehadiran
      </p>
    </motion.div>

    {/* Stats - 4 columns (keep this) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats cards */}
    </div>

    {/* Leaderboard Cards - SINGLE ROW */}
    <div className="space-y-4">
      {leaderboardData.map((student, index) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            
            {/* Left: Rank & Student Info */}
            <div className="flex items-center gap-6">
              {/* Rank Badge */}
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl",
                index === 0 && "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white",
                index === 1 && "bg-gradient-to-br from-gray-300 to-gray-500 text-white",
                index === 2 && "bg-gradient-to-br from-orange-400 to-orange-600 text-white",
                index > 2 && "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              )}>
                {index === 0 && <Crown className="w-8 h-8" />}
                {index > 0 && `#${index + 1}`}
              </div>

              {/* Student Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>{student.nama.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                    {student.nama}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {student.nim} • {student.kelas}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-8">
              {/* Attendance */}
              <div className="text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Kehadiran
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {student.attendanceRate}%
                </p>
              </div>

              {/* Points */}
              <div className="text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Total Poin
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {student.totalPoints}
                </p>
              </div>

              {/* Badges */}
              <div className="text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Badge
                </p>
                <div className="flex gap-1 mt-1">
                  {student.badges.slice(0, 3).map((badge, i) => (
                    <img
                      key={i}
                      src={badge.icon}
                      alt={badge.name}
                      className="w-8 h-8"
                    />
                  ))}
                  {student.badges.length > 3 && (
                    <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-xs">
                      +{student.badges.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewDetails(student.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</div>
```

### Key Changes
- ✅ Cards dalam 1 baris: `space-y-4` (vertical stack)
- ✅ Horizontal layout dengan `flex justify-between`
- ✅ Rank badge di kiri, stats di kanan
- ✅ Crown icon untuk rank #1
- ✅ Gradient colors untuk top 3

---

## 🔧 FIX #5: REKAP KEHADIRAN

### Current Problem
```
❌ Export button tidak di tengah
❌ Card layout tidak 2x2
❌ Tidak konsisten
```

### Solution: Centered Export + 2x2 Cards
```tsx
// File: resources/js/pages/admin/rekap-kehadiran.tsx

<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
        Rekap Kehadiran
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mt-1">
        Laporan dan statistik kehadiran mahasiswa
      </p>
    </motion.div>

    {/* Stats Cards - 2x2 Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Kehadiran
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.totalAttendance}
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              +12% dari bulan lalu
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Rata-rata Kehadiran
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.averageRate}%
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Target: 85%
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Izin
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.totalPermits}
            </h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              Menunggu approval: {stats.pendingPermits}
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Alfa
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.totalAbsent}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              -5% dari bulan lalu
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </motion.div>
    </div>

    {/* EXPORT SECTION - CENTERED */}
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-8 border border-neutral-200 dark:border-neutral-800"
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <Download className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Export Laporan Kehadiran
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Download laporan dalam format PDF atau Excel
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FileText className="w-5 h-5 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>
    </motion.div>

    {/* Attendance Table */}
    <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Table content */}
    </div>
  </div>
</div>
```

### Key Changes
- ✅ Stats grid 2x2: `grid-cols-1 md:grid-cols-2`
- ✅ Export section centered dengan icon besar
- ✅ Buttons side-by-side untuk PDF dan Excel
- ✅ Consistent card styling

---

## 🔧 FIX #6: FRAUD DETECTION

### Current Problem
```
❌ Card layout tidak 2x2
❌ Terlalu banyak kolom
❌ Sulit dibaca
```

### Solution: 2x2 Card Grid
```tsx
// File: resources/js/pages/admin/fraud-detection.tsx

<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
        Fraud Detection
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mt-1">
        Deteksi dan monitoring anomali kehadiran mahasiswa
      </p>
    </motion.div>

    {/* Stats Cards - 2x2 Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Anomali
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.totalAnomalies}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Perlu ditindaklanjuti
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              GPS Spoofing
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.gpsSpoofing}
            </h3>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              Terdeteksi hari ini: {stats.todayGPS}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Selfie Fraud
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.selfieFraud}
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Ditolak: {stats.rejectedSelfie}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Resolved Cases
            </p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {stats.resolvedCases}
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Success rate: {stats.successRate}%
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </motion.div>
    </div>

    {/* Anomaly List */}
    <div className="space-y-4">
      {/* Anomaly items */}
    </div>
  </div>
</div>
```

### Key Changes
- ✅ Grid 2x2: `grid-cols-1 md:grid-cols-2`
- ✅ Consistent card styling
- ✅ Color-coded icons untuk jenis anomali
- ✅ Stats dengan context (hari ini, success rate, dll)



---

## 🔧 FIX #7: AKTIVITAS TERBARU

### Current Problem
```
❌ Card layout tidak efisien
❌ Terlalu banyak kolom
❌ Timeline tidak jelas
```

### Solution: Single Row Timeline Cards
```tsx
// File: resources/js/pages/admin/aktivitas-terbaru.tsx

<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
        Aktivitas Terbaru
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mt-1">
        Log aktivitas dan perubahan sistem real-time
      </p>
    </motion.div>

    {/* Filter Bar */}
    <div className="flex items-center gap-4">
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Semua Aktivitas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Aktivitas</SelectItem>
          <SelectItem value="attendance">Kehadiran</SelectItem>
          <SelectItem value="tugas">Tugas</SelectItem>
          <SelectItem value="voting">Voting</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterTime} onValueChange={setFilterTime}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Hari Ini" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hari Ini</SelectItem>
          <SelectItem value="week">Minggu Ini</SelectItem>
          <SelectItem value="month">Bulan Ini</SelectItem>
          <SelectItem value="all">Semua Waktu</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={refreshActivities}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>

    {/* Activity Timeline - SINGLE ROW CARDS */}
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            
            {/* Left: Icon + Content */}
            <div className="flex items-start gap-4 flex-1">
              {/* Activity Icon */}
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                activity.type === 'attendance' && "bg-emerald-100 dark:bg-emerald-900/30",
                activity.type === 'tugas' && "bg-blue-100 dark:bg-blue-900/30",
                activity.type === 'voting' && "bg-purple-100 dark:bg-purple-900/30",
                activity.type === 'system' && "bg-neutral-100 dark:bg-neutral-800"
              )}>
                {activity.type === 'attendance' && (
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                )}
                {activity.type === 'tugas' && (
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                )}
                {activity.type === 'voting' && (
                  <Vote className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                )}
                {activity.type === 'system' && (
                  <Settings className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                )}
              </div>

              {/* Activity Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {activity.title}
                  </h3>
                  <Badge variant={activity.priority === 'high' ? 'destructive' : 'secondary'}>
                    {activity.priority}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {activity.user}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.timestamp}
                  </span>
                  {activity.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Action Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewActivityDetail(activity.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Load More */}
    {hasMore && (
      <div className="flex justify-center py-4">
        <Button
          variant="outline"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Load More
            </>
          )}
        </Button>
      </div>
    )}
  </div>
</div>
```

### Key Changes
- ✅ Cards dalam 1 baris: `space-y-4`
- ✅ Timeline style dengan icon di kiri
- ✅ Horizontal layout untuk efisiensi
- ✅ Badge untuk priority
- ✅ Metadata (user, time, location) dalam 1 baris

---

## 🔧 FIX #8: PANDUAN (COMPLETE REDESIGN)

### Current Problem
```
❌ Layout berantakan
❌ Tidak ada struktur yang jelas
❌ Sulit navigasi
❌ Tidak ada search/filter
❌ Card tidak konsisten
```

### Solution: Complete Documentation UI
```tsx
// File: resources/js/pages/admin/panduan.tsx

<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    
    {/* Header with Search */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Panduan & Dokumentasi
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Panduan lengkap penggunaan sistem absensi
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <Input
          type="text"
          placeholder="Cari panduan, tutorial, atau FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-lg"
        />
      </div>
    </motion.div>

    {/* Category Tabs */}
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
        <TabsTrigger value="all">
          <BookOpen className="w-4 h-4 mr-2" />
          Semua
        </TabsTrigger>
        <TabsTrigger value="getting-started">
          <Rocket className="w-4 h-4 mr-2" />
          Mulai
        </TabsTrigger>
        <TabsTrigger value="features">
          <Zap className="w-4 h-4 mr-2" />
          Fitur
        </TabsTrigger>
        <TabsTrigger value="faq">
          <HelpCircle className="w-4 h-4 mr-2" />
          FAQ
        </TabsTrigger>
        <TabsTrigger value="video">
          <Video className="w-4 h-4 mr-2" />
          Video
        </TabsTrigger>
      </TabsList>

      {/* All Guides */}
      <TabsContent value="all" className="space-y-6 mt-6">
        
        {/* Quick Start Section */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            🚀 Quick Start
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickStartGuides.map((guide) => (
              <motion.div
                key={guide.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => openGuide(guide.id)}
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                  {guide.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                  {guide.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {guide.description}
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {guide.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {guide.views}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Guides */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            ⚡ Panduan Fitur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureGuides.map((guide) => (
              <motion.div
                key={guide.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => openGuide(guide.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    {guide.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <Badge variant="secondary">{guide.category}</Badge>
                      <span>{guide.articles} artikel</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            ❓ Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-800 px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-neutral-600 dark:text-neutral-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Video Tutorials */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            🎥 Video Tutorial
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoTutorials.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => playVideo(video.id)}
              >
                <div className="relative aspect-video bg-neutral-200 dark:bg-neutral-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-neutral-900 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                    {video.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {video.views}
                    </span>
                    <span>{video.uploadDate}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Help Center CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl p-8 text-white text-center"
        >
          <HelpCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">
            Butuh Bantuan Lebih Lanjut?
          </h3>
          <p className="text-white/90 mb-4">
            Tim support kami siap membantu Anda 24/7
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.visit('/admin/help')}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Hubungi Support
          </Button>
        </motion.div>
      </TabsContent>

      {/* Other tab contents... */}
    </Tabs>
  </div>
</div>
```

### Key Changes
- ✅ Search bar untuk cari panduan
- ✅ Category tabs untuk navigasi
- ✅ Grid 3 kolom untuk quick start
- ✅ Grid 2 kolom untuk feature guides
- ✅ Accordion untuk FAQ
- ✅ Video thumbnails dengan play button
- ✅ CTA section untuk help center
- ✅ Consistent card styling
- ✅ Hover effects dan animations



---

## 📐 LAYOUT REFERENCE GUIDE

### Container Width Standards
```tsx
// Use these container widths consistently
const CONTAINERS = {
  // Full width - untuk dashboard, monitoring
  full: "w-full px-6",
  
  // Standard - untuk most admin pages (1280px)
  standard: "max-w-7xl mx-auto px-6",
  
  // Narrow - untuk forms, tugas (1024px)
  narrow: "max-w-5xl mx-auto px-6",
  
  // Form - untuk settings, profile (768px)
  form: "max-w-3xl mx-auto px-6",
}
```

### Grid Layouts
```tsx
// Stats Cards
stats_2x2: "grid grid-cols-1 md:grid-cols-2 gap-6"
stats_4x4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

// Content Cards
cards_2_col: "grid grid-cols-1 md:grid-cols-2 gap-6"
cards_3_col: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// List Items
single_row: "space-y-4"
```

### Button Placement
```tsx
// Center button (untuk tambah data)
<div className="flex justify-center py-8">
  <Button size="lg">Tambah Data</Button>
</div>

// Right button (untuk actions)
<div className="flex justify-end">
  <Button>Action</Button>
</div>

// Between (header dengan action)
<div className="flex items-center justify-between">
  <h1>Title</h1>
  <Button>Action</Button>
</div>
```

### Card Styling
```tsx
// Standard card
className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-200 dark:border-neutral-800"

// Hover card
className="... hover:shadow-lg transition-all duration-300"

// Interactive card
className="... cursor-pointer hover:scale-[1.02]"
```

---

## 🎨 COLOR SYSTEM

### Background Colors (HITAM Theme)
```tsx
// Page background
bg-neutral-50 dark:bg-neutral-900

// Container/Card background
bg-white/50 dark:bg-neutral-900/50

// Solid card
bg-white dark:bg-neutral-800

// Section background
bg-neutral-50 dark:bg-neutral-900
```

### Icon Background Colors
```tsx
// Success/Emerald
bg-emerald-100 dark:bg-emerald-900/30
text-emerald-600 dark:text-emerald-400

// Info/Blue
bg-blue-100 dark:bg-blue-900/30
text-blue-600 dark:text-blue-400

// Warning/Yellow
bg-yellow-100 dark:bg-yellow-900/30
text-yellow-600 dark:text-yellow-400

// Danger/Red
bg-red-100 dark:bg-red-900/30
text-red-600 dark:text-red-400

// Purple
bg-purple-100 dark:bg-purple-900/30
text-purple-600 dark:text-purple-400

// Neutral
bg-neutral-100 dark:bg-neutral-800
text-neutral-600 dark:text-neutral-400
```

### Text Colors
```tsx
// Primary text
text-neutral-900 dark:text-white

// Secondary text
text-neutral-600 dark:text-neutral-400

// Muted text
text-neutral-500 dark:text-neutral-500
```

---

## 🔄 ANIMATION STANDARDS

### Page Entry Animation
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Header content */}
</motion.div>
```

### Card Entry Animation
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
  {/* Card content */}
</motion.div>
```

### Hover Animation
```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  {/* Interactive card */}
</motion.div>
```

### Button Animation
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

---

## 📋 IMPLEMENTATION CHECKLIST

### For Each Menu Fix:

#### 1. Jadwal Sesi Absen
- [ ] Change container to `max-w-7xl`
- [ ] Add center button with `flex justify-center py-8`
- [ ] Use `size="lg"` for button
- [ ] Add shadow and hover effects
- [ ] Test responsive layout

#### 2. Informasi Tugas
- [ ] Change container to `max-w-5xl`
- [ ] Change stats grid to 2x2
- [ ] Center the "Tambah Tugas" button
- [ ] Reduce card width
- [ ] Test form layout

#### 3. Voting Kas
- [ ] Copy dashboard card structure
- [ ] Change to 2x2 grid
- [ ] Add icon backgrounds
- [ ] Match animation delays
- [ ] Test consistency with dashboard

#### 4. Leaderboard
- [ ] Change to single row cards (`space-y-4`)
- [ ] Add horizontal layout with `flex justify-between`
- [ ] Add rank badges with gradients
- [ ] Add crown icon for #1
- [ ] Test with long names

#### 5. Rekap Kehadiran
- [ ] Change stats to 2x2 grid
- [ ] Create centered export section
- [ ] Add icon and description
- [ ] Add both PDF and Excel buttons
- [ ] Test export functionality

#### 6. Fraud Detection
- [ ] Change to 2x2 grid
- [ ] Add color-coded icons
- [ ] Add contextual stats
- [ ] Match card styling
- [ ] Test anomaly display

#### 7. Aktivitas Terbaru
- [ ] Change to single row (`space-y-4`)
- [ ] Add timeline-style layout
- [ ] Add activity type icons
- [ ] Add metadata in one line
- [ ] Test with many activities

#### 8. Panduan
- [ ] Add search bar
- [ ] Add category tabs
- [ ] Create 3-column quick start grid
- [ ] Create 2-column feature grid
- [ ] Add FAQ accordion
- [ ] Add video thumbnails
- [ ] Add CTA section
- [ ] Test all interactions

---

## 🧪 TESTING GUIDE

### Visual Testing
```bash
# Test each menu in browser
1. Desktop (1920x1080)
2. Laptop (1366x768)
3. Tablet (768x1024)
4. Mobile (375x667)
```

### Checklist per Menu
```
✅ Container width sesuai
✅ Grid layout benar (2x2, 3x3, atau 1 baris)
✅ Button placement tepat
✅ Colors konsisten (HITAM theme)
✅ Animations smooth
✅ Hover effects work
✅ Responsive di semua device
✅ Dark mode work
✅ No horizontal scroll
✅ Spacing konsisten
```

### Performance Testing
```tsx
// Check animation performance
- No lag on hover
- Smooth transitions
- No layout shift
- Fast initial render
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Backup Current Files
```bash
# Backup files yang akan diubah
cp resources/js/pages/admin/jadwal.tsx resources/js/pages/admin/jadwal.tsx.backup
cp resources/js/pages/dosen/tugas.tsx resources/js/pages/dosen/tugas.tsx.backup
# ... backup semua files
```

### Step 2: Apply Changes
```bash
# Apply changes satu per satu
# Test setiap perubahan sebelum lanjut ke next
```

### Step 3: Test Each Menu
```bash
# Start dev server
npm run dev

# Test di browser
# Check console for errors
# Test all interactions
```

### Step 4: Build for Production
```bash
# Build assets
npm run build

# Test production build
php artisan serve
```

### Step 5: Deploy
```bash
# Commit changes
git add .
git commit -m "fix: admin UI layout improvements"

# Deploy to production
git push origin main
```

---

## 📝 NOTES & BEST PRACTICES

### DO's ✅
- Use consistent container widths
- Follow grid layout standards
- Use HITAM theme colors only
- Add smooth animations
- Test responsive layout
- Use semantic HTML
- Add proper ARIA labels
- Optimize images
- Use lazy loading for heavy content

### DON'Ts ❌
- Don't use navy/blue container colors
- Don't make containers too wide
- Don't use inconsistent spacing
- Don't forget dark mode
- Don't skip responsive testing
- Don't use inline styles
- Don't forget accessibility
- Don't use heavy animations

### Performance Tips
```tsx
// Use memo for heavy components
const HeavyCard = memo(({ data }) => {
  // Component logic
})

// Use lazy loading for images
<img loading="lazy" src={image} alt={alt} />

// Use virtual scrolling for long lists
import { VirtualList } from '@/components/ui/virtual-list'
```

### Accessibility Tips
```tsx
// Add proper labels
<Button aria-label="Tambah Jadwal">
  <Plus />
</Button>

// Add keyboard navigation
onKeyDown={(e) => {
  if (e.key === 'Enter') handleClick()
}}

// Add focus styles
focus:ring-2 focus:ring-emerald-500
```

---

## 🎯 SUCCESS CRITERIA

### Layout
```
✅ All containers use standard widths
✅ All grids follow 2x2 or 3x3 pattern
✅ All buttons properly placed
✅ All cards have consistent styling
✅ All spacing is uniform
```

### Visual
```
✅ HITAM theme colors throughout
✅ Smooth animations on all interactions
✅ Proper hover effects
✅ Dark mode works perfectly
✅ Icons properly sized and colored
```

### Responsive
```
✅ Works on desktop (1920px)
✅ Works on laptop (1366px)
✅ Works on tablet (768px)
✅ Works on mobile (375px)
✅ No horizontal scroll
```

### Performance
```
✅ Page loads < 2 seconds
✅ Animations run at 60fps
✅ No layout shift
✅ Images optimized
✅ Bundle size reasonable
```

### User Experience
```
✅ Easy to navigate
✅ Clear visual hierarchy
✅ Intuitive interactions
✅ Fast response time
✅ Accessible to all users
```

---

**Created**: February 24, 2026  
**Purpose**: Fix admin UI/UX layout consistency  
**Status**: Ready for implementation  
**Estimated Time**: 4-6 hours for all fixes  
**Priority**: High - UI/UX consistency critical
