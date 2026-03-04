# PROMPT: DETAIL KEHADIRAN MAHASISWA - ADMIN
## Ultra Advanced Implementation dengan Inovasi Signifikan

---

## 🎯 OBJECTIVE
Membuat halaman Detail Kehadiran Mahasiswa yang sangat lengkap dan profesional untuk admin dengan fitur-fitur inovatif untuk monitoring kehadiran individual, analisis mendalam, tracking progress, dan manajemen kehadiran yang komprehensif.

**File Target**: `resources/js/pages/admin/rekap-kehadiran-detail.tsx` (NEW PAGE)  
**Reference**: Dashboard Admin Design System & `resources/js/pages/admin/rekap-kehadiran.tsx`

**Route**: `/admin/rekap-kehadiran/{mahasiswa_id}`

---

## 📋 CURRENT STATE ANALYSIS

### ✅ Yang Sudah Ada di List Page
- Header dengan icon rekap kehadiran
- Stats cards (Total Scan, Hadir, Terlambat, Ditolak)
- Filter by date range, course, status
- Daily trend chart
- Course summary table
- Top attendees list
- Low attendance warning list
- Hourly distribution chart
- Attendance logs table
- Export PDF functionality

### ❌ Yang Perlu Dibuat (Detail Page)
- Halaman detail kehadiran per mahasiswa
- Profile mahasiswa dengan foto
- Attendance timeline visualization
- Detailed attendance history
- Course-wise attendance breakdown
- Attendance pattern analysis
- Punctuality score & trends
- Comparison with class average
- Attendance prediction
- Warning & appreciation system
- Export individual report
- QR code scan history with location
- Selfie verification history

---

## 🎨 DESIGN SYSTEM (100% Match Dashboard Admin)

### Color Palette
```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-indigo-pink: linear-gradient(to bottom right, #6366f1, #ec4899);

/* Background */
--bg-dark: #0a0a0a;
--bg-card: rgba(255, 255, 255, 0.40);
--bg-card-dark: rgba(23, 23, 23, 0.40);

/* Status Colors */
--present: #10b981 (emerald);
--late: #f59e0b (amber);
--rejected: #ef4444 (red);
--absent: #64748b (slate);
```

### Typography
- Heading 1: `text-2xl sm:text-3xl font-bold`
- Heading 2: `text-xl font-bold`
- Body: `text-sm leading-relaxed`
- Caption: `text-xs text-slate-500`

---

## 🚀 INOVASI FITUR SIGNIFIKAN

### 1. STUDENT PROFILE DASHBOARD


#### Fitur:
- **Student Photo/Avatar**: Foto profil mahasiswa dengan fallback initials
- **Basic Info**: Nama, NIM, Kelas, Email, No. HP
- **Attendance Summary**: Total kehadiran, persentase, rank di kelas
- **Status Badges**: Active, Warning, Excellent, At Risk
- **Quick Actions**: Send Warning, Send Appreciation, Export Report
- **Contact Buttons**: Email, WhatsApp, Phone

#### Implementation:
```typescript
interface StudentProfile {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    email: string;
    phone?: string;
    avatar?: string;
    total_attendance: number;
    attendance_rate: number;
    rank_in_class: number;
    total_students_in_class: number;
    status: 'excellent' | 'good' | 'warning' | 'at_risk';
}
```

### 2. COMPREHENSIVE ATTENDANCE ANALYTICS

#### Fitur:
- **Attendance Rate Gauge**: Circular progress gauge dengan animasi
- **Punctuality Score**: Skor ketepatan waktu (0-100)
- **Consistency Score**: Skor konsistensi kehadiran
- **Trend Analysis**: Trend kehadiran (improving, declining, stable)
- **Comparison with Average**: Perbandingan dengan rata-rata kelas
- **Prediction**: Prediksi kehadiran akhir semester

#### Metrics:
- Total sessions attended
- Present count & percentage
- Late count & percentage
- Rejected count & percentage
- Absent count & percentage
- Average arrival time
- Earliest arrival
- Latest arrival
- Longest streak (consecutive attendance)
- Current streak

