# 🎯 PROMPT ULTRA ADVANCED: HALAMAN TAMBAH JADWAL BARU - ADMIN PANEL

## 📋 OVERVIEW PENGEMBANGAN

Ini adalah pengembangan halaman **Tambah Jadwal Baru** yang terpisah (bukan modal) di Admin Panel. Halaman ini SANGAT KRUSIAL dan PENTING untuk manajemen jadwal perkuliahan. Implementasi harus dilakukan dengan SANGAT SANGAT SERIUS dengan standar kualitas tertinggi.

**File Target:** `resources/js/pages/admin/jadwal/create.tsx`

**Route:** `/admin/jadwal/create`

---

## 🎨 DESIGN SYSTEM & CONSISTENCY

### 1. COLOR PALETTE - 100% MATCHING DASHBOARD

```typescript
// Primary Gradients
const gradients = {
  header: "from-indigo-600 via-purple-600 to-pink-500",
  primary: "from-pink-600 to-purple-600",
  success: "from-emerald-400 to-teal-600",
  warning: "from-amber-400 to-orange-600",
  danger: "from-rose-400 to-pink-600",
  info: "from-sky-400 to-indigo-600",
  violet: "from-violet-400 to-purple-600",
  cyan: "from-cyan-400 to-blue-600"
}

// Background System
const backgrounds = {
  page: "bg-slate-50 dark:bg-slate-950",
  card: "bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl",
  input: "bg-white/60 dark:bg-neutral-800/60",
  disabled: "bg-white/5 border-white/10"
}

// Border & Shadow
const effects = {
  border: "border-white/20 dark:border-white/5",
  shadow: "shadow-xl",
  rounded: "rounded-3xl"
}
```

### 2. TYPOGRAPHY SYSTEM - 1 TEMA RAPI

```typescript
// Headers
const typography = {
  pageTitle: "text-2xl sm:text-3xl font-bold text-white",
  pageSubtitle: "text-sm sm:text-base text-blue-100/80 font-medium",
  sectionTitle: "text-lg font-semibold text-neutral-900 dark:text-white",
  sectionDesc: "text-sm text-neutral-500 dark:text-neutral-400",
  
  // Form Labels
  label: "text-sm font-bold text-gray-700 dark:text-gray-300",
  helper: "text-xs text-gray-500 dark:text-gray-400",
  error: "text-xs text-red-600 dark:text-red-400",
  
  // Buttons
  button: "text-sm sm:text-base font-bold"
}
```

### 3. ICON SYSTEM

**Icon Header:** `JadwalIcon` - Icon jadwal yang sesuai

**Icon untuk Card/Field:** Matching antara warna icon dan warna container

```typescript
const iconColors = {
  calendar: { gradient: "from-indigo-400 to-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  clock: { gradient: "from-purple-400 to-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  book: { gradient: "from-pink-400 to-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  users: { gradient: "from-emerald-400 to-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  mapPin: { gradient: "from-amber-400 to-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  hash: { gradient: "from-cyan-400 to-cyan-600", bg: "bg-cyan-100 dark:bg-cyan-900/30" }
}
```

---

## 🏗️ STRUKTUR HALAMAN LENGKAP

### 1. HEADER SECTION - ULTRA ADVANCED

```tsx
{/* Header - Premium Design */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
  className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-6"
>
  {/* Animated Gradient Background */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    style={{ backgroundSize: '200% 200%' }}
  />
  
  {/* Subtle Overlays */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
  <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

  <div className="relative">
    {/* Back Button - Matching Menu Lain */}
    <motion.button
      whileHover={{ scale: 1.02, x: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.visit('/admin/jadwal')}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
    >
      <ChevronLeft className="h-4 w-4" />
      Kembali ke Daftar Jadwal
    </motion.button>

    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full">
        {/* Icon - NO CONTAINER, NO FLOATING ANIMATION */}
        <motion.div
          className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <img 
            src={JadwalIcon} 
            alt="Tambah Jadwal" 
            className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" 
          />
        </motion.div>
        
        <div className="flex-1 mt-1 sm:mt-0">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-blue-100 font-medium"
          >
            Manajemen Jadwal Perkuliahan
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl sm:text-3xl font-bold"
          >
            Tambah Jadwal Baru
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-blue-100/80 text-sm sm:text-base"
          >
            Buat jadwal perkuliahan baru dengan detail lengkap dan akurat
          </motion.p>
        </div>
      </div>

      {/* Quick Stats Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl"
      >
        <p className="text-xs text-indigo-100/90">Total Jadwal</p>
        <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
          <Calendar className="h-4 w-4" />
          {stats.total} Jadwal
        </div>
      </motion.div>
    </div>
  </div>
</motion.div>
```

