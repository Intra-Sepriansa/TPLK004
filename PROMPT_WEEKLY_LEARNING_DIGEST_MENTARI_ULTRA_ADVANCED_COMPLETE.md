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