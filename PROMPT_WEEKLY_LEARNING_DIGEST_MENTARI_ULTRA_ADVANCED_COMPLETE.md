# PROMPT: Weekly Learning Digest - Rekapan Pembelajaran Daring Mentari UNPAM
## Ultra Advanced Complete System

---

## 🎯 EXECUTIVE SUMMARY

Sistem **Weekly Learning Digest** untuk merekap dan menginformasikan aktivitas pembelajaran daring dari **Web Mentari UNPAM** kepada mahasiswa. Sistem ini mengumpulkan data mingguan tentang:

1. **Forum Diskusi** - Topik, partisipasi, highlight diskusi
2. **Tugas/Assignment** - Deadline, status, submission
3. **Materi Pembelajaran** - Upload baru, modul, video
4. **Pengumuman** - Info penting dari dosen
5. **Jadwal Kegiatan** - Live session, webinar, deadline minggu depan

**Key Concept:**
- Admin membuat digest mingguan (Week 1, Week 2, dst)
- Setiap digest berisi rekapan lengkap aktivitas Mentari
- Mahasiswa melihat digest sebagai panduan belajar mingguan
- Export PDF untuk dokumentasi dan offline reading

---

## 📋 PART 1: DATABASE SCHEMA REDESIGN

### 1.1 Main Table: Weekly Learning Digests

```sql
CREATE TABLE weekly_learning_digests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mata_kuliah_id BIGINT UNSIGNED NOT NULL,
    class_label VARCHAR(50) NULL COMMENT 'e.g., TI-6A',
    
    -- Week Information
    week_number INT NOT NULL COMMENT 'Minggu ke-berapa (1-16)',
    semester VARCHAR(20) NOT NULL COMMENT 'e.g., Genap 2023/2024',
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    
    -- Mentari Platform Info
    mentari_course_url TEXT NULL,
    mentari_course_id VARCHAR(100) NULL,
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    published_at DATETIME NULL,
    
    -- Metadata
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_mata_kuliah (mata_kuliah_id),
    INDEX idx_week (week_number, semester),
    INDEX idx_published (is_published, published_at),
    INDEX idx_dates (week_start_date, week_end_date),
    
    FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_week_course (mata_kuliah_id, week_number, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2 Forum Discussions Table

```sql
CREATE TABLE digest_forum_discussions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Forum Info
    topic_title VARCHAR(255) NOT NULL,
    topic_description TEXT NULL,
    mentari_forum_url TEXT NULL,
    
    -- Statistics
    total_posts INT DEFAULT 0,
    total_participants INT DEFAULT 0,
    
    -- Highlights
    key_points TEXT NULL COMMENT 'Poin-poin penting diskusi',
    best_contributions TEXT NULL COMMENT 'Kontribusi terbaik mahasiswa',
    
    -- Metadata
    discussion_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    INDEX idx_digest (digest_id),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.3 Assignments/Tasks Table

