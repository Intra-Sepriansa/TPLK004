# PROMPT: REVAMP MENU INFORMASI TUGAS DOSEN - ULTRA ADVANCED

## TUJUAN
Merombak total menu Informasi Tugas Dosen (`resources/js/pages/dosen/tugas.tsx`) dengan UI/UX yang SANGAT SANGAT ADVANCE, mengadopsi FULL warna, gradient, dan style dari menu Uang Kas Admin (`resources/js/pages/admin/kas.tsx`). Menu ini harus menjadi pusat manajemen tugas yang komprehensif dengan fitur-fitur canggih untuk dosen.

---

## UI/UX REFERENCE - WAJIB IKUTI 100%

### Warna & Gradient (EXACT dari Kas Admin)
```tsx
// Background Header
bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500

// Animated Background Position
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

// Container Cards
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl

// Summary Cards dengan Glow Effect
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl
// Dengan animated glow orb:
<motion.div
    animate={{
        scale: hoveredCard === 'cardName' ? 1.5 : 1,
        opacity: hoveredCard === 'cardName' ? 0.4 : 0.2,
    }}
    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color]-500 blur-3xl transition-all duration-500"
/>
```

### Animation Variants (EXACT dari Kas Admin)
```tsx
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
} as const;

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
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
} as const;
```

### Header Style (EXACT dari Kas Admin)
- Background: `bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500`
- Animated background position (15s infinite)
- 3 Pulse rings dengan delay (1s, 2s, 3s)
- 2 Floating orbs dengan `blur-3xl`
- Icon container: `rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30`
- Action buttons: `rounded-xl bg-white/20 px-5 py-2.5 backdrop-blur-md border border-white/20 shadow-lg`

### Tab Navigation (EXACT dari Kas Admin)
```tsx
<motion.div className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit border border-white/10">
    <motion.button layout>
        {activeTab === 'tabName' && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
        )}
    </motion.button>
</motion.div>
```

---

## STRUKTUR MENU - 10 SUMMARY CARDS

### 1. Total Tugas
- Icon: `FileText` (gradient indigo-purple)
- Value: Total semua tugas
- Subtitle: "X aktif, Y draft"
- Glow color: indigo-500

### 2. Total Submissions
- Icon: `Send` (gradient emerald-teal)
- Value: Total pengumpulan dari semua tugas
- Subtitle: "X pending review"
- Glow color: emerald-500

### 3. Pending Review
- Icon: `Clock` (gradient amber-orange)
- Value: Jumlah submission yang belum dinilai
- Subtitle: "perlu penilaian"
- Glow color: amber-500


### 4. Completion Rate
- Icon: `BarChart3` (gradient violet-purple)
- Value: Rata-rata completion rate (%)
- Subtitle: "dari semua tugas"
- Glow color: violet-500

### 5. Average Score
- Icon: `Award` (gradient pink-rose)
- Value: Rata-rata nilai dari semua tugas
- Subtitle: "nilai rata-rata"
- Glow color: pink-500

### 6. Late Submissions
- Icon: `AlertTriangle` (gradient red-rose)
- Value: Total submission terlambat
- Subtitle: "pengumpulan terlambat"
- Glow color: red-500

### 7. Overdue Tasks
- Icon: `Timer` (gradient orange-red)
- Value: Jumlah tugas yang sudah lewat deadline
- Subtitle: "perlu perhatian"
- Glow color: orange-500

### 8. Active Discussions
- Icon: `MessageSquare` (gradient blue-cyan)
- Value: Total diskusi aktif di semua tugas
- Subtitle: "diskusi berjalan"
- Glow color: blue-500

### 9. Plagiarism Detected
- Icon: `ShieldAlert` (gradient red-pink)
- Value: Jumlah submission dengan indikasi plagiarisme
- Subtitle: "perlu verifikasi"
- Glow color: red-500

### 10. Grading Progress
- Icon: `TrendingUp` (gradient green-emerald)
- Value: Persentase tugas yang sudah selesai dinilai
- Subtitle: "progress penilaian"
- Glow color: green-500

**Catatan:** Setiap card harus memiliki:
- Hover effect: `scale: 1.03, y: -8`
- Animated glow orb yang membesar saat hover
- Gradient icon container dengan shadow
- Smooth transitions

---

## FITUR ULTRA ADVANCED

