# 📚 PROMPT: MATA KULIAH MAHASISWA - ULTRA ADVANCED

## 📋 OVERVIEW

Prompt ini untuk membuat halaman **Mata Kuliah Mahasiswa** dengan inovasi ultra advanced dan UI/UX yang 100% matching dengan **Dashboard Admin**. Halaman ini menampilkan daftar mata kuliah dengan fitur-fitur canggih seperti progress tracking, analytics, study planner, dan AI recommendations.

---

## 🎨 DESIGN SYSTEM - HITAM THEME (100% ADMIN MATCHING)

### Color Palette (WAJIB)
```typescript
// CONTAINER COLORS
bg-white/40 dark:bg-neutral-900/40  // Main containers
backdrop-blur-xl                     // Glassmorphism effect

// BORDER COLORS
border-white/20 dark:border-white/5  // Container borders

// GRADIENT HEADER (ADMIN STYLE)
from-indigo-600 via-purple-600 to-pink-500

// TEXT COLORS
text-neutral-900 dark:text-white     // Primary text
text-neutral-500 dark:text-neutral-400  // Secondary text

// ROUNDED & SHADOWS
rounded-3xl  // Main containers
shadow-xl    // Main shadows
```

### Animation Standards (WAJIB)
```typescript
stiffness: 300
damping: 20

// Hover animations
scale: 1.04
y: -4
transition: { type: 'spring', stiffness: 400, damping: 15 }
```

---

## 🚀 INOVASI ULTRA ADVANCED (10 MAJOR FEATURES)

### 1️⃣ INTERACTIVE COURSE CARDS WITH 3D TILT
- 3D tilt effect on hover menggunakan react-tilt
- Flip animation untuk show detail
- Color-coded by progress status
- Quick actions overlay

### 2️⃣ SMART PROGRESS TRACKING
- Circular progress bars dengan animasi
- Progress per kategori (pertemuan, tugas, nilai)
- Milestone achievements
- Completion predictions dengan AI

### 3️⃣ AI STUDY RECOMMENDATIONS
- Personalized study tips berdasarkan performance
- Time management suggestions
- Priority recommendations
- Difficulty predictions

### 4️⃣ STUDY PLANNER & CALENDAR
- Weekly study schedule generator
- Deadline reminders
- Time blocking visualization
- Sync dengan Google Calendar

### 5️⃣ PERFORMANCE ANALYTICS DASHBOARD
- Grade trends per course dengan charts
- Attendance patterns analysis
- Study time tracking
- Comparative analytics dengan teman sekelas

### 6️⃣ COLLABORATIVE STUDY GROUPS
- Find study partners berdasarkan mata kuliah
- Group chat per course
- Share notes & resources
- Schedule group study sessions

### 7️⃣ SMART SEARCH & FILTERS
- Fuzzy search dengan typo tolerance
- Multi-criteria filters (mode, semester, dosen)
- Saved filter presets
- Quick filters dengan shortcuts

### 8️⃣ COURSE MATERIALS HUB
- Centralized resource library
- File organization by topic
- Quick access links
- Download manager dengan progress

### 9️⃣ GAMIFICATION ELEMENTS
- Course completion badges
- Study streaks tracking
- Leaderboards per mata kuliah
- Achievement unlocks

### 🔟 EXPORT & REPORTING
- PDF course summary
- Progress reports
- Study analytics export
- Transcript generator

---

## 📦 IMPLEMENTATION SUMMARY

Karena file implementation sangat panjang (2000+ lines), berikut adalah struktur lengkap yang harus diimplementasikan:

### File Structure
```
resources/js/pages/user/akademik/mata-kuliah.tsx  // Main page
app/Http/Controllers/User/MataKuliahController.php  // Backend
database/migrations/xxxx_add_mata_kuliah_features.php  // Database
```

### Main Components (mata-kuliah.tsx)

**1. HERO HEADER** (Lines 1-150)
- Animated gradient background (from-indigo-600 via-purple-600 to-pink-500)
- Floating particles animation
- PNG icon dengan drop-shadow
- View mode toggle (Grid/List)
- AI Recommendations & Export buttons

**2. QUICK STATS - 6 Cards** (Lines 151-250)
- Total MK, Total SKS, Rata-rata, Progress, Study Hours, On Track
- AnimatedCounter component
- Glassmorphism dengan backdrop-blur-xl
- Hover animations (scale: 1.04, y: -4)

**3. SEARCH & FILTER BAR** (Lines 251-350)
- Fuzzy search input dengan icon
- Filter buttons (All, Online, Offline)
- Sort dropdown (Name, Progress, Grade)
- Saved presets dropdown

**4. COURSE CARDS - Grid/List View** (Lines 351-600)
- 3D tilt effect dengan react-tilt
- Circular progress bars (Recharts RadialBarChart)
- Quick actions overlay (Jadwal, Tugas, Nilai, Catatan)
- Favorite star button
- Next session info
- Color-coded by progress

**5. AI RECOMMENDATIONS PANEL** (Lines 601-750)
- Slide-in panel dari kanan
- Personalized study tips
- Time management suggestions
- Priority recommendations
- Difficulty predictions

**6. ANALYTICS DASHBOARD** (Lines 751-950)
- Grade trends chart (Recharts AreaChart)
- Attendance patterns (Recharts PieChart)
- Study time tracking (Recharts BarChart)
- Comparative analytics