```sql
CREATE TABLE digest_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Assignment Info
    assignment_title VARCHAR(255) NOT NULL,
    assignment_description TEXT NULL,
    assignment_type ENUM('individual', 'group', 'quiz', 'project') DEFAULT 'individual',
    mentari_assignment_url TEXT NULL,
    
    -- Deadlines
    deadline_date DATETIME NOT NULL,
    submission_start_date DATETIME NULL,
    
    -- Requirements
    max_score INT DEFAULT 100,
    submission_format VARCHAR(255) NULL COMMENT 'e.g., PDF, Word, Video',
    file_size_limit VARCHAR(50) NULL COMMENT 'e.g., Max 10MB',
    
    -- Instructions
    detailed_instructions TEXT NULL,
    grading_criteria TEXT NULL,
    
    -- Status
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_late_submission_allowed BOOLEAN DEFAULT FALSE,
    late_penalty_percentage INT DEFAULT 0,
    
    -- Statistics (optional - jika ada integrasi)
    total_submissions INT DEFAULT 0,
    submission_rate DECIMAL(5,2) DEFAULT 0.00,
    
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    INDEX idx_digest (digest_id),
    INDEX idx_deadline (deadline_date),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.4 Learning Materials Table

```sql
CREATE TABLE digest_learning_materials (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Material Info
    material_title VARCHAR(255) NOT NULL,
    material_description TEXT NULL,
    material_type ENUM('pdf', 'video', 'slide', 'document', 'link', 'other') NOT NULL,
    mentari_material_url TEXT NULL,
    
    -- File Info (if applicable)
    file_name VARCHAR(255) NULL,
    file_size VARCHAR(50) NULL,
    duration VARCHAR(50) NULL COMMENT 'For videos: e.g., 45 minutes',
    
    -- Content Details
    topics_covered TEXT NULL COMMENT 'Topik yang dibahas',
    learning_objectives TEXT NULL COMMENT 'Tujuan pembelajaran',
    
    -- Access Info
    is_downloadable BOOLEAN DEFAULT TRUE,
    requires_password BOOLEAN DEFAULT FALSE,
    access_notes TEXT NULL,
    
    -- Metadata
    upload_date DATE NULL,
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    INDEX idx_digest (digest_id),
    INDEX idx_type (material_type),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.5 Announcements Table

```sql
CREATE TABLE digest_announcements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Announcement Info
    announcement_title VARCHAR(255) NOT NULL,
    announcement_content TEXT NOT NULL,
    announcement_type ENUM('info', 'important', 'urgent', 'reminder') DEFAULT 'info',
    
    -- Priority
    priority_level ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    announced_date DATETIME NULL,
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    INDEX idx_digest (digest_id),
    INDEX idx_type (announcement_type),
    INDEX idx_priority (priority_level),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.6 Upcoming Schedule Table

```sql
CREATE TABLE digest_upcoming_schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Schedule Info
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT NULL,
    event_type ENUM('live_session', 'webinar', 'quiz', 'exam', 'deadline', 'meeting', 'other') NOT NULL,
    
    -- Date & Time
    event_date DATE NOT NULL,
    event_time TIME NULL,
    duration_minutes INT NULL,
    
    -- Location/Platform
    platform VARCHAR(100) NULL COMMENT 'e.g., Zoom, Google Meet, Mentari',
    meeting_link TEXT NULL,
    meeting_id VARCHAR(100) NULL,
    meeting_password VARCHAR(100) NULL,
    
    -- Additional Info
    is_mandatory BOOLEAN DEFAULT FALSE,
    max_participants INT NULL,
    preparation_notes TEXT NULL,
    
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    INDEX idx_digest (digest_id),
    INDEX idx_event_date (event_date),
    INDEX idx_type (event_type),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.7 Support Contacts Table

```sql
CREATE TABLE digest_support_contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Contact Info
    contact_name VARCHAR(255) NOT NULL,
    contact_role VARCHAR(100) NULL COMMENT 'e.g., Dosen, Asisten, Admin',
    contact_type ENUM('email', 'phone', 'whatsapp', 'telegram', 'other') NOT NULL,
    contact_value VARCHAR(255) NOT NULL,
    
    -- Availability
    available_hours VARCHAR(255) NULL COMMENT 'e.g., Senin-Jumat 09:00-17:00',
    response_time VARCHAR(100) NULL COMMENT 'e.g., Max 24 jam',
    
    -- Notes
    notes TEXT NULL,
    
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    INDEX idx_digest (digest_id),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```



---

## 📋 PART 2: LARAVEL MODELS

### 2.1 Main Model: WeeklyLearningDigest

**File: `app/Models/WeeklyLearningDigest.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeeklyLearningDigest extends Model
{
    protected $table = 'weekly_learning_digests';

    protected $fillable = [
        'mata_kuliah_id',
        'class_label',
        'week_number',
        'semester',
        'week_start_date',
        'week_end_date',
        'title',
        'description',
        'mentari_course_url',
        'mentari_course_id',
        'is_published',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'week_start_date' => 'date',
        'week_end_date' => 'date',
    ];

    // Relationships
    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function forumDiscussions(): HasMany
    {
        return $this->hasMany(DigestForumDiscussion::class, 'digest_id')->orderBy('display_order');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(DigestAssignment::class, 'digest_id')->orderBy('display_order');
    }

    public function learningMaterials(): HasMany
    {
        return $this->hasMany(DigestLearningMaterial::class, 'digest_id')->orderBy('display_order');
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(DigestAnnouncement::class, 'digest_id')->orderBy('display_order');
    }

    public function upcomingSchedules(): HasMany
    {
        return $this->hasMany(DigestUpcomingSchedule::class, 'digest_id')->orderBy('event_date', 'asc');
    }

    public function supportContacts(): HasMany
    {
        return $this->hasMany(DigestSupportContact::class, 'digest_id')->orderBy('display_order');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeCurrentWeek($query)
    {
        $now = now();
        return $query->where('week_start_date', '<=', $now)
                     ->where('week_end_date', '>=', $now);
    }

    public function scopeForSemester($query, string $semester)
    {
        return $query->where('semester', $semester);
    }

    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('mata_kuliah_id', $courseId);
    }

    // Helper Methods
    public function getWeekRangeAttribute(): string
    {
        return $this->week_start_date->format('d M') . ' - ' . $this->week_end_date->format('d M Y');
    }

    public function getTotalItemsAttribute(): int
    {
        return $this->forumDiscussions()->count() +
               $this->assignments()->count() +
               $this->learningMaterials()->count() +
               $this->announcements()->count() +
               $this->upcomingSchedules()->count();
    }

    public function getCompletionPercentageAttribute(): float
    {
        $total = 6; // Total sections
        $completed = 0;

        if ($this->forumDiscussions()->count() > 0) $completed++;
        if ($this->assignments()->count() > 0) $completed++;
        if ($this->learningMaterials()->count() > 0) $completed++;
        if ($this->announcements()->count() > 0) $completed++;
        if ($this->upcomingSchedules()->count() > 0) $completed++;
        if ($this->supportContacts()->count() > 0) $completed++;

        return ($completed / $total) * 100;
    }

    public function hasUpcomingDeadlines(): bool
    {
        return $this->assignments()
            ->where('deadline_date', '>', now())
            ->where('deadline_date', '<=', now()->addDays(7))
            ->exists();
    }

    public function getUrgentAnnouncementsAttribute()
    {
        return $this->announcements()
            ->whereIn('announcement_type', ['important', 'urgent'])
            ->orWhere('priority_level', 'critical')
            ->get();
    }
}
```

### 2.2 Related Models (Create similar structure for each)

**DigestForumDiscussion.php, DigestAssignment.php, DigestLearningMaterial.php, etc.**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DigestForumDiscussion extends Model
{
    protected $table = 'digest_forum_discussions';

    protected $fillable = [
        'digest_id',
        'topic_title',
        'topic_description',
        'mentari_forum_url',
        'total_posts',
        'total_participants',
        'key_points',
        'best_contributions',
        'discussion_date',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'discussion_date' => 'date',
    ];

    public function digest()
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }
}

