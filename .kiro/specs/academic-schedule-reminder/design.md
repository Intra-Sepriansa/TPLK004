# Design Document: Jadwal & Pengingat Akademik

## Overview

Fitur Jadwal & Pengingat Akademik adalah sistem komprehensif untuk membantu mahasiswa kelas 06TPLK004 UNPAM mengelola jadwal perkuliahan, melacak tugas, mencatat pembelajaran, dan mendapatkan pengingat UTS/UAS. Sistem ini dirancang dengan mempertimbangkan pola kuliah kelas (online Senin-Jumat, offline Kamis) dan aturan SKS (2 SKS = 14 pertemuan, 3 SKS = 21 pertemuan).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Inertia)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │   Schedule   │  │    Tasks     │          │
│  │   Page       │  │    Page      │  │    Page      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Courses    │  │    Notes     │  │   Exams      │          │
│  │    Page      │  │    Page      │  │  Calendar    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                     Laravel Backend (PHP)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Course     │  │    Task      │  │    Note      │          │
│  │ Controller   │  │ Controller   │  │ Controller   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  Schedule    │  │   Reminder   │                            │
│  │  Service     │  │   Service    │                            │
│  └──────────────┘  └──────────────┘                            │
├─────────────────────────────────────────────────────────────────┤
│                        Database (MySQL)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   courses    │  │    tasks     │  │    notes     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  meetings    │  │  mahasiswa   │                            │
│  │              │  │  _courses    │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. AcademicCourseController
Mengelola CRUD mata kuliah mahasiswa.

```php
class AcademicCourseController extends Controller
{
    public function index(): Response;           // List semua mata kuliah
    public function store(Request $request): RedirectResponse;  // Tambah mata kuliah
    public function update(Request $request, int $id): RedirectResponse;
    public function destroy(int $id): RedirectResponse;
}
```

#### 2. AcademicTaskController
Mengelola tugas per pertemuan.

```php
class AcademicTaskController extends Controller
{
    public function index(): Response;           // List semua tugas
    public function store(Request $request): RedirectResponse;
    public function update(Request $request, int $id): RedirectResponse;
    public function toggleStatus(int $id): RedirectResponse;  // Toggle complete/pending
    public function destroy(int $id): RedirectResponse;
}
```

#### 3. AcademicNoteController
Mengelola catatan pembelajaran.

```php
class AcademicNoteController extends Controller
{
    public function index(): Response;           // List semua catatan
    public function store(Request $request): RedirectResponse;
    public function update(Request $request, int $id): RedirectResponse;
    public function destroy(int $id): RedirectResponse;
    public function search(Request $request): Response;  // Search catatan
}
```

#### 4. AcademicScheduleController
Menampilkan jadwal dan dashboard.

```php
class AcademicScheduleController extends Controller
{
    public function dashboard(): Response;       // Dashboard overview
    public function schedule(): Response;        // Weekly schedule view
    public function exams(): Response;           // Exam calendar view
}
```

#### 5. ScheduleService
Service untuk kalkulasi jadwal dan reminder.

```php
class ScheduleService
{
    public function calculateTotalMeetings(int $sks): int;
    public function calculateUtsMeeting(int $sks): int;
    public function calculateUasMeeting(int $sks): int;
    public function calculateExamDate(Course $course, string $examType): ?Carbon;
    public function getCountdownDays(Carbon $targetDate): int;
    public function generateMeetingSchedule(Course $course): array;
    public function getTodaySchedule(int $mahasiswaId): Collection;
    public function getUpcomingExams(int $mahasiswaId): Collection;
}
```

### Frontend Components

#### 1. AcademicDashboard Page
Dashboard utama dengan ringkasan semua informasi.

```typescript
interface DashboardProps {
    todaySchedule: ScheduleItem[];
    pendingTasks: Task[];
    upcomingExams: Exam[];
    courseProgress: CourseProgress[];
    recentNotes: Note[];
    stats: {
        totalCourses: number;
        completedTasks: number;
        pendingTasks: number;
        overdueTasks: number;
        weeklyProgress: number;
    };
}
```

#### 2. AcademicSchedule Page
Tampilan jadwal mingguan.

```typescript
interface ScheduleProps {
    weekSchedule: {
        [day: string]: ScheduleItem[];
    };
    currentMeeting: { [courseId: number]: number };
}

interface ScheduleItem {
    id: number;
    courseName: string;
    time: string;
    meetingNumber: number;
    totalMeetings: number;
    mode: 'online' | 'offline';
    isCompleted: boolean;
    isToday: boolean;
}
```

#### 3. AcademicTasks Page
Halaman manajemen tugas.

```typescript
interface TasksProps {
    tasks: Task[];
    courses: Course[];
    stats: TaskStats;
}

interface Task {
    id: number;
    title: string;
    description?: string;
    courseId: number;
    courseName: string;
    meetingNumber: number;
    deadline: string;
    daysRemaining: number;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: string;
    isOverdue: boolean;
}
```

