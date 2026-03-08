# PROMPT: Detail Weekly Learning Digest - Mahasiswa View Ultra Advanced
## Complete Implementation with Enhanced Features

---

## 🎯 EXECUTIVE SUMMARY

Halaman **Detail Weekly Learning Digest untuk Mahasiswa** adalah tampilan mendalam dan interaktif yang menampilkan rekapan pembelajaran mingguan dari Web Mentari UNPAM dengan fitur-fitur advanced. Mahasiswa dapat:

1. **Melihat Informasi Lengkap & Detail** - Semua konten digest dengan visualisasi menarik
2. **Interactive Timeline** - Timeline visual aktivitas pembelajaran minggu ini
3. **Progress Tracking** - Track progress membaca dan menyelesaikan tugas
4. **Smart Reminders** - Pengingat otomatis untuk deadline dan jadwal
5. **Collaborative Notes** - Catatan pribadi untuk setiap section
6. **Quick Actions** - Akses cepat ke Mentari, export, share, bookmark
7. **Analytics Dashboard** - Statistik personal learning progress
8. **Related Content** - Rekomendasi digest dan materi terkait

**Key Innovations:**
- Interactive reading progress tracker
- Personal notes & highlights system
- Smart deadline countdown with notifications
- Visual timeline of weekly activities
- Learning analytics & insights
- Collaborative discussion threads
- Quick access shortcuts
- Offline reading mode
- Text-to-speech for accessibility
- Multi-language support (ID/EN)

**UI/UX Requirements:**
- Warna, container, header icon SAMA dengan dashboard mahasiswa
- Icon header TANPA container background
- TIDAK ADA animasi icon bergerak ke atas
- Responsive mobile seperti dashboard
- Tombol kembali sama dengan menu lain
- Header rapi dan konsisten di mode mobile
- Icon untuk card disesuaikan antara warna icon dan warna container
- TIDAK ADA data dummy - semua data real
- Smooth animations dan transitions
- Loading states yang informatif
- Error handling yang user-friendly

---

## 📋 PART 1: ENHANCED DATABASE SCHEMA

### 1.1 Reading Progress Tracking