**7. STUDY PLANNER** (Lines 951-1100)
- Weekly calendar view (react-big-calendar)
- Drag & drop time blocks
- Deadline reminders
- Google Calendar sync button

**8. STUDY GROUPS** (Lines 1101-1250)
- Find partners by course
- Group chat preview
- Share resources button
- Schedule group sessions

**9. MATERIALS HUB** (Lines 1251-1400)
- File list by course
- Download manager
- Quick access links
- Upload new materials

**10. GAMIFICATION** (Lines 1401-1550)
- Achievement badges grid
- Study streaks counter
- Leaderboard table
- Progress milestones

### Backend Controller (MataKuliahController.php)

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MataKuliahController extends Controller
{
    public function index(Request $request)
    {
        $mahasiswa = auth()->user();
        
        // Get courses with progress
        $courses = $mahasiswa->courses()->with(['dosen', 'sessions', 'assignments'])
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name' => $course->nama,
                    'sks' => $course->sks,
                    'semester' => $course->semester,
                    'dosen' => $course->dosen->nama,
                    'dosen_avatar' => $course->dosen->avatar,
                    'mode' => $course->mode,
                    'ruangan' => $course->ruangan,
                    'schedule' => $course->schedule,
                    'progress' => [
                        'meetings_completed' => $course->completedMeetings(),
                        'total_meetings' => $course->total_meetings,
                        'assignments_completed' => $course->completedAssignments(),
                        'total_assignments' => $course->assignments->count(),
                        'attendance_rate' => $course->attendanceRate(),
                        'average_grade' => $course->averageGrade(),
                    ],
                    'next_session' => $course->nextSession(),
                    'color' => $course->color,
                    'is_favorite' => $course->isFavorite(),
                    'study_time_hours' => $course->studyTimeHours(),
                    'difficulty_level' => $course->difficultyLevel(),
                    'ai_recommendation' => $course->aiRecommendation(),
                ];
            });

        // Calculate stats
        $stats = [
            'total_courses' => $courses->count(),
            'total_sks' => $courses->sum('sks'),
            'average_grade' => $courses->avg('progress.average_grade'),
            'completion_rate' => $courses->avg(function ($c) {
                return ($c['progress']['meetings_completed'] / $c['progress']['total_meetings']) * 100;
            }),
            'study_hours_week' => $courses->sum('study_time_hours'),
            'on_track_courses' => $courses->filter(function ($c) {
                return $c['progress']['attendance_rate'] >= 75;
            })->count(),
        ];

        return Inertia::render('user/akademik/mata-kuliah', [
            'courses' => $courses,
            'stats' => $stats,
            'study_groups' => $this->getStudyGroups($mahasiswa),
            'upcoming_deadlines' => $this->getUpcomingDeadlines($mahasiswa),
            'performance_data' => $this->getPerformanceData($mahasiswa),
        ]);
    }

    public function toggleFavorite(Request $request, $id)
    {
        $mahasiswa = auth()->user();
        $course = $mahasiswa->courses()->findOrFail($id);
        
        $course->pivot->update([
            'is_favorite' => !$course->pivot->is_favorite
        ]);

        return back()->with('success', 'Favorite updated');
    }

    private function getStudyGroups($mahasiswa)
    {
        // Implementation for study groups
        return [];
    }

    private function getUpcomingDeadlines($mahasiswa)
    {
        // Implementation for deadlines
        return [];
    }

    private function getPerformanceData($mahasiswa)
    {
        // Implementation for performance analytics
        return [];
    }
}
```

### Database Migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('course_mahasiswa', function (Blueprint $table) {
            $table->boolean('is_favorite')->default(false);
            $table->integer('study_time_hours')->default(0);
            $table->string('difficulty_level')->default('medium');
            $table->text('ai_recommendation')->nullable();
        });

        Schema::create('study_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('study_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('mahasiswa_id')->constrained()->onDelete('cascade');
            $table->boolean('is_admin')->default(false);
            $table->timestamps();
        });

        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('file_path');
            $table->string('file_type');
            $table->integer('file_size');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('course_materials');
        Schema::dropIfExists('study_group_members');
        Schema::dropIfExists('study_groups');
        
        Schema::table('course_mahasiswa', function (Blueprint $table) {
            $table->dropColumn(['is_favorite', 'study_time_hours', 'difficulty_level', 'ai_recommendation']);
        });
    }
};
```

export default function MataKuliahMahasiswa({ courses, stats, study_groups, upcoming_deadlines, performance_data }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'progress' | 'grade'>('name');
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.04, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 }
        }
    };

    // Filter & Sort courses
    const filteredCourses = useMemo(() => {
        let filtered = courses.filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                course.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMode = filterMode === 'all' || course.mode === filterMode;
            return matchesSearch && matchesMode;
        });

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'progress') {
                const progressA = (a.progress.meetings_completed / a.progress.total_meetings) * 100;
                const progressB = (b.progress.meetings_completed / b.progress.total_meetings) * 100;
                return progressB - progressA;
            }
            if (sortBy === 'grade') {
                return (b.progress.average_grade || 0) - (a.progress.average_grade || 0);
            }
            return 0;
        });

        return filtered;
    }, [courses, searchQuery, filterMode, sortBy]);


