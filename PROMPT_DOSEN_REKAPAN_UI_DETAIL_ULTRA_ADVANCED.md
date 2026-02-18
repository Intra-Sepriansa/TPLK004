# 🎨 UI/UX DETAIL SPECIFICATION - DAFTAR KEHADIRAN MAHASISWA
## Berdasarkan Screenshot Real System

---

## 📸 ANALISIS SCREENSHOT

Berdasarkan screenshot yang diberikan, berikut adalah breakdown detail setiap elemen UI:

---

## 🎯 HEADER CARD - "Daftar Kehadiran"

### Visual Design
```typescript
interface HeaderCard {
  background: 'gradient-to-br from-blue-600 via-indigo-600 to-purple-700';
  borderRadius: '24px';
  padding: '32px';
  shadow: 'shadow-2xl shadow-blue-500/20';
  backdropBlur: 'backdrop-blur-xl';
  border: '1px solid rgba(255,255,255,0.1)';
}
```

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  📄 Icon    Daftar Kehadiran                    [1 data]    │
│             MACHINE LEARNING — Pertemuan 1 • 18 Feb 2026    │
└─────────────────────────────────────────────────────────────┘
```

### Komponen Detail

#### 1. Icon Container (Kiri)
**Specifications:**
- Size: 48px × 48px
- Background: `bg-white/20 backdrop-blur-md`
- Border: `border border-white/30`
- Border Radius: `rounded-2xl`
- Icon: Document/File icon
- Icon Color: `text-white`
- Icon Size: 24px
- Shadow: `shadow-lg shadow-white/10`

**Animation:**
```typescript
<motion.div
  whileHover={{ scale: 1.1, rotate: 5 }}
  transition={{ type: 'spring', stiffness: 300 }}
  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg"
>
  <FileText className="h-6 w-6 text-white" />
</motion.div>
```

#### 2. Title Section (Center)
**Primary Title:**
- Text: "Daftar Kehadiran"
- Font: `font-bold text-2xl`
- Color: `text-white`
- Letter Spacing: `tracking-tight`

**Subtitle:**
- Text: "MACHINE LEARNING — Pertemuan 1 • 18 Feb 2026"
- Font: `font-medium text-sm`
- Color: `text-white/70`
- Format: `[MATA KULIAH] — Pertemuan [NUMBER] • [DATE]`

**Typography Hierarchy:**
```css
.header-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
}

.header-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}
```

#### 3. Badge Counter (Kanan)
**Specifications:**
- Text: "1 data"
- Background: `bg-white/20 backdrop-blur-md`
- Border: `border border-white/30`
- Padding: `px-4 py-2`
- Border Radius: `rounded-full`
- Font: `text-sm font-semibold`
- Color: `text-white`

**Dynamic Counter:**
```typescript
interface DataBadge {
  count: number;
  label: string;
}

const DataBadge = ({ count, label }: DataBadge) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 border border-white/30"
  >
    <AnimatedCounter value={count} />
    <span className="text-sm font-semibold text-white">{label}</span>
  </motion.div>
);
```

---

## 📊 DATA TABLE - Detailed Breakdown

### Table Container
```typescript
interface TableContainer {
  background: 'bg-white dark:bg-neutral-900';
  borderRadius: '24px';
  border: '1px solid rgba(0,0,0,0.05) dark:border-white/5';
  shadow: 'shadow-xl';
  overflow: 'overflow-hidden';
}
```

### Table Header Row
**Background:** `bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900/80 dark:to-neutral-800/80`

**Sticky Header:**
```css
thead {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
}
```

### Column Specifications (Berdasarkan Screenshot)

#### Column 1: NO
- **Width:** `60px` (fixed)
- **Alignment:** `text-center`
- **Font:** `font-bold text-sm`
- **Color:** `text-neutral-900 dark:text-white`
- **Background:** `bg-neutral-100 dark:bg-neutral-800`
- **Sticky:** `sticky left-0`

**Cell Content:**
```typescript
<td className="px-4 py-3 text-center font-bold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-900 sticky left-0">
  {index + 1}
