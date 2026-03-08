# PROMPT: Weekly Learning Digest - View Mahasiswa (Read-Only)
## Ultra Advanced Complete Implementation

---

## 🎯 EXECUTIVE SUMMARY

Halaman **Weekly Learning Digest untuk Mahasiswa** adalah tampilan read-only yang menampilkan rekapan pembelajaran mingguan dari Web Mentari UNPAM. Mahasiswa dapat:

1. **Melihat Informasi Lengkap** - Semua konten digest dalam format yang mudah dibaca
2. **Navigasi Tab** - Berpindah antar section dengan smooth transition
3. **Akses Link Mentari** - Direct link ke forum, tugas, materi di Mentari
4. **Export PDF** - Download digest untuk offline reading
5. **Bookmark & Share** - Simpan dan bagikan digest
6. **Related Digests** - Lihat digest minggu lain dari mata kuliah yang sama

**Key Features:**
- UI/UX matching dashboard mahasiswa (warna, container, icon, responsive)
- NO container background pada header icon
- NO animated icon bergerak ke atas
- Mobile responsive seperti dashboard
- Tombol kembali sama dengan menu lain
- Icon card disesuaikan dengan warna container
- NO data dummy - semua data real dari database

---

## 📋 PART 1: CONTROLLER FOR MAHASISWA

### 1.1 Main Controller

