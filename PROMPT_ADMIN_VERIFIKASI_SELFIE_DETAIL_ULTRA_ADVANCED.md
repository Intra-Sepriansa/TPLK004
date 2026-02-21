# PROMPT: ADMIN VERIFIKASI SELFIE DETAIL - ULTRA ADVANCED WITH AI

## TUJUAN
Membuat halaman detail Verifikasi Selfie untuk Admin (`resources/js/pages/admin/verifikasi-selfie-detail.tsx`) dengan UI/UX yang SANGAT SANGAT ULTRA ADVANCED, dilengkapi dengan AI Face Recognition, animasi yang sangat menarik, dan matching dengan style dashboard admin (indigo-purple-pink gradient).

**Route:** `/admin/verifikasi-selfie/:id`

**FITUR UTAMA:**
- AI Face Recognition dengan real-time analysis
- Face matching score dengan animated progress
- Facial landmarks detection visualization
- AI-powered anomaly detection
- Live face comparison dengan overlay
- Animated AI processing indicators
- Comprehensive verification details
- Action buttons (Approve/Reject/Flag)

---

## UI/UX REFERENCE - WAJIB IKUTI 100%

### Warna & Gradient (EXACT dari Dashboard Admin)
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

// AI Processing Indicator
bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
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

// AI Scanning Animation
const scanningVariants = {
  initial: { y: 0, opacity: 0.5 },
  animate: {
    y: [0, 300, 0],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    },
  },
} as const;

