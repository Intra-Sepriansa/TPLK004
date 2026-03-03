# 🎯 PROMPT ULTRA ADVANCED: HALAMAN EDIT SESI ABSEN - ADMIN PANEL

## 📋 OVERVIEW PENGEMBANGAN

Ini adalah pengembangan halaman **Edit Sesi Absen** yang terpisah (bukan modal) di Admin Panel. Halaman ini harus mengikuti struktur dan pattern yang sama dengan halaman **Create Sesi Absen** namun dengan konteks editing yang jelas dan fitur-fitur tambahan untuk tracking perubahan.

**File Target:** `resources/js/pages/admin/sesi-absen/edit.tsx`

**Route:** `/admin/sesi-absen/{id}/edit`

---

## 🎨 DESIGN SYSTEM & CONSISTENCY

### 1. MATCHING dengan Create Page

**Struktur yang HARUS sama:**
- Header dengan gradient background
- Stepper navigation (jika multi-step)
- Form layout dan spacing
- Button styling dan positioning
- Responsive behavior
- Animation patterns

**Perbedaan dengan Create:**
- Title: "Edit Sesi Absen" (bukan "Buat Sesi Baru")
- Icon: EditSesiIcon (bukan SesiBaruIcon)
- Tombol submit: "Simpan Perubahan" (bukan "Buat Sesi")
- Tambahan: Change tracking & history
- Tambahan: Warning untuk field yang locked

### 2. COLOR PALETTE

