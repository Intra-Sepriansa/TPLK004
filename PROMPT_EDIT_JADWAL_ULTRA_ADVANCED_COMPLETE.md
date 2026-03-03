# 🎯 PROMPT ULTRA ADVANCED: HALAMAN EDIT JADWAL - ADMIN PANEL

## 📋 OVERVIEW PENGEMBANGAN

Ini adalah pengembangan halaman **Edit Jadwal** yang terpisah (bukan modal) di Admin Panel. Halaman ini SANGAT KRUSIAL dan PENTING untuk manajemen jadwal perkuliahan. Implementasi harus dilakukan dengan SANGAT SANGAT SERIUS dengan standar kualitas tertinggi.

**File Target:** `resources/js/pages/admin/jadwal/edit.tsx`

**Route:** `/admin/jadwal/{id}/edit`

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
  info: "from-sky-400 to-indigo-600"
}

// Background System
const backgrounds = {
  page: "bg-slate-50 dark:bg-slate-950",
  card: "bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl",
  input: "bg-white/60 dark:bg-neutral-800/60",
  disabled: "bg-white/5 border-white/10"
}
```

### 2. TYPOGRAPHY SYSTEM - 1 TEMA RAPI

```typescript
const typography = {
  pageTitle: "text-2xl sm:text-3xl font-bold text-white",
  pageSubtitle: "text-sm sm:text-base text-blue-100/80 font-medium",
  sectionTitle: "text-lg font-semibold text-neutral-900 dark:text-white",
  label: "text-sm font-bold text-gray-700 dark:text-gray-300",
  helper: "text-xs text-gray-500 dark:text-gray-400",
  error: "text-xs text-red-600 dark:text-red-400"
}
```

---

## 🏗️ STRUKTUR HALAMAN

### 1. HEADER SECTION

```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-6"
>
  {/* Animated Background */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    style={{ backgroundSize: '200% 200%' }}
  />
  
  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
  <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

  <div className="relative">
    {/* Back Button */}
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
        {/* Icon - NO CONTAINER */}
        <motion.div
          className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <img 
            src={JadwalIcon} 
            alt="Edit Jadwal" 
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
            Edit Jadwal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-blue-100/80 text-sm sm:text-base"
          >
            Perbarui informasi jadwal perkuliahan dengan lengkap dan akurat
          </motion.p>
        </div>
      </div>

      {/* Schedule Info Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl"
      >
        <p className="text-xs text-indigo-100/90">Jadwal ID</p>
        <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
          <Calendar className="h-4 w-4" />
          #{schedule.id}
        </div>
      </motion.div>
    </div>
  </div>
</motion.div>
```

### 2. CURRENT SCHEDULE INFO CARD

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="mb-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
>
  <div className="flex items-start justify-between mb-4">
    <div>
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
        Informasi Jadwal Saat Ini
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Data yang sedang aktif untuk jadwal ini
      </p>
    </div>
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-medium",
      schedule.is_active 
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        : "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
    )}>
      {schedule.is_active ? 'Aktif' : 'Tidak Aktif'}
    </span>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <InfoItem 
      icon={BookOpen}
      label="Mata Kuliah"
      value={schedule.course?.nama}
      color="indigo"
    />
    <InfoItem 
      icon={Hash}
      label="Pertemuan"
      value={`#${schedule.meeting_number}`}
      color="purple"
    />
    <InfoItem 
      icon={Clock}
      label="Waktu"
      value={`${schedule.start_time} - ${schedule.end_time}`}
      color="pink"
    />
    <InfoItem 
      icon={Users}
      label="Kehadiran"
      value={`${schedule.logs_count || 0} mahasiswa`}
      color="emerald"
    />
  </div>
</motion.div>
```

---

## 🎯 FITUR KHUSUS EDIT PAGE

### 1. CHANGE TRACKING

```tsx
const ChangeTracker = () => {
  const [changes, setChanges] = useState<Change[]>([])
  
  useEffect(() => {
    const detected = detectChanges(originalData, form.data)
    setChanges(detected)
  }, [form.data])
  
  return (
    <AnimatePresence>
      {changes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                {changes.length} Perubahan Terdeteksi
              </h4>
              <div className="mt-2 space-y-2">
                {changes.map((change, i) => (
                  <ChangeItem key={i} change={change} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 2. FIELD LOCK INDICATOR

```tsx
const LockedField = ({ 
  label, 
  value, 
  reason,
  icon: Icon
}: { 
  label: string
  value: string
  reason: string
  icon: LucideIcon
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
      <Icon className="h-4 w-4" />
      {label}
      <Lock className="h-3 w-3 text-gray-400" />
    </label>
    <div className="relative">
      <input
        type="text"
        value={value}
        disabled
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
      />
      <div className="absolute inset-y-0 right-3 flex items-center">
        <Lock className="h-4 w-4 text-gray-400" />
      </div>
    </div>
    <p className="text-xs text-gray-500 italic flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {reason}
    </p>
  </div>
)
```

### 3. VALIDATION DENGAN CONTEXT

```tsx
const validateEdit = (data: FormData, schedule: Schedule) => {
  const errors: Record<string, string> = {}
  
  // Tidak bisa edit jadwal yang sudah selesai
  if (schedule.status === 'completed') {
    errors._form = 'Jadwal yang sudah selesai tidak dapat diedit'
  }
  
  // Tidak bisa ubah waktu jika jadwal aktif
  if (schedule.is_active) {
    if (data.start_time !== schedule.start_time || data.end_time !== schedule.end_time) {
      errors.start_time = 'Tidak dapat mengubah waktu jadwal yang sedang aktif'
    }
  }
  
  // Tidak bisa ubah mata kuliah jika sudah ada kehadiran
  if (schedule.logs_count > 0 && data.course_id !== schedule.course_id) {
    errors.course_id = 'Tidak dapat mengubah mata kuliah karena sudah ada data kehadiran'
  }
  
  // Validasi waktu
  if (data.start_time && data.end_time) {
    const [startHour, startMin] = data.start_time.split(':').map(Number)
    const [endHour, endMin] = data.end_time.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    if (endMinutes <= startMinutes) {
      errors.end_time = 'Waktu selesai harus setelah waktu mulai'
    }
    
    const duration = endMinutes - startMinutes
    if (duration < 50) {
      errors.end_time = 'Durasi minimal 50 menit'
    }
    if (duration > 200) {
      errors.end_time = 'Durasi maksimal 200 menit'
    }
  }
  
  return errors
}
```

### 4. EDIT HISTORY SIDEBAR

```tsx
const EditHistory = ({ history }: { history: EditLog[] }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg">
        <Clock className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-white">
          Riwayat Perubahan
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {history.length} perubahan tercatat
        </p>
      </div>
    </div>

    <div className="space-y-3 max-h-96 overflow-y-auto">
      {history.map((log, i) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-800/50 hover:bg-white/70 dark:hover:bg-neutral-800/70 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Edit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {log.action}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {log.user} • {formatRelativeTime(log.created_at)}
            </p>
            {log.changes && (
              <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                {log.changes.map((c, j) => (
                  <div key={j} className="flex items-center gap-1">
                    <span className="text-neutral-400">•</span>
                    <span>{c.field}: {c.old} → {c.new}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)
```

---

## 📝 FORM SECTIONS

### Section 1: Informasi Mata Kuliah (dengan Lock Logic)

```tsx
<FormSection
  title="Informasi Mata Kuliah"
  description="Data mata kuliah dan pertemuan"
  icon={BookOpen}
  gradient="from-indigo-400 to-purple-600"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Mata Kuliah - LOCKED if has attendance */}
    {schedule.logs_count > 0 ? (
      <LockedField
        label="Mata Kuliah"
        value={schedule.course?.nama}
        reason="Tidak dapat diubah karena sudah ada data kehadiran"
        icon={BookOpen}
      />
    ) : (
      <FormField
        label="Mata Kuliah"
        icon={BookOpen}
        required
        error={form.errors.course_id}
      >
        <select
          value={form.data.course_id}
          onChange={e => form.setData('course_id', e.target.value)}
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
        >
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.nama} ({c.sks} SKS)
            </option>
          ))}
        </select>
      </FormField>
    )}

    {/* Pertemuan Ke */}
    <FormField
      label="Pertemuan Ke"
      icon={Hash}
      required
      error={form.errors.meeting_number}
    >
      <input
        type="number"
        min="1"
        max="16"
        value={form.data.meeting_number}
        onChange={e => form.setData('meeting_number', parseInt(e.target.value))}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      />
    </FormField>

    {/* Judul/Topik */}
    <FormField
      label="Judul/Topik Pertemuan"
      icon={Type}
      optional
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