**File: `app/Http/Controllers/User/WeeklyDigestController.php`**

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WeeklyLearningDigest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

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

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        $digests = $query->latest('week_start_date')->paginate(12);

        // Get current week digest
        $currentWeekDigest = WeeklyLearningDigest::published()
            ->currentWeek()
            ->whereIn('mata_kuliah_id', $enrolledCourses)
            ->first();

        // Stats
        $stats = [
            'total_digests' => WeeklyLearningDigest::published()
                ->whereIn('mata_kuliah_id', $enrolledCourses)
                ->count(),
            'current_week' => WeeklyLearningDigest::currentWeek()
                ->whereIn('mata_kuliah_id', $enrolledCourses)
                ->count(),
            'total_assignments' => WeeklyLearningDigest::published()
                ->whereIn('mata_kuliah_id', $enrolledCourses)
                ->withCount('assignments')
                ->get()
                ->sum('assignments_count'),
        ];

        return Inertia::render('user/weekly-digest/index', [
            'digests' => $digests,
            'currentWeekDigest' => $currentWeekDigest,
            'enrolledCourses' => $mahasiswa->enrollments()->with('mataKuliah')->get(),
            'stats' => $stats,
            'filters' => $request->only(['course_id', 'week', 'semester']),
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


    public function exportPdf($id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('login');
        }

        $digest = WeeklyLearningDigest::with([
            'mataKuliah.dosen',
            'forumDiscussions',
            'assignments',
            'learningMaterials',
            'announcements',
            'upcomingSchedules',
            'supportContacts',
        ])->findOrFail($id);

        // Check enrollment
        $isEnrolled = $mahasiswa->enrollments()
            ->where('mata_kuliah_id', $digest->mata_kuliah_id)
            ->exists();

        if (!$isEnrolled) {
            abort(403, 'Anda tidak terdaftar di mata kuliah ini');
        }

        $pdf = Pdf::loadView('pdf.weekly-digest', [
            'digest' => $digest,
            'mahasiswa' => $mahasiswa,
        ]);

        $filename = 'Weekly-Digest-' . $digest->week_number . '-' . date('Y-m-d') . '.pdf';
        
        return $pdf->download($filename);
    }
}
```

---

## 📋 PART 2: FRONTEND VIEW COMPONENT

### 2.1 Main Show Component

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
    CheckCircle, Info, Award, Sparkles, TrendingUp, Target, Copy,
    CheckCheck, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
    submission_start_date: string | null;
    max_score: number;
    submission_format: string | null;
    file_size_limit: string | null;
    detailed_instructions: string | null;
    grading_criteria: string | null;
    is_mandatory: boolean;
    is_late_submission_allowed: boolean;
}


interface LearningMaterial {
    id: number;
    material_title: string;
    material_description: string;
    material_type: string;
    mentari_material_url: string | null;
    file_name: string | null;
    file_size: string | null;
    duration: string | null;
    topics_covered: string | null;
    learning_objectives: string | null;
    is_downloadable: boolean;
    upload_date: string | null;
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
    duration_minutes: number | null;
    platform: string | null;
    meeting_link: string | null;
    meeting_id: string | null;
    meeting_password: string | null;
    is_mandatory: boolean;
    preparation_notes: string | null;
}

interface SupportContact {
    id: number;
    contact_name: string;
    contact_role: string;
    contact_type: string;
    contact_value: string;
    available_hours: string | null;
    response_time: string | null;
    notes: string | null;
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
    const [copiedLink, setCopiedLink] = useState(false);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr: string) => {
        return timeStr.substring(0, 5); // HH:MM
    };

    const getDeadlineStatus = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Terlewat', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
        if (diffDays === 0) return { label: 'Hari Ini', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
        if (diffDays <= 3) return { label: `${diffDays} Hari Lagi`, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
        return { label: `${diffDays} Hari Lagi`, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    };


    const getPriorityBadge = (priority: string) => {
        const badges = {
            critical: { label: 'Sangat Penting', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
            high: { label: 'Penting', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
            normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Info },
            low: { label: 'Rendah', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', icon: Info },
        };
        return badges[priority as keyof typeof badges] || badges.normal;
    };

    const getAnnouncementTypeBadge = (type: string) => {
        const badges = {
            urgent: { label: 'Mendesak', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
            important: { label: 'Penting', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
            reminder: { label: 'Pengingat', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
            info: { label: 'Informasi', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400' },
        };
        return badges[type as keyof typeof badges] || badges.info;
    };

    const getAssignmentTypeBadge = (type: string) => {
        const badges = {
            individual: { label: 'Individu', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
            group: { label: 'Kelompok', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
            quiz: { label: 'Kuis', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
            project: { label: 'Proyek', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        };
        return badges[type as keyof typeof badges] || badges.individual;
    };

    const getEventTypeBadge = (type: string) => {
        const badges = {
            live_session: { label: 'Live Session', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Video },
            webinar: { label: 'Webinar', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Users },
            quiz: { label: 'Kuis', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FileText },
            exam: { label: 'Ujian', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
            deadline: { label: 'Deadline', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
            meeting: { label: 'Meeting', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Users },
            other: { label: 'Lainnya', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', icon: Calendar },
        };
        return badges[type as keyof typeof badges] || badges.other;
    };


    const materialTypeIcons = {
        pdf: { icon: FileText, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
        video: { icon: Video, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        slide: { icon: FileDown, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        document: { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        link: { icon: LinkIcon, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
        other: { icon: FileText, color: 'text-neutral-600', bg: 'bg-neutral-100 dark:bg-neutral-800' },
    };

    const contactTypeIcons = {
        email: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        phone: { icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        whatsapp: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
        telegram: { icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
        other: { icon: Phone, color: 'text-neutral-600', bg: 'bg-neutral-100 dark:bg-neutral-800' },
    };

    const totalItems = 
        digest.forum_discussions.length +
        digest.assignments.length +
        digest.learning_materials.length +
        digest.announcements.length +
        digest.upcoming_schedules.length;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: digest.title,
                text: `${digest.title} - ${digest.mata_kuliah.nama}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const handleExportPdf = () => {
        window.location.href = route('user.weekly-digest.export-pdf', digest.id);
    };


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
                    className="flex flex-col gap-4"
                >
                    {/* Back Button - Same as other menus */}
                    <motion.button
                        onClick={() => router.visit(route('user.weekly-digest.index'))}
                        className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors w-fit"
                        whileHover={{ x: -4 }}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">Kembali ke Daftar Digest</span>
                    </motion.button>

                    {/* Header with Icon - NO CONTAINER on icon */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* Icon Header - NO CONTAINER, NO ANIMATION */}
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
                                onClick={() => setIsSaved(!isSaved)}
                                className={`rounded-xl ${isSaved ? 'text-amber-600 border-amber-600 bg-amber-50 dark:bg-amber-900/20' : ''}`}
                            >
                                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                                <span className="ml-2 hidden sm:inline">{isSaved ? 'Tersimpan' : 'Simpan'}</span>
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
                        </div>
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
                            label: 'Periode', 
                            value: `${new Date(digest.week_start_date).getDate()} - ${new Date(digest.week_end_date).getDate()}`,
                            icon: CourseIcon,
                            gradient: 'from-emerald-500 to-teal-500',
                            subtext: new Date(digest.week_start_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
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
                                    {/* Icon card - disesuaikan dengan warna container */}
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
                                        className="inline-flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Buka Course di Mentari</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ TABS NAVIGATION ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-none border-b border-neutral-200 dark:border-neutral-700">
                            <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap">
                                <Sparkles className="h-4 w-4" />
                                <span>Overview</span>
                            </TabsTrigger>
                            {digest.forum_discussions.length > 0 && (
                                <TabsTrigger value="forums" className="flex items-center gap-2 whitespace-nowrap">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Forum ({digest.forum_discussions.length})</span>
                                </TabsTrigger>
                            )}
                            {digest.assignments.length > 0 && (
                                <TabsTrigger value="assignments" className="flex items-center gap-2 whitespace-nowrap">
                                    <FileText className="h-4 w-4" />
                                    <span>Tugas ({digest.assignments.length})</span>
                                </TabsTrigger>
                            )}
                            {digest.learning_materials.length > 0 && (
                                <TabsTrigger value="materials" className="flex items-center gap-2 whitespace-nowrap">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Materi ({digest.learning_materials.length})</span>
                                </TabsTrigger>
                            )}
                            {digest.announcements.length > 0 && (
                                <TabsTrigger value="announcements" className="flex items-center gap-2 whitespace-nowrap">
                                    <Bell className="h-4 w-4" />
                                    <span>Pengumuman ({digest.announcements.length})</span>
                                </TabsTrigger>
                            )}
                            {digest.upcoming_schedules.length > 0 && (
                                <TabsTrigger value="schedules" className="flex items-center gap-2 whitespace-nowrap">
                                    <Calendar className="h-4 w-4" />
                                    <span>Jadwal ({digest.upcoming_schedules.length})</span>
                                </TabsTrigger>
                            )}
                            {digest.support_contacts.length > 0 && (
                                <TabsTrigger value="contacts" className="flex items-center gap-2 whitespace-nowrap">
                                    <Users className="h-4 w-4" />
                                    <span>Kontak</span>
                                </TabsTrigger>
                            )}
                        </TabsList>


                        {/* ═══════ TAB: OVERVIEW ═══════ */}
                        <TabsContent value="overview" className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Quick Stats */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        Ringkasan Konten
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Forum Diskusi', count: digest.forum_discussions.length, icon: MessageSquare, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                                            { label: 'Tugas/Assignment', count: digest.assignments.length, icon: FileText, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
                                            { label: 'Materi Pembelajaran', count: digest.learning_materials.length, icon: BookOpen, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                                            { label: 'Pengumuman', count: digest.announcements.length, icon: Bell, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
                                            { label: 'Jadwal Mendatang', count: digest.upcoming_schedules.length, icon: Calendar, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
                                        ].map((item, idx) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center`}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <span className="font-medium text-neutral-900 dark:text-white">{item.label}</span>
                                                    </div>
                                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">{item.count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Urgent Items */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Target className="h-5 w-5 text-red-600" />
                                        Perlu Perhatian
                                    </h3>
                                    <div className="space-y-3">
                                        {/* Urgent Announcements */}
                                        {digest.announcements.filter(a => a.priority_level === 'critical' || a.priority_level === 'high').slice(0, 3).map((announcement, idx) => {
                                            const badge = getPriorityBadge(announcement.priority_level);
                                            const Icon = badge.icon;
                                            return (
                                                <div key={idx} className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                                    <div className="flex items-start gap-3">
                                                        <Icon className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-neutral-900 dark:text-white">{announcement.announcement_title}</p>
                                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{announcement.announcement_content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Upcoming Deadlines */}
                                        {digest.assignments.filter(a => {
                                            const deadline = new Date(a.deadline_date);
                                            const now = new Date();
                                            const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                            return diffDays >= 0 && diffDays <= 7;
                                        }).slice(0, 3).map((assignment, idx) => {
                                            const status = getDeadlineStatus(assignment.deadline_date);
                                            return (
                                                <div key={idx} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                    <div className="flex items-start gap-3">
                                                        <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-neutral-900 dark:text-white">{assignment.assignment_title}</p>
                                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                                Deadline: {formatDate(assignment.deadline_date)}
                                                            </p>
                                                            <Badge className={`mt-2 ${status.color}`}>{status.label}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {digest.announcements.filter(a => a.priority_level === 'critical' || a.priority_level === 'high').length === 0 &&
                                         digest.assignments.filter(a => {
                                            const deadline = new Date(a.deadline_date);
                                            const now = new Date();
                                            const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                            return diffDays >= 0 && diffDays <= 7;
                                         }).length === 0 && (
                                            <div className="p-8 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                                                <p className="text-neutral-600 dark:text-neutral-400">Tidak ada item mendesak saat ini</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>


                        {/* ═══════ TAB: FORUM DISCUSSIONS ═══════ */}
                        <TabsContent value="forums" className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                    Forum Diskusi Minggu Ini
                                </h3>
                                <Badge variant="secondary">{digest.forum_discussions.length} Topik</Badge>
                            </div>

                            {digest.forum_discussions.length === 0 ? (
                                <div className="p-12 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                    <MessageSquare className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-600 dark:text-neutral-400">Belum ada forum diskusi minggu ini</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {digest.forum_discussions.map((forum, idx) => (
                                        <motion.div
                                            key={forum.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                                                    <MessageSquare className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                            {forum.topic_title}
                                                        </h4>
                                                        {forum.topic_description && (
                                                            <p className="text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                                                                {forum.topic_description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                            <MessageSquare className="h-4 w-4" />
                                                            <span>{forum.total_posts} Posts</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                            <Users className="h-4 w-4" />
                                                            <span>{forum.total_participants} Partisipan</span>
                                                        </div>
                                                        {forum.discussion_date && (
                                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>{formatDate(forum.discussion_date)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Key Points */}
                                                    {forum.key_points && (
                                                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                                                                <Award className="h-4 w-4" />
                                                                Poin Penting:
                                                            </p>
                                                            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                                                                {forum.key_points}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Best Contributions */}
                                                    {forum.best_contributions && (
                                                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                                            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
                                                                <Sparkles className="h-4 w-4" />
                                                                Kontribusi Terbaik:
                                                            </p>
                                                            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                                                                {forum.best_contributions}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Link to Mentari */}
                                                    {forum.mentari_forum_url && (
                                                        <a
                                                            href={forum.mentari_forum_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            <span>Buka Forum di Mentari</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>


                        {/* ═══════ TAB: ASSIGNMENTS ═══════ */}
                        <TabsContent value="assignments" className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                    Tugas & Assignment
                                </h3>
                                <Badge variant="secondary">{digest.assignments.length} Tugas</Badge>
                            </div>

                            {digest.assignments.length === 0 ? (
                                <div className="p-12 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                    <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-600 dark:text-neutral-400">Belum ada tugas minggu ini</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {digest.assignments.map((assignment, idx) => {
                                        const deadlineStatus = getDeadlineStatus(assignment.deadline_date);
                                        const typeBadge = getAssignmentTypeBadge(assignment.assignment_type);
                                        
                                        return (
                                            <motion.div
                                                key={assignment.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                                                        <FileText className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                                    {assignment.assignment_title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <Badge className={typeBadge.color}>{typeBadge.label}</Badge>
                                                                    {assignment.is_mandatory && (
                                                                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                            Wajib
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {assignment.assignment_description && (
                                                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                                    {assignment.assignment_description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Deadline Info */}
                                                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Clock className="h-5 w-5 text-amber-600" />
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                            Deadline: {formatDate(assignment.deadline_date)}
                                                                        </p>
                                                                        {assignment.submission_start_date && (
                                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                                                                Mulai: {formatDate(assignment.submission_start_date)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Badge className={deadlineStatus.color}>{deadlineStatus.label}</Badge>
                                                            </div>
                                                        </div>

                                                        {/* Assignment Details */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Nilai Maksimal</p>
                                                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{assignment.max_score}</p>
                                                            </div>
                                                            {assignment.submission_format && (
                                                                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Format Pengumpulan</p>
                                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{assignment.submission_format}</p>
                                                                </div>
                                                            )}
                                                            {assignment.file_size_limit && (
                                                                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Batas Ukuran File</p>
                                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{assignment.file_size_limit}</p>
                                                                </div>
                                                            )}
                                                            {assignment.is_late_submission_allowed && (
                                                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Keterlambatan</p>
                                                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Diizinkan</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Detailed Instructions */}
                                                        {assignment.detailed_instructions && (
                                                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                                                                    <Info className="h-4 w-4" />
                                                                    Instruksi Lengkap:
                                                                </p>
                                                                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                                                                    {assignment.detailed_instructions}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Grading Criteria */}
                                                        {assignment.grading_criteria && (
                                                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                                                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Kriteria Penilaian:
                                                                </p>
                                                                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                                                                    {assignment.grading_criteria}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Link to Mentari */}
                                                        {assignment.mentari_assignment_url && (
                                                            <a
                                                                href={assignment.mentari_assignment_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                <span>Kerjakan di Mentari</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>


                        {/* ═══════ TAB: LEARNING MATERIALS ═══════ */}
                        <TabsContent value="materials" className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                    Materi Pembelajaran
                                </h3>
                                <Badge variant="secondary">{digest.learning_materials.length} Materi</Badge>
                            </div>

                            {digest.learning_materials.length === 0 ? (
                                <div className="p-12 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                    <BookOpen className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-600 dark:text-neutral-400">Belum ada materi minggu ini</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {digest.learning_materials.map((material, idx) => {
                                        const typeInfo = materialTypeIcons[material.material_type as keyof typeof materialTypeIcons] || materialTypeIcons.other;
                                        const Icon = typeInfo.icon;
                                        
                                        return (
                                            <motion.div
                                                key={material.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`h-12 w-12 rounded-xl ${typeInfo.bg} flex items-center justify-center shrink-0`}>
                                                        <Icon className={`h-6 w-6 ${typeInfo.color}`} />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                                    {material.material_title}
                                                                </h4>
                                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                                                                    {material.material_type}
                                                                </Badge>
                                                            </div>
                                                            {material.material_description && (
                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                                    {material.material_description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Material Info */}
                                                        <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                                                            {material.file_size && (
                                                                <div className="flex items-center gap-1">
                                                                    <FileDown className="h-3 w-3" />
                                                                    <span>{material.file_size}</span>
                                                                </div>
                                                            )}
                                                            {material.duration && (
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>{material.duration}</span>
                                                                </div>
                                                            )}
                                                            {material.upload_date && (
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>{formatDate(material.upload_date)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Topics Covered */}
                                                        {material.topics_covered && (
                                                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Topik yang Dibahas:</p>
                                                                <p className="text-xs text-neutral-700 dark:text-neutral-300">
                                                                    {material.topics_covered}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Learning Objectives */}
                                                        {material.learning_objectives && (
                                                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                                                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Tujuan Pembelajaran:</p>
                                                                <p className="text-xs text-neutral-700 dark:text-neutral-300">
                                                                    {material.learning_objectives}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            {material.mentari_material_url && (
                                                                <a
                                                                    href={material.mentari_material_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                    <span>Buka Materi</span>
                                                                </a>
                                                            )}
                                                            {material.is_downloadable && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-xl"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>


                        {/* ═══════ TAB: ANNOUNCEMENTS ═══════ */}
                        <TabsContent value="announcements" className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-amber-600" />
                                    Pengumuman
                                </h3>
                                <Badge variant="secondary">{digest.announcements.length} Pengumuman</Badge>
                            </div>

                            {digest.announcements.length === 0 ? (
                                <div className="p-12 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                    <Bell className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-600 dark:text-neutral-400">Belum ada pengumuman minggu ini</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {digest.announcements.map((announcement, idx) => {
                                        const priorityBadge = getPriorityBadge(announcement.priority_level);
                                        const typeBadge = getAnnouncementTypeBadge(announcement.announcement_type);
                                        const PriorityIcon = priorityBadge.icon;
                                        
                                        return (
                                            <motion.div
                                                key={announcement.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`p-6 rounded-2xl bg-white dark:bg-neutral-800 border-2 ${
                                                    announcement.is_pinned 
                                                        ? 'border-amber-400 dark:border-amber-600' 
                                                        : 'border-neutral-200 dark:border-neutral-700'
                                                } hover:shadow-lg transition-shadow relative overflow-hidden`}
                                            >
                                                {announcement.is_pinned && (
                                                    <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-bl-xl">
                                                        Disematkan
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-start gap-4">
                                                    <div className={`h-12 w-12 rounded-xl ${priorityBadge.color.replace('text-', 'bg-').replace('700', '100').replace('400', '100')} flex items-center justify-center shrink-0`}>
                                                        <PriorityIcon className={`h-6 w-6 ${priorityBadge.color.split(' ')[0]}`} />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                                    {announcement.announcement_title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <Badge className={typeBadge.color}>{typeBadge.label}</Badge>
                                                                    <Badge className={priorityBadge.color}>{priorityBadge.label}</Badge>
                                                                </div>
                                                            </div>
                                                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                                                                {announcement.announcement_content}
                                                            </p>
                                                        </div>

                                                        {announcement.announced_date && (
                                                            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>Diumumkan: {formatDate(announcement.announced_date)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>


                        {/* ═══════ TAB: UPCOMING SCHEDULES ═══════ */}
                        <TabsContent value="schedules" className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-rose-600" />
                                    Jadwal Mendatang
                                </h3>
                                <Badge variant="secondary">{digest.upcoming_schedules.length} Acara</Badge>
                            </div>

                            {digest.upcoming_schedules.length === 0 ? (
                                <div className="p-12 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                    <Calendar className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-600 dark:text-neutral-400">Belum ada jadwal mendatang</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {digest.upcoming_schedules.map((schedule, idx) => {
                                        const eventBadge = getEventTypeBadge(schedule.event_type);
                                        const EventIcon = eventBadge.icon;
                                        
                                        return (
                                            <motion.div
                                                key={schedule.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`h-12 w-12 rounded-xl ${eventBadge.color.replace('text-', 'bg-').replace('700', '100').replace('400', '100')} flex items-center justify-center shrink-0`}>
                                                        <EventIcon className={`h-6 w-6 ${eventBadge.color.split(' ')[0]}`} />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                                    {schedule.event_title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <Badge className={eventBadge.color}>{eventBadge.label}</Badge>
                                                                    {schedule.is_mandatory && (
                                                                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                            Wajib
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {schedule.event_description && (
                                                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                                    {schedule.event_description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Date & Time Info */}
                                                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div className="flex items-center gap-3">
                                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                                    <div>
                                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Tanggal</p>
                                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                            {formatDate(schedule.event_date)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {schedule.event_time && (
                                                                    <div className="flex items-center gap-3">
                                                                        <Clock className="h-5 w-5 text-blue-600" />
                                                                        <div>
                                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400">Waktu</p>
                                                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                                {formatTime(schedule.event_time)} WIB
                                                                                {schedule.duration_minutes && ` (${schedule.duration_minutes} menit)`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Platform & Meeting Info */}
                                                        {(schedule.platform || schedule.meeting_link) && (
                                                            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 space-y-3">
                                                                {schedule.platform && (
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="h-4 w-4 text-purple-600" />
                                                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                            Platform: {schedule.platform}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {schedule.meeting_id && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-neutral-600 dark:text-neutral-400">Meeting ID:</span>
                                                                        <code className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded">
                                                                            {schedule.meeting_id}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                                {schedule.meeting_password && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-neutral-600 dark:text-neutral-400">Password:</span>
                                                                        <code className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded">
                                                                            {schedule.meeting_password}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                                {schedule.meeting_link && (
                                                                    <a
                                                                        href={schedule.meeting_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
                                                                    >
                                                                        <ExternalLink className="h-4 w-4" />
                                                                        <span>Join Meeting</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Preparation Notes */}
                                                        {schedule.preparation_notes && (
                                                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                                                                    <Info className="h-4 w-4" />
                                                                    Persiapan:
                                                                </p>
                                                                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                                                                    {schedule.preparation_notes}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>


                        {/* ═══════ TAB: SUPPORT CONTACTS ═══════ */}
                        <TabsContent value="contacts" className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Users className="h-5 w-5 text-teal-600" />
                                    Kontak Support
                                </h3>
                                <Badge variant="secondary">{digest.support_contacts.length} Kontak</Badge>
                            </div>

                            {digest.support_contacts.length === 0 ? (
                                <div className="p-12 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                    <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-600 dark:text-neutral-400">Belum ada kontak support</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {digest.support_contacts.map((contact, idx) => {
                                        const contactInfo = contactTypeIcons[contact.contact_type as keyof typeof contactTypeIcons] || contactTypeIcons.other;
                                        const ContactIcon = contactInfo.icon;
                                        
                                        return (
                                            <motion.div
                                                key={contact.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`h-12 w-12 rounded-xl ${contactInfo.bg} flex items-center justify-center shrink-0`}>
                                                        <ContactIcon className={`h-6 w-6 ${contactInfo.color}`} />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                                {contact.contact_name}
                                                            </h4>
                                                            {contact.contact_role && (
                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                    {contact.contact_role}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Contact Value */}
                                                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 capitalize">
                                                                {contact.contact_type}
                                                            </p>
                                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white break-all">
                                                                {contact.contact_value}
                                                            </p>
                                                        </div>

                                                        {/* Availability */}
                                                        {contact.available_hours && (
                                                            <div className="flex items-start gap-2 text-sm">
                                                                <Clock className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Jam Tersedia</p>
                                                                    <p className="text-neutral-900 dark:text-white">{contact.available_hours}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Response Time */}
                                                        {contact.response_time && (
                                                            <div className="flex items-start gap-2 text-sm">
                                                                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Waktu Respon</p>
                                                                    <p className="text-neutral-900 dark:text-white">{contact.response_time}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Notes */}
                                                        {contact.notes && (
                                                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                                <p className="text-xs text-neutral-700 dark:text-neutral-300">
                                                                    {contact.notes}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Contact Action */}
                                                        <Button
                                                            onClick={() => {
                                                                if (contact.contact_type === 'email') {
                                                                    window.location.href = `mailto:${contact.contact_value}`;
                                                                } else if (contact.contact_type === 'phone') {
                                                                    window.location.href = `tel:${contact.contact_value}`;
                                                                } else if (contact.contact_type === 'whatsapp') {
                                                                    window.open(`https://wa.me/${contact.contact_value.replace(/\D/g, '')}`, '_blank');
                                                                } else {
                                                                    navigator.clipboard.writeText(contact.contact_value);
                                                                }
                                                            }}
                                                            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                                                        >
                                                            <ContactIcon className="h-4 w-4 mr-2" />
                                                            <span>Hubungi</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>


                {/* ═══════ RELATED DIGESTS SIDEBAR ═══════ */}
                {relatedDigests.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                    >
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            Digest Lainnya
                        </h3>
                        <div className="space-y-3">
                            {relatedDigests.map((related, idx) => (
                                <motion.button
                                    key={related.id}
                                    onClick={() => router.visit(route('user.weekly-digest.show', related.id))}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    className="w-full p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                                            <span className="text-white font-bold">{related.week_number}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-neutral-900 dark:text-white truncate">
                                                {related.title}
                                            </p>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                {new Date(related.week_start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(related.week_end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                        <ArrowLeft className="h-4 w-4 text-neutral-400 rotate-180" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </StudentLayout>
    );
}
```

---

## 📋 PART 3: ROUTES CONFIGURATION

### 3.1 Web Routes

**File: `routes/web.php`**

```php
// Mahasiswa Routes - Weekly Digest
Route::middleware(['auth:mahasiswa'])->prefix('mahasiswa')->name('user.')->group(function () {
    Route::get('/weekly-digest', [UserWeeklyDigestController::class, 'index'])->name('weekly-digest.index');
    Route::get('/weekly-digest/{id}', [UserWeeklyDigestController::class, 'show'])->name('weekly-digest.show');
    Route::get('/weekly-digest/{id}/export-pdf', [UserWeeklyDigestController::class, 'exportPdf'])->name('weekly-digest.export-pdf');
});
```

---

## 📋 PART 4: PDF EXPORT VIEW

### 4.1 PDF Blade Template

**File: `resources/views/pdf/weekly-digest.blade.php`**

```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $digest->title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 24pt;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 12pt;
            opacity: 0.9;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .info-item {
            display: table-cell;
            width: 25%;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
        }
        .info-label {
            font-size: 9pt;
            color: #6c757d;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 14pt;
            font-weight: bold;
            color: #212529;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 16pt;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .item-card {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
        }
        .item-title {
            font-size: 13pt;
            font-weight: bold;
            color: #212529;
            margin-bottom: 10px;
        }
        .item-content {
            font-size: 10pt;
            color: #495057;
            margin-bottom: 10px;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 8pt;
            font-weight: bold;
            margin-right: 5px;
        }
        .badge-primary { background: #e7f3ff; color: #0066cc; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            font-size: 9pt;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>{{ $digest->title }}</h1>
        <p>{{ $digest->mata_kuliah->nama }} • {{ $digest->mata_kuliah->dosen->nama }}</p>
        <p>Minggu {{ $digest->week_number }} • {{ $digest->semester }}</p>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
        <div class="info-item">
            <div class="info-label">Periode</div>
            <div class="info-value">
                {{ \Carbon\Carbon::parse($digest->week_start_date)->format('d M') }} - 
                {{ \Carbon\Carbon::parse($digest->week_end_date)->format('d M Y') }}
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Forum</div>
            <div class="info-value">{{ $digest->forumDiscussions->count() }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Tugas</div>
            <div class="info-value">{{ $digest->assignments->count() }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Materi</div>
            <div class="info-value">{{ $digest->learningMaterials->count() }}</div>
        </div>
    </div>

    @if($digest->description)
    <!-- Description -->
    <div class="section">
        <div class="section-title">Deskripsi</div>
        <div class="item-content">{{ $digest->description }}</div>
    </div>
    @endif


    @if($digest->forumDiscussions->count() > 0)
    <!-- Forum Discussions -->
    <div class="section">
        <div class="section-title">Forum Diskusi</div>
        @foreach($digest->forumDiscussions as $forum)
        <div class="item-card">
            <div class="item-title">{{ $forum->topic_title }}</div>
            @if($forum->topic_description)
            <div class="item-content">{{ $forum->topic_description }}</div>
            @endif
            <div style="margin: 10px 0;">
                <span class="badge badge-primary">{{ $forum->total_posts }} Posts</span>
                <span class="badge badge-primary">{{ $forum->total_participants }} Partisipan</span>
            </div>
            @if($forum->key_points)
            <div style="background: #e7f3ff; padding: 10px; border-radius: 4px; margin-top: 10px;">
                <strong>Poin Penting:</strong><br>
                {{ $forum->key_points }}
            </div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    @if($digest->assignments->count() > 0)
    <!-- Assignments -->
    <div class="section">
        <div class="section-title">Tugas & Assignment</div>
        @foreach($digest->assignments as $assignment)
        <div class="item-card">
            <div class="item-title">{{ $assignment->assignment_title }}</div>
            @if($assignment->assignment_description)
            <div class="item-content">{{ $assignment->assignment_description }}</div>
            @endif
            <div style="margin: 10px 0;">
                <span class="badge badge-success">{{ ucfirst($assignment->assignment_type) }}</span>
                @if($assignment->is_mandatory)
                <span class="badge badge-danger">Wajib</span>
                @endif
            </div>
            <div style="background: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 10px;">
                <strong>Deadline:</strong> {{ \Carbon\Carbon::parse($assignment->deadline_date)->format('d F Y, H:i') }} WIB<br>
                <strong>Nilai Maksimal:</strong> {{ $assignment->max_score }}
            </div>
            @if($assignment->detailed_instructions)
            <div style="margin-top: 10px;">
                <strong>Instruksi:</strong><br>
                {{ $assignment->detailed_instructions }}
            </div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    @if($digest->learningMaterials->count() > 0)
    <!-- Learning Materials -->
    <div class="section">
        <div class="section-title">Materi Pembelajaran</div>
        @foreach($digest->learningMaterials as $material)
        <div class="item-card">
            <div class="item-title">{{ $material->material_title }}</div>
            @if($material->material_description)
            <div class="item-content">{{ $material->material_description }}</div>
            @endif
            <div style="margin: 10px 0;">
                <span class="badge badge-primary">{{ strtoupper($material->material_type) }}</span>
                @if($material->file_size)
                <span class="badge badge-primary">{{ $material->file_size }}</span>
                @endif
                @if($material->duration)
                <span class="badge badge-primary">{{ $material->duration }}</span>
                @endif
            </div>
            @if($material->topics_covered)
            <div style="margin-top: 10px;">
                <strong>Topik:</strong> {{ $material->topics_covered }}
            </div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    @if($digest->announcements->count() > 0)
    <!-- Announcements -->
    <div class="section">
        <div class="section-title">Pengumuman</div>
        @foreach($digest->announcements as $announcement)
        <div class="item-card">
            <div class="item-title">{{ $announcement->announcement_title }}</div>
            <div style="margin: 10px 0;">
                <span class="badge badge-warning">{{ ucfirst($announcement->announcement_type) }}</span>
                <span class="badge badge-danger">{{ ucfirst($announcement->priority_level) }}</span>
            </div>
            <div class="item-content">{{ $announcement->announcement_content }}</div>
        </div>
        @endforeach
    </div>
    @endif

    @if($digest->upcomingSchedules->count() > 0)
    <!-- Upcoming Schedules -->
    <div class="section">
        <div class="section-title">Jadwal Mendatang</div>
        @foreach($digest->upcomingSchedules as $schedule)
        <div class="item-card">
            <div class="item-title">{{ $schedule->event_title }}</div>
            @if($schedule->event_description)
            <div class="item-content">{{ $schedule->event_description }}</div>
            @endif
            <div style="margin: 10px 0;">
                <span class="badge badge-success">{{ ucfirst(str_replace('_', ' ', $schedule->event_type)) }}</span>
                @if($schedule->is_mandatory)
                <span class="badge badge-danger">Wajib</span>
                @endif
            </div>
            <div style="background: #e7f3ff; padding: 10px; border-radius: 4px; margin-top: 10px;">
                <strong>Tanggal:</strong> {{ \Carbon\Carbon::parse($schedule->event_date)->format('d F Y') }}<br>
                @if($schedule->event_time)
                <strong>Waktu:</strong> {{ substr($schedule->event_time, 0, 5) }} WIB<br>
                @endif
                @if($schedule->platform)
                <strong>Platform:</strong> {{ $schedule->platform }}
                @endif
            </div>
        </div>
        @endforeach
    </div>
    @endif

    @if($digest->supportContacts->count() > 0)
    <!-- Support Contacts -->
    <div class="section">
        <div class="section-title">Kontak Support</div>
        @foreach($digest->supportContacts as $contact)
        <div class="item-card">
            <div class="item-title">{{ $contact->contact_name }}</div>
            @if($contact->contact_role)
            <div class="item-content">{{ $contact->contact_role }}</div>
            @endif
            <div style="margin: 10px 0;">
                <strong>{{ ucfirst($contact->contact_type) }}:</strong> {{ $contact->contact_value }}
            </div>
            @if($contact->available_hours)
            <div style="font-size: 9pt; color: #6c757d;">
                Tersedia: {{ $contact->available_hours }}
            </div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>Dokumen ini digenerate otomatis dari sistem Weekly Learning Digest</p>
        <p>Universitas Pamulang • {{ now()->format('d F Y, H:i') }} WIB</p>
        <p>Mahasiswa: {{ $mahasiswa->nama }} ({{ $mahasiswa->nim }})</p>
    </div>
</body>
</html>
```

---

## 📋 PART 5: ADVANCED FEATURES & OPTIMIZATIONS

### 5.1 Additional Features

**1. Bookmark/Save Functionality**
- Implement user_digest_bookmarks table
- Track saved digests per mahasiswa
- Quick access to saved digests

**2. Reading Progress Tracking**
- Track which sections mahasiswa has viewed
- Show progress indicator
- Mark digest as "read"

**3. Notification Integration**
- Notify mahasiswa when new digest is published
- Reminder for upcoming deadlines from digest
- Weekly digest summary email

**4. Search & Filter**
- Search within digest content
- Filter by week, semester, course
- Quick navigation to specific sections

**5. Mobile App Integration**
- Responsive design optimized for mobile
- Offline reading capability
- Push notifications for new digests

### 5.2 Performance Optimizations

```php
// Eager loading to prevent N+1 queries
$digest = WeeklyLearningDigest::with([
    'mataKuliah.dosen',
    'forumDiscussions',
    'assignments',
    'learningMaterials',
    'announcements',
    'upcomingSchedules',
    'supportContacts',
])->findOrFail($id);

// Caching for frequently accessed digests
$digest = Cache::remember("digest.{$id}", 3600, function() use ($id) {
    return WeeklyLearningDigest::with([...])->findOrFail($id);
});

// Pagination for large lists
$digests = WeeklyLearningDigest::published()
    ->whereIn('mata_kuliah_id', $enrolledCourses)
    ->latest('week_start_date')
    ->paginate(12);
```

### 5.3 Security Considerations

```php
// Ensure mahasiswa can only access digests from enrolled courses
$isEnrolled = $mahasiswa->enrollments()
    ->where('mata_kuliah_id', $digest->mata_kuliah_id)
    ->exists();

if (!$isEnrolled) {
    abort(403, 'Anda tidak terdaftar di mata kuliah ini');
}

// Rate limiting for PDF exports
Route::middleware(['throttle:10,1'])->group(function () {
    Route::get('/weekly-digest/{id}/export-pdf', [UserWeeklyDigestController::class, 'exportPdf']);
});
```

---

## 📋 PART 6: UI/UX GUIDELINES

### 6.1 Design Principles

1. **Consistency with Dashboard**
   - Use same color scheme as mahasiswa dashboard
   - Match icon styles and sizes
   - Consistent spacing and typography

2. **No Container on Header Icon**
   - Icon displayed directly without background container
   - Clean, minimal header design

3. **No Animated Icons**
   - Static icons, no floating or moving animations
   - Smooth transitions only on user interaction

4. **Mobile Responsive**
   - Stack cards vertically on mobile
   - Horizontal scroll for tabs
   - Touch-friendly button sizes
   - Optimized for small screens

5. **Icon-Container Color Harmony**
   - Icon colors complement container backgrounds
   - Consistent color palette across all cards
   - High contrast for readability

6. **No Dummy Data**
   - All data from real database
   - Empty states with helpful messages
   - Loading states for async operations

---

## 🎯 IMPLEMENTATION CHECKLIST

- [ ] Create database migrations for all tables
- [ ] Implement Laravel models with relationships
- [ ] Create admin controller with CRUD operations
- [ ] Create mahasiswa controller (read-only)
- [ ] Build admin multi-step form component
- [ ] Build mahasiswa view component with tabs
- [ ] Implement PDF export functionality
- [ ] Add routes configuration
- [ ] Test enrollment verification
- [ ] Test mobile responsiveness
- [ ] Optimize database queries
- [ ] Add caching layer
- [ ] Implement bookmark feature
- [ ] Add notification integration
- [ ] Test PDF generation
- [ ] Security audit
- [ ] Performance testing
- [ ] User acceptance testing

---

## 📝 NOTES

- Semua UI/UX harus matching dengan dashboard mahasiswa
- Icon header TANPA container background
- TIDAK ADA animasi icon bergerak
- Mobile responsive seperti dashboard
- Icon card disesuaikan dengan warna container
- TIDAK ADA data dummy
- Read-only untuk mahasiswa (tidak bisa edit)
- Export PDF tersedia untuk mahasiswa
- Bookmark dan share functionality
- Related digests untuk navigasi mudah

---

**END OF PROMPT**