### 3. ATTENDANCE TIMELINE VISUALIZATION

#### Fitur:
- **Interactive Timeline**: Timeline kehadiran dengan status warna
- **Calendar Heatmap**: Heatmap kehadiran per hari
- **Weekly Pattern**: Pola kehadiran per hari dalam seminggu
- **Monthly Summary**: Ringkasan per bulan
- **Semester Progress**: Progress kehadiran semester
- **Milestone Markers**: Marker untuk pencapaian khusus

### 4. COURSE-WISE BREAKDOWN

#### Fitur:
- **Per-Course Statistics**: Statistik kehadiran per mata kuliah
- **Course Comparison Chart**: Grafik perbandingan antar mata kuliah
- **Best/Worst Courses**: Mata kuliah dengan kehadiran terbaik/terburuk
- **Dosen Interaction**: Interaksi dengan dosen per mata kuliah
- **Session Details**: Detail sesi per mata kuliah
- **Course Progress**: Progress kehadiran per mata kuliah

### 5. DETAILED ATTENDANCE HISTORY

#### Fitur:
- **Chronological List**: Daftar kehadiran kronologis
- **Filter & Search**: Filter by course, status, date range
- **Scan Details**: Detail scan (waktu, lokasi, device)
- **Selfie Verification**: Riwayat verifikasi selfie
- **Location Map**: Peta lokasi scan
- **Device Info**: Informasi device yang digunakan
- **QR Code Info**: Informasi QR code yang di-scan

### 6. ATTENDANCE PATTERN ANALYSIS

#### Fitur:
- **Time Pattern**: Pola waktu kehadiran (pagi/siang/sore)
- **Day Pattern**: Pola hari (Senin-Jumat)
- **Weather Correlation**: Korelasi dengan cuaca (jika ada data)
- **Distance Analysis**: Analisis jarak dari kampus
- **Punctuality Trend**: Trend ketepatan waktu
- **Risk Factors**: Faktor risiko ketidakhadiran

### 7. WARNING & APPRECIATION SYSTEM

#### Fitur:
- **Auto Warning**: Peringatan otomatis jika kehadiran < threshold
- **Manual Warning**: Kirim peringatan manual dengan custom message
- **Appreciation**: Kirim apresiasi untuk kehadiran excellent
- **Warning History**: Riwayat peringatan yang dikirim
- **Response Tracking**: Tracking respon mahasiswa
- **Escalation**: Eskalasi ke orang tua/wali jika perlu

### 8. PREDICTIVE ANALYTICS

#### Fitur:
- **Attendance Prediction**: Prediksi kehadiran akhir semester
- **Risk Assessment**: Penilaian risiko tidak lulus karena kehadiran
- **Intervention Suggestions**: Saran intervensi
- **Goal Setting**: Set target kehadiran
- **Progress Tracking**: Tracking progress menuju target
- **What-If Scenarios**: Simulasi "bagaimana jika"

---

## 📱 STRUKTUR HALAMAN LENGKAP

### HEADER SECTION (Enhanced - NO Container, NO Floating Animation)