</td>
```

#### Column 2: NIM
- **Width:** `140px`
- **Alignment:** `text-left`
- **Font:** `font-mono text-sm`
- **Color:** `text-neutral-700 dark:text-neutral-300`
- **Format:** 10 digits (e.g., "2310114004463")

**Real Data Example:**
```
2310114004463
```

**Cell with Copy Feature:**
```typescript
<td className="px-4 py-3">
  <div className="flex items-center gap-2">
    <span className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
      {mahasiswa.nim}
    </span>
    <button
      onClick={() => copyToClipboard(mahasiswa.nim)}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Copy className="h-3 w-3 text-neutral-400 hover:text-neutral-600" />
    </button>
  </div>
</td>
```

#### Column 3: NAMA MAHASISWA
- **Width:** `flex-1` (expandable)
- **Alignment:** `text-left`
- **Font:** `font-semibold text-sm`
- **Color:** `text-neutral-900 dark:text-white`

**Real Data Example:**
```
INTRA SEPRIANSA
```

**With Avatar:**
```typescript
<td className="px-4 py-3">
  <div className="flex items-center gap-3">
    {/* Avatar */}
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg">
      {mahasiswa.nama.charAt(0)}
    </div>
    
    {/* Name & Badge */}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
        {mahasiswa.nama}
      </p>
      <div className="flex items-center gap-1 mt-0.5">
        <GraduationCap className="h-3 w-3 text-blue-500" />
        <span className="text-xs text-neutral-500">
          {mahasiswa.prodi}
        </span>
      </div>
    </div>
  </div>
</td>
```

**Prodi Badge (dari screenshot):**
- Icon: 🎓 (Graduation Cap)
- Text: "Teknik Informatika"
- Font: `text-xs`
- Color: `text-neutral-500 dark:text-neutral-400`

#### Column 4: KELAS
- **Width:** `100px`
- **Alignment:** `text-center`
- **Font:** `font-medium text-sm`
- **Color:** `text-neutral-700 dark:text-neutral-300`

**Real Data Example:**
```
TI-6A
```

**Badge Style:**
```typescript
<td className="px-4 py-3 text-center">
  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
    {mahasiswa.kelas}
  </span>
</td>
```

#### Column 5: JENIS
- **Width:** `120px`
- **Alignment:** `text-center`
- **Font:** `font-medium text-sm`

**Real Data Example:**
```
Reguler A
```

**Badge Variants:**
```typescript
const jenisConfig = {
  'Reguler A': {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle
  },
  'Reguler B': {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    icon: CheckCircle
  },
  'Karyawan': {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    icon: Briefcase
  }
};
```

#### Column 6: SMT (Semester)
- **Width:** `80px`
- **Alignment:** `text-center`
- **Font:** `font-bold text-lg`

**Real Data Example:**
```
5
```

**Visual Design:**
```typescript
<td className="px-4 py-3 text-center">
  <div className="flex flex-col items-center">
    <span className="text-2xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      {mahasiswa.semester}
    </span>
    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
      Semester
    </span>
  </div>
</td>
```

**Color Gradient by Semester:**
```typescript
const semesterGradient = {
  1: 'from-green-500 to-emerald-600',
  2: 'from-blue-500 to-cyan-600',
  3: 'from-indigo-500 to-blue-600',
  4: 'from-purple-500 to-indigo-600',
  5: 'from-pink-500 to-purple-600',
  6: 'from-red-500 to-pink-600',
  7: 'from-orange-500 to-red-600',
  8: 'from-amber-500 to-orange-600',
};
```

#### Column 7: STATUS
- **Width:** `120px`
- **Alignment:** `text-center`

**Real Data Example:**
```
✓ Hadir
```

**Status Badge Design:**
```typescript
const statusConfig = {
  present: {
    icon: CheckCircle,
    label: 'Hadir',
    bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    text: 'text-white',
    ring: 'ring-2 ring-emerald-500/20',
    glow: 'shadow-lg shadow-emerald-500/30'
  },
  late: {
    icon: Clock,
    label: 'Terlambat',
    bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    text: 'text-white',
    ring: 'ring-2 ring-amber-500/20',
    glow: 'shadow-lg shadow-amber-500/30'
  },
  absent: {
    icon: XCircle,
    label: 'Tidak Hadir',
    bg: 'bg-gradient-to-r from-red-500 to-rose-500',
    text: 'text-white',
    ring: 'ring-2 ring-red-500/20',
    glow: 'shadow-lg shadow-red-500/30'
  }
};