#### 4. AcademicNotes Page
Halaman catatan pembelajaran.

```typescript
interface NotesProps {
    notes: Note[];
    courses: Course[];
}

interface Note {
    id: number;
    courseId: number;
    courseName: string;
    meetingNumber: number;
    mode: 'online' | 'offline';
    title: string;
    content: string;
    links?: string[];
    createdAt: string;
    updatedAt: string;
}
```

#### 5. AcademicCourses Page
Halaman kelola mata kuliah.

```typescript
interface CoursesProps {
    courses: Course[];
}

interface Course {
    id: number;
    name: string;
    sks: 2 | 3;
    totalMeetings: number;
    currentMeeting: number;
    utsMeeting: number;
    uasMeeting: number;
    scheduleDay: string;
    scheduleTime: string;
    mode: 'online' | 'offline';
    progress: number;
    utsDate?: string;
    uasDate?: string;
    daysToUts?: number;
    daysToUas?: number;
}
```

#### 6. AcademicExams Page
Kalender ujian dengan countdown.

```typescript
interface ExamsProps {
    exams: Exam[];
    calendarData: CalendarEvent[];
}

interface Exam {
    id: number;
    courseId: number;
    courseName: string;
    type: 'UTS' | 'UAS';
    date: string;
    daysRemaining: number;
    meetingNumber: number;
    isWarning: boolean;    // <= 7 days
    isCritical: boolean;   // <= 3 days
}
```

## Data Models

### Database Schema

```sql
-- Tabel mata kuliah mahasiswa
CREATE TABLE mahasiswa_courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mahasiswa_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sks TINYINT NOT NULL CHECK (sks IN (2, 3)),
    total_meetings INT NOT NULL,
    current_meeting INT DEFAULT 0,
    uts_meeting INT NOT NULL,
    uas_meeting INT NOT NULL,
    schedule_day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday') NOT NULL,
    schedule_time TIME NOT NULL,
    mode ENUM('online', 'offline') NOT NULL,
    start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE
);

-- Tabel pertemuan per mata kuliah
CREATE TABLE course_meetings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mahasiswa_course_id INT NOT NULL,
    meeting_number INT NOT NULL,
    scheduled_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mahasiswa_course_id) REFERENCES mahasiswa_courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting (mahasiswa_course_id, meeting_number)
);

-- Tabel tugas
CREATE TABLE academic_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mahasiswa_id INT NOT NULL,
    mahasiswa_course_id INT NOT NULL,
    meeting_number INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (mahasiswa_course_id) REFERENCES mahasiswa_courses(id) ON DELETE CASCADE
);

-- Tabel catatan pembelajaran
CREATE TABLE academic_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mahasiswa_id INT NOT NULL,
    mahasiswa_course_id INT NOT NULL,
    meeting_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    links JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (mahasiswa_course_id) REFERENCES mahasiswa_courses(id) ON DELETE CASCADE
);
```

### Eloquent Models