### Section 2: Waktu & Durasi (dengan Active Check)

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
      locked={schedule.is_active}
      lockMessage={schedule.is_active ? "Tidak dapat diubah saat jadwal aktif" : undefined}
    >
      <input
        type="date"
        value={form.data.date}
        onChange={e => form.setData('date', e.target.value)}
        disabled={schedule.is_active}
        className={cn(
          "w-full rounded-xl border px-4 py-3 transition-all [color-scheme:dark]",
          schedule.is_active
            ? "bg-white/5 border-white/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
            : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/10 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
        )}
      />
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
      locked={schedule.is_active}
      lockMessage={schedule.is_active ? "Tidak dapat diubah saat jadwal aktif" : undefined}
    >
      <input
        type="time"
        value={form.data.start_time}
        onChange={e => form.setData('start_time', e.target.value)}
        disabled={schedule.is_active}
        className={cn(
          "w-full rounded-xl border px-4 py-3 transition-all [color-scheme:dark]",
          schedule.is_active
            ? "bg-white/5 border-white/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
            : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/10 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
        )}
      />
    </FormField>

    {/* Waktu Selesai */}
    <FormField
      label="Waktu Selesai"
      icon={Clock}
      required
      error={form.errors.end_time}
      locked={schedule.is_active}
      lockMessage={schedule.is_active ? "Tidak dapat diubah saat jadwal aktif" : undefined}
    >
      <input
        type="time"
        value={form.data.end_time}
        onChange={e => form.setData('end_time', e.target.value)}
        disabled={schedule.is_active}
        className={cn(
          "w-full rounded-xl border px-4 py-3 transition-all [color-scheme:dark]",
          schedule.is_active
            ? "bg-white/5 border-white/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
            : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/10 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
        )}
      />
    </FormField>
  </div>

  {/* Duration Calculator */}
  <DurationCalculator 
    startTime={form.data.start_time} 
    endTime={form.data.end_time}
    sks={selectedCourse?.sks}
  />

  {/* Conflict Checker (only if time changed) */}
  {!schedule.is_active && hasTimeChanged && (
    <ConflictChecker 
      date={form.data.date}
      startTime={form.data.start_time}
      endTime={form.data.end_time}
      courseId={form.data.course_id}
      excludeId={schedule.id}
    />
  )}
