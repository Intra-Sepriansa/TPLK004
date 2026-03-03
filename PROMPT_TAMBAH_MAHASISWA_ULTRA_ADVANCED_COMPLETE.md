# 🎯 PROMPT ULTRA ADVANCED: HALAMAN TAMBAH MAHASISWA - ADMIN PANEL

## 📋 OVERVIEW PENGEMBANGAN

Ini adalah pengembangan halaman **Tambah Mahasiswa** yang terpisah (bukan modal) di Admin Panel. Halaman ini SANGAT KRUSIAL dan PENTING untuk manajemen data mahasiswa. Implementasi harus dilakukan dengan SANGAT SERIUS dengan standar kualitas tertinggi.

**File Target:** `resources/js/pages/admin/mahasiswa/create.tsx`

**Route:** `/admin/mahasiswa/create`

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

**Icon Header:** `iconMahasiswa` atau icon tambah mahasiswa yang sesuai

**Icon untuk Card/Field:** Matching antara warna icon dan warna container

```typescript
const iconColors = {
  user: { gradient: "from-indigo-400 to-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  hash: { gradient: "from-purple-400 to-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  building: { gradient: "from-pink-400 to-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  book: { gradient: "from-emerald-400 to-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  calendar: { gradient: "from-amber-400 to-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" }
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
      onClick={() => router.visit('/admin/mahasiswa')}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
    >
      <ChevronLeft className="h-4 w-4" />
      Kembali ke Daftar Mahasiswa
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
            src={iconMahasiswa} 
            alt="Tambah Mahasiswa" 
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
            Manajemen Data Mahasiswa
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl sm:text-3xl font-bold"
          >
            Tambah Mahasiswa Baru
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-blue-100/80 text-sm sm:text-base"
          >
            Daftarkan mahasiswa baru ke dalam sistem dengan lengkap dan akurat
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
        <p className="text-xs text-indigo-100/90">Total Mahasiswa</p>
        <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
          <Users className="h-4 w-4" />
          {stats.total} Mahasiswa
        </div>
      </motion.div>
    </div>
  </div>
</motion.div>
```

---

## 📝 FORM STRUCTURE - COMPREHENSIVE

### Section 1: Informasi Pribadi

```tsx
<FormSection
  title="Informasi Pribadi"
  description="Data identitas mahasiswa"
  icon={User}
  gradient="from-indigo-400 to-purple-600"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Nama Lengkap */}
    <FormField
      label="Nama Lengkap"
      icon={User}
      required
      error={form.errors.nama}
      helper="Masukkan nama lengkap sesuai KTP"
    >
      <input
        type="text"
        value={form.data.nama}
        onChange={e => form.setData('nama', e.target.value)}
        placeholder="Contoh: Ahmad Rizki Pratama"
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
        autoFocus
      />
    </FormField>

    {/* NIM */}
    <FormField
      label="Nomor Induk Mahasiswa (NIM)"
      icon={Hash}
      required
      error={form.errors.nim}
      helper="Format: 10 digit angka"
    >
      <input
        type="text"
        value={form.data.nim}
        onChange={e => form.setData('nim', e.target.value)}
        placeholder="Contoh: 2110101234"
        maxLength={10}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all font-mono"
      />
    </FormField>

    {/* Email */}
    <FormField
      label="Email"
      icon={Mail}
      required
      error={form.errors.email}
      helper="Email aktif untuk notifikasi sistem"
    >
      <input
        type="email"
        value={form.data.email}
        onChange={e => form.setData('email', e.target.value)}
        placeholder="Contoh: ahmad.rizki@student.unpam.ac.id"
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      />
    </FormField>

    {/* No. Telepon */}
    <FormField
      label="Nomor Telepon"
      icon={Phone}
      optional
      helper="Format: 08xxxxxxxxxx"
    >
      <input
        type="tel"
        value={form.data.phone}
        onChange={e => form.setData('phone', e.target.value)}
        placeholder="Contoh: 081234567890"
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      />
    </FormField>
  </div>
</FormSection>
```

### Section 2: Informasi Akademik

