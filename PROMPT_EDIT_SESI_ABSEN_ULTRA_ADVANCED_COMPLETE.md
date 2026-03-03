# 🎯 PROMPT ULTRA ADVANCED: EDIT SESI ABSEN - ADMIN PANEL

## 📋 OVERVIEW PENGEMBANGAN

Ini adalah pengembangan KRUSIAL dan PENTING untuk menu **Edit Sesi Absen** di Admin Panel. Menu ini memerlukan perhatian serius dengan standar kualitas tertinggi, mengikuti pola desain yang sudah ada di Dashboard Admin dengan inovasi pengembangan yang sangat signifikan.

---

## 🎨 DESIGN SYSTEM & UI/UX GUIDELINES

### 1. COLOR PALETTE & THEME CONSISTENCY
**Warna harus 100% matching dengan Dashboard Admin:**

```typescript
// Primary Gradient (Header & CTA)
const headerGradient = "from-indigo-600 via-purple-600 to-pink-500"
const ctaGradient = "from-pink-600 to-purple-600"

// Background System
const modalBackground = "bg-[#0A0A0B]" // Dark base
const glassBackground = "bg-white/5 border-white/10" // Glass morphism
const overlayBackground = "bg-black/80 backdrop-blur-xl"

// Status Colors
const statusColors = {
  active: "from-emerald-400 to-teal-600",
  warning: "from-amber-400 to-orange-600",
  error: "from-rose-400 to-pink-600",
  info: "from-sky-400 to-indigo-600"
}
```

### 2. TYPOGRAPHY SYSTEM

**Konsistensi penulisan yang rapi dan 1 tema:**

```typescript
// Header Titles
const headerTitle = "text-3xl font-extrabold text-white tracking-tight drop-shadow-md"
const headerSubtitle = "text-white/80 mt-1.5 font-medium text-base drop-shadow"

// Form Labels
const formLabel = "text-sm font-bold text-gray-300 tracking-wide uppercase"

// Input Fields
const inputStyle = "text-white placeholder-gray-500 focus:text-white"

// Button Text
const buttonText = "text-base font-bold" // Konsisten di semua tombol
```

### 3. CONTAINER & SPACING SYSTEM

**Hapus container di icon header:**
- Icon header harus langsung tanpa wrapper container tambahan
- Gunakan `relative flex shrink-0` langsung pada wrapper img

**Spacing yang konsisten:**
```typescript
const spacing = {
  modal: "p-8 sm:p-10", // Padding modal
  section: "space-y-8", // Antar section
  field: "space-y-2", // Label ke input
  grid: "gap-6", // Grid gap
  button: "gap-4 pt-6" // Button group
}
```

---

## 🚀 KOMPONEN UTAMA YANG HARUS DIPERBAIKI

### 1. MODAL HEADER - ULTRA ADVANCED DESIGN

**HAPUS:**
- ❌ Container wrapper pada icon header
- ❌ Animasi icon yang bergerak-gerak ke atas (floating animation)
- ❌ Pulse animation yang berlebihan

**TAMBAHKAN:**
```tsx
{/* Header - Clean & Professional */}
<div className="relative overflow-hidden p-8 sm:p-10">
  {/* Animated Background - Matching Dashboard */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    style={{ backgroundSize: '200% 200%' }}
  />
  
  {/* Subtle Overlays */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/60" />
  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
  <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />

  {/* Content */}
  <div className="relative flex items-start justify-between z-10">
    <div className="flex items-center gap-6">
      {/* Icon - NO CONTAINER, NO FLOATING ANIMATION */}
      <motion.div
        className="relative shrink-0"
        whileHover={{ scale: 1.05, rotate: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <img 
          src={EditSesiIcon} 
          alt="Edit Sesi" 
          className="h-20 w-20 object-contain drop-shadow-2xl pointer-events-none" 
        />
      </motion.div>
      
      {/* Text Content */}
      <div>
        <h3 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          Edit Sesi Absen
        </h3>
        <p className="text-white/80 mt-1.5 font-medium text-base drop-shadow">
          Perbarui informasi sesi absensi dengan lengkap dan akurat
        </p>
      </div>
    </div>
    
    {/* Close Button */}
    <motion.button
      type="button"
      onClick={() => { setShowEditModal(false); setEditSession(null); }}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
    >
      <X className="h-5 w-5 text-white" />
    </motion.button>
  </div>
</div>
```