---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Core Features (16 hours)
- [ ] Setup page structure dengan StudentLayout
- [ ] Implement Hero Header dengan animated gradient
- [ ] Create 6 Quick Stats cards dengan AnimatedCounter
- [ ] Build Search & Filter bar
- [ ] Implement Course Cards (Grid & List view)
- [ ] Add 3D tilt effect dengan react-tilt
- [ ] Create circular progress bars
- [ ] Add favorite toggle functionality

### Phase 2: Advanced Features (20 hours)
- [ ] Build AI Recommendations panel
- [ ] Implement Analytics Dashboard dengan Recharts
- [ ] Create Study Planner dengan react-big-calendar
- [ ] Build Study Groups section
- [ ] Implement Materials Hub
- [ ] Add Gamification elements
- [ ] Create Export functionality
- [ ] Add Google Calendar sync

### Phase 3: Backend & Database (12 hours)
- [ ] Create MataKuliahController
- [ ] Implement all controller methods
- [ ] Create database migrations
- [ ] Add Model relationships
- [ ] Implement AI recommendation logic
- [ ] Create API endpoints
- [ ] Add validation & error handling
- [ ] Write unit tests

### Phase 4: Polish & Optimization (8 hours)
- [ ] Optimize animations performance
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Add responsive design
- [ ] Test on mobile devices
- [ ] Add accessibility features
- [ ] Optimize bundle size
- [ ] Final QA testing

**Total Estimated Time: 56 hours**

---

## 🎯 SUCCESS METRICS

### Performance Metrics
- Page load time < 2 seconds
- Smooth 60fps animations
- Bundle size < 500KB
- Lighthouse score > 90

### User Experience Metrics
- Course card interaction rate > 80%
- AI recommendations usage > 60%
- Study planner adoption > 50%
- Average session time > 5 minutes

### Feature Adoption
- 3D tilt engagement > 70%
- Analytics dashboard views > 60%
- Study groups creation > 40%
- Materials hub usage > 50%

---

## 🔧 DEPENDENCIES

### NPM Packages
```bash
npm install framer-motion recharts react-big-calendar react-tilt @dnd-kit/core @dnd-kit/sortable lucide-react
```

### Assets Required
- mataKuliahIcon.png
- totalIcon.png
- progressIcon.png
- gradeIcon.png

---

## 🚨 IMPORTANT NOTES

1. **100% Admin Matching**: Semua warna, animasi, container, border HARUS sama persis dengan admin dashboard
2. **Animations**: WAJIB menggunakan stiffness: 300, damping: 20
3. **Glassmorphism**: Semua container menggunakan bg-white/40 dark:bg-neutral-900/40 dengan backdrop-blur-xl
4. **PNG Icons**: Gunakan PNG icons dengan drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]
5. **Responsive**: Harus responsive di semua device sizes
6. **Performance**: Optimize untuk smooth 60fps animations
7. **Accessibility**: Add proper ARIA labels dan keyboard navigation
8. **Error Handling**: Implement proper error boundaries dan loading states

---

## 📚 REFERENCE FILES

- `resources/js/pages/admin/rekap-kehadiran.tsx` - Admin dashboard style reference
- `resources/js/pages/user/akademik/jadwal.tsx` - Jadwal page reference
- `PROMPT_DASHBOARD_AKADEMIK_MAHASISWA_ULTRA_ADVANCED.md` - Dashboard reference
- `PROMPT_INFORMASI_TUGAS_MAHASISWA_ULTRA_ADVANCED.md` - Tugas page reference

---

## ✅ COMPLETION CRITERIA

Halaman dianggap selesai jika:
1. ✅ Semua 10 inovasi sudah diimplementasikan
2. ✅ UI/UX 100% matching dengan admin dashboard
3. ✅ Semua animations smooth dan consistent
4. ✅ Backend controller dan database sudah lengkap
5. ✅ Responsive di semua device sizes
6. ✅ Performance metrics tercapai
7. ✅ All tests passing
8. ✅ Documentation lengkap

---