```typescript
// Gradient System - Matching Dashboard
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

---

## 🏗️ STRUKTUR HALAMAN

### 1. HEADER SECTION

```tsx
{/* Header - Ultra Advanced Design */}
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
  
  {/* Overlays */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
  <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

  <div className="relative">
    {/* Back Button */}
    <motion.button
      whileHover={{ scale: 1.02, x: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.visit('/admin/sesi-absen')}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
    >
      <ChevronLeft className="h-4 w-4" />
      Kembali ke Daftar Sesi
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
            src={EditSesiIcon} 
            alt="Edit Sesi" 
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
            Manajemen Kehadiran
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl sm:text-3xl font-bold"
          >
            Edit Sesi Absen
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-blue-100/80 text-sm sm:text-base"
          >
            Perbarui informasi sesi absensi dengan lengkap dan akurat
          </motion.p>
        </div>
      </div>

      {/* Session Info Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl"
      >
        <p className="text-xs text-indigo-100/90">Sesi ID</p>
        <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
          <FileText className="h-4 w-4" />
          #{session.id}
        </div>
      </motion.div>
    </div>
  </div>
</motion.div>
```

### 2. SESSION INFO CARD

**Tampilkan info sesi yang sedang diedit:**

```tsx
{/* Current Session Info */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="mb-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
>
  <div className="flex items-start justify-between mb-4">
    <div>
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
        Informasi Sesi Saat Ini
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Data yang sedang aktif untuk sesi ini
      </p>
    </div>
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-medium",
      session.is_active 
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        : "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
    )}>
      {session.is_active ? 'Aktif' : 'Tidak Aktif'}
    </span>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <InfoItem 
      icon={BookOpen}
      label="Mata Kuliah"
      value={session.course_name}
      color="indigo"
    />
    <InfoItem 
      icon={Calendar}
      label="Pertemuan"
      value={`#${session.meeting_number}`}
      color="purple"
    />
    <InfoItem 
      icon={Clock}
      label="Waktu"
      value={formatDateTime(session.start_at)}
      color="pink"
    />
    <InfoItem 
      icon={Users}
      label="Kehadiran"
      value={`${session.logs_count} mahasiswa`}
      color="emerald"
    />
  </div>
</motion.div>
```

---

## 📝 FORM STRUCTURE

### Option 1: Single Page Form (Recommended untuk Edit)

**Lebih sederhana dan langsung:**


```tsx
{/* Main Form Container */}
<form onSubmit={handleSubmit} className="space-y-6">
  
  {/* Section 1: Informasi Dasar */}
  <FormSection
    title="Informasi Dasar"
    description="Data utama sesi absensi"
    icon={FileText}
    gradient="from-indigo-400 to-purple-600"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Mata Kuliah - LOCKED */}
      <FormField
        label="Mata Kuliah"
        icon={BookOpen}
        locked
        lockMessage="Mata kuliah tidak dapat diubah setelah sesi dibuat"
      >
        <select
          value={form.data.course_id}
          disabled
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
        >
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.nama}</option>
          ))}
        </select>
      </FormField>

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
          max="21"
          value={form.data.meeting_number}
          onChange={e => form.setData('meeting_number', parseInt(e.target.value))}
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
        />
      </FormField>

      {/* Judul Sesi */}
      <FormField
        label="Judul Sesi"
        icon={AlignLeft}
        optional
        helper="Contoh: UTS, Kuis 1, Presentasi"
      >
        <input
          type="text"
          value={form.data.title || ''}
          onChange={e => form.setData('title', e.target.value)}
          placeholder="Masukkan judul sesi (opsional)"
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
        />
      </FormField>

      {/* Deskripsi */}
      <FormField
        label="Deskripsi"
        icon={FileText}
        optional
        className="md:col-span-2"
      >
        <textarea
          value={form.data.description || ''}
          onChange={e => form.setData('description', e.target.value)}
          placeholder="Tambahkan deskripsi atau catatan untuk sesi ini"
          rows={3}
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all resize-none"
        />
      </FormField>
    </div>
  </FormSection>

  {/* Section 2: Jadwal & Waktu */}
  <FormSection
    title="Jadwal & Waktu"
    description="Atur waktu pelaksanaan sesi"
    icon={Clock}
    gradient="from-purple-400 to-pink-600"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Waktu Mulai */}
      <FormField
        label="Waktu Mulai"
        icon={Clock}
        required
        error={errors.start_at}
      >
        <input
          type="datetime-local"
          value={form.data.start_at}
          onChange={e => form.setData('start_at', e.target.value)}
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all [color-scheme:dark]"
        />
      </FormField>

      {/* Waktu Selesai */}
      <FormField
        label="Waktu Selesai"
        icon={Clock}
        required
        error={errors.end_at}
      >
        <input
          type="datetime-local"
          value={form.data.end_at}
          onChange={e => form.setData('end_at', e.target.value)}
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all [color-scheme:dark]"
        />
      </FormField>
    </div>

    {/* Duration Display */}
    <DurationCalculator 
      startAt={form.data.start_at} 
      endAt={form.data.end_at} 
    />

    {/* Time Presets */}
    <TimePresets onSelect={handleTimePreset} />
  </FormSection>

  {/* Section 3: Pengaturan Lanjutan */}
  <FormSection
    title="Pengaturan Lanjutan"
    description="Konfigurasi tambahan untuk sesi"
    icon={Settings}
    gradient="from-pink-400 to-rose-600"
    collapsible
  >
    {/* Advanced settings here */}
  </FormSection>

  {/* Change Summary */}
  {hasChanges && (
    <ChangeSummary changes={getChanges()} />
  )}

  {/* Action Buttons */}
  <div className="sticky bottom-0 z-10 -mx-6 -mb-6 border-t border-white/20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6">
    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.visit('/admin/sesi-absen')}
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
```

### Option 2: Multi-Step Form (Seperti Create)

**Jika ingin konsistensi penuh dengan Create:**

```tsx
{/* Stepper Navigation */}
<StepperNavigation 
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
  completedSteps={completedSteps}
/>

{/* Step Content */}
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {renderStepContent(currentStep)}
  </motion.div>
</AnimatePresence>

{/* Navigation Buttons */}
<div className="flex justify-between mt-8">
  <Button
    type="button"
    variant="outline"
    onClick={handleBack}
    disabled={currentStep === 1}
  >
    <ChevronLeft className="mr-2 h-4 w-4" />
    Sebelumnya
  </Button>
  
  {currentStep < steps.length ? (
    <Button onClick={handleNext}>
      Selanjutnya
      <ChevronRight className="ml-2 h-4 w-4" />
    </Button>
  ) : (
    <Button onClick={handleSubmit}>
      <Save className="mr-2 h-4 w-4" />
      Simpan Perubahan
    </Button>
  )}
