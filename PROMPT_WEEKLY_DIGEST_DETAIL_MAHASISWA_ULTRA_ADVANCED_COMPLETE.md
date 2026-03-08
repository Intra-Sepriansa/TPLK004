# PROMPT: Weekly Learning Digest - Detail View Mahasiswa (Ultra Advanced)
## Complete Implementation with Advanced Features

---

## 🎯 EXECUTIVE SUMMARY

Halaman **Detail Weekly Learning Digest untuk Mahasiswa** adalah tampilan mendalam yang menampilkan semua informasi pembelajaran mingguan dengan fitur-fitur advanced. Berbeda dengan view biasa, halaman detail ini memberikan:

1. **Deep Dive Content** - Informasi sangat detail untuk setiap section
2. **Interactive Elements** - Checklist, notes, reminders, reactions
3. **Progress Tracking** - Track progress baca dan completion status
4. **Smart Features** - AI summary, text-to-speech, translation
5. **Collaboration** - Comments, discussions, peer interactions
6. **Analytics** - Reading time, engagement metrics, learning insights
7. **Personalization** - Custom notes, highlights, bookmarks
8. **Offline Support** - Download for offline, sync when online

**Key Differences from Regular View:**
- More detailed information display
- Interactive features (checklist, notes, highlights)
- Progress tracking and completion status
- Peer collaboration features
- Advanced analytics and insights
- Personalization options
- Offline capabilities

---

## 📋 PART 1: ENHANCED DATABASE SCHEMA

### 1.1 User Digest Interactions Table

```sql
CREATE TABLE user_digest_interactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Progress Tracking
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME NULL,
    reading_progress INT DEFAULT 0 COMMENT 'Percentage 0-100',
    time_spent_seconds INT DEFAULT 0,
    
    -- Completion Status
    sections_completed JSON NULL COMMENT 'Array of completed section IDs',
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    completed_at DATETIME NULL,
    
    -- Bookmarks & Saves
    is_bookmarked BOOLEAN DEFAULT FALSE,
    bookmarked_at DATETIME NULL,
    
    -- Ratings & Feedback
    rating INT NULL COMMENT '1-5 stars',
    feedback TEXT NULL,
    is_helpful BOOLEAN NULL,
    
    -- Metadata
    last_viewed_at DATETIME NULL,
    view_count INT DEFAULT 0,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_digest (mahasiswa_id, digest_id),
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_digest (digest_id),
    INDEX idx_bookmarked (is_bookmarked),
    INDEX idx_completed (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2 User Notes & Highlights Table

```sql
CREATE TABLE user_digest_notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    digest_id BIGINT UNSIGNED NOT NULL,
    
    -- Note Details
    section_type ENUM('forum', 'assignment', 'material', 'announcement', 'schedule', 'general') NOT NULL,
    section_id BIGINT UNSIGNED NULL COMMENT 'ID of specific item in section',
    
    note_type ENUM('note', 'highlight', 'question', 'reminder') DEFAULT 'note',
    content TEXT NOT NULL,
    highlighted_text TEXT NULL,
    
    -- Styling
    color VARCHAR(20) DEFAULT 'yellow' COMMENT 'Highlight color',
    is_private BOOLEAN DEFAULT TRUE,
    
    -- Reminder
    reminder_date DATETIME NULL,
    is_reminded BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_digest (digest_id),
    INDEX idx_section (section_type, section_id),
    INDEX idx_reminder (reminder_date, is_reminded)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.3 Assignment Checklist Table