### 1. Enhanced Filters & Search
```tsx
<motion.div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur">
    // Search input dengan icon
    // Filter: Mata Kuliah (dropdown)
    // Filter: Status (published/draft/closed)
    // Filter: Prioritas (tinggi/sedang/rendah)
    // Filter: Jenis (tugas/quiz/project/presentasi/lainnya)
    // Sort by: Deadline, Priority, Submissions, Score
    // Date range picker untuk filter deadline
    // Quick filters: "Overdue", "Due This Week", "Pending Review"
</motion.div>
```


### 2. View Modes (4 Modes)
```tsx
// Toggle buttons dengan active state
<div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800 rounded-lg p-1">
    <Button variant={viewMode === 'list' ? 'default' : 'ghost'}>
        <List className="h-4 w-4" />
    </Button>
    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'}>
        <Grid3x3 className="h-4 w-4" />
    </Button>
    <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'}>
        <Columns className="h-4 w-4" />
    </Button>
    <Button variant={viewMode === 'calendar' ? 'default' : 'ghost'}>
        <Calendar className="h-4 w-4" />
    </Button>
</div>
```

**List View:**
- Card horizontal dengan semua info
- Progress bar completion rate
- Quick actions (Edit, Duplicate, Archive, Delete)
- Hover effect dengan arrow indicator

**Grid View:**
- Card vertical 3 kolom
- Compact info dengan badges
- Thumbnail/icon besar
- Hover scale effect

**Kanban View:**
- 4 kolom: Draft, Published, Pending Review, Closed
- Drag & drop untuk ubah status
- Card count per kolom
- Smooth animations saat drag

**Calendar View:**
- Full calendar dengan deadline markers
- Color-coded by priority
- Click date untuk filter
- Month/Week/Day view toggle

### 3. Enhanced Assignment Cards
Setiap card tugas harus menampilkan:
- **Badges:** Jenis, Prioritas, Status, Overdue (jika ada)
- **Title & Description:** Bold title, truncated description
- **Progress Bar:** Completion rate dengan gradient color
- **Submission Stats:** X/Y submit, Z terlambat, W views
- **Meta Info:** Mata kuliah, deadline, diskusi count, days until deadline
- **Quick Actions:** Dropdown menu dengan 10+ actions
- **Hover Effects:** Scale, glow, arrow indicator

### 4. Assignment Detail Modal (10 TABS)

**Modal Header:**
- Gradient background: `from-indigo-600 via-purple-600 to-pink-500`
- Animated background position
- Large icon dengan pulse animation
- Title, course name, deadline
- Quick stats badges (submissions, completion rate, avg score)

**Tab 1: Overview**
- Assignment info (judul, deskripsi, instruksi lengkap)
- Deadline countdown dengan animated timer
- Priority & status badges
- Attachment files dengan preview
- Quick actions (Edit, Duplicate, Archive, Delete, Export)
- Created by & created at info

**Tab 2: Submissions**
- Table/Grid view toggle
- Search & filter submissions
- Status badges (submitted/late/not submitted/graded)
- Quick grade input
- Bulk actions (Download all, Mark as reviewed, Send reminder)
- Submission timeline chart
- Export submissions (Excel/PDF)


**Tab 3: Grading**
- Grading interface dengan rubric
- Score distribution chart
- Grade statistics (min, max, avg, median)
- Quick grading mode (swipe through submissions)
- Bulk grading tools
- Grade curve adjustment
- Export grades
- Feedback templates

**Tab 4: Analytics & Insights**
- Submission timeline chart (line chart)
- Completion rate over time
- Score distribution (histogram)
- Late submission analysis
- Student performance comparison
- Time spent analysis
- Engagement metrics (views, downloads, discussions)
- Predictive insights (estimated completion, at-risk students)

**Tab 5: Discussions**
- Discussion threads dengan nested replies
- Real-time updates
- Rich text editor untuk reply
- Mention students (@nama)
- Pin important discussions
- Mark as resolved
- Filter by status (open/resolved)
- Notification settings

**Tab 6: Files & Resources**
- Assignment files (uploaded by dosen)
- Student submissions (organized by student)
- Drag & drop upload
- File preview (PDF, images, videos)
- Download all as ZIP
- File version history
- Storage usage indicator
- Shared resources library

**Tab 7: Rubric & Grading Criteria**
- Rubric builder dengan drag & drop
- Multiple criteria dengan weight
- Point allocation per criteria
- Rubric templates
- Auto-calculate total score
- Export rubric as PDF
- Share rubric with students
- Rubric analytics (which criteria students struggle with)

**Tab 8: Plagiarism Detection**
- Similarity checker results
- Highlighted similar content
- Source comparison
- Plagiarism score per submission
- Bulk plagiarism check
- Whitelist sources
- Report generation
- Integration dengan Turnitin/Copyscape (optional)