// Component
<td className="px-4 py-3 text-center">
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs",
      statusConfig[status].bg,
      statusConfig[status].text,
      statusConfig[status].ring,
      statusConfig[status].glow
    )}
  >
    <statusConfig[status].icon className="h-3.5 w-3.5" />
    {statusConfig[status].label}
  </motion.div>
</td>
```

#### Column 8: WAKTU
- **Width:** `140px`
- **Alignment:** `text-center`
- **Font:** `font-mono text-sm`

**Real Data Example:**
```
10:43:58
📅 18/02/2026
```

**Time Display:**
```typescript
<td className="px-4 py-3">
  <div className="flex flex-col items-center gap-1">
    {/* Time */}
    <div className="flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5 text-neutral-400" />
      <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
        {formatTime(log.scanned_at)} {/* 10:43:58 */}
      </span>
    </div>
    
    {/* Date */}
    <div className="flex items-center gap-1">
      <Calendar className="h-3 w-3 text-neutral-400" />
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {formatDate(log.scanned_at)} {/* 18/02/2026 */}
      </span>
    </div>
  </div>
</td>
```

**Relative Time Tooltip:**
```typescript
<Tooltip content="2 jam yang lalu">
  <span className="cursor-help">10:43:58</span>
</Tooltip>
```

---

## 🎨 COLOR PALETTE (Dark Mode Support)

### Primary Colors
```css
:root {
  /* Light Mode */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  /* Neutral */
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-900: #171717;
  
  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}

.dark {
  /* Dark Mode Overrides */
  --bg-primary: #0a0a0a;
  --bg-secondary: #171717;
  --text-primary: #ffffff;
  --text-secondary: #a3a3a3;
}
```

### Gradient Presets
```typescript
const gradients = {
  header: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
  error: 'bg-gradient-to-r from-red-500 to-rose-500',
  info: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  premium: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
};
```

---

## 🎭 ANIMATIONS & TRANSITIONS

### Table Row Hover Effect
```typescript
<motion.tr
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.05 }}
  whileHover={{
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    scale: 1.01,
    transition: { duration: 0.2 }
  }}
  className="group cursor-pointer border-b border-neutral-100 dark:border-neutral-800"
>
```

### Status Badge Animation
```typescript
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{
    type: 'spring',
    stiffness: 260,
    damping: 20,
    delay: index * 0.1
  }}
>
  {/* Badge content */}
</motion.div>
```

### Loading Skeleton
```typescript
const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse">
        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Mobile View (<768px)
```typescript
// Stack columns vertically
<div className="md:hidden">
  {attendanceLogs.map(log => (
    <motion.div
      key={log.id}
      className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-3"
    >
      {/* Avatar & Name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
          {log.mahasiswa.nama.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-neutral-900 dark:text-white">
            {log.mahasiswa.nama}
          </p>
          <p className="text-xs text-neutral-500 font-mono">
            {log.mahasiswa.nim}
          </p>
        </div>
      </div>
      
      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-neutral-500">Kelas:</span>
          <span className="ml-2 font-medium">{log.mahasiswa.kelas}</span>
        </div>
        <div>
          <span className="text-neutral-500">Semester:</span>
          <span className="ml-2 font-medium">{log.mahasiswa.semester}</span>
        </div>
        <div className="col-span-2">
          <span className="text-neutral-500">Status:</span>
          <span className="ml-2">{getStatusBadge(log.status)}</span>
        </div>
        <div className="col-span-2">
          <span className="text-neutral-500">Waktu:</span>
          <span className="ml-2 font-mono">{formatTime(log.scanned_at)}</span>
        </div>
      </div>
    </motion.div>
  ))}
</div>
```