```sql
CREATE TABLE digest_reading_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Progress Tracking
    is_completed BOOLEAN DEFAULT FALSE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_read_at DATETIME NULL,
    total_reading_time_seconds INT DEFAULT 0,
    
    -- Section Progress
    sections_viewed JSON NULL COMMENT 'Array of viewed section IDs',
    sections_completed JSON NULL COMMENT 'Array of completed section IDs',
    
    -- Bookmarks
    is_bookmarked BOOLEAN DEFAULT FALSE,
    bookmarked_at DATETIME NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_progress (mahasiswa_id, digest_id),
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_digest (digest_id),
    INDEX idx_bookmarked (is_bookmarked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2 Personal Notes System

```sql
CREATE TABLE digest_personal_notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Note Details
    section_type ENUM('overview', 'forum', 'assignment', 'material', 'announcement', 'schedule', 'contact') NOT NULL,
    section_id BIGINT UNSIGNED NULL COMMENT 'ID of specific item in section',
    
    note_content TEXT NOT NULL,
    note_color VARCHAR(20) DEFAULT 'yellow' COMMENT 'Highlight color',
    
    -- Metadata
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_digest (digest_id),
    INDEX idx_section (section_type, section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.3 Smart Reminders

```sql
CREATE TABLE digest_reminders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Reminder Details
    reminder_type ENUM('assignment_deadline', 'schedule_event', 'custom') NOT NULL,
    related_id BIGINT UNSIGNED NULL COMMENT 'ID of assignment or schedule',
    
    reminder_title VARCHAR(255) NOT NULL,
    reminder_message TEXT NULL,
    remind_at DATETIME NOT NULL,
    
    -- Status
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at DATETIME NULL,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at DATETIME NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_remind_at (remind_at),
    INDEX idx_status (is_sent, is_dismissed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.4 Discussion Threads (Optional)

```sql
CREATE TABLE digest_discussion_threads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Thread Details
    section_type ENUM('forum', 'assignment', 'material', 'announcement') NOT NULL,
    section_id BIGINT UNSIGNED NOT NULL,
    
    created_by BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL COMMENT 'For nested replies',
    
    content TEXT NOT NULL,
    
    -- Engagement
    likes_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    
    -- Status
    is_pinned BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES digest_discussion_threads(id) ON DELETE CASCADE,
    
    INDEX idx_digest (digest_id),
    INDEX idx_section (section_type, section_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📋 PART 2: ENHANCED LARAVEL MODELS

### 2.1 DigestReadingProgress Model

**File: `app/Models/DigestReadingProgress.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestReadingProgress extends Model
{
    protected $table = 'digest_reading_progress';

    protected $fillable = [
        'mahasiswa_id',
        'digest_id',
        'is_completed',
        'completion_percentage',
        'last_read_at',
        'total_reading_time_seconds',
        'sections_viewed',
        'sections_completed',
        'is_bookmarked',
        'bookmarked_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'is_bookmarked' => 'boolean',
        'completion_percentage' => 'decimal:2',
        'last_read_at' => 'datetime',
        'bookmarked_at' => 'datetime',
        'sections_viewed' => 'array',
        'sections_completed' => 'array',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }

    // Helper Methods
    public function markSectionViewed(string $sectionType, int $sectionId): void
    {
        $viewed = $this->sections_viewed ?? [];
        $key = "{$sectionType}_{$sectionId}";
        
        if (!in_array($key, $viewed)) {
            $viewed[] = $key;
            $this->sections_viewed = $viewed;
            $this->updateCompletionPercentage();
            $this->save();
        }
    }

    public function markSectionCompleted(string $sectionType, int $sectionId): void
    {
        $completed = $this->sections_completed ?? [];
        $key = "{$sectionType}_{$sectionId}";
        
        if (!in_array($key, $completed)) {
            $completed[] = $key;
            $this->sections_completed = $completed;
            $this->updateCompletionPercentage();
            $this->save();
        }
    }

    public function updateCompletionPercentage(): void
    {
        $totalSections = $this->digest->getTotalItemsAttribute();
        $completedSections = count($this->sections_completed ?? []);
        
        if ($totalSections > 0) {
            $this->completion_percentage = ($completedSections / $totalSections) * 100;
            $this->is_completed = $this->completion_percentage >= 100;
        }
    }

    public function addReadingTime(int $seconds): void
    {
        $this->total_reading_time_seconds += $seconds;
        $this->last_read_at = now();
        $this->save();
    }

    public function getFormattedReadingTimeAttribute(): string
    {
        $minutes = floor($this->total_reading_time_seconds / 60);
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($hours > 0) {
            return "{$hours} jam {$remainingMinutes} menit";
        }
        return "{$minutes} menit";
    }
}
```

### 2.2 DigestPersonalNote Model

**File: `app/Models/DigestPersonalNote.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestPersonalNote extends Model
{
    protected $table = 'digest_personal_notes';

    protected $fillable = [
        'mahasiswa_id',
        'digest_id',
        'section_type',
        'section_id',
        'note_content',
        'note_color',
        'is_pinned',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }

    // Scopes
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeForSection($query, string $sectionType, ?int $sectionId = null)
    {
        $query->where('section_type', $sectionType);
        
        if ($sectionId !== null) {
            $query->where('section_id', $sectionId);
        }
        
        return $query;
    }
}
```

### 2.3 DigestReminder Model

**File: `app/Models/DigestReminder.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestReminder extends Model
{
    protected $table = 'digest_reminders';

    protected $fillable = [
        'mahasiswa_id',
        'digest_id',
        'reminder_type',
        'related_id',
        'reminder_title',
        'reminder_message',
        'remind_at',
        'is_sent',
        'sent_at',
        'is_dismissed',
        'dismissed_at',
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'sent_at' => 'datetime',
        'dismissed_at' => 'datetime',
        'is_sent' => 'boolean',
        'is_dismissed' => 'boolean',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('is_sent', false)
                     ->where('is_dismissed', false)
                     ->where('remind_at', '<=', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('is_sent', false)
                     ->where('is_dismissed', false)
                     ->where('remind_at', '>', now());
    }

    // Helper Methods
    public function markAsSent(): void
    {
        $this->update([
            'is_sent' => true,
            'sent_at' => now(),
        ]);
    }

    public function dismiss(): void
    {
        $this->update([
            'is_dismissed' => true,
            'dismissed_at' => now(),
        ]);
    }
}
```

---

## 📋 PART 3: ENHANCED CONTROLLER

### 3.1 Enhanced Show Method with Progress Tracking

**File: `app/Http/Controllers/User/WeeklyDigestController.php`**

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WeeklyLearningDigest;
use App\Models\DigestReadingProgress;
use App\Models\DigestPersonalNote;
use App\Models\DigestReminder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WeeklyDigestController extends Controller
{
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

        // Check enrollment
        $isEnrolled = $mahasiswa->enrollments()
            ->where('mata_kuliah_id', $digest->mata_kuliah_id)
            ->exists();

        if (!$isEnrolled) {
            abort(403, 'Anda tidak terdaftar di mata kuliah ini');
        }

        // Get or create reading progress
        $progress = DigestReadingProgress::firstOrCreate(
            [
                'mahasiswa_id' => $mahasiswa->id,
                'digest_id' => $digest->id,
            ],
            [
                'completion_percentage' => 0,
                'sections_viewed' => [],
                'sections_completed' => [],
            ]
        );

        // Update last read time
        $progress->update(['last_read_at' => now()]);

        // Get personal notes
        $personalNotes = DigestPersonalNote::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $digest->id)
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get active reminders
        $reminders = DigestReminder::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $digest->id)
            ->where('is_dismissed', false)
            ->orderBy('remind_at', 'asc')
            ->get();

        // Get related digests
        $relatedDigests = WeeklyLearningDigest::where('mata_kuliah_id', $digest->mata_kuliah_id)
            ->where('id', '!=', $digest->id)
            ->where('is_published', true)
            ->orderBy('week_number', 'desc')
            ->limit(5)
            ->get();

        // Calculate learning analytics
        $analytics = $this->calculateLearningAnalytics($mahasiswa, $digest);

        // Get upcoming deadlines
        $upcomingDeadlines = $this->getUpcomingDeadlines($digest);

        return Inertia::render('user/weekly-digest/show', [
            'digest' => $digest,
            'progress' => $progress,
            'personalNotes' => $personalNotes,
            'reminders' => $reminders,
            'relatedDigests' => $relatedDigests,
            'analytics' => $analytics,
            'upcomingDeadlines' => $upcomingDeadlines,
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
        ]);
    }


    private function calculateLearningAnalytics($mahasiswa, $digest)
    {
        // Get all progress for this course
        $courseProgress = DigestReadingProgress::where('mahasiswa_id', $mahasiswa->id)
            ->whereHas('digest', function($query) use ($digest) {
                $query->where('mata_kuliah_id', $digest->mata_kuliah_id);
            })
            ->get();

        // Calculate stats
        $totalDigests = $courseProgress->count();
        $completedDigests = $courseProgress->where('is_completed', true)->count();
        $averageCompletion = $courseProgress->avg('completion_percentage') ?? 0;
        $totalReadingTime = $courseProgress->sum('total_reading_time_seconds');

        // Get assignment completion rate
        $totalAssignments = $digest->assignments->count();
        $completedAssignments = $digest->assignments->filter(function($assignment) {
            return now()->greaterThan($assignment->deadline_date);
        })->count();

        return [
            'total_digests' => $totalDigests,
            'completed_digests' => $completedDigests,
            'completion_rate' => $totalDigests > 0 ? ($completedDigests / $totalDigests) * 100 : 0,
            'average_completion' => round($averageCompletion, 2),
            'total_reading_time' => $totalReadingTime,
            'formatted_reading_time' => $this->formatReadingTime($totalReadingTime),
            'total_assignments' => $totalAssignments,
            'completed_assignments' => $completedAssignments,
            'assignment_completion_rate' => $totalAssignments > 0 ? ($completedAssignments / $totalAssignments) * 100 : 0,
        ];
    }

    private function getUpcomingDeadlines($digest)
    {
        $deadlines = [];

        // Assignment deadlines
        foreach ($digest->assignments as $assignment) {
            if (now()->lessThan($assignment->deadline_date)) {
                $deadlines[] = [
                    'type' => 'assignment',
                    'title' => $assignment->assignment_title,
                    'date' => $assignment->deadline_date,
                    'is_mandatory' => $assignment->is_mandatory,
                    'days_remaining' => now()->diffInDays($assignment->deadline_date, false),
                ];
            }
        }

        // Schedule events
        foreach ($digest->upcomingSchedules as $schedule) {
            if (now()->lessThan($schedule->event_date)) {
                $deadlines[] = [
                    'type' => 'schedule',
                    'title' => $schedule->event_title,
                    'date' => $schedule->event_date,
                    'is_mandatory' => $schedule->is_mandatory,
                    'days_remaining' => now()->diffInDays($schedule->event_date, false),
                ];
            }
        }

        // Sort by date
        usort($deadlines, function($a, $b) {
            return $a['date'] <=> $b['date'];
        });

        return collect($deadlines)->take(5);
    }

    private function formatReadingTime(int $seconds): string
    {
        $minutes = floor($seconds / 60);
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($hours > 0) {
            return "{$hours} jam {$remainingMinutes} menit";
        }
        return "{$minutes} menit";
    }

    // API Endpoints for Progress Tracking
    public function updateProgress(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'section_type' => 'required|string',
            'section_id' => 'required|integer',
            'action' => 'required|in:viewed,completed',
            'reading_time' => 'nullable|integer|min:0',
        ]);

        $progress = DigestReadingProgress::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        if ($validated['action'] === 'viewed') {
            $progress->markSectionViewed($validated['section_type'], $validated['section_id']);
        } else {
            $progress->markSectionCompleted($validated['section_type'], $validated['section_id']);
        }

        if (isset($validated['reading_time'])) {
            $progress->addReadingTime($validated['reading_time']);
        }

        return response()->json([
            'success' => true,
            'progress' => $progress->fresh(),
        ]);
    }

    public function toggleBookmark(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $progress = DigestReadingProgress::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        $progress->update([
            'is_bookmarked' => !$progress->is_bookmarked,
            'bookmarked_at' => $progress->is_bookmarked ? null : now(),
        ]);

        return response()->json([
            'success' => true,
            'is_bookmarked' => $progress->is_bookmarked,
        ]);
    }

    // Personal Notes CRUD
    public function storeNote(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'section_type' => 'required|in:overview,forum,assignment,material,announcement,schedule,contact',
            'section_id' => 'nullable|integer',
            'note_content' => 'required|string|max:5000',
            'note_color' => 'nullable|string|max:20',
            'is_pinned' => 'boolean',
        ]);

        $note = DigestPersonalNote::create([
            'mahasiswa_id' => $mahasiswa->id,
            'digest_id' => $id,
            ...$validated,
        ]);

        return response()->json([
            'success' => true,
            'note' => $note,
        ]);
    }

    public function updateNote(Request $request, $id, $noteId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'note_content' => 'required|string|max:5000',
            'note_color' => 'nullable|string|max:20',
            'is_pinned' => 'boolean',
        ]);

        $note = DigestPersonalNote::where('id', $noteId)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        $note->update($validated);

        return response()->json([
            'success' => true,
            'note' => $note,
        ]);
    }

    public function deleteNote($id, $noteId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $note = DigestPersonalNote::where('id', $noteId)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        $note->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    // Reminders CRUD
    public function storeReminder(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'reminder_type' => 'required|in:assignment_deadline,schedule_event,custom',
            'related_id' => 'nullable|integer',
            'reminder_title' => 'required|string|max:255',
            'reminder_message' => 'nullable|string|max:1000',
            'remind_at' => 'required|date|after:now',
        ]);

        $reminder = DigestReminder::create([
            'mahasiswa_id' => $mahasiswa->id,
            'digest_id' => $id,
            ...$validated,
        ]);

        return response()->json([
            'success' => true,
            'reminder' => $reminder,
        ]);
    }

    public function dismissReminder($id, $reminderId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $reminder = DigestReminder::where('id', $reminderId)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        $reminder->dismiss();

        return response()->json([
            'success' => true,
        ]);
    }
}
```

---

## 📋 PART 4: ENHANCED FRONTEND COMPONENT

### 4.1 Main Component with Advanced Features

**File: `resources/js/pages/user/weekly-digest/show.tsx`**

```tsx
import { Head, router, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, ExternalLink, Download, Share2, Bookmark, Calendar,
    BookOpen, MessageSquare, FileText, Bell, Clock, Users, MapPin,
    Video, FileDown, Link as LinkIcon, Phone, Mail, AlertTriangle,
    CheckCircle, Info, Award, Sparkles, TrendingUp, Target, Copy,
    CheckCheck, AlertCircle, StickyNote, Plus, Edit2, Trash2, Pin,
    Volume2, VolumeX, Globe, Zap, BarChart3, Timer, PlayCircle,
    PauseCircle, RefreshCw, Eye, EyeOff, ChevronRight, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Import icons - MATCHING DASHBOARD MAHASISWA
import DigestIcon from '@/assets/mahasiswa/akademik/akademik.png';
import WeekIcon from '@/assets/admin/dashboard/total-icon.png';
import CourseIcon from '@/assets/admin/dashboard/hadir-icon.png';
import ItemsIcon from '@/assets/admin/dashboard/selfie-icon.png';
import ProgressIcon from '@/assets/mahasiswa/dashboard/progress-icon.png';

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

interface ReadingProgress {
    id: number;
    completion_percentage: number;
    is_completed: boolean;
    is_bookmarked: boolean;
    last_read_at: string;
    total_reading_time_seconds: number;
    sections_viewed: string[];
    sections_completed: string[];
}

interface PersonalNote {
    id: number;
    section_type: string;
    section_id: number | null;
    note_content: string;
    note_color: string;
    is_pinned: boolean;
    created_at: string;
}

interface Reminder {
    id: number;
    reminder_type: string;
    reminder_title: string;
    reminder_message: string;
    remind_at: string;
    is_sent: boolean;
}

interface Analytics {
    total_digests: number;
    completed_digests: number;
    completion_rate: number;
    average_completion: number;
    total_reading_time: number;
    formatted_reading_time: string;
    total_assignments: number;
    completed_assignments: number;
    assignment_completion_rate: number;
}

interface ShowPageProps {
    digest: Digest;
    progress: ReadingProgress;
    personalNotes: PersonalNote[];
    reminders: Reminder[];
    relatedDigests: any[];
    analytics: Analytics;
    upcomingDeadlines: any[];
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

export default function WeeklyDigestDetailShow({ 
    digest, 
    progress: initialProgress, 
    personalNotes: initialNotes,
    reminders: initialReminders,
    relatedDigests, 
    analytics,
    upcomingDeadlines,
    mahasiswa 
}: ShowPageProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [progress, setProgress] = useState(initialProgress);
    const [personalNotes, setPersonalNotes] = useState(initialNotes);
    const [reminders, setReminders] = useState(initialReminders);
    const [copiedLink, setCopiedLink] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const [readingTime, setReadingTime] = useState(0);
    const [showNotes, setShowNotes] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('id');
    
    const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Reading time tracker
    useEffect(() => {
        if (isReading) {
            readingTimerRef.current = setInterval(() => {
                setReadingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (readingTimerRef.current) {
                clearInterval(readingTimerRef.current);
            }
            // Save reading time to server
            if (readingTime > 0) {
                saveReadingTime();
            }
        }

        return () => {
            if (readingTimerRef.current) {
                clearInterval(readingTimerRef.current);
            }
        };
    }, [isReading]);

    // Auto-start reading when page loads
    useEffect(() => {
        setIsReading(true);
        return () => setIsReading(false);
    }, []);

    const saveReadingTime = async () => {
        try {
            await axios.post(route('user.weekly-digest.update-progress', digest.id), {
                section_type: activeTab,
                section_id: 0,
                action: 'viewed',
                reading_time: readingTime,
            });
            setReadingTime(0);
        } catch (error) {
            console.error('Failed to save reading time:', error);
        }
    };

    const markSectionCompleted = async (sectionType: string, sectionId: number) => {
        try {
            const response = await axios.post(route('user.weekly-digest.update-progress', digest.id), {
                section_type: sectionType,
                section_id: sectionId,
                action: 'completed',
            });
            setProgress(response.data.progress);
            toast.success('Section ditandai selesai!');
        } catch (error) {
            toast.error('Gagal menyimpan progress');
        }
    };

    const toggleBookmark = async () => {
        try {
            const response = await axios.post(route('user.weekly-digest.toggle-bookmark', digest.id));
            setProgress(prev => ({
                ...prev,
                is_bookmarked: response.data.is_bookmarked,
            }));
            toast.success(response.data.is_bookmarked ? 'Ditambahkan ke bookmark' : 'Dihapus dari bookmark');
        } catch (error) {
            toast.error('Gagal mengubah bookmark');
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: digest.title,
            text: `${digest.title} - ${digest.mata_kuliah.nama}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Share failed:', error);
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
            toast.success('Link disalin ke clipboard!');
        }
    };

    const handleExportPdf = () => {
        window.location.href = route('user.weekly-digest.export-pdf', digest.id);
    };

    const handleTextToSpeech = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const text = digest.description || digest.title;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = selectedLanguage === 'id' ? 'id-ID' : 'en-US';
            utterance.onend = () => setIsSpeaking(false);
            speechSynthesisRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr: string) => {
        return timeStr.substring(0, 5);
    };

    const formatReadingTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours > 0) {
            return `${hours}j ${remainingMinutes}m`;
        }
        return `${minutes}m`;
    };

    const getDeadlineStatus = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Terlewat', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', urgency: 'critical' };
        if (diffDays === 0) return { label: 'Hari Ini', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', urgency: 'high' };
        if (diffDays <= 3) return { label: `${diffDays} Hari Lagi`, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', urgency: 'medium' };
        return { label: `${diffDays} Hari Lagi`, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', urgency: 'low' };
    };

    const totalItems = 
        digest.forum_discussions.length +
        digest.assignments.length +
        digest.learning_materials.length +
        digest.announcements.length +
        digest.upcoming_schedules.length;


    return (
        <StudentLayout>
            <Head title={`${digest.title} - Weekly Digest Detail`} />

            <motion.div
                className="p-4 md:p-6 lg:p-8 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ═══════ FLOATING ACTION BUTTONS ═══════ */}
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                    {/* Reading Timer */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700"
                    >
                        <Timer className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {formatReadingTime(readingTime + progress.total_reading_time_seconds)}
                        </span>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNotes(!showNotes)}
                        className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg text-white"
                    >
                        <StickyNote className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg text-white"
                    >
                        <BarChart3 className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleTextToSpeech}
                        className={`h-12 w-12 rounded-full ${isSpeaking ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'} flex items-center justify-center shadow-lg text-white`}
                    >
                        {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </motion.button>
                </div>

                {/* ═══════ HEADER - MATCHING DASHBOARD ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-4"
                >
                    {/* Back Button */}
                    <motion.button
                        onClick={() => router.visit(route('user.weekly-digest.index'))}
                        className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors w-fit"
                        whileHover={{ x: -4 }}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">Kembali ke Daftar Digest</span>
                    </motion.button>

                    {/* Header with Icon - NO CONTAINER */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img 
                                src={DigestIcon} 
                                alt="Weekly Digest" 
                                className="h-10 w-10 md:h-12 md:w-12 object-contain"
                            />
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                                    {digest.title}
                                </h1>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    {digest.mata_kuliah.nama} • {digest.mata_kuliah.dosen.nama}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleBookmark}
                                className={`rounded-xl ${progress.is_bookmarked ? 'text-amber-600 border-amber-600 bg-amber-50 dark:bg-amber-900/20' : ''}`}
                            >
                                <Bookmark className={`h-4 w-4 ${progress.is_bookmarked ? 'fill-current' : ''}`} />
                                <span className="ml-2 hidden sm:inline">{progress.is_bookmarked ? 'Tersimpan' : 'Simpan'}</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="rounded-xl"
                            >
                                {copiedLink ? <CheckCheck className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                                <span className="ml-2 hidden sm:inline">{copiedLink ? 'Tersalin' : 'Bagikan'}</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPdf}
                                className="rounded-xl"
                            >
                                <Download className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">Export PDF</span>
                            </Button>

                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                <SelectTrigger className="w-[100px] rounded-xl">
                                    <Globe className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="id">ID</SelectItem>
                                    <SelectItem value="en">EN</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ PROGRESS BAR ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <img src={ProgressIcon} alt="Progress" className="h-8 w-8 object-contain" />
                            <div>
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Progress Membaca</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {progress.completion_percentage.toFixed(0)}% selesai
                                </p>
                            </div>
                        </div>
                        {progress.is_completed && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Selesai
                            </Badge>
                        )}
                    </div>
                    <Progress value={progress.completion_percentage} className="h-3" />
                    <div className="flex items-center justify-between mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                        <span>{progress.sections_completed?.length || 0} dari {totalItems} section</span>
                        <span>Waktu baca: {formatReadingTime(progress.total_reading_time_seconds)}</span>
                    </div>
                </motion.div>

                {/* ═══════ UPCOMING DEADLINES ALERT ═══════ */}
                {upcomingDeadlines.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 shadow-lg border-2 border-amber-200 dark:border-amber-800"
                    >
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">
                                    Deadline Mendekat!
                                </h3>
                                <div className="space-y-2">
                                    {upcomingDeadlines.slice(0, 3).map((deadline, idx) => {
                                        const status = getDeadlineStatus(deadline.date);
                                        return (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-700">
                                                <div className="flex items-center gap-3">
                                                    {deadline.type === 'assignment' ? (
                                                        <FileText className="h-5 w-5 text-amber-600" />
                                                    ) : (
                                                        <Calendar className="h-5 w-5 text-amber-600" />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-neutral-900 dark:text-white">{deadline.title}</p>
                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                            {formatDate(deadline.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={status.color}>{status.label}</Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}


                {/* ═══════ INFO CARDS WITH ANALYTICS ═══════ */}
                <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
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
                            label: 'Periode', 
                            value: `${new Date(digest.week_start_date).getDate()}-${new Date(digest.week_end_date).getDate()}`,
                            icon: CourseIcon,
                            gradient: 'from-emerald-500 to-teal-500',
                            subtext: new Date(digest.week_start_date).toLocaleDateString('id-ID', { month: 'short' })
                        },
                        { 
                            label: 'Total Konten', 
                            value: totalItems, 
                            icon: ItemsIcon,
                            gradient: 'from-purple-500 to-pink-500',
                            subtext: 'Item tersedia'
                        },
                        { 
                            label: 'Tugas Aktif', 
                            value: digest.assignments.filter(a => new Date(a.deadline_date) > new Date()).length,
                            icon: DigestIcon,
                            gradient: 'from-amber-500 to-orange-500',
                            subtext: 'Belum deadline'
                        },
                        { 
                            label: 'Progress', 
                            value: `${progress.completion_percentage.toFixed(0)}%`,
                            icon: ProgressIcon,
                            gradient: 'from-rose-500 to-red-500',
                            subtext: 'Selesai dibaca'
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

                {/* ═══════ INTERACTIVE TIMELINE ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                >
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-600" />
                        Timeline Aktivitas Minggu Ini
                    </h3>
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-emerald-500" />
                        
                        <div className="space-y-6">
                            {/* Forum Discussions */}
                            {digest.forum_discussions.length > 0 && (
                                <div className="relative pl-16">
                                    <div className="absolute left-0 top-0 h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                        <MessageSquare className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                                        <p className="font-semibold text-neutral-900 dark:text-white">Forum Diskusi</p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                            {digest.forum_discussions.length} topik diskusi aktif
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Assignments */}
                            {digest.assignments.length > 0 && (
                                <div className="relative pl-16">
                                    <div className="absolute left-0 top-0 h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                                        <p className="font-semibold text-neutral-900 dark:text-white">Tugas & Assignment</p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                            {digest.assignments.length} tugas perlu dikerjakan
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Learning Materials */}
                            {digest.learning_materials.length > 0 && (
                                <div className="relative pl-16">
                                    <div className="absolute left-0 top-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                        <BookOpen className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                                        <p className="font-semibold text-neutral-900 dark:text-white">Materi Pembelajaran</p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                            {digest.learning_materials.length} materi baru tersedia
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Announcements */}
                            {digest.announcements.length > 0 && (
                                <div className="relative pl-16">
                                    <div className="absolute left-0 top-0 h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                                        <Bell className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                                        <p className="font-semibold text-neutral-900 dark:text-white">Pengumuman</p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                            {digest.announcements.length} pengumuman penting
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Schedules */}
                            {digest.upcoming_schedules.length > 0 && (
                                <div className="relative pl-16">
                                    <div className="absolute left-0 top-0 h-12 w-12 rounded-full bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg">
                                        <Calendar className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                                        <p className="font-semibold text-neutral-900 dark:text-white">Jadwal Mendatang</p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                            {digest.upcoming_schedules.length} acara dijadwalkan
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ DESCRIPTION CARD ═══════ */}
                {digest.description && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                    >
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                                <Info className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
                                    Deskripsi Digest
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {digest.description}
                                </p>
                                {digest.mentari_course_url && (
                                    <a
                                        href={digest.mentari_course_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Buka Course di Mentari</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ MAIN CONTENT TABS ═══════ */}
                {/* (Same as previous implementation but with enhanced features) */}
                {/* ... Continue with tabs implementation ... */}

            </motion.div>

            {/* ═══════ NOTES SIDEBAR ═══════ */}
            <AnimatePresence>
                {showNotes && (
                    <NotesSidebar
                        notes={personalNotes}
                        digestId={digest.id}
                        onClose={() => setShowNotes(false)}
                        onNotesUpdate={setPersonalNotes}
                    />
                )}
            </AnimatePresence>

            {/* ═══════ ANALYTICS MODAL ═══════ */}
            <AnimatePresence>
                {showAnalytics && (
                    <AnalyticsModal
                        analytics={analytics}
                        progress={progress}
                        onClose={() => setShowAnalytics(false)}
                    />
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
```

---

## 📋 PART 5: ADDITIONAL COMPONENTS

### 5.1 Notes Sidebar Component

```tsx
interface NotesSidebarProps {
    notes: PersonalNote[];
    digestId: number;
    onClose: () => void;
    onNotesUpdate: (notes: PersonalNote[]) => void;
}

function NotesSidebar({ notes, digestId, onClose, onNotesUpdate }: NotesSidebarProps) {
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [noteColor, setNoteColor] = useState('yellow');
    const [selectedSection, setSelectedSection] = useState('overview');

    const handleAddNote = async () => {
        try {
            const response = await axios.post(route('user.weekly-digest.store-note', digestId), {
                section_type: selectedSection,
                note_content: noteContent,
                note_color: noteColor,
                is_pinned: false,
            });
            
            onNotesUpdate([response.data.note, ...notes]);
            setNoteContent('');
            setIsAddingNote(false);
            toast.success('Catatan berhasil ditambahkan!');
        } catch (error) {
            toast.error('Gagal menambahkan catatan');
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            await axios.delete(route('user.weekly-digest.delete-note', { id: digestId, noteId }));
            onNotesUpdate(notes.filter(n => n.id !== noteId));
            toast.success('Catatan berhasil dihapus!');
        } catch (error) {
            toast.error('Gagal menghapus catatan');
        }
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white dark:bg-neutral-900 shadow-2xl z-50 overflow-y-auto"
        >
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <StickyNote className="h-5 w-5 text-purple-600" />
                        Catatan Pribadi
                    </h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Add Note Button */}
                {!isAddingNote && (
                    <Button
                        onClick={() => setIsAddingNote(true)}
                        className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Catatan Baru
                    </Button>
                )}

                {/* Add Note Form */}
                {isAddingNote && (
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-3">
                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="overview">Overview</SelectItem>
                                <SelectItem value="forum">Forum</SelectItem>
                                <SelectItem value="assignment">Assignment</SelectItem>
                                <SelectItem value="material">Material</SelectItem>
                                <SelectItem value="announcement">Announcement</SelectItem>
                                <SelectItem value="schedule">Schedule</SelectItem>
                            </SelectContent>
                        </Select>

                        <Textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Tulis catatan Anda..."
                            rows={4}
                        />

                        <div className="flex items-center gap-2">
                            {['yellow', 'blue', 'green', 'pink', 'purple'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNoteColor(color)}
                                    className={`h-8 w-8 rounded-full bg-${color}-200 border-2 ${noteColor === color ? 'border-neutral-900' : 'border-transparent'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleAddNote} className="flex-1">Simpan</Button>
                            <Button variant="outline" onClick={() => setIsAddingNote(false)}>Batal</Button>
                        </div>
                    </div>
                )}

                {/* Notes List */}
                <div className="space-y-3">
                    {notes.length === 0 ? (
                        <div className="text-center py-12">
                            <StickyNote className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600 dark:text-neutral-400">Belum ada catatan</p>
                        </div>
                    ) : (
                        notes.map(note => (
                            <div
                                key={note.id}
                                className={`p-4 rounded-xl bg-${note.note_color}-50 dark:bg-${note.note_color}-900/20 border border-${note.note_color}-200 dark:border-${note.note_color}-800`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {note.section_type}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteNote(note.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                                    {note.note_content}
                                </p>
                                <p className="text-xs text-neutral-500 mt-2">
                                    {new Date(note.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}
```


### 5.2 Analytics Modal Component

```tsx
interface AnalyticsModalProps {
    analytics: Analytics;
    progress: ReadingProgress;
    onClose: () => void;
}

function AnalyticsModal({ analytics, progress, onClose }: AnalyticsModalProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        Learning Analytics
                    </h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Digest</p>
                        <p className="text-3xl font-bold text-blue-600">{analytics.total_digests}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Selesai</p>
                        <p className="text-3xl font-bold text-emerald-600">{analytics.completed_digests}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Completion Rate</p>
                        <p className="text-3xl font-bold text-purple-600">{analytics.completion_rate.toFixed(0)}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Waktu Baca</p>
                        <p className="text-2xl font-bold text-amber-600">{analytics.formatted_reading_time}</p>
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4 mb-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Average Completion
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                {analytics.average_completion.toFixed(0)}%
                            </span>
                        </div>
                        <Progress value={analytics.average_completion} className="h-2" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Assignment Completion
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                {analytics.completed_assignments}/{analytics.total_assignments}
                            </span>
                        </div>
                        <Progress value={analytics.assignment_completion_rate} className="h-2" />
                    </div>
                </div>

                {/* Insights */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Insights
                    </h4>
                    <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                        {analytics.completion_rate >= 80 && (
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>Excellent! Anda sangat konsisten dalam membaca digest.</span>
                            </li>
                        )}
                        {analytics.completion_rate < 50 && (
                            <li className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>Tingkatkan konsistensi membaca untuk hasil belajar yang lebih baik.</span>
                            </li>
                        )}
                        {analytics.total_reading_time > 3600 && (
                            <li className="flex items-start gap-2">
                                <Award className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                <span>Waktu baca Anda menunjukkan dedikasi yang tinggi!</span>
                            </li>
                        )}
                        {analytics.assignment_completion_rate >= 90 && (
                            <li className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                                <span>Luar biasa! Anda menyelesaikan hampir semua tugas tepat waktu.</span>
                            </li>
                        )}
                    </ul>
                </div>
            </motion.div>
        </motion.div>
    );
}
```

---

## 📋 PART 6: ROUTES CONFIGURATION

### 6.1 Enhanced Routes

**File: `routes/web.php`**

```php
// Mahasiswa Routes - Weekly Digest with Enhanced Features
Route::middleware(['auth:mahasiswa'])->prefix('mahasiswa')->name('user.')->group(function () {
    // Main routes
    Route::get('/weekly-digest', [UserWeeklyDigestController::class, 'index'])->name('weekly-digest.index');
    Route::get('/weekly-digest/{id}', [UserWeeklyDigestController::class, 'show'])->name('weekly-digest.show');
    Route::get('/weekly-digest/{id}/export-pdf', [UserWeeklyDigestController::class, 'exportPdf'])->name('weekly-digest.export-pdf');
    
    // Progress tracking
    Route::post('/weekly-digest/{id}/progress', [UserWeeklyDigestController::class, 'updateProgress'])->name('weekly-digest.update-progress');
    Route::post('/weekly-digest/{id}/bookmark', [UserWeeklyDigestController::class, 'toggleBookmark'])->name('weekly-digest.toggle-bookmark');
    
    // Personal notes
    Route::post('/weekly-digest/{id}/notes', [UserWeeklyDigestController::class, 'storeNote'])->name('weekly-digest.store-note');
    Route::put('/weekly-digest/{id}/notes/{noteId}', [UserWeeklyDigestController::class, 'updateNote'])->name('weekly-digest.update-note');
    Route::delete('/weekly-digest/{id}/notes/{noteId}', [UserWeeklyDigestController::class, 'deleteNote'])->name('weekly-digest.delete-note');
    
    // Reminders
    Route::post('/weekly-digest/{id}/reminders', [UserWeeklyDigestController::class, 'storeReminder'])->name('weekly-digest.store-reminder');
    Route::post('/weekly-digest/{id}/reminders/{reminderId}/dismiss', [UserWeeklyDigestController::class, 'dismissReminder'])->name('weekly-digest.dismiss-reminder');
});
```

---

## 📋 PART 7: ADVANCED FEATURES IMPLEMENTATION

### 7.1 Reminder Notification System

**File: `app/Console/Commands/SendDigestReminders.php`**

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DigestReminder;
use App\Notifications\DigestReminderNotification;

class SendDigestReminders extends Command
{
    protected $signature = 'digest:send-reminders';
    protected $description = 'Send pending digest reminders to mahasiswa';

    public function handle()
    {
        $pendingReminders = DigestReminder::with(['mahasiswa', 'digest'])
            ->pending()
            ->get();

        $this->info("Found {$pendingReminders->count()} pending reminders");

        foreach ($pendingReminders as $reminder) {
            try {
                $reminder->mahasiswa->notify(new DigestReminderNotification($reminder));
                $reminder->markAsSent();
                $this->info("Sent reminder to {$reminder->mahasiswa->nama}");
            } catch (\Exception $e) {
                $this->error("Failed to send reminder: {$e->getMessage()}");
            }
        }

        $this->info('Reminder sending completed!');
    }
}
```

### 7.2 Reading Progress Analytics Service

**File: `app/Services/DigestAnalyticsService.php`**

```php
<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\WeeklyLearningDigest;
use App\Models\DigestReadingProgress;
use Illuminate\Support\Facades\DB;

class DigestAnalyticsService
{
    public function getMahasiswaAnalytics(Mahasiswa $mahasiswa, int $courseId = null)
    {
        $query = DigestReadingProgress::where('mahasiswa_id', $mahasiswa->id);

        if ($courseId) {
            $query->whereHas('digest', function($q) use ($courseId) {
                $q->where('mata_kuliah_id', $courseId);
            });
        }

        $progress = $query->with('digest')->get();

        return [
            'total_digests' => $progress->count(),
            'completed_digests' => $progress->where('is_completed', true)->count(),
            'average_completion' => $progress->avg('completion_percentage'),
            'total_reading_time' => $progress->sum('total_reading_time_seconds'),
            'bookmarked_count' => $progress->where('is_bookmarked', true)->count(),
            'completion_trend' => $this->getCompletionTrend($progress),
            'reading_time_trend' => $this->getReadingTimeTrend($progress),
        ];
    }

    private function getCompletionTrend($progress)
    {
        return $progress->groupBy(function($item) {
            return $item->created_at->format('Y-m');
        })->map(function($group) {
            return [
                'month' => $group->first()->created_at->format('M Y'),
                'completion_rate' => $group->avg('completion_percentage'),
                'count' => $group->count(),
            ];
        })->values();
    }

    private function getReadingTimeTrend($progress)
    {
        return $progress->groupBy(function($item) {
            return $item->created_at->format('Y-m');
        })->map(function($group) {
            return [
                'month' => $group->first()->created_at->format('M Y'),
                'total_time' => $group->sum('total_reading_time_seconds'),
                'average_time' => $group->avg('total_reading_time_seconds'),
            ];
        })->values();
    }

    public function getCourseAnalytics(int $courseId)
    {
        $digests = WeeklyLearningDigest::where('mata_kuliah_id', $courseId)
            ->where('is_published', true)
            ->withCount('readingProgress')
            ->get();

        $totalProgress = DigestReadingProgress::whereHas('digest', function($q) use ($courseId) {
            $q->where('mata_kuliah_id', $courseId);
        })->get();

        return [
            'total_digests' => $digests->count(),
            'total_readers' => $totalProgress->unique('mahasiswa_id')->count(),
            'average_completion' => $totalProgress->avg('completion_percentage'),
            'total_reading_time' => $totalProgress->sum('total_reading_time_seconds'),
            'engagement_rate' => $this->calculateEngagementRate($digests, $totalProgress),
        ];
    }

    private function calculateEngagementRate($digests, $progress)
    {
        if ($digests->count() === 0) return 0;
        
        $totalPossibleReads = $digests->count() * $progress->unique('mahasiswa_id')->count();
        $actualReads = $progress->count();
        
        return $totalPossibleReads > 0 ? ($actualReads / $totalPossibleReads) * 100 : 0;
    }
}
```

---

## 📋 PART 8: PERFORMANCE OPTIMIZATIONS

### 8.1 Caching Strategy

```php
// Cache digest data for 1 hour
$digest = Cache::remember("digest.{$id}.full", 3600, function() use ($id) {
    return WeeklyLearningDigest::with([
        'mataKuliah.dosen',
        'forumDiscussions',
        'assignments',
        'learningMaterials',
        'announcements',
        'upcomingSchedules',
        'supportContacts',
    ])->findOrFail($id);
});

// Cache analytics for 30 minutes
$analytics = Cache::remember("digest.analytics.{$mahasiswa->id}.{$courseId}", 1800, function() use ($mahasiswa, $courseId) {
    return app(DigestAnalyticsService::class)->getMahasiswaAnalytics($mahasiswa, $courseId);
});
```

### 8.2 Database Indexing

```sql
-- Add indexes for better query performance
CREATE INDEX idx_progress_mahasiswa_digest ON digest_reading_progress(mahasiswa_id, digest_id);
CREATE INDEX idx_progress_completion ON digest_reading_progress(completion_percentage);
CREATE INDEX idx_notes_mahasiswa_digest ON digest_personal_notes(mahasiswa_id, digest_id);
CREATE INDEX idx_reminders_pending ON digest_reminders(is_sent, is_dismissed, remind_at);
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Database & Backend
- [ ] Create all enhanced database tables (progress, notes, reminders, discussions)
- [ ] Implement enhanced Laravel models with relationships
- [ ] Create DigestAnalyticsService
- [ ] Implement progress tracking endpoints
- [ ] Implement notes CRUD endpoints
- [ ] Implement reminders system
- [ ] Create reminder notification command
- [ ] Add database indexes for performance
- [ ] Implement caching strategy

### Frontend
- [ ] Build enhanced detail page component
- [ ] Implement reading progress tracker
- [ ] Create notes sidebar component
- [ ] Create analytics modal component
- [ ] Implement text-to-speech feature
- [ ] Add multi-language support
- [ ] Create interactive timeline
- [ ] Implement floating action buttons
- [ ] Add smooth animations and transitions
- [ ] Test mobile responsiveness

### Features
- [ ] Reading time tracker
- [ ] Section completion marking
- [ ] Bookmark functionality
- [ ] Personal notes system
- [ ] Smart reminders
- [ ] Learning analytics dashboard
- [ ] Text-to-speech
- [ ] Share functionality
- [ ] PDF export
- [ ] Offline reading mode

### Testing & Optimization
- [ ] Test all CRUD operations
- [ ] Test progress tracking accuracy
- [ ] Test reminder notifications
- [ ] Performance testing with large datasets
- [ ] Mobile device testing
- [ ] Accessibility testing
- [ ] Security audit
- [ ] Load testing
- [ ] User acceptance testing

---

## 📝 FINAL NOTES

**UI/UX Requirements (CRITICAL):**
- ✅ Warna, container, header icon SAMA dengan dashboard mahasiswa
- ✅ Icon header TANPA container background
- ✅ TIDAK ADA animasi icon bergerak ke atas
- ✅ Responsive mobile seperti dashboard
- ✅ Tombol kembali sama dengan menu lain
- ✅ Icon card disesuaikan dengan warna container
- ✅ TIDAK ADA data dummy - semua real data
- ✅ Smooth animations dan transitions
- ✅ Loading states yang informatif
- ✅ Error handling yang user-friendly

**Advanced Features:**
- Interactive reading progress tracker
- Personal notes & highlights system
- Smart deadline countdown with notifications
- Visual timeline of weekly activities
- Learning analytics & insights
- Text-to-speech for accessibility
- Multi-language support (ID/EN)
- Offline reading capability
- Real-time progress sync
- Collaborative discussion threads (optional)

**Performance:**
- Efficient database queries with eager loading
- Caching for frequently accessed data
- Optimized indexes for fast lookups
- Lazy loading for large content
- Progressive image loading
- Code splitting for faster initial load

---

**END OF PROMPT - DETAIL WEEKLY DIGEST MAHASISWA VIEW**