**Tab 9: Feedback & Communication**
- Bulk feedback composer
- Feedback templates
- Rich text editor dengan formatting
- Attach files to feedback
- Send email notification
- Schedule feedback release
- Feedback history
- Student response tracking

**Tab 10: Settings**
- Assignment settings (deadline, late submission policy, max score)
- Visibility settings (publish/unpublish)
- Notification settings (remind students, notify on submission)
- Grading settings (rubric, auto-grade, peer review)
- Collaboration settings (group assignment, peer review)
- Advanced settings (plagiarism check, file types allowed, max file size)
- Danger zone (Archive, Delete)

### 5. Multi-step Create/Edit Modal (7 STEPS)

**Modal Style:**
- Gradient header: `from-indigo-600 via-purple-600 to-pink-500`
- Progress indicator (step 1/7)
- Animated transitions between steps
- Back/Next buttons dengan validation
- Save as draft option

**Step 1: Basic Info**
- Judul tugas (required)
- Mata kuliah (dropdown, required)
- Jenis tugas (tugas/quiz/project/presentasi/lainnya)
- Prioritas (tinggi/sedang/rendah)
- Status (draft/published)


**Step 2: Description & Instructions**
- Rich text editor untuk deskripsi
- Rich text editor untuk instruksi lengkap
- Formatting tools (bold, italic, list, link, image)
- Preview mode
- Character count

**Step 3: Deadline & Schedule**
- Deadline date & time picker
- Late submission policy (allow/disallow, penalty)
- Auto-close after deadline
- Reminder schedule (1 day before, 1 hour before)
- Timezone settings

**Step 4: Files & Resources**
- Drag & drop file upload
- Multiple files support
- File preview
- File description
- External links (Google Drive, YouTube, etc.)
- Resource library (reuse from previous assignments)

**Step 5: Grading & Rubric**
- Max score input
- Grading method (points/percentage/letter grade)
- Rubric builder (add criteria, weight, points)
- Auto-grading settings (for MCQ)
- Peer review settings (enable/disable, number of reviewers)
- Grade visibility (show immediately/after deadline/manual release)

**Step 6: Advanced Settings**
- Group assignment (enable/disable, group size)
- Plagiarism check (enable/disable, similarity threshold)
- File restrictions (allowed types, max size)
- Submission limit (number of attempts)
- Anonymous grading
- Collaboration tools (discussion, comments)

**Step 7: Review & Publish**
- Summary of all settings
- Preview assignment as student
- Validation check (missing required fields)
- Save as draft or Publish
- Schedule publish (publish at specific date/time)

### 6. Bulk Operations
```tsx
// Checkbox selection pada setiap card
// Bulk action bar muncul saat ada yang dipilih
<motion.div 
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 border border-slate-200 dark:border-gray-800"
>
    <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{selectedCount} tugas dipilih</span>
        <Button size="sm">Publish</Button>
        <Button size="sm">Archive</Button>
        <Button size="sm">Duplicate</Button>
        <Button size="sm">Export</Button>
        <Button size="sm" variant="destructive">Delete</Button>
    </div>
</motion.div>
```

### 7. Advanced Grading Features

**Quick Grading Mode:**
- Swipe interface untuk navigate submissions
- Inline score input
- Quick feedback templates
- Keyboard shortcuts (arrow keys, number keys)
- Progress indicator (X/Y graded)
- Auto-save

**Auto-grading for MCQ:**
- Define correct answers
- Auto-calculate score
- Instant feedback to students
- Partial credit support
- Question bank integration


**AI-assisted Grading:**
- AI suggestions untuk feedback
- Consistency checker (compare with similar submissions)
- Rubric auto-scoring
- Sentiment analysis pada text submissions
- Grammar & spelling checker

**Peer Review System:**
- Assign reviewers automatically
- Rubric for peer review
- Anonymous peer review
- Peer review deadline
- Aggregate peer scores
- Dosen can override peer scores

### 8. Template Management
```tsx
// Template library modal
<motion.div className="grid grid-cols-3 gap-4">
    {templates.map(template => (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border p-4 cursor-pointer"
        >
            <h3>{template.name}</h3>
            <p className="text-sm text-slate-500">{template.description}</p>
            <div className="flex gap-2 mt-4">
                <Button size="sm">Use Template</Button>
                <Button size="sm" variant="outline">Preview</Button>
            </div>
        </motion.div>
    ))}
</motion.div>

// Actions:
// - Create template from existing assignment
// - Edit template
// - Delete template
// - Share template with other dosen
// - Import template from library
```