---

## 🔍 SEARCH & FILTER UI

### Search Bar
```typescript
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
  <Input
    type="text"
    placeholder="Cari nama, NIM, atau kelas..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-12 pr-4 py-3 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
  />
  {searchQuery && (
    <button
      onClick={() => setSearchQuery('')}
      className="absolute right-4 top-1/2 -translate-y-1/2"
    >
      <X className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
    </button>
  )}
</div>
```

### Filter Chips
```typescript
const filters = [
  { id: 'all', label: 'Semua', count: stats.total },
  { id: 'present', label: 'Hadir', count: stats.hadir, color: 'emerald' },
  { id: 'late', label: 'Terlambat', count: stats.terlambat, color: 'amber' },
  { id: 'absent', label: 'Tidak Hadir', count: stats.tidak_hadir, color: 'red' },
];

<div className="flex flex-wrap gap-2">
  {filters.map(filter => (
    <motion.button
      key={filter.id}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveFilter(filter.id)}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all",
        activeFilter === filter.id
          ? `bg-${filter.color}-500 text-white shadow-lg shadow-${filter.color}-500/30`
          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      )}
    >
      {filter.label}
      <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
        {filter.count}
      </span>
    </motion.button>
  ))}
</div>
```

---

## 🎯 INTERACTIVE FEATURES

### Row Actions Menu
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem onClick={() => viewDetails(log)}>
      <Eye className="h-4 w-4 mr-2" />
      Lihat Detail
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => viewSelfie(log)}>
      <Image className="h-4 w-4 mr-2" />
      Lihat Selfie
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => editStatus(log)} className="text-amber-600">
      <Edit className="h-4 w-4 mr-2" />
      Edit Status
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => deleteLog(log)} className="text-red-600">
      <Trash className="h-4 w-4 mr-2" />
      Hapus
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Bulk Selection
```typescript
const [selectedIds, setSelectedIds] = useState<number[]>([]);

// Select All Checkbox
<Checkbox
  checked={selectedIds.length === filteredLogs.length}
  onCheckedChange={(checked) => {
    if (checked) {
      setSelectedIds(filteredLogs.map(log => log.id));
    } else {
      setSelectedIds([]);
    }
  }}
/>

// Bulk Actions Bar
{selectedIds.length > 0 && (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl shadow-2xl p-4 flex items-center gap-4"
  >
    <span className="font-semibold">
      {selectedIds.length} dipilih
    </span>
    <div className="h-6 w-px bg-white/20" />
    <Button size="sm" variant="ghost" onClick={handleBulkExport}>
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
    <Button size="sm" variant="ghost" onClick={handleBulkDelete}>
      <Trash className="h-4 w-4 mr-2" />
      Hapus
    </Button>
    <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
      <X className="h-4 w-4" />
    </Button>
  </motion.div>
)}
```

---

## 📊 EMPTY STATE

```typescript
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <FileSearch className="h-24 w-24 text-neutral-300 dark:text-neutral-700 mb-4" />
    </motion.div>
    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
      Tidak Ada Data Kehadiran
    </h3>
    <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md mb-6">
      Belum ada mahasiswa yang melakukan absensi untuk sesi ini. 
      Pastikan QR code sudah dibagikan kepada mahasiswa.
    </p>
    <Button onClick={() => router.visit('/dosen/sessions/create')}>
      <Plus className="h-4 w-4 mr-2" />
      Buat Sesi Baru
    </Button>
  </motion.div>
);
```

---

## 🎨 GLASSMORPHISM EFFECTS

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.dark .glass-card {
  background: rgba(23, 23, 23, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}
```

---

**Document Version:** 2.0.0  
**Last Updated:** 18 Februari 2026  
**Based On:** Real Screenshot Analysis  
**Status:** Production Ready