</FormSection>
```

---

## ✅ COMPLETE IMPLEMENTATION EXAMPLE


```tsx
// resources/js/pages/admin/jadwal/edit.tsx

import { Head, router, useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Save, AlertCircle, BookOpen, Hash, Type, Calendar,
  Clock, MapPin, Building2, Video, Blend, Lock, Loader2, CheckCircle2,
  Edit, Users
} from 'lucide-react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import JadwalIcon from '@/assets/admin/jadwal/jadwal.png'
import { cn } from '@/lib/utils'

interface Schedule {
  id: number
  course_id: number
  course?: { id: number; nama: string; sks: number }
  meeting_number: number
  title: string | null
  date: string
  day: string
  start_time: string
  end_time: string
  location_type: string
  room: string | null
  meeting_link: string | null
  is_active: boolean
  status: string
  logs_count: number
  created_at: string
  updated_at: string
}

interface Course {
  id: number
  nama: string
  sks: number
  dosen?: { nama: string }
}

interface PageProps {
  schedule: Schedule
  courses: Course[]
  editHistory?: EditLog[]
}

export default function EditJadwal({ schedule, courses, editHistory = [] }: PageProps) {
  const form = useForm({
    course_id: schedule.course_id.toString(),
    meeting_number: schedule.meeting_number,
    title: schedule.title || '',
    date: schedule.date,
    day: schedule.day,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    location_type: schedule.location_type,
    room: schedule.room || '',
    meeting_link: schedule.meeting_link || '',
  })

  const [originalData] = useState(form.data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Detect changes
  const hasChanges = JSON.stringify(form.data) !== JSON.stringify(originalData)
  
  // Check if time changed
  const hasTimeChanged = 
    form.data.date !== originalData.date ||
    form.data.start_time !== originalData.start_time ||
    form.data.end_time !== originalData.end_time

  // Get selected course
  const selectedCourse = courses.find(c => c.id === parseInt(form.data.course_id))

  // Get changes list
  const getChanges = () => {
    const changes: Change[] = []
    Object.keys(form.data).forEach(key => {
      if (form.data[key] !== originalData[key]) {
        changes.push({
          field: getFieldLabel(key),
          oldValue: formatValue(originalData[key]),
          newValue: formatValue(form.data[key])
        })
      }
    })
    return changes
  }

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    // Can't edit completed schedule
    if (schedule.status === 'completed') {
      newErrors._form = 'Jadwal yang sudah selesai tidak dapat diedit'
    }
    
    // Can't change course if has attendance
    if (schedule.logs_count > 0 && form.data.course_id !== schedule.course_id.toString()) {
      newErrors.course_id = 'Tidak dapat mengubah mata kuliah karena sudah ada data kehadiran'
    }
    
    // Can't change time if active
    if (schedule.is_active) {
      if (form.data.start_time !== schedule.start_time || form.data.end_time !== schedule.end_time) {
        newErrors.start_time = 'Tidak dapat mengubah waktu jadwal yang sedang aktif'
      }
    }
    
    // Time validation
    if (form.data.start_time && form.data.end_time) {
      const [startHour, startMin] = form.data.start_time.split(':').map(Number)
      const [endHour, endMin] = form.data.end_time.split(':').map(Number)
      
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      
      if (endMinutes <= startMinutes) {
        newErrors.end_time = 'Waktu selesai harus setelah waktu mulai'
      }
      
      const duration = endMinutes - startMinutes
      if (duration < 50) {
        newErrors.end_time = 'Durasi minimal 50 menit'
      }
      if (duration > 200) {
        newErrors.end_time = 'Durasi maksimal 200 menit'
      }
    }
    
    // Location validation
    if (form.data.location_type === 'offline' || form.data.location_type === 'hybrid') {
      if (!form.data.room) {
        newErrors.room = 'Ruangan wajib diisi untuk lokasi offline/hybrid'
      }
    }
    
    if (form.data.location_type === 'online' || form.data.location_type === 'hybrid') {
      if (!form.data.meeting_link) {
        newErrors.meeting_link = 'Link meeting wajib diisi untuk lokasi online/hybrid'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    form.patch(`/admin/jadwal/${schedule.id}`, {
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => {
          router.visit('/admin/jadwal')
        }, 2000)
      },
      onError: (errors) => {
        setErrors(errors)
      }
    })
  }

  return (
    <AppLayout>
      <Head title={`Edit Jadwal #${schedule.id}`} />
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-6"
          >
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 200%' }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (hasChanges) {
                    if (confirm('Ada perubahan yang belum disimpan. Yakin ingin kembali?')) {
                      router.visit('/admin/jadwal')
                    }
                  } else {
                    router.visit('/admin/jadwal')
                  }
                }}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali ke Daftar Jadwal
              </motion.button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full">
                  {/* Icon */}
                  <motion.div
                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <img 
                      src={JadwalIcon} 
                      alt="Edit Jadwal" 
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
                      Edit Jadwal
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2 text-blue-100/80 text-sm sm:text-base"
                    >
                      Perbarui informasi jadwal perkuliahan dengan lengkap dan akurat
                    </motion.p>
                  </div>
                </div>

                {/* Schedule Info Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl"
                >
                  <p className="text-xs text-indigo-100/90">Jadwal ID</p>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                    <Calendar className="h-4 w-4" />
                    #{schedule.id}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Current Schedule Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Informasi Jadwal Saat Ini
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Data yang sedang aktif untuk jadwal ini
                </p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                schedule.is_active 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
              )}>
                {schedule.is_active ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem 
                icon={BookOpen}
                label="Mata Kuliah"
                value={schedule.course?.nama}
                color="indigo"
              />
              <InfoItem 
                icon={Hash}
                label="Pertemuan"
                value={`#${schedule.meeting_number}`}
                color="purple"
              />
              <InfoItem 
                icon={Clock}
                label="Waktu"
                value={`${schedule.start_time} - ${schedule.end_time}`}
                color="pink"
              />
              <InfoItem 
                icon={Users}
                label="Kehadiran"
                value={`${schedule.logs_count || 0} mahasiswa`}
                color="emerald"
              />
            </div>
          </motion.div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Informasi Mata Kuliah */}
            <FormSection
              title="Informasi Mata Kuliah"
              description="Data mata kuliah dan pertemuan"
              icon={BookOpen}
              gradient="from-indigo-400 to-purple-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mata Kuliah - LOCKED if has attendance */}
                {schedule.logs_count > 0 ? (
                  <LockedField
                    label="Mata Kuliah"
                    value={schedule.course?.nama || ''}
                    reason="Tidak dapat diubah karena sudah ada data kehadiran"
                    icon={BookOpen}
                  />
                ) : (
                  <FormField
                    label="Mata Kuliah"
                    icon={BookOpen}
                    required
                    error={errors.course_id}
                  >
                    <select
                      value={form.data.course_id}
                      onChange={e => form.setData('course_id', e.target.value)}
                      className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nama} ({c.sks} SKS)
                        </option>
                      ))}
                    </select>
                  </FormField>
                )}

                {/* Pertemuan Ke */}
                <FormField
                  label="Pertemuan Ke"
                  icon={Hash}
                  required
                  error={errors.meeting_number}
                >
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={form.data.meeting_number}
                    onChange={e => form.setData('meeting_number', parseInt(e.target.value))}
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  />
                </FormField>

                {/* Judul/Topik */}
                <FormField
                  label="Judul/Topik Pertemuan"
                  icon={Type}
                  optional
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

            {/* Section 2: Waktu & Durasi */}
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
                  error={errors.date}
                  locked={schedule.is_active}
                  lockMessage={schedule.is_active ? "Tidak dapat diubah saat jadwal aktif" : undefined}
                >
                  <input
                    type="date"
                    value={form.data.date}
                    onChange={e => form.setData('date', e.target.value)}
                    disabled={schedule.is_active}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 transition-all [color-scheme:dark]",
                      schedule.is_active
                        ? "bg-white/5 border-white/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                        : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/10 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
                    )}
                  />
                </FormField>

                {/* Hari */}
                <FormField
                  label="Hari"
                  icon={Calendar}
                  required
                  error={errors.day}
                >
                  <select
                    value={form.data.day}
                    onChange={e => form.setData('day', e.target.value)}
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  >
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
                  error={errors.start_time}
                  locked={schedule.is_active}
                  lockMessage={schedule.is_active ? "Tidak dapat diubah saat jadwal aktif" : undefined}
                >
                  <input
                    type="time"
                    value={form.data.start_time}
                    onChange={e => form.setData('start_time', e.target.value)}
                    disabled={schedule.is_active}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 transition-all [color-scheme:dark]",
                      schedule.is_active
                        ? "bg-white/5 border-white/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                        : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/10 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
                    )}
                  />
                </FormField>

                {/* Waktu Selesai */}
                <FormField
                  label="Waktu Selesai"
                  icon={Clock}
                  required
                  error={errors.end_time}
                  locked={schedule.is_active}
                  lockMessage={schedule.is_active ? "Tidak dapat diubah saat jadwal aktif" : undefined}
                >
                  <input
                    type="time"
                    value={form.data.end_time}
                    onChange={e => form.setData('end_time', e.target.value)}
                    disabled={schedule.is_active}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 transition-all [color-scheme:dark]",
                      schedule.is_active
                        ? "bg-white/5 border-white/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                        : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/10 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
                    )}
                  />
                </FormField>
              </div>

              {/* Duration Calculator */}
              <DurationCalculator 
                startTime={form.data.start_time} 
                endTime={form.data.end_time}
                sks={selectedCourse?.sks}
              />

              {/* Conflict Checker */}
              {!schedule.is_active && hasTimeChanged && (
                <ConflictChecker 
                  date={form.data.date}
                  startTime={form.data.start_time}
                  endTime={form.data.end_time}
                  courseId={form.data.course_id}
                  excludeId={schedule.id}
                />
              )}
            </FormSection>

            {/* Section 3: Lokasi & Ruangan */}
            <FormSection
              title="Lokasi & Ruangan"
              description="Tentukan tempat perkuliahan"
              icon={MapPin}
              gradient="from-pink-400 to-rose-600"
            >
              {/* Location Type & Fields */}
              {/* Similar to create page */}
            </FormSection>

            {/* Change Summary */}
            {hasChanges && (
              <ChangeTracker changes={getChanges()} />
            )}

            {/* Action Buttons */}
            <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-white/20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6">
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (hasChanges) {
                      if (confirm('Ada perubahan yang belum disimpan. Yakin ingin membatalkan?')) {
                        router.visit('/admin/jadwal')
                      }
                    } else {
                      router.visit('/admin/jadwal')
                    }
                  }}
                  disabled={form.processing}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                
                <Button
                  type="submit"
                  disabled={form.processing || !hasChanges}
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                >
                  {form.processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Success Animation */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 20 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Berhasil!</h3>
                  <p className="text-gray-400 text-lg">Jadwal berhasil diperbarui</p>
                  <p className="text-gray-500 text-sm mt-2">Mengalihkan ke daftar jadwal...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  )
}