### 9. Analytics Dashboard
```tsx
// Dedicated analytics section dengan charts
<div className="grid grid-cols-2 gap-6">
    {/* Submission Timeline */}
    <div className="rounded-2xl border p-6">
        <h3>Submission Timeline</h3>
        <LineChart data={submissionData} />
    </div>
    
    {/* Score Distribution */}
    <div className="rounded-2xl border p-6">
        <h3>Score Distribution</h3>
        <BarChart data={scoreData} />
    </div>
    
    {/* Completion Rate Trend */}
    <div className="rounded-2xl border p-6">
        <h3>Completion Rate Over Time</h3>
        <AreaChart data={completionData} />
    </div>
    
    {/* Student Performance */}
    <div className="rounded-2xl border p-6">
        <h3>Student Performance Comparison</h3>
        <RadarChart data={performanceData} />
    </div>
</div>

// Insights:
// - Average time to complete
// - Peak submission times
// - At-risk students (low scores, late submissions)
// - Top performers
// - Engagement metrics
```

### 10. Notification System
```tsx
// Notification center dengan badge count
<Button variant="ghost" size="icon" className="relative">
    <Bell className="h-5 w-5" />
    {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {notificationCount}
        </span>
    )}
</Button>

// Notification types:
// - New submission
// - Late submission
// - Discussion reply
// - Deadline approaching
// - Plagiarism detected
// - Student question
// - Peer review completed

// Notification settings:
// - Email notifications
// - Push notifications
// - In-app notifications
// - Notification frequency (instant/daily digest/weekly digest)
```


### 11. Enhanced Export & Reporting
```tsx
// Export modal dengan multiple options
<Select>
    <SelectItem value="submissions">Export Submissions</SelectItem>
    <SelectItem value="grades">Export Grades</SelectItem>
    <SelectItem value="analytics">Export Analytics</SelectItem>
    <SelectItem value="full-report">Full Report</SelectItem>
</Select>

// Format options:
// - Excel (.xlsx)
// - PDF
// - CSV
// - JSON

// Report includes:
// - Assignment details
// - Submission list dengan scores
// - Grade statistics
// - Analytics charts
// - Student feedback
// - Plagiarism report
```

### 12. Real-time Updates
```tsx
// WebSocket/Pusher integration untuk real-time updates
// - New submission notification (toast)
// - Live submission count update
// - Live discussion updates
// - Collaborative grading (multiple dosen)
// - Student online status

// Toast notification example:
<Toast>
    <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
            <p className="font-semibold">New Submission</p>
            <p className="text-sm text-slate-500">John Doe submitted "Tugas 1"</p>
        </div>
    </div>
</Toast>
```

### 13. Mobile Responsive
```tsx
// Breakpoints:
// - Mobile: < 640px (1 column, simplified view)
// - Tablet: 640px - 1024px (2 columns)
// - Desktop: > 1024px (3-4 columns)

// Mobile optimizations:
// - Bottom sheet untuk modals
// - Swipe gestures
// - Simplified filters (drawer)
// - Sticky header dengan scroll
// - Touch-friendly buttons (min 44px)
```

### 14. QR Code Management
```tsx
// Generate QR code untuk quick access
<Button onClick={generateQR}>
    <QrCode className="mr-2 h-4 w-4" />
    Generate QR Code
</Button>

// QR code features:
// - Direct link to assignment
// - Embed assignment info
// - Download QR as image
// - Print QR code
// - Share QR via email/WhatsApp
```

### 15. Attendance Integration
```tsx
// Link assignment dengan attendance session
<Select>
    <SelectTrigger>Link to Attendance Session</SelectTrigger>
    <SelectContent>
        {sessions.map(session => (
            <SelectItem value={session.id}>
                {session.title} - {session.date}
            </SelectItem>
        ))}
    </SelectContent>
</Select>

// Features:
// - Auto-create assignment from attendance
// - Sync deadline dengan session end time
// - Only students who attended can submit
// - Attendance-based grading bonus
```

### 16. Collaboration Features
```tsx
// Co-teaching support
<div className="flex items-center gap-2">
    <Label>Co-teachers</Label>
    <MultiSelect
        options={dosenList}
        value={coTeachers}
        onChange={setCoTeachers}
    />
</div>

// Features:
// - Multiple dosen can manage assignment
// - Shared grading responsibility
// - Activity log (who did what)
// - Permission levels (view/edit/grade)
// - Comments & notes for co-teachers
```