### 2. FORM FIELDS - ENHANCED UX

**Input Field dengan Icon yang Matching:**

```tsx
{/* Mata Kuliah Field - Locked dengan Visual Feedback */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="space-y-2"
>
  <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase">
    Mata Kuliah
  </label>
  <div className="relative">
    <motion.select
      value={editForm.data.course_id}
      disabled
      className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white/60 appearance-none cursor-not-allowed shadow-inner"
      required
    >
      {courses.map(c => (
        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
          {c.nama}
        </option>
      ))}
    </motion.select>
    
    {/* Lock Icon - Matching Container Color */}
    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
      <div className="w-5 h-5 flex items-center justify-center text-white/30">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
    </div>
  </div>
  <p className="text-xs text-gray-500 italic">
    Mata kuliah tidak dapat diubah setelah sesi dibuat
  </p>
</motion.div>

{/* Pertemuan Ke - dengan Icon */}
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.2 }}
  className="space-y-2"
>
  <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase">
    <span className="flex items-center gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
      Pertemuan Ke
    </span>
  </label>
  <motion.input
    type="number"
    min="1"
    max="21"
    value={editForm.data.meeting_number}
    onChange={e => editForm.setData('meeting_number', parseInt(e.target.value))}
    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner"
    required
    whileFocus={{ scale: 1.01 }}
  />
  <p className="text-xs text-gray-500">
    Masukkan nomor pertemuan (1-21)
  </p>
</motion.div>
```

### 3. RESPONSIVE DESIGN - MOBILE OPTIMIZATION

**Mobile-First Approach seperti Dashboard:**

```tsx
{/* Modal Container - Responsive */}
<motion.div
  className="relative w-full max-w-2xl mx-4 sm:mx-auto"
  initial={{ scale: 0.8, y: 50, opacity: 0 }}
  animate={{ scale: 1, y: 0, opacity: 1 }}
  exit={{ scale: 0.8, y: 50, opacity: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  onClick={(e) => e.stopPropagation()}
>
  <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#0A0A0B] border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
    
    {/* Header - Responsive Padding & Layout */}
    <div className="relative overflow-hidden p-6 sm:p-8 md:p-10">
      <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0 z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Icon - Smaller on Mobile */}
          <motion.div className="relative shrink-0">
            <img 
              src={EditSesiIcon} 
              alt="Edit Sesi" 
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-2xl" 
            />
          </motion.div>
          
          {/* Text - Center on Mobile */}
          <div className="text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              Edit Sesi Absen
            </h3>
            <p className="text-white/80 mt-1 sm:mt-1.5 font-medium text-sm sm:text-base drop-shadow">
              Perbarui informasi sesi absensi
            </p>
          </div>
        </div>
        
        {/* Close Button - Absolute on Mobile */}
        <motion.button
          type="button"
          onClick={() => { setShowEditModal(false); setEditSession(null); }}
          className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </motion.button>
      </div>
    </div>

    {/* Form Body - Responsive Padding */}
    <form onSubmit={handleUpdate} className="relative p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8 bg-black/40 backdrop-blur-2xl">
      {/* Grid - Stack on Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Fields here */}
      </div>
      
      {/* Buttons - Stack on Mobile */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-white/10 mt-6 sm:mt-8">
        <motion.button
          type="button"
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm sm:text-base font-bold transition-all order-2 sm:order-1"
        >
          Batal
        </motion.button>
        <motion.button
          type="submit"
          className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm sm:text-base font-bold shadow-xl order-1 sm:order-2"
        >
          Simpan Perubahan
        </motion.button>
      </div>
    </form>
  </div>
</motion.div>
```

---

## 🎭 ANIMATION GUIDELINES