</div>
```

---

## 🎯 FITUR KHUSUS EDIT PAGE

### 1. CHANGE TRACKING

**Track semua perubahan yang dilakukan:**

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

const ChangeItem = ({ change }: { change: Change }) => (
  <div className="flex items-start gap-2 text-sm">
    <Edit className="h-3 w-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
    <div className="flex-1">
      <span className="font-medium text-amber-900 dark:text-amber-100">
        {change.field}:
      </span>
      <div className="mt-1 space-y-1">
        <p className="text-amber-700 dark:text-amber-300 line-through">
          {change.oldValue}
        </p>
        <p className="text-amber-900 dark:text-amber-100 font-medium">
          → {change.newValue}
        </p>
      </div>
    </div>
  </div>
)
```

### 2. UNSAVED CHANGES WARNING

**Peringatan jika ada perubahan belum disimpan:**

```tsx
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = 'Ada perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?'
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [hasUnsavedChanges])

// Inertia navigation warning
router.on('before', (event) => {
  if (hasUnsavedChanges) {
    if (!confirm('Ada perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?')) {
      event.preventDefault()
    }
  }
})
```

### 3. FIELD LOCK INDICATOR

**Visual untuk field yang tidak bisa diedit:**

```tsx
const LockedField = ({ 
  label, 
  value, 
  reason 
}: { 
  label: string
  value: string
  reason: string 
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
      <Lock className="h-4 w-4 text-gray-400" />
      {label}
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

### 4. EDIT HISTORY SIDEBAR

**Tampilkan riwayat edit (jika ada):**

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

### 5. VALIDATION DENGAN CONTEXT

**Validasi yang aware dengan status sesi:**

```tsx
const validateEdit = (data: FormData, session: Session) => {
  const errors: Record<string, string> = {}
  
  // Tidak bisa edit sesi yang sudah selesai
  if (session.status === 'completed') {
    errors._form = 'Sesi yang sudah selesai tidak dapat diedit'
  }
  
  // Tidak bisa ubah waktu jika sesi aktif
  if (session.is_active) {
    if (data.start_at !== session.start_at || data.end_at !== session.end_at) {
      errors.start_at = 'Tidak dapat mengubah waktu sesi yang sedang aktif'
    }
  }
  
  // Tidak bisa ubah pertemuan jika sudah ada kehadiran
  if (session.logs_count > 0 && data.meeting_number !== session.meeting_number) {
    errors.meeting_number = 'Tidak dapat mengubah nomor pertemuan karena sudah ada data kehadiran'
  }
  
  // Validasi waktu
  if (data.start_at && data.end_at) {
    const start = new Date(data.start_at)
    const end = new Date(data.end_at)
    
    if (end <= start) {
      errors.end_at = 'Waktu selesai harus setelah waktu mulai'
    }
    
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)
    if (duration < 30) {
      errors.end_at = 'Durasi minimal 30 menit'
    }
    if (duration > 240) {
      errors.end_at = 'Durasi maksimal 4 jam'
    }
  }
  
  return errors
}
```

---

## 🎨 REUSABLE COMPONENTS

### 1. FormSection Component

```tsx
interface FormSectionProps {
  title: string
  description: string
  icon: LucideIcon
  gradient: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

const FormSection = ({
  title,
  description,
  icon: Icon,
  gradient,
  children,
  collapsible = false,
  defaultOpen = true
}: FormSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
    >
      <div 
        className={cn(
          "p-6 border-b border-white/10 dark:border-white/5",
          collapsible && "cursor-pointer hover:bg-white/50 dark:hover:bg-neutral-800/50 transition-colors"
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
              gradient
            )}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            </div>
          </div>
          {collapsible && (
            <ChevronRight className={cn(
              "h-5 w-5 text-neutral-400 transition-transform",
              isOpen && "rotate-90"
            )} />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

### 2. FormField Component

```tsx
interface FormFieldProps {
  label: string
  icon?: LucideIcon
  required?: boolean
  optional?: boolean
  locked?: boolean
  lockMessage?: string
  error?: string
  helper?: string
  children: React.ReactNode
  className?: string
}

const FormField = ({
  label,
  icon: Icon,
  required,
  optional,
  locked,
  lockMessage,
  error,
  helper,
  children,
  className
}: FormFieldProps) => (
  <div className={cn("space-y-2", className)}>
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      {required && <span className="text-red-500">*</span>}
      {optional && (
        <span className="text-xs font-normal text-gray-500">(Opsional)</span>
      )}
      {locked && <Lock className="h-3 w-3 text-gray-400" />}
    </label>
    
    <div className="relative">
      {children}
      {locked && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
    
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
      >
        <AlertCircle className="h-3 w-3" />
        {error}
      </motion.p>
    )}
    
    {helper && !error && (
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {helper}
      </p>
    )}
    
    {lockMessage && locked && (
      <p className="text-xs text-gray-500 italic flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {lockMessage}
      </p>
    )}
  </div>
)
```

### 3. InfoItem Component

```tsx
const InfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: LucideIcon
  label: string
  value: string
  color: string 
}) => {
  const colorConfigs: Record<string, string> = {
    indigo: "from-indigo-400 to-indigo-600",
    purple: "from-purple-400 to-purple-600",
    pink: "from-pink-400 to-pink-600",
    emerald: "from-emerald-400 to-emerald-600",
  }
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-800/50">
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg",
        colorConfigs[color]
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
          {value}
        </p>
      </div>
    </div>
  )
}
```

---

## 📱 RESPONSIVE DESIGN

### Mobile Optimization:

```tsx
// Container
className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"

// Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"

// Typography
className="text-2xl sm:text-3xl lg:text-4xl"

// Buttons
className="w-full sm:w-auto"

// Spacing
className="space-y-4 sm:space-y-6 lg:space-y-8"
```

---

## 🚀 COMPLETE IMPLEMENTATION EXAMPLE


```tsx
// resources/js/pages/admin/sesi-absen/edit.tsx

import { Head, router, useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Save, AlertCircle, BookOpen, Hash, AlignLeft,
  Clock, FileText, Settings, Edit, Lock, Loader2, CheckCircle2
} from 'lucide-react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import EditSesiIcon from '@/assets/admin/sesi-absen/edit-sesi-icon.png'

interface Session {
  id: number
  course_id: number
  course_name: string
  dosen_name: string
  meeting_number: number
  title: string | null
  description: string | null
  start_at: string
  end_at: string
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
  dosen: string
}

interface PageProps {
  session: Session
  courses: Course[]
  editHistory?: EditLog[]
}

export default function EditSesiAbsen({ session, courses, editHistory = [] }: PageProps) {
  const form = useForm({
    course_id: session.course_id.toString(),
    meeting_number: session.meeting_number,
    title: session.title || '',
    description: session.description || '',
    start_at: session.start_at,
    end_at: session.end_at,
  })

  const [originalData] = useState(form.data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Detect changes
  const hasChanges = JSON.stringify(form.data) !== JSON.stringify(originalData)
  
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
    
    // Meeting number
    if (form.data.meeting_number < 1 || form.data.meeting_number > 21) {
      newErrors.meeting_number = 'Nomor pertemuan harus antara 1-21'
    }
    
    // Can't change meeting if has attendance
    if (session.logs_count > 0 && form.data.meeting_number !== session.meeting_number) {
      newErrors.meeting_number = 'Tidak dapat mengubah nomor pertemuan karena sudah ada data kehadiran'
    }
    
    // Time validation
    if (form.data.start_at && form.data.end_at) {
      const start = new Date(form.data.start_at)
      const end = new Date(form.data.end_at)
      
      if (end <= start) {
        newErrors.end_at = 'Waktu selesai harus setelah waktu mulai'
      }
      
      const duration = (end.getTime() - start.getTime()) / (1000 * 60)
      if (duration < 30) {
        newErrors.end_at = 'Durasi minimal 30 menit'
      }
      if (duration > 240) {
        newErrors.end_at = 'Durasi maksimal 4 jam'
      }
    }
    
    // Can't change time if active
    if (session.is_active) {
      if (form.data.start_at !== session.start_at || form.data.end_at !== session.end_at) {
        newErrors.start_at = 'Tidak dapat mengubah waktu sesi yang sedang aktif'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    form.patch(`/admin/sesi-absen/${session.id}`, {
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => {
          router.visit('/admin/sesi-absen')
        }, 2000)
      },
      onError: (errors) => {
        setErrors(errors)
      }
    })
  }

  return (
    <AppLayout>
      <Head title={`Edit Sesi #${session.id}`} />
      
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
                      router.visit('/admin/sesi-absen')
                    }
                  } else {
                    router.visit('/admin/sesi-absen')
                  }
                }}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali ke Daftar Sesi
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
                      src={EditSesiIcon} 
                      alt="Edit Sesi" 
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
                      Manajemen Kehadiran
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl sm:text-3xl font-bold"
                    >
                      Edit Sesi Absen
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2 text-blue-100/80 text-sm sm:text-base"
                    >
                      Perbarui informasi sesi absensi dengan lengkap dan akurat
                    </motion.p>
                  </div>
                </div>

                {/* Session Info Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl"
                >
                  <p className="text-xs text-indigo-100/90">Sesi ID</p>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                    <FileText className="h-4 w-4" />
                    #{session.id}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Current Session Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Informasi Sesi Saat Ini
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Data yang sedang aktif untuk sesi ini
                </p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                session.is_active 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
              )}>
                {session.is_active ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem 
                icon={BookOpen}
                label="Mata Kuliah"
                value={session.course_name}
                color="indigo"
              />
              <InfoItem 
                icon={Hash}
                label="Pertemuan"
                value={`#${session.meeting_number}`}
                color="purple"
              />
              <InfoItem 
                icon={Clock}
                label="Waktu"
                value={new Date(session.start_at).toLocaleString('id-ID', { 
                  day: '2-digit', 
                  month: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                color="pink"
              />
              <InfoItem 
                icon={Users}
                label="Kehadiran"
                value={`${session.logs_count} mahasiswa`}
                color="emerald"
              />
            </div>
          </motion.div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Informasi Dasar */}
            <FormSection
              title="Informasi Dasar"
              description="Data utama sesi absensi"
              icon={FileText}
              gradient="from-indigo-400 to-purple-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mata Kuliah - LOCKED */}
                <FormField
                  label="Mata Kuliah"
                  icon={BookOpen}
                  locked
                  lockMessage="Mata kuliah tidak dapat diubah setelah sesi dibuat"
                >
                  <select
                    value={form.data.course_id}
                    disabled
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </FormField>

                {/* Pertemuan Ke */}
                <FormField
                  label="Pertemuan Ke"
                  icon={Hash}
                  required
                  error={errors.meeting_number}
                  locked={session.logs_count > 0}
                  lockMessage={session.logs_count > 0 ? "Tidak dapat diubah karena sudah ada data kehadiran" : undefined}
                >
                  <input
                    type="number"
                    min="1"
                    max="21"
                    value={form.data.meeting_number}
                    onChange={e => form.setData('meeting_number', parseInt(e.target.value))}
                    disabled={session.logs_count > 0}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 transition-all",
                      session.logs_count > 0
                        ? "bg-white/5 border-white/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                        : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/10 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
                    )}
                  />
                </FormField>

                {/* Judul Sesi */}
                <FormField
                  label="Judul Sesi"
                  icon={AlignLeft}
                  optional
                  helper="Contoh: UTS, Kuis 1, Presentasi"
                >
                  <input
                    type="text"
                    value={form.data.title}
                    onChange={e => form.setData('title', e.target.value)}
                    placeholder="Masukkan judul sesi (opsional)"
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  />
                </FormField>

                {/* Deskripsi */}
                <FormField
                  label="Deskripsi"
                  icon={FileText}
                  optional
                  className="md:col-span-2"
                >
                  <textarea
                    value={form.data.description}
                    onChange={e => form.setData('description', e.target.value)}
                    placeholder="Tambahkan deskripsi atau catatan untuk sesi ini"
                    rows={3}
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all resize-none"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Section 2: Jadwal & Waktu */}
            <FormSection
              title="Jadwal & Waktu"
              description="Atur waktu pelaksanaan sesi"
              icon={Clock}
              gradient="from-purple-400 to-pink-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Waktu Mulai */}
                <FormField
                  label="Waktu Mulai"
                  icon={Clock}
                  required
                  error={errors.start_at}
                  locked={session.is_active}
                  lockMessage={session.is_active ? "Tidak dapat diubah saat sesi aktif" : undefined}
                >
                  <input
                    type="datetime-local"
                    value={form.data.start_at}
                    onChange={e => form.setData('start_at', e.target.value)}
                    disabled={session.is_active}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 transition-all [color-scheme:dark]",
                      session.is_active
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
                  error={errors.end_at}
                  locked={session.is_active}
                  lockMessage={session.is_active ? "Tidak dapat diubah saat sesi aktif" : undefined}
                >
                  <input
                    type="datetime-local"
                    value={form.data.end_at}
                    onChange={e => form.setData('end_at', e.target.value)}
                    disabled={session.is_active}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 transition-all [color-scheme:dark]",
                      session.is_active
                        ? "bg-white/5 border-white/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                        : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/10 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
                    )}
                  />
                </FormField>
              </div>

              {/* Duration Display */}
              <DurationCalculator 
                startAt={form.data.start_at} 
                endAt={form.data.end_at} 
              />

              {/* Time Presets */}
              {!session.is_active && (
                <TimePresets onSelect={(minutes) => {
                  if (form.data.start_at) {
                    const start = new Date(form.data.start_at)
                    const end = new Date(start.getTime() + minutes * 60000)
                    form.setData('end_at', end.toISOString().slice(0, 16))
                  }
                }} />
              )}
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
                        router.visit('/admin/sesi-absen')
                      }
                    } else {
                      router.visit('/admin/sesi-absen')
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

          {/* Success Overlay */}
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
                  <p className="text-gray-400 text-lg">Sesi absen berhasil diperbarui</p>
                  <p className="text-gray-500 text-sm mt-2">Mengalihkan ke daftar sesi...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  )
}