```sql
CREATE TABLE user_assignment_checklists (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    assignment_id BIGINT UNSIGNED NOT NULL,
    
    -- Checklist Items
    checklist_items JSON NOT NULL COMMENT 'Array of checklist items with completion status',
    
    -- Progress
    total_items INT DEFAULT 0,
    completed_items INT DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status
    is_started BOOLEAN DEFAULT FALSE,
    started_at DATETIME NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME NULL,
    
    -- Submission Tracking
    is_submitted BOOLEAN DEFAULT FALSE,
    submitted_at DATETIME NULL,
    submission_notes TEXT NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES digest_assignments(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_assignment (mahasiswa_id, assignment_id),
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_assignment (assignment_id),
    INDEX idx_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.4 Material Progress Table

```sql
CREATE TABLE user_material_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    material_id BIGINT UNSIGNED NOT NULL,
    
    -- Progress Tracking
    is_viewed BOOLEAN DEFAULT FALSE,
    viewed_at DATETIME NULL,
    view_count INT DEFAULT 0,
    
    -- For Videos/Long Content
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_position VARCHAR(50) NULL COMMENT 'e.g., page number, timestamp',
    
    -- Completion
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME NULL,
    time_spent_seconds INT DEFAULT 0,
    
    -- Download Status
    is_downloaded BOOLEAN DEFAULT FALSE,
    downloaded_at DATETIME NULL,
    
    -- Rating
    rating INT NULL COMMENT '1-5 stars',
    is_helpful BOOLEAN NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES digest_learning_materials(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_material (mahasiswa_id, material_id),
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_material (material_id),
    INDEX idx_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.5 Peer Comments & Discussions Table

```sql
CREATE TABLE digest_peer_comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    digest_id BIGINT UNSIGNED NOT NULL,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    
    -- Comment Details
    section_type ENUM('forum', 'assignment', 'material', 'announcement', 'general') NOT NULL,
    section_id BIGINT UNSIGNED NULL,
    
    parent_comment_id BIGINT UNSIGNED NULL COMMENT 'For replies',
    
    comment_text TEXT NOT NULL,
    
    -- Reactions
    likes_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    
    -- Status
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at DATETIME NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (digest_id) REFERENCES weekly_learning_digests(id) ON DELETE CASCADE,
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES digest_peer_comments(id) ON DELETE CASCADE,
    
    INDEX idx_digest (digest_id),
    INDEX idx_mahasiswa (mahasiswa_id),
    INDEX idx_section (section_type, section_id),
    INDEX idx_parent (parent_comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.6 Comment Reactions Table

```sql
CREATE TABLE digest_comment_reactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT UNSIGNED NOT NULL,
    mahasiswa_id BIGINT UNSIGNED NOT NULL,
    
    reaction_type ENUM('like', 'helpful', 'insightful', 'thanks') NOT NULL,
    
    created_at TIMESTAMP NULL,
    
    FOREIGN KEY (comment_id) REFERENCES digest_peer_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_comment_reaction (comment_id, mahasiswa_id, reaction_type),
    INDEX idx_comment (comment_id),
    INDEX idx_mahasiswa (mahasiswa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📋 PART 2: LARAVEL MODELS

### 2.1 UserDigestInteraction Model

**File: `app/Models/UserDigestInteraction.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDigestInteraction extends Model
{
    protected $table = 'user_digest_interactions';

    protected $fillable = [
        'mahasiswa_id',
        'digest_id',
        'is_read',
        'read_at',
        'reading_progress',
        'time_spent_seconds',
        'sections_completed',
        'completion_percentage',
        'completed_at',
        'is_bookmarked',
        'bookmarked_at',
        'rating',
        'feedback',
        'is_helpful',
        'last_viewed_at',
        'view_count',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'sections_completed' => 'array',
        'completion_percentage' => 'decimal:2',
        'completed_at' => 'datetime',
        'is_bookmarked' => 'boolean',
        'bookmarked_at' => 'datetime',
        'is_helpful' => 'boolean',
        'last_viewed_at' => 'datetime',
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
    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
        $this->update(['last_viewed_at' => now()]);
    }

    public function updateProgress(int $progress): void
    {
        $this->update([
            'reading_progress' => min(100, max(0, $progress)),
        ]);

        if ($progress >= 100 && !$this->is_read) {
            $this->markAsRead();
        }
    }

    public function markSectionCompleted(string $sectionType, int $sectionId): void
    {
        $completed = $this->sections_completed ?? [];
        $key = "{$sectionType}_{$sectionId}";
        
        if (!in_array($key, $completed)) {
            $completed[] = $key;
            $this->update(['sections_completed' => $completed]);
            $this->recalculateCompletion();
        }
    }

    public function recalculateCompletion(): void
    {
        $digest = $this->digest;
        $totalSections = 
            $digest->forumDiscussions()->count() +
            $digest->assignments()->count() +
            $digest->learningMaterials()->count() +
            $digest->announcements()->count() +
            $digest->upcomingSchedules()->count();

        if ($totalSections > 0) {
            $completedCount = count($this->sections_completed ?? []);
            $percentage = ($completedCount / $totalSections) * 100;
            
            $this->update([
                'completion_percentage' => $percentage,
                'completed_at' => $percentage >= 100 ? now() : null,
            ]);
        }
    }

    public function toggleBookmark(): bool
    {
        $newStatus = !$this->is_bookmarked;
        $this->update([
            'is_bookmarked' => $newStatus,
            'bookmarked_at' => $newStatus ? now() : null,
        ]);
        return $newStatus;
    }

    public function addTimeSpent(int $seconds): void
    {
        $this->increment('time_spent_seconds', $seconds);
    }

    public function getFormattedTimeSpentAttribute(): string
    {
        $minutes = floor($this->time_spent_seconds / 60);
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        if ($hours > 0) {
            return "{$hours}j {$remainingMinutes}m";
        }
        return "{$minutes}m";
    }
}
```


### 2.2 UserDigestNote Model

**File: `app/Models/UserDigestNote.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDigestNote extends Model
{
    protected $table = 'user_digest_notes';

    protected $fillable = [
        'mahasiswa_id',
        'digest_id',
        'section_type',
        'section_id',
        'note_type',
        'content',
        'highlighted_text',
        'color',
        'is_private',
        'reminder_date',
        'is_reminded',
    ];

    protected $casts = [
        'is_private' => 'boolean',
        'reminder_date' => 'datetime',
        'is_reminded' => 'boolean',
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
    public function scopeNotes($query)
    {
        return $query->where('note_type', 'note');
    }

    public function scopeHighlights($query)
    {
        return $query->where('note_type', 'highlight');
    }

    public function scopeQuestions($query)
    {
        return $query->where('note_type', 'question');
    }

    public function scopeReminders($query)
    {
        return $query->where('note_type', 'reminder');
    }

    public function scopePending($query)
    {
        return $query->where('reminder_date', '>', now())
                     ->where('is_reminded', false);
    }

    public function scopeForSection($query, string $type, ?int $id = null)
    {
        $query->where('section_type', $type);
        if ($id !== null) {
            $query->where('section_id', $id);
        }
        return $query;
    }
}
```

### 2.3 UserAssignmentChecklist Model

**File: `app/Models/UserAssignmentChecklist.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAssignmentChecklist extends Model
{
    protected $table = 'user_assignment_checklists';

    protected $fillable = [
        'mahasiswa_id',
        'assignment_id',
        'checklist_items',
        'total_items',
        'completed_items',
        'completion_percentage',
        'is_started',
        'started_at',
        'is_completed',
        'completed_at',
        'is_submitted',
        'submitted_at',
        'submission_notes',
    ];

    protected $casts = [
        'checklist_items' => 'array',
        'completion_percentage' => 'decimal:2',
        'is_started' => 'boolean',
        'started_at' => 'datetime',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'is_submitted' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(DigestAssignment::class, 'assignment_id');
    }

    // Helper Methods
    public function addChecklistItem(string $title, bool $isCompleted = false): void
    {
        $items = $this->checklist_items ?? [];
        $items[] = [
            'id' => uniqid(),
            'title' => $title,
            'is_completed' => $isCompleted,
            'completed_at' => $isCompleted ? now()->toISOString() : null,
        ];

        $this->update(['checklist_items' => $items]);
        $this->recalculateProgress();
    }

    public function toggleChecklistItem(string $itemId): void
    {
        $items = $this->checklist_items ?? [];
        
        foreach ($items as &$item) {
            if ($item['id'] === $itemId) {
                $item['is_completed'] = !$item['is_completed'];
                $item['completed_at'] = $item['is_completed'] ? now()->toISOString() : null;
                break;
            }
        }

        $this->update(['checklist_items' => $items]);
        $this->recalculateProgress();
    }

    public function removeChecklistItem(string $itemId): void
    {
        $items = $this->checklist_items ?? [];
        $items = array_filter($items, fn($item) => $item['id'] !== $itemId);
        
        $this->update(['checklist_items' => array_values($items)]);
        $this->recalculateProgress();
    }

    public function recalculateProgress(): void
    {
        $items = $this->checklist_items ?? [];
        $total = count($items);
        $completed = count(array_filter($items, fn($item) => $item['is_completed']));

        $percentage = $total > 0 ? ($completed / $total) * 100 : 0;

        $this->update([
            'total_items' => $total,
            'completed_items' => $completed,
            'completion_percentage' => $percentage,
            'is_completed' => $percentage >= 100,
            'completed_at' => $percentage >= 100 ? now() : null,
        ]);
    }

    public function markAsStarted(): void
    {
        if (!$this->is_started) {
            $this->update([
                'is_started' => true,
                'started_at' => now(),
            ]);
        }
    }

    public function markAsSubmitted(string $notes = null): void
    {
        $this->update([
            'is_submitted' => true,
            'submitted_at' => now(),
            'submission_notes' => $notes,
        ]);
    }
}
```

### 2.4 UserMaterialProgress Model

**File: `app/Models/UserMaterialProgress.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMaterialProgress extends Model
{
    protected $table = 'user_material_progress';

    protected $fillable = [
        'mahasiswa_id',
        'material_id',
        'is_viewed',
        'viewed_at',
        'view_count',
        'progress_percentage',
        'last_position',
        'is_completed',
        'completed_at',
        'time_spent_seconds',
        'is_downloaded',
        'downloaded_at',
        'rating',
        'is_helpful',
    ];

    protected $casts = [
        'is_viewed' => 'boolean',
        'viewed_at' => 'datetime',
        'progress_percentage' => 'decimal:2',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'is_downloaded' => 'boolean',
        'downloaded_at' => 'datetime',
        'is_helpful' => 'boolean',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(DigestLearningMaterial::class, 'material_id');
    }

    // Helper Methods
    public function markAsViewed(): void
    {
        $this->update([
            'is_viewed' => true,
            'viewed_at' => now(),
        ]);
        $this->increment('view_count');
    }

    public function updateProgress(float $percentage, string $position = null): void
    {
        $data = [
            'progress_percentage' => min(100, max(0, $percentage)),
        ];

        if ($position !== null) {
            $data['last_position'] = $position;
        }

        if ($percentage >= 100 && !$this->is_completed) {
            $data['is_completed'] = true;
            $data['completed_at'] = now();
        }

        $this->update($data);
    }

    public function markAsDownloaded(): void
    {
        $this->update([
            'is_downloaded' => true,
            'downloaded_at' => now(),
        ]);
    }

    public function addTimeSpent(int $seconds): void
    {
        $this->increment('time_spent_seconds', $seconds);
    }

    public function setRating(int $rating, bool $isHelpful = null): void
    {
        $this->update([
            'rating' => max(1, min(5, $rating)),
            'is_helpful' => $isHelpful,
        ]);
    }
}
```

### 2.5 DigestPeerComment Model

**File: `app/Models/DigestPeerComment.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DigestPeerComment extends Model
{
    protected $table = 'digest_peer_comments';

    protected $fillable = [
        'digest_id',
        'mahasiswa_id',
        'section_type',
        'section_id',
        'parent_comment_id',
        'comment_text',
        'likes_count',
        'helpful_count',
        'is_edited',
        'edited_at',
        'is_deleted',
        'deleted_at',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'is_deleted' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function parentComment(): BelongsTo
    {
        return $this->belongsTo(DigestPeerComment::class, 'parent_comment_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(DigestPeerComment::class, 'parent_comment_id')
                    ->where('is_deleted', false)
                    ->orderBy('created_at', 'asc');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(DigestCommentReaction::class, 'comment_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_deleted', false);
    }

    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_comment_id');
    }

    public function scopeForSection($query, string $type, ?int $id = null)
    {
        $query->where('section_type', $type);
        if ($id !== null) {
            $query->where('section_id', $id);
        }
        return $query;
    }

    // Helper Methods
    public function hasReaction(int $mahasiswaId, string $type): bool
    {
        return $this->reactions()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('reaction_type', $type)
            ->exists();
    }

    public function toggleReaction(int $mahasiswaId, string $type): bool
    {
        $reaction = $this->reactions()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('reaction_type', $type)
            ->first();

        if ($reaction) {
            $reaction->delete();
            $this->decrementReactionCount($type);
            return false;
        } else {
            DigestCommentReaction::create([
                'comment_id' => $this->id,
                'mahasiswa_id' => $mahasiswaId,
                'reaction_type' => $type,
            ]);
            $this->incrementReactionCount($type);
            return true;
        }
    }

    private function incrementReactionCount(string $type): void
    {
        if ($type === 'like') {
            $this->increment('likes_count');
        } elseif ($type === 'helpful') {
            $this->increment('helpful_count');
        }
    }

    private function decrementReactionCount(string $type): void
    {
        if ($type === 'like') {
            $this->decrement('likes_count');
        } elseif ($type === 'helpful') {
            $this->decrement('helpful_count');
        }
    }

    public function softDelete(): void
    {
        $this->update([
            'is_deleted' => true,
            'deleted_at' => now(),
        ]);
    }
}
```

---

## 📋 PART 3: ENHANCED CONTROLLER

### 3.1 Detail Controller with Advanced Features

**File: `app/Http/Controllers/User/WeeklyDigestDetailController.php`**

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WeeklyLearningDigest;
use App\Models\UserDigestInteraction;
use App\Models\UserDigestNote;
use App\Models\UserAssignmentChecklist;
use App\Models\UserMaterialProgress;
use App\Models\DigestPeerComment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WeeklyDigestDetailController extends Controller
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

        // Get or create user interaction
        $interaction = UserDigestInteraction::firstOrCreate(
            [
                'mahasiswa_id' => $mahasiswa->id,
                'digest_id' => $digest->id,
            ],
            [
                'reading_progress' => 0,
                'completion_percentage' => 0,
            ]
        );

        // Increment view count
        $interaction->incrementViewCount();

        // Get user notes and highlights
        $userNotes = UserDigestNote::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $digest->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Get assignment checklists
        $assignmentChecklists = UserAssignmentChecklist::where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('assignment_id', $digest->assignments->pluck('id'))
            ->get()
            ->keyBy('assignment_id');

        // Get material progress
        $materialProgress = UserMaterialProgress::where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('material_id', $digest->learningMaterials->pluck('id'))
            ->get()
            ->keyBy('material_id');

        // Get peer comments
        $peerComments = DigestPeerComment::with(['mahasiswa', 'replies.mahasiswa', 'reactions'])
            ->where('digest_id', $digest->id)
            ->active()
            ->topLevel()
            ->orderBy('created_at', 'desc')
            ->get();

        // Get related digests
        $relatedDigests = WeeklyLearningDigest::where('mata_kuliah_id', $digest->mata_kuliah_id)
            ->where('id', '!=', $digest->id)
            ->where('is_published', true)
            ->orderBy('week_number', 'desc')
            ->limit(5)
            ->get();

        // Get class peers (for collaboration features)
        $classPeers = $mahasiswa->enrollments()
            ->where('mata_kuliah_id', $digest->mata_kuliah_id)
            ->with('mahasiswa')
            ->get()
            ->pluck('mahasiswa')
            ->where('id', '!=', $mahasiswa->id)
            ->take(10);

        // Analytics data
        $analytics = [
            'total_views' => $interaction->view_count,
            'time_spent' => $interaction->formatted_time_spent,
            'completion' => $interaction->completion_percentage,
            'sections_completed' => count($interaction->sections_completed ?? []),
            'notes_count' => $userNotes->count(),
            'highlights_count' => $userNotes->where('note_type', 'highlight')->count(),
        ];

        return Inertia::render('user/weekly-digest/detail', [
            'digest' => $digest,
            'interaction' => $interaction,
            'userNotes' => $userNotes,
            'assignmentChecklists' => $assignmentChecklists,
            'materialProgress' => $materialProgress,
            'peerComments' => $peerComments,
            'relatedDigests' => $relatedDigests,
            'classPeers' => $classPeers,
            'analytics' => $analytics,
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
        ]);
    }


    // Update progress
    public function updateProgress(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'time_spent' => 'nullable|integer|min:0',
        ]);

        $interaction = UserDigestInteraction::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        $interaction->updateProgress($validated['progress']);
        
        if (isset($validated['time_spent'])) {
            $interaction->addTimeSpent($validated['time_spent']);
        }

        return response()->json([
            'success' => true,
            'interaction' => $interaction->fresh(),
        ]);
    }

    // Mark section as completed
    public function markSectionCompleted(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'section_type' => 'required|string',
            'section_id' => 'required|integer',
        ]);

        $interaction = UserDigestInteraction::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        $interaction->markSectionCompleted(
            $validated['section_type'],
            $validated['section_id']
        );

        return response()->json([
            'success' => true,
            'interaction' => $interaction->fresh(),
        ]);
    }

    // Toggle bookmark
    public function toggleBookmark($id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $interaction = UserDigestInteraction::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        $isBookmarked = $interaction->toggleBookmark();

        return response()->json([
            'success' => true,
            'is_bookmarked' => $isBookmarked,
        ]);
    }

    // Add/Update note
    public function storeNote(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'section_type' => 'required|in:forum,assignment,material,announcement,schedule,general',
            'section_id' => 'nullable|integer',
            'note_type' => 'required|in:note,highlight,question,reminder',
            'content' => 'required|string',
            'highlighted_text' => 'nullable|string',
            'color' => 'nullable|string',
            'is_private' => 'boolean',
            'reminder_date' => 'nullable|date',
        ]);

        $validated['mahasiswa_id'] = $mahasiswa->id;
        $validated['digest_id'] = $id;

        $note = UserDigestNote::create($validated);

        return response()->json([
            'success' => true,
            'note' => $note,
        ]);
    }

    // Update note
    public function updateNote(Request $request, $id, $noteId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $note = UserDigestNote::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->findOrFail($noteId);

        $validated = $request->validate([
            'content' => 'required|string',
            'color' => 'nullable|string',
            'is_private' => 'boolean',
            'reminder_date' => 'nullable|date',
        ]);

        $note->update($validated);

        return response()->json([
            'success' => true,
            'note' => $note->fresh(),
        ]);
    }

    // Delete note
    public function deleteNote($id, $noteId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $note = UserDigestNote::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->findOrFail($noteId);

        $note->delete();

        return response()->json(['success' => true]);
    }

    // Assignment checklist operations
    public function updateChecklist(Request $request, $id, $assignmentId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'action' => 'required|in:add,toggle,remove',
            'item_id' => 'nullable|string',
            'item_title' => 'nullable|string',
        ]);

        $checklist = UserAssignmentChecklist::firstOrCreate(
            [
                'mahasiswa_id' => $mahasiswa->id,
                'assignment_id' => $assignmentId,
            ],
            [
                'checklist_items' => [],
                'total_items' => 0,
                'completed_items' => 0,
            ]
        );

        switch ($validated['action']) {
            case 'add':
                $checklist->addChecklistItem($validated['item_title']);
                $checklist->markAsStarted();
                break;
            case 'toggle':
                $checklist->toggleChecklistItem($validated['item_id']);
                break;
            case 'remove':
                $checklist->removeChecklistItem($validated['item_id']);
                break;
        }

        return response()->json([
            'success' => true,
            'checklist' => $checklist->fresh(),
        ]);
    }

    // Material progress operations
    public function updateMaterialProgress(Request $request, $id, $materialId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'action' => 'required|in:view,progress,download,rate',
            'progress' => 'nullable|numeric|min:0|max:100',
            'position' => 'nullable|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'is_helpful' => 'nullable|boolean',
            'time_spent' => 'nullable|integer|min:0',
        ]);

        $progress = UserMaterialProgress::firstOrCreate(
            [
                'mahasiswa_id' => $mahasiswa->id,
                'material_id' => $materialId,
            ],
            [
                'progress_percentage' => 0,
            ]
        );

        switch ($validated['action']) {
            case 'view':
                $progress->markAsViewed();
                break;
            case 'progress':
                $progress->updateProgress(
                    $validated['progress'],
                    $validated['position'] ?? null
                );
                break;
            case 'download':
                $progress->markAsDownloaded();
                break;
            case 'rate':
                $progress->setRating(
                    $validated['rating'],
                    $validated['is_helpful'] ?? null
                );
                break;
        }

        if (isset($validated['time_spent'])) {
            $progress->addTimeSpent($validated['time_spent']);
        }

        return response()->json([
            'success' => true,
            'progress' => $progress->fresh(),
        ]);
    }

    // Peer comments operations
    public function storeComment(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'section_type' => 'required|in:forum,assignment,material,announcement,general',
            'section_id' => 'nullable|integer',
            'parent_comment_id' => 'nullable|exists:digest_peer_comments,id',
            'comment_text' => 'required|string|max:1000',
        ]);

        $validated['mahasiswa_id'] = $mahasiswa->id;
        $validated['digest_id'] = $id;

        $comment = DigestPeerComment::create($validated);
        $comment->load(['mahasiswa', 'reactions']);

        return response()->json([
            'success' => true,
            'comment' => $comment,
        ]);
    }

    public function toggleCommentReaction(Request $request, $id, $commentId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'reaction_type' => 'required|in:like,helpful,insightful,thanks',
        ]);

        $comment = DigestPeerComment::findOrFail($commentId);
        $hasReaction = $comment->toggleReaction($mahasiswa->id, $validated['reaction_type']);

        return response()->json([
            'success' => true,
            'has_reaction' => $hasReaction,
            'comment' => $comment->fresh(['reactions']),
        ]);
    }

    public function deleteComment($id, $commentId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $comment = DigestPeerComment::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($commentId);

        $comment->softDelete();

        return response()->json(['success' => true]);
    }

    // Rate digest
    public function rateDigest(Request $request, $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:500',
            'is_helpful' => 'nullable|boolean',
        ]);

        $interaction = UserDigestInteraction::where('mahasiswa_id', $mahasiswa->id)
            ->where('digest_id', $id)
            ->firstOrFail();

        $interaction->update($validated);

        return response()->json([
            'success' => true,
            'interaction' => $interaction->fresh(),
        ]);
    }
}
```

---

## 📋 PART 4: FRONTEND DETAIL VIEW COMPONENT

### 4.1 Main Detail Component Structure

**File: `resources/js/pages/user/weekly-digest/detail.tsx`**

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
    CheckCheck, AlertCircle, Edit, Trash2, Plus, Check, X, Star,
    ThumbsUp, Heart, Lightbulb, MessageCircle, Eye, Timer, BarChart,
    StickyNote, Highlighter, HelpCircle, AlarmClock, Send, Smile,
    ChevronDown, ChevronUp, Filter, Search, Settings, Zap, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import icons - MATCHING DASHBOARD MAHASISWA
import DigestIcon from '@/assets/mahasiswa/akademik/akademik.png';
import ProgressIcon from '@/assets/admin/dashboard/total-icon.png';
import TimeIcon from '@/assets/admin/dashboard/hadir-icon.png';
import NotesIcon from '@/assets/admin/dashboard/selfie-icon.png';