// Similar structure for:
// - DigestAssignment
// - DigestLearningMaterial
// - DigestAnnouncement
// - DigestUpcomingSchedule
// - DigestSupportContact
```



---

## 📋 PART 3: CONTROLLER IMPLEMENTATION

### 3.1 Main Controller

**File: `app/Http/Controllers/Admin/WeeklyDigestController.php`**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WeeklyLearningDigest;
use App\Models\MataKuliah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WeeklyDigestController extends Controller
{
    public function index(Request $request)
    {
        $query = WeeklyLearningDigest::with(['mataKuliah.dosen', 'creator'])
            ->withCount([
                'forumDiscussions',
                'assignments',
                'learningMaterials',
                'announcements',
                'upcomingSchedules'
            ]);

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('mataKuliah', function($q) use ($search) {
                      $q->where('nama', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('course_id')) {
            $query->where('mata_kuliah_id', $request->course_id);
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->where('is_published', true);
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            }
        }

        if ($request->filled('week')) {
            $query->where('week_number', $request->week);
        }

        $digests = $query->latest()->paginate(15);

        // Stats
        $stats = [
            'total' => WeeklyLearningDigest::count(),
            'published' => WeeklyLearningDigest::where('is_published', true)->count(),
            'draft' => WeeklyLearningDigest::where('is_published', false)->count(),
            'current_week' => WeeklyLearningDigest::currentWeek()->count(),
        ];

        return Inertia::render('admin/weekly-digest/index', [
            'digests' => $digests,
            'courses' => MataKuliah::with('dosen')->get(),
            'stats' => $stats,
            'filters' => $request->only(['search', 'course_id', 'semester', 'status', 'week']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/weekly-digest/create', [
            'courses' => MataKuliah::with('dosen')->get(),
            'semesters' => $this->getAvailableSemesters(),
            'weeks' => range(1, 16),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Basic Info
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'class_label' => 'nullable|string|max:50',
            'week_number' => 'required|integer|min:1|max:16',
            'semester' => 'required|string|max:20',
            'week_start_date' => 'required|date',
            'week_end_date' => 'required|date|after:week_start_date',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'mentari_course_url' => 'nullable|url',
            'mentari_course_id' => 'nullable|string|max:100',
            
            // Forum Discussions
            'forum_discussions' => 'nullable|array',
            'forum_discussions.*.topic_title' => 'required|string|max:255',
            'forum_discussions.*.topic_description' => 'nullable|string',
            'forum_discussions.*.mentari_forum_url' => 'nullable|url',
            'forum_discussions.*.total_posts' => 'nullable|integer|min:0',
            'forum_discussions.*.total_participants' => 'nullable|integer|min:0',
            'forum_discussions.*.key_points' => 'nullable|string',
            'forum_discussions.*.best_contributions' => 'nullable|string',
            'forum_discussions.*.discussion_date' => 'nullable|date',
            
            // Assignments
            'assignments' => 'nullable|array',
            'assignments.*.assignment_title' => 'required|string|max:255',
            'assignments.*.assignment_description' => 'nullable|string',
            'assignments.*.assignment_type' => 'required|in:individual,group,quiz,project',
            'assignments.*.mentari_assignment_url' => 'nullable|url',
            'assignments.*.deadline_date' => 'required|date',
            'assignments.*.submission_start_date' => 'nullable|date',
            'assignments.*.max_score' => 'nullable|integer|min:0',
            'assignments.*.submission_format' => 'nullable|string',
            'assignments.*.file_size_limit' => 'nullable|string',
            'assignments.*.detailed_instructions' => 'nullable|string',
            'assignments.*.grading_criteria' => 'nullable|string',
            'assignments.*.is_mandatory' => 'boolean',
            'assignments.*.is_late_submission_allowed' => 'boolean',
            'assignments.*.late_penalty_percentage' => 'nullable|integer|min:0|max:100',
            
            // Learning Materials
            'learning_materials' => 'nullable|array',
            'learning_materials.*.material_title' => 'required|string|max:255',
            'learning_materials.*.material_description' => 'nullable|string',
            'learning_materials.*.material_type' => 'required|in:pdf,video,slide,document,link,other',
            'learning_materials.*.mentari_material_url' => 'nullable|url',
            'learning_materials.*.file_name' => 'nullable|string',
            'learning_materials.*.file_size' => 'nullable|string',
            'learning_materials.*.duration' => 'nullable|string',
            'learning_materials.*.topics_covered' => 'nullable|string',
            'learning_materials.*.learning_objectives' => 'nullable|string',
            'learning_materials.*.is_downloadable' => 'boolean',
            'learning_materials.*.requires_password' => 'boolean',
            'learning_materials.*.access_notes' => 'nullable|string',
            'learning_materials.*.upload_date' => 'nullable|date',
            
            // Announcements
            'announcements' => 'nullable|array',
            'announcements.*.announcement_title' => 'required|string|max:255',
            'announcements.*.announcement_content' => 'required|string',
            'announcements.*.announcement_type' => 'required|in:info,important,urgent,reminder',
            'announcements.*.priority_level' => 'required|in:low,normal,high,critical',
            'announcements.*.is_pinned' => 'boolean',
            'announcements.*.announced_date' => 'nullable|date',
            
            // Upcoming Schedules
            'upcoming_schedules' => 'nullable|array',
            'upcoming_schedules.*.event_title' => 'required|string|max:255',
            'upcoming_schedules.*.event_description' => 'nullable|string',
            'upcoming_schedules.*.event_type' => 'required|in:live_session,webinar,quiz,exam,deadline,meeting,other',
            'upcoming_schedules.*.event_date' => 'required|date',
            'upcoming_schedules.*.event_time' => 'nullable|date_format:H:i',
            'upcoming_schedules.*.duration_minutes' => 'nullable|integer|min:0',
            'upcoming_schedules.*.platform' => 'nullable|string',
            'upcoming_schedules.*.meeting_link' => 'nullable|url',
            'upcoming_schedules.*.meeting_id' => 'nullable|string',
            'upcoming_schedules.*.meeting_password' => 'nullable|string',
            'upcoming_schedules.*.is_mandatory' => 'boolean',
            'upcoming_schedules.*.max_participants' => 'nullable|integer|min:0',
            'upcoming_schedules.*.preparation_notes' => 'nullable|string',
            
            // Support Contacts
            'support_contacts' => 'nullable|array',
            'support_contacts.*.contact_name' => 'required|string|max:255',
            'support_contacts.*.contact_role' => 'nullable|string',
            'support_contacts.*.contact_type' => 'required|in:email,phone,whatsapp,telegram,other',
            'support_contacts.*.contact_value' => 'required|string',
            'support_contacts.*.available_hours' => 'nullable|string',
            'support_contacts.*.response_time' => 'nullable|string',
            'support_contacts.*.notes' => 'nullable|string',
            
            'is_published' => 'boolean',
        ]);

        try {
            \DB::beginTransaction();

            // Create main digest
            $validated['created_by'] = auth()->id();
            $digest = WeeklyLearningDigest::create($validated);

            // Create related items
            if (!empty($validated['forum_discussions'])) {
                foreach ($validated['forum_discussions'] as $index => $forum) {
                    $forum['display_order'] = $index;
                    $digest->forumDiscussions()->create($forum);
                }
            }

            if (!empty($validated['assignments'])) {
                foreach ($validated['assignments'] as $index => $assignment) {
                    $assignment['display_order'] = $index;
                    $digest->assignments()->create($assignment);
                }
            }

            if (!empty($validated['learning_materials'])) {
                foreach ($validated['learning_materials'] as $index => $material) {
                    $material['display_order'] = $index;
                    $digest->learningMaterials()->create($material);
                }
            }

            if (!empty($validated['announcements'])) {
                foreach ($validated['announcements'] as $index => $announcement) {
                    $announcement['display_order'] = $index;
                    $digest->announcements()->create($announcement);
                }
            }

            if (!empty($validated['upcoming_schedules'])) {
                foreach ($validated['upcoming_schedules'] as $index => $schedule) {
                    $schedule['display_order'] = $index;
                    $digest->upcomingSchedules()->create($schedule);
                }
            }

            if (!empty($validated['support_contacts'])) {
                foreach ($validated['support_contacts'] as $index => $contact) {
                    $contact['display_order'] = $index;
                    $digest->supportContacts()->create($contact);
                }
            }

            \DB::commit();

            return redirect()->route('admin.weekly-digest.index')
                ->with('success', 'Weekly Learning Digest berhasil dibuat!');

        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Failed to create weekly digest', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Gagal membuat digest: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show($id)
    {
        $digest = WeeklyLearningDigest::with([
            'mataKuliah.dosen',
            'creator',
            'forumDiscussions',
            'assignments',
            'learningMaterials',
            'announcements',
            'upcomingSchedules',
            'supportContacts',
        ])->findOrFail($id);

        return Inertia::render('admin/weekly-digest/show', [
            'digest' => $digest,
        ]);
    }

    public function update(Request $request, $id)
    {
        // Similar validation and logic as store()
        // ... (implement similar to store but with update logic)
    }

    public function destroy($id)
    {
        try {
            $digest = WeeklyLearningDigest::findOrFail($id);
            $digest->delete(); // Cascade will delete related items

            return back()->with('success', 'Weekly Learning Digest berhasil dihapus!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus digest: ' . $e->getMessage()]);
        }
    }

    public function publish($id)
    {
        $digest = WeeklyLearningDigest::findOrFail($id);
        
        $digest->update([
            'is_published' => !$digest->is_published,
            'published_at' => $digest->is_published ? null : now(),
        ]);

        $status = $digest->is_published ? 'published' : 'unpublished';
        return back()->with('success', "Digest berhasil {$status}!");
    }

    private function getAvailableSemesters(): array
    {
        $currentYear = now()->year;
        $nextYear = $currentYear + 1;
        
        return [
            "Ganjil {$currentYear}/{$nextYear}",
            "Genap {$currentYear}/{$nextYear}",
        ];
    }
}
```