### 17. Gamification Elements
```tsx
// Achievement badges untuk students
<div className="grid grid-cols-4 gap-3">
    <div className="rounded-xl border p-3 text-center">
        <Award className="h-8 w-8 mx-auto text-yellow-500" />
        <p className="text-xs mt-2">Early Bird</p>
        <p className="text-[10px] text-slate-500">Submit 1 day early</p>
    </div>
    <div className="rounded-xl border p-3 text-center">
        <Trophy className="h-8 w-8 mx-auto text-purple-500" />
        <p className="text-xs mt-2">Perfect Score</p>
        <p className="text-[10px] text-slate-500">Score 100%</p>
    </div>
    <div className="rounded-xl border p-3 text-center">
        <Star className="h-8 w-8 mx-auto text-blue-500" />
        <p className="text-xs mt-2">Consistent</p>
        <p className="text-[10px] text-slate-500">5 on-time submissions</p>
    </div>
    <div className="rounded-xl border p-3 text-center">
        <Zap className="h-8 w-8 mx-auto text-orange-500" />
        <p className="text-xs mt-2">Speed Demon</p>
        <p className="text-[10px] text-slate-500">Submit in 1 hour</p>
    </div>
</div>

// Leaderboard:
// - Top performers
// - Most improved
// - Most active in discussions
// - Peer review champion
```

### 18. External Integrations
```tsx
// Integration options
<div className="space-y-3">
    <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="flex items-center gap-3">
            <img src="/icons/google-classroom.svg" className="h-8 w-8" />
            <div>
                <p className="font-semibold">Google Classroom</p>
                <p className="text-xs text-slate-500">Sync assignments</p>
            </div>
        </div>
        <Switch checked={integrations.googleClassroom} />
    </div>
    
    <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="flex items-center gap-3">
            <img src="/icons/turnitin.svg" className="h-8 w-8" />
            <div>
                <p className="font-semibold">Turnitin</p>
                <p className="text-xs text-slate-500">Plagiarism detection</p>
            </div>
        </div>
        <Switch checked={integrations.turnitin} />
    </div>
    
    <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="flex items-center gap-3">
            <img src="/icons/github.svg" className="h-8 w-8" />
            <div>
                <p className="font-semibold">GitHub</p>
                <p className="text-xs text-slate-500">Code submissions</p>
            </div>
        </div>
        <Switch checked={integrations.github} />
    </div>
</div>
```

---

## TECHNICAL REQUIREMENTS

### Imports
```tsx
import { Head, router, useForm } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Send, Clock, BarChart3, Award, AlertTriangle, Timer,
    MessageSquare, ShieldAlert, TrendingUp, Plus, Search, Filter,
    List, Grid3x3, Columns, Calendar, Eye, Pencil, Copy, Download,
    Archive, Trash2, MoreHorizontal, CheckCircle, X, ChevronRight,
    BookOpen, Users, Target, Zap, Sparkles, Bell, QrCode, Trophy,
    Star, Upload, Link as LinkIcon, Settings, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
```


### State Management
```tsx
const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban' | 'calendar'>('list');
const [search, setSearch] = useState(filters.search);
const [courseId, setCourseId] = useState(filters.course_id);
const [status, setStatus] = useState(filters.status);
const [priorityFilter, setPriorityFilter] = useState<string>('all');
const [jenisFilter, setJenisFilter] = useState<string>('all');
const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'submissions' | 'score'>('deadline');
const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
const [selectedTugas, setSelectedTugas] = useState<number[]>([]);
const [hoveredCard, setHoveredCard] = useState<number | null>(null);
const [showCreateModal, setShowCreateModal] = useState(false);
const [showDetailModal, setShowDetailModal] = useState(false);
const [selectedTugasDetail, setSelectedTugasDetail] = useState<Tugas | null>(null);
const [detailTab, setDetailTab] = useState<string>('overview');
const [createStep, setCreateStep] = useState(1);
const [showTemplateModal, setShowTemplateModal] = useState(false);
const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
const [showExportModal, setShowExportModal] = useState(false);
const [notifications, setNotifications] = useState<Notification[]>([]);
```