```tsx
{/* Header - NO CONTAINER on Icon, NO Floating Animation */}
<motion.div
    variants={iV}
    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
>
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
    
    {/* Decorative Elements */}
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

    <div className="relative z-10">
        {/* Back Button - Consistent Style */}
        <motion.button
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.visit('/admin/rekap-kehadiran')}
            className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
        >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Rekap Kehadiran
        </motion.button>

        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            {/* Left: Student Profile */}
            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                {/* Icon - NO CONTAINER, NO FLOATING ANIMATION */}
                <motion.div
                    className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <img
                        src={rekapanIcon}
                        alt="Detail Kehadiran"
                        className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                    />
                </motion.div>

                {/* Student Avatar */}
                <motion.div
                    className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
                >
                    {student.avatar ? (
                        <img
                            src={student.avatar}
                            alt={student.nama}
                            className="h-full w-full rounded-full border-4 border-white/30 object-cover shadow-2xl"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white/30 bg-gradient-to-br from-purple-500 to-pink-500 text-3xl font-bold text-white shadow-2xl">
                            {student.nama.charAt(0)}
                        </div>
                    )}
                    {/* Status Indicator */}
                    <div className={cn(
                        'absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white',
                        student.status === 'excellent' && 'bg-emerald-500',
                        student.status === 'good' && 'bg-blue-500',
                        student.status === 'warning' && 'bg-amber-500',
                        student.status === 'at_risk' && 'bg-red-500'
                    )} />
                </motion.div>

                <div className="flex-1">
                    {/* Status Badge */}
                    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <span className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase',
                            student.status === 'excellent' && 'bg-emerald-100 text-emerald-700',
                            student.status === 'good' && 'bg-blue-100 text-blue-700',
                            student.status === 'warning' && 'bg-amber-100 text-amber-700',
                            student.status === 'at_risk' && 'bg-red-100 text-red-700'
                        )}>
                            {student.status === 'excellent' && <Award className="h-3.5 w-3.5" />}
                            {student.status === 'good' && <CheckCircle className="h-3.5 w-3.5" />}
                            {student.status === 'warning' && <AlertTriangle className="h-3.5 w-3.5" />}
                            {student.status === 'at_risk' && <XCircle className="h-3.5 w-3.5" />}
                            {statusLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                            <Trophy className="h-3 w-3" />
                            Rank #{student.rank_in_class} / {student.total_students_in_class}
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold sm:text-3xl">{student.nama}</h1>
                    
                    {/* Student Info */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-purple-100">
                        <span className="flex items-center gap-1">
                            <IdCard className="h-4 w-4" />
                            {student.nim}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {student.kelas}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {student.email}
                        </span>
                    </div>

                    {/* Attendance Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 flex items-center gap-4"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <span className="text-xl font-bold">{student.attendance_rate}%</span>
                            </div>
                            <div>
                                <p className="text-xs text-purple-200">Attendance Rate</p>
                                <p className="text-sm font-semibold">{student.total_attendance} Sessions</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={() => setWarningDialogOpen(true)}
                        className="rounded-xl border border-amber-400/30 bg-amber-500/30 text-white backdrop-blur-md hover:bg-amber-500/40"
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" /> Send Warning
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={() => setAppreciationDialogOpen(true)}
                        className="rounded-xl border border-emerald-400/30 bg-emerald-500/30 text-white backdrop-blur-md hover:bg-emerald-500/40"
                    >
                        <Award className="mr-2 h-4 w-4" /> Send Appreciation
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={() => handleExportReport()}
                        className="rounded-xl border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                    >
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </motion.div>
            </div>
        </div>
    </div>
</motion.div>
```

### QUICK STATS SECTION (Enhanced with Real-time Data)

