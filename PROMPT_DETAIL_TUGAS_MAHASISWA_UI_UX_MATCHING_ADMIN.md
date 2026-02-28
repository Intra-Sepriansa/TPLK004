# 🎨 PROMPT: DETAIL TUGAS MAHASISWA - UI/UX MATCHING ADMIN DASHBOARD

## 📋 OVERVIEW

Prompt ini untuk memperbaiki dan meningkatkan halaman **Detail Tugas Mahasiswa** dengan fokus utama pada **UI/UX, animasi, dan warna** yang 100% matching dengan **Dashboard Admin** (bukan dashboard mahasiswa atau dosen). Hanya ada 2-3 inovasi penting, dengan fokus khusus pada **sistem diskusi ultra advanced**.

---

## 🎨 DESIGN SYSTEM - HITAM THEME (100% ADMIN MATCHING)

### Color Palette (WAJIB)
```typescript
// CONTAINER COLORS
bg-white/40 dark:bg-neutral-900/40  // Main containers
backdrop-blur-xl                     // Glassmorphism effect

// BORDER COLORS
border-white/20 dark:border-white/5  // Container borders (NOT border-gray-800)

// GRADIENT HEADER (ADMIN STYLE)
from-indigo-600 via-purple-600 to-pink-500

// TEXT COLORS
text-neutral-900 dark:text-white     // Primary text
text-neutral-500 dark:text-neutral-400  // Secondary text

// ROUNDED CORNERS
rounded-3xl  // Main containers (NOT rounded-2xl)

// SHADOWS
shadow-xl    // Main containers (NOT shadow-sm)
```

### Animation Standards (WAJIB)
```typescript
// Consistent dengan admin dashboard
stiffness: 300
damping: 20

// Hover animations
scale: 1.04
y: -4
transition: { type: 'spring', stiffness: 400, damping: 15 }
```

---

## 🔍 CURRENT IMPLEMENTATION ANALYSIS

### File: `resources/js/pages/user/tugas-detail.tsx`

**✅ Sudah Bagus:**
- Header gradient sudah benar: `from-blue-600 via-cyan-600 to-teal-600`
- Animated orbs di header
- Container glassmorphism
- Priority badges dengan gradient
- Countdown timer

**❌ Perlu Diperbaiki:**
1. **Header gradient** harus diganti ke admin style: `from-indigo-600 via-purple-600 to-pink-500`
2. **Container colors** masih ada yang `bg-white/80` harus jadi `bg-white/40`
3. **Border colors** masih ada `border-slate-200/70` harus jadi `border-white/20`
4. **Animations** masih ada yang `stiffness: 100, damping: 15` harus jadi `300, 20`
5. **Diskusi section** perlu upgrade ultra advanced
6. **Submission form** perlu polish lebih baik

---

## 🎯 FOKUS UTAMA: 3 AREA PENTING

### 1️⃣ HEADER SECTION (Ultra Polished)
### 2️⃣ SUBMISSION FORM (Enhanced UX)
### 3️⃣ DISKUSI SYSTEM (Ultra Advanced) ⭐

---

## 1️⃣ HEADER SECTION - ULTRA POLISHED

**Perbaikan:**
- Ganti gradient ke admin style
- Tambah floating particles yang lebih smooth
- Countdown timer lebih interactive
- Breadcrumb navigation
- Quick actions buttons