```tsx
<FormSection
  title="Informasi Akademik"
  description="Data perkuliahan dan program studi"
  icon={GraduationCap}
  gradient="from-purple-400 to-pink-600"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Fakultas */}
    <FormField
      label="Fakultas"
      icon={Building2}
      required
      error={form.errors.fakultas}
    >
      <select
        value={form.data.fakultas}
        onChange={e => form.setData('fakultas', e.target.value)}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      >
        <option value="">Pilih Fakultas</option>
        {fakultasList.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </FormField>

    {/* Program Studi */}
    <FormField
      label="Program Studi"
      icon={BookOpen}
      required
      error={form.errors.prodi}
    >
      <select
        value={form.data.prodi}
        onChange={e => form.setData('prodi', e.target.value)}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
        disabled={!form.data.fakultas}
      >
        <option value="">Pilih Program Studi</option>
        {prodiList.map(p => (
          <option key={p.id} value={p.id}>{p.nama}</option>
        ))}
      </select>
    </FormField>

    {/* Kelas */}
    <FormField
      label="Kelas"
      icon={Users}
      required
      error={form.errors.kelas}
    >
      <input
        type="text"
        value={form.data.kelas}
        onChange={e => form.setData('kelas', e.target.value)}
        placeholder="Contoh: 7A, 7B, 7C"
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      />
    </FormField>

    {/* Semester */}
    <FormField
      label="Semester"
      icon={Calendar}
      required
      error={form.errors.semester}
    >
      <select
        value={form.data.semester}
        onChange={e => form.setData('semester', parseInt(e.target.value))}
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      >
        {[1,2,3,4,5,6,7,8].map(sem => (
          <option key={sem} value={sem}>Semester {sem}</option>
        ))}
      </select>
    </FormField>
  </div>
</FormSection>
```

### Section 3: Keamanan Akun

```tsx
<FormSection
  title="Keamanan Akun"
  description="Password dan pengaturan keamanan"
  icon={Shield}
  gradient="from-pink-400 to-rose-600"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Password */}
    <FormField
      label="Password"
      icon={Lock}
      required
      error={form.errors.password}
      helper="Minimal 8 karakter, kombinasi huruf dan angka"
    >
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={form.data.password}
          onChange={e => form.setData('password', e.target.value)}
          placeholder="Masukkan password"
          className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 pr-12 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      <PasswordStrength password={form.data.password} />
    </FormField>

    {/* Konfirmasi Password */}
    <FormField
      label="Konfirmasi Password"
      icon={Lock}
      required
      error={form.errors.password_confirmation}
    >
      <input
        type={showPassword ? "text" : "password"}
        value={form.data.password_confirmation}
        onChange={e => form.setData('password_confirmation', e.target.value)}
        placeholder="Ulangi password"
        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
      />
    </FormField>
  </div>

  {/* Auto-generate Password Option */}
  <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id="auto-password"
        checked={autoGeneratePassword}
        onChange={e => setAutoGeneratePassword(e.target.checked)}
        className="mt-1"
      />
      <div className="flex-1">
        <label htmlFor="auto-password" className="text-sm font-medium text-indigo-900 dark:text-indigo-100 cursor-pointer">
          Generate Password Otomatis
        </label>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
          Sistem akan membuat password acak yang aman dan mengirimkannya ke email mahasiswa
        </p>
      </div>
    </div>
  </div>
</FormSection>
```

---

## 🎯 INOVASI FITUR SIGNIFIKAN

### 1. SMART NIM VALIDATOR

**Real-time validation dengan format checking:**


```tsx
const NIMValidator = ({ nim }: { nim: string }) => {
  const validate = () => {
    if (!nim) return null
    
    // Format: YYPPSSSSSS (10 digit)
    // YY = Tahun masuk (2 digit)
    // PP = Kode program studi (2 digit)
    // SSSSSS = Nomor urut (6 digit)
    
    if (nim.length !== 10) {
      return { valid: false, message: 'NIM harus 10 digit' }
    }
    
    if (!/^\d+$/.test(nim)) {
      return { valid: false, message: 'NIM harus berupa angka' }
    }
    
    const year = parseInt(nim.substring(0, 2))
    const currentYear = new Date().getFullYear() % 100
    
    if (year > currentYear || year < currentYear - 10) {
      return { valid: false, message: 'Tahun masuk tidak valid' }
    }
    
    return { valid: true, message: 'Format NIM valid' }
  }
  
  const result = validate()
  if (!result) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mt-2 p-3 rounded-lg flex items-center gap-2 text-sm",
        result.valid
          ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
          : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
      )}
    >
      {result.valid ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span>{result.message}</span>
    </motion.div>
  )
}
```