---

## 📝 FORM STRUCTURE - COMPREHENSIVE

### Section 1: Informasi Mata Kuliah

```tsx
<FormSection
  title="Informasi Mata Kuliah"
  description="Pilih mata kuliah dan pertemuan"
  icon={BookOpen}
  gradient="from-indigo-400 to-purple-600"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Mata Kuliah */}
    <FormField
      label="Mata Kuliah"
      icon={BookOpen}
      required
      error={form.errors.course_id}
      helper="Pilih mata kuliah yang akan dijadwalkan"
    >
      <select
        value={form.data.course_id}
        onChange={e => {
          form.setData('course_id', e.target.value)
          // Auto-suggest meeting number
          const course = courses.find(c => c.id === parseInt(e.target.value))
          if (course) {
            const nextMeeting = getNextMeetingNumber(course.id)
            form.setData('meeting_number', nextMeeting)
          }
        }}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      >
        <option value="">Pilih Mata Kuliah</option>
        {courses.map(c => (
          <option key={c.id} value={c.id}>
            {c.nama} ({c.sks} SKS) - {c.dosen?.nama}
          </option>
        ))}
      </select>
    </FormField>

    {/* Pertemuan Ke */}
    <FormField
      label="Pertemuan Ke"
      icon={Hash}
      required
      error={form.errors.meeting_number}
      helper="Nomor pertemuan (1-16)"
    >
      <input
        type="number"
        min="1"
        max="16"
        value={form.data.meeting_number}
        onChange={e => form.setData('meeting_number', parseInt(e.target.value))}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      />
      {selectedCourse && (
        <MeetingProgress 
          courseId={selectedCourse.id} 
          currentMeeting={form.data.meeting_number}
          totalMeetings={16}
        />
      )}
    </FormField>

    {/* Judul/Topik (Opsional) */}
    <FormField
      label="Judul/Topik Pertemuan"
      icon={Type}
      optional
      helper="Contoh: Pengenalan Algoritma, UTS, Presentasi"
      className="md:col-span-2"
    >
      <input
        type="text"
        value={form.data.title}
        onChange={e => form.setData('title', e.target.value)}
        placeholder="Masukkan judul atau topik pertemuan"
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      />
    </FormField>
  </div>
</FormSection>
```

### Section 2: Waktu & Durasi

```tsx
<FormSection
  title="Waktu & Durasi"
  description="Atur jadwal waktu perkuliahan"
  icon={Clock}
  gradient="from-purple-400 to-pink-600"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Tanggal */}
    <FormField
      label="Tanggal"
      icon={Calendar}
      required
      error={form.errors.date}
    >
      <input
        type="date"
        value={form.data.date}
        onChange={e => form.setData('date', e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all [color-scheme:dark]"
      />
      <DayInfo date={form.data.date} />
    </FormField>

    {/* Hari */}
    <FormField
      label="Hari"
      icon={Calendar}
      required
      error={form.errors.day}
    >
      <select
        value={form.data.day}
        onChange={e => form.setData('day', e.target.value)}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      >
        <option value="">Pilih Hari</option>
        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => (
          <option key={day} value={day}>{day}</option>
        ))}
      </select>
    </FormField>

    {/* Waktu Mulai */}
    <FormField
      label="Waktu Mulai"
      icon={Clock}
      required
      error={form.errors.start_time}
    >
      <input
        type="time"
        value={form.data.start_time}
        onChange={e => form.setData('start_time', e.target.value)}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all [color-scheme:dark]"
      />
    </FormField>

    {/* Waktu Selesai */}
    <FormField
      label="Waktu Selesai"
      icon={Clock}
      required
      error={form.errors.end_time}
    >
      <input
        type="time"
        value={form.data.end_time}
        onChange={e => form.setData('end_time', e.target.value)}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all [color-scheme:dark]"
      />
    </FormField>
  </div>

  {/* Duration Calculator */}
  <DurationCalculator 
    startTime={form.data.start_time} 
    endTime={form.data.end_time}
    sks={selectedCourse?.sks}
  />

  {/* Time Presets */}
  <TimePresets onSelect={handleTimePreset} />

  {/* Conflict Checker */}
  {form.data.date && form.data.start_time && form.data.end_time && (
    <ConflictChecker 
      date={form.data.date}
      startTime={form.data.start_time}
      endTime={form.data.end_time}
      courseId={form.data.course_id}
    />
  )}
</FormSection>
```