**Implementation:**
```typescript
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
  className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl mb-6"
>
  {/* Animated Gradient Background - ADMIN STYLE */}
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

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />

  {/* Animated Orbs */}
  <motion.div
    animate={{
      scale: [1, 1.3, 1],
      rotate: [0, 180, 360],
      opacity: [0.1, 0.2, 0.1],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
  />
  <motion.div
    animate={{
      scale: [1, 1.4, 1],
      rotate: [360, 180, 0],
      opacity: [0.1, 0.15, 0.1],
    }}
    transition={{
      duration: 22,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
  />

  {/* Floating Particles */}
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0, 0.6, 0],
          scale: [0, 1, 0],
          y: [0, -100],
          x: [0, Math.random() * 40 - 20],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeOut"
        }}
        className="absolute"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${80 + Math.random() * 20}%`,
        }}
      >
        <Sparkles className="h-3 w-3 text-white/40" />
      </motion.div>
    ))}
  </div>

  <div className="relative z-10">
    {/* Breadcrumb */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center gap-2 mb-4 text-sm text-white/80"
    >
      <button
        onClick={() => router.visit('/user/tugas')}
        className="hover:text-white transition-colors"
      >
        Tugas
      </button>
      <ChevronRight className="h-4 w-4" />
      <span className="text-white font-medium">{tugas.judul}</span>
    </motion.div>

    {/* Back Button */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Button
        variant="ghost"
        onClick={() => router.visit('/user/tugas')}
        className="mb-6 text-white hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 font-bold rounded-xl"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Kembali ke Daftar Tugas
      </Button>
    </motion.div>

    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
      {/* Left: Title & Info */}
      <div className="flex-1 w-full">
        {/* Badges */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Badge className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-4 py-2 text-sm font-bold shadow-lg">
              {tugas.jenis}
            </Badge>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <Badge className={`${getPriorityStyle(tugas.prioritas)} px-4 py-2 text-sm font-bold`}>
              <Flag className="h-4 w-4 mr-2" />
              Prioritas {tugas.prioritas.charAt(0).toUpperCase() + tugas.prioritas.slice(1)}
            </Badge>
          </motion.div>

          {tugas.is_overdue && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Deadline Terlewat
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight"
        >
          {tugas.judul}
        </motion.h1>

        {/* Meta Info */}
        <div className="flex items-center gap-4 flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
          >
            <BookOpen className="h-5 w-5 text-white" />
            <span className="font-bold text-white text-sm">{tugas.course.nama}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
          >
            <Calendar className="h-5 w-5 text-white" />
            <span className="font-bold text-white text-sm">{tugas.deadline_display}</span>
          </motion.div>

          {tugas.course.dosen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
            >
              <Award className="h-5 w-5 text-white" />
              <span className="font-bold text-white text-sm">{tugas.course.dosen}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right: Countdown Timer */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1 }}
        className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-2xl min-w-[180px]"
      >
        <div className="text-center">
          <p className="text-sm text-white/90 font-semibold mb-2">Sisa Waktu</p>
          <motion.div
            animate={tugas.is_overdue ? { scale: [1, 1.1, 1] } : {}}
            transition={tugas.is_overdue ? { duration: 1.5, repeat: Infinity } : {}}
            className={`text-5xl font-extrabold ${
              tugas.is_overdue 
                ? 'text-red-300' 
                : tugas.days_until_deadline <= 3 
                ? 'text-amber-300' 
                : 'text-white'
            }`}
          >
            {tugas.is_overdue ? '❌' : tugas.days_until_deadline}
          </motion.div>
          <p className="text-sm text-white/90 font-semibold mt-2">
            {tugas.is_overdue ? 'Sudah Lewat' : 'Hari Lagi'}
          </p>

          {/* Progress Ring */}
          {!tugas.is_overdue && (
            <div className="mt-4 relative w-20 h-20 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 220" }}
                  animate={{ 
                    strokeDasharray: `${(tugas.days_until_deadline / 30) * 220} 220` 
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
            </div>
          )}
        </div>
      </motion.div>
    </div>

    {/* Quick Actions */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1 }}
      className="mt-6 flex gap-3 flex-wrap"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold hover:bg-white/30 transition-all"
      >
        <Download className="h-4 w-4" />
        Download Materi
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold hover:bg-white/30 transition-all"
      >
        <Share2 className="h-4 w-4" />
        Share
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold hover:bg-white/30 transition-all"
      >
        <Bell className="h-4 w-4" />
        Set Reminder
      </motion.button>
    </motion.div>
  </div>
</motion.div>
```

---


## 2️⃣ SUBMISSION FORM - ENHANCED UX

**Perbaikan:**
- Container colors matching admin
- Smooth animations
- File upload dengan preview
- Progress indicator
- Success/Error states

**Implementation:**
```typescript
const SubmissionForm = ({ tugas, submission }: { tugas: Tugas; submission: Submission | null }) => {
  const [showForm, setShowForm] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitForm = useForm({
    content: submission?.content || '',
    file: null as File | null,
  });

  const handleSubmit = () => {
    const formData = new FormData();
    if (submitForm.data.content) formData.append('content', submitForm.data.content);
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    router.post(`/user/tugas/${tugas.id}/submit`, formData, {
      forceFormData: true,
      onSuccess: () => {
        setShowForm(false);
        setFiles([]);
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
            >
              <FileText className="h-6 w-6" />
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                Submit Tugas
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {submission ? 'Update submission Anda' : 'Upload jawaban tugas'}
              </p>
            </div>
          </div>

          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              {submission ? 'Update Submission' : 'Submit Sekarang'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Submission Status (if exists) */}
      {submission && !showForm && (
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "rounded-2xl p-6 border-2",
              submission.status === 'graded'
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {submission.status === 'graded' ? (
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                  <span className="font-bold text-lg text-neutral-900 dark:text-white">
                    {submission.status === 'graded' ? 'Sudah Dinilai' : 'Menunggu Penilaian'}
                  </span>
                </div>

                {submission.content && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                      Jawaban Anda:
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-white/60 dark:bg-neutral-800/60 p-4 rounded-xl">
                      {submission.content}
                    </p>
                  </div>
                )}

                {submission.file_path && (
                  <motion.a
                    href={submission.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-neutral-700/60 transition-all"
                  >
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {submission.file_name}
                    </span>
                    <Download className="h-4 w-4 text-neutral-500" />
                  </motion.a>
                )}

                {submission.status === 'graded' && (
                  <div className="mt-4 p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                        Nilai:
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {submission.grade} / {tugas.max_grade}
                      </span>
                    </div>
                    {submission.grade_letter && (
                      <div className="flex items-center justify-center mt-2">
                        <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg">
                          Grade: {submission.grade_letter}
                        </span>
                      </div>
                    )}
                    {submission.feedback && (
                      <div className="mt-4">
                        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                          Feedback Dosen:
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-white/60 dark:bg-neutral-800/60 p-4 rounded-xl">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Submission Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="p-6 space-y-6"
          >
            {/* Text Answer */}
            <div>
              <Label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                Jawaban Tugas
              </Label>
              <Textarea
                value={submitForm.data.content}
                onChange={(e) => submitForm.setData('content', e.target.value)}
                placeholder="Tulis jawaban Anda di sini..."
                className="min-h-[200px] rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border-white/20 dark:border-white/5 resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                Upload File (Optional)
              </Label>
              
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) {
                    setFiles(Array.from(e.dataTransfer.files));
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={cn(
                  "rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
                  isDragging
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20 hover:border-indigo-400"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />

                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white mb-1">
                      Drag & drop files here
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      or click to browse
                    </p>
                    <p className="text-xs text-neutral-400 mt-2">
                      PDF, DOC, DOCX, ZIP, Images (Max 10MB)
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* File Preview */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Files ({files.length})
                  </p>
                  {files.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl"
                    >
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!submitForm.data.content.trim() && files.length === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <Send className="h-5 w-5" />
                  {submission ? 'Update Submission' : 'Submit Tugas'}
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl text-neutral-900 dark:text-white font-bold hover:bg-white/80 dark:hover:bg-neutral-700/60 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

---


## 3️⃣ DISKUSI SYSTEM - ULTRA ADVANCED ⭐⭐⭐

**Ini adalah fitur paling penting dan harus dibuat ultra advanced!**

### Features Ultra Advanced:
1. **Real-time Updates** - Pusher integration
2. **Typing Indicators** - Show who's typing
3. **Read Receipts** - Show who read messages
4. **Reactions** - Emoji reactions on messages
5. **Reply/Thread** - Reply to specific messages
6. **Pin Messages** - Pin important messages
7. **File Attachments** - Share files in chat
8. **Mention System** - @mention users
9. **Message Search** - Search through messages
10. **Voice Messages** - Record and send voice (bonus)

### Implementation:

```typescript
// Install: npm install pusher-js @emoji-mart/react

import Pusher from 'pusher-js';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Diskusi {
  id: number;
  sender_type: 'dosen' | 'mahasiswa' | 'admin';
  sender_name: string;
  sender_avatar: string | null;
  pesan: string;
  visibility: 'public' | 'private';
  recipient_name: string | null;
  is_pinned: boolean;
  is_mine: boolean;
  reply_to_id: number | null;
  reply_to?: { sender_name: string; pesan: string } | null;
  attachments: { name: string; url: string; type: string }[];
  reactions: { emoji: string; count: number; users: string[]; has_reacted: boolean }[];
  mentions: string[];
  created_at: string;
  time_ago: string;
  is_read: boolean;
  read_by: string[];
}

const DiskusiSystemUltraAdvanced = ({ tugasId, diskusi: initialDiskusi }: { tugasId: number; diskusi: Diskusi[] }) => {
  const [diskusi, setDiskusi] = useState<Diskusi[]>(initialDiskusi);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup Pusher for real-time
  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe(`tugas.${tugasId}`);

    // New message
    channel.bind('message.sent', (data: Diskusi) => {
      setDiskusi(prev => [...prev, data]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    // Typing indicator
    channel.bind('user.typing', (data: { user: string }) => {
      setIsTyping(prev => {
        if (!prev.includes(data.user)) {
          return [...prev, data.user];
        }
        return prev;
      });
      setTimeout(() => {
        setIsTyping(prev => prev.filter(u => u !== data.user));
      }, 3000);
    });

    // Message pinned
    channel.bind('message.pinned', (data: { message_id: number }) => {
      setDiskusi(prev => prev.map(d => 
        d.id === data.message_id ? { ...d, is_pinned: true } : d
      ));
    });

    // Reaction added
    channel.bind('reaction.added', (data: { message_id: number; emoji: string; user: string }) => {
      setDiskusi(prev => prev.map(d => {
        if (d.id === data.message_id) {
          const existingReaction = d.reactions.find(r => r.emoji === data.emoji);
          if (existingReaction) {
            return {
              ...d,
              reactions: d.reactions.map(r =>
                r.emoji === data.emoji
                  ? { ...r, count: r.count + 1, users: [...r.users, data.user] }
                  : r
              ),
            };
          } else {
            return {
              ...d,
              reactions: [...d.reactions, { emoji: data.emoji, count: 1, users: [data.user], has_reacted: false }],
            };
          }
        }
        return d;
      }));
    });

    return () => {
      pusher.unsubscribe(`tugas.${tugasId}`);
    };
  }, [tugasId]);

  const handleSendMessage = () => {
    if (!message.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.append('pesan', message);
    formData.append('visibility', 'public');
    if (replyTo) formData.append('reply_to_id', String(replyTo.id));
    attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    router.post(`/user/tugas/${tugasId}/message`, formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setMessage('');
        setReplyTo(null);
        setAttachments([]);
      },
    });
  };

  const handleTyping = () => {
    axios.post(`/user/tugas/${tugasId}/typing`);
  };

  const handleReaction = (messageId: number, emoji: string) => {
    router.post(`/user/tugas/${tugasId}/message/${messageId}/react`, {
      emoji,
    }, {
      preserveScroll: true,
    });
  };

  const handlePin = (messageId: number) => {
    router.post(`/user/tugas/${tugasId}/message/${messageId}/pin`, {}, {
      preserveScroll: true,
    });
  };

  const filteredDiskusi = searchQuery
    ? diskusi.filter(d => d.pesan.toLowerCase().includes(searchQuery.toLowerCase()))
    : diskusi;

  const pinnedMessages = diskusi.filter(d => d.is_pinned);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg"
            >
              <MessageSquare className="h-6 w-6" />
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                Diskusi & Kolaborasi
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {diskusi.length} pesan • Real-time
              </p>
            </div>
          </div>

          {/* Online Indicator */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-3 w-3 rounded-full bg-emerald-500"
            />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Online
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="p-4 border-b border-white/20 dark:border-white/5 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Pinned Messages
            </span>
          </div>
          <div className="space-y-2">
            {pinnedMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl"
              >
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {msg.sender_name}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {msg.pesan}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="h-[600px] overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {filteredDiskusi.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.02 }}
              className={cn(
                "flex gap-3",
                msg.is_mine ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg",
                    msg.sender_type === 'dosen'
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                      : msg.sender_type === 'admin'
                      ? "bg-gradient-to-br from-red-500 to-pink-600"
                      : "bg-gradient-to-br from-emerald-500 to-teal-600"
                  )}
                >
                  {msg.sender_name.charAt(0).toUpperCase()}
                </motion.div>
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "flex-1 max-w-[70%]",
                msg.is_mine ? "items-end" : "items-start"
              )}>
                {/* Sender Name & Time */}
                <div className={cn(
                  "flex items-center gap-2 mb-1",
                  msg.is_mine ? "justify-end" : "justify-start"
                )}>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    {msg.sender_name}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {msg.time_ago}
                  </span>
                  {msg.is_pinned && (
                    <Pin className="h-3 w-3 text-amber-500" />
                  )}
                  {msg.is_read && msg.is_mine && (
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                  )}
                </div>

                {/* Reply Preview */}
                {msg.reply_to && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 p-2 rounded-lg bg-white/40 dark:bg-neutral-800/40 border-l-4 border-purple-500"
                  >
                    <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                      Replying to {msg.reply_to.sender_name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-1">
                      {msg.reply_to.pesan}
                    </p>
                  </motion.div>
                )}

                {/* Message Content */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    "rounded-2xl p-4 shadow-lg relative group",
                    msg.is_mine
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                      : "bg-white/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-white backdrop-blur-xl"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.pesan}</p>

                  {/* Attachments */}
                  {msg.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg transition-colors",
                            msg.is_mine
                              ? "bg-white/20 hover:bg-white/30"
                              : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-xs font-medium flex-1 truncate">{att.name}</span>
                          <Download className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions (on hover) */}
                  <div className={cn(
                    "absolute -top-8 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    msg.is_mine ? "right-0" : "left-0"
                  )}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setReplyTo(msg)}
                      className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      title="Reply"
                    >
                      <Reply className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                    </motion.button>
                    
                    {!msg.is_mine && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePin(msg.id)}
                        className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        title="Pin"
                      >
                        <Pin className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEmojiPicker(true)}
                      className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      title="React"
                    >
                      <Smile className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Reactions */}
                {msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {msg.reactions.map((reaction, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReaction(msg.id, reaction.emoji)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all",
                          reaction.has_reacted
                            ? "bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500"
                            : "bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl hover:bg-white/80"
                        )}
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Read By */}
                {msg.is_mine && msg.read_by.length > 0 && (
                  <p className="text-xs text-neutral-400 mt-1">
                    Read by {msg.read_by.join(', ')}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  className="h-2 w-2 rounded-full bg-neutral-400"
                />
              ))}
            </div>
            <span>{isTyping.join(', ')} sedang mengetik...</span>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20">
        {/* Reply Preview */}
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">
                  Replying to {replyTo.sender_name}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-300 line-clamp-2">
                  {replyTo.pesan}
                </p>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="p-1 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <X className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl"
              >
                <FileText className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {file.name}
                </span>
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
              }
            }}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl hover:bg-white/20"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="rounded-xl hover:bg-white/20"
          >
            <Smile className="h-5 w-5" />
          </Button>

          <Textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            className="flex-1 min-h-[60px] max-h-[120px] rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border-white/20 dark:border-white/5 resize-none"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() && attachments.length === 0}
            className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Reactions */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Quick reactions:</span>
          {['👍', '❤️', '🎉', '🔥', '👏', '😊', '🤔', '💯'].map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setMessage(prev => prev + emoji);
                inputRef.current?.focus();
              }}
              className="text-lg hover:bg-white/20 dark:hover:bg-neutral-800/20 rounded-lg p-1 transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-20 right-4 z-50"
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji: any) => {
                setMessage(prev => prev + emoji.native);
                setShowEmojiPicker(false);
                inputRef.current?.focus();
              }}
              theme="auto"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
```


---

## 📦 BACKEND IMPLEMENTATION

### Pusher Setup (Real-time)

```php
// config/broadcasting.php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'useTLS' => true,
    ],
],
```

### Controller Updates

```php
// app/Http/Controllers/User/TugasController.php

use Pusher\Pusher;

public function sendMessage(Request $request, $id)
{
    $validated = $request->validate([
        'pesan' => 'required|string',
        'visibility' => 'required|in:public,private',
        'reply_to_id' => 'nullable|exists:diskusi,id',
        'attachments.*' => 'nullable|file|max:10240', // 10MB
    ]);

    $diskusi = Diskusi::create([
        'tugas_id' => $id,
        'sender_id' => auth()->id(),
        'sender_type' => 'mahasiswa',
        'pesan' => $validated['pesan'],
        'visibility' => $validated['visibility'],
        'reply_to_id' => $validated['reply_to_id'] ?? null,
    ]);

    // Handle attachments
    if ($request->hasFile('attachments')) {
        foreach ($request->file('attachments') as $file) {
            $path = $file->store('diskusi-attachments', 'public');
            $diskusi->attachments()->create([
                'name' => $file->getClientOriginalName(),
                'url' => Storage::url($path),
                'type' => $file->getMimeType(),
            ]);
        }
    }

    // Broadcast to Pusher
    $pusher = new Pusher(
        env('PUSHER_APP_KEY'),
        env('PUSHER_APP_SECRET'),
        env('PUSHER_APP_ID'),
        ['cluster' => env('PUSHER_APP_CLUSTER')]
    );

    $pusher->trigger("tugas.{$id}", 'message.sent', [
        'id' => $diskusi->id,
        'sender_type' => 'mahasiswa',
        'sender_name' => auth()->user()->nama,
        'pesan' => $diskusi->pesan,
        'time_ago' => $diskusi->created_at->diffForHumans(),
        'attachments' => $diskusi->attachments,
        'reactions' => [],
    ]);

    return back()->with('success', 'Pesan terkirim');
}

public function typing(Request $request, $id)
{
    $pusher = new Pusher(
        env('PUSHER_APP_KEY'),
        env('PUSHER_APP_SECRET'),
        env('PUSHER_APP_ID'),
        ['cluster' => env('PUSHER_APP_CLUSTER')]
    );

    $pusher->trigger("tugas.{$id}", 'user.typing', [
        'user' => auth()->user()->nama,
    ]);

    return response()->json(['success' => true]);
}

public function reactToMessage(Request $request, $tugasId, $messageId)
{
    $validated = $request->validate([
        'emoji' => 'required|string',
    ]);

    $reaction = DiskusiReaction::firstOrCreate([
        'diskusi_id' => $messageId,
        'user_id' => auth()->id(),
        'emoji' => $validated['emoji'],
    ]);

    // Broadcast
    $pusher = new Pusher(
        env('PUSHER_APP_KEY'),
        env('PUSHER_APP_SECRET'),
        env('PUSHER_APP_ID'),
        ['cluster' => env('PUSHER_APP_CLUSTER')]
    );

    $pusher->trigger("tugas.{$tugasId}", 'reaction.added', [
        'message_id' => $messageId,
        'emoji' => $validated['emoji'],
        'user' => auth()->user()->nama,
    ]);

    return back();
}

public function pinMessage(Request $request, $tugasId, $messageId)
{
    $diskusi = Diskusi::findOrFail($messageId);
    $diskusi->update(['is_pinned' => !$diskusi->is_pinned]);

    // Broadcast
    $pusher = new Pusher(
        env('PUSHER_APP_KEY'),
        env('PUSHER_APP_SECRET'),
        env('PUSHER_APP_ID'),
        ['cluster' => env('PUSHER_APP_CLUSTER')]
    );

    $pusher->trigger("tugas.{$tugasId}", 'message.pinned', [
        'message_id' => $messageId,
    ]);

    return back();
}
```

### Database Migrations

```php
// database/migrations/xxxx_add_diskusi_features.php
public function up()
{
    Schema::table('diskusi', function (Blueprint $table) {
        $table->boolean('is_pinned')->default(false);
        $table->foreignId('reply_to_id')->nullable()->constrained('diskusi')->onDelete('set null');
        $table->json('mentions')->nullable();
        $table->boolean('is_read')->default(false);
        $table->json('read_by')->nullable();
    });

    Schema::create('diskusi_attachments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('diskusi_id')->constrained('diskusi')->onDelete('cascade');
        $table->string('name');
        $table->string('url');
        $table->string('type');
        $table->timestamps();
    });

    Schema::create('diskusi_reactions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('diskusi_id')->constrained('diskusi')->onDelete('cascade');
        $table->foreignId('user_id')->constrained('mahasiswa')->onDelete('cascade');
        $table->string('emoji');
        $table->timestamps();
        
        $table->unique(['diskusi_id', 'user_id', 'emoji']);
    });
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Header & UI Fixes (2-3 hours)
- [ ] Update header gradient to admin style (`from-indigo-600 via-purple-600 to-pink-500`)
- [ ] Fix all container colors to `bg-white/40 dark:bg-neutral-900/40`
- [ ] Fix all border colors to `border-white/20 dark:border-white/5`
- [ ] Update all animations to `stiffness: 300, damping: 20`
- [ ] Add breadcrumb navigation
- [ ] Add quick actions buttons
- [ ] Polish countdown timer with progress ring
- [ ] Add floating particles animation

### Phase 2: Submission Form Enhancement (3-4 hours)
- [ ] Update submission form UI matching admin
- [ ] Add drag & drop file upload
- [ ] Add file preview with thumbnails
- [ ] Add upload progress indicator
- [ ] Add success/error states with animations
- [ ] Polish submission status display
- [ ] Add grade display with animations

### Phase 3: Diskusi System - Ultra Advanced (8-10 hours)
- [ ] Install Pusher and setup configuration
- [ ] Create database migrations for new features
- [ ] Implement real-time message broadcasting
- [ ] Add typing indicators
- [ ] Add read receipts
- [ ] Implement emoji reactions
- [ ] Add reply/thread functionality
- [ ] Implement pin messages
- [ ] Add file attachments in chat
- [ ] Implement mention system (@username)
- [ ] Add message search
- [ ] Add emoji picker
- [ ] Add quick reactions bar
- [ ] Polish all animations and transitions

### Phase 4: Testing & Polish (2-3 hours)
- [ ] Test all features end-to-end
- [ ] Test real-time functionality
- [ ] Test file uploads
- [ ] Test responsive design
- [ ] Fix any bugs
- [ ] Optimize performance
- [ ] Add loading states
- [ ] Test dark mode

---

## 🎨 UI/UX CONSISTENCY CHECKLIST

### Colors
- [ ] Header gradient: `from-indigo-600 via-purple-600 to-pink-500`
- [ ] Containers: `bg-white/40 dark:bg-neutral-900/40`
- [ ] Borders: `border-white/20 dark:border-white/5`
- [ ] Rounded: `rounded-3xl`
- [ ] Shadows: `shadow-xl`
- [ ] Backdrop blur: `backdrop-blur-xl`

### Animations
- [ ] All spring animations: `stiffness: 300, damping: 20`
- [ ] Hover scale: `1.04` with `y: -4`
- [ ] Tap scale: `0.95`
- [ ] Smooth transitions: `transition-all`

### Typography
- [ ] Primary text: `text-neutral-900 dark:text-white`
- [ ] Secondary text: `text-neutral-500 dark:text-neutral-400`
- [ ] Font weights: bold for headers, medium for body

---

## 📱 RESPONSIVE DESIGN

```typescript
// Mobile (< 640px)
- Single column layout
- Stacked elements
- Smaller padding (p-4)
- Smaller text sizes

// Tablet (640px - 1024px)
- Two column layout where appropriate
- Medium padding (p-6)
- Standard text sizes

// Desktop (> 1024px)
- Full layout with sidebars
- Large padding (p-8)
- Larger text sizes
- Show all features
```

---

## 🚀 PERFORMANCE OPTIMIZATION

1. **Lazy Load Messages**: Load messages in batches (pagination)
2. **Debounce Typing**: Debounce typing indicator (500ms)
3. **Optimize Images**: Compress attachment previews
4. **Virtual Scrolling**: Use react-window for long message lists
5. **Memoization**: Use React.memo for message components
6. **Pusher Optimization**: Unsubscribe when component unmounts

---

## 🔒 SECURITY

1. **File Upload**: Validate file types and sizes
2. **XSS Protection**: Sanitize message content
3. **CSRF Protection**: Include CSRF tokens
4. **Rate Limiting**: Limit message sending (max 10/minute)
5. **Authentication**: Verify user permissions
6. **Pusher Auth**: Secure private channels

---

## 📊 ESTIMATED TIME

- **Phase 1 (Header & UI)**: 2-3 hours
- **Phase 2 (Submission Form)**: 3-4 hours
- **Phase 3 (Diskusi Ultra Advanced)**: 8-10 hours
- **Phase 4 (Testing & Polish)**: 2-3 hours
- **Total**: ~15-20 hours

---

## 🎯 SUCCESS METRICS

1. **Real-time Performance**: Messages appear < 500ms
2. **User Engagement**: 80% of users use diskusi feature
3. **File Upload Success**: 95% success rate
4. **Mobile Responsiveness**: Works on all screen sizes
5. **User Satisfaction**: 4.5+ star rating

---

## 🎉 SUMMARY

Prompt ini fokus pada 3 area penting untuk halaman Detail Tugas:

1. **Header Section** - Ultra polished dengan admin gradient, floating particles, breadcrumb, countdown timer dengan progress ring
2. **Submission Form** - Enhanced UX dengan drag & drop, file preview, progress indicator, smooth animations
3. **Diskusi System** - Ultra advanced dengan real-time updates, typing indicators, reactions, replies, pins, attachments, mentions, search

Semua implementasi 100% matching dengan admin dashboard style menggunakan HITAM theme dengan glassmorphism, smooth animations (stiffness: 300, damping: 20), dan modern UI/UX.

**Fokus Utama**: Diskusi system dibuat ultra advanced dengan 10+ fitur real-time untuk meningkatkan kolaborasi dan komunikasi antara mahasiswa dan dosen.