// Helper Components (InfoItem, FormSection, FormField, LockedField, ChangeTracker, DurationCalculator, ConflictChecker)
```

---

## ✅ CHECKLIST IMPLEMENTASI LENGKAP

### Design & UI/UX
- [ ] Header matching 100% dengan Dashboard
- [ ] Icon tanpa container wrapper
- [ ] Warna gradient konsisten
- [ ] Typography 1 tema rapi
- [ ] Spacing & padding konsisten
- [ ] Border radius konsisten
- [ ] Shadow effects matching

### Functionality
- [ ] Load existing schedule data
- [ ] Detect changes real-time
- [ ] Validate based on schedule status
- [ ] Lock fields when appropriate
- [ ] Show change summary
- [ ] Unsaved changes warning
- [ ] Success feedback
- [ ] Error handling

### Validation Rules
- [ ] Can't edit completed schedule
- [ ] Can't change course if has attendance
- [ ] Can't change time if active
- [ ] Duration 50-200 minutes
- [ ] End time after start time
- [ ] Location validation
- [ ] Conflict checking

### User Experience
- [ ] Clear locked field indicators
- [ ] Helpful error messages
- [ ] Change tracking visible
- [ ] Loading states
- [ ] Success animation
- [ ] Back button confirmation
- [ ] Edit history sidebar

### Responsive Design
- [ ] Mobile layout (320px+)
- [ ] Tablet layout (768px+)
- [ ] Desktop layout (1024px+)
- [ ] Touch-friendly buttons
- [ ] Readable typography
- [ ] Proper spacing

### Performance
- [ ] No unnecessary re-renders
- [ ] Optimized animations
- [ ] Efficient validation
- [ ] Proper memoization

---

## 🎯 KESIMPULAN

Halaman Edit Jadwal harus:

1. **Konsisten 100%** dengan Dashboard Admin
2. **Smart Validation** berdasarkan status jadwal
3. **Change Tracking** yang jelas
4. **Field Locking** untuk data sensitif
5. **Responsive** di semua device
6. **User-Friendly** dengan feedback yang jelas
7. **No Data Dummy** - semua data real

Implementasikan dengan SANGAT SANGAT SERIUS dan perhatikan SETIAP DETAIL! Ini adalah menu KRUSIAL untuk manajemen jadwal perkuliahan! 🚀
