import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentLayout from '@/layouts/student-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Award,
    Bell,
    Bookmark,
    BookOpen,
    Calendar,
    CheckCheck,
    CheckCircle,
    Clock,
    Download,
    ExternalLink,
    FileDown,
    FileText,
    Info,
    Link as LinkIcon,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Share2,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Video,
} from 'lucide-react';
import { useState } from 'react';

import CourseIcon from '@/assets/admin/dashboard/hadir-icon.png';
import ItemsIcon from '@/assets/admin/dashboard/selfie-icon.png';
import WeekIcon from '@/assets/admin/dashboard/total-icon.png';
import DigestIcon from '@/assets/mahasiswa/akademik/akademik.png';

interface Course {
    id: number;
    name: string;
    code: string;
    dosen_name?: string;
    meeting_number: number;
    title: string | null;
}
interface ForumDiscussion {
    id: number;
    topic_title: string;
    topic_description: string | null;
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
    assignment_description: string | null;
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
    material_description: string | null;
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
    event_description: string | null;
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
    contact_role: string | null;
    contact_type: string;
    contact_value: string;
    available_hours: string | null;
    response_time: string | null;
    notes: string | null;
}

interface Digest {
    id: number;
    courses: Course[];
    display_title: string;
    week_number: number;
    semester: string;
    week_range: string;
    week_start_date: string;
    week_end_date: string;
    description: string | null;
    has_structured_task: boolean;
    forum_posts_required: number;
    mentari_course_url: string | null;
    is_published: boolean;
    published_at: string | null;
    creator_name: string | null;
    forum_discussions: ForumDiscussion[];
    assignments: Assignment[];
    learning_materials: LearningMaterial[];
    announcements: Announcement[];
    upcoming_schedules: UpcomingSchedule[];
    support_contacts: SupportContact[];
}

interface Props {
    digest: Digest;
    relatedDigests: {
        id: number;
        display_title: string;
        week_number: number;
        semester: string;
        week_range: string;
    }[];
    mahasiswa: { id: number; nama: string; nim: string };
}

const cV = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
} as const;
const iV = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
} as const;

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