### 1. HAPUS Animasi yang Berlebihan

**HAPUS:**
- ❌ Icon floating animation (bergerak naik-turun)
- ❌ Pulse animation yang terlalu banyak
- ❌ Animasi yang mengganggu fokus user

**PERTAHANKAN:**
- ✅ Background gradient animation (smooth & subtle)
- ✅ Hover effects pada button dan input
- ✅ Modal entrance/exit animation
- ✅ Focus animation pada input fields

### 2. Animasi yang Direkomendasikan

```tsx
// Modal Entrance
const modalVariants = {
  hidden: { scale: 0.8, y: 50, opacity: 0 },
  visible: { 
    scale: 1, 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { scale: 0.8, y: 50, opacity: 0 }
}

// Field Stagger Animation
const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 }
  })
}

// Button Hover
const buttonHover = {
  scale: 1.02,
  y: -2,
  transition: { type: "spring", stiffness: 400, damping: 15 }
}

// Input Focus
const inputFocus = {
  scale: 1.01,
  transition: { duration: 0.2 }
}
```

---

## 📝 FORM VALIDATION & UX ENHANCEMENTS

### 1. Real-time Validation

```tsx
// Validation States
const [errors, setErrors] = useState({
  meeting_number: '',
  start_at: '',
  end_at: '',
  title: ''
})

// Validation Functions
const validateMeetingNumber = (value: number) => {
  if (value < 1 || value > 21) {
    return 'Nomor pertemuan harus antara 1-21'
  }
  return ''
}

const validateDateTime = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  if (endDate <= startDate) {
    return 'Waktu selesai harus setelah waktu mulai'
  }
  
  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
  if (duration < 30) {
    return 'Durasi minimal 30 menit'
  }
  if (duration > 240) {
    return 'Durasi maksimal 4 jam'
  }
  
  return ''
}

// Error Display Component
const ErrorMessage = ({ message }: { message: string }) => (
  <motion.p
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="text-xs text-red-400 mt-1 flex items-center gap-1"
  >
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    {message}
  </motion.p>
)
```

### 2. Success Feedback

```tsx
// Success State
const [showSuccess, setShowSuccess] = useState(false)

// Success Animation
{showSuccess && (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-50 rounded-[2.5rem]"
  >
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center"
      >
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <h4 className="text-2xl font-bold text-white mb-2">Berhasil!</h4>
      <p className="text-gray-400">Sesi absen berhasil diperbarui</p>
    </div>
  </motion.div>
)}
```

---

## 🎯 INOVASI PENGEMBANGAN SIGNIFIKAN

### 1. SMART TIME PICKER

**Fitur Auto-Calculate Duration:**

```tsx
// Duration Calculator Component
const DurationDisplay = ({ startAt, endAt }: { startAt: string; endAt: string }) => {
  const calculateDuration = () => {
    if (!startAt || !endAt) return null
    
    const start = new Date(startAt)
    const end = new Date(endAt)
    const diff = end.getTime() - start.getTime()
    
    if (diff <= 0) return null
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return { hours, minutes, total: diff / (1000 * 60) }
  }
  
  const duration = calculateDuration()
  
  if (!duration) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-300">Durasi Sesi</span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">
            {duration.hours > 0 && `${duration.hours} jam `}
            {duration.minutes} menit
          </p>
          <p className="text-xs text-gray-500">
            {duration.total < 30 && '⚠️ Minimal 30 menit'}
            {duration.total > 240 && '⚠️ Maksimal 4 jam'}
            {duration.total >= 30 && duration.total <= 240 && '✓ Durasi valid'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
```

### 2. QUICK TIME PRESETS

**Tombol cepat untuk durasi umum:**

```tsx
const TimePresets = ({ onSelect }: { onSelect: (minutes: number) => void }) => {
  const presets = [
    { label: '30 menit', value: 30, icon: '⚡' },
    { label: '1 jam', value: 60, icon: '📚' },
    { label: '1.5 jam', value: 90, icon: '📖' },
    { label: '2 jam', value: 120, icon: '🎓' },
  ]
  
  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-2">Preset Durasi:</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <motion.button
            key={preset.value}
            type="button"
            onClick={() => onSelect(preset.value)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-1">{preset.icon}</span>
            {preset.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
```