```tsx
{/* Quick Stats - Icon colors match container colors */}
<motion.div variants={iV} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    {[
        {
            label: 'Total Sessions',
            value: stats.total_sessions,
            icon: totalScanIcon,
            cardClass: 'border-blue-300/40 bg-blue-100/55 dark:border-blue-500/30 dark:bg-blue-900/20',
            valueClass: 'text-blue-700 dark:text-blue-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(59,130,246,0.35)]',
        },
        {
            label: 'Hadir',
            value: stats.present,
            icon: hadirIcon,
            cardClass: 'border-emerald-300/45 bg-emerald-100/55 dark:border-emerald-500/30 dark:bg-emerald-900/20',
            valueClass: 'text-emerald-700 dark:text-emerald-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(16,185,129,0.35)]',
        },
        {
            label: 'Terlambat',
            value: stats.late,
            icon: terlambatIcon,
            cardClass: 'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20',
            valueClass: 'text-amber-700 dark:text-amber-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(245,158,11,0.35)]',
        },
        {
            label: 'Ditolak',
            value: stats.rejected,
            icon: ditolakIcon,
            cardClass: 'border-red-300/45 bg-red-100/55 dark:border-red-500/30 dark:bg-red-900/20',
            valueClass: 'text-red-700 dark:text-red-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(239,68,68,0.35)]',
        },
        {
            label: 'Punctuality Score',
            value: `${punctualityScore}/100`,
            icon: ClockIcon,
            cardClass: 'border-violet-300/45 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20',
            valueClass: 'text-violet-700 dark:text-violet-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(139,92,246,0.35)]',
        },
        {
            label: 'Current Streak',
            value: `${currentStreak} days`,
            icon: TrendingUpIcon,
            cardClass: 'border-cyan-300/45 bg-cyan-100/55 dark:border-cyan-500/30 dark:bg-cyan-900/20',
            valueClass: 'text-cyan-700 dark:text-cyan-200',
            iconFilter: 'drop-shadow-[0_8px_14px_rgba(6,182,212,0.35)]',
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

---

## 🎯 TAB CONTENT DETAILS

### TAB 1: OVERVIEW
- Attendance rate gauge (circular progress)
- Trend chart (last 30 days)
- Quick stats summary
- Recent attendance (last 5)
- Upcoming sessions
- Alerts & notifications

### TAB 2: ATTENDANCE HISTORY
- Chronological list with filters
- Scan details (time, location, device)
- Selfie verification status
- QR code info
- Location map
- Export functionality

### TAB 3: COURSE BREAKDOWN
- Per-course statistics table
- Course comparison chart
- Best/worst performing courses
- Session details per course
- Dosen interaction summary

### TAB 4: ANALYTICS
- Attendance pattern heatmap
- Time pattern analysis
- Day pattern analysis
- Punctuality trend chart
- Comparison with class average
- Prediction & forecast

### TAB 5: TIMELINE
- Interactive timeline visualization
- Calendar heatmap
- Weekly pattern
- Monthly summary
- Milestone markers
- Streak tracking

### TAB 6: ACTIONS
- Warning history
- Appreciation history
- Communication log
- Notes & comments
- Intervention tracking
- Goal setting

---

## ✅ IMPLEMENTATION CHECKLIST

### Header & Navigation
- [ ] Remove container from header icon
- [ ] Remove floating animation from icon
- [ ] Consistent back button style
- [ ] Student avatar with status indicator
- [ ] Status badges (Excellent, Good, Warning, At Risk)
- [ ] Rank display
- [ ] Student info (NIM, Kelas, Email)
- [ ] Action buttons (Warning, Appreciation, Export)

### Quick Stats
- [ ] Icon colors match container colors
- [ ] 6 key metrics
- [ ] Hover animations
- [ ] Responsive grid layout
- [ ] Proper drop shadows

### Tab System
- [ ] 6 tabs (Overview, History, Courses, Analytics, Timeline, Actions)
- [ ] Smooth tab transitions
- [ ] Mobile-friendly horizontal scroll

### Overview Tab
- [ ] Attendance rate gauge
- [ ] Trend chart
- [ ] Quick stats
- [ ] Recent attendance
- [ ] Upcoming sessions
- [ ] Alerts

### History Tab
- [ ] Chronological list
- [ ] Filter & search
- [ ] Scan details
- [ ] Selfie verification
- [ ] Location map
- [ ] Export

### Course Breakdown Tab
- [ ] Statistics table
- [ ] Comparison chart
- [ ] Best/worst courses
- [ ] Session details
- [ ] Dosen summary

### Analytics Tab
- [ ] Pattern heatmap
- [ ] Time analysis
- [ ] Day analysis
- [ ] Punctuality trend
- [ ] Class comparison
- [ ] Predictions

### Timeline Tab
- [ ] Interactive timeline
- [ ] Calendar heatmap
- [ ] Weekly pattern
- [ ] Monthly summary
- [ ] Milestones
- [ ] Streaks

### Actions Tab
- [ ] Warning history
- [ ] Appreciation history
- [ ] Communication log
- [ ] Notes
- [ ] Interventions
- [ ] Goals

### Mobile Responsiveness
- [ ] Test on 320px - 768px
- [ ] Proper text wrapping
- [ ] Touch-friendly buttons
- [ ] Horizontal scroll for tabs
- [ ] Collapsible sections
- [ ] Optimized charts for mobile

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
- Smooth animations with framer-motion
- Interactive charts and visualizations
- Export functionality for reports
- Real-time data updates

---

**END OF PROMPT**
