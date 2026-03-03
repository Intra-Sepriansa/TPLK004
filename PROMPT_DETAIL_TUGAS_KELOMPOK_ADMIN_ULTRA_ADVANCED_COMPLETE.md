# PROMPT: DETAIL TUGAS KELOMPOK - ADMIN
## Ultra Advanced Implementation dengan Inovasi Signifikan

---

## 🎯 OBJECTIVE
Membuat halaman Detail Tugas Kelompok yang sangat lengkap dan profesional untuk admin dengan fitur-fitur inovatif untuk mengelola tugas kelompok, monitoring progress, penilaian, analitik mendalam, dan penyelesaian konflik.

**File Target**: `resources/js/pages/admin/tugas-kelompok-detail.tsx`  
**Reference**: Dashboard Admin Design System

---

## 📋 CURRENT STATE ANALYSIS

### ✅ Fitur yang Sudah Ada
- Header dengan informasi tugas kelompok
- Quick stats (6 statistik utama)
- Tab navigation (Kelompok, Analitik, Penilaian, Konflik)
- Daftar kelompok dengan member dan progress
- Sistem penilaian kelompok
- Laporan konflik
- Lock/Unlock assignment
- Random group generation

### ❌ Yang Perlu Ditingkatkan
- Header icon masih ada container (harus dihilangkan)
- Animasi icon yang bergerak-gerak (harus dihilangkan)
- UI/UX mobile belum optimal
- Tombol kembali belum konsisten dengan menu lain
- Kurang inovasi fitur monitoring real-time
- Belum ada fitur export data
- Belum ada timeline activity
- Belum ada peer evaluation detail
- Belum ada group comparison
- Belum ada advanced filtering

---

## 🎨 DESIGN SYSTEM (100% Match Dashboard Admin)

### Color Palette
```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-violet-fuchsia: linear-gradient(to bottom right, #8b5cf6, #d946ef);

/* Background */
--bg-dark: #0a0a0a;
--bg-card: rgba(255, 255, 255, 0.40);
--bg-card-dark: rgba(23, 23, 23, 0.40);

/* Borders */
--border-light: rgba(255, 255, 255, 0.20);
--border-hover: rgba(255, 255, 255, 0.30);

/* Text */
--text-primary: #0f172a;
--text-secondary: #64748b;
--text-muted: #94a3b8;
```

### Typography
- Heading 1: `text-2xl sm:text-3xl font-bold`
- Heading 2: `text-lg font-bold`
- Body: `text-sm`
- Caption: `text-xs text-slate-500`

### Spacing & Layout
- Container: `p-4 md:p-6`
- Card: `p-5 md:p-6`
- Gap: `gap-3 md:gap-4 lg:gap-6`
- Radius: `rounded-2xl` (cards), `rounded-xl` (buttons)

---

## 🚀 INOVASI FITUR SIGNIFIKAN

### 1. REAL-TIME GROUP MONITORING DASHBOARD


#### Fitur:
- **Live Activity Feed**: Menampilkan aktivitas terbaru dari semua kelompok
- **Progress Heatmap**: Visualisasi progress semua kelompok dalam bentuk heatmap
- **Active Members Indicator**: Menunjukkan anggota yang sedang aktif (online)
- **Task Completion Timeline**: Timeline penyelesaian task per kelompok
- **Contribution Leaderboard**: Ranking kontribusi anggota

#### Implementation:
```typescript
// State untuk monitoring
const [liveActivities, setLiveActivities] = useState<Activity[]>([]);
const [activeMembers, setActiveMembers] = useState<number[]>([]);
const [refreshInterval, setRefreshInterval] = useState(30000); // 30 detik

// Auto refresh data
useEffect(() => {
    const interval = setInterval(() => {
        router.reload({ only: ['groups', 'analytics'] });
    }, refreshInterval);
    return () => clearInterval(interval);
}, [refreshInterval]);
```

### 2. ADVANCED ANALYTICS & INSIGHTS