### 3. CHANGE HISTORY INDICATOR

**Tampilkan perubahan yang dilakukan:**

```tsx
const ChangeIndicator = ({ field, oldValue, newValue }: any) => {
  if (oldValue === newValue) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
    >
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-amber-400">Perubahan terdeteksi</p>
          <div className="mt-1 space-y-1">
            <p className="text-xs text-gray-400 line-through">{oldValue}</p>
            <p className="text-xs text-white font-medium">→ {newValue}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

### 4. KEYBOARD SHORTCUTS

**Tambahkan keyboard shortcuts untuk efisiensi:**

```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + Enter = Submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleUpdate(e as any)
    }
    
    // Escape = Close
    if (e.key === 'Escape') {
      setShowEditModal(false)
      setEditSession(null)
    }
  }
  
  if (showEditModal) {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }
}, [showEditModal])

// Keyboard Shortcuts Hint
const KeyboardHints = () => (
  <div className="mt-4 pt-4 border-t border-white/10">
    <p className="text-xs text-gray-500 mb-2">Pintasan Keyboard:</p>
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
          Ctrl + Enter
        </kbd>
        <span className="text-xs text-gray-500">Simpan</span>
      </div>
      <div className="flex items-center gap-2">
        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
          Esc
        </kbd>
        <span className="text-xs text-gray-500">Tutup</span>
      </div>
    </div>
  </div>
)
```

---

## 🔄 TOMBOL KEMBALI - MATCHING MENU LAIN

**Konsisten dengan menu lain di admin:**

```tsx
// Tombol Kembali - Tidak perlu di modal, tapi jika ada di page:
<motion.button
  whileHover={{ scale: 1.02, x: -2 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => router.visit('/admin/sesi-absen')}
  className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
>
  <ArrowLeft className="h-4 w-4" />
  Kembali ke Daftar Sesi
</motion.button>
```

---

## 📱 MOBILE RESPONSIVENESS CHECKLIST

### Breakpoints yang Harus Diperhatikan:

```typescript
// Mobile First Breakpoints
const breakpoints = {
  xs: '320px',  // Small phones
  sm: '640px',  // Large phones
  md: '768px',  // Tablets
  lg: '1024px', // Desktop
  xl: '1280px', // Large desktop
}
```

### Mobile Optimization:

**1. Modal Size:**
```tsx
// Mobile: Full width dengan margin kecil
// Desktop: Max-width 2xl
className="w-full max-w-2xl mx-4 sm:mx-auto"
```

**2. Header Layout:**
```tsx
// Mobile: Stack vertical, icon center
// Desktop: Horizontal, icon left
className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6"
```

**3. Form Grid:**
```tsx
// Mobile: 1 column
// Desktop: 2 columns
className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
```

**4. Button Group:**
```tsx
// Mobile: Stack vertical, full width
// Desktop: Horizontal, auto width
className="flex flex-col sm:flex-row gap-3 sm:gap-4"
```

**5. Typography Scale:**
```tsx
// Mobile: Smaller text
// Desktop: Larger text
className="text-2xl sm:text-3xl" // Headers
className="text-sm sm:text-base" // Body
className="text-xs sm:text-sm" // Small text
```

**6. Padding & Spacing:**
```tsx
// Mobile: Tighter spacing
// Desktop: More breathing room
className="p-6 sm:p-8 md:p-10" // Container
className="space-y-6 sm:space-y-8" // Sections
className="gap-4 sm:gap-6" // Grid gaps
```

---

## 🎨 ICON & VISUAL CONSISTENCY

### 1. Icon untuk Setiap Field

**Gunakan icon yang relevan dan matching dengan warna container:**

```tsx
const fieldIcons = {
  course: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "text-indigo-400"
  },
  meeting: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    color: "text-purple-400"
  },
  title: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    color: "text-pink-400"
  },
  time: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-emerald-400"
  }
}
```

### 2. Status Indicators

**Visual feedback untuk status field:**

```tsx
const FieldStatus = ({ status }: { status: 'idle' | 'valid' | 'invalid' | 'locked' }) => {
  const configs = {
    idle: { icon: null, color: '' },
    valid: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-emerald-400'
    },
    invalid: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      color: 'text-red-400'
    },
    locked: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'text-gray-400'
    }
  }
  
  const config = configs[status]
  if (!config.icon) return null
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`absolute right-3 top-1/2 -translate-y-1/2 ${config.color}`}
    >
      {config.icon}
    </motion.div>
  )
}
```

---

## 💾 DATA HANDLING & STATE MANAGEMENT

### 1. Form State dengan Validation

```tsx
const [formState, setFormState] = useState({
  values: {
    course_id: '',
    meeting_number: 1,
    title: '',
    start_at: '',
    end_at: '',
  },
  errors: {},
  touched: {},
  isValid: false,
  isDirty: false
})

