# PROMPT: Fix & Enhance Tugas Kelompok Mahasiswa - UI/UX Matching Ultra Advanced

## 🎯 TUJUAN UTAMA
Memperbaiki dan mengembangkan menu Tugas Kelompok di mahasiswa dengan:
1. **UI/UX 100% MATCH** dengan admin dan dosen (warna, container, card, header)
2. **Self-forming groups** berfungsi sempurna untuk tugas baru
3. **Pengembangan super advanced** dengan fitur-fitur inovatif
4. **Mobile responsive** yang sangat optimal

## 🚨 MASALAH YANG HARUS DIPERBAIKI

### 1. UI/UX Tidak Konsisten
- ❌ Warna container berbeda dengan admin/dosen
- ❌ Card design tidak match
- ❌ Header style berbeda
- ❌ Spacing dan padding tidak konsisten
- ❌ Shadow dan border radius berbeda

### 2. Self-Form Groups Tidak Muncul
- ❌ Tugas baru dengan mode self-form tidak masuk ke menu mahasiswa
- ❌ Mahasiswa tidak bisa melihat tugas yang baru dibuat dosen
- ❌ Sistem invite tidak berfungsi
- ❌ Auto-placement tidak trigger

## ✅ SOLUSI & IMPLEMENTASI

### BAGIAN 1: FIX UI/UX - MATCH 100% DENGAN ADMIN/DOSEN

#### 1.1 Header Design (WAJIB SAMA)
```typescript
// File: resources/js/pages/student/tugas-kelompok.tsx

// ❌ SALAH (Current - Berbeda dengan admin/dosen)
<div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
    <h1>Tugas Kelompok</h1>
</div>

// ✅ BENAR (Match dengan admin/dosen)
<motion.div
    variants={itemVariants}
    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
>
    {/* Animated Gradient Background - SAMA PERSIS */}
    <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
        animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
        }}
        style={{
            backgroundSize: '200% 200%',
        }}
    />

    {/* Overlay & Glow Effects - SAMA PERSIS */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

    <div className="relative">
        {/* Icon - TANPA CONTAINER WRAPPER */}
        <Users className="h-16 w-16 sm:h-20 sm:w-20 text-white mb-4" />

        <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Tugas Kelompok
        </h1>
        <p className="mt-1 text-indigo-100 text-sm">
            Kelola tugas kelompok dan kolaborasi tim
        </p>
    </div>
</motion.div>
```

#### 1.2 Stats Cards Design (WAJIB SAMA)
```typescript
// ✅ BENAR - Match dengan admin/dosen
const StatCard = ({ icon: Icon, imageIcon, label, value, sub, color }: StatCardProps) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5"
    >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 dark:opacity-10`} />
        
        {/* Glow Effect */}
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${color} blur-3xl`}
        />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                {/* Icon - TANPA CONTAINER, warna match dengan gradient */}
                {imageIcon ? (
                    <img src={imageIcon} alt={label} className="h-12 w-12 object-contain" />
                ) : (
                    <Icon className={`h-12 w-12 ${color.replace('from-', 'text-').replace('to-', '').split(' ')[0]}`} />
                )}
            </div>

            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {label}
                </p>
                <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
                    {value}
                </p>
                {sub && (
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {sub}
                    </p>
                )}
            </div>
        </div>
    </motion.div>
);

// Stats Cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <StatCard
        icon={Briefcase}
        label="Total Tugas"
        value={stats.total}
        sub="Semua tugas kelompok"
        color="from-indigo-500 to-purple-500"
    />
    <StatCard
        icon={Users}
        label="Kelompok Aktif"
        value={stats.active_groups}
        sub="Kelompok yang sedang berjalan"
        color="from-emerald-500 to-teal-500"
    />
    <StatCard
        icon={CheckCircle}
        label="Tugas Selesai"
        value={stats.completed}
        sub="Tugas yang sudah dikumpulkan"
        color="from-green-500 to-emerald-500"
    />
    <StatCard
        icon={Clock}
        label="Deadline Terdekat"
        value={stats.upcoming_deadline}
        sub="Hari tersisa"
        color="from-amber-500 to-orange-500"
    />
</div>
```