#### Fitur:
- **Performance Comparison Chart**: Grafik perbandingan performa antar kelompok
- **Contribution Distribution**: Distribusi kontribusi dalam kelompok
- **Submission Pattern Analysis**: Analisis pola pengumpulan tugas
- **Risk Assessment**: Identifikasi kelompok yang berisiko tidak submit
- **Engagement Score**: Skor keterlibatan per kelompok
- **Time Management Analysis**: Analisis manajemen waktu kelompok

#### Metrics yang Ditampilkan:
- Average response time
- Peak activity hours
- Collaboration intensity
- File sharing frequency
- Message activity pattern
- Task completion velocity

### 3. SMART GRADING SYSTEM

#### Fitur:
- **Bulk Grading**: Nilai beberapa kelompok sekaligus
- **Grade Templates**: Template penilaian yang bisa disimpan
- **Auto-Calculate Individual Grades**: Hitung nilai individu berdasarkan kontribusi
- **Peer Evaluation Integration**: Integrasi dengan peer evaluation
- **Grade Distribution Chart**: Visualisasi distribusi nilai
- **Grading Rubric**: Rubrik penilaian yang detail
- **Grade History**: Riwayat perubahan nilai
- **Export Grades**: Export nilai ke Excel/CSV

#### Implementation:
```typescript
// Bulk grading state
const [bulkGradeMode, setBulkGradeMode] = useState(false);
const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
const [bulkGradeValue, setBulkGradeValue] = useState('');

// Grade calculation dengan kontribusi
const calculateIndividualGrade = (groupGrade: number, contributionPoints: number, avgContribution: number) => {
    const contributionFactor = contributionPoints / avgContribution;
    return Math.round(groupGrade * contributionFactor * 100) / 100;
};
```

### 4. GROUP MANAGEMENT TOOLS

#### Fitur:
- **Drag & Drop Member Transfer**: Pindahkan anggota antar kelompok dengan drag & drop
- **Auto-Balance Groups**: Otomatis seimbangkan jumlah anggota
- **Merge Groups**: Gabungkan 2 kelompok
- **Split Group**: Pecah kelompok menjadi 2
- **Swap Members**: Tukar anggota antar kelompok
- **Add/Remove Members**: Tambah/hapus anggota kelompok
- **Assign Leader**: Tetapkan ketua kelompok

### 5. CONFLICT RESOLUTION CENTER

#### Fitur:
- **Conflict Priority System**: Sistem prioritas konflik (High, Medium, Low)
- **Conflict Timeline**: Timeline penyelesaian konflik
- **Mediation Notes**: Catatan mediasi admin
- **Auto-Notification**: Notifikasi otomatis ke pihak terkait
- **Resolution Templates**: Template penyelesaian konflik
- **Conflict Statistics**: Statistik konflik per kelompok

### 6. EXPORT & REPORTING

#### Fitur:
- **Export to Excel**: Export semua data ke Excel
- **Export to PDF**: Generate laporan PDF
- **Custom Report Builder**: Buat laporan custom
- **Email Report**: Kirim laporan via email
- **Schedule Reports**: Jadwalkan laporan otomatis

### 7. ADVANCED FILTERING & SEARCH

#### Fitur:
- **Multi-Filter**: Filter berdasarkan status, nilai, progress, dll
- **Search Groups**: Cari kelompok berdasarkan nama/anggota
- **Sort Options**: Urutkan berdasarkan berbagai kriteria
- **Save Filter Presets**: Simpan preset filter
- **Quick Filters**: Filter cepat (Belum Submit, Terlambat, Belum Dinilai)

---

## 📱 STRUKTUR HALAMAN LENGKAP

### HEADER SECTION (Enhanced)