// Track changes
const handleFieldChange = (field: string, value: any) => {
  setFormState(prev => ({
    ...prev,
    values: { ...prev.values, [field]: value },
    touched: { ...prev.touched, [field]: true },
    isDirty: true
  }))
  
  // Validate on change
  validateField(field, value)
}

// Unsaved changes warning
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (formState.isDirty) {
      e.preventDefault()
      e.returnValue = ''
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [formState.isDirty])
```

### 2. Loading States

```tsx
const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 rounded-[2.5rem]"
  >
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto mb-4 border-4 border-white/20 border-t-white rounded-full"
      />
      <p className="text-white font-medium">Menyimpan perubahan...</p>
      <p className="text-gray-400 text-sm mt-1">Mohon tunggu sebentar</p>
    </div>
  </motion.div>
)
```

---

## 🎯 COMPLETE IMPLEMENTATION EXAMPLE


**Implementasi lengkap Edit Modal dengan semua fitur:**

```tsx
{/* Edit Modal - ULTRA ADVANCED & COMPLETE */}
<AnimatePresence>
  {showEditModal && editSession && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (formState.isDirty) {
          if (confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
            setShowEditModal(false)
            setEditSession(null)
          }
        } else {
          setShowEditModal(false)
          setEditSession(null)
        }
      }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal Container */}
      <motion.div
        className="relative w-full max-w-2xl mx-4 sm:mx-auto"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#0A0A0B] border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="relative overflow-hidden p-6 sm:p-8 md:p-10">
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 200%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/60" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0 z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto">
                {/* Icon - NO CONTAINER */}
                <motion.div
                  className="relative shrink-0"
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <img 
                    src={EditSesiIcon} 
                    alt="Edit Sesi" 
                    className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-2xl pointer-events-none" 
                  />
                </motion.div>
                
                {/* Text */}
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                    Edit Sesi Absen
                  </h3>
                  <p className="text-white/80 mt-1 sm:mt-1.5 font-medium text-sm sm:text-base drop-shadow">
                    Perbarui informasi sesi absensi dengan lengkap dan akurat
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <motion.button
                type="button"
                onClick={() => {
                  if (formState.isDirty) {
                    if (confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
                      setShowEditModal(false)
                      setEditSession(null)
                    }
                  } else {
                    setShowEditModal(false)
                    setEditSession(null)
                  }
                }}
                className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleUpdate} className="relative p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8 bg-black/40 backdrop-blur-2xl">
            
            {/* Mata Kuliah - Locked */}
            <motion.div
              custom={0}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase flex items-center gap-2">
                {fieldIcons.course.icon}
                Mata Kuliah
              </label>
              <div className="relative">
                <select
                  value={editForm.data.course_id}
                  disabled
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white/60 appearance-none cursor-not-allowed shadow-inner"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.nama}
                    </option>
                  ))}
                </select>
                <FieldStatus status="locked" />
              </div>
              <p className="text-xs text-gray-500 italic flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Mata kuliah tidak dapat diubah setelah sesi dibuat
              </p>
            </motion.div>

            {/* Pertemuan & Judul */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Pertemuan Ke */}
              <motion.div
                custom={1}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase flex items-center gap-2">
                  {fieldIcons.meeting.icon}
                  Pertemuan Ke
                </label>
                <div className="relative">
                  <motion.input
                    type="number"
                    min="1"
                    max="21"
                    value={editForm.data.meeting_number}
                    onChange={e => {
                      const value = parseInt(e.target.value)
                      editForm.setData('meeting_number', value)
                      handleFieldChange('meeting_number', value)
                    }}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                  {formState.touched.meeting_number && (
                    <FieldStatus 
                      status={
                        editForm.data.meeting_number >= 1 && editForm.data.meeting_number <= 21 
                          ? 'valid' 
                          : 'invalid'
                      } 
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Masukkan nomor pertemuan (1-21)
                </p>
                {formState.errors.meeting_number && (
                  <ErrorMessage message={formState.errors.meeting_number} />
                )}
              </motion.div>

              {/* Judul Sesi */}
              <motion.div
                custom={2}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase flex items-center gap-2">
                  {fieldIcons.title.icon}
                  Judul Sesi
                  <span className="text-xs font-normal text-gray-500 normal-case">(Opsional)</span>
                </label>
                <motion.input
                  type="text"
                  value={editForm.data.title || ''}
                  onChange={e => {
                    editForm.setData('title', e.target.value)
                    handleFieldChange('title', e.target.value)
                  }}
                  placeholder="Contoh: UTS, Kuis 1, Presentasi"
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder-gray-600 focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner"
                  whileFocus={{ scale: 1.01 }}
                />
                <p className="text-xs text-gray-500">
                  Tambahkan judul untuk identifikasi sesi khusus
                </p>
              </motion.div>
            </div>

            {/* Waktu Mulai & Selesai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Waktu Mulai */}
              <motion.div
                custom={3}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase flex items-center gap-2">
                  {fieldIcons.time.icon}
                  Waktu Mulai
                </label>
                <motion.input
                  type="datetime-local"
                  value={editForm.data.start_at}
                  onChange={e => {
                    editForm.setData('start_at', e.target.value)
                    handleFieldChange('start_at', e.target.value)
                  }}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner [color-scheme:dark]"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Waktu Selesai */}
              <motion.div
                custom={4}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase flex items-center gap-2">
                  {fieldIcons.time.icon}
                  Waktu Selesai
                </label>
                <motion.input
                  type="datetime-local"
                  value={editForm.data.end_at}
                  onChange={e => {
                    editForm.setData('end_at', e.target.value)
                    handleFieldChange('end_at', e.target.value)
                  }}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner [color-scheme:dark]"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>
            </div>

            {/* Duration Display */}
            <DurationDisplay startAt={editForm.data.start_at} endAt={editForm.data.end_at} />

            {/* Time Presets */}
            <TimePresets onSelect={(minutes) => {
              if (editForm.data.start_at) {
                const start = new Date(editForm.data.start_at)
                const end = new Date(start.getTime() + minutes * 60000)
                const endStr = end.toISOString().slice(0, 16)
                editForm.setData('end_at', endStr)
                handleFieldChange('end_at', endStr)
              }
            }} />

            {/* Keyboard Shortcuts Hint */}
            <KeyboardHints />

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-white/10 mt-6 sm:mt-8"
              custom={5}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.button
                type="button"
                onClick={() => {
                  if (formState.isDirty) {
                    if (confirm('Ada perubahan yang belum disimpan. Yakin ingin membatalkan?')) {
                      setShowEditModal(false)
                      setEditSession(null)
                    }
                  } else {
                    setShowEditModal(false)
                    setEditSession(null)
                  }
                }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm sm:text-base font-bold transition-all order-2 sm:order-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Batal
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={editForm.processing || !formState.isValid}
                className="relative w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm sm:text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-pink-500/30 transition-all overflow-hidden group order-1 sm:order-2"
                whileHover={{ scale: editForm.processing ? 1 : 1.02, y: editForm.processing ? 0 : -2 }}
                whileTap={{ scale: editForm.processing ? 1 : 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {editForm.processing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Simpan Perubahan
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          {/* Loading Overlay */}
          <AnimatePresence>
            {editForm.processing && <LoadingOverlay />}
          </AnimatePresence>

          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-50 rounded-[2rem] sm:rounded-[2.5rem]"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h4 className="text-2xl font-bold text-white mb-2">Berhasil!</h4>
                  <p className="text-gray-400">Sesi absen berhasil diperbarui</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## ✅ CHECKLIST IMPLEMENTASI

### Design & UI/UX
- [ ] Warna matching 100% dengan Dashboard Admin
- [ ] Typography konsisten (font-size, font-weight, tracking)
- [ ] Container icon header dihapus
- [ ] Animasi floating icon dihapus
- [ ] Spacing & padding konsisten
- [ ] Border radius konsisten (rounded-2xl, rounded-3xl)
- [ ] Shadow & blur effects matching

### Responsive Design
- [ ] Mobile: Layout vertical, full width
- [ ] Tablet: Layout transisi
- [ ] Desktop: Layout horizontal, max-width
- [ ] Typography scale responsive
- [ ] Button group responsive
- [ ] Grid system responsive
- [ ] Modal size responsive

### Form Features
- [ ] Real-time validation
- [ ] Error messages dengan icon
- [ ] Success feedback
- [ ] Loading states
- [ ] Disabled states (locked fields)
- [ ] Field icons matching warna
- [ ] Placeholder text helpful
- [ ] Helper text informatif

### Inovasi Fitur
- [ ] Duration calculator
- [ ] Time presets
- [ ] Change indicator
- [ ] Keyboard shortcuts
- [ ] Unsaved changes warning
- [ ] Field status indicators
- [ ] Auto-validation
- [ ] Smart error handling

### Animations
- [ ] Modal entrance/exit smooth
- [ ] Field stagger animation
- [ ] Button hover effects
- [ ] Input focus effects
- [ ] Loading spinner
- [ ] Success animation
- [ ] Background gradient animation
- [ ] Smooth transitions

### Accessibility
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Screen reader friendly
- [ ] Color contrast sufficient
- [ ] Touch targets adequate (min 44x44px)

### Performance
- [ ] No data dummy
- [ ] Optimized animations
- [ ] Lazy loading jika perlu
- [ ] Debounced validation
- [ ] Memoized components
- [ ] Efficient re-renders

---

## 🚀 DEPLOYMENT NOTES

### Testing Checklist:
1. Test di berbagai ukuran layar (320px - 1920px)
2. Test keyboard shortcuts
3. Test validation semua field
4. Test unsaved changes warning
5. Test loading states
6. Test error handling
7. Test success feedback
8. Test dengan data real (bukan dummy)

### Browser Compatibility:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Targets:
- First paint < 1s
- Interactive < 2s
- Smooth 60fps animations
- No layout shifts

---

## 📚 REFERENSI KODE

File yang perlu diperhatikan:
- `resources/js/pages/admin/sesi-absen.tsx` - Main file
- `resources/js/pages/student/settings.tsx` - Reference untuk UI/UX pattern
- `resources/js/components/ui/*` - Reusable components

Icon assets:
- `EditSesiIcon` - Icon header modal
- Lucide React icons untuk field icons

---

## 🎯 KESIMPULAN

Ini adalah pengembangan KRUSIAL yang memerlukan:

1. **Konsistensi Total** dengan Dashboard Admin
2. **Penulisan Rapi** dengan 1 tema yang kohesif
3. **Responsive Perfect** di semua device
4. **Inovasi Signifikan** dengan fitur-fitur smart
5. **NO Data Dummy** - semua data real
6. **Animasi Smooth** tanpa yang mengganggu
7. **UX Excellence** dengan feedback yang jelas

Lakukan dengan SANGAT SERIUS dan perhatikan SETIAP DETAIL! 🚀