### 2. DUPLICATE CHECKER

**Check NIM/Email yang sudah terdaftar:**

```tsx
const [checking, setChecking] = useState(false)
const [duplicateCheck, setDuplicateCheck] = useState<{
  nim?: boolean
  email?: boolean
}>({})

const checkDuplicate = async (field: 'nim' | 'email', value: string) => {
  if (!value) return
  
  setChecking(true)
  try {
    const response = await fetch(`/api/mahasiswa/check-duplicate?${field}=${value}`)
    const data = await response.json()
    
    setDuplicateCheck(prev => ({
      ...prev,
      [field]: data.exists
    }))
  } catch (error) {
    console.error('Error checking duplicate:', error)
  } finally {
    setChecking(false)
  }
}

// Debounced check
useEffect(() => {
  const timer = setTimeout(() => {
    if (form.data.nim.length === 10) {
      checkDuplicate('nim', form.data.nim)
    }
  }, 500)
  
  return () => clearTimeout(timer)
}, [form.data.nim])

// Duplicate Warning Component
const DuplicateWarning = ({ field, exists }: { field: string; exists: boolean }) => {
  if (!exists) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2"
    >
      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          {field === 'nim' ? 'NIM' : 'Email'} sudah terdaftar
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          Mahasiswa dengan {field === 'nim' ? 'NIM' : 'email'} ini sudah ada dalam sistem
        </p>
      </div>
    </motion.div>
  )
}
```

### 3. PASSWORD STRENGTH METER

**Visual indicator untuk kekuatan password:**

```tsx
const PasswordStrength = ({ password }: { password: string }) => {
  const calculateStrength = () => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    
    // Length
    if (password.length >= 8) score += 25
    if (password.length >= 12) score += 25
    
    // Complexity
    if (/[a-z]/.test(password)) score += 10
    if (/[A-Z]/.test(password)) score += 10
    if (/[0-9]/.test(password)) score += 15
    if (/[^a-zA-Z0-9]/.test(password)) score += 15
    
    if (score < 40) return { score, label: 'Lemah', color: 'from-red-500 to-rose-600' }
    if (score < 70) return { score, label: 'Sedang', color: 'from-amber-500 to-orange-600' }
    return { score, label: 'Kuat', color: 'from-emerald-500 to-teal-600' }
  }
  
  const strength = calculateStrength()
  if (!password) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 space-y-2"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">Kekuatan Password</span>
        <span className={cn(
          "font-medium",
          strength.score < 40 && "text-red-600 dark:text-red-400",
          strength.score >= 40 && strength.score < 70 && "text-amber-600 dark:text-amber-400",
          strength.score >= 70 && "text-emerald-600 dark:text-emerald-400"
        )}>
          {strength.label}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength.score}%` }}
          transition={{ duration: 0.3 }}
          className={cn("h-full bg-gradient-to-r", strength.color)}
        />
      </div>
      <div className="space-y-1">
        <PasswordRequirement met={password.length >= 8} text="Minimal 8 karakter" />
        <PasswordRequirement met={/[a-z]/.test(password)} text="Huruf kecil" />
        <PasswordRequirement met={/[A-Z]/.test(password)} text="Huruf besar" />
        <PasswordRequirement met={/[0-9]/.test(password)} text="Angka" />
        <PasswordRequirement met={/[^a-zA-Z0-9]/.test(password)} text="Karakter khusus" />
      </div>
    </motion.div>
  )
}

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <Circle className="h-3 w-3 text-gray-400" />
    )}
    <span className={cn(
      met ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"
    )}>
      {text}
    </span>
  </div>
)
```

### 4. AUTO-GENERATE PASSWORD

**Generate password yang aman secara otomatis:**

```tsx
const generateSecurePassword = () => {
  const length = 12
  const charset = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*'
  }
  
  let password = ''
  
  // Ensure at least one of each type
  password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)]
  password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)]
  password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)]
  password += charset.special[Math.floor(Math.random() * charset.special.length)]
  
  // Fill the rest
  const allChars = Object.values(charset).join('')
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