### Types
```tsx
type Course = { 
    id: number; 
    nama: string; 
    kode: string;
    sks: number;
};

type Tugas = {
    id: number;
    judul: string;
    deskripsi: string;
    instruksi: string;
    jenis: 'tugas' | 'quiz' | 'project' | 'presentasi' | 'lainnya';
    deadline: string;
    deadline_display: string;
    prioritas: 'tinggi' | 'sedang' | 'rendah';
    status: 'published' | 'draft' | 'closed';
    course: Course;
    created_by: string;
    created_by_type: string;
    is_overdue: boolean;
    days_until_deadline: number;
    diskusi_count: number;
    created_at: string;
    updated_at: string;
    // Advanced fields
    submission_count: number;
    total_students: number;
    pending_review: number;
    graded_count: number;
    late_submissions: number;
    view_count: number;
    average_score: number;
    max_score: number;
    completion_rate: number;
    plagiarism_detected: number;
    attachments: Attachment[];
    rubric: Rubric | null;
    co_teachers: Dosen[];
};

type Submission = {
    id: number;
    mahasiswa: Mahasiswa;
    tugas_id: number;
    file_path: string;
    submitted_at: string;
    is_late: boolean;
    score: number | null;
    feedback: string | null;
    status: 'submitted' | 'graded' | 'returned';
    plagiarism_score: number | null;
};

type Stats = {
    total: number;
    published: number;
    draft: number;
    closed: number;
    overdue: number;
    total_submissions: number;
    pending_review: number;
    avg_completion_rate: number;
    avg_score: number;
    late_submissions: number;
    active_discussions: number;
    plagiarism_detected: number;
    grading_progress: number;
};

type Props = {
    tugasList: Tugas[];
    courses: Course[];
    stats: Stats;
    filters: { 
        search: string; 
        course_id: string; 
        status: string;
        priority: string;
        jenis: string;
    };
    templates: Template[];
    notifications: Notification[];
};
```


### Controller Methods (app/Http/Controllers/Dosen/TugasController.php)

