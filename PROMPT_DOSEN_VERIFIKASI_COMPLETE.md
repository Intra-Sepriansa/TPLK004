# PROMPT LENGKAP: SISTEM VERIFIKASI SELFIE KEHADIRAN DOSEN

## 🎯 OVERVIEW
Sistem verifikasi selfie kehadiran dengan AI yang SANGAT SANGAT CANGGIH untuk dosen.

**Files:**
- Main: `resources/js/pages/dosen/verification.tsx`
- Detail: `resources/js/pages/dosen/verification-detail.tsx`
- Controller: `app/Http/Controllers/Dosen/VerificationController.php`
- AI Service: `app/Services/SelfieVerificationAIService.php`

**UI/UX:** 100% SAMA dengan `resources/js/pages/admin/kas.tsx`

---

## 🎨 WARNA & STYLE - WAJIB EXACT COPY

### Header Background
```tsx
bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500
```

### Animated Background
```tsx
animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
style={{ backgroundSize: '200% 200%' }}
```

### Container Cards
```tsx
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl
```

### Summary Cards dengan Glow
```tsx
// Card container
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl

// Glow orb
<motion.div
    animate={{
        scale: hoveredCard === 'id' ? 1.5 : 1,
        opacity: hoveredCard === 'id' ? 0.4 : 0.2,
    }}
    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color]-500 blur-3xl"
/>

// Icon container
rounded-2xl bg-gradient-to-br from-[color]-400 to-[color]-600 text-white shadow-lg shadow-[color]-500/30

// Hover effect
hover: { scale: 1.03, y: -8 }
```

---

## 📄 VERIFICATION LIST - GRID VIEW

### Filters & Search Bar
```tsx
<motion.div
    variants={itemVariants}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
>
    <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[300px]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Cari mahasiswa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>

        {/* Status Filter */}
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
        >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
        </select>

        {/* Date Filter */}
        <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
        />

        {/* View Mode Toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <button
                onClick={() => setViewMode('grid')}
                className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'grid' && "bg-white dark:bg-neutral-700 shadow-sm"
                )}
            >
                <Grid3x3 className="h-5 w-5" />
            </button>
            <button
                onClick={() => setViewMode('list')}
                className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'list' && "bg-white dark:bg-neutral-700 shadow-sm"
                )}
            >
                <List className="h-5 w-5" />
            </button>
        </div>
    </div>
</motion.div>
```

### Verification Cards - Grid View
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <AnimatePresence mode="popLayout">
        {verifications.map((verification, index) => (
            <motion.div
                key={verification.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => router.visit(`/dosen/verification/${verification.id}`)}
                className="group relative overflow-hidden rounded-2xl border-2 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md p-5 cursor-pointer transition-all hover:shadow-2xl"
            >
                {/* Status Indicator Glow */}
                <div className={cn(
                    "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30",
                    verification.status === 'pending' && "bg-amber-500",
                    verification.status === 'approved' && "bg-emerald-500",
                    verification.status === 'rejected' && "bg-red-500"
                )} />

                {/* Content */}
                <div className="relative">
                    {/* Student Info Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                            <img
                                src={verification.mahasiswa.avatar_url}
                                alt={verification.mahasiswa.nama}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-neutral-700"
                            />
                            {verification.is_suspicious && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center"
                                >
                                    <AlertTriangle className="h-3 w-3 text-white" />
                                </motion.div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-neutral-900 dark:text-white truncate">
                                {verification.mahasiswa.nama}
                            </h3>
                            <p className="text-sm text-neutral-500 font-mono">
                                {verification.mahasiswa.nim}
                            </p>
                        </div>
                    </div>

                    {/* Selfie Preview */}
                    <div className="relative mb-4 rounded-xl overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800">
                        <img
                            src={verification.selfie_url}
                            alt="Selfie"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-8 w-8 text-white" />
                        </div>

                        {/* AI Confidence Badge */}
                        {verification.ai_confidence && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {verification.ai_confidence}%
                            </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                            {verification.status === 'pending' && (
                                <span className="px-2 py-1 rounded-lg bg-amber-500/90 text-white text-xs font-bold backdrop-blur-sm">
                                    Pending
                                </span>
                            )}
                            {verification.status === 'approved' && (
                                <span className="px-2 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Approved
                                </span>
                            )}
                            {verification.status === 'rejected' && (
                                <span className="px-2 py-1 rounded-lg bg-red-500/90 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Rejected
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                {verification.date_display}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Clock className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                {verification.time_display}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                {verification.distance}m
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Smartphone className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-neutral-600 dark:text-neutral-400 truncate">
                                {verification.device_type}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions for Pending */}
                    {verification.status === 'pending' && (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickApprove(verification.id);
                                }}
                                className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20 flex items-center justify-center gap-1"
                            >
                                <Check className="h-3 w-3" />
                                Setujui
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickReject(verification.id);
                                }}
                                className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all border border-red-500/20 flex items-center justify-center gap-1"
                            >
                                <X className="h-3 w-3" />
                                Tolak
                            </button>
                        </div>
                    )}

                    {/* Time Indicator */}
                    <div className="mt-3 text-xs text-neutral-400 text-center">
                        {formatRelativeTime(verification.created_at)}
                    </div>
                </div>
            </motion.div>
        ))}
    </AnimatePresence>