```tsx
{/* Header - NO CONTAINER on Icon, NO Floating Animation */}
<motion.div
    variants={iV}
    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
>
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
    
    {/* Decorative Elements */}
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

    <div className="relative z-10">
        {/* Back Button - Consistent Style */}
        <motion.button
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.visit('/admin/tugas-kelompok')}
            className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
        >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Tugas Kelompok
        </motion.button>

        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            {/* Left: Title & Info */}
            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                {/* Icon - NO CONTAINER, NO FLOATING ANIMATION */}
                <motion.div
                    className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <img
                        src={TugasIcon}
                        alt="Detail Tugas Kelompok"
                        className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                    />
                </motion.div>

                <div className="flex-1">
                    <h1 className="text-2xl font-bold sm:text-3xl">{assignment.title}</h1>
                    <p className="mt-1 text-sm text-purple-100">
                        {assignment.course.nama}
                        {assignment.dosen && ` • ${assignment.dosen.nama}`}
                    </p>

                    {/* Badges */}
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', fb.color)}>
                            {fb.label}
                        </span>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', gb.color)}>
                            {gb.label}
                        </span>
                        {assignment.is_locked && (
                            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                <Lock className="h-3 w-3" /> Locked
                            </span>
                        )}
                        {assignment.formation_deadline_display && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                Deadline Formasi: {assignment.formation_deadline_display}
                            </span>
                        )}
                        {assignment.submission_deadline_display && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                Deadline Submit: {assignment.submission_deadline_display}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/toggle-lock`)}
                        className="rounded-xl border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                    >
                        {assignment.is_locked ? (
                            <>
                                <Unlock className="mr-2 h-4 w-4" /> Unlock
                            </>
                        ) : (
                            <>
                                <Lock className="mr-2 h-4 w-4" /> Lock
                            </>
                        )}
                    </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={() => setExportDialogOpen(true)}
                        className="rounded-xl border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                    >
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(true)}
                        className="rounded-xl border border-red-400/30 bg-red-500/30 text-white backdrop-blur-md hover:bg-red-500/40"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </Button>
                </motion.div>
            </div>
        </div>

        {/* Description (if exists) */}
        {assignment.description && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
            >
                <p className="text-sm leading-relaxed text-white/90">{assignment.description}</p>
            </motion.div>
        )}
    </div>