```php
// MahasiswaCourse Model
class MahasiswaCourse extends Model
{
    protected $fillable = [
        'mahasiswa_id', 'name', 'sks', 'total_meetings', 'current_meeting',
        'uts_meeting', 'uas_meeting', 'schedule_day', 'schedule_time', 
        'mode', 'start_date'
    ];
    
    protected $casts = [
        'sks' => 'integer',
        'total_meetings' => 'integer',
        'current_meeting' => 'integer',
        'start_date' => 'date',
    ];
    
    public function mahasiswa(): BelongsTo;
    public function meetings(): HasMany;
    public function tasks(): HasMany;
    public function notes(): HasMany;
    
    // Accessors
    public function getProgressAttribute(): float;
    public function getUtsDaysRemainingAttribute(): ?int;
    public function getUasDaysRemainingAttribute(): ?int;
}

// AcademicTask Model
class AcademicTask extends Model
{
    protected $fillable = [
        'mahasiswa_id', 'mahasiswa_course_id', 'meeting_number',
        'title', 'description', 'deadline', 'status', 'completed_at'
    ];
    
    protected $casts = [
        'deadline' => 'date',
        'completed_at' => 'datetime',
    ];
    
    public function course(): BelongsTo;
    
    // Accessors
    public function getDaysRemainingAttribute(): int;
    public function getIsOverdueAttribute(): bool;
}

// AcademicNote Model
class AcademicNote extends Model
{
    protected $fillable = [
        'mahasiswa_id', 'mahasiswa_course_id', 'meeting_number',
        'title', 'content', 'links'
    ];
    
    protected $casts = [
        'links' => 'array',
    ];
    
    public function course(): BelongsTo;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: SKS-based Meeting Calculation
*For any* course with valid SKS (2 or 3), the total meetings, UTS meeting, and UAS meeting SHALL be calculated correctly:
- SKS 2: total=14, UTS after meeting 7, UAS after meeting 14
- SKS 3: total=21, UTS after meeting 14, UAS after meeting 21

**Validates: Requirements 2.2, 2.3, 7.3, 7.4**

### Property 2: Progress Calculation Accuracy
*For any* course with N completed meetings out of M total meetings, the progress percentage SHALL equal (N/M) * 100, rounded to nearest integer.

**Validates: Requirements 2.1, 6.4**

### Property 3: Task Status Transition
*For any* task, when marked as complete, the status SHALL change to 'completed' AND completed_at timestamp SHALL be set to current time.

**Validates: Requirements 3.3**

### Property 4: Deadline Days Calculation
*For any* task with a deadline, days_remaining SHALL equal the difference between deadline date and current date. If deadline has passed, days_remaining SHALL be negative.

**Validates: Requirements 3.4, 3.5**

### Property 5: Task Filter Correctness
*For any* filter criteria (course, status, deadline), the filtered task list SHALL contain only tasks that match ALL specified criteria.

**Validates: Requirements 3.6**

### Property 6: Exam Countdown Calculation
*For any* course with calculated exam date, the countdown days SHALL equal the difference between exam date and current date.

**Validates: Requirements 5.1, 5.2, 6.3**

### Property 7: Reminder Threshold Logic
*For any* exam with countdown days:
- If days <= 7 AND days > 3: isWarning SHALL be true, isCritical SHALL be false
- If days <= 3: isWarning SHALL be true, isCritical SHALL be true
- If days > 7: isWarning SHALL be false, isCritical SHALL be false

**Validates: Requirements 5.3, 5.4**

### Property 8: Notes Chronological Order
*For any* course, when notes are retrieved, they SHALL be sorted by meeting_number in ascending order.

**Validates: Requirements 4.4, 4.5**

### Property 9: Notes Search Accuracy
*For any* search query, all returned notes SHALL contain the search keyword in either title or content.

**Validates: Requirements 4.6**

### Property 10: Today's Schedule Filter
*For any* day, the today's schedule SHALL contain only courses where schedule_day matches the current day of week.

**Validates: Requirements 6.1**

### Property 11: Meeting Generation Correctness
*For any* newly added course, the system SHALL generate exactly total_meetings number of meeting records.

**Validates: Requirements 7.5**

### Property 12: SKS Validation
*For any* course creation/update request, if SKS is not 2 or 3, the request SHALL be rejected with validation error.

**Validates: Requirements 7.2**

## Error Handling

### Validation Errors
- SKS harus 2 atau 3
- Nama mata kuliah wajib diisi
- Jadwal hari dan waktu wajib diisi
- Deadline tugas tidak boleh di masa lalu (untuk tugas baru)
- Judul catatan dan konten wajib diisi

### Business Logic Errors
- Tidak bisa menghapus mata kuliah yang memiliki tugas pending
- Tidak bisa mengubah SKS jika sudah ada pertemuan yang selesai
- Meeting number tidak boleh melebihi total meetings

### UI Error States
- Empty state untuk daftar kosong
- Loading state untuk operasi async
- Error toast untuk operasi gagal
- Confirmation dialog untuk delete

## Testing Strategy

### Unit Tests
- Test ScheduleService calculation methods
- Test model accessors (progress, days_remaining, is_overdue)
- Test validation rules

### Property-Based Tests
Menggunakan **Pest PHP** dengan plugin property testing:

```php
// Property 1: SKS-based Meeting Calculation
it('calculates meetings correctly for any valid SKS', function () {
    $service = new ScheduleService();
    
    // Test SKS 2
    expect($service->calculateTotalMeetings(2))->toBe(14);
    expect($service->calculateUtsMeeting(2))->toBe(7);
    expect($service->calculateUasMeeting(2))->toBe(14);
    
    // Test SKS 3
    expect($service->calculateTotalMeetings(3))->toBe(21);
    expect($service->calculateUtsMeeting(3))->toBe(14);
    expect($service->calculateUasMeeting(3))->toBe(21);
});

// Property 2: Progress Calculation
it('calculates progress correctly for any completed/total ratio', function (int $completed, int $total) {
    $course = MahasiswaCourse::factory()->make([
        'current_meeting' => $completed,
        'total_meetings' => $total,
    ]);
    
    $expected = round(($completed / $total) * 100);
    expect($course->progress)->toBe($expected);
})->with([
    [0, 14], [7, 14], [14, 14],
    [0, 21], [14, 21], [21, 21],
    [5, 14], [10, 21],
]);

// Property 7: Reminder Threshold
it('sets warning flags correctly based on days remaining', function (int $days, bool $warning, bool $critical) {
    $result = ReminderService::getAlertLevel($days);
    
    expect($result['isWarning'])->toBe($warning);
    expect($result['isCritical'])->toBe($critical);
})->with([
    [10, false, false],
    [7, true, false],
    [5, true, false],
    [3, true, true],
    [1, true, true],
    [0, true, true],
]);
```

### Integration Tests
- Test full CRUD flow untuk courses, tasks, notes
- Test dashboard data aggregation
- Test schedule filtering

### E2E Tests (Optional)
- Test user flow: add course → add task → complete task
- Test exam reminder visibility