#### 1.3 Tugas Card Design (WAJIB SAMA)
```typescript
// ✅ BENAR - Match dengan admin/dosen
const TugasCard = ({ assignment }: { assignment: Assignment }) => {
    const statusConfig = {
        'not_joined': {
            label: 'Belum Bergabung',
            color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
            icon: AlertCircle,
        },
        'joined': {
            label: 'Sudah Bergabung',
            color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            icon: CheckCircle,
        },
        'submitted': {
            label: 'Sudah Dikumpulkan',
            color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            icon: CheckCircle,
        },
    };

    const config = statusConfig[assignment.status];
    const StatusIcon = config.icon;

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 cursor-pointer"
            onClick={() => router.visit(`/student/tugas-kelompok/${assignment.id}`)}
        >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10" />
            
            {/* Glow Effect on Hover */}
            <motion.div
                animate={{
                    opacity: [0, 0.3, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                }}
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500 blur-3xl opacity-0 group-hover:opacity-30"
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {assignment.title}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {assignment.course.nama}
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${config.color} text-xs font-bold whitespace-nowrap`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-neutral-600 dark:text-neutral-300">
                            {assignment.total_groups} Kelompok
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-neutral-600 dark:text-neutral-300">
                            {assignment.deadline}
                        </span>
                    </div>
                </div>

                {/* Progress Bar (if joined) */}
                {assignment.my_group && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-500 dark:text-neutral-400">Progress</span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                {assignment.my_group.progress}%
                            </span>
                        </div>
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${assignment.my_group.progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {assignment.dosen.nama.charAt(0)}
                        </div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">
                            {assignment.dosen.nama}
                        </span>
                    </div>

                    <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
                    >
                        <span>Lihat Detail</span>
                        <ArrowRight className="h-4 w-4" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
```


### BAGIAN 2: FIX SELF-FORMING GROUPS - TUGAS BARU MASUK KE MAHASISWA

#### 2.1 Backend Fix - Controller
```php
// File: app/Http/Controllers/Student/TugasKelompokController.php

public function index()
{
    $student = auth()->user();
    
    // Get ALL group assignments for student's class
    // PENTING: Termasuk yang baru dibuat (self-form mode)
    $assignments = GroupAssignment::with([
        'course',
        'dosen',
        'groups.members' => function ($query) use ($student) {
            $query->where('mahasiswa_id', $student->id);
        }
    ])
    ->whereHas('course', function ($query) use ($student) {
        // Filter by student's class
        $query->where('kelas', $student->kelas);
    })
    ->orWhereHas('students', function ($query) use ($student) {
        // Or specifically assigned to this student
        $query->where('mahasiswa_id', $student->id);
    })
    ->orderBy('created_at', 'desc')
    ->get()
    ->map(function ($assignment) use ($student) {
        // Check if student has joined a group
        $myGroup = $assignment->groups()
            ->whereHas('members', function ($q) use ($student) {
                $q->where('mahasiswa_id', $student->id);
            })
            ->with('members.mahasiswa')
            ->first();

        // Determine status
        $status = 'not_joined';
        if ($myGroup) {
            $status = $myGroup->submission ? 'submitted' : 'joined';
        }

        return [
            'id' => $assignment->id,
            'title' => $assignment->title,
            'description' => $assignment->description,
            'course' => [
                'id' => $assignment->course->id,
                'nama' => $assignment->course->nama,
            ],
            'dosen' => [
                'id' => $assignment->dosen->id,
                'nama' => $assignment->dosen->nama,
            ],
            'formation_mode' => $assignment->formation_mode, // self-form, random, manual
            'total_groups' => $assignment->total_groups,
            'formation_deadline' => $assignment->formation_deadline,
            'submission_deadline' => $assignment->submission_deadline,
            'status' => $status,
            'my_group' => $myGroup ? [
                'id' => $myGroup->id,
                'number' => $myGroup->number,
                'name' => $myGroup->name,
                'progress' => $myGroup->progress ?? 0,
                'members_count' => $myGroup->members->count(),
            ] : null,
            'can_join' => $status === 'not_joined' && 
                         now()->lt($assignment->formation_deadline),
        ];
    });

    // Stats
    $stats = [
        'total' => $assignments->count(),
        'active_groups' => $assignments->where('status', 'joined')->count(),
        'completed' => $assignments->where('status', 'submitted')->count(),
        'not_joined' => $assignments->where('status', 'not_joined')->count(),
        'upcoming_deadline' => $this->getUpcomingDeadline($assignments),
    ];

    return Inertia::render('student/tugas-kelompok', [
        'assignments' => $assignments,
        'stats' => $stats,
    ]);
}

private function getUpcomingDeadline($assignments)
{
    $upcoming = $assignments
        ->where('status', '!=', 'submitted')
        ->sortBy('submission_deadline')
        ->first();

    if (!$upcoming) {
        return '-';
    }

    $days = now()->diffInDays($upcoming['submission_deadline'], false);
    
    if ($days < 0) {
        return 'Terlewat';
    } elseif ($days == 0) {
        return 'Hari ini';
    } elseif ($days == 1) {
        return 'Besok';
    } else {
        return $days . ' hari';
    }
}
```

#### 2.2 Backend Fix - Auto Create Groups
```php
// File: app/Http/Controllers/Admin/TugasKelompokController.php
// atau app/Http/Controllers/Dosen/TugasKelompokController.php

public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string',
        'description' => 'nullable|string',
        'course_id' => 'required|exists:courses,id',
        'formation_mode' => 'required|in:self-form,random,manual',
        'total_groups' => 'required|integer|min:1',
        'formation_deadline' => 'required|date',
        'submission_deadline' => 'required|date',
    ]);

    DB::beginTransaction();
    try {
        // Create assignment
        $assignment = GroupAssignment::create($validated);

        // PENTING: Auto-create groups untuk self-form mode
        if ($validated['formation_mode'] === 'self-form') {
            // Get students from the course's class
            $course = Course::find($validated['course_id']);
            $students = Mahasiswa::where('kelas', $course->kelas)->get();
            
            // Calculate students per group (distributed evenly)
            $totalStudents = $students->count();
            $totalGroups = $validated['total_groups'];
            $studentsPerGroup = ceil($totalStudents / $totalGroups);

            // Create empty groups
            for ($i = 1; $i <= $totalGroups; $i++) {
                AssignmentGroup::create([
                    'assignment_id' => $assignment->id,
                    'number' => $i,
                    'name' => null, // Will be set by students
                    'max_capacity' => $studentsPerGroup,
                    'current_members' => 0,
                ]);
            }

            // Schedule auto-placement job at formation deadline
            AutoPlaceStudentsJob::dispatch($assignment->id)
                ->delay($assignment->formation_deadline);

            // Send notification to all students
            foreach ($students as $student) {
                $student->notify(new NewGroupAssignmentCreated($assignment));
            }
        }

        DB::commit();

        return redirect()
            ->route('admin.tugas-kelompok.index')
            ->with('success', 'Tugas kelompok berhasil dibuat!');

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Gagal membuat tugas: ' . $e->getMessage()]);
    }
}
```

#### 2.3 Frontend Fix - Show All Assignments
```typescript
// File: resources/js/pages/student/tugas-kelompok.tsx