</motion.div>
```

### QUICK STATS SECTION (Enhanced with Icons)


```tsx
{/* Quick Stats - Icon colors match container colors */}
<motion.div variants={iV} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    {[
        {
            label: 'Total Kelompok',
            value: analytics.overview.total_groups,
            icon: StatGroupIcon,
            cardClass: 'border-violet-300/40 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20',
            valueClass: 'text-violet-700 dark:text-violet-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(139,92,246,0.35)]', // Violet shadow
        },
        {
            label: 'Total Mahasiswa',
            value: analytics.overview.total_students,
            icon: StatStudentsIcon,
            cardClass: 'border-blue-300/40 bg-blue-100/55 dark:border-blue-500/30 dark:bg-blue-900/20',
            valueClass: 'text-blue-700 dark:text-blue-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(59,130,246,0.35)]', // Blue shadow
        },
        {
            label: 'Sudah Submit',
            value: analytics.overview.submitted_groups,
            icon: StatSubmittedIcon,
            cardClass: 'border-emerald-300/45 bg-emerald-100/55 dark:border-emerald-500/30 dark:bg-emerald-900/20',
            valueClass: 'text-emerald-700 dark:text-emerald-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(16,185,129,0.35)]', // Emerald shadow
        },
        {
            label: 'Sudah Dinilai',
            value: analytics.overview.graded_groups,
            icon: StatGradedIcon,
            cardClass: 'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20',
            valueClass: 'text-amber-700 dark:text-amber-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(245,158,11,0.35)]', // Amber shadow
        },
        {
            label: 'Rata-rata Nilai',
            value: analytics.overview.average_grade.toFixed(1),
            icon: StatAverageIcon,
            cardClass: 'border-fuchsia-300/45 bg-fuchsia-100/55 dark:border-fuchsia-500/30 dark:bg-fuchsia-900/20',
            valueClass: 'text-fuchsia-700 dark:text-fuchsia-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(217,70,239,0.35)]', // Fuchsia shadow
        },
        {
            label: 'Completion Rate',
            value: `${analytics.overview.total_groups > 0 ? ((analytics.overview.submitted_groups / analytics.overview.total_groups) * 100).toFixed(0) : 0}%`,
            icon: StatCompletionIcon,
            cardClass: 'border-cyan-300/45 bg-cyan-100/55 dark:border-cyan-500/30 dark:bg-cyan-900/20',
            valueClass: 'text-cyan-700 dark:text-cyan-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(6,182,212,0.35)]', // Cyan shadow
        },
    ].map((stat, index) => (
        <motion.div
            key={index}
            variants={iV}
            whileHover={{ y: -4, scale: 1.02 }}
            className={cn(
                'rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-300',
                stat.cardClass
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <img
                    src={stat.icon}
                    alt={stat.label}
                    className="h-11 w-11 shrink-0 object-contain"
                    style={{ filter: stat.iconFilter }}
                />
                <p className={cn('text-xl font-bold', stat.valueClass)}>{stat.value}</p>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
        </motion.div>
    ))}
</motion.div>
```

### FILTER & SEARCH BAR (New Innovation)

```tsx
{/* Advanced Filter & Search */}
<motion.div
    variants={iV}
    className="rounded-2xl border border-white/20 bg-white/40 p-4 backdrop-blur-xl shadow-lg dark:border-white/5 dark:bg-neutral-900/40"
>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
                type="text"
                placeholder="Cari kelompok atau anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-white/20 bg-white/50 pl-10 backdrop-blur-sm dark:bg-neutral-800/50"
            />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
            <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="rounded-xl"
            >
                Semua ({groups.length})
            </Button>
            <Button
                size="sm"
                variant={filterStatus === 'submitted' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('submitted')}
                className="rounded-xl"
            >
                Sudah Submit ({groups.filter(g => g.has_submission).length})
            </Button>
            <Button
                size="sm"
                variant={filterStatus === 'unsubmitted' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('unsubmitted')}
                className="rounded-xl"
            >
                Belum Submit ({groups.filter(g => !g.has_submission).length})
            </Button>
            <Button
                size="sm"
                variant={filterStatus === 'late' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('late')}
                className="rounded-xl"
            >
                Terlambat ({groups.filter(g => g.is_late).length})
            </Button>
            <Button
                size="sm"
                variant={filterStatus === 'ungraded' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('ungraded')}
                className="rounded-xl"
            >
                Belum Dinilai ({groups.filter(g => g.has_submission && !g.grade).length})
            </Button>
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] rounded-xl border-white/20 bg-white/50 backdrop-blur-sm dark:bg-neutral-800/50">
                <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="name">Nama Kelompok</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="grade">Nilai</SelectItem>
                <SelectItem value="members">Jumlah Anggota</SelectItem>
                <SelectItem value="submission">Status Submit</SelectItem>
            </SelectContent>
        </Select>
    </div>
</motion.div>
```

### TAB NAVIGATION (Enhanced)


```tsx
{/* Enhanced Tab Navigation */}
<motion.div
    variants={iV}
    className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50"
>
    <div className="max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex min-w-max gap-1">
            {[
                { key: 'groups', label: 'Kelompok', icon: Users2, count: groups.length },
                { key: 'analytics', label: 'Analitik', icon: BarChart3 },
                { key: 'grading', label: 'Penilaian', icon: Award, count: groups.filter(g => g.has_submission).length },
                { key: 'monitoring', label: 'Monitoring', icon: Activity },
                { key: 'conflicts', label: 'Konflik', icon: AlertTriangle, count: conflictReports.length, alert: conflictReports.length > 0 },
                { key: 'settings', label: 'Pengaturan', icon: Settings },
            ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                    <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? 'default' : 'outline'}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'shrink-0 gap-2 whitespace-nowrap rounded-xl transition-all duration-300',
                            activeTab === tab.key
                                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                                : 'hover:bg-white/50 dark:hover:bg-neutral-800/50'
                        )}
                    >
                        <TabIcon className="h-4 w-4" />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={cn(
                                    'ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs',
                                    activeTab === tab.key
                                        ? 'bg-white/20 text-white'
                                        : tab.alert
                                        ? 'bg-red-500 text-white'
                                        : 'bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-slate-300'
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </Button>
                );
            })}
        </div>
    </div>