const deadlineStatus = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 864e5);
    if (diff < 0)
        return {
            label: 'Terlewat',
            c: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
    if (diff === 0)
        return {
            label: 'Hari Ini',
            c: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        };
    if (diff <= 3)
        return {
            label: `${diff} Hari Lagi`,
            c: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        };
    return {
        label: `${diff} Hari Lagi`,
        c: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
};

const priorityBadges: Record<string, { label: string; c: string; Icon: any }> =
    {
        critical: {
            label: 'Sangat Penting',
            c: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            Icon: AlertTriangle,
        },
        high: {
            label: 'Penting',
            c: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            Icon: AlertCircle,
        },
        normal: {
            label: 'Normal',
            c: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            Icon: Info,
        },
        low: {
            label: 'Rendah',
            c: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
            Icon: Info,
        },
    };

const typeBadges: Record<string, { label: string; c: string }> = {
    individual: {
        label: 'Individu',
        c: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    group: {
        label: 'Kelompok',
        c: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
    quiz: {
        label: 'Kuis',
        c: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    project: {
        label: 'Proyek',
        c: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
};

const eventBadges: Record<string, { label: string; c: string; Icon: any }> = {
    live_session: {
        label: 'Live Session',
        c: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Icon: Video,
    },
    webinar: {
        label: 'Webinar',
        c: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        Icon: Users,
    },
    quiz: {
        label: 'Kuis',
        c: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        Icon: FileText,
    },
    exam: {
        label: 'Ujian',
        c: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Icon: AlertTriangle,
    },
    deadline: {
        label: 'Deadline',
        c: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        Icon: Clock,
    },
    meeting: {
        label: 'Meeting',
        c: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        Icon: Users,
    },
    other: {
        label: 'Lainnya',
        c: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
        Icon: Calendar,
    },
};

const matIcons: Record<string, { Icon: any; color: string; bg: string }> = {
    pdf: {
        Icon: FileText,
        color: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-900/30',
    },
    video: {
        Icon: Video,
        color: 'text-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    slide: {
        Icon: FileDown,
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    document: {
        Icon: FileText,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    link: {
        Icon: LinkIcon,
        color: 'text-cyan-600',
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    },
    other: {
        Icon: FileText,
        color: 'text-neutral-600',
        bg: 'bg-neutral-100 dark:bg-neutral-800',
    },
};

const contactIcons: Record<string, { Icon: any; color: string; bg: string }> = {
    email: {
        Icon: Mail,
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    phone: {
        Icon: Phone,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    whatsapp: {
        Icon: MessageSquare,
        color: 'text-green-600',
        bg: 'bg-green-100 dark:bg-green-900/30',
    },
    telegram: {
        Icon: MessageSquare,
        color: 'text-cyan-600',
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    },
    other: {
        Icon: Phone,
        color: 'text-neutral-600',
        bg: 'bg-neutral-100 dark:bg-neutral-800',
    },
};

export default function WeeklyDigestShow({
    digest,
    relatedDigests,
    mahasiswa,
}: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaved, setIsSaved] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const totalItems =
        digest.forum_discussions.length +
        digest.assignments.length +
        digest.learning_materials.length +
        digest.announcements.length +
        digest.upcoming_schedules.length;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: digest.display_title,
                text: `${digest.display_title} - Minggu ${digest.week_number}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const handleExportPdf = () => {
        window.location.href = `/user/weekly-digest/${digest.id}/export-pdf`;
    };

    return (
        <StudentLayout>
            <Head title={`${digest.display_title} - Weekly Digest`} />
            <motion.div
                className="space-y-6 p-4 md:p-6 lg:p-8"
                variants={cV}
                initial="hidden"
                animate="visible"
            >
                {/* ═══ HEADER ═══ */}
                <motion.div variants={iV} className="flex flex-col gap-4">
                    <motion.button
                        onClick={() => router.visit('/user/notifications')}
                        className="flex w-fit items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        whileHover={{ x: -4 }}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">
                            Kembali ke Notifikasi
                        </span>
                    </motion.button>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={DigestIcon}
                                alt="Weekly Digest"
                                className="h-10 w-10 object-contain md:h-12 md:w-12"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
                                    {digest.display_title}
                                </h1>
                                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                    {digest.courses
                                        .map((c) => c.name)
                                        .join(', ')}{' '}
                                    • Minggu {digest.week_number}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSaved(!isSaved)}
                                className={`rounded-xl ${isSaved ? 'border-amber-600 bg-amber-50 text-amber-600 dark:bg-amber-900/20' : ''}`}
                            >
                                <Bookmark
                                    className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
                                />
                                <span className="ml-2 hidden sm:inline">
                                    {isSaved ? 'Tersimpan' : 'Simpan'}
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="rounded-xl"
                            >
                                {copiedLink ? (
                                    <CheckCheck className="h-4 w-4" />
                                ) : (
                                    <Share2 className="h-4 w-4" />
                                )}
                                <span className="ml-2 hidden sm:inline">
                                    {copiedLink ? 'Tersalin' : 'Bagikan'}
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPdf}
                                className="rounded-xl"
                            >
                                <Download className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">
                                    Export PDF
                                </span>
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ INFO CARDS ═══ */}
                <motion.div
                    variants={iV}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {[
                        {
                            label: 'Minggu Ke',
                            value: digest.week_number,
                            icon: WeekIcon,
                            gradient: 'from-blue-500 to-cyan-500',
                            sub: digest.semester,
                        },
                        {
                            label: 'Periode',
                            value: `${new Date(digest.week_start_date).getDate()} - ${new Date(digest.week_end_date).getDate()}`,
                            icon: CourseIcon,
                            gradient: 'from-emerald-500 to-teal-500',
                            sub: new Date(
                                digest.week_start_date,
                            ).toLocaleDateString('id-ID', {
                                month: 'long',
                                year: 'numeric',
                            }),
                        },
                        {
                            label: 'Total Konten',
                            value: totalItems,
                            icon: ItemsIcon,
                            gradient: 'from-purple-500 to-pink-500',
                            sub: 'Item tersedia',
                        },
                        {
                            label: 'Tugas Aktif',
                            value: digest.assignments.filter(
                                (a) => new Date(a.deadline_date) > new Date(),
                            ).length,
                            icon: DigestIcon,
                            gradient: 'from-amber-500 to-orange-500',
                            sub: 'Belum deadline',
                        },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            variants={iV}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-5`}
                            />
                            <div className="relative">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                        {s.label}
                                    </p>
                                    <img
                                        src={s.icon}
                                        alt={s.label}
                                        className="h-8 w-8 object-contain opacity-80"
                                    />
                                </div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {s.value}
                                </p>
                                <p className="mt-2 text-xs text-neutral-500">
                                    {s.sub}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══ DESCRIPTION ═══ */}
                {digest.description && (
                    <motion.div
                        variants={iV}
                        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                                <Info className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    Deskripsi Digest
                                </h3>
                                <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    {digest.description}
                                </p>
                                {digest.mentari_course_url && (
                                    <a
                                        href={digest.mentari_course_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Buka Course di Mentari</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ TABS ═══ */}
                <motion.div
                    variants={iV}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                >
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="w-full flex-nowrap justify-start overflow-x-auto rounded-none border-b border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-900/50">
                            <TabsTrigger
                                value="overview"
                                className="flex items-center gap-2 whitespace-nowrap"
                            >
                                <Sparkles className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            {digest.forum_discussions.length > 0 && (
                                <TabsTrigger
                                    value="forums"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Forum ({digest.forum_discussions.length})
                                </TabsTrigger>
                            )}
                            {digest.assignments.length > 0 && (
                                <TabsTrigger
                                    value="assignments"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <FileText className="h-4 w-4" />
                                    Tugas ({digest.assignments.length})
                                </TabsTrigger>
                            )}
                            {digest.learning_materials.length > 0 && (
                                <TabsTrigger
                                    value="materials"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Materi ({digest.learning_materials.length})
                                </TabsTrigger>
                            )}
                            {digest.announcements.length > 0 && (
                                <TabsTrigger
                                    value="announcements"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Bell className="h-4 w-4" />
                                    Pengumuman ({digest.announcements.length})
                                </TabsTrigger>
                            )}
                            {digest.upcoming_schedules.length > 0 && (
                                <TabsTrigger
                                    value="schedules"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Jadwal ({digest.upcoming_schedules.length})
                                </TabsTrigger>
                            )}
                            {digest.support_contacts.length > 0 && (
                                <TabsTrigger
                                    value="contacts"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Users className="h-4 w-4" />
                                    Kontak
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* TAB: OVERVIEW */}
                        <TabsContent value="overview" className="space-y-6 p-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        Ringkasan Konten
                                    </h3>
                                    {[
                                        {
                                            label: 'Forum Diskusi',
                                            count: digest.forum_discussions
                                                .length,
                                            Icon: MessageSquare,
                                            c: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
                                        },
                                        {
                                            label: 'Tugas/Assignment',
                                            count: digest.assignments.length,
                                            Icon: FileText,
                                            c: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
                                        },
                                        {
                                            label: 'Materi Pembelajaran',
                                            count: digest.learning_materials
                                                .length,
                                            Icon: BookOpen,
                                            c: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
                                        },
                                        {
                                            label: 'Pengumuman',
                                            count: digest.announcements.length,
                                            Icon: Bell,
                                            c: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
                                        },
                                        {
                                            label: 'Jadwal Mendatang',
                                            count: digest.upcoming_schedules
                                                .length,
                                            Icon: Calendar,
                                            c: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30',
                                        },
                                    ].map((it) => (
                                        <div
                                            key={it.label}
                                            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${it.c}`}
                                                >
                                                    <it.Icon className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium text-neutral-900 dark:text-white">
                                                    {it.label}
                                                </span>
                                            </div>
                                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                {it.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                        <Target className="h-5 w-5 text-red-600" />
                                        Perlu Perhatian
                                    </h3>
                                    {digest.announcements
                                        .filter(
                                            (a) =>
                                                a.priority_level ===
                                                    'critical' ||
                                                a.priority_level === 'high',
                                        )
                                        .slice(0, 3)
                                        .map((a) => {
                                            const pb =
                                                priorityBadges[
                                                    a.priority_level
                                                ] || priorityBadges.normal;
                                            return (
                                                <div
                                                    key={a.id}
                                                    className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <pb.Icon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                                        <div>
                                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                                {
                                                                    a.announcement_title
                                                                }
                                                            </p>
                                                            <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                                {
                                                                    a.announcement_content
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {digest.assignments
                                        .filter((a) => {
                                            const d = Math.ceil(
                                                (new Date(
                                                    a.deadline_date,
                                                ).getTime() -
                                                    Date.now()) /
                                                    864e5,
                                            );
                                            return d >= 0 && d <= 7;
                                        })
                                        .slice(0, 3)
                                        .map((a) => {
                                            const ds = deadlineStatus(
                                                a.deadline_date,
                                            );
                                            return (
                                                <div
                                                    key={a.id}
                                                    className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                                        <div>
                                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                                {
                                                                    a.assignment_title
                                                                }
                                                            </p>
                                                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                                                Deadline:{' '}
                                                                {formatDate(
                                                                    a.deadline_date,
                                                                )}
                                                            </p>
                                                            <Badge
                                                                className={`mt-2 ${ds.c}`}
                                                            >
                                                                {ds.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {digest.announcements.filter(
                                        (a) =>
                                            a.priority_level === 'critical' ||
                                            a.priority_level === 'high',
                                    ).length === 0 &&
                                        digest.assignments.filter((a) => {
                                            const d = Math.ceil(
                                                (new Date(
                                                    a.deadline_date,
                                                ).getTime() -
                                                    Date.now()) /
                                                    864e5,
                                            );
                                            return d >= 0 && d <= 7;
                                        }).length === 0 && (
                                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
                                                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
                                                <p className="text-neutral-600 dark:text-neutral-400">
                                                    Tidak ada item mendesak saat
                                                    ini
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: FORUMS */}
                        <TabsContent value="forums" className="space-y-4 p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                    Forum Diskusi
                                </h3>
                                <Badge variant="secondary">
                                    {digest.forum_discussions.length} Topik
                                </Badge>
                            </div>
                            {digest.forum_discussions.map((f, i) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                                            <MessageSquare className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                {f.topic_title}
                                            </h4>
                                            {f.topic_description && (
                                                <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                                                    {f.topic_description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                    <MessageSquare className="h-4 w-4" />
                                                    {f.total_posts} Posts
                                                </span>
                                                <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                    <Users className="h-4 w-4" />
                                                    {f.total_participants}{' '}
                                                    Partisipan
                                                </span>
                                                {f.discussion_date && (
                                                    <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(
                                                            f.discussion_date,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            {f.key_points && (
                                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                        <Award className="h-4 w-4" />
                                                        Poin Penting:
                                                    </p>
                                                    <p className="text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                                                        {f.key_points}
                                                    </p>
                                                </div>
                                            )}
                                            {f.best_contributions && (
                                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                                                        <Sparkles className="h-4 w-4" />
                                                        Kontribusi Terbaik:
                                                    </p>
                                                    <p className="text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                                                        {f.best_contributions}
                                                    </p>
                                                </div>
                                            )}
                                            {f.mentari_forum_url && (
                                                <a
                                                    href={f.mentari_forum_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Buka Forum di Mentari
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </TabsContent>

                        {/* TAB: ASSIGNMENTS */}
                        <TabsContent
                            value="assignments"
                            className="space-y-4 p-6"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                    Tugas & Assignment
                                </h3>
                                <Badge variant="secondary">
                                    {digest.assignments.length} Tugas
                                </Badge>
                            </div>
                            {digest.assignments.map((a, i) => {
                                const ds = deadlineStatus(a.deadline_date);
                                const tb =
                                    typeBadges[a.assignment_type] ||
                                    typeBadges.individual;
                                return (
                                    <motion.div
                                        key={a.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                        {a.assignment_title}
                                                    </h4>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <Badge className={tb.c}>
                                                            {tb.label}
                                                        </Badge>
                                                        {a.is_mandatory && (
                                                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                Wajib
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {a.assignment_description && (
                                                    <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                                                        {
                                                            a.assignment_description
                                                        }
                                                    </p>
                                                )}
                                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Clock className="h-5 w-5 text-amber-600" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                    Deadline:{' '}
                                                                    {formatDate(
                                                                        a.deadline_date,
                                                                    )}
                                                                </p>
                                                                {a.submission_start_date && (
                                                                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                                        Mulai:{' '}
                                                                        {formatDate(
                                                                            a.submission_start_date,
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Badge className={ds.c}>
                                                            {ds.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                            Nilai Maksimal
                                                        </p>
                                                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                                            {a.max_score}
                                                        </p>
                                                    </div>
                                                    {a.submission_format && (
                                                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                Format
                                                            </p>
                                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                {
                                                                    a.submission_format
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                {a.detailed_instructions && (
                                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                            <Info className="h-4 w-4" />
                                                            Instruksi:
                                                        </p>
                                                        <p className="text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                                                            {
                                                                a.detailed_instructions
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                                {a.grading_criteria && (
                                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Kriteria Penilaian:
                                                        </p>
                                                        <p className="text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                                                            {a.grading_criteria}
                                                        </p>
                                                    </div>
                                                )}
                                                {a.mentari_assignment_url && (
                                                    <a
                                                        href={
                                                            a.mentari_assignment_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        Kerjakan di Mentari
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </TabsContent>

                        {/* TAB: MATERIALS */}
                        <TabsContent
                            value="materials"
                            className="space-y-4 p-6"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                    Materi Pembelajaran
                                </h3>
                                <Badge variant="secondary">
                                    {digest.learning_materials.length} Materi
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {digest.learning_materials.map((m, i) => {
                                    const mi =
                                        matIcons[m.material_type] ||
                                        matIcons.other;
                                    return (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${mi.bg}`}
                                                >
                                                    <mi.Icon
                                                        className={`h-6 w-6 ${mi.color}`}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                            {m.material_title}
                                                        </h4>
                                                        <Badge className="bg-blue-100 text-blue-700 capitalize dark:bg-blue-900/30 dark:text-blue-400">
                                                            {m.material_type}
                                                        </Badge>
                                                    </div>
                                                    {m.material_description && (
                                                        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                                            {
                                                                m.material_description
                                                            }
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                                                        {m.file_size && (
                                                            <span className="flex items-center gap-1">
                                                                <FileDown className="h-3 w-3" />
                                                                {m.file_size}
                                                            </span>
                                                        )}
                                                        {m.duration && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {m.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {m.topics_covered && (
                                                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                                            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                                                                Topik:
                                                            </p>
                                                            <p className="text-xs text-neutral-700 dark:text-neutral-300">
                                                                {
                                                                    m.topics_covered
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                    {m.mentari_material_url && (
                                                        <a
                                                            href={
                                                                m.mentari_material_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            Buka Materi
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        {/* TAB: ANNOUNCEMENTS */}
                        <TabsContent
                            value="announcements"
                            className="space-y-4 p-6"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <Bell className="h-5 w-5 text-amber-600" />
                                    Pengumuman
                                </h3>
                                <Badge variant="secondary">
                                    {digest.announcements.length} Pengumuman
                                </Badge>
                            </div>
                            {digest.announcements.map((a, i) => {
                                const pb =
                                    priorityBadges[a.priority_level] ||
                                    priorityBadges.normal;
                                return (
                                    <motion.div
                                        key={a.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`relative overflow-hidden rounded-2xl border-2 bg-white p-6 transition-shadow hover:shadow-lg dark:bg-neutral-800 ${a.is_pinned ? 'border-amber-400 dark:border-amber-600' : 'border-neutral-200 dark:border-neutral-700'}`}
                                    >
                                        {a.is_pinned && (
                                            <div className="absolute top-0 right-0 rounded-bl-xl bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                                                Disematkan
                                            </div>
                                        )}
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                                <pb.Icon className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                        {a.announcement_title}
                                                    </h4>
                                                    <Badge className={pb.c}>
                                                        {pb.label}
                                                    </Badge>
                                                </div>
                                                <p className="leading-relaxed whitespace-pre-line text-neutral-600 dark:text-neutral-400">
                                                    {a.announcement_content}
                                                </p>
                                                {a.announced_date && (
                                                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                        <Calendar className="h-4 w-4" />
                                                        Diumumkan:{' '}
                                                        {formatDate(
                                                            a.announced_date,
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </TabsContent>

                        {/* TAB: SCHEDULES */}
                        <TabsContent
                            value="schedules"
                            className="space-y-4 p-6"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <Calendar className="h-5 w-5 text-rose-600" />
                                    Jadwal Mendatang
                                </h3>
                                <Badge variant="secondary">
                                    {digest.upcoming_schedules.length} Acara
                                </Badge>
                            </div>
                            {digest.upcoming_schedules.map((s, i) => {
                                const eb =
                                    eventBadges[s.event_type] ||
                                    eventBadges.other;
                                return (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                                <eb.Icon className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                        {s.event_title}
                                                    </h4>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <Badge className={eb.c}>
                                                            {eb.label}
                                                        </Badge>
                                                        {s.is_mandatory && (
                                                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                Wajib
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {s.event_description && (
                                                    <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                                                        {s.event_description}
                                                    </p>
                                                )}
                                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="h-5 w-5 text-blue-600" />
                                                            <div>
                                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                    Tanggal
                                                                </p>
                                                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                    {formatDate(
                                                                        s.event_date,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {s.event_time && (
                                                            <div className="flex items-center gap-3">
                                                                <Clock className="h-5 w-5 text-blue-600" />
                                                                <div>
                                                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                        Waktu
                                                                    </p>
                                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                        {s.event_time.substring(
                                                                            0,
                                                                            5,
                                                                        )}{' '}
                                                                        WIB
                                                                        {s.duration_minutes
                                                                            ? ` (${s.duration_minutes} menit)`
                                                                            : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {(s.platform ||
                                                    s.meeting_link) && (
                                                    <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                                                        {s.platform && (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4 text-purple-600" />
                                                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                    Platform:{' '}
                                                                    {s.platform}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {s.meeting_id && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                    Meeting ID:
                                                                </span>
                                                                <code className="rounded bg-neutral-200 px-2 py-1 text-xs dark:bg-neutral-700">
                                                                    {
                                                                        s.meeting_id
                                                                    }
                                                                </code>
                                                            </div>
                                                        )}
                                                        {s.meeting_password && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                    Password:
                                                                </span>
                                                                <code className="rounded bg-neutral-200 px-2 py-1 text-xs dark:bg-neutral-700">
                                                                    {
                                                                        s.meeting_password
                                                                    }
                                                                </code>
                                                            </div>
                                                        )}
                                                        {s.meeting_link && (
                                                            <a
                                                                href={
                                                                    s.meeting_link
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                Join Meeting
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                                {s.preparation_notes && (
                                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300">
                                                            <Info className="h-4 w-4" />
                                                            Persiapan:
                                                        </p>
                                                        <p className="text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                                                            {
                                                                s.preparation_notes
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </TabsContent>

                        {/* TAB: CONTACTS */}
                        <TabsContent value="contacts" className="space-y-4 p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <Users className="h-5 w-5 text-teal-600" />
                                    Kontak Support
                                </h3>
                                <Badge variant="secondary">
                                    {digest.support_contacts.length} Kontak
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {digest.support_contacts.map((c, i) => {
                                    const ci =
                                        contactIcons[c.contact_type] ||
                                        contactIcons.other;
                                    return (
                                        <motion.div
                                            key={c.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ci.bg}`}
                                                >
                                                    <ci.Icon
                                                        className={`h-6 w-6 ${ci.color}`}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                            {c.contact_name}
                                                        </h4>
                                                        {c.contact_role && (
                                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                {c.contact_role}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
                                                        <p className="text-xs text-neutral-600 capitalize dark:text-neutral-400">
                                                            {c.contact_type}
                                                        </p>
                                                        <p className="text-sm font-semibold break-all text-neutral-900 dark:text-white">
                                                            {c.contact_value}
                                                        </p>
                                                    </div>
                                                    {c.available_hours && (
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                                                            <div>
                                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                    Jam Tersedia
                                                                </p>
                                                                <p className="text-neutral-900 dark:text-white">
                                                                    {
                                                                        c.available_hours
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {c.response_time && (
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                                            <div>
                                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                    Waktu Respon
                                                                </p>
                                                                <p className="text-neutral-900 dark:text-white">
                                                                    {
                                                                        c.response_time
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Button
                                                        onClick={() => {
                                                            if (
                                                                c.contact_type ===
                                                                'email'
                                                            )
                                                                window.location.href = `mailto:${c.contact_value}`;
                                                            else if (
                                                                c.contact_type ===
                                                                'phone'
                                                            )
                                                                window.location.href = `tel:${c.contact_value}`;
                                                            else if (
                                                                c.contact_type ===
                                                                'whatsapp'
                                                            )
                                                                window.open(
                                                                    `https://wa.me/${c.contact_value.replace(/\D/g, '')}`,
                                                                    '_blank',
                                                                );
                                                            else
                                                                navigator.clipboard.writeText(
                                                                    c.contact_value,
                                                                );
                                                        }}
                                                        className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                                                    >
                                                        <ci.Icon className="mr-2 h-4 w-4" />
                                                        Hubungi
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