interface Assignment {
    id: number;
    title: string;
    description: string;
    course: { id: number; nama: string };
    dosen: { id: number; nama: string };
    formation_mode: 'self-form' | 'random' | 'manual';
    total_groups: number;
    formation_deadline: string;
    submission_deadline: string;
    status: 'not_joined' | 'joined' | 'submitted';
    my_group: {
        id: number;
        number: number;
        name: string | null;
        progress: number;
        members_count: number;
    } | null;
    can_join: boolean;
}

interface PageProps {
    assignments: Assignment[];
    stats: {
        total: number;
        active_groups: number;
        completed: number;
        not_joined: number;
        upcoming_deadline: string;
    };
}

export default function StudentTugasKelompok({ assignments, stats }: PageProps) {
    const [filter, setFilter] = useState<'all' | 'not_joined' | 'joined' | 'submitted'>('all');
    const [search, setSearch] = useState('');

    // Filter assignments
    const filteredAssignments = assignments.filter(assignment => {
        // Filter by status
        if (filter !== 'all' && assignment.status !== filter) {
            return false;
        }

        // Filter by search
        if (search && !assignment.title.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }

        return true;
    });

    // Group by status for better UX
    const notJoinedAssignments = filteredAssignments.filter(a => a.status === 'not_joined');
    const joinedAssignments = filteredAssignments.filter(a => a.status === 'joined');
    const submittedAssignments = filteredAssignments.filter(a => a.status === 'submitted');

    return (
        <AppLayout>
            <Head title="Tugas Kelompok" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
                {/* Header - Match dengan admin/dosen */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
                >
                    {/* ... (Header code dari section 1.1) ... */}
                </motion.div>

                {/* Stats Cards - Match dengan admin/dosen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* ... (Stats cards dari section 1.2) ... */}
                </div>

                {/* Filter & Search */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Cari tugas kelompok..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit">
                        {[
                            { id: 'all', label: 'Semua', count: assignments.length },
                            { id: 'not_joined', label: 'Belum Gabung', count: stats.not_joined },
                            { id: 'joined', label: 'Aktif', count: stats.active_groups },
                            { id: 'submitted', label: 'Selesai', count: stats.completed },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                className={`relative px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                    filter === tab.id
                                        ? 'text-indigo-700 dark:text-indigo-300'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
                                }`}
                            >
                                {filter === tab.id && (
                                    <motion.div
                                        layoutId="filterTab"
                                        className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">
                                    {tab.label} ({tab.count})
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Assignments List - Grouped by Status */}
                <AnimatePresence mode="wait">
                    {filteredAssignments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-12 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl"
                        >
                            <Briefcase className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Tidak ada tugas kelompok
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-8">
                            {/* Belum Bergabung - Priority High */}
                            {notJoinedAssignments.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                        Belum Bergabung ({notJoinedAssignments.length})
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                        {notJoinedAssignments.map(assignment => (
                                            <TugasCard key={assignment.id} assignment={assignment} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sedang Berjalan */}
                            {joinedAssignments.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-green-600" />
                                        Sedang Berjalan ({joinedAssignments.length})
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                        {joinedAssignments.map(assignment => (
                                            <TugasCard key={assignment.id} assignment={assignment} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sudah Selesai */}
                            {submittedAssignments.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                        Sudah Selesai ({submittedAssignments.length})
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                        {submittedAssignments.map(assignment => (
                                            <TugasCard key={assignment.id} assignment={assignment} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AppLayout>
    );
}

// Animation variants - SAMA dengan admin/dosen
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

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
};
```


### BAGIAN 3: PENGEMBANGAN SUPER ADVANCED

#### 3.1 Smart Notification System
```typescript
// Real-time notification untuk tugas baru
useEffect(() => {
    const channel = Echo.private(`student.${auth.user.id}`);

    channel.listen('NewGroupAssignmentCreated', (event: any) => {
        // Show toast notification
        toast.info(
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <p className="font-bold">Tugas Kelompok Baru!</p>
                    <p className="text-sm">{event.assignment.title}</p>
                </div>
            </div>,
            {
                duration: 5000,
                action: {
                    label: 'Lihat',
                    onClick: () => router.visit(`/student/tugas-kelompok/${event.assignment.id}`),
                },
            }
        );

        // Reload assignments
        router.reload({ only: ['assignments', 'stats'] });
    });

    return () => channel.stopListening('NewGroupAssignmentCreated');
}, []);
```

#### 3.2 Deadline Countdown Widget
```typescript
const DeadlineCountdown = ({ deadline }: { deadline: string }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(deadline));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(deadline));
        }, 1000);

        return () => clearInterval(timer);
    }, [deadline]);

    const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000; // < 24 hours

    return (
        <motion.div
            animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                isUrgent
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}
        >
            <Clock className="h-4 w-4" />
            <span className="text-xs font-bold">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
        </motion.div>
    );
};
```

#### 3.3 Quick Join Button
```typescript
const QuickJoinButton = ({ assignment }: { assignment: Assignment }) => {
    const [isJoining, setIsJoining] = useState(false);

    const handleQuickJoin = async () => {
        if (!confirm('Bergabung ke tugas kelompok ini?')) return;

        setIsJoining(true);
        router.visit(`/student/tugas-kelompok/${assignment.id}`, {
            onFinish: () => setIsJoining(false),
        });
    };

    if (assignment.status !== 'not_joined' || !assignment.can_join) {
        return null;
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleQuickJoin}
            disabled={isJoining}
            className="w-full mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
            {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Memproses...
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Pilih Kelompok
                </span>
            )}
        </motion.button>
    );
};
```

#### 3.4 Progress Visualization
```typescript
const ProgressRing = ({ progress }: { progress: number }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative h-24 w-24">
            <svg className="transform -rotate-90" width="96" height="96">
                {/* Background circle */}
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-neutral-200 dark:text-neutral-700"
                />
                {/* Progress circle */}
                <motion.circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {progress}%
                </span>
            </div>
        </div>
    );
};
```

#### 3.5 Team Preview Card
```typescript
const TeamPreviewCard = ({ group }: { group: Group }) => {
    return (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                    {group.name || `Kelompok ${group.number}`}
                </h4>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {group.members_count} anggota
                </span>
            </div>

            {/* Member avatars */}
            <div className="flex -space-x-2">
                {group.members.slice(0, 5).map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ scale: 0, x: -20 }}
                        animate={{ scale: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-neutral-900"
                        title={member.nama}
                    >
                        {member.nama.charAt(0)}
                    </motion.div>
                ))}
                {group.members_count > 5 && (
                    <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-neutral-900">
                        +{group.members_count - 5}
                    </div>
                )}
            </div>

            {/* Quick stats */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                    <p className="font-bold text-neutral-900 dark:text-white">
                        {group.commits || 0}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400">Commits</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-neutral-900 dark:text-white">
                        {group.files || 0}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400">Files</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-neutral-900 dark:text-white">
                        {group.messages || 0}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400">Messages</p>
                </div>
            </div>
        </div>
    );
};
```

#### 3.6 Smart Recommendations
```typescript
const RecommendationBanner = ({ assignment }: { assignment: Assignment }) => {
    if (assignment.status !== 'not_joined') return null;

    const daysLeft = Math.ceil(
        (new Date(assignment.formation_deadline).getTime() - Date.now()) / 
        (1000 * 60 * 60 * 24)
    );

    const isUrgent = daysLeft <= 2;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl border-2 ${
                isUrgent
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800'
            }`}
        >
            <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    isUrgent
                        ? 'bg-red-100 dark:bg-red-900'
                        : 'bg-amber-100 dark:bg-amber-900'
                }`}>
                    {isUrgent ? (
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                        <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold ${
                        isUrgent
                            ? 'text-red-900 dark:text-red-100'
                            : 'text-amber-900 dark:text-amber-100'
                    }`}>
                        {isUrgent ? 'Segera Bergabung!' : 'Rekomendasi'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                        isUrgent
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-amber-700 dark:text-amber-300'
                    }`}>
                        {isUrgent
                            ? `Deadline pembentukan kelompok tinggal ${daysLeft} hari lagi! Segera pilih kelompok sebelum sistem menempatkan Anda secara otomatis.`
                            : `Anda belum bergabung ke kelompok untuk tugas "${assignment.title}". Pilih kelompok sekarang untuk mulai berkolaborasi dengan tim.`
                        }
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.visit(`/student/tugas-kelompok/${assignment.id}`)}
                        className={`mt-3 px-4 py-2 rounded-xl font-bold text-white ${
                            isUrgent
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                    >
                        Pilih Kelompok Sekarang
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
```


## ✅ CHECKLIST IMPLEMENTASI

### UI/UX Matching
- [ ] Header gradient background sama persis dengan admin/dosen
- [ ] Icon header TANPA container wrapper
- [ ] Stats cards design 100% match
- [ ] Tugas card design 100% match
- [ ] Warna container sama (glassmorphism effect)
- [ ] Shadow dan border radius sama
- [ ] Typography sama (font size, weight, color)
- [ ] Spacing dan padding sama
- [ ] Hover effects sama
- [ ] Animation variants sama

### Self-Form Groups Fix
- [ ] Backend: Get ALL assignments including new ones
- [ ] Backend: Auto-create groups saat tugas dibuat
- [ ] Backend: Calculate students per group (distributed evenly)
- [ ] Backend: Schedule auto-placement job
- [ ] Frontend: Show all assignments (including self-form)
- [ ] Frontend: Display "Belum Bergabung" status
- [ ] Frontend: Enable "Pilih Kelompok" button
- [ ] Real-time notification untuk tugas baru
- [ ] Auto-reload assignments list

### Advanced Features
- [ ] Smart notification system
- [ ] Deadline countdown widget
- [ ] Quick join button
- [ ] Progress ring visualization
- [ ] Team preview card
- [ ] Smart recommendations banner
- [ ] Filter by status (all/not_joined/joined/submitted)
- [ ] Search functionality
- [ ] Grouped display (priority: not_joined first)
- [ ] Real-time updates dengan WebSocket

### Mobile Responsive
- [ ] Header responsive (stack vertical di mobile)
- [ ] Stats cards grid (1 col mobile, 2 col tablet, 4 col desktop)
- [ ] Tugas cards grid (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Filter tabs scrollable horizontal di mobile
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Optimized spacing untuk mobile
- [ ] Readable font sizes di mobile

### Testing
- [ ] Test create tugas baru (self-form mode)
- [ ] Test tugas muncul di menu mahasiswa
- [ ] Test mahasiswa bisa klik "Pilih Kelompok"
- [ ] Test UI/UX match dengan admin/dosen
- [ ] Test notification real-time
- [ ] Test filter dan search
- [ ] Test mobile responsiveness
- [ ] Test deadline countdown
- [ ] Test auto-placement job

## 🎨 COLOR PALETTE (WAJIB SAMA)

```typescript
// Gradient Backgrounds
const gradients = {
    header: 'from-indigo-600 via-purple-600 to-pink-500',
    card: 'from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10',
    button: 'from-indigo-500 to-purple-500',
    progress: 'from-indigo-500 to-purple-500',
};

// Status Colors
const statusColors = {
    not_joined: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
    },
    joined: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
    },
    submitted: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
    },
};

// Card Colors
const cardColors = {
    background: 'bg-white/40 dark:bg-neutral-900/40',
    border: 'border-white/20 dark:border-white/5',
    text: {
        primary: 'text-neutral-900 dark:text-white',
        secondary: 'text-neutral-600 dark:text-neutral-300',
        tertiary: 'text-neutral-500 dark:text-neutral-400',
    },
};
```

## 📝 CATATAN PENTING

### 1. Konsistensi Design
- **WAJIB** menggunakan exact same classes dengan admin/dosen
- **WAJIB** menggunakan exact same animation variants
- **WAJIB** menggunakan exact same color palette
- **JANGAN** membuat custom design yang berbeda

### 2. Self-Form Groups Flow
```
1. Dosen/Admin create tugas (mode: self-form, total_groups: 8)
   ↓
2. System auto-create 8 empty groups
   ↓
3. System calculate students_per_group (distributed evenly)
   ↓
4. System send notification to ALL students in class
   ↓
5. Tugas MUNCUL di menu mahasiswa dengan status "Belum Bergabung"
   ↓
6. Mahasiswa klik "Pilih Kelompok"
   ↓
7. Mahasiswa lihat 8 kelompok dengan status (penuh/tersedia)
   ↓
8. Mahasiswa pilih kelompok atau ajak teman
   ↓
9. Jika deadline tercapai & belum pilih → Auto-placement
```

### 3. Real-Time Updates
- Gunakan Laravel Echo + Pusher/Socket.io
- Listen to channel: `student.{student_id}`
- Events: `NewGroupAssignmentCreated`, `GroupMemberJoined`, `InvitationReceived`
- Auto-reload assignments list saat ada update

### 4. Performance Optimization
- Lazy load tugas cards (virtual scrolling jika > 50 items)
- Debounce search input (300ms)
- Memoize filtered assignments
- Optimize images (lazy loading, srcset)
- Cache stats data (5 minutes)

---

**PENTING**: Implementasi ini HARUS dilakukan dengan sangat hati-hati. UI/UX matching adalah prioritas utama, diikuti dengan functionality self-form groups. Test secara menyeluruh sebelum deploy!