### Section 3: Lokasi & Ruangan

```tsx
<FormSection
  title="Lokasi & Ruangan"
  description="Tentukan tempat perkuliahan"
  icon={MapPin}
  gradient="from-pink-400 to-rose-600"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Tipe Lokasi */}
    <FormField
      label="Tipe Lokasi"
      icon={MapPin}
      required
      error={form.errors.location_type}
      className="md:col-span-2"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { value: 'offline', label: 'Offline (Ruang Kelas)', icon: Building2, color: 'indigo' },
          { value: 'online', label: 'Online (Virtual)', icon: Video, color: 'emerald' },
          { value: 'hybrid', label: 'Hybrid (Campuran)', icon: Blend, color: 'amber' }
        ].map(type => (
          <motion.button
            key={type.value}
            type="button"
            onClick={() => form.setData('location_type', type.value)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all",
              form.data.location_type === type.value
                ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-950/30`
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <type.icon className={cn(
              "h-6 w-6 mx-auto mb-2",
              form.data.location_type === type.value
                ? `text-${type.color}-600 dark:text-${type.color}-400`
                : "text-gray-400"
            )} />
            <p className={cn(
              "text-sm font-medium",
              form.data.location_type === type.value
                ? `text-${type.color}-900 dark:text-${type.color}-100`
                : "text-gray-600 dark:text-gray-400"
            )}>
              {type.label}
            </p>
          </motion.button>
        ))}
      </div>
    </FormField>

    {/* Ruangan (untuk offline/hybrid) */}
    {(form.data.location_type === 'offline' || form.data.location_type === 'hybrid') && (
      <FormField
        label="Ruangan"
        icon={Building2}
        required
        error={form.errors.room}
      >
        <input
          type="text"
          value={form.data.room}
          onChange={e => form.setData('room', e.target.value)}
          placeholder="Contoh: R.301, Lab Komputer 1"
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
        />
        <RoomAvailability 
          room={form.data.room}
          date={form.data.date}
          startTime={form.data.start_time}
          endTime={form.data.end_time}
        />
      </FormField>
    )}

    {/* Link Meeting (untuk online/hybrid) */}
    {(form.data.location_type === 'online' || form.data.location_type === 'hybrid') && (
      <FormField
        label="Link Meeting"
        icon={Video}
        required
        error={form.errors.meeting_link}
      >
        <input
          type="url"
          value={form.data.meeting_link}
          onChange={e => form.setData('meeting_link', e.target.value)}
          placeholder="https://zoom.us/j/..."
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
        />
      </FormField>
    )}
  </div>