useEffect(() => {
  if (autoGeneratePassword) {
    const newPassword = generateSecurePassword()
    form.setData({
      password: newPassword,
      password_confirmation: newPassword
    })
  }
}, [autoGeneratePassword])
```

### 5. BULK IMPORT FEATURE

**Import mahasiswa dari Excel/CSV:**

```tsx
const BulkImportSection = () => {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  const handleImport = async () => {
    if (!file) return
    
    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/admin/mahasiswa/import', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      })
      
      const result = await response.json()
      setImportResult(result)
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setImporting(false)
    }
  }
  
  return (
    <FormSection
      title="Import Data Massal"
      description="Upload file Excel/CSV untuk menambahkan banyak mahasiswa sekaligus"
      icon={Upload}
      gradient="from-cyan-400 to-blue-600"
      collapsible
      defaultOpen={false}
    >
      <div className="space-y-4">
        {/* Download Template */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Download Template
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Gunakan template Excel untuk memastikan format data yang benar
              </p>
              <button
                type="button"
                onClick={() => window.open('/admin/mahasiswa/template', '_blank')}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Template Excel
              </button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-pink-500 dark:hover:border-pink-500 transition-colors">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="bulk-import-file"
          />
          <label htmlFor="bulk-import-file" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {file ? file.name : 'Klik untuk upload file'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: Excel (.xlsx, .xls) atau CSV (.csv)
            </p>
          </label>
        </div>

        {/* Import Button */}
        {file && (
          <Button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengimport...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
        )}

        {/* Import Result */}
        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h4 className="font-semibold text-neutral-900 dark:text-white">
                Import Selesai
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Berhasil</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {importResult.success}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                <p className="text-xs text-red-600 dark:text-red-400">Gagal</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {importResult.failed}
                </p>
              </div>
            </div>
            {importResult.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Error Log:
                </p>
                {importResult.errors.map((error, i) => (
                  <p key={i} className="text-xs text-red-600 dark:text-red-400">
                    • {error}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </FormSection>
  )
}
```

### 6. PREVIEW BEFORE SUBMIT

**Preview data sebelum menyimpan:**

```tsx
const [showPreview, setShowPreview] = useState(false)

const PreviewModal = () => (
  <AnimatePresence>
    {showPreview && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        onClick={() => setShowPreview(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-2xl font-bold">Preview Data Mahasiswa</h3>
            <p className="text-white/80 mt-1">Periksa kembali data sebelum menyimpan</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <PreviewItem label="Nama Lengkap" value={form.data.nama} icon={User} />
            <PreviewItem label="NIM" value={form.data.nim} icon={Hash} />
            <PreviewItem label="Email" value={form.data.email} icon={Mail} />
            <PreviewItem label="Fakultas" value={form.data.fakultas} icon={Building2} />
            <PreviewItem label="Program Studi" value={form.data.prodi} icon={BookOpen} />
            <PreviewItem label="Kelas" value={form.data.kelas} icon={Users} />
            <PreviewItem label="Semester" value={`Semester ${form.data.semester}`} icon={Calendar} />
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="flex-1"
            >
              Kembali Edit
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowPreview(false)
                handleSubmit()
              }}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Data
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

const PreviewItem = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</p>
    </div>
  </div>
)
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

// Form sections
className="space-y-4 sm:space-y-6" // Spacing responsive
```

### Mobile-Specific Optimizations:

```tsx
// Sticky Action Bar on Mobile
<div className="sticky bottom-0 left-0 right-0 z-10 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-white/20 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-0">
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
    <Button variant="outline" className="w-full sm:w-auto">
      Batal
    </Button>
    <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-600">
      Simpan
    </Button>
  </div>
</div>
```

---

## ✅ VALIDATION RULES

### Client-Side Validation:

```tsx
const validateForm = () => {
  const errors: Record<string, string> = {}
  
  // Nama
  if (!form.data.nama.trim()) {
    errors.nama = 'Nama lengkap wajib diisi'
  } else if (form.data.nama.length < 3) {
    errors.nama = 'Nama minimal 3 karakter'
  }
  
  // NIM
  if (!form.data.nim) {
    errors.nim = 'NIM wajib diisi'
  } else if (form.data.nim.length !== 10) {
    errors.nim = 'NIM harus 10 digit'
  } else if (!/^\d+$/.test(form.data.nim)) {
    errors.nim = 'NIM harus berupa angka'
  } else if (duplicateCheck.nim) {
    errors.nim = 'NIM sudah terdaftar'
  }
  
  // Email
  if (!form.data.email) {
    errors.email = 'Email wajib diisi'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email)) {
    errors.email = 'Format email tidak valid'
  } else if (duplicateCheck.email) {
    errors.email = 'Email sudah terdaftar'
  }
  
  // Fakultas
  if (!form.data.fakultas) {
    errors.fakultas = 'Fakultas wajib dipilih'
  }
  
  // Program Studi
  if (!form.data.prodi) {
    errors.prodi = 'Program studi wajib dipilih'
  }
  
  // Kelas
  if (!form.data.kelas) {
    errors.kelas = 'Kelas wajib diisi'
  }
  
  // Password (jika tidak auto-generate)
  if (!autoGeneratePassword) {
    if (!form.data.password) {
      errors.password = 'Password wajib diisi'
    } else if (form.data.password.length < 8) {
      errors.password = 'Password minimal 8 karakter'
    }
    
    if (form.data.password !== form.data.password_confirmation) {
      errors.password_confirmation = 'Konfirmasi password tidak cocok'
    }
  }
  
  return errors
}
```

---

## 🎨 COMPLETE IMPLEMENTATION EXAMPLE


```tsx
// resources/js/pages/admin/mahasiswa/create.tsx

import { Head, router, useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Save, User, Hash, Mail, Phone, Building2, BookOpen,
  Users, Calendar, Shield, Lock, Eye, EyeOff, Upload, Download,
  CheckCircle2, AlertCircle, AlertTriangle, Loader2, X, GraduationCap
} from 'lucide-react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import iconMahasiswa from '@/assets/admin/mahasiswa/icon-mahasiswa.png'
import { cn } from '@/lib/utils'

interface PageProps {
  fakultasList: string[]
  prodiList: { id: string; nama: string; fakultas: string }[]
  stats: {
    total: number
  }
}

export default function CreateMahasiswa({ fakultasList, prodiList, stats }: PageProps) {
  const form = useForm({
    nama: '',
    nim: '',
    email: '',
    phone: '',
    fakultas: '',
    prodi: '',
    kelas: '',
    semester: 1,
    password: '',
    password_confirmation: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [duplicateCheck, setDuplicateCheck] = useState<{
    nim?: boolean
    email?: boolean
  }>({})
  const [checking, setChecking] = useState(false)

  // Filter prodi based on fakultas
  const filteredProdi = form.data.fakultas
    ? prodiList.filter(p => p.fakultas === form.data.fakultas)
    : []

  // Auto-generate password
  useEffect(() => {
    if (autoGeneratePassword) {
      const newPassword = generateSecurePassword()
      form.setData({
        password: newPassword,
        password_confirmation: newPassword
      })
    }
  }, [autoGeneratePassword])

  // Check duplicate NIM
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.data.nim.length === 10) {
        checkDuplicate('nim', form.data.nim)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [form.data.nim])

  // Check duplicate Email
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email)) {
        checkDuplicate('email', form.data.email)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [form.data.email])

  const checkDuplicate = async (field: 'nim' | 'email', value: string) => {
    setChecking(true)
    try {
      const response = await fetch(`/api/mahasiswa/check-duplicate?${field}=${value}`)
      const data = await response.json()
      
      setDuplicateCheck(prev => ({
        ...prev,
        [field]: data.exists
      }))
    } catch (error) {
      console.error('Error checking duplicate:', error)
    } finally {
      setChecking(false)
    }
  }

  const generateSecurePassword = () => {
    const length = 12
    const charset = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      special: '!@#$%^&*'
    }
    
    let password = ''
    password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)]
    password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)]
    password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)]
    password += charset.special[Math.floor(Math.random() * charset.special.length)]
    
    const allChars = Object.values(charset).join('')
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    form.post('/admin/mahasiswa', {
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => {
          router.visit('/admin/mahasiswa')
        }, 2500)
      }
    })
  }

  return (
    <AppLayout>
      <Head title="Tambah Mahasiswa" />
      
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
                onClick={() => router.visit('/admin/mahasiswa')}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali ke Daftar Mahasiswa
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
                      src={iconMahasiswa} 
                      alt="Tambah Mahasiswa" 
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
                      Manajemen Data Mahasiswa
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl sm:text-3xl font-bold"
                    >
                      Tambah Mahasiswa Baru
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2 text-blue-100/80 text-sm sm:text-base"
                    >
                      Daftarkan mahasiswa baru ke dalam sistem dengan lengkap dan akurat
                    </motion.p>
                  </div>
                </div>

                {/* Stats Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl"
                >
                  <p className="text-xs text-indigo-100/90">Total Mahasiswa</p>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                    <Users className="h-4 w-4" />
                    {stats.total} Mahasiswa
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Informasi Pribadi */}
            <FormSection
              title="Informasi Pribadi"
              description="Data identitas mahasiswa"
              icon={User}
              gradient="from-indigo-400 to-purple-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Lengkap */}
                <FormField
                  label="Nama Lengkap"
                  icon={User}
                  required
                  error={form.errors.nama}
                  helper="Masukkan nama lengkap sesuai KTP"
                >
                  <input
                    type="text"
                    value={form.data.nama}
                    onChange={e => form.setData('nama', e.target.value)}
                    placeholder="Contoh: Ahmad Rizki Pratama"
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                    autoFocus
                  />
                </FormField>

                {/* NIM */}
                <FormField
                  label="Nomor Induk Mahasiswa (NIM)"
                  icon={Hash}
                  required
                  error={form.errors.nim}
                  helper="Format: 10 digit angka"
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={form.data.nim}
                      onChange={e => form.setData('nim', e.target.value)}
                      placeholder="Contoh: 2110101234"
                      maxLength={10}
                      className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 pr-10 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all font-mono"
                    />
                    {checking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  <NIMValidator nim={form.data.nim} />
                  {duplicateCheck.nim && (
                    <DuplicateWarning field="nim" exists={duplicateCheck.nim} />
                  )}
                </FormField>

                {/* Email */}
                <FormField
                  label="Email"
                  icon={Mail}
                  required
                  error={form.errors.email}
                  helper="Email aktif untuk notifikasi sistem"
                >
                  <input
                    type="email"
                    value={form.data.email}
                    onChange={e => form.setData('email', e.target.value)}
                    placeholder="Contoh: ahmad.rizki@student.unpam.ac.id"
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  />
                  {duplicateCheck.email && (
                    <DuplicateWarning field="email" exists={duplicateCheck.email} />
                  )}
                </FormField>

                {/* Phone */}
                <FormField
                  label="Nomor Telepon"
                  icon={Phone}
                  optional
                  helper="Format: 08xxxxxxxxxx"
                >
                  <input
                    type="tel"
                    value={form.data.phone}
                    onChange={e => form.setData('phone', e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Section 2: Informasi Akademik */}
            <FormSection
              title="Informasi Akademik"
              description="Data perkuliahan dan program studi"
              icon={GraduationCap}
              gradient="from-purple-400 to-pink-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fakultas */}
                <FormField
                  label="Fakultas"
                  icon={Building2}
                  required
                  error={form.errors.fakultas}
                >
                  <select
                    value={form.data.fakultas}
                    onChange={e => {
                      form.setData('fakultas', e.target.value)
                      form.setData('prodi', '') // Reset prodi
                    }}
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  >
                    <option value="">Pilih Fakultas</option>
                    {fakultasList.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </FormField>

                {/* Program Studi */}
                <FormField
                  label="Program Studi"
                  icon={BookOpen}
                  required
                  error={form.errors.prodi}
                >
                  <select
                    value={form.data.prodi}
                    onChange={e => form.setData('prodi', e.target.value)}
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                    disabled={!form.data.fakultas}
                  >
                    <option value="">Pilih Program Studi</option>
                    {filteredProdi.map(p => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </FormField>

                {/* Kelas */}
                <FormField
                  label="Kelas"
                  icon={Users}
                  required
                  error={form.errors.kelas}
                >
                  <input
                    type="text"
                    value={form.data.kelas}
                    onChange={e => form.setData('kelas', e.target.value)}
                    placeholder="Contoh: 7A, 7B, 7C"
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  />
                </FormField>

                {/* Semester */}
                <FormField
                  label="Semester"
                  icon={Calendar}
                  required
                  error={form.errors.semester}
                >
                  <select
                    value={form.data.semester}
                    onChange={e => form.setData('semester', parseInt(e.target.value))}
                    className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  >
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </FormSection>

            {/* Section 3: Keamanan Akun */}
            <FormSection
              title="Keamanan Akun"
              description="Password dan pengaturan keamanan"
              icon={Shield}
              gradient="from-pink-400 to-rose-600"
            >
              {/* Auto-generate Option */}
              <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="auto-password"
                    checked={autoGeneratePassword}
                    onChange={e => setAutoGeneratePassword(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="auto-password" className="text-sm font-medium text-indigo-900 dark:text-indigo-100 cursor-pointer">
                      Generate Password Otomatis
                    </label>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      Sistem akan membuat password acak yang aman dan mengirimkannya ke email mahasiswa
                    </p>
                  </div>
                </div>
              </div>

              {!autoGeneratePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <FormField
                    label="Password"
                    icon={Lock}
                    required
                    error={form.errors.password}
                    helper="Minimal 8 karakter, kombinasi huruf dan angka"
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.data.password}
                        onChange={e => form.setData('password', e.target.value)}
                        placeholder="Masukkan password"
                        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 pr-12 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <PasswordStrength password={form.data.password} />
                  </FormField>

                  {/* Konfirmasi Password */}
                  <FormField
                    label="Konfirmasi Password"
                    icon={Lock}
                    required
                    error={form.errors.password_confirmation}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.data.password_confirmation}
                      onChange={e => form.setData('password_confirmation', e.target.value)}
                      placeholder="Ulangi password"
                      className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-white/20 dark:border-white/10 px-4 py-3 text-neutral-900 dark:text-white placeholder-gray-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all"
                    />
                  </FormField>
                </div>
              )}
            </FormSection>

            {/* Bulk Import Section */}
            <BulkImportSection />

            {/* Action Buttons */}
            <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-white/20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6">
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/admin/mahasiswa')}
                  disabled={form.processing}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                
                <Button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={form.processing}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Preview Data
                </Button>
                
                <Button
                  type="submit"
                  disabled={form.processing || duplicateCheck.nim || duplicateCheck.email}
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
                      Simpan Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Preview Modal */}
          <PreviewModal />

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
                  <p className="text-gray-400 text-lg">Mahasiswa berhasil ditambahkan</p>
                  <p className="text-gray-500 text-sm mt-2">Mengalihkan ke daftar mahasiswa...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  )
}

// Helper Components (FormSection, FormField, NIMValidator, DuplicateWarning, PasswordStrength, BulkImportSection, PreviewModal)
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
- [ ] Icon warna matching container

### Functionality
- [ ] Form validation real-time
- [ ] NIM format validator
- [ ] Duplicate checker (NIM & Email)
- [ ] Password strength meter
- [ ] Auto-generate password
- [ ] Preview before submit
- [ ] Bulk import Excel/CSV
- [ ] Success animation
- [ ] Error handling

### Responsive Design
- [ ] Mobile layout (320px+)
- [ ] Tablet layout (768px+)
- [ ] Desktop layout (1024px+)
- [ ] Touch-friendly buttons (44x44px min)
- [ ] Readable typography
- [ ] Proper spacing
- [ ] Sticky action bar on mobile

### Validation Rules
- [ ] Nama minimal 3 karakter
- [ ] NIM 10 digit angka
- [ ] Email format valid
- [ ] Password minimal 8 karakter
- [ ] Password confirmation match
- [ ] Fakultas required
- [ ] Program studi required
- [ ] Kelas required
- [ ] No duplicate NIM
- [ ] No duplicate Email

### User Experience
- [ ] Auto-focus nama field
- [ ] Real-time validation feedback
- [ ] Clear error messages
- [ ] Helper text informatif
- [ ] Loading states
- [ ] Success feedback
- [ ] Preview modal
- [ ] Keyboard shortcuts
- [ ] Unsaved changes warning

### Performance
- [ ] Debounced duplicate check
- [ ] Optimized animations
- [ ] Efficient re-renders
- [ ] Proper memoization
- [ ] No data dummy

### Security
- [ ] Password hashing (backend)
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 🎯 KESIMPULAN

Halaman Tambah Mahasiswa harus:

1. **Konsisten 100%** dengan Dashboard Admin
2. **Validasi Komprehensif** dengan feedback real-time
3. **Inovasi Signifikan** (NIM validator, duplicate checker, password strength, bulk import)
4. **Responsive Perfect** di semua device
5. **User-Friendly** dengan preview dan helper text
6. **No Data Dummy** - semua data real
7. **Security First** dengan password yang aman

Implementasikan dengan SANGAT SANGAT SERIUS dan perhatikan SETIAP DETAIL! Ini adalah menu KRUSIAL untuk manajemen mahasiswa! 🚀
