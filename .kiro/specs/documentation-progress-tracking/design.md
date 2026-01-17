# Design Document: Documentation Progress Tracking

## Overview

Sistem tracking progress otomatis untuk dokumentasi mahasiswa yang mendeteksi ketika guide sudah dibaca lengkap dan menampilkan visual feedback yang motivating. Sistem ini menggunakan scroll tracking, database persistence, dan real-time UI updates untuk memberikan pengalaman yang seamless dan rewarding.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Docs List Page │  │ Docs Detail  │  │ Progress Stats  │ │
│  │                │  │ Page         │  │ Dashboard       │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│           │                  │                    │          │
│           └──────────────────┼────────────────────┘          │
│                              │                               │
│                    ┌─────────▼──────────┐                   │
│                    │ Progress Tracker   │                   │
│                    │ Hook/Service       │                   │
│                    └─────────┬──────────┘                   │
└──────────────────────────────┼────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API Layer         │
                    │   (Laravel)         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Database          │
                    │   (MySQL/Postgres)  │
                    └─────────────────────┘
```

### Component Breakdown

1. **Frontend Components**
   - `DocsListPage`: Menampilkan list guides dengan completion indicators
   - `DocsDetailPage`: Menampilkan guide content dengan scroll tracking
   - `ProgressTracker`: Hook untuk tracking scroll dan completion
   - `CompletionIndicator`: Visual component untuk status completion
   - `ProgressStats`: Dashboard untuk statistics dan achievements

2. **Backend Services**
   - `DocumentationProgressService`: Business logic untuk progress tracking
   - `DocumentationProgressController`: API endpoints
   - `DocumentationProgress` Model: Database model

3. **Database Tables**
   - `documentation_progress`: Menyimpan progress per user per guide

## Components and Interfaces

### Frontend Components

#### 1. Progress Tracker Hook

```typescript
interface UseProgressTrackerOptions {
  guideId: string;
  contentRef: React.RefObject<HTMLElement>;
  onComplete?: () => void;
  minReadTime?: number; // seconds
  completionThreshold?: number; // percentage (default: 90)
}

interface ProgressTrackerState {
  scrollProgress: number; // 0-100
  isComplete: boolean;
  readTime: number; // seconds
  canMarkComplete: boolean;
}

function useProgressTracker(options: UseProgressTrackerOptions): ProgressTrackerState;
```

**Implementation Details:**
- Track scroll position menggunakan `IntersectionObserver` dan scroll events
- Calculate scroll percentage: `(scrollTop + windowHeight) / contentHeight * 100`
- Track active reading time (pause ketika tab inactive)
- Auto-mark complete ketika:
  - Scroll progress >= threshold (90%)
  - Read time >= minimum read time
  - User actively reading (not just fast scrolling)

#### 2. Completion Indicator Component

```typescript
interface CompletionIndicatorProps {
  isComplete: boolean;
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

function CompletionIndicator(props: CompletionIndicatorProps): JSX.Element;
```

**Visual States:**
- **Incomplete**: Gray circular progress with percentage
- **In Progress**: Blue/gradient circular progress with percentage
- **Complete**: Green checkmark with glow effect
- **Animation**: Smooth transition between states, confetti on completion

#### 3. Progress Stats Component

```typescript
interface ProgressStatsProps {
  userId: string;
  category?: string;
}

interface ProgressStats {
  totalGuides: number;
  completedGuides: number;
  completionRate: number;
  totalReadTime: number;
  streak: number;
  categoryProgress: CategoryProgress[];
  recentCompletions: Completion[];
}

function ProgressStats(props: ProgressStatsProps): JSX.Element;
```

### Backend API Endpoints

#### 1. Get User Progress

```
GET /api/documentation/progress
Response: {
  total_guides: number,
  completed_guides: number,
  completion_rate: number,
  total_read_time: number,
  streak: number,
  category_progress: CategoryProgress[],
  recent_completions: Completion[]
}
```

#### 2. Get Guide Progress

```
GET /api/documentation/progress/{guideId}
Response: {
  guide_id: string,
  is_complete: boolean,
  progress: number,
  read_time: number,
  completed_at: string | null,
  last_read_at: string
}
```

#### 3. Update Progress

```
POST /api/documentation/progress/{guideId}
Body: {
  progress: number,
  read_time: number,
  is_complete: boolean
}
Response: {
  success: boolean,
  data: ProgressData
}
```

#### 4. Mark as Complete

```
POST /api/documentation/progress/{guideId}/complete
Response: {
  success: boolean,
  achievement_unlocked: Achievement | null,
  message: string
}
```

## Data Models

### Database Schema

#### documentation_progress Table

```sql
CREATE TABLE documentation_progress (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  guide_id VARCHAR(255) NOT NULL,
  progress INT DEFAULT 0, -- 0-100
  read_time INT DEFAULT 0, -- seconds
  is_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  last_read_at TIMESTAMP NULL,
  read_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_guide (user_id, guide_id),
  INDEX idx_user_complete (user_id, is_complete),
  INDEX idx_completed_at (completed_at)
);
```

#### documentation_achievements Table

```sql
CREATE TABLE documentation_achievements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  achievement_type VARCHAR(50) NOT NULL, -- 'getting_started', 'halfway', 'almost_done', 'master'
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_type)
);
```

### TypeScript Interfaces

```typescript
// Progress Data
interface DocumentationProgress {
  id: string;
  userId: string;
  guideId: string;
  progress: number; // 0-100
  readTime: number; // seconds
  isComplete: boolean;
  completedAt: string | null;
  lastReadAt: string;
  readCount: number;
}