```php
public function index(Request $request)
{
    $dosen = Auth::guard('dosen')->user();
    $courseIds = MataKuliah::where('dosen_id', $dosen->id)->pluck('id');
    
    $query = AcademicTask::whereIn('course_id', $courseIds)
        ->with(['course', 'submissions.mahasiswa', 'discussions', 'attachments']);
    
    // Filters
    if ($request->search) {
        $query->where('judul', 'like', '%' . $request->search . '%');
    }
    if ($request->course_id && $request->course_id !== 'all') {
        $query->where('course_id', $request->course_id);
    }
    if ($request->status && $request->status !== 'all') {
        $query->where('status', $request->status);
    }
    if ($request->priority && $request->priority !== 'all') {
        $query->where('prioritas', $request->priority);
    }
    if ($request->jenis && $request->jenis !== 'all') {
        $query->where('jenis', $request->jenis);
    }
    
    $tugasList = $query->latest()->get()->map(function($tugas) {
        return [
            'id' => $tugas->id,
            'judul' => $tugas->judul,
            'deskripsi' => $tugas->deskripsi,
            'instruksi' => $tugas->instruksi,
            'jenis' => $tugas->jenis,
            'deadline' => $tugas->deadline,
            'deadline_display' => $tugas->deadline->format('d M Y H:i'),
            'prioritas' => $tugas->prioritas,
            'status' => $tugas->status,
            'course' => [
                'id' => $tugas->course->id,
                'nama' => $tugas->course->nama,
            ],
            'is_overdue' => $tugas->deadline < now(),
            'days_until_deadline' => now()->diffInDays($tugas->deadline, false),
            'diskusi_count' => $tugas->discussions->count(),
            'submission_count' => $tugas->submissions->count(),
            'total_students' => Mahasiswa::count(),
            'pending_review' => $tugas->submissions->whereNull('score')->count(),
            'graded_count' => $tugas->submissions->whereNotNull('score')->count(),
            'late_submissions' => $tugas->submissions->where('is_late', true)->count(),
            'view_count' => $tugas->view_count ?? 0,
            'average_score' => $tugas->submissions->whereNotNull('score')->avg('score') ?? 0,
            'max_score' => $tugas->max_score ?? 100,
            'completion_rate' => Mahasiswa::count() > 0 
                ? round(($tugas->submissions->count() / Mahasiswa::count()) * 100) 
                : 0,
            'plagiarism_detected' => $tugas->submissions->where('plagiarism_score', '>', 50)->count(),
            'created_at' => $tugas->created_at->format('d M Y H:i'),
        ];
    });
    
    $stats = [
        'total' => AcademicTask::whereIn('course_id', $courseIds)->count(),
        'published' => AcademicTask::whereIn('course_id', $courseIds)->where('status', 'published')->count(),
        'draft' => AcademicTask::whereIn('course_id', $courseIds)->where('status', 'draft')->count(),
        'closed' => AcademicTask::whereIn('course_id', $courseIds)->where('status', 'closed')->count(),
        'overdue' => AcademicTask::whereIn('course_id', $courseIds)->where('deadline', '<', now())->count(),
        'total_submissions' => Submission::whereHas('tugas', fn($q) => $q->whereIn('course_id', $courseIds))->count(),
        'pending_review' => Submission::whereHas('tugas', fn($q) => $q->whereIn('course_id', $courseIds))->whereNull('score')->count(),
        'avg_completion_rate' => $tugasList->avg('completion_rate') ?? 0,
        'avg_score' => Submission::whereHas('tugas', fn($q) => $q->whereIn('course_id', $courseIds))->whereNotNull('score')->avg('score') ?? 0,
        'late_submissions' => Submission::whereHas('tugas', fn($q) => $q->whereIn('course_id', $courseIds))->where('is_late', true)->count(),
        'active_discussions' => Discussion::whereHas('tugas', fn($q) => $q->whereIn('course_id', $courseIds))->where('status', 'open')->count(),
        'plagiarism_detected' => Submission::whereHas('tugas', fn($q) => $q->whereIn('course_id', $courseIds))->where('plagiarism_score', '>', 50)->count(),
        'grading_progress' => $tugasList->count() > 0 
            ? round(($tugasList->sum('graded_count') / $tugasList->sum('submission_count')) * 100) 
            : 0,
    ];
    
    $courses = MataKuliah::where('dosen_id', $dosen->id)->get();
    $templates = Template::where('created_by', $dosen->id)->get();
    
    return Inertia::render('dosen/tugas', [
        'tugasList' => $tugasList,
        'courses' => $courses,
        'stats' => $stats,
        'filters' => [
            'search' => $request->search ?? '',
            'course_id' => $request->course_id ?? 'all',
            'status' => $request->status ?? 'all',
            'priority' => $request->priority ?? 'all',
            'jenis' => $request->jenis ?? 'all',
        ],
        'templates' => $templates,
    ]);
}

public function show($id)
{
    $tugas = AcademicTask::with([
        'course', 
        'submissions.mahasiswa', 
        'discussions', 
        'attachments',
        'rubric',
        'coTeachers'
    ])->findOrFail($id);
    
    // Return detailed tugas data for modal
    return response()->json([
        'tugas' => $tugas,
        'submissions' => $tugas->submissions,
        'analytics' => [
            'submission_timeline' => $this->getSubmissionTimeline($tugas),
            'score_distribution' => $this->getScoreDistribution($tugas),
            'completion_trend' => $this->getCompletionTrend($tugas),
        ],
    ]);
}

public function store(Request $request)
{
    $validated = $request->validate([
        'course_id' => 'required|exists:mata_kuliah,id',
        'judul' => 'required|string|max:255',
        'deskripsi' => 'required|string',
        'instruksi' => 'nullable|string',
        'jenis' => 'required|in:tugas,quiz,project,presentasi,lainnya',
        'deadline' => 'required|date',
        'prioritas' => 'required|in:tinggi,sedang,rendah',
        'status' => 'required|in:published,draft,closed',
        'max_score' => 'nullable|integer',
        'attachments' => 'nullable|array',
        'rubric' => 'nullable|array',
    ]);
    
    $tugas = AcademicTask::create($validated);
    
    // Handle attachments
    if ($request->has('attachments')) {
        foreach ($request->attachments as $attachment) {
            $tugas->attachments()->create($attachment);
        }
    }
    
    // Handle rubric
    if ($request->has('rubric')) {
        $tugas->rubric()->create($request->rubric);
    }
    
    return redirect()->route('dosen.tugas.index')->with('success', 'Tugas berhasil dibuat');
}

public function update(Request $request, $id)
{
    $tugas = AcademicTask::findOrFail($id);
    $tugas->update($request->validated());
    
    return redirect()->route('dosen.tugas.index')->with('success', 'Tugas berhasil diupdate');
}

public function destroy($id)
{
    $tugas = AcademicTask::findOrFail($id);
    $tugas->delete();
    
    return redirect()->route('dosen.tugas.index')->with('success', 'Tugas berhasil dihapus');
}

public function bulkAction(Request $request)
{
    $action = $request->action; // publish, archive, duplicate, delete
    $ids = $request->ids;
    
    switch ($action) {
        case 'publish':
            AcademicTask::whereIn('id', $ids)->update(['status' => 'published']);
            break;
        case 'archive':
            AcademicTask::whereIn('id', $ids)->update(['status' => 'closed']);
            break;
        case 'duplicate':
            foreach ($ids as $id) {
                $tugas = AcademicTask::find($id);
                $newTugas = $tugas->replicate();
                $newTugas->judul = $tugas->judul . ' (Copy)';
                $newTugas->status = 'draft';
                $newTugas->save();
            }
            break;
        case 'delete':
            AcademicTask::whereIn('id', $ids)->delete();
            break;
    }
    
    return redirect()->route('dosen.tugas.index')->with('success', 'Bulk action berhasil');
}

public function export(Request $request, $id)
{
    $tugas = AcademicTask::with(['submissions.mahasiswa'])->findOrFail($id);
    $format = $request->format; // excel, pdf, csv, json
    
    // Export logic based on format
    // Return download response
}
```