**END OF PROMPT**

    // Toggle favorite
    const toggleFavorite = (courseId: number) => {
        router.post(`/user/akademik/mata-kuliah/${courseId}/favorite`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <StudentLayout>
            <Head title="Mata Kuliah" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ═══════════════════════════════════════════════════ */}
                {/* HERO HEADER - Ultra Polished                        */}
                {/* ═══════════════════════════════════════════════════ */}
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
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

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
                                <BookOpen className="h-3 w-3 text-white/40" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                            {/* Left: Title */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30"
                                    >
                                        <img src={mataKuliahIcon} alt="Mata Kuliah" className="h-10 w-10 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
                                    </motion.div>

                                    <div>
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-sm text-white/90 font-medium"
                                        >
                                            Semester {courses[0]?.semester || 1}
                                        </motion.p>
                                        <motion.h1
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-3xl font-bold"
                                        >
                                            Mata Kuliah
                                        </motion.h1>
                                    </div>
                                </div>
                                
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-white/90 text-lg"
                                >
                                    Kelola dan pantau progress semua mata kuliah Anda
                                </motion.p>
                            </div>

                            {/* Right: Quick Actions */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="flex gap-3"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowAIPanel(!showAIPanel)}
                                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-600 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Brain className="h-5 w-5" />
                                    AI Recommendations
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all"
                                >
                                    <Download className="h-5 w-5" />
                                    Export
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* View Mode Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="mt-6 flex gap-2"
                        >
                            {[
                                { id: 'grid', label: 'Grid', icon: Grid3x3 },
                                { id: 'list', label: 'List', icon: List },
                            ].map((view) => (
                                <motion.button
                                    key={view.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode(view.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                                        viewMode === view.id
                                            ? 'bg-white text-indigo-600'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    <view.icon className="h-4 w-4" />
                                    {view.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* QUICK STATS - 6 Cards                               */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                >
                    {[
                        { 
                            iconSrc: totalIcon, 
                            label: 'Total MK', 
                            value: stats.total_courses, 
                            gradient: 'from-blue-400 to-indigo-600',
                            glow: 'bg-blue-500'
                        },
                        { 
                            iconSrc: progressIcon, 
                            label: 'Total SKS', 
                            value: stats.total_sks, 
                            gradient: 'from-emerald-400 to-teal-600',
                            glow: 'bg-emerald-500'
                        },
                        { 
                            iconSrc: gradeIcon, 
                            label: 'Rata-rata', 
                            value: stats.average_grade.toFixed(1), 
                            gradient: 'from-amber-400 to-orange-600',
                            glow: 'bg-amber-500'
                        },
                        { 
                            iconSrc: mataKuliahIcon, 
                            label: 'Progress', 
                            value: stats.completion_rate, 
                            suffix: '%',
                            gradient: 'from-purple-400 to-violet-600',
                            glow: 'bg-purple-500'
                        },
                        { 
                            iconSrc: progressIcon, 
                            label: 'Study Hours', 
                            value: stats.study_hours_week, 
                            suffix: 'h',
                            gradient: 'from-pink-400 to-rose-600',
                            glow: 'bg-pink-500'
                        },
                        { 
                            iconSrc: totalIcon, 
                            label: 'On Track', 
                            value: stats.on_track_courses, 
                            gradient: 'from-cyan-400 to-blue-600',
                            glow: 'bg-cyan-500'
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ scale: 1.04, y: -4 }}
                            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-500/10`} />
                            <motion.div
                                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.glow} blur-3xl transition-all duration-500 opacity-20 group-hover:opacity-40 group-hover:scale-150`}
                            />
                            
                            <div className="relative flex flex-col items-center text-center gap-2">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    className="relative flex h-12 w-12 items-center justify-center"
                                >
                                    <img src={stat.iconSrc} alt={stat.label} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} duration={1500} suffix={stat.suffix} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* SEARCH & FILTER BAR                                 */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari mata kuliah... (kode atau nama)"
                                className="w-full h-12 pl-12 pr-4 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl dark:border-white/5 focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2">
                            {['all', 'online', 'offline'].map((mode) => (
                                <motion.button
                                    key={mode}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFilterMode(mode as any)}
                                    className={`px-4 h-12 rounded-xl font-bold transition-all ${
                                        filterMode === mode
                                            ? 'bg-indigo-500 text-white'
                                            : 'border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl hover:bg-white/80'
                                    }`}
                                >
                                    {mode === 'all' ? 'Semua' : mode === 'online' ? 'Online' : 'Offline'}
                                </motion.button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 h-12 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl dark:border-white/5 font-bold"
                        >
                            <option value="name">Nama A-Z</option>
                            <option value="progress">Progress</option>
                            <option value="grade">Nilai</option>
                        </select>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* COURSE CARDS - Grid/List View with 3D Flip          */}
                {/* ═══════════════════════════════════════════════════ */}
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {filteredCourses.map((course, index) => (
                                <CourseCard3D key={course.id} course={course} index={index} onToggleFavorite={toggleFavorite} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {filteredCourses.map((course, index) => (
                                <CourseCardList key={course.id} course={course} index={index} onToggleFavorite={toggleFavorite} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════════════════════════════════════════════════ */}
                {/* AI RECOMMENDATIONS PANEL (Conditional)              */}
                {/* ═══════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {showAIPanel && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                                        <Brain className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">AI Study Recommendations</h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Personalized tips untuk meningkatkan performa</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowAIPanel(false)}
                                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.slice(0, 4).map((course, i) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-4 rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">{course.name}</h4>
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">{course.ai_recommendation}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </StudentLayout>
    );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// Course Card 3D with Flip Animation
const CourseCard3D = ({ course, index, onToggleFavorite }: { course: Course; index: number; onToggleFavorite: (id: number) => void }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    
    const progressPercentage = (course.progress.meetings_completed / course.progress.total_meetings) * 100;
    const assignmentProgress = (course.progress.assignments_completed / course.progress.total_assignments) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative h-[320px] perspective-1000"
            onHoverStart={() => setIsFlipped(true)}
            onHoverEnd={() => setIsFlipped(false)}
        >
            <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
                className="relative w-full h-full preserve-3d"
            >
                {/* FRONT SIDE */}
                <div className="absolute inset-0 backface-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    {course.code}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                    course.mode === 'online' 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                }`}>
                                    {course.mode === 'online' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white line-clamp-2 mb-1">
                                {course.name}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{course.sks} SKS</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onToggleFavorite(course.id)}
                            className="p-2"
                        >
                            <Star className={`h-5 w-5 ${course.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'}`} />
                        </motion.button>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3 mb-4">
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-neutral-600 dark:text-neutral-400">Pertemuan</span>
                                <span className="font-bold text-neutral-900 dark:text-white">
                                    {course.progress.meetings_completed}/{course.progress.total_meetings}
                                </span>
                            </div>
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-neutral-600 dark:text-neutral-400">Tugas</span>
                                <span className="font-bold text-neutral-900 dark:text-white">
                                    {course.progress.assignments_completed}/{course.progress.total_assignments}
                                </span>
                            </div>
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${assignmentProgress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Kehadiran</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{course.progress.attendance_rate}%</p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Nilai</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                {course.progress.average_grade?.toFixed(1) || '-'}
                            </p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Study</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{course.study_time_hours}h</p>
                        </div>
                    </div>

                    {/* Next Session */}
                    {course.next_session && (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">Next Session</p>
                            <p className="text-sm font-bold text-neutral-900 dark:text-white">{course.next_session.topic}</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">{course.next_session.date} • {course.next_session.time}</p>
                        </div>
                    )}
                </div>

                {/* BACK SIDE */}
                <div className="absolute inset-0 backface-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 shadow-xl backdrop-blur-xl text-white" style={{ transform: 'rotateY(180deg)' }}>
                    <h3 className="font-bold text-xl mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        {[
                            { icon: Calendar, label: 'Lihat Jadwal', action: () => router.visit(`/user/akademik/jadwal?course=${course.id}`) },
                            { icon: FileText, label: 'Tugas & Materi', action: () => router.visit(`/user/tugas?course=${course.id}`) },
                            { icon: Award, label: 'Nilai & Progress', action: () => router.visit(`/user/akademik/nilai?course=${course.id}`) },
                            { icon: Users, label: 'Study Group', action: () => router.visit(`/user/akademik/study-groups?course=${course.id}`) },
                        ].map((action, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05, x: 4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={action.action}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 transition-all"
                            >
                                <action.icon className="h-5 w-5" />
                                <span className="font-bold">{action.label}</span>
                                <ArrowRight className="h-4 w-4 ml-auto" />
                            </motion.button>
                        ))}
                    </div>

                    {/* Dosen Info */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs text-white/80 mb-2">Dosen Pengampu</p>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                {course.dosen.charAt(0)}
                            </div>
                            <p className="font-bold text-sm">{course.dosen}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};


// Course Card List View
const CourseCardList = ({ course, index, onToggleFavorite }: { course: Course; index: number; onToggleFavorite: (id: number) => void }) => {
    const progressPercentage = (course.progress.meetings_completed / course.progress.total_meetings) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.01, x: 4 }}
            className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 cursor-pointer"
            onClick={() => router.visit(`/user/akademik/mata-kuliah/${course.id}`)}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${
                    course.mode === 'online' ? 'from-emerald-500 to-teal-600' : 'from-blue-500 to-indigo-600'
                } text-white shadow-lg flex-shrink-0`}>
                    <BookOpen className="h-8 w-8" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    {course.code}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                    course.mode === 'online' 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                }`}>
                                    {course.mode}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white truncate">{course.name}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{course.dosen} • {course.sks} SKS</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(course.id);
                            }}
                            className="p-2"
                        >
                            <Star className={`h-5 w-5 ${course.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'}`} />
                        </motion.button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 dark:text-neutral-400">Progress Pertemuan</span>
                            <span className="font-bold text-neutral-900 dark:text-white">
                                {course.progress.meetings_completed}/{course.progress.total_meetings} ({progressPercentage.toFixed(0)}%)
                            </span>
                        </div>
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">Kehadiran:</span>
                            <span className="font-bold text-neutral-900 dark:text-white">{course.progress.attendance_rate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-amber-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">Nilai:</span>
                            <span className="font-bold text-neutral-900 dark:text-white">
                                {course.progress.average_grade?.toFixed(1) || '-'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">Study:</span>
                            <span className="font-bold text-neutral-900 dark:text-white">{course.study_time_hours}h</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                    {[
                        { icon: Calendar, color: 'text-blue-500', action: () => router.visit(`/user/akademik/jadwal?course=${course.id}`) },
                        { icon: FileText, color: 'text-emerald-500', action: () => router.visit(`/user/tugas?course=${course.id}`) },
                        { icon: Award, color: 'text-amber-500', action: () => router.visit(`/user/akademik/nilai?course=${course.id}`) },
                    ].map((action, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.action();
                            }}
                            className="p-2 rounded-lg bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl hover:bg-white/80 transition-all"
                        >
                            <action.icon className={`h-5 w-5 ${action.color}`} />
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
```

---

## 🔧 BACKEND IMPLEMENTATION

### PHP Controller

```php
// File: app/Http/Controllers/User/MataKuliahController.php

<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Attendance;
use App\Models\Assignment;
use App\Models\Grade;

class MataKuliahController extends Controller
{
    public function index(Request $request)
    {
        $mahasiswa = auth()->user();
        
        // Get enrolled courses with progress
        $courses = Course::whereHas('enrollments', function($q) use ($mahasiswa) {
            $q->where('mahasiswa_id', $mahasiswa->id);
        })
        ->with(['dosen', 'schedules', 'assignments', 'grades'])
        ->get()
        ->map(function($course) use ($mahasiswa) {
            $enrollment = $course->enrollments->where('mahasiswa_id', $mahasiswa->id)->first();
            
            // Calculate progress
            $totalMeetings = $course->schedules->count();
            $completedMeetings = Attendance::where('mahasiswa_id', $mahasiswa->id)
                ->whereIn('schedule_id', $course->schedules->pluck('id'))
                ->where('status', 'hadir')
                ->count();
            
            $totalAssignments = $course->assignments->count();
            $completedAssignments = $course->assignments->filter(function($assignment) use ($mahasiswa) {
                return $assignment->submissions->where('mahasiswa_id', $mahasiswa->id)->where('status', 'done')->count() > 0;
            })->count();
            
            $attendanceRate = $totalMeetings > 0 ? ($completedMeetings / $totalMeetings) * 100 : 0;
            
            $averageGrade = Grade::where('mahasiswa_id', $mahasiswa->id)
                ->where('course_id', $course->id)
                ->avg('nilai');
            
            // Next session
            $nextSession = $course->schedules()
                ->where('tanggal', '>=', now())
                ->orderBy('tanggal')
                ->first();
            
            // AI Recommendation (simple logic, can be enhanced with ML)
            $recommendation = $this->generateAIRecommendation($attendanceRate, $averageGrade, $completedAssignments, $totalAssignments);
            
            return [
                'id' => $course->id,
                'code' => $course->kode,
                'name' => $course->nama,
                'sks' => $course->sks,
                'semester' => $course->semester,
                'dosen' => $course->dosen->nama,
                'dosen_avatar' => $course->dosen->avatar,
                'mode' => $course->mode,
                'ruangan' => $course->ruangan,
                'schedule' => $course->schedules->map(fn($s) => [
                    'day' => $s->hari,
                    'time_start' => $s->waktu_mulai,
                    'time_end' => $s->waktu_selesai,
                ]),
                'progress' => [
                    'meetings_completed' => $completedMeetings,
                    'total_meetings' => $totalMeetings,
                    'assignments_completed' => $completedAssignments,
                    'total_assignments' => $totalAssignments,
                    'attendance_rate' => round($attendanceRate, 1),
                    'average_grade' => $averageGrade ? round($averageGrade, 2) : null,
                ],
                'next_session' => $nextSession ? [
                    'meeting_number' => $nextSession->pertemuan_ke,
                    'date' => $nextSession->tanggal->format('d M Y'),
                    'time' => $nextSession->waktu_mulai . ' - ' . $nextSession->waktu_selesai,
                    'topic' => $nextSession->topik,
                ] : null,
                'color' => $course->color ?? '#6366f1',
                'is_favorite' => $enrollment->is_favorite ?? false,
                'study_time_hours' => $enrollment->study_time_hours ?? 0,
                'difficulty_level' => $this->calculateDifficulty($averageGrade, $attendanceRate),
                'ai_recommendation' => $recommendation,
            ];
        });
        
        // Calculate stats
        $stats = [
            'total_courses' => $courses->count(),
            'total_sks' => $courses->sum('sks'),
            'average_grade' => $courses->avg('progress.average_grade') ?? 0,
            'completion_rate' => $courses->avg(function($c) {
                return ($c['progress']['meetings_completed'] / max($c['progress']['total_meetings'], 1)) * 100;
            }),
            'study_hours_week' => $courses->sum('study_time_hours'),
            'on_track_courses' => $courses->filter(function($c) {
                return $c['progress']['attendance_rate'] >= 75 && ($c['progress']['average_grade'] ?? 0) >= 70;
            })->count(),
        ];
        
        return Inertia::render('User/Akademik/MataKuliah', [
            'courses' => $courses,
            'stats' => $stats,
            'study_groups' => [],
            'upcoming_deadlines' => [],
            'performance_data' => [],
        ]);
    }
    
    public function toggleFavorite(Request $request, $courseId)
    {
        $enrollment = Enrollment::where('mahasiswa_id', auth()->id())
            ->where('course_id', $courseId)
            ->first();
        
        if ($enrollment) {
            $enrollment->update(['is_favorite' => !$enrollment->is_favorite]);
        }
        
        return back()->with('success', 'Favorite status updated');
    }
    
    private function generateAIRecommendation($attendanceRate, $averageGrade, $completedAssignments, $totalAssignments)
    {
        if ($attendanceRate < 75) {
            return "Tingkatkan kehadiran Anda! Kehadiran minimal 75% diperlukan untuk mengikuti ujian.";
        }
        
        if ($averageGrade && $averageGrade < 70) {
            return "Fokus pada pemahaman materi. Pertimbangkan untuk join study group atau konsultasi dengan dosen.";
        }
        
        $assignmentRate = $totalAssignments > 0 ? ($completedAssignments / $totalAssignments) * 100 : 100;
        if ($assignmentRate < 80) {
            return "Selesaikan tugas-tugas yang tertunda. Tugas berkontribusi signifikan pada nilai akhir.";
        }
        
        return "Pertahankan performa yang baik! Anda on track untuk mendapatkan nilai yang memuaskan.";
    }
    
    private function calculateDifficulty($averageGrade, $attendanceRate)
    {
        if (!$averageGrade) return 'medium';
        
        if ($averageGrade >= 80 && $attendanceRate >= 85) return 'easy';
        if ($averageGrade < 65 || $attendanceRate < 70) return 'hard';
        return 'medium';
    }
}
```


### Database Migrations

```php
// File: database/migrations/2024_xx_xx_add_mata_kuliah_features.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add columns to enrollments table
        Schema::table('enrollments', function (Blueprint $table) {
            $table->boolean('is_favorite')->default(false);
            $table->integer('study_time_hours')->default(0);
            $table->string('difficulty_level')->default('medium');
            $table->text('ai_recommendation')->nullable();
        });
        
        // Add columns to courses table
        Schema::table('courses', function (Blueprint $table) {
            $table->string('color')->default('#6366f1');
            $table->enum('mode', ['online', 'offline'])->default('offline');
            $table->string('ruangan')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn(['is_favorite', 'study_time_hours', 'difficulty_level', 'ai_recommendation']);
        });
        
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['color', 'mode', 'ruangan']);
        });
    }
};
```

### Routes

```php
// File: routes/web.php

// Mata Kuliah Routes
Route::middleware(['auth', 'role:mahasiswa'])->prefix('user/akademik')->group(function () {
    Route::get('/mata-kuliah', [MataKuliahController::class, 'index'])->name('user.akademik.mata-kuliah');
    Route::get('/mata-kuliah/{id}', [MataKuliahController::class, 'show'])->name('user.akademik.mata-kuliah.show');
    Route::post('/mata-kuliah/{id}/favorite', [MataKuliahController::class, 'toggleFavorite'])->name('user.akademik.mata-kuliah.favorite');
});
```

---

## 📦 NPM PACKAGES REQUIRED

```bash
npm install framer-motion lucide-react recharts
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Setup & Basic Structure (2 hours)
- [ ] Create `resources/js/pages/user/akademik/mata-kuliah.tsx`
- [ ] Setup TypeScript interfaces (Course, Stats, Props)
- [ ] Create StudentLayout wrapper
- [ ] Add basic routing
- [ ] Import required icons and assets

### Phase 2: Hero Header (2 hours)
- [ ] Implement animated gradient background
- [ ] Add floating particles animation
- [ ] Create welcome message section
- [ ] Add quick action buttons (AI Recommendations, Export)
- [ ] Implement view mode toggle (Grid/List)
- [ ] Test all animations (stiffness: 300, damping: 20)

### Phase 3: Quick Stats Cards (2 hours)
- [ ] Create 6 stat cards (Total MK, Total SKS, Rata-rata, Progress, Study Hours, On Track)
- [ ] Implement AnimatedCounter component
- [ ] Add PNG icons with drop-shadow
- [ ] Add glow effects on hover
- [ ] Test glassmorphism (bg-white/40 dark:bg-neutral-900/40)
- [ ] Verify border colors (border-white/20 dark:border-white/5)

### Phase 4: Search & Filter Bar (2 hours)
- [ ] Create search input with fuzzy matching
- [ ] Implement filter buttons (All, Online, Offline)
- [ ] Add sort dropdown (Name, Progress, Grade)
- [ ] Test real-time filtering
- [ ] Add search result counter

### Phase 5: Course Cards - Grid View (4 hours)
- [ ] Create CourseCard3D component
- [ ] Implement 3D flip animation on hover
- [ ] Design front side (header, progress bars, stats, next session)
- [ ] Design back side (quick actions, dosen info)
- [ ] Add favorite toggle functionality
- [ ] Test perspective and backface-hidden CSS
- [ ] Verify all colors match admin dashboard

### Phase 6: Course Cards - List View (2 hours)
- [ ] Create CourseCardList component
- [ ] Design horizontal layout
- [ ] Add progress bar
- [ ] Add quick action buttons
- [ ] Implement click to detail page
- [ ] Test hover animations

### Phase 7: AI Recommendations Panel (3 hours)
- [ ] Create AI panel component
- [ ] Design recommendation cards
- [ ] Implement show/hide animation
- [ ] Add personalized tips per course
- [ ] Test conditional rendering
- [ ] Add close button

### Phase 8: Backend Implementation (4 hours)
- [ ] Create MataKuliahController
- [ ] Implement index() method with progress calculation
- [ ] Implement toggleFavorite() method
- [ ] Add AI recommendation logic
- [ ] Calculate difficulty level
- [ ] Test all database queries
- [ ] Optimize with eager loading

### Phase 9: Database Migrations (1 hour)
- [ ] Create migration for enrollments table
- [ ] Add is_favorite, study_time_hours columns
- [ ] Create migration for courses table
- [ ] Add color, mode, ruangan columns
- [ ] Run migrations
- [ ] Test rollback

### Phase 10: Routes & Integration (1 hour)
- [ ] Add routes to web.php
- [ ] Test navigation from sidebar
- [ ] Test favorite toggle
- [ ] Test search and filters
- [ ] Test view mode switching

### Phase 11: Responsive Design (2 hours)
- [ ] Test on mobile (320px - 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1024px+)
- [ ] Adjust grid columns for different screens
- [ ] Test touch interactions on mobile

### Phase 12: Performance Optimization (2 hours)
- [ ] Implement useMemo for filtered courses
- [ ] Optimize animations (reduce re-renders)
- [ ] Lazy load images
- [ ] Test with large dataset (50+ courses)
- [ ] Add loading states

### Phase 13: Testing & QA (3 hours)
- [ ] Test all animations smooth (60fps)
- [ ] Test favorite toggle persists
- [ ] Test search with special characters
- [ ] Test filters combination
- [ ] Test sort functionality
- [ ] Test 3D flip on different browsers
- [ ] Test dark mode
- [ ] Test accessibility (keyboard navigation)

### Phase 14: Documentation (1 hour)
- [ ] Add code comments
- [ ] Document component props
- [ ] Create usage examples
- [ ] Document backend API endpoints

---

## 🎯 SUCCESS METRICS

### Performance
- [ ] Page load time < 2 seconds
- [ ] Animations run at 60fps
- [ ] Search results appear instantly (<100ms)
- [ ] 3D flip animation smooth on all devices

### UI/UX
- [ ] 100% matching admin dashboard colors
- [ ] All animations use stiffness: 300, damping: 20
- [ ] Glassmorphism effect visible on all containers
- [ ] PNG icons have proper drop-shadow
- [ ] Responsive on all screen sizes

### Functionality
- [ ] Favorite toggle works correctly
- [ ] Search finds courses by name and code
- [ ] Filters work independently and combined
- [ ] Sort changes order correctly
- [ ] Progress bars show accurate data
- [ ] AI recommendations are relevant

### Code Quality
- [ ] TypeScript types are complete
- [ ] No console errors
- [ ] No accessibility warnings
- [ ] Code is well-commented
- [ ] Backend queries are optimized

---

## ⏱️ ESTIMATED TIME

- **Total Implementation**: 31 hours
- **Priority**: HIGH
- **Complexity**: MEDIUM-HIGH

---

## 🚀 ADDITIONAL INNOVATIONS (OPTIONAL - FUTURE ENHANCEMENTS)

### 1️⃣ Study Planner & Calendar Integration
- Weekly study schedule generator
- Google Calendar sync
- Deadline reminders
- Time blocking suggestions

### 2️⃣ Performance Analytics Dashboard
- Grade trends over time (line charts)
- Attendance patterns (heatmap)
- Comparative analytics (vs class average)
- Predictive grade calculator

### 3️⃣ Collaborative Study Groups
- Find study partners by course
- Group chat integration
- Share notes and resources
- Schedule group study sessions

### 4️⃣ Course Materials Hub
- Centralized resource library per course
- File organization by topic/week
- Quick access links to external resources
- Download manager with progress tracking

### 5️⃣ Gamification Elements
- Course completion badges
- Study streak tracking
- Leaderboards per mata kuliah
- Achievement unlocks (Bronze, Silver, Gold)
- XP points for completing tasks

### 6️⃣ Smart Notifications
- Upcoming class reminders (30 min before)
- Assignment deadline alerts
- Grade posted notifications
- Study group invitations

### 7️⃣ Export & Reporting
- PDF course summary
- Progress reports (weekly/monthly)
- Study analytics export (CSV/Excel)
- Transcript generator

### 8️⃣ Voice Commands
- "Show my courses"
- "What's my next class?"
- "How's my progress in [course name]?"

---

## 📝 NOTES

1. **3D Flip Animation**: Requires CSS `perspective`, `preserve-3d`, and `backface-hidden`. Test on Safari for compatibility.

2. **AI Recommendations**: Current implementation uses simple rule-based logic. Can be enhanced with:
   - Machine Learning models
   - Historical data analysis
   - Personalized learning patterns
   - Integration with OpenAI/Claude API

3. **Performance**: With 50+ courses, consider:
   - Virtual scrolling for list view
   - Pagination or infinite scroll
   - Image lazy loading
   - Debounced search

4. **Accessibility**:
   - Add ARIA labels to interactive elements
   - Ensure keyboard navigation works
   - Test with screen readers
   - Maintain color contrast ratios

5. **Dark Mode**: All colors have dark mode variants. Test thoroughly in both modes.

6. **Mobile**: 3D flip animation may not work well on touch devices. Consider alternative interaction (tap to flip).

---

## 🎨 DESIGN TOKENS

```typescript
// Animation
const ANIMATION_CONFIG = {
  stiffness: 300,
  damping: 20,
  duration: 0.6,
};

// Colors
const COLORS = {
  gradient: 'from-indigo-600 via-purple-600 to-pink-500',
  container: 'bg-white/40 dark:bg-neutral-900/40',
  border: 'border-white/20 dark:border-white/5',
  text: {
    primary: 'text-neutral-900 dark:text-white',
    secondary: 'text-neutral-500 dark:text-neutral-400',
  },
};

// Spacing
const SPACING = {
  container: 'p-6',
  card: 'p-5',
  gap: 'gap-4',
};

// Rounded
const ROUNDED = {
  container: 'rounded-3xl',
  card: 'rounded-2xl',
  button: 'rounded-xl',
};
```

---

## 🔗 RELATED FILES

- `resources/js/pages/user/akademik/jadwal.tsx` - Jadwal Kuliah page
- `resources/js/pages/user/tugas.tsx` - Tugas page
- `resources/js/pages/user/akademik/nilai.tsx` - Nilai page
- `resources/js/components/ui/animated-counter.tsx` - Animated counter component
- `app/Models/Course.php` - Course model
- `app/Models/Enrollment.php` - Enrollment model

---

**END OF PROMPT**