// AI Pulse Animation
const aiPulseVariants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
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
      {/* Left: Title & Info */}
      <div className="flex items-center gap-5">
        <Button
          variant="ghost"
          onClick={() => router.visit('/admin/verifikasi-selfie')}
          className="text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Kembali
        </Button>
        
        <div className="h-12 w-px bg-white/20" />
        
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
          whileHover={{ scale: 1.1, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Scan className="h-8 w-8 text-white" />
        </motion.div>
        <div>
          <p className="text-sm text-indigo-100 font-medium tracking-wide">AI Face Recognition</p>
          <h1 className="text-3xl font-bold text-white">Verifikasi Selfie Detail</h1>
          <p className="mt-1 text-indigo-100">
            Analisis wajah dengan teknologi AI
          </p>
        </div>
      </div>

      {/* Right: AI Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.05, y: -3 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-xl border border-white/30">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="h-6 w-6 text-cyan-300" />
          </motion.div>
          <div>
            <p className="text-xs text-gray-200 font-medium">AI Status</p>
            <p className="text-xl font-black">ANALYZING</p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</motion.div>
```

### 2. MAIN CONTENT (2-Column Layout)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* LEFT COLUMN: Image Comparison (2 cols) */}
  <div className="lg:col-span-2 space-y-6">
    {/* AI Face Comparison Card */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Brain className="h-6 w-6 text-cyan-500" />
          AI Face Comparison
        </h2>
        
        {/* AI Processing Indicator */}
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white text-sm font-medium"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-4 w-4" />
          </motion.div>
          AI Processing...
        </motion.div>
      </div>

      {/* Image Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference Photo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Foto Referensi</h3>
            <Badge variant="outline">Database</Badge>
          </div>
          
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
            <img
              src={verification.reference_photo}
              alt="Reference"
              className="w-full h-full object-cover"
            />
            
            {/* AI Facial Landmarks Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0"
            >
              {/* Face Detection Box */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="absolute top-[10%] left-[10%] right-[10%] bottom-[20%] border-2 border-cyan-400 rounded-lg"
              >
                {/* Corner Markers */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-cyan-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-cyan-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-cyan-400" />
                
                {/* Face Label */}
                <div className="absolute -top-8 left-0 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">
                  FACE DETECTED
                </div>
              </motion.div>

              {/* Facial Landmarks Points */}
              {facialLandmarks.reference.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.02 }}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                />
              ))}
            </motion.div>

            {/* AI Scanning Line */}
            <motion.div
              variants={scanningVariants}
              initial="initial"
              animate="animate"
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            />
          </div>
        </div>

        {/* Selfie Photo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Foto Selfie</h3>
            <Badge variant="outline">Live Capture</Badge>
          </div>
          
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
            <img
              src={verification.selfie_photo}
              alt="Selfie"
              className="w-full h-full object-cover"
            />
            
            {/* AI Facial Landmarks Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0"
            >
              {/* Face Detection Box */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className={cn(
                  "absolute top-[10%] left-[10%] right-[10%] bottom-[20%] border-2 rounded-lg",
                  verification.match_score >= 80 ? "border-green-400" : 
                  verification.match_score >= 60 ? "border-yellow-400" : 
                  "border-red-400"
                )}
              >
                {/* Corner Markers */}
                <div className={cn(
                  "absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4",
                  verification.match_score >= 80 ? "border-green-400" : 
                  verification.match_score >= 60 ? "border-yellow-400" : 
                  "border-red-400"
                )} />
                <div className={cn(
                  "absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4",
                  verification.match_score >= 80 ? "border-green-400" : 
                  verification.match_score >= 60 ? "border-yellow-400" : 
                  "border-red-400"
                )} />
                <div className={cn(
                  "absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4",
                  verification.match_score >= 80 ? "border-green-400" : 
                  verification.match_score >= 60 ? "border-yellow-400" : 
                  "border-red-400"
                )} />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4",
                  verification.match_score >= 80 ? "border-green-400" : 
                  verification.match_score >= 60 ? "border-yellow-400" : 
                  "border-red-400"
                )} />
                
                {/* Match Status Label */}
                <div className={cn(
                  "absolute -top-8 left-0 px-3 py-1 text-white text-xs font-bold rounded-full",
                  verification.match_score >= 80 ? "bg-green-500" : 
                  verification.match_score >= 60 ? "bg-yellow-500" : 
                  "bg-red-500"
                )}>
                  {verification.match_score >= 80 ? "MATCH" : 
                   verification.match_score >= 60 ? "PARTIAL MATCH" : 
                   "NO MATCH"}
                </div>
              </motion.div>

              {/* Facial Landmarks Points */}
              {facialLandmarks.selfie.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.02 }}
                  className={cn(
                    "absolute w-2 h-2 rounded-full",
                    verification.match_score >= 80 ? "bg-green-400" : 
                    verification.match_score >= 60 ? "bg-yellow-400" : 
                    "bg-red-400"
                  )}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                />
              ))}
            </motion.div>

            {/* AI Scanning Line */}
            <motion.div
              variants={scanningVariants}
              initial="initial"
              animate="animate"
              className={cn(
                "absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent",
                verification.match_score >= 80 ? "via-green-400" : 
                verification.match_score >= 60 ? "via-yellow-400" : 
                "via-red-400"
              )}
            />
          </div>
        </div>
      </div>

      {/* AI Match Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              variants={aiPulseVariants}
              initial="initial"
              animate="animate"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg"
            >
              <Brain className="h-6 w-6" />
            </motion.div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">AI Match Score</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Confidence Level: {verification.confidence_level}%
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {verification.match_score}%
            </p>
            <p className="text-xs text-neutral-500 mt-1">Match Accuracy</p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${verification.match_score}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className={cn(
              "h-full rounded-full relative overflow-hidden",
              verification.match_score >= 80 ? "bg-gradient-to-r from-green-400 to-emerald-600" :
              verification.match_score >= 60 ? "bg-gradient-to-r from-yellow-400 to-amber-600" :
              "bg-gradient-to-r from-red-400 to-rose-600"
            )}
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Match Status */}
        <div className="mt-4 flex items-center justify-between">
          <Badge
            variant={
              verification.match_score >= 80 ? 'success' :
              verification.match_score >= 60 ? 'warning' :
              'destructive'
            }
            className="text-sm px-4 py-2"
          >
            {verification.match_score >= 80 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verified - High Confidence
              </>
            ) : verification.match_score >= 60 ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Partial Match - Review Required
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                No Match - Verification Failed
              </>
            )}
          </Badge>
          
          <div className="text-xs text-neutral-500">
            Processed in {verification.processing_time}ms
          </div>
        </div>
      </motion.div>
    </motion.div>

    {/* AI Analysis Details */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <Cpu className="h-5 w-5 text-purple-500" />
        AI Analysis Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Face Quality */}
        <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Face Quality</span>
            <Badge variant="outline">{verification.face_quality}%</Badge>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${verification.face_quality}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
            />
          </div>
        </div>

        {/* Lighting Condition */}
        <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Lighting</span>
            <Badge variant="outline">{verification.lighting_score}%</Badge>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${verification.lighting_score}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
            />
          </div>
        </div>

        {/* Face Angle */}
        <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Face Angle</span>
            <Badge variant="outline">{verification.face_angle}°</Badge>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(180 - Math.abs(verification.face_angle)) / 180 * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
            />
          </div>
        </div>

        {/* Blur Detection */}
        <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Sharpness</span>
            <Badge variant="outline">{verification.sharpness_score}%</Badge>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${verification.sharpness_score}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
          </motion.div>
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">AI Insights</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {verification.ai_insights}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  </div>

  {/* RIGHT COLUMN: Details & Actions (1 col) */}
  <div className="space-y-6">

    {/* STUDENT PROFILE CARD */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <div className="text-center">
        {/* Avatar with AI Scan Effect */}
        <div className="relative inline-block mb-4">
          <motion.div
            className="relative h-32 w-32 mx-auto"
            whileHover={{ scale: 1.05 }}
          >
            <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-neutral-800">
              <AvatarImage src={verification.student.photo} />
              <AvatarFallback className="text-3xl font-bold">
                {verification.student.initials}
              </AvatarFallback>
            </Avatar>
            
            {/* AI Scanning Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-cyan-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {verification.student.name}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          {verification.student.nim}
        </p>
        
        {/* Verification Status Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="mt-4"
        >
          <Badge
            variant={
              verification.status === 'verified' ? 'success' :
              verification.status === 'rejected' ? 'destructive' :
              'warning'
            }
            className="text-lg px-6 py-2"
          >
            {verification.status === 'verified' && <CheckCircle className="h-4 w-4 mr-2" />}
            {verification.status === 'rejected' && <XCircle className="h-4 w-4 mr-2" />}
            {verification.status === 'pending' && <Clock className="h-4 w-4 mr-2" />}
            {verification.status.toUpperCase()}
          </Badge>
        </motion.div>
      </div>

      {/* Student Details */}
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">Program Studi:</span>
          <span className="font-medium text-neutral-900 dark:text-white">{verification.student.major}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">Semester:</span>
          <span className="font-medium text-neutral-900 dark:text-white">{verification.student.semester}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">Waktu Upload:</span>
          <span className="font-medium text-neutral-900 dark:text-white">{verification.uploaded_at}</span>
        </div>
      </div>
    </motion.div>

    {/* AI MATCH SCORE CARD */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 backdrop-blur-xl shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="h-6 w-6 text-cyan-500" />
        </motion.div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          AI Match Score
        </h3>
      </div>

      {/* Circular Progress */}
      <div className="relative h-48 w-48 mx-auto mb-4">
        <svg className="transform -rotate-90 h-48 w-48">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-neutral-200 dark:text-neutral-700"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 552" }}
            animate={{ 
              strokeDasharray: `${(verification.match_score / 100) * 552} 552` 
            }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.p
              className="text-5xl font-black bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              {verification.match_score}%
            </motion.p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Match Score
            </p>
          </div>
        </div>
      </div>

      {/* Score Interpretation */}
      <div className="text-center">
        <Badge
          variant={
            verification.match_score >= 90 ? 'success' :
            verification.match_score >= 70 ? 'warning' :
            'destructive'
          }
          className="text-sm"
        >
          {verification.match_score >= 90 && 'Sangat Cocok'}
          {verification.match_score >= 70 && verification.match_score < 90 && 'Cukup Cocok'}
          {verification.match_score < 70 && 'Tidak Cocok'}
        </Badge>
      </div>
    </motion.div>

    {/* ACTION BUTTONS */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Actions</h3>
      <div className="space-y-3">
        {verification.status === 'pending' && (
          <>
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              onClick={() => handleVerify('approve')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Setujui Verifikasi
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleVerify('reject')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tolak Verifikasi
            </Button>
          </>
        )}
        <Button variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button variant="outline" className="w-full">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>
    </motion.div>
  </div>

  {/* MIDDLE COLUMN: Image Comparison (6 cols) */}
  <div className="lg:col-span-6 space-y-6">
    
    {/* Already defined above in section 2 - AI Face Comparison Card */}
    {/* This section contains the image comparison grid with facial landmarks */}
    
  </div>

  {/* RIGHT COLUMN: AI Analysis & Verification Report (5 cols) */}
  <div className="lg:col-span-5 space-y-6">

    {/* FACIAL FEATURES DETECTION */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <Scan className="h-5 w-5 text-cyan-500" />
        Facial Features Detection
      </h2>

      <div className="space-y-4">
        {/* Face Detection Confidence */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Face Detection</span>
            <Badge variant="success">{verification.face_detection_confidence}%</Badge>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${verification.face_detection_confidence}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            />
          </div>
        </div>

        {/* Facial Landmarks Detected */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Eyes', detected: verification.features.eyes, icon: Eye },
            { label: 'Nose', detected: verification.features.nose, icon: Scan },
            { label: 'Mouth', detected: verification.features.mouth, icon: Smile },
            { label: 'Eyebrows', detected: verification.features.eyebrows, icon: Scan },
          ].map((feature) => (
            <div
              key={feature.label}
              className={cn(
                "p-3 rounded-xl border",
                feature.detected
                  ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              )}
            >
              <div className="flex items-center gap-2">
                <feature.icon className={cn(
                  "h-4 w-4",
                  feature.detected ? "text-green-600" : "text-red-600"
                )} />
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {feature.label}
                </span>
                {feature.detected ? (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Facial Symmetry */}
        <div className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Facial Symmetry</span>
            <Badge variant="outline">{verification.facial_symmetry}%</Badge>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${verification.facial_symmetry}%` }}
              transition={{ duration: 1, delay: 0.7 }}
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500"
            />
          </div>
        </div>

        {/* Emotion Detection */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3">Emotion Detection</h4>
          <div className="space-y-2">
            {verification.emotions.map((emotion) => (
              <div key={emotion.name} className="flex items-center justify-between">
                <span className="text-xs text-purple-700 dark:text-purple-300">{emotion.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${emotion.confidence}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                    />
                  </div>
                  <span className="text-xs font-medium text-purple-900 dark:text-purple-100 w-10 text-right">
                    {emotion.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>

    {/* LIVENESS DETECTION */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-green-500" />
        Liveness Detection
      </h2>

      <div className="space-y-4">
        {/* Liveness Score */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Shield className="h-5 w-5 text-green-600" />
              </motion.div>
              <span className="font-semibold text-green-900 dark:text-green-100">Liveness Score</span>
            </div>
            <span className="text-2xl font-black text-green-600">{verification.liveness_score}%</span>
          </div>
          <div className="h-3 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${verification.liveness_score}%` }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-green-400 to-emerald-600 relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        {/* Liveness Checks */}
        <div className="space-y-2">
          {[
            { label: 'Real Person Detected', passed: verification.liveness_checks.real_person, icon: User },
            { label: 'No Screen Detection', passed: verification.liveness_checks.no_screen, icon: Monitor },
            { label: 'No Mask Detection', passed: verification.liveness_checks.no_mask, icon: Shield },
            { label: 'Eye Blink Detected', passed: verification.liveness_checks.eye_blink, icon: Eye },
            { label: 'Head Movement', passed: verification.liveness_checks.head_movement, icon: Move },
          ].map((check) => (
            <div
              key={check.label}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border",
                check.passed
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
              )}
            >
              <div className="flex items-center gap-2">
                <check.icon className={cn(
                  "h-4 w-4",
                  check.passed ? "text-green-600" : "text-red-600"
                )} />
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {check.label}
                </span>
              </div>
              {check.passed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          ))}
        </div>

        {/* Anti-Spoofing */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Anti-Spoofing Check</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {verification.anti_spoofing_passed 
                  ? "Tidak ada indikasi spoofing terdeteksi. Foto asli dari kamera."
                  : "Terdeteksi kemungkinan spoofing. Perlu review manual."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    {/* VERIFICATION REPORT */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-500" />
        Verification Report
      </h2>

      <div className="space-y-4">
        {/* Overall Assessment */}
        <div className={cn(
          "p-4 rounded-xl border",
          verification.match_score >= 80
            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
            : verification.match_score >= 60
            ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
        )}>
          <div className="flex items-start gap-3">
            {verification.match_score >= 80 ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : verification.match_score >= 60 ? (
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <h4 className={cn(
                "font-semibold mb-1",
                verification.match_score >= 80 ? "text-green-900 dark:text-green-100" :
                verification.match_score >= 60 ? "text-yellow-900 dark:text-yellow-100" :
                "text-red-900 dark:text-red-100"
              )}>
                {verification.match_score >= 80 ? "Verification Passed" :
                 verification.match_score >= 60 ? "Manual Review Required" :
                 "Verification Failed"}
              </h4>
              <p className={cn(
                "text-sm",
                verification.match_score >= 80 ? "text-green-700 dark:text-green-300" :
                verification.match_score >= 60 ? "text-yellow-700 dark:text-yellow-300" :
                "text-red-700 dark:text-red-300"
              )}>
                {verification.overall_assessment}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50">
            <span className="text-neutral-600 dark:text-neutral-400">Verification ID:</span>
            <span className="font-mono font-medium text-neutral-900 dark:text-white">{verification.id}</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50">
            <span className="text-neutral-600 dark:text-neutral-400">Verified By:</span>
            <span className="font-medium text-neutral-900 dark:text-white">{verification.verified_by || 'AI System'}</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50">
            <span className="text-neutral-600 dark:text-neutral-400">Verification Date:</span>
            <span className="font-medium text-neutral-900 dark:text-white">{verification.verification_date}</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50">
            <span className="text-neutral-600 dark:text-neutral-400">Processing Time:</span>
            <span className="font-medium text-neutral-900 dark:text-white">{verification.processing_time}ms</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-white/50 dark:bg-neutral-800/50">
            <span className="text-neutral-600 dark:text-neutral-400">AI Model Version:</span>
            <span className="font-mono text-xs font-medium text-neutral-900 dark:text-white">{verification.ai_model_version}</span>
          </div>
        </div>

        {/* Recommendations */}
        {verification.recommendations && verification.recommendations.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </h4>
            <ul className="space-y-1 text-sm text-indigo-700 dark:text-indigo-300">
              {verification.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Export Report Button */}
        <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Download Full Report (PDF)
        </Button>
      </div>
    </motion.div>

    {/* VERIFICATION HISTORY */}
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
    >
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-purple-500" />
        Verification History
      </h2>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        {verification.history.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                {item.action}
              </span>
              <Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'destructive' : 'default'}>
                {item.status}
              </Badge>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <p>By: {item.by}</p>
              <p>{item.timestamp}</p>
              {item.notes && <p className="italic">"{item.notes}"</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
</div>
```

---

## TECHNICAL REQUIREMENTS

### Imports
```tsx
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan, Brain, Cpu, CheckCircle, XCircle, AlertTriangle, Clock,
  ChevronLeft, Sparkles, Loader2, Eye, Smile, Shield, User,
  Monitor, Move, FileText, Download, Share2, Lightbulb, History,
  MapPin, Calendar, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
```

### Types
```tsx
interface FacialLandmark {
  x: number;
  y: number;
  type: string;
}

interface Verification {
  id: string;
  student: {
    name: string;
    nim: string;
    initials: string;
    photo: string;
    major: string;
    semester: number;
  };
  reference_photo: string;
  selfie_photo: string;
  match_score: number;
  confidence_level: number;
  status: 'verified' | 'rejected' | 'pending';
  uploaded_at: string;
  processing_time: number;
  face_quality: number;
  lighting_score: number;
  face_angle: number;
  sharpness_score: number;
  ai_insights: string;
  face_detection_confidence: number;
  features: {
    eyes: boolean;
    nose: boolean;
    mouth: boolean;
    eyebrows: boolean;
  };
  facial_symmetry: number;
  emotions: Array<{
    name: string;
    confidence: number;
  }>;
  liveness_score: number;
  liveness_checks: {
    real_person: boolean;
    no_screen: boolean;
    no_mask: boolean;
    eye_blink: boolean;
    head_movement: boolean;
  };
  anti_spoofing_passed: boolean;
  overall_assessment: string;
  verified_by: string | null;
  verification_date: string;
  ai_model_version: string;
  recommendations: string[];
  history: Array<{
    action: string;
    status: string;
    by: string;
    timestamp: string;
    notes?: string;
  }>;
}

interface PageProps {
  verification: Verification;
  facialLandmarks: {
    reference: FacialLandmark[];
    selfie: FacialLandmark[];
  };
}
```

### State Management
```tsx
const [isProcessing, setIsProcessing] = useState(false);

const handleVerify = async (action: 'approve' | 'reject') => {
  setIsProcessing(true);
  
  try {
    await router.post(`/admin/verifikasi-selfie/${verification.id}/${action}`, {}, {
      onSuccess: () => {
        toast.success(`Verifikasi ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
        router.visit('/admin/verifikasi-selfie');
      },
      onError: () => {
        toast.error('Gagal memproses verifikasi');
      },
    });
  } finally {
    setIsProcessing(false);
  }
};
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

const scanningVariants = {
  initial: { y: 0, opacity: 0.5 },
  animate: {
    y: [0, 300, 0],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    },
  },
} as const;

const aiPulseVariants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    },
  },
} as const;
```

---

## KESIMPULAN

Halaman Verifikasi Selfie Detail ini adalah halaman yang SANGAT COMPREHENSIVE dengan fitur AI yang lengkap:

1. **Header dengan Animated Gradient** - Indigo-purple-pink dengan AI particles
2. **3-Column Layout** - Student profile, Image comparison, AI analysis
3. **AI Face Comparison** - Side-by-side dengan facial landmarks overlay
4. **AI Match Score** - Circular progress dengan animated shimmer
5. **Facial Features Detection** - Eyes, nose, mouth, eyebrows detection
6. **Liveness Detection** - Anti-spoofing checks dengan multiple validations
7. **Verification Report** - Comprehensive report dengan recommendations
8. **Verification History** - Timeline of all verification actions
9. **Action Buttons** - Approve, Reject, Download, Share
10. **AI Processing Animations** - Scan lines, pulse effects, rotating icons

**FITUR AI ULTRA ADVANCED:**
- Real-time facial landmarks detection
- Face quality analysis (lighting, angle, sharpness, blur)
- Emotion detection dengan confidence scores
- Liveness detection (real person, no screen, no mask, eye blink, head movement)
- Anti-spoofing validation
- AI-powered match score dengan circular progress
- Facial symmetry analysis
- Comprehensive AI insights dan recommendations

Selamat mengimplementasikan! 🚀

### 3. BOTTOM SECTION - DETAILED ANALYSIS

```tsx
{/* FACIAL FEATURES COMPARISON TABLE */}
<motion.div
  variants={itemVariants}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
>
  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
    <ScanFace className="h-5 w-5 text-indigo-500" />
    Facial Features Comparison
  </h2>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-neutral-200 dark:border-neutral-700">
          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-white">Feature</th>
          <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-white">Reference</th>
          <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-white">Selfie</th>
          <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-white">Match %</th>
          <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-white">Status</th>
        </tr>
      </thead>
      <tbody>
        {facialFeatures.map((feature, index) => (
          <motion.tr
            key={feature.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          >
            <td className="py-4 px-4">
              <div className="flex items-center gap-2">
                {feature.icon}
                <span className="font-medium text-neutral-900 dark:text-white">{feature.name}</span>
              </div>
            </td>
            <td className="py-4 px-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {feature.reference}
            </td>
            <td className="py-4 px-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {feature.selfie}
            </td>
            <td className="py-4 px-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-16 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feature.match}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={cn(
                      "h-full",
                      feature.match >= 80 ? "bg-green-500" :
                      feature.match >= 60 ? "bg-yellow-500" :
                      "bg-red-500"
                    )}
                  />
                </div>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {feature.match}%
                </span>
              </div>
            </td>
            <td className="py-4 px-4 text-center">
              <Badge
                variant={
                  feature.match >= 80 ? 'success' :
                  feature.match >= 60 ? 'warning' :
                  'destructive'
                }
              >
                {feature.match >= 80 ? 'Match' : feature.match >= 60 ? 'Partial' : 'No Match'}
              </Badge>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
</motion.div>

{/* AI CONFIDENCE BREAKDOWN CHART */}
<motion.div
  variants={itemVariants}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
>
  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
    <BarChart3 className="h-5 w-5 text-purple-500" />
    AI Confidence Breakdown
  </h2>

  <div className="space-y-4">
    {confidenceMetrics.map((metric, index) => (
      <div key={metric.name}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {metric.icon}
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              {metric.name}
            </span>
          </div>
          <span className="text-sm font-bold text-neutral-900 dark:text-white">
            {metric.value}%
          </span>
        </div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metric.value}%` }}
            transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r"
            style={{
              backgroundImage: `linear-gradient(to right, ${metric.color.from}, ${metric.color.to})`
            }}
          >
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>
    ))}
  </div>
</motion.div>

{/* VERIFICATION HISTORY TIMELINE */}
<motion.div
  variants={itemVariants}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
>
  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
    <History className="h-5 w-5 text-blue-500" />
    Verification History
  </h2>

  <div className="space-y-4">
    {verificationHistory.map((item, index) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex gap-4"
      >
        {/* Timeline Line */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              item.status === 'verified' ? "bg-green-500" :
              item.status === 'rejected' ? "bg-red-500" :
              "bg-yellow-500"
            )}
          >
            {item.status === 'verified' && <CheckCircle className="h-5 w-5 text-white" />}
            {item.status === 'rejected' && <XCircle className="h-5 w-5 text-white" />}
            {item.status === 'pending' && <Clock className="h-5 w-5 text-white" />}
          </motion.div>
          {index < verificationHistory.length - 1 && (
            <div className="w-px h-full bg-neutral-200 dark:bg-neutral-700 mt-2" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          <div className="rounded-xl bg-white/50 dark:bg-neutral-800/50 p-4 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white">{item.action}</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.timestamp}</p>
              </div>
              <Badge variant="outline">{item.by}</Badge>
            </div>
            {item.note && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                {item.note}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
</motion.div>

{/* AI ANOMALY DETECTION ALERTS */}
{verification.anomalies && verification.anomalies.length > 0 && (
  <motion.div
    variants={itemVariants}
    className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6 backdrop-blur-xl shadow-xl"
  >
    <div className="flex items-center gap-3 mb-4">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </motion.div>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
        AI Anomaly Detection
      </h2>
    </div>

    <div className="space-y-3">
      {verification.anomalies.map((anomaly, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-red-200 dark:border-red-800"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
              {anomaly.type}
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {anomaly.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                Severity: {anomaly.severity}
              </Badge>
              <span className="text-xs text-neutral-500">
                Confidence: {anomaly.confidence}%
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)}

{/* RELATED VERIFICATIONS */}
<motion.div
  variants={itemVariants}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
>
  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
    <Users className="h-5 w-5 text-cyan-500" />
    Related Verifications
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {relatedVerifications.map((related, index) => (
      <motion.div
        key={related.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 cursor-pointer"
        onClick={() => router.visit(`/admin/verifikasi-selfie/${related.id}`)}
      >
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={related.student.photo} />
            <AvatarFallback>{related.student.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-neutral-900 dark:text-white truncate">
              {related.student.name}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {related.student.nim}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge
            variant={
              related.status === 'verified' ? 'success' :
              related.status === 'rejected' ? 'destructive' :
              'warning'
            }
            className="text-xs"
          >
            {related.status}
          </Badge>
          <span className="text-xs text-neutral-500">
            {related.match_score}% match
          </span>
        </div>
        
        <p className="text-xs text-neutral-500 mt-2">
          {related.timestamp}
        </p>
      </motion.div>
    ))}
  </div>
</motion.div>
```

---

## TECHNICAL REQUIREMENTS

### Imports
```tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Scan,
  Brain,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  ScanFace,
  BarChart3,
  History,
  AlertCircle,
  Users,
  Download,
  Share2,
} from 'lucide-react';
```

### State Management
```tsx
const [verification, setVerification] = useState<Verification>(initialData);
const [isProcessing, setIsProcessing] = useState(false);
const [facialLandmarks, setFacialLandmarks] = useState({
  reference: [],
  selfie: [],
});
const [facialFeatures, setFacialFeatures] = useState([]);
const [confidenceMetrics, setConfidenceMetrics] = useState([]);
const [verificationHistory, setVerificationHistory] = useState([]);
const [relatedVerifications, setRelatedVerifications] = useState([]);
```

### Types
```tsx
interface Verification {
  id: string;
  student: {
    name: string;
    nim: string;
    photo: string;
    initials: string;
    major: string;
    semester: number;
  };
  reference_photo: string;
  selfie_photo: string;
  match_score: number;
  confidence_level: number;
  status: 'pending' | 'verified' | 'rejected';
  uploaded_at: string;
  processing_time: number;
  face_quality: number;
  lighting_score: number;
  face_angle: number;
  sharpness_score: number;
  ai_insights: string;
  anomalies?: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
  }>;
}

interface FacialLandmark {
  x: number;
  y: number;
  type: string;
}

interface FacialFeature {
  name: string;
  icon: React.ReactNode;
  reference: string;
  selfie: string;
  match: number;
}

interface ConfidenceMetric {
  name: string;
  icon: React.ReactNode;
  value: number;
  color: {
    from: string;
    to: string;
  };
}
```

### AI Processing Functions
```tsx
// Simulate AI Face Detection
const detectFacialLandmarks = async (imageUrl: string) => {
  // Call AI API to detect facial landmarks
  const response = await fetch('/api/ai/detect-landmarks', {
    method: 'POST',
    body: JSON.stringify({ image: imageUrl }),
  });
  return response.json();
};

// Calculate Match Score
const calculateMatchScore = (reference: FacialLandmark[], selfie: FacialLandmark[]) => {
  // AI algorithm to calculate similarity
  let totalScore = 0;
  const features = ['eyes', 'nose', 'mouth', 'face_shape'];
  
  features.forEach(feature => {
    const refFeature = reference.filter(l => l.type === feature);
    const selfieFeature = selfie.filter(l => l.type === feature);
    const similarity = calculateSimilarity(refFeature, selfieFeature);
    totalScore += similarity;
  });
  
  return totalScore / features.length;
};

// Detect Anomalies
const detectAnomalies = (verification: Verification) => {
  const anomalies = [];
  
  if (verification.lighting_score < 50) {
    anomalies.push({
      type: 'Poor Lighting',
      description: 'Lighting conditions are not optimal for accurate face recognition',
      severity: 'medium',
      confidence: 85,
    });
  }
  
  if (Math.abs(verification.face_angle) > 15) {
    anomalies.push({
      type: 'Face Angle',
      description: 'Face is not directly facing the camera',
      severity: 'high',
      confidence: 92,
    });
  }
  
  if (verification.sharpness_score < 60) {
    anomalies.push({
      type: 'Image Blur',
      description: 'Image quality is too low for accurate verification',
      severity: 'high',
      confidence: 88,
    });
  }
  
  return anomalies;
};
```

### Action Handlers
```tsx
const handleVerify = async (action: 'approve' | 'reject') => {
  setIsProcessing(true);
  
  try {
    const response = await fetch(`/api/admin/verifikasi-selfie/${verification.id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      toast.success(
        action === 'approve' 
          ? 'Verifikasi berhasil disetujui' 
          : 'Verifikasi berhasil ditolak'
      );
      
      // Refresh data
      router.reload();
    }
  } catch (error) {
    toast.error('Terjadi kesalahan');
  } finally {
    setIsProcessing(false);
  }
};

const handleDownloadReport = () => {
  // Generate PDF report
  window.open(`/api/admin/verifikasi-selfie/${verification.id}/report`, '_blank');
};
```

### WebSocket Integration (Real-time Updates)
```tsx
useEffect(() => {
  // Connect to WebSocket for real-time AI processing updates
  const ws = new WebSocket(`ws://localhost:6001/verification/${verification.id}`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'processing_update') {
      setVerification(prev => ({
        ...prev,
        ...data.updates,
      }));
    }
    
    if (data.type === 'landmarks_detected') {
      setFacialLandmarks(data.landmarks);
    }
  };
  
  return () => ws.close();
}, [verification.id]);
```

---

## BACKEND REQUIREMENTS

### API Endpoints
```php
// routes/api.php
Route::prefix('admin/verifikasi-selfie')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/{id}', [SelfieVerificationController::class, 'show']);
    Route::post('/{id}/approve', [SelfieVerificationController::class, 'approve']);
    Route::post('/{id}/reject', [SelfieVerificationController::class, 'reject']);
    Route::get('/{id}/report', [SelfieVerificationController::class, 'downloadReport']);
});

Route::prefix('ai')->group(function () {
    Route::post('/detect-landmarks', [AIController::class, 'detectLandmarks']);
    Route::post('/calculate-match', [AIController::class, 'calculateMatch']);
});
```

### Controller
```php
// app/Http/Controllers/Admin/SelfieVerificationController.php
public function show($id)
{
    $verification = SelfieVerification::with(['student', 'session'])
        ->findOrFail($id);
    
    // Run AI analysis
    $aiAnalysis = $this->aiService->analyzeFace(
        $verification->reference_photo,
        $verification->selfie_photo
    );
    
    $verification->match_score = $aiAnalysis['match_score'];
    $verification->confidence_level = $aiAnalysis['confidence'];
    $verification->face_quality = $aiAnalysis['quality'];
    $verification->lighting_score = $aiAnalysis['lighting'];
    $verification->face_angle = $aiAnalysis['angle'];
    $verification->sharpness_score = $aiAnalysis['sharpness'];
    $verification->ai_insights = $aiAnalysis['insights'];
    
    // Detect anomalies
    $verification->anomalies = $this->aiService->detectAnomalies($verification);
    
    // Get related verifications
    $relatedVerifications = SelfieVerification::where('student_id', $verification->student_id)
        ->where('id', '!=', $id)
        ->latest()
        ->take(6)
        ->get();
    
    return Inertia::render('admin/verifikasi-selfie-detail', [
        'verification' => $verification,
        'facialLandmarks' => $aiAnalysis['landmarks'],
        'facialFeatures' => $aiAnalysis['features'],
        'confidenceMetrics' => $aiAnalysis['metrics'],
        'verificationHistory' => $verification->history,
        'relatedVerifications' => $relatedVerifications,
    ]);
}

public function approve($id)
{
    $verification = SelfieVerification::findOrFail($id);
    $verification->update([
        'status' => 'verified',
        'verified_by' => auth()->id(),
        'verified_at' => now(),
    ]);
    
    // Log history
    $verification->history()->create([
        'action' => 'Verifikasi Disetujui',
        'by' => auth()->user()->name,
        'note' => 'AI Match Score: ' . $verification->match_score . '%',
    ]);
    
    return response()->json(['success' => true]);
}
```

### AI Service
```php
// app/Services/AIFaceRecognitionService.php
class AIFaceRecognitionService
{
    public function analyzeFace($referencePhoto, $selfiePhoto)
    {
        // Call Python AI service or external API
        $response = Http::post(config('services.ai.endpoint') . '/analyze', [
            'reference' => $referencePhoto,
            'selfie' => $selfiePhoto,
        ]);
        
        return $response->json();
    }
    
    public function detectLandmarks($imageUrl)
    {
        // Detect facial landmarks using AI
        $response = Http::post(config('services.ai.endpoint') . '/landmarks', [
            'image' => $imageUrl,
        ]);
        
        return $response->json();
    }
    
    public function detectAnomalies($verification)
    {
        $anomalies = [];
        
        if ($verification->lighting_score < 50) {
            $anomalies[] = [
                'type' => 'Poor Lighting',
                'description' => 'Lighting conditions are not optimal',
                'severity' => 'medium',
                'confidence' => 85,
            ];
        }
        
        // Add more anomaly detection logic
        
        return $anomalies;
    }
}
```

---

## KESIMPULAN

File `resources/js/pages/admin/verifikasi-selfie-detail.tsx` harus memiliki:

1. Header dengan animated gradient indigo-purple-pink
2. AI status badge dengan rotating sparkles animation
3. 2-column layout: Image comparison (left) + Details & Actions (right)
4. AI facial landmarks overlay dengan detection boxes
5. AI scanning line animation
6. Face match score dengan animated circular progress
7. AI analysis details (quality, lighting, angle, sharpness)
8. Facial features comparison table
9. AI confidence breakdown chart dengan animated bars
10. Verification history timeline
11. AI anomaly detection alerts
12. Related verificatio