### Routes (routes/web.php)

```php
// Dosen Tugas Routes
Route::middleware(['auth:dosen'])->prefix('dosen')->name('dosen.')->group(function () {
    Route::get('/tugas', [TugasController::class, 'index'])->name('tugas.index');
    Route::post('/tugas', [TugasController::class, 'store'])->name('tugas.store');
    Route::get('/tugas/{id}', [TugasController::class, 'show'])->name('tugas.show');
    Route::patch('/tugas/{id}', [TugasController::class, 'update'])->name('tugas.update');
    Route::delete('/tugas/{id}', [TugasController::class, 'destroy'])->name('tugas.destroy');
    Route::post('/tugas/bulk-action', [TugasController::class, 'bulkAction'])->name('tugas.bulk-action');
    Route::get('/tugas/{id}/export', [TugasController::class, 'export'])->name('tugas.export');
    Route::get('/tugas/{id}/submissions', [TugasController::class, 'submissions'])->name('tugas.submissions');
    Route::post('/tugas/{id}/grade', [TugasController::class, 'grade'])->name('tugas.grade');
    Route::get('/tugas/{id}/analytics', [TugasController::class, 'analytics'])->name('tugas.analytics');
    Route::post('/tugas/{id}/duplicate', [TugasController::class, 'duplicate'])->name('tugas.duplicate');
    Route::post('/tugas/create-from-template', [TugasController::class, 'createFromTemplate'])->name('tugas.create-from-template');
});
```

---

## ANIMATION VARIANTS (EXACT dari Kas Admin)

```tsx
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
} as const;

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
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
} as const;

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { duration: 0.2 }
    },
    exit: { 
        opacity: 0,
        transition: { duration: 0.2 }
    },
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.2,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.15,
        },
    },
};
```

---

## KESIMPULAN

Menu Informasi Tugas Dosen ini harus menjadi sistem manajemen tugas yang SANGAT SANGAT ADVANCE dengan:

1. **UI/UX Premium:** Mengadopsi 100% warna, gradient, dan style dari Kas Admin
2. **10 Summary Cards:** Dengan glow effect dan hover animations
3. **4 View Modes:** List, Grid, Kanban, Calendar
4. **Detail Modal 10 Tabs:** Overview, Submissions, Grading, Analytics, Discussions, Files, Rubric, Plagiarism, Feedback, Settings
5. **Multi-step Create Modal:** 7 steps dengan validation dan preview
6. **Advanced Features:** Bulk operations, templates, analytics, notifications, real-time updates, mobile responsive, QR codes, attendance integration, collaboration, gamification, external integrations
7. **Professional Animations:** Smooth transitions, hover effects, loading states
8. **Complete Backend:** Controller methods, routes, database queries

**PENTING:** 
- TIDAK BOLEH ada improvisasi warna atau style
- Semua harus PERSIS mengikuti Kas Admin
- Gunakan Framer Motion untuk semua animations
- Gunakan Lucide React icons (BUKAN emoji)
- Minimal code, maksimal functionality
- Mobile responsive
- Dark mode support

---

**File yang perlu dimodifikasi:**
1. `resources/js/pages/dosen/tugas.tsx` (main file)
2. `app/Http/Controllers/Dosen/TugasController.php` (controller)
3. `routes/web.php` (routes)
4. `app/Models/AcademicTask.php` (model, jika perlu update)

**Dependencies yang mungkin perlu ditambahkan:**
- `@tanstack/react-table` (untuk advanced table)
- `recharts` (untuk charts di analytics)
- `react-beautiful-dnd` (untuk kanban drag & drop)
- `react-big-calendar` (untuk calendar view)
- `react-quill` (untuk rich text editor)

Selamat mengimplementasikan! 🚀