</div>
```

---

## 📱 DETAIL PAGE: resources/js/pages/dosen/verification-detail.tsx

### Page Layout Structure
```tsx
export default function VerificationDetail({ verification }) {
    const [activeTab, setActiveTab] = useState('overview');
    
    return (
        <DosenLayout>
            <Head title={`Verifikasi - ${verification.mahasiswa.nama}`} />
            
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-black p-6 space-y-6"
            >
                {/* Header - EXACT STYLE dari Kas Admin */}
                <DetailHeader verification={verification} />
                
                {/* Main Content - 2 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        <SelfieComparisonSection verification={verification} />
                        <AIAnalysisSection analysis={verification.ai_analysis} />
                        <LocationMapSection location={verification.location} />
                        <DeviceInfoSection device={verification.device} />
                        {verification.fraud_indicators.is_suspicious && (
                            <FraudDetectionSection indicators={verification.fraud_indicators} />
                        )}
                    </div>
                    
                    {/* Right Column - Sidebar (1/3) */}
                    <div className="space-y-6">
                        <QuickActionsPanel verification={verification} />
                        <StudentInfoCard 
                            student={verification.mahasiswa} 
                            history={verification.student_history} 
                        />
                        <SessionInfoCard session={verification.session} />
                        <VerificationTimeline verification={verification} />
                    </div>
                </div>
            </motion.div>
        </DosenLayout>
    );
}
```

### Detail Header Component
```tsx
function DetailHeader({ verification }) {
    return (
        <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        >
            {/* Animated Gradient Background - EXACT SAMA */}
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

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            {/* 3 Pulse Rings */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: i * 1
                    }}
                />
            ))}

            <div className="relative">
                <div className="flex items-center justify-between flex-wrap gap-6">
                    {/* Left: Student Info */}
                    <div className="flex items-center gap-5">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative"
                        >
                            <img
                                src={verification.mahasiswa.avatar}
                                alt={verification.mahasiswa.nama}
                                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/30"
                            />
                            {verification.ai_analysis.confidence >= 90 && (
                                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-white/30">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </motion.div>
                        <div>
                            <p className="text-sm text-indigo-100 font-medium">Detail Verifikasi</p>
                            <h1 className="text-3xl font-bold text-white">
                                {verification.mahasiswa.nama}
                            </h1>
                            <p className="mt-1 text-indigo-100 font-mono">
                                {verification.mahasiswa.nim}
                            </p>
                        </div>
                    </div>

                    {/* Right: Status & AI Score */}
                    <div className="flex items-center gap-3">
                        {/* AI Confidence */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 border border-white/10"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-white" />
                                <div>
                                    <p className="text-xs text-white/80">AI Confidence</p>
                                    <span className="text-2xl font-bold text-white">
                                        {verification.ai_analysis.confidence}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className={cn(
                                "rounded-2xl backdrop-blur-xl px-6 py-3 border font-bold",
                                verification.status === 'pending' && "bg-amber-500/20 border-amber-300/30 text-white",
                                verification.status === 'approved' && "bg-emerald-500/20 border-emerald-300/30 text-white",
                                verification.status === 'rejected' && "bg-red-500/20 border-red-300/30 text-white"
                            )}
                        >
                            {verification.status === 'pending' && 'Pending Review'}
                            {verification.status === 'approved' && 'Disetujui'}
                            {verification.status === 'rejected' && 'Ditolak'}
                        </motion.div>
                    </div>
                </div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10"
                >
                    <button
                        onClick={() => router.visit('/dosen/verification')}
                        className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/30 border border-white/20"
                    >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Kembali
                    </button>
                    
                    {verification.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleApprove(verification.id)}
                                className="flex items-center gap-2 rounded-xl bg-emerald-500/30 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-emerald-500/40 border border-emerald-300/30"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Setujui Verifikasi
                            </button>
                            <button
                                onClick={() => handleReject(verification.id)}
                                className="flex items-center gap-2 rounded-xl bg-red-500/30 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-red-500/40 border border-red-300/30"
                            >
                                <XCircle className="h-4 w-4" />
                                Tolak Verifikasi
                            </button>
                        </>
                    )}
                    
                    <button className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/30 border border-white/20">
                        <Download className="h-4 w-4" />
                        Export PDF
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
}
```


### Selfie Comparison Section
```tsx
function SelfieComparisonSection({ verification }) {
    const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay' | 'slider'>('side-by-side');
    const [sliderPosition, setSliderPosition] = useState(50);
    
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                        <Camera className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                            Perbandingan Selfie
                        </h2>
                        <p className="text-sm text-neutral-500">
                            Selfie kehadiran vs Foto referensi
                        </p>
                    </div>
                </div>
                
                {/* Comparison Mode Toggle */}
                <div className="flex gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <button
                        onClick={() => setComparisonMode('side-by-side')}
                        className={cn(
                            "px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                            comparisonMode === 'side-by-side' && "bg-white dark:bg-neutral-700 shadow-sm"
                        )}
                    >
                        Side by Side
                    </button>
                    <button
                        onClick={() => setComparisonMode('overlay')}
                        className={cn(
                            "px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                            comparisonMode === 'overlay' && "bg-white dark:bg-neutral-700 shadow-sm"
                        )}
                    >
                        Overlay
                    </button>
                    <button
                        onClick={() => setComparisonMode('slider')}
                        className={cn(
                            "px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                            comparisonMode === 'slider' && "bg-white dark:bg-neutral-700 shadow-sm"
                        )}
                    >
                        Slider
                    </button>
                </div>
            </div>

            {/* Comparison View */}
            {comparisonMode === 'side-by-side' && (
                <div className="grid grid-cols-2 gap-6">
                    {/* Selfie Kehadiran */}
                    <div className="space-y-3">
                        <div className="relative rounded-2xl overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800 group">
                            <img
                                src={verification.selfie_url}
                                alt="Selfie Kehadiran"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-semibold text-sm">Selfie Kehadiran</p>
                                <p className="text-white/80 text-xs">{verification.submitted_at}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-3">
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                Selfie Kehadiran
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                                Live
                            </span>
                        </div>
                    </div>

                    {/* Foto Referensi */}
                    <div className="space-y-3">
                        <div className="relative rounded-2xl overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800 group">
                            <img
                                src={verification.reference_photo_url}
                                alt="Foto Referensi"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-semibold text-sm">Foto Referensi</p>
                                <p className="text-white/80 text-xs">Database mahasiswa</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-3">
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                Foto Referensi
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                                Database
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Face Match Score */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-700/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Face Match Score
                    </span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {verification.ai_analysis.face_match_score}%
                    </span>
                </div>
                <div className="relative h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${verification.ai_analysis.face_match_score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full",
                            verification.ai_analysis.face_match_score >= 90 && "bg-gradient-to-r from-emerald-500 to-green-600",
                            verification.ai_analysis.face_match_score >= 70 && verification.ai_analysis.face_match_score < 90 && "bg-gradient-to-r from-amber-500 to-orange-600",
                            verification.ai_analysis.face_match_score < 70 && "bg-gradient-to-r from-red-500 to-rose-600"
                        )}
                    />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                    {verification.ai_analysis.face_match_score >= 90 && "✓ Kecocokan wajah sangat tinggi"}
                    {verification.ai_analysis.face_match_score >= 70 && verification.ai_analysis.face_match_score < 90 && "⚠ Kecocokan wajah cukup baik"}
                    {verification.ai_analysis.face_match_score < 70 && "✗ Kecocokan wajah rendah"}
                </p>
            </div>
        </motion.div>
    );
}
```

### AI Analysis Section
```tsx
function AIAnalysisSection({ analysis }) {
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl p-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        AI Analysis
                    </h2>
                    <p className="text-sm text-neutral-500">
                        Multi-layer verification results
                    </p>
                </div>
            </div>

            {/* Overall Decision */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        AI Recommendation
                    </span>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        analysis.recommendation === 'approve' && "bg-emerald-500 text-white",
                        analysis.recommendation === 'review' && "bg-amber-500 text-white",
                        analysis.recommendation === 'reject' && "bg-red-500 text-white"
                    )}>
                        {analysis.recommendation === 'approve' && '✓ APPROVE'}
                        {analysis.recommendation === 'review' && '⚠ REVIEW'}
                        {analysis.recommendation === 'reject' && '✗ REJECT'}
                    </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {analysis.recommendation === 'approve' && "Semua verifikasi passed. Aman untuk disetujui."}
                    {analysis.recommendation === 'review' && "Beberapa indikator memerlukan review manual."}
                    {analysis.recommendation === 'reject' && "Terdeteksi anomali. Disarankan untuk ditolak."}
                </p>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Face Detection */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            Face Detection
                        </span>
                        {analysis.face_detected ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                        )}
                    </div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {analysis.face_detected ? 'Detected' : 'Not Found'}
                    </p>
                    {analysis.multiple_faces && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            ⚠ Multiple faces detected
                        </p>
                    )}
                </div>

                {/* Liveness Check */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            Liveness Check
                        </span>
                        {analysis.is_live_photo ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                        )}
                    </div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {analysis.is_live_photo ? 'Live Photo' : 'Spoofing'}
                    </p>
                    {analysis.spoofing_detected && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            ✗ Spoofing detected
                        </p>
                    )}
                </div>

                {/* Image Quality */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            Image Quality
                        </span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {analysis.image_quality}%
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                            style={{ width: `${analysis.image_quality}%` }}
                        />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                        Blur: {analysis.blur_detection}% | Light: {analysis.lighting_quality}%
                    </p>
                </div>

                {/* Confidence Score */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            AI Confidence
                        </span>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            {analysis.confidence}%
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                            style={{ width: `${analysis.confidence}%` }}
                        />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                        Overall verification confidence
                    </p>
                </div>
            </div>

            {/* Detailed Analysis */}
            {analysis.analysis_details && (
                <div className="mt-6 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
                        Detailed Analysis
                    </h3>
                    <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                        {Object.entries(analysis.analysis_details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                                <span className="font-mono">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
```

### Location Map Section
```tsx
function LocationMapSection({ location }) {
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl p-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                    <MapPin className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        Location Verification
                    </h2>
                    <p className="text-sm text-neutral-500">
                        GPS coordinates & geofencing
                    </p>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-800 mb-4">
                {/* Placeholder for actual map (use Leaflet or Google Maps) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                        <p className="text-sm text-neutral-500">
                            Map: {location.latitude}, {location.longitude}
                        </p>
                    </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    {location.is_valid ? (
                        <div className="px-3 py-2 rounded-xl bg-emerald-500/90 backdrop-blur-sm text-white text-sm font-bold flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Dalam Radius
                        </div>
                    ) : (
                        <div className="px-3 py-2 rounded-xl bg-red-500/90 backdrop-blur-sm text-white text-sm font-bold flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Diluar Radius
                        </div>
                    )}
                </div>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60">
                    <p className="text-xs text-neutral-500 mb-1">Distance from Campus</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {location.distance_from_campus}m
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60">
                    <p className="text-xs text-neutral-500 mb-1">Allowed Radius</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {location.allowed_radius}m
                    </p>
                </div>
            </div>

            {/* Address */}
            <div className="mt-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <p className="text-xs text-neutral-500 mb-1">Address</p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {location.address || 'Address not available'}
                </p>
            </div>

            {/* Coordinates */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                    <span className="text-neutral-500">Latitude:</span>
                    <span className="ml-2 font-mono text-neutral-900 dark:text-white">
                        {location.latitude}
                    </span>
                </div>
                <div>
                    <span className="text-neutral-500">Longitude:</span>
                    <span className="ml-2 font-mono text-neutral-900 dark:text-white">
                        {location.longitude}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
```