// Category Progress
interface CategoryProgress {
  category: string;
  totalGuides: number;
  completedGuides: number;
  completionRate: number;
}

// Achievement
interface Achievement {
  id: string;
  type: 'getting_started' | 'halfway' | 'almost_done' | 'master';
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

// Completion Event
interface CompletionEvent {
  guideId: string;
  guideTitle: string;
  completedAt: string;
  readTime: number;
  achievementUnlocked: Achievement | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Progress Monotonicity
*For any* guide being read, the progress percentage should never decrease unless explicitly reset by the user.
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Completion Threshold
*For any* guide, it should only be marked as complete when scroll progress >= 90% AND read time >= minimum estimated time.
**Validates: Requirements 1.5, 8.2, 8.3**

### Property 3: Progress Persistence
*For any* completed guide, when the user logs out and logs back in, the completion status should remain unchanged.
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 4: Overall Progress Calculation
*For any* user, the overall progress percentage should equal (completed guides / total guides) × 100.
**Validates: Requirements 3.2**

### Property 5: Visual Indicator Consistency
*For any* guide with is_complete = true, the UI should display green checkmark, green border, and "Completed" badge.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 6: Achievement Unlock Conditions
*For any* user, the "Getting Started" badge should unlock when completion rate >= 25%, "Halfway There" at >= 50%, "Almost Done" at >= 75%, and "Master" at 100%.
**Validates: Requirements 12.1, 12.2, 12.3, 12.4**

### Property 7: Completion Idempotency
*For any* guide, marking it as complete multiple times should result in the same state (no duplicate completions).
**Validates: Requirements 1.3, 6.1**

### Property 8: Category Progress Accuracy
*For any* category, the category progress should equal (completed guides in category / total guides in category) × 100.
**Validates: Requirements 11.1, 11.2, 11.4**

### Property 9: Read Time Accumulation
*For any* guide, the total read time should only increase when the user is actively viewing the guide (tab active and scrolling).
**Validates: Requirements 8.1, 8.2**

### Property 10: Completion Notification
*For any* guide that transitions from incomplete to complete, a success notification should be displayed exactly once.
**Validates: Requirements 4.1, 4.2, 4.4**

## Error Handling

### Frontend Error Handling

1. **Network Errors**
   - Queue completion updates locally
   - Retry with exponential backoff
   - Show offline indicator
   - Sync when connection restored

2. **Scroll Tracking Errors**
   - Fallback to manual "Mark as Complete" button
   - Log errors to monitoring service
   - Graceful degradation

3. **State Sync Errors**
   - Show warning to user
   - Provide manual refresh option
   - Prevent data loss with local storage backup

### Backend Error Handling

1. **Database Errors**
   - Return appropriate HTTP status codes
   - Log errors with context
   - Rollback transactions on failure

2. **Validation Errors**
   - Validate progress values (0-100)
   - Validate guide_id exists
   - Return clear error messages

3. **Concurrency Issues**
   - Use database transactions
   - Handle race conditions with locks
   - Last-write-wins for progress updates

## Testing Strategy

### Unit Tests

1. **Progress Calculation Tests**
   - Test scroll percentage calculation
   - Test read time tracking
   - Test completion threshold logic
   - Test achievement unlock conditions

2. **Component Tests**
   - Test CompletionIndicator renders correctly for each state
   - Test ProgressStats displays accurate data
   - Test celebration animations trigger correctly

3. **API Tests**
   - Test progress update endpoint
   - Test completion endpoint
   - Test progress retrieval
   - Test error responses

### Property-Based Tests

Each property test should run minimum 100 iterations with randomized inputs.

1. **Property Test: Progress Monotonicity**
   - Generate random scroll sequences
   - Verify progress never decreases
   - **Feature: documentation-progress-tracking, Property 1: Progress Monotonicity**

2. **Property Test: Completion Threshold**
   - Generate random scroll and time combinations
   - Verify completion only when both thresholds met
   - **Feature: documentation-progress-tracking, Property 2: Completion Threshold**

3. **Property Test: Overall Progress Calculation**
   - Generate random completion states
   - Verify calculation accuracy
   - **Feature: documentation-progress-tracking, Property 4: Overall Progress Calculation**

4. **Property Test: Achievement Unlock**
   - Generate random completion rates
   - Verify correct achievements unlock
   - **Feature: documentation-progress-tracking, Property 6: Achievement Unlock Conditions**

### Integration Tests

1. **End-to-End Flow**
   - User opens guide → scrolls → marks complete → sees celebration
   - User completes all guides → sees all-complete indicator
   - User logs out → logs in → sees persisted progress

2. **Cross-Device Sync**
   - Complete guide on device A
   - Login on device B
   - Verify progress synced

3. **Performance Tests**
   - Test scroll tracking performance with large documents
   - Test database query performance with many users
   - Test real-time updates with concurrent users

## Implementation Notes

### Performance Optimizations

1. **Debounced Progress Updates**
   - Debounce scroll events (300ms)
   - Batch progress updates to API
   - Update UI optimistically

2. **Caching**
   - Cache progress data in React state
   - Use SWR or React Query for data fetching
   - Invalidate cache on updates

3. **Database Indexing**
   - Index on (user_id, guide_id) for fast lookups
   - Index on (user_id, is_complete) for stats queries
   - Index on completed_at for history queries

### Security Considerations

1. **Authorization**
   - Verify user can only update their own progress
   - Validate guide_id exists and is accessible
   - Rate limit API endpoints

2. **Data Validation**
   - Sanitize all inputs
   - Validate progress values (0-100)
   - Prevent SQL injection

### Accessibility

1. **Screen Reader Support**
   - Announce completion status changes
   - Provide text alternatives for visual indicators
   - Keyboard navigation for all interactions

2. **Visual Accessibility**
   - High contrast for completion indicators
   - Color-blind friendly (not just green/red)
   - Sufficient text size and spacing

## Migration Strategy

### Database Migration

```php
// Migration file
public function up()
{
    Schema::create('documentation_progress', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('guide_id');
        $table->integer('progress')->default(0);
        $table->integer('read_time')->default(0);
        $table->boolean('is_complete')->default(false);
        $table->timestamp('completed_at')->nullable();
        $table->timestamp('last_read_at')->nullable();
        $table->integer('read_count')->default(1);
        $table->timestamps();
        
        $table->unique(['user_id', 'guide_id']);
        $table->index(['user_id', 'is_complete']);
        $table->index('completed_at');
    });
    
    Schema::create('documentation_achievements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('achievement_type', 50);
        $table->timestamp('unlocked_at')->useCurrent();
        
        $table->unique(['user_id', 'achievement_type']);
    });
}
```

### Rollout Plan

1. **Phase 1**: Deploy database migrations
2. **Phase 2**: Deploy backend API endpoints
3. **Phase 3**: Deploy frontend with feature flag
4. **Phase 4**: Enable for beta users
5. **Phase 5**: Full rollout to all users

## Future Enhancements

1. **Social Features**
   - Share completion achievements
   - Leaderboard for fastest completions
   - Team/class progress tracking

2. **Advanced Analytics**
   - Heatmap of most-read sections
   - Drop-off analysis
   - A/B testing for completion rates

3. **Gamification**
   - Points system
   - Levels and ranks
   - Daily challenges

4. **AI Recommendations**
   - Personalized guide suggestions
   - Adaptive difficulty
   - Smart reminders