</motion.div>
```

### TAB CONTENT: KELOMPOK (Enhanced)

```tsx
{activeTab === 'groups' && (
    <motion.div
        key="groups"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-3"
    >
        {/* Unassigned Students Alert */}
        {unassignedStudents.length > 0 && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-amber-200/50 bg-amber-50/50 p-4 backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-900/10"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h4 className="mb-2 flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                            <AlertTriangle className="h-4 w-4" />
                            {unassignedStudents.length} Mahasiswa Belum Berkelompok
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {unassignedStudents.slice(0, 10).map((student) => (
                                <span
                                    key={student.id}
                                    className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-amber-700 dark:bg-neutral-800 dark:text-slate-300"
                                >
                                    {student.nama}
                                </span>
                            ))}
                            {unassignedStudents.length > 10 && (
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                    +{unassignedStudents.length - 10} lainnya
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShowAssignDialog(true)}
                        className="shrink-0 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign ke Kelompok
                    </Button>
                </div>
            </motion.div>
        )}

        {/* Bulk Actions Bar (when groups selected) */}
        <AnimatePresence>
            {selectedGroups.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-purple-200/50 bg-purple-50/50 p-4 backdrop-blur-sm dark:border-purple-500/30 dark:bg-purple-900/10"
                >
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            {selectedGroups.length} kelompok dipilih
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setBulkGradeMode(true)}
                                className="rounded-xl"
                            >
                                <Award className="mr-2 h-4 w-4" />
                                Nilai Massal
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedGroups([])}
                                className="rounded-xl"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
            <div className="rounded-3xl border border-white/20 bg-white/40 py-12 text-center backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <Users2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">
                    {searchQuery ? 'Tidak ada kelompok yang cocok dengan pencarian' : 'Belum ada kelompok'}
                </p>
                {assignment.formation_mode === 'random' && !searchQuery && (
                    <Button
                        onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/random-groups`)}
                        className="mt-4 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                    >
                        <Shuffle className="mr-2 h-4 w-4" />
                        Generate Kelompok Random
                    </Button>
                )}
            </div>
        ) : (
            filteredGroups.map((group, index) => (
                <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex items-start justify-between gap-4">
                        {/* Left: Group Info */}
                        <div className="flex flex-1 items-start gap-3">
                            {/* Checkbox for bulk selection */}
                            <Checkbox
                                checked={selectedGroups.includes(group.id)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedGroups([...selectedGroups, group.id]);
                                    } else {
                                        setSelectedGroups(selectedGroups.filter((id) => id !== group.id));
                                    }
                                }}
                                className="mt-1"
                            />

                            {/* Group Icon */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white font-bold shadow-lg">
                                {group.name.slice(-1)}
                            </div>

                            {/* Group Details */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{group.name}</h4>
                                    {group.has_submission && (
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">
                                    {group.member_count} anggota • {group.task_stats.completed}/{group.task_stats.total} task selesai
                                </p>

                                {/* Members */}
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {group.members.map((member) => (
                                        <span
                                            key={member.id}
                                            className={cn(
                                                'rounded-lg border px-2.5 py-1 text-xs',
                                                member.is_leader
                                                    ? 'border-purple-200 bg-purple-100 font-medium text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300'
                                            )}
                                        >
                                            {member.is_leader && <Star className="mr-1 inline h-3 w-3" />}
                                            {member.nama}
                                            <span className="ml-1 text-[10px] opacity-70">
                                                ({member.contribution_points} pts)
                                            </span>
                                        </span>
                                    ))}
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${group.progress}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {group.progress}%
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {group.file_count} file
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        {group.message_count} pesan
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {group.task_stats.in_progress} in progress
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Status & Actions */}
                        <div className="flex flex-col items-end gap-2">
                            {/* Status Badge */}
                            {group.has_submission ? (
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-1 text-xs font-medium',
                                        group.grade != null
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : group.is_late
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    )}
                                >
                                    {group.grade != null ? `Nilai: ${group.grade}` : group.is_late ? 'Late Submit' : 'Submitted'}
                                </span>
                            ) : (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-neutral-800 dark:text-slate-400">
                                    Belum Submit
                                </span>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => router.visit(`/admin/tugas-kelompok/${assignment.id}/group/${group.id}`)}
                                    className="h-8 w-8 rounded-lg p-0"
                                    title="Lihat Detail"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditGroupDialog({ open: true, group })}
                                    className="h-8 w-8 rounded-lg p-0"
                                    title="Edit Kelompok"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))
        )}
    </motion.div>
)}
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Header & Navigation
- [ ] Remove container from header icon
- [ ] Remove floating animation from icon
- [ ] Consistent back button style with other menus
- [ ] Responsive header for mobile (clean layout)
- [ ] Add export button
- [ ] Add description section (if exists)

### Quick Stats
- [ ] Icon colors match container colors
- [ ] Proper drop shadow for each icon
- [ ] Hover animation (y: -4, scale: 1.02)
- [ ] Responsive grid (2 cols mobile, 3 tablet, 6 desktop)

### Filter & Search
- [ ] Search by group name or member name
- [ ] Quick filter buttons (All, Submitted, Unsubmitted, Late, Ungraded)
- [ ] Sort dropdown (Name, Progress, Grade, Members, Submission)
- [ ] Filter state management

### Groups Tab
- [ ] Unassigned students alert with assign button
- [ ] Bulk selection with checkbox
- [ ] Bulk actions bar (when groups selected)
- [ ] Enhanced group card with all details
- [ ] Progress bar animation
- [ ] Member badges with contribution points
- [ ] Status badges (Submitted, Late, Graded, Not Submitted)
- [ ] Action buttons (View Detail, Edit)

### Analytics Tab
- [ ] Performance comparison chart
- [ ] Contribution distribution
- [ ] Submission pattern analysis
- [ ] Risk assessment
- [ ] Engagement score
- [ ] Time management analysis

### Grading Tab
- [ ] Bulk grading mode
- [ ] Individual grading
- [ ] Grade templates
- [ ] Auto-calculate individual grades
- [ ] Grade distribution chart
- [ ] Grading rubric
- [ ] Export grades

### Monitoring Tab (New)
- [ ] Live activity feed
- [ ] Progress heatmap
- [ ] Active members indicator
- [ ] Task completion timeline
- [ ] Contribution leaderboard

### Conflicts Tab
- [ ] Conflict priority system
- [ ] Conflict timeline
- [ ] Mediation notes
- [ ] Resolution templates
- [ ] Conflict statistics

### Settings Tab (New)
- [ ] Assignment settings
- [ ] Deadline management
- [ ] Feature toggles
- [ ] Notification settings

### Mobile Responsiveness
- [ ] Test on 320px - 768px
- [ ] Proper text wrapping
- [ ] Touch-friendly buttons
- [ ] Horizontal scroll for tabs
- [ ] Collapsible sections

### Design Consistency
- [ ] Match dashboard admin 100%
- [ ] Consistent border radius
- [ ] Consistent spacing
- [ ] Consistent typography
- [ ] Proper backdrop-blur
- [ ] Gradient consistency

---

## 📝 NOTES

- NO data dummy - all real data
- Icon colors MUST match container colors
- NO container on header icon
- NO floating animation on icon
- Clean mobile UI like dashboard admin
- Consistent back button across all menus
- Write in organized, consistent theme (1 tema rapi)
- Significant innovative features for this critical menu
- Complete, well-organized content writing

---

**END OF PROMPT**