</FormSection>
```

---

## 🎯 INOVASI FITUR SIGNIFIKAN

### 1. MEETING PROGRESS TRACKER

**Visual progress pertemuan mata kuliah:**


```tsx
const MeetingProgress = ({ 
  courseId, 
  currentMeeting, 
  totalMeetings = 16 
}: { 
  courseId: number
  currentMeeting: number
  totalMeetings: number
}) => {
  const [completedMeetings, setCompletedMeetings] = useState(0)
  
  useEffect(() => {
    // Fetch completed meetings for this course
    fetch(`/api/courses/${courseId}/meetings/count`)
      .then(res => res.json())
      .then(data => setCompletedMeetings(data.completed))
  }, [courseId])
  
  const progress = (completedMeetings / totalMeetings) * 100
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
          Progress Pertemuan
        </span>
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
          {completedMeetings}/{totalMeetings}
        </span>
      </div>
      
      <div className="h-2 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
        />
      </div>
      
      <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
        <CheckCircle2 className="h-3 w-3" />
        <span>
          Pertemuan ke-{currentMeeting} dari {totalMeetings} pertemuan
        </span>
      </div>
    </motion.div>
  )
}
```

### 2. DURATION CALCULATOR & SKS VALIDATOR

**Hitung durasi dan validasi dengan SKS:**

```tsx
const DurationCalculator = ({ 
  startTime, 
  endTime, 
  sks 
}: { 
  startTime: string
  endTime: string
  sks?: number
}) => {
  const calculateDuration = () => {
    if (!startTime || !endTime) return null
    
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    if (endMinutes <= startMinutes) return null
    
    const totalMinutes = endMinutes - startMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return { hours, minutes, total: totalMinutes }
  }
  
  const duration = calculateDuration()
  if (!duration) return null
  
  // SKS validation: 1 SKS = 50 menit
  const expectedMinutes = sks ? sks * 50 : null
  const isValid = expectedMinutes ? Math.abs(duration.total - expectedMinutes) <= 10 : true
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mt-4 p-4 rounded-xl border",
        isValid
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={cn(
            "h-5 w-5",
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )} />
          <span className={cn(
            "text-sm font-medium",
            isValid ? "text-emerald-900 dark:text-emerald-100" : "text-amber-900 dark:text-amber-100"
          )}>
            Durasi Perkuliahan
          </span>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-lg font-bold",
            isValid ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
          )}>
            {duration.hours > 0 && `${duration.hours} jam `}
            {duration.minutes} menit
          </p>
          {sks && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isValid ? '✓ Sesuai' : '⚠️ Tidak sesuai'} dengan {sks} SKS ({expectedMinutes} menit)
            </p>
          )}
        </div>
      </div>
      
      {!isValid && sks && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          Durasi standar untuk {sks} SKS adalah {expectedMinutes} menit (±10 menit)
        </p>
      )}
    </motion.div>
  )
}
```

### 3. TIME PRESETS

**Preset waktu umum untuk mempercepat input:**

```tsx
const TimePresets = ({ onSelect }: { onSelect: (start: string, end: string) => void }) => {
  const presets = [
    { label: '07:00 - 08:40', start: '07:00', end: '08:40', sks: 2, icon: '🌅' },
    { label: '08:40 - 10:20', start: '08:40', end: '10:20', sks: 2, icon: '☀️' },
    { label: '10:20 - 12:00', start: '10:20', end: '12:00', sks: 2, icon: '🌤️' },
    { label: '13:00 - 14:40', start: '13:00', end: '14:40', sks: 2, icon: '🌞' },
    { label: '14:40 - 16:20', start: '14:40', end: '16:20', sks: 2, icon: '🌆' },
    { label: '16:20 - 18:00', start: '16:20', end: '18:00', sks: 2, icon: '🌇' },
  ]
  
  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Preset Waktu Kuliah:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {presets.map((preset, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => onSelect(preset.start, preset.end)}
            className="p-3 rounded-lg bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 hover:border-pink-500 dark:hover:border-pink-500 transition-all text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{preset.icon}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {preset.sks} SKS
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {preset.label}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
```

### 4. CONFLICT CHECKER

**Check bentrok jadwal:**

```tsx
const ConflictChecker = ({ 
  date, 
  startTime, 
  endTime, 
  courseId 
}: {
  date: string
  startTime: string
  endTime: string
  courseId: string
}) => {
  const [conflicts, setConflicts] = useState<any[]>([])
  const [checking, setChecking] = useState(false)
  
  useEffect(() => {
    const checkConflicts = async () => {
      if (!date || !startTime || !endTime) return
      
      setChecking(true)
      try {
        const response = await fetch('/api/jadwal/check-conflicts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, start_time: startTime, end_time: endTime, course_id: courseId })
        })
        const data = await response.json()
        setConflicts(data.conflicts || [])
      } catch (error) {
        console.error('Error checking conflicts:', error)
      } finally {
        setChecking(false)
      }
    }
    
    const timer = setTimeout(checkConflicts, 500)
    return () => clearTimeout(timer)
  }, [date, startTime, endTime, courseId])
  
  if (checking) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-blue-700 dark:text-blue-300">
          Memeriksa bentrok jadwal...
        </span>
      </div>
    )
  }
  
  if (conflicts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3"
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Tidak ada bentrok jadwal
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            Waktu ini tersedia untuk dijadwalkan
          </p>
        </div>
      </motion.div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            Terdeteksi {conflicts.length} bentrok jadwal
          </p>
          <div className="mt-2 space-y-2">
            {conflicts.map((conflict, i) => (
              <div key={i} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <p className="text-xs font-medium text-red-800 dark:text-red-200">
                  {conflict.course_name}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {conflict.start_time} - {conflict.end_time} • {conflict.room}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

### 5. ROOM AVAILABILITY CHECKER

**Check ketersediaan ruangan:**

```tsx
const RoomAvailability = ({ 
  room, 
  date, 
  startTime, 
  endTime 
}: {
  room: string
  date: string
  startTime: string
  endTime: string
}) => {
  const [availability, setAvailability] = useState<{
    available: boolean
    occupiedBy?: string
  } | null>(null)
  const [checking, setChecking] = useState(false)
  
  useEffect(() => {
    const checkAvailability = async () => {
      if (!room || !date || !startTime || !endTime) return
      
      setChecking(true)
      try {
        const response = await fetch('/api/rooms/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room, date, start_time: startTime, end_time: endTime })
        })
        const data = await response.json()
        setAvailability(data)
      } catch (error) {
        console.error('Error checking room availability:', error)
      } finally {
        setChecking(false)
      }
    }
    
    const timer = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timer)
  }, [room, date, startTime, endTime])
  
  if (!room || checking) return null
  
  if (!availability) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mt-2 p-3 rounded-lg flex items-center gap-2 text-sm",
        availability.available
          ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
          : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
      )}
    >
      {availability.available ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span>Ruangan tersedia</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>Ruangan sudah digunakan oleh {availability.occupiedBy}</span>
        </>
      )}
    </motion.div>
  )
}
```

### 6. DAY INFO

**Informasi hari dari tanggal yang dipilih:**

```tsx
const DayInfo = ({ date }: { date: string }) => {
  if (!date) return null
  
  const dateObj = new Date(date)
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const dayName = dayNames[dateObj.getDay()]
  
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mt-2 p-2 rounded-lg flex items-center gap-2 text-xs",
        isWeekend
          ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
          : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
      )}
    >
      <Calendar className="h-3 w-3" />
      <span>
        {dayName}, {dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        {isWeekend && ' (Akhir Pekan)'}
      </span>
    </motion.div>
  )
}
```

### 7. RECURRING SCHEDULE

**Jadwal berulang (opsional):**

```tsx
<FormSection
  title="Jadwal Berulang (Opsional)"
  description="Buat jadwal yang berulang setiap minggu"
  icon={Repeat}
  gradient="from-cyan-400 to-blue-600"
  collapsible
  defaultOpen={false}
>
  <div className="space-y-4">
    {/* Enable Recurring */}
    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
      <input
        type="checkbox"
        id="recurring"
        checked={form.data.is_recurring}
        onChange={e => form.setData('is_recurring', e.target.checked)}
        className="h-4 w-4"
      />
      <div className="flex-1">
        <label htmlFor="recurring" className="text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer">
          Aktifkan Jadwal Berulang
        </label>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
          Jadwal akan otomatis dibuat setiap minggu pada hari dan waktu yang sama
        </p>
      </div>
    </div>

    {form.data.is_recurring && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4"
      >
        {/* Repeat Until */}
        <FormField
          label="Berulang Sampai"
          icon={Calendar}
          required
          error={form.errors.repeat_until}
        >
          <input
            type="date"
            value={form.data.repeat_until}
            onChange={e => form.setData('repeat_until', e.target.value)}
            min={form.data.date}
            className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all [color-scheme:dark]"
          />
        </FormField>

        {/* Preview */}
        <RecurringPreview 
          startDate={form.data.date}
          endDate={form.data.repeat_until}
          day={form.data.day}
        />
      </motion.div>
    )}
  </div>
</FormSection>
```

### 8. BULK IMPORT FROM TEMPLATE

**Import jadwal dari template Excel:**

```tsx
<FormSection
  title="Import Jadwal Massal"
  description="Upload file Excel untuk membuat banyak jadwal sekaligus"
  icon={Upload}
  gradient="from-violet-400 to-purple-600"
  collapsible
  defaultOpen={false}
>
  <div className="space-y-4">
    {/* Download Template */}
    <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
          <Download className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-violet-900 dark:text-violet-100">
            Download Template
          </h4>
          <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
            Gunakan template Excel untuk memastikan format data yang benar
          </p>
          <button
            type="button"
            onClick={() => window.open('/admin/jadwal/template', '_blank')}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Template Excel
          </button>
        </div>
      </div>
    </div>

    {/* File Upload */}
    <BulkImportUploader />
  </div>
</FormSection>
```

---

## 📱 RESPONSIVE DESIGN - MOBILE OPTIMIZATION

### Mobile-First Approach:

```tsx
// Container
className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"

// Header
className="p-6 sm:p-8" // Padding responsive

// Icon
className="h-16 w-16 sm:h-20 sm:w-20" // Size responsive

// Title
className="text-2xl sm:text-3xl" // Typography scale

// Grid
className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" // Grid responsive

// Buttons
className="w-full sm:w-auto" // Full width on mobile

// Time Presets
className="grid grid-cols-2 sm:grid-cols-3 gap-2" // Responsive grid
```

### Sticky Action Bar on Mobile:

```tsx
<div className="sticky bottom-0 left-0 right-0 z-10 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-white/20 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-0">
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
    <Button variant="outline" className="w-full sm:w-auto order-2 sm:order-1">
      Batal
    </Button>
    <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-600 order-1 sm:order-2">
      Simpan Jadwal
    </Button>
  </div>
</div>
```

---

## ✅ VALIDATION RULES

### Comprehensive Validation:

```tsx
const validateForm = () => {
  const errors: Record<string, string> = {}
  
  // Mata Kuliah
  if (!form.data.course_id) {
    errors.course_id = 'Mata kuliah wajib dipilih'
  }
  
  // Pertemuan
  if (form.data.meeting_number < 1 || form.data.meeting_number > 16) {
    errors.meeting_number = 'Pertemuan harus antara 1-16'
  }
  
  // Tanggal
  if (!form.data.date) {
    errors.date = 'Tanggal wajib diisi'
  } else {
    const selectedDate = new Date(form.data.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      errors.date = 'Tanggal tidak boleh di masa lalu'
    }
  }
  
  // Waktu
  if (!form.data.start_time) {
    errors.start_time = 'Waktu mulai wajib diisi'
  }
  
  if (!form.data.end_time) {
    errors.end_time = 'Waktu selesai wajib diisi'
  }
  
  if (form.data.start_time && form.data.end_time) {
    const [startHour, startMin] = form.data.start_time.split(':').map(Number)
    const [endHour, endMin] = form.data.end_time.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    if (endMinutes <= startMinutes) {
      errors.end_time = 'Waktu selesai harus setelah waktu mulai'
    }
    
    const duration = endMinutes - startMinutes
    if (duration < 50) {
      errors.end_time = 'Durasi minimal 50 menit (1 SKS)'
    }
    if (duration > 200) {
      errors.end_time = 'Durasi maksimal 200 menit (4 SKS)'
    }
  }
  
  // Lokasi
  if (!form.data.location_type) {
    errors.location_type = 'Tipe lokasi wajib dipilih'
  }
  
  if (form.data.location_type === 'offline' || form.data.location_type === 'hybrid') {
    if (!form.data.room) {
      errors.room = 'Ruangan wajib diisi untuk lokasi offline/hybrid'
    }
  }
  
  if (form.data.location_type === 'online' || form.data.location_type === 'hybrid') {
    if (!form.data.meeting_link) {
      errors.meeting_link = 'Link meeting wajib diisi untuk lokasi online/hybrid'
    } else if (!/^https?:\/\/.+/.test(form.data.meeting_link)) {
      errors.meeting_link = 'Format link tidak valid'
    }
  }
  
  // Recurring
  if (form.data.is_recurring) {
    if (!form.data.repeat_until) {
      errors.repeat_until = 'Tanggal akhir pengulangan wajib diisi'
    } else {
      const repeatUntil = new Date(form.data.repeat_until)
      const startDate = new Date(form.data.date)
      
      if (repeatUntil <= startDate) {
        errors.repeat_until = 'Tanggal akhir harus setelah tanggal mulai'
      }
    }
  }
  
  return errors
}
```

---

## 🎯 KESIMPULAN

Halaman Tambah Jadwal Baru harus:

1. **Konsisten 100%** dengan Dashboard Admin
2. **Validasi Komprehensif** dengan real-time feedback
3. **Inovasi Signifikan:**
   - Meeting progress tracker
   - Duration calculator & SKS validator
   - Time presets
   - Conflict checker
   - Room availability checker
   - Recurring schedule
   - Bulk import
4. **Responsive Perfect** di semua device
5. **User-Friendly** dengan helper dan visual feedback
6. **No Data Dummy** - semua data real
7. **Smart Features** untuk efisiensi input

Implementasikan dengan SANGAT SANGAT SERIUS dan perhatikan SETIAP DETAIL! Ini adalah menu KRUSIAL untuk manajemen jadwal perkuliahan! 🚀