// Helper Components
const InfoItem = ({ icon: Icon, label, value, color }: any) => {
  const colorConfigs: Record<string, string> = {
    indigo: "from-indigo-400 to-indigo-600",
    purple: "from-purple-400 to-purple-600",
    pink: "from-pink-400 to-pink-600",
    emerald: "from-emerald-400 to-emerald-600",
  }
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-800/50">
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg",
        colorConfigs[color]
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  )
}

// ... (FormSection, FormField, DurationCalculator, TimePresets, ChangeTracker components)
```

---

## ✅ CHECKLIST IMPLEMENTASI

### Design & UI/UX
- [ ] Header matching dengan Create page
- [ ] Icon tanpa container wrapper
- [ ] Warna gradient konsisten
- [ ] Typography matching
- [ ] Spacing & padding konsisten
- [ ] Border radius konsisten
- [ ] Shadow effects matching

### Functionality
- [ ] Load existing session data
- [ ] Detect changes real-time
- [ ] Validate based on session status
- [ ] Lock fields when appropriate
- [ ] Show change summary
- [ ] Unsaved changes warning
- [ ] Success feedback
- [ ] Error handling

### Responsive Design
- [ ] Mobile layout (320px+)
- [ ] Tablet layout (768px+)
- [ ] Desktop layout (1024px+)
- [ ] Touch-friendly buttons
- [ ] Readable typography
- [ ] Proper spacing

### Validation Rules
- [ ] Meeting number 1-21
- [ ] Can't change meeting if has attendance
- [ ] Can't change time if active
- [ ] Duration 30-240 minutes
- [ ] End time after start time
- [ ] Required fields validation

### User Experience
- [ ] Clear locked field indicators
- [ ] Helpful error messages
- [ ] Change tracking visible
- [ ] Keyboard shortcuts
- [ ] Loading states
- [ ] Success animation
- [ ] Back button confirmation

### Performance
- [ ] No unnecessary re-renders
- [ ] Optimized animations
- [ ] Efficient validation
- [ ] Proper memoization

---

## 🎯 KESIMPULAN

Halaman Edit Sesi Absen harus:

1. **Konsisten** dengan halaman Create
2. **Smart Validation** berdasarkan status sesi
3. **Change Tracking** yang jelas
4. **Field Locking** untuk data sensitif
5. **Responsive** di semua device
6. **User-Friendly** dengan feedback yang jelas
7. **No Data Dummy** - semua data real

Implementasikan dengan SANGAT SERIUS dan perhatikan setiap detail! 🚀