---

## 📋 PART 4: ADVANCED MULTI-STEP FORM (Frontend)

### 4.1 Create/Edit Form Component

**File: `resources/js/pages/admin/weekly-digest/create.tsx`**

```tsx
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Save, Eye, Calendar, BookOpen, 
  MessageSquare, FileText, Bell, Clock, Users, Plus, Trash2,
  CheckCircle, AlertCircle, Info, Link as LinkIcon, Video,
  FileDown, Globe, Phone, Mail, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Course {
  id: number;
  nama: string;
  sks: number;
  dosen: { nama: string } | null;
}

interface CreatePageProps {
  courses: Course[];
  semesters: string[];
  weeks: number[];
}

// Step Configuration
const STEPS = [
  { id: 1, title: 'Informasi Dasar', icon: Info, color: 'from-blue-500 to-cyan-500' },
  { id: 2, title: 'Forum Diskusi', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
  { id: 3, title: 'Tugas/Assignment', icon: FileText, color: 'from-emerald-500 to-teal-500' },
  { id: 4, title: 'Materi Pembelajaran', icon: BookOpen, color: 'from-amber-500 to-orange-500' },
  { id: 5, title: 'Pengumuman', icon: Bell, color: 'from-rose-500 to-red-500' },
  { id: 6, title: 'Jadwal Mendatang', icon: Calendar, color: 'from-indigo-500 to-purple-500' },
  { id: 7, title: 'Kontak Support', icon: Users, color: 'from-teal-500 to-cyan-500' },
  { id: 8, title: 'Review & Publish', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
];

export default function CreateWeeklyDigest({ courses, semesters, weeks }: CreatePageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm({
    // Basic Info
    mata_kuliah_id: '',
    class_label: '',
    week_number: 1,
    semester: semesters[0] || '',
    week_start_date: '',
    week_end_date: '',
    title: '',
    description: '',
    mentari_course_url: '',
    mentari_course_id: '',
    
    // Forum Discussions
    forum_discussions: [] as any[],
    
    // Assignments
    assignments: [] as any[],
    
    // Learning Materials
    learning_materials: [] as any[],
    
    // Announcements
    announcements: [] as any[],
    
    // Upcoming Schedules
    upcoming_schedules: [] as any[],
    
    // Support Contacts
    support_contacts: [] as any[],
    
    is_published: false,
  });

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  const validateCurrentStep = (): boolean => {
    // Add validation logic for each step
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post('/admin/weekly-digest', {
      onSuccess: () => {
        // Success handling
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };

  return (
    <AppLayout>
      <Head title="Buat Weekly Learning Digest" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: '200% 200%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />

          <div className="relative">
            <motion.button
              onClick={() => router.get('/admin/weekly-digest')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Kembali</span>
            </motion.button>

            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Buat Weekly Learning Digest</h1>
                <p className="text-blue-100/80 mt-1">Rekapan Pembelajaran Daring Mentari UNPAM</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl"
        >
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);
              const isAccessible = step.id <= currentStep || completedSteps.includes(step.id - 1);

              return (
                <div key={step.id} className="flex items-center">
                  <motion.button
                    onClick={() => isAccessible && handleStepClick(step.id)}
                    disabled={!isAccessible}
                    className={`flex flex-col items-center gap-2 min-w-[100px] ${
                      isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                    whileHover={isAccessible ? { scale: 1.05 } : {}}
                    whileTap={isAccessible ? { scale: 0.95 } : {}}
                  >
                    <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
                      isActive
                        ? `bg-gradient-to-br ${step.color} shadow-lg scale-110`
                        : isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-md'
                        : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-8 w-8 text-white" />
                      ) : (
                        <Icon className={`h-8 w-8 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                      )}
                      
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-white/20"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className={`text-xs font-bold ${
                        isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'
                      }`}>
                        Step {step.id}
                      </p>
                      <p className={`text-[10px] ${
                        isActive ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </motion.button>

                  {index < STEPS.length - 1 && (
                    <div className={`h-0.5 w-12 mx-2 transition-colors ${
                      completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-8 shadow-lg backdrop-blur-xl"
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && <Step1BasicInfo form={form} courses={courses} semesters={semesters} weeks={weeks} />}
              
              {/* Step 2: Forum Discussions */}
              {currentStep === 2 && <Step2ForumDiscussions form={form} />}
              
              {/* Step 3: Assignments */}
              {currentStep === 3 && <Step3Assignments form={form} />}
              
              {/* Step 4: Learning Materials */}
              {currentStep === 4 && <Step4LearningMaterials form={form} />}
              
              {/* Step 5: Announcements */}
              {currentStep === 5 && <Step5Announcements form={form} />}
              
              {/* Step 6: Upcoming Schedules */}
              {currentStep === 6 && <Step6UpcomingSchedules form={form} />}
              
              {/* Step 7: Support Contacts */}
              {currentStep === 7 && <Step7SupportContacts form={form} />}
              
              {/* Step 8: Review & Publish */}
              {currentStep === 8 && <Step8Review form={form} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="rounded-xl px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>

            <div className="flex gap-3">
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.setData('is_published', false);
                      form.post('/admin/weekly-digest');
                    }}
                    className="rounded-xl px-6"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan sebagai Draft
                  </Button>
                  <Button
                    type="submit"
                    onClick={() => form.setData('is_published', true)}
                    className="rounded-xl px-6 bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Sekarang
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
```

Saya akan lanjutkan dengan implementasi setiap step form di message berikutnya karena sudah panjang. Apakah Anda ingin saya lanjutkan dengan detail setiap step form (Step1BasicInfo, Step2ForumDiscussions, dll)?


### 4.2 Step Components Implementation

**Step 1: Basic Information**

```tsx
// Component for Step 1
function Step1BasicInfo({ form, courses, semesters, weeks }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Info className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Informasi Dasar</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Isi informasi dasar digest mingguan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mata Kuliah */}
        <div>
          <Label htmlFor="mata_kuliah_id">Mata Kuliah *</Label>
          <Select
            value={form.data.mata_kuliah_id}
            onValueChange={(value) => form.setData('mata_kuliah_id', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Pilih mata kuliah" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course: any) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.nama} - {course.dosen?.nama || 'No Dosen'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.errors.mata_kuliah_id && (
            <p className="text-sm text-red-600 mt-1">{form.errors.mata_kuliah_id}</p>
          )}
        </div>

        {/* Class Label */}
        <div>
          <Label htmlFor="class_label">Kelas (Opsional)</Label>
          <Input
            id="class_label"
            value={form.data.class_label}
            onChange={(e) => form.setData('class_label', e.target.value)}
            placeholder="e.g., TI-6A"
            className="mt-2"
          />
        </div>

        {/* Week Number */}
        <div>
          <Label htmlFor="week_number">Minggu Ke- *</Label>
          <Select
            value={form.data.week_number.toString()}
            onValueChange={(value) => form.setData('week_number', parseInt(value))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week: number) => (
                <SelectItem key={week} value={week.toString()}>
                  Minggu {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}
        <div>
          <Label htmlFor="semester">Semester *</Label>
          <Select
            value={form.data.semester}
            onValueChange={(value) => form.setData('semester', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester: string) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Week Start Date */}
        <div>
          <Label htmlFor="week_start_date">Tanggal Mulai *</Label>
          <Input
            id="week_start_date"
            type="date"
            value={form.data.week_start_date}
            onChange={(e) => form.setData('week_start_date', e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Week End Date */}
        <div>
          <Label htmlFor="week_end_date">Tanggal Selesai *</Label>
          <Input
            id="week_end_date"
            type="date"
            value={form.data.week_end_date}
            onChange={(e) => form.setData('week_end_date', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Judul Digest *</Label>
        <Input
          id="title"
          value={form.data.title}
          onChange={(e) => form.setData('title', e.target.value)}
          placeholder="e.g., Rekapan Pembelajaran Minggu 1"
          className="mt-2"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={form.data.description}
          onChange={(e) => form.setData('description', e.target.value)}
          placeholder="Deskripsi singkat tentang digest ini..."
          rows={4}
          className="mt-2"
        />
      </div>

      {/* Mentari Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="mentari_course_url">URL Course Mentari</Label>
          <Input
            id="mentari_course_url"
            type="url"
            value={form.data.mentari_course_url}
            onChange={(e) => form.setData('mentari_course_url', e.target.value)}
            placeholder="https://mentari.unpam.ac.id/..."
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="mentari_course_id">ID Course Mentari</Label>
          <Input
            id="mentari_course_id"
            value={form.data.mentari_course_id}
            onChange={(e) => form.setData('mentari_course_id', e.target.value)}
            placeholder="e.g., 12345"
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
```

Karena implementasi lengkap untuk semua 8 steps akan sangat panjang, saya akan membuat file terpisah yang fokus pada view mahasiswa yang lebih penting. Apakah Anda setuju saya buat file baru untuk:

1. **View Mahasiswa untuk Weekly Learning Digest** - Halaman untuk mahasiswa melihat digest yang sudah dipublish
2. Melanjutkan implementasi step-step form di file yang sudah ada

Atau Anda ingin saya lanjutkan semua step form dulu di file ini?



### 4.2 Step Components Implementation

**Step 1: Basic Information**

```tsx
// Component for Step 1
function Step1BasicInfo({ form, courses, semesters, weeks }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Info className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Informasi Dasar</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Isi informasi dasar digest mingguan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mata Kuliah */}
        <div>
          <Label htmlFor="mata_kuliah_id">Mata Kuliah *</Label>
          <Select
            value={form.data.mata_kuliah_id}
            onValueChange={(value) => form.setData('mata_kuliah_id', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Pilih mata kuliah" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course: any) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.nama} - {course.dosen?.nama || 'No Dosen'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.errors.mata_kuliah_id && (
            <p className="text-sm text-red-600 mt-1">{form.errors.mata_kuliah_id}</p>
          )}
        </div>

        {/* Class Label */}
        <div>
          <Label htmlFor="class_label">Label Kelas</Label>
          <Input
            id="class_label"
            value={form.data.class_label}
            onChange={(e) => form.setData('class_label', e.target.value)}
            placeholder="e.g., TI-6A"
            className="mt-2"
          />
        </div>

        {/* Week Number */}
        <div>
          <Label htmlFor="week_number">Minggu Ke- *</Label>
          <Select
            value={form.data.week_number.toString()}
            onValueChange={(value) => form.setData('week_number', parseInt(value))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week: number) => (
                <SelectItem key={week} value={week.toString()}>
                  Minggu {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}
        <div>
          <Label htmlFor="semester">Semester *</Label>
          <Select
            value={form.data.semester}
            onValueChange={(value) => form.setData('semester', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester: string) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Week Start Date */}
        <div>
          <Label htmlFor="week_start_date">Tanggal Mulai *</Label>
          <Input
            id="week_start_date"
            type="date"
            value={form.data.week_start_date}
            onChange={(e) => form.setData('week_start_date', e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Week End Date */}
        <div>
          <Label htmlFor="week_end_date">Tanggal Selesai *</Label>
          <Input
            id="week_end_date"
            type="date"
            value={form.data.week_end_date}
            onChange={(e) => form.setData('week_end_date', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Judul Digest *</Label>
        <Input
          id="title"
          value={form.data.title}
          onChange={(e) => form.setData('title', e.target.value)}
          placeholder="e.g., Weekly Digest - Minggu 1"
          className="mt-2"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={form.data.description}
          onChange={(e) => form.setData('description', e.target.value)}
          placeholder="Deskripsi singkat tentang digest ini..."
          rows={4}
          className="mt-2"
        />
      </div>

      {/* Mentari Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="mentari_course_url">URL Course Mentari</Label>
          <Input
            id="mentari_course_url"
            type="url"
            value={form.data.mentari_course_url}
            onChange={(e) => form.setData('mentari_course_url', e.target.value)}
            placeholder="https://mentari.unpam.ac.id/..."
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="mentari_course_id">ID Course Mentari</Label>
          <Input
            id="mentari_course_id"
            value={form.data.mentari_course_id}
            onChange={(e) => form.setData('mentari_course_id', e.target.value)}
            placeholder="Course ID"
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Forum Discussions**

```tsx
function Step2ForumDiscussions({ form }: any) {
  const addForum = () => {
    form.setData('forum_discussions', [
      ...form.data.forum_discussions,
      {
        topic_title: '',
        topic_description: '',
        mentari_forum_url: '',
        total_posts: 0,
        total_participants: 0,
        key_points: '',
        best_contributions: '',
        discussion_date: '',
      }
    ]);
  };

  const removeForum = (index: number) => {
    const updated = form.data.forum_discussions.filter((_: any, i: number) => i !== index);
    form.setData('forum_discussions', updated);
  };

  const updateForum = (index: number, field: string, value: any) => {
    const updated = [...form.data.forum_discussions];
    updated[index][field] = value;
    form.setData('forum_discussions', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Forum Diskusi</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Tambahkan topik diskusi yang berlangsung minggu ini
            </p>
          </div>
        </div>

        <Button type="button" onClick={addForum} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Forum
        </Button>
      </div>

      {form.data.forum_discussions.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
          <MessageSquare className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Belum ada forum diskusi ditambahkan
          </p>
          <Button type="button" onClick={addForum} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Forum Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {form.data.forum_discussions.map((forum: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Forum #{index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeForum(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Judul Topik *</Label>
                  <Input
                    value={forum.topic_title}
                    onChange={(e) => updateForum(index, 'topic_title', e.target.value)}
                    placeholder="Judul topik diskusi"
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Deskripsi Topik</Label>
                  <Textarea
                    value={forum.topic_description}
                    onChange={(e) => updateForum(index, 'topic_description', e.target.value)}
                    placeholder="Deskripsi singkat topik"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>URL Forum Mentari</Label>
                  <Input
                    type="url"
                    value={forum.mentari_forum_url}
                    onChange={(e) => updateForum(index, 'mentari_forum_url', e.target.value)}
                    placeholder="https://mentari.unpam.ac.id/..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Total Posts</Label>
                  <Input
                    type="number"
                    value={forum.total_posts}
                    onChange={(e) => updateForum(index, 'total_posts', parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Total Partisipan</Label>
                  <Input
                    type="number"
                    value={forum.total_participants}
                    onChange={(e) => updateForum(index, 'total_participants', parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Poin-Poin Penting</Label>
                  <Textarea
                    value={forum.key_points}
                    onChange={(e) => updateForum(index, 'key_points', e.target.value)}
                    placeholder="Ringkasan poin penting dari diskusi..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Kontribusi Terbaik</Label>
                  <Textarea
                    value={forum.best_contributions}
                    onChange={(e) => updateForum(index, 'best_contributions', e.target.value)}
                    placeholder="Highlight kontribusi mahasiswa terbaik..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Tanggal Diskusi</Label>
                  <Input
                    type="date"
                    value={forum.discussion_date}
                    onChange={(e) => updateForum(index, 'discussion_date', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
```

Karena implementasi lengkap semua step akan sangat panjang, saya akan lanjutkan dengan membuat view untuk mahasiswa yang lebih penting. Apakah Anda setuju saya fokus ke view mahasiswa dulu, atau Anda ingin saya selesaikan semua 8 step form terlebih dahulu?



---

## 📋 PART 5: MAHASISWA VIEW (READ-ONLY)

### 5.1 Controller for Mahasiswa

**File: `app/Http/Controllers/User/WeeklyDigestController.php`**

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WeeklyLearningDigest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class WeeklyDigestController extends Controller
{
    public function index(Request $request)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('login');
        }

        // Get mahasiswa's enrolled courses
        $enrolledCourses = $mahasiswa->enrollments()->pluck('mata_kuliah_id');

        $query = WeeklyLearningDigest::with(['mataKuliah.dosen'])
            ->where('is_published', true)
            ->whereIn('mata_kuliah_id', $enrolledCourses)
            ->withCount([
                'forumDiscussions',
                'assignments',
                'learningMaterials',
                'announcements',
                'upcomingSchedules'
            ]);

        // Filters
        if ($request->filled('course_id')) {
            $query->where('mata_kuliah_id', $request->course_id);
        }

        if ($request->filled('week')) {
            $query->where('week_number', $request->week);
        }

        $digests = $query->latest('week_start_date')->paginate(12);

        // Get current week digest
        $currentWeekDigest = WeeklyLearningDigest::published()
            ->currentWeek()
            ->whereIn('mata_kuliah_id', $enrolledCourses)
            ->first();

        return Inertia::render('user/weekly-digest/index', [
            'digests' => $digests,
            'currentWeekDigest' => $currentWeekDigest,
            'enrolledCourses' => $mahasiswa->enrollments()->with('mataKuliah')->get(),
            'filters' => $request->only(['course_id', 'week']),
        ]);
    }

    public function show($id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('login');
        }

        $digest = WeeklyLearningDigest::with([
            'mataKuliah.dosen',
            'forumDiscussions' => function($query) {
                $query->where('is_active', true)->orderBy('display_order');
            },
            'assignments' => function($query) {
                $query->orderBy('deadline_date', 'asc');
            },
            'learningMaterials' => function($query) {
                $query->orderBy('display_order');
            },
            'announcements' => function($query) {
                $query->orderBy('priority_level', 'desc')
                      ->orderBy('display_order');
            },
            'upcomingSchedules' => function($query) {
                $query->where('event_date', '>=', now())
                      ->orderBy('event_date', 'asc');
            },
            'supportContacts' => function($query) {
                $query->orderBy('display_order');
            },
        ])->findOrFail($id);

        // Check if mahasiswa is enrolled in this course
        $isEnrolled = $mahasiswa->enrollments()
            ->where('mata_kuliah_id', $digest->mata_kuliah_id)
            ->exists();

        if (!$isEnrolled) {
            abort(403, 'Anda tidak terdaftar di mata kuliah ini');
        }

        // Get related digests (same course, different weeks)
        $relatedDigests = WeeklyLearningDigest::where('mata_kuliah_id', $digest->mata_kuliah_id)
            ->where('id', '!=', $digest->id)
            ->where('is_published', true)
            ->orderBy('week_number', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('user/weekly-digest/show', [
            'digest' => $digest,
            'relatedDigests' => $relatedDigests,
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
        ]);
    }
}
```

### 5.2 Mahasiswa View Component

**File: `resources/js/pages/user/weekly-digest/show.tsx`**

```tsx
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    ArrowLeft, ExternalLink, Download, Share2, Bookmark, Calendar,
    BookOpen, MessageSquare, FileText, Bell, Clock, Users, MapPin,
    Video, FileDown, Link as LinkIcon, Phone, Mail, AlertTriangle,
    CheckCircle, Info, Award, Sparkles, TrendingUp, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Import icons - MATCHING DASHBOARD MAHASISWA
import DigestIcon from '@/assets/mahasiswa/akademik/akademik.png';
import WeekIcon from '@/assets/admin/dashboard/total-icon.png';
import CourseIcon from '@/assets/admin/dashboard/hadir-icon.png';
import ItemsIcon from '@/assets/admin/dashboard/selfie-icon.png';

interface Digest {
    id: number;
    title: string;
    description: string;
    week_number: number;
    semester: string;
    week_start_date: string;
    week_end_date: string;
    mentari_course_url: string | null;
    mata_kuliah: {
        id: number;
        nama: string;
        dosen: { nama: string };
    };
    forum_discussions: ForumDiscussion[];
    assignments: Assignment[];
    learning_materials: LearningMaterial[];
    announcements: Announcement[];
    upcoming_schedules: UpcomingSchedule[];
    support_contacts: SupportContact[];
}

interface ForumDiscussion {
    id: number;
    topic_title: string;
    topic_description: string;
    mentari_forum_url: string | null;
    total_posts: number;
    total_participants: number;
    key_points: string | null;
    best_contributions: string | null;
    discussion_date: string | null;
}

interface Assignment {
    id: number;
    assignment_title: string;
    assignment_description: string;
    assignment_type: string;
    mentari_assignment_url: string | null;
    deadline_date: string;
    max_score: number;
    submission_format: string | null;
    detailed_instructions: string | null;
    is_mandatory: boolean;
}

interface LearningMaterial {
    id: number;
    material_title: string;
    material_description: string;
    material_type: string;
    mentari_material_url: string | null;
    file_size: string | null;
    duration: string | null;
    topics_covered: string | null;
    is_downloadable: boolean;
}

interface Announcement {
    id: number;
    announcement_title: string;
    announcement_content: string;
    announcement_type: string;
    priority_level: string;
    is_pinned: boolean;
    announced_date: string | null;
}

interface UpcomingSchedule {
    id: number;
    event_title: string;
    event_description: string;
    event_type: string;
    event_date: string;
    event_time: string | null;
    platform: string | null;
    meeting_link: string | null;
    is_mandatory: boolean;
}

interface SupportContact {
    id: number;
    contact_name: string;
    contact_role: string;
    contact_type: string;
    contact_value: string;
    available_hours: string | null;
}

interface ShowPageProps {
    digest: Digest;
    relatedDigests: any[];
    mahasiswa: {
        id: number;
        nama: string;
        nim: string;
    };
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
} as const;

export default function WeeklyDigestShow({ digest, relatedDigests, mahasiswa }: ShowPageProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaved, setIsSaved] = useState(false);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDeadlineStatus = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Terlewat', color: 'red' };
        if (diffDays === 0) return { label: 'Hari Ini', color: 'orange' };
        if (diffDays <= 3) return { label: `${diffDays} Hari Lagi`, color: 'amber' };
        return { label: `${diffDays} Hari Lagi`, color: 'emerald' };
    };

    const materialTypeIcons = {
        pdf: FileText,
        video: Video,
        slide: FileDown,
        document: FileText,
        link: LinkIcon,
        other: FileText,
    };

    const totalItems = 
        digest.forum_discussions.length +
        digest.assignments.length +
        digest.learning_materials.length +
        digest.announcements.length +
        digest.upcoming_schedules.length;

    return (
        <StudentLayout>
            <Head title={`${digest.title} - Weekly Digest`} />

            <motion.div
                className="p-4 md:p-6 lg:p-8 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ═══════ HEADER - MATCHING DASHBOARD ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        {/* Icon Header - NO CONTAINER */}
                        <img 
                            src={DigestIcon} 
                            alt="Weekly Digest" 
                            className="h-10 w-10 md:h-12 md:w-12 object-contain"
                        />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                                Weekly Learning Digest
                            </h1>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                Rekapan Pembelajaran Minggu Ini
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('user.weekly-digest.index'))}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setIsSaved(!isSaved)}
                            className={isSaved ? 'text-amber-600 border-amber-600' : ''}
                        >
                            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                        </Button>

                        <Button variant="outline">
                            <Share2 className="h-4 w-4" />
                        </Button>

                        <Button variant="outline">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>

                {/* ═══════ INFO CARDS - MATCHING DASHBOARD ═══════ */}
                <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {[
                        { 
                            label: 'Minggu Ke', 
                            value: digest.week_number, 
                            icon: WeekIcon,
                            gradient: 'from-blue-500 to-cyan-500',
                            subtext: digest.semester
                        },
                        { 
                            label: 'Mata Kuliah', 
                            value: digest.mata_kuliah.nama.substring(0, 20) + '...', 
                            icon: CourseIcon,
                            gradient: 'from-emerald-500 to-teal-500',
                            subtext: digest.mata_kuliah.dosen.nama
                        },
                        { 
                            label: 'Total Item', 
                            value: totalItems, 
                            icon: ItemsIcon,
                            gradient: 'from-purple-500 to-pink-500',
                            subtext: 'Konten tersedia'
                        },
                        { 
                            label: 'Periode', 
                            value: `${new Date(digest.week_start_date).getDate()} - ${new Date(digest.week_end_date).getDate()}`,
                            icon: DigestIcon,
                            gradient: 'from-amber-500 to-orange-500',
                            subtext: new Date(digest.week_start_date).toLocaleDateString('id-ID', { month: 'short' })
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <img 
                                        src={stat.icon} 
                                        alt={stat.label}
                                        className="h-8 w-8 object-contain opacity-80"
                                    />
                                </div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-neutral-500 mt-2">
                                    {stat.subtext}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

Saya akan lanjutkan implementasi view mahasiswa di message berikutnya. Apakah format ini sudah sesuai dengan yang Anda inginkan?

