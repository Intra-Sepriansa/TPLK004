import { Head, Link, router } from '@inertiajs/react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import StudentLayout from '@/layouts/student-layout';
import Fuse from 'fuse.js';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    Brain,
    Calendar,
    CheckCircle2,
    Download,
    FileText,
    Filter,
    Flame,
    Grid3X3,
    List,
    Search,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Upload,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import mataKuliahIcon from '@/assets/dosen/matakuliah/mata-kuliah.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import progressIcon from '@/assets/admin/dashboard/hadir-icon.png';
import gradeIcon from '@/assets/admin/dashboard/terlambat-icon.png';

type ViewMode = 'grid' | 'list';
type CourseMode = 'all' | 'online' | 'offline';
type SortBy = 'name' | 'progress' | 'grade';

type Difficulty = 'easy' | 'medium' | 'hard' | string;

interface CourseProgress {
    meetings_completed: number;
    total_meetings: number;
    assignments_completed: number;
    total_assignments: number;
    attendance_rate: number;
    average_grade: number | null;
    has_grade?: boolean;
    meeting_progress: number;
    assignment_progress: number;
    notes_count: number;
}

interface NextSession {
    meeting_number: number;
    topic: string;
    date: string;
    time: string;
}

interface Material {
    id: number;
    title: string;
    type: 'pdf' | 'ppt' | 'doc' | 'video' | 'link' | string;
    url: string;
    size: number | null;
}

interface CourseStudyGroup {
    id: number;
    name: string;
    description: string | null;
    member_count: number;
}

interface Course {
    id: number;
    code: string;
    name: string;
    sks: number;
    semester: number;
    dosen: string;
    dosen_avatar?: string | null;
    mode: 'online' | 'offline';
    ruangan: string;
    schedule: {
        day: string;
        time: string;
    };
    progress: CourseProgress;
    next_session: NextSession | null;
    color: string;
    is_favorite: boolean;
    study_time_hours: number;
    difficulty_level: Difficulty;
    ai_recommendation: string;
    predicted_completion_date: string;
    milestones: {
        meeting_50: boolean;
        meeting_75: boolean;
        assignment_80: boolean;
    };
    materials: Material[];
    study_groups: CourseStudyGroup[];
}

interface Stats {
    total_courses: number;
    total_sks: number;
    average_grade: number;
    completion_rate: number;
    study_hours_week: number;
    on_track_courses: number;
}

interface StudyGroupMember {
    id: number;
    name: string;
    is_admin: boolean;
}

interface StudyGroup {
    id: number;
    course_id: number;
    name: string;
    description: string;
    member_count: number;
    members: StudyGroupMember[];
}

interface Deadline {
    id: number;
    title: string;
    course_name: string;
    deadline: string;
    deadline_formatted: string;
    days_remaining: number | null;
    priority: 'high' | 'medium' | 'low' | string;
}

interface PerformanceTrend {
    course: string;
    points: Array<{ label: string; value: number | null }>;
}

interface PerformanceData {
    grade_trends: PerformanceTrend[];
    attendance_patterns: Array<{ name: string; value: number }>;
    study_time_tracking: Array<{ day: string; hours: number }>;
    comparative: {
        my_average: number;
        class_average: number | null;
        rank_estimate: number | null;
    };
}

interface Props {
    courses: Course[];
    stats: Stats;
    study_groups: StudyGroup[];
    upcoming_deadlines: Deadline[];
    performance_data: PerformanceData;
}

interface Preset {
    id: string;
    label: string;
    mode: CourseMode;
    sortBy: SortBy;
    semester: string;
    dosen: string;
}

interface PlannerBlock {
    id: string;
    title: string;
    day: string;
    start: string;
    end: string;
    type: 'study' | 'deadline' | 'group';
    courseId: number | null;
}

interface AIInsight {
    courseId: number;
    priority: 'high' | 'medium' | 'low';
    score: number;
    title: string;
    summary: string;
    actions: string[];
    focusHours: number;
    urgentDeadlines: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STORAGE_KEY = 'mata-kuliah-filter-presets';
const BASE_SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 };
const HOVER_SPRING = { type: 'spring' as const, stiffness: 400, damping: 15 };
const DAY_LABEL_MAP: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    senin: 'Mon',
    selasa: 'Tue',
    rabu: 'Wed',
    kamis: 'Thu',
    jumat: 'Fri',
    sabtu: 'Sat',
    minggu: 'Sun',
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: BASE_SPRING,
    },
} as const;

const cardHover = {
    scale: 1.04,
    y: -4,
    transition: HOVER_SPRING,
} as const;

function resolvePlannerDay(day: string): string {
    const normalized = day.trim().toLowerCase();
    return DAY_LABEL_MAP[normalized] ?? 'Mon';
}

function calculateEndTime(startTime: string, sks: number): string {
    const [hoursRaw, minutesRaw] = startTime.split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return startTime;
    }

    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + Math.max(1, sks) * 50;
    const endHour = Math.floor((endMinutes % (24 * 60)) / 60);
    const endMinute = endMinutes % 60;

    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

export default function MataKuliahMahasiswa({
    courses,
    stats,
    study_groups,
    upcoming_deadlines,
    performance_data,
}: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<CourseMode>('all');
    const [sortBy, setSortBy] = useState<SortBy>('name');
    const [semesterFilter, setSemesterFilter] = useState('all');
    const [dosenFilter, setDosenFilter] = useState('all');
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [selectedPresetId, setSelectedPresetId] = useState('');
    const [downloadProgress, setDownloadProgress] = useState<Record<number, number>>({});

    const semesterOptions = useMemo(() => {
        const set = new Set<string>();
        courses.forEach((course) => set.add(String(course.semester)));
        return ['all', ...Array.from(set).sort((a, b) => Number(a) - Number(b))];
    }, [courses]);

    const dosenOptions = useMemo(() => {
        const set = new Set<string>();
        courses.forEach((course) => set.add(course.dosen));
        return ['all', ...Array.from(set).sort()];
    }, [courses]);

    const fuse = useMemo(() => {
        return new Fuse(courses, {
            keys: ['name', 'code', 'dosen'],
            threshold: 0.36,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });
    }, [courses]);

    const fuzzyIds = useMemo(() => {
        if (!searchQuery.trim()) {
            return null;
        }

        return new Set(fuse.search(searchQuery).map((match) => match.item.id));
    }, [fuse, searchQuery]);

    const filteredCourses = useMemo(() => {
        let result = courses.filter((course) => {
            const query = searchQuery.toLowerCase();
            const directMatch =
                course.name.toLowerCase().includes(query) ||
                course.code.toLowerCase().includes(query) ||
                course.dosen.toLowerCase().includes(query);

            const fuzzyMatch = fuzzyIds ? fuzzyIds.has(course.id) : true;
            const matchesSearch = !searchQuery.trim() ? true : directMatch || fuzzyMatch;

            const matchesMode = filterMode === 'all' || course.mode === filterMode;
            const matchesSemester = semesterFilter === 'all' || String(course.semester) === semesterFilter;
            const matchesDosen = dosenFilter === 'all' || course.dosen === dosenFilter;

            return matchesSearch && matchesMode && matchesSemester && matchesDosen;
        });

        result = [...result].sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }

            if (sortBy === 'progress') {
                return b.progress.meeting_progress - a.progress.meeting_progress;
            }

            return (b.progress.average_grade ?? -1) - (a.progress.average_grade ?? -1);
        });

        return result;
    }, [courses, searchQuery, fuzzyIds, filterMode, semesterFilter, dosenFilter, sortBy]);

    const aiInsights = useMemo(() => {
        const normalize = (value: string) => value.trim().toLowerCase();

        return [...courses]
            .map((course) => {
                const courseDeadlines = upcoming_deadlines.filter(
                    (deadline) => normalize(deadline.course_name) === normalize(course.name)
                );

                const urgentDeadlines = courseDeadlines.filter(
                    (deadline) => deadline.days_remaining !== null && deadline.days_remaining <= 2
                ).length;

                const attendanceGap = Math.max(0, 78 - course.progress.attendance_rate);
                const assignmentGap = Math.max(0, 85 - course.progress.assignment_progress);
                const meetingGap = Math.max(0, 72 - course.progress.meeting_progress);
                const gradeGap =
                    course.progress.average_grade === null
                        ? 20
                        : Math.max(0, 75 - course.progress.average_grade);
                const deadlinePressure = urgentDeadlines * 18 + Math.min(courseDeadlines.length * 5, 20);

                const score = Math.min(
                    100,
                    Math.round(
                        attendanceGap * 0.9 +
                            assignmentGap * 0.55 +
                            meetingGap * 0.35 +
                            gradeGap * 0.7 +
                            deadlinePressure
                    )
                );

                const priority: AIInsight['priority'] = score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low';

                const focusHours = Math.max(
                    2,
                    Math.min(14, Math.round(course.sks * 0.8 + score / 12 + urgentDeadlines))
                );

                const actions: string[] = [];
                if (urgentDeadlines > 0) {
                    actions.push(`Tuntaskan ${urgentDeadlines} deadline prioritas maksimal hari ini.`);
                }
                if (course.progress.attendance_rate < 75) {
                    actions.push('Targetkan hadir penuh untuk 2 pertemuan berikutnya.');
                }
                if (course.progress.assignment_progress < 80) {
                    actions.push('Selesaikan tugas tertunda sebelum H-1 deadline.');
                }
                if (course.progress.average_grade === null) {
                    actions.push('Kumpulkan minimal 1 tugas bernilai minggu ini untuk membuka baseline nilai.');
                } else if (course.progress.average_grade < 70) {
                    actions.push('Tambahkan sesi review konsep inti 30-45 menit per hari.');
                }
                if (actions.length < 3) {
                    actions.push(`Blok fokus ${focusHours} jam/minggu untuk ${course.code || course.name}.`);
                }

                const summary =
                    course.progress.average_grade === null
                        ? `Data nilai belum tersedia. Fokuskan ${focusHours} jam/minggu untuk percepat submission dan stabilkan progress.`
                        : `Skor risiko ${score}/100. Tingkatkan ritme belajar ${focusHours} jam/minggu untuk menjaga nilai di atas target.`;

                return {
                    courseId: course.id,
                    priority,
                    score,
                    title: `${course.code || course.name} Priority Plan`,
                    summary,
                    actions: actions.slice(0, 3),
                    focusHours,
                    urgentDeadlines,
                } as AIInsight;
            })
            .sort((a, b) => b.score - a.score);
    }, [courses, upcoming_deadlines]);

    const aiInsightMap = useMemo(() => {
        return new Map(aiInsights.map((insight) => [insight.courseId, insight]));
    }, [aiInsights]);

    const courseById = useMemo(() => {
        return new Map(courses.map((course) => [course.id, course]));
    }, [courses]);

    const topRecommendationCourses = useMemo(() => {
        return aiInsights
            .map((insight) => courseById.get(insight.courseId))
            .filter((course): course is Course => Boolean(course))
            .slice(0, 4);
    }, [aiInsights, courseById]);

    const selectedInsight = useMemo(() => {
        if (selectedCourse) {
            return aiInsightMap.get(selectedCourse.id) ?? null;
        }

        const fallbackCourse = topRecommendationCourses[0];
        if (!fallbackCourse) {
            return null;
        }

        return aiInsightMap.get(fallbackCourse.id) ?? null;
    }, [selectedCourse, aiInsightMap, topRecommendationCourses]);

    const gradeTrendData = useMemo(() => {
        const labels = performance_data.grade_trends[0]?.points.map((point) => point.label) ?? [];

        return labels.map((label, idx) => {
            const row: Record<string, number | string | null> = { label };

            performance_data.grade_trends.forEach((trend, trendIndex) => {
                row[`trend_${trendIndex}`] = trend.points[idx]?.value ?? null;
            });

            return row;
        });
    }, [performance_data.grade_trends]);

    const materialRows = useMemo(() => {
        return courses.flatMap((course) =>
            course.materials.map((material) => ({
                ...material,
                courseId: course.id,
                courseName: course.name,
            }))
        );
    }, [courses]);

    const [plannerBlocks, setPlannerBlocks] = useState<PlannerBlock[]>(() => {
        return courses
            .filter((course) => course.schedule.time && course.schedule.time !== '-')
            .slice(0, 14)
            .map((course) => ({
            id: `schedule-${course.id}`,
            title: `${course.code || course.name} - ${course.name}`,
            day: resolvePlannerDay(course.schedule.day),
            start: course.schedule.time,
            end: calculateEndTime(course.schedule.time, course.sks),
            type: 'study' as const,
            courseId: course.id,
        }));
    });

    const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);

    useEffect(() => {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return;
        }

        try {
            const parsed = JSON.parse(raw) as Preset[];
            if (Array.isArray(parsed)) {
                setPresets(parsed);
            }
        } catch {
            setPresets([]);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    }, [presets]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!event.altKey) {
                return;
            }

            if (event.key === '1') {
                setFilterMode('all');
            }

            if (event.key === '2') {
                setFilterMode('online');
            }

            if (event.key === '3') {
                setFilterMode('offline');
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const toggleFavorite = (courseId: number) => {
        router.post(`/user/akademik/mata-kuliah/${courseId}/favorite`, {}, { preserveScroll: true });
    };

    const saveCurrentPreset = () => {
        const id = `${Date.now()}`;
        const nextPreset: Preset = {
            id,
            label: `Preset ${presets.length + 1}`,
            mode: filterMode,
            sortBy,
            semester: semesterFilter,
            dosen: dosenFilter,
        };

        setPresets((current) => [nextPreset, ...current.slice(0, 5)]);
        setSelectedPresetId(id);
    };

    const applyPreset = (presetId: string) => {
        setSelectedPresetId(presetId);

        const preset = presets.find((item) => item.id === presetId);
        if (!preset) {
            return;
        }

        setFilterMode(preset.mode);
        setSortBy(preset.sortBy);
        setSemesterFilter(preset.semester);
        setDosenFilter(preset.dosen);
    };

    const exportCsv = () => {
        window.open('/user/akademik/mata-kuliah/export', '_blank', 'noopener,noreferrer');
    };

    const exportAnalytics = () => {
        const payload = {
            generatedAt: new Date().toISOString(),
            stats,
            performance_data,
            courses: filteredCourses.map((course) => ({
                code: course.code,
                name: course.name,
                grade: course.progress.average_grade,
                attendance: course.progress.attendance_rate,
                assignmentProgress: course.progress.assignment_progress,
            })),
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `analytics-mata-kuliah-${Date.now()}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const generateStudyPlan = () => {
        const lowCourses = [...courses]
            .sort((a, b) => a.progress.meeting_progress - b.progress.meeting_progress)
            .filter((course) => course.schedule.time && course.schedule.time !== '-')
            .slice(0, 6);

        const generated = lowCourses.map((course, index) => ({
            id: `generated-${course.id}-${index}`,
            title: `AI Focus ${course.code || course.name} (${course.progress.meeting_progress.toFixed(0)}%)`,
            day: resolvePlannerDay(course.schedule.day),
            start: course.schedule.time,
            end: calculateEndTime(course.schedule.time, Math.max(course.sks, 2)),
            type: 'study' as const,
            courseId: course.id,
        }));

        setPlannerBlocks(generated);
    };

    const dropPlannerBlock = (day: string) => {
        if (!draggingBlockId) {
            return;
        }

        setPlannerBlocks((current) =>
            current.map((block) =>
                block.id === draggingBlockId
                    ? {
                          ...block,
                          day,
                      }
                    : block
            )
        );

        setDraggingBlockId(null);
    };

    const startDownload = (materialId: number) => {
        setDownloadProgress((current) => ({
            ...current,
            [materialId]: 5,
        }));

        const timer = window.setInterval(() => {
            setDownloadProgress((current) => {
                const nextValue = Math.min((current[materialId] ?? 0) + 15, 100);

                if (nextValue >= 100) {
                    window.clearInterval(timer);
                }

                return {
                    ...current,
                    [materialId]: nextValue,
                };
            });
        }, 220);
    };

    const gamificationBadges = [
        {
            id: 'consistency',
            title: 'Consistency Keeper',
            subtitle: 'Attendance >= 75% untuk mayoritas mata kuliah',
            unlocked: stats.on_track_courses >= Math.max(1, Math.floor(stats.total_courses / 2)),
        },
        {
            id: 'grade',
            title: 'Grade Guardian',
            subtitle: 'Rata-rata nilai di atas 80',
            unlocked: stats.average_grade >= 80,
        },
        {
            id: 'focus',
            title: 'Focus Strategist',
            subtitle: 'Jam belajar >= 10 jam per minggu',
            unlocked: stats.study_hours_week >= 10,
        },
        {
            id: 'milestone',
            title: 'Milestone Hunter',
            subtitle: 'Progress kelas rata-rata >= 70%',
            unlocked: stats.completion_rate >= 70,
        },
    ];

    const leaderboardRows = useMemo(() => {
        return [...courses]
            .map((course) => {
                const points = Math.round(
                    course.progress.meeting_progress * 6 +
                    course.progress.assignment_progress * 3 +
                    (course.progress.average_grade ?? 0) * 2 +
                    course.study_time_hours * 5
                );

                return {
                    code: course.code || '—',
                    name: course.name,
                    points,
                    streak: Math.max(0, Math.round(course.progress.meeting_progress / 10)),
                };
            })
            .sort((a, b) => b.points - a.points)
            .slice(0, 5)
            .map((item, index) => ({
                rank: index + 1,
                ...item,
            }));
    }, [courses]);

    return (
        <StudentLayout>
            <Head title="Mata Kuliah" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:p-6 lg:p-8"
            >
                <motion.section
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-40" />
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                                <div className="mb-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                                        whileHover={{ scale: 1.1, rotate: 4 }}
                                        className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
                                    >
                                        <img
                                            src={mataKuliahIcon}
                                            alt="Mata Kuliah"
                                            className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                        />
                                    </motion.div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-white/85 sm:text-sm">Semester {courses[0]?.semester ?? 1}</p>
                                        <h1 className="text-2xl font-bold sm:text-3xl">Mata Kuliah Mahasiswa</h1>
                                    </div>
                                </div>
                                <p className="mx-auto max-w-2xl text-center text-sm text-white/90 sm:mx-0 sm:text-left sm:text-base">
                                    Pantau progress pertemuan, performa nilai, study planner, dan rekomendasi AI dalam satu dashboard.
                                </p>
                            </div>

                            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-3 lg:gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                        setSelectedCourse(topRecommendationCourses[0] ?? null);
                                        setShowAIPanel(true);
                                    }}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-600 shadow-lg"
                                    aria-label="Buka rekomendasi AI"
                                >
                                    <Brain className="h-5 w-5" />
                                    AI Recommendations
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={exportCsv}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-sm font-bold text-white backdrop-blur-md"
                                    aria-label="Export laporan CSV"
                                >
                                    <Download className="h-5 w-5" />
                                    Export CSV
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={exportAnalytics}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-sm font-bold text-white backdrop-blur-md"
                                    aria-label="Export analytics JSON"
                                >
                                    <FileText className="h-5 w-5" />
                                    Export Analytics
                                </motion.button>
                            </div>
                        </div>

                        <div className="mt-6 inline-flex w-full rounded-2xl border border-white/20 bg-white/10 p-1.5 sm:w-auto sm:bg-transparent sm:p-0">
                            {[
                                { id: 'grid' as const, icon: Grid3X3, label: 'Grid' },
                                { id: 'list' as const, icon: List, label: 'List' },
                            ].map((view) => (
                                <motion.button
                                    key={view.id}
                                    whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setViewMode(view.id)}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all sm:flex-none ${
                                        viewMode === view.id ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'
                                    }`}
                                    aria-label={`Tampilkan mode ${view.label}`}
                                >
                                    <view.icon className="h-4 w-4" />
                                    {view.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6"
                >
                    {[
                        { icon: totalIcon, label: 'Total MK', value: stats.total_courses },
                        { icon: progressIcon, label: 'Total SKS', value: stats.total_sks },
                        { icon: gradeIcon, label: 'Rata-rata', value: stats.average_grade, decimals: 1 },
                        { icon: mataKuliahIcon, label: 'Progress', value: stats.completion_rate, suffix: '%' },
                        { icon: progressIcon, label: 'Study Hours', value: stats.study_hours_week, suffix: 'h' },
                        { icon: totalIcon, label: 'On Track', value: stats.on_track_courses },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={cardHover}
                            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-500/10" />
                            <div className="relative flex flex-col items-center gap-2 text-center">
                                <motion.img
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    src={stat.icon}
                                    alt={stat.label}
                                    className="h-10 w-10 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)] sm:h-14 sm:w-14"
                                />
                                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">{stat.label}</p>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white sm:text-2xl">
                                    <AnimatedCounter
                                        value={Number(stat.value) || 0}
                                        decimals={stat.decimals ?? 0}
                                        suffix={stat.suffix ?? ''}
                                        duration={1200}
                                    />
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.section>

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="grid gap-4 lg:grid-cols-12">
                        <div className="relative lg:col-span-4">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Cari mata kuliah, kode, atau dosen..."
                                className="h-12 w-full rounded-xl border border-white/20 bg-white/70 pl-12 pr-4 text-sm text-neutral-900 outline-none backdrop-blur-xl focus:ring-2 focus:ring-indigo-500 dark:border-white/5 dark:bg-neutral-800/70 dark:text-white"
                                aria-label="Cari mata kuliah"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 lg:col-span-3">
                            {([
                                { value: 'all', label: 'All' },
                                { value: 'online', label: 'Online' },
                                { value: 'offline', label: 'Offline' },
                            ] as const).map((mode) => (
                                <motion.button
                                    key={mode.value}
                                    whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setFilterMode(mode.value)}
                                    className={`h-12 rounded-xl px-4 text-sm font-bold ${
                                        filterMode === mode.value
                                            ? 'bg-indigo-500 text-white'
                                            : 'border border-white/20 bg-white/70 text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200'
                                    }`}
                                    aria-label={`Filter mode ${mode.label}`}
                                >
                                    {mode.label}
                                </motion.button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5">
                            <select
                                value={semesterFilter}
                                onChange={(event) => setSemesterFilter(event.target.value)}
                                className="h-12 rounded-xl border border-white/20 bg-white/70 px-4 text-sm font-semibold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                                aria-label="Filter semester"
                            >
                                {semesterOptions.map((value) => (
                                    <option key={value} value={value}>
                                        {value === 'all' ? 'Semua Semester' : `Semester ${value}`}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={dosenFilter}
                                onChange={(event) => setDosenFilter(event.target.value)}
                                className="h-12 rounded-xl border border-white/20 bg-white/70 px-4 text-sm font-semibold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                                aria-label="Filter dosen"
                            >
                                {dosenOptions.map((value) => (
                                    <option key={value} value={value}>
                                        {value === 'all' ? 'Semua Dosen' : value}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value as SortBy)}
                                className="h-12 rounded-xl border border-white/20 bg-white/70 px-4 text-sm font-semibold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                                aria-label="Urutkan mata kuliah"
                            >
                                <option value="name">Nama A-Z</option>
                                <option value="progress">Progress</option>
                                <option value="grade">Nilai</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                            onClick={saveCurrentPreset}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/70 px-4 text-xs font-bold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                            aria-label="Simpan preset filter"
                        >
                            <Filter className="h-4 w-4" />
                            Simpan Preset
                        </button>
                        <select
                            value={selectedPresetId}
                            onChange={(event) => applyPreset(event.target.value)}
                            className="h-10 rounded-xl border border-white/20 bg-white/70 px-4 text-xs font-semibold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                            aria-label="Gunakan preset filter"
                        >
                            <option value="">Pilih Preset</option>
                            {presets.map((preset) => (
                                <option key={preset.id} value={preset.id}>
                                    {preset.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Shortcut filter: <span className="font-semibold">Alt+1</span> all, <span className="font-semibold">Alt+2</span> online,
                            <span className="font-semibold"> Alt+3</span> offline
                        </p>
                    </div>
                </motion.section>

                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.section
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                        >
                            {filteredCourses.map((course, index) => (
                                <CourseCard3D
                                    key={course.id}
                                    course={course}
                                    index={index}
                                    aiSummary={aiInsightMap.get(course.id)?.summary ?? course.ai_recommendation}
                                    onToggleFavorite={toggleFavorite}
                                    onOpenAI={() => {
                                        setSelectedCourse(course);
                                        setShowAIPanel(true);
                                    }}
                                />
                            ))}
                        </motion.section>
                    ) : (
                        <motion.section
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {filteredCourses.map((course, index) => (
                                <CourseCardList
                                    key={course.id}
                                    course={course}
                                    index={index}
                                    aiSummary={aiInsightMap.get(course.id)?.summary ?? course.ai_recommendation}
                                    onToggleFavorite={toggleFavorite}
                                    onOpenAI={() => {
                                        setSelectedCourse(course);
                                        setShowAIPanel(true);
                                    }}
                                />
                            ))}
                        </motion.section>
                    )}
                </AnimatePresence>

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Performance Analytics Dashboard</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Tren nilai, pola kehadiran, dan perbandingan performa belajar.
                            </p>
                        </div>
                        <BarChart3 className="h-6 w-6 text-indigo-500" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60 xl:col-span-2">
                            <p className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Grade Trends</p>
                            <div className="h-60">
                                <ResponsiveContainer>
                                    <AreaChart data={gradeTrendData}>
                                        <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                                        <Tooltip />
                                        {performance_data.grade_trends.map((trend, index) => (
                                            <Area
                                                key={trend.course}
                                                type="monotone"
                                                dataKey={`trend_${index}`}
                                                name={trend.course}
                                                stroke={["#6366f1", "#10b981", "#f59e0b", "#ec4899"][index % 4]}
                                                fill={["#6366f1", "#10b981", "#f59e0b", "#ec4899"][index % 4]}
                                                fillOpacity={0.12}
                                                strokeWidth={2.5}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60">
                                <p className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Attendance Patterns</p>
                                <div className="h-44">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={performance_data.attendance_patterns} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
                                                {performance_data.attendance_patterns.map((item, index) => (
                                                    <Cell
                                                        key={`${item.name}-${index}`}
                                                        fill={index === 0 ? '#22c55e' : '#ef4444'}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">My Avg</p>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{performance_data.comparative.my_average}</p>
                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    Class Avg: {performance_data.comparative.class_average ?? '-'}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Rank Est.: {performance_data.comparative.rank_estimate ? `#${performance_data.comparative.rank_estimate}` : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60">
                        <p className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Study Time Tracking</p>
                        <div className="h-52">
                            <ResponsiveContainer>
                                <BarChart data={performance_data.study_time_tracking}>
                                    <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="hours" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Study Planner & Calendar</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Weekly time blocking, deadline reminders, dan sinkronisasi kalender.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={generateStudyPlan}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white"
                                aria-label="Generate jadwal belajar otomatis"
                            >
                                <Sparkles className="h-4 w-4" />
                                Generate AI Plan
                            </button>
                            <a
                                href="https://calendar.google.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/70 px-4 py-2 text-sm font-bold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                            >
                                <Calendar className="h-4 w-4" />
                                Sync Google
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60 xl:col-span-3">
                            <p className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Time Blocking (Drag & Drop)</p>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                                {DAYS.map((day) => (
                                    <div
                                        key={day}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={() => dropPlannerBlock(day)}
                                        className="min-h-[160px] rounded-xl border border-white/20 bg-white/70 p-2 dark:border-white/5 dark:bg-neutral-900/70"
                                    >
                                        <p className="mb-2 text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">{day}</p>
                                        <div className="space-y-2">
                                            {plannerBlocks.filter((block) => block.day === day).length === 0 && (
                                                <p className="rounded-lg border border-dashed border-white/20 px-2 py-3 text-center text-[10px] text-neutral-400 dark:border-white/5 dark:text-neutral-500">
                                                    Tidak ada jadwal
                                                </p>
                                            )}
                                            {plannerBlocks
                                                .filter((block) => block.day === day)
                                                .map((block) => (
                                                    <div
                                                        key={block.id}
                                                        draggable
                                                        onDragStart={() => setDraggingBlockId(block.id)}
                                                        className={`cursor-move rounded-lg border px-2 py-2 text-xs font-semibold ${
                                                            block.type === 'deadline'
                                                                ? 'border-red-300 bg-red-50 text-red-700'
                                                                : block.type === 'group'
                                                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                                                : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                        }`}
                                                    >
                                                        <p className="line-clamp-2">{block.title}</p>
                                                        <p className="mt-1 text-[10px] font-bold">
                                                            {block.start} - {block.end}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60">
                            <p className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Upcoming Deadlines</p>
                            <div className="space-y-2">
                                {upcoming_deadlines.length > 0 ? (
                                    upcoming_deadlines.slice(0, 6).map((deadline) => (
                                        <div
                                            key={deadline.id}
                                            className="rounded-xl border border-white/20 bg-white/70 p-3 dark:border-white/5 dark:bg-neutral-900/60"
                                        >
                                            <p className="text-xs font-bold text-neutral-900 dark:text-white">{deadline.title}</p>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{deadline.course_name}</p>
                                            <p className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                                                {deadline.deadline_formatted} • H-{deadline.days_remaining ?? '-'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-white/20 bg-white/70 p-3 text-xs text-neutral-500 dark:border-white/5 dark:bg-neutral-900/60 dark:text-neutral-400">
                                        Tidak ada deadline aktif.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Collaborative Study Groups</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Cari partner belajar, koordinasi sesi grup, dan update progress bersama.
                            </p>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white">
                            <Users className="h-4 w-4" />
                            Find Partners
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {study_groups.length > 0 ? (
                            study_groups.slice(0, 6).map((group) => (
                                <motion.div
                                    key={group.id}
                                    whileHover={cardHover}
                                    className="rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white">{group.name}</h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{group.description}</p>
                                        </div>
                                        <span className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-600">
                                            {group.member_count} member
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {group.members.slice(0, 3).map((member) => (
                                            <div key={`${group.id}-${member.id}`} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-xs dark:bg-neutral-900/70">
                                                <p className="font-semibold text-neutral-700 dark:text-neutral-300">{member.name}</p>
                                                {member.is_admin && <span className="text-[10px] font-bold text-emerald-600">Admin</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button className="flex-1 rounded-lg border border-white/20 bg-white/70 px-3 py-2 text-xs font-bold text-neutral-700 dark:border-white/5 dark:bg-neutral-900/60 dark:text-neutral-200">
                                            Open Chat
                                        </button>
                                        <button className="flex-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-bold text-white">
                                            Schedule
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/60 p-4 text-sm text-neutral-500 dark:border-white/5 dark:bg-neutral-800/60 dark:text-neutral-400 lg:col-span-3">
                                Belum ada data study group untuk mata kuliah kamu.
                            </div>
                        )}
                    </div>
                </motion.section>

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Course Materials Hub</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Akses resource per topik, monitor download, dan unggah materi baru.</p>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white">
                            <Upload className="h-4 w-4" />
                            Upload Material
                        </button>
                    </div>

                    <div className="space-y-3">
                        {materialRows.length > 0 ? (
                            materialRows.slice(0, 10).map((material) => {
                                const progress = downloadProgress[material.id] ?? 0;

                                return (
                                    <div
                                        key={material.id}
                                        className="grid grid-cols-1 items-center gap-3 rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60 md:grid-cols-12"
                                    >
                                        <div className="md:col-span-5">
                                            <p className="font-bold text-neutral-900 dark:text-white">{material.title}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{material.courseName}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-600">
                                                {material.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="md:col-span-3">
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${progress}%` }} />
                                            </div>
                                            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">{progress}%</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <button
                                                onClick={() => startDownload(material.id)}
                                                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-indigo-600 dark:bg-neutral-900"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/60 p-4 text-sm text-neutral-500 dark:border-white/5 dark:bg-neutral-800/60 dark:text-neutral-400">
                                Belum ada materi kuliah yang tersimpan.
                            </div>
                        )}
                    </div>
                </motion.section>

                <motion.section
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Gamification & Achievements</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Badge progress, streak belajar, dan leaderboard per mata kuliah.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
                            <Flame className="h-4 w-4" />
                            Streak {Math.max(4, stats.on_track_courses + 3)} hari
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <div className="space-y-3 xl:col-span-2">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {gamificationBadges.map((badge) => (
                                    <motion.div
                                        key={badge.id}
                                        whileHover={cardHover}
                                        className={`rounded-2xl border p-4 ${
                                            badge.unlocked
                                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                                : 'border-white/20 bg-white/60 text-neutral-600 dark:border-white/5 dark:bg-neutral-800/60 dark:text-neutral-300'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <Award className="h-5 w-5" />
                                            <span className="text-xs font-bold">{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
                                        </div>
                                        <p className="font-bold">{badge.title}</p>
                                        <p className="mt-1 text-xs">{badge.subtitle}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60">
                                <p className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Progress Milestones</p>
                                <div className="space-y-2">
                                    {courses.slice(0, 5).map((course) => (
                                        <div key={course.id} className="rounded-xl border border-white/20 bg-white/70 p-3 dark:border-white/5 dark:bg-neutral-900/60">
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <p className="font-bold text-neutral-700 dark:text-neutral-200">{course.code || '—'}</p>
                                                <p className="font-semibold text-neutral-500 dark:text-neutral-400">
                                                    {course.progress.meeting_progress.toFixed(0)}%
                                                </p>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                                    style={{ width: `${course.progress.meeting_progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60">
                            <p className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Leaderboard</p>
                            <div className="space-y-2">
                                {leaderboardRows.length > 0 ? (
                                    leaderboardRows.map((row) => (
                                        <div
                                            key={row.rank}
                                            className="rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-sm dark:border-white/5 dark:bg-neutral-900/60"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-neutral-700 dark:text-neutral-200">#{row.rank} {row.code}</p>
                                                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{row.points} XP</p>
                                            </div>
                                            <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">{row.name}</p>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                <Target className="h-3.5 w-3.5" />
                                                Streak {row.streak} sesi
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-white/20 bg-white/70 px-3 py-3 text-xs text-neutral-500 dark:border-white/5 dark:bg-neutral-900/60 dark:text-neutral-400">
                                        Belum ada data leaderboard.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>
            </motion.div>

            <AnimatePresence>
                {showAIPanel && (
                    <>
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAIPanel(false)}
                            className="fixed inset-0 z-40 bg-neutral-900/45 backdrop-blur-sm"
                            aria-label="Tutup panel AI"
                        />
                        <motion.aside
                            initial={{ x: 420, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 420, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/5 dark:bg-neutral-900/85"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white">
                                        <Brain className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">AI Study Recommendations</h3>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Personalized plan untuk performa akademik</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAIPanel(false)}
                                    className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    aria-label="Tutup panel rekomendasi AI"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {selectedCourse && selectedInsight && (
                                <div className="mb-4 rounded-2xl border border-white/20 bg-white/70 p-4 dark:border-white/5 dark:bg-neutral-800/70">
                                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Course Focus</p>
                                    <h4 className="text-base font-bold text-neutral-900 dark:text-white">{selectedCourse.name}</h4>
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                        <span
                                            className={`rounded-lg px-2 py-1 font-bold ${
                                                selectedInsight.priority === 'high'
                                                    ? 'bg-rose-100 text-rose-600'
                                                    : selectedInsight.priority === 'medium'
                                                    ? 'bg-amber-100 text-amber-600'
                                                    : 'bg-emerald-100 text-emerald-600'
                                            }`}
                                        >
                                            {selectedInsight.priority.toUpperCase()}
                                        </span>
                                        <span className="rounded-lg bg-indigo-100 px-2 py-1 font-bold text-indigo-600">
                                            Risk {selectedInsight.score}/100
                                        </span>
                                        <span className="rounded-lg bg-sky-100 px-2 py-1 font-bold text-sky-600">
                                            Focus {selectedInsight.focusHours}h
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{selectedInsight.summary}</p>
                                    <div className="mt-3 space-y-2">
                                        {selectedInsight.actions.map((action, index) => (
                                            <p key={`${selectedInsight.courseId}-${index}`} className="text-xs text-neutral-600 dark:text-neutral-300">
                                                {index + 1}. {action}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {topRecommendationCourses.map((course, index) => {
                                    const insight = aiInsightMap.get(course.id);

                                    if (!insight) {
                                        return null;
                                    }

                                    return (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, x: 15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            className="rounded-2xl border border-white/20 bg-white/70 p-4 dark:border-white/5 dark:bg-neutral-800/70"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                    {course.code || '—'} • {course.name}
                                                </h4>
                                                <span
                                                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                                                        insight.priority === 'high'
                                                            ? 'bg-rose-100 text-rose-600'
                                                            : insight.priority === 'medium'
                                                            ? 'bg-amber-100 text-amber-600'
                                                            : 'bg-emerald-100 text-emerald-600'
                                                    }`}
                                                >
                                                    {insight.priority}
                                                </span>
                                            </div>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-300">{insight.summary}</p>
                                            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                                <span>
                                                    Risk {insight.score}/100 • Focus {insight.focusHours}h
                                                </span>
                                                <button
                                                    onClick={() => setSelectedCourse(course)}
                                                    className="inline-flex items-center gap-1 font-bold text-indigo-600"
                                                >
                                                    Prioritize <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}

function CourseCard3D({
    course,
    index,
    aiSummary,
    onToggleFavorite,
    onOpenAI,
}: {
    course: Course;
    index: number;
    aiSummary: string;
    onToggleFavorite: (id: number) => void;
    onOpenAI: () => void;
}) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rotateY = ((event.clientX - centerX) / rect.width) * 12;
        const rotateX = ((centerY - event.clientY) / rect.height) * 12;

        setTilt({ x: rotateX, y: rotateY });
    };

    const resetTilt = () => {
        setTilt({ x: 0, y: 0 });
    };

    const statusTheme =
        course.progress.meeting_progress >= 75
            ? 'from-emerald-500 to-teal-600'
            : course.progress.meeting_progress >= 45
            ? 'from-amber-500 to-orange-600'
            : 'from-rose-500 to-red-600';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
            style={{ perspective: '1300px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
            onHoverStart={() => setIsFlipped(true)}
            onHoverEnd={() => setIsFlipped(false)}
            className="h-[380px] sm:h-[340px]"
        >
            <motion.div
                animate={{ rotateX: tilt.x, rotateY: tilt.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="h-full w-full"
            >
                <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="relative h-full w-full"
                >
                    <div
                        style={{ backfaceVisibility: 'hidden' }}
                        className="absolute inset-0 rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-start justify-between gap-2">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-600">{course.code || '—'}</span>
                                    <span
                                        className={`rounded-lg px-2 py-1 text-xs font-bold ${
                                            course.mode === 'online'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-blue-100 text-blue-600'
                                        }`}
                                    >
                                        {course.mode}
                                    </span>
                                </div>
                                <h3 className="line-clamp-2 text-lg font-bold text-neutral-900 dark:text-white">{course.name}</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{course.dosen}</p>
                            </div>
                            <button
                                onClick={() => onToggleFavorite(course.id)}
                                className="rounded-lg p-2 hover:bg-white/40"
                                aria-label="Toggle favorite mata kuliah"
                            >
                                <Star className={`h-5 w-5 ${course.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'}`} />
                            </button>
                        </div>

                        <div className="mb-4 grid grid-cols-3 gap-2">
                            <ProgressRadial
                                label="Meeting"
                                value={course.progress.meeting_progress}
                                color="#6366f1"
                            />
                            <ProgressRadial
                                label="Tugas"
                                value={course.progress.assignment_progress}
                                color="#10b981"
                            />
                            <ProgressRadial
                                label="Nilai"
                                value={course.progress.average_grade}
                                color="#f59e0b"
                                displayValue={
                                    course.progress.average_grade !== null
                                        ? course.progress.average_grade.toFixed(1)
                                        : '-'
                                }
                            />
                        </div>

                        <div className="mb-4 rounded-xl border border-white/20 bg-white/70 p-3 dark:border-white/5 dark:bg-neutral-800/70">
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-neutral-500 dark:text-neutral-400">Progress Pertemuan</span>
                                <span className="font-bold text-neutral-900 dark:text-white">{course.progress.meeting_progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                <div className={`h-full rounded-full bg-gradient-to-r ${statusTheme}`} style={{ width: `${course.progress.meeting_progress}%` }} />
                            </div>
                        </div>

                        {course.next_session && (
                            <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-950/25">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Next Session</p>
                                <p className="text-sm font-bold text-neutral-900 dark:text-white">{course.next_session.topic}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {course.next_session.date} • {course.next_session.time}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={onOpenAI}
                                className="flex-1 rounded-xl bg-indigo-500 px-3 py-2 text-xs font-bold text-white"
                            >
                                AI Tips
                            </button>
                            <button
                                onClick={() => setIsFlipped(true)}
                                className="flex-1 rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-xs font-bold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                            >
                                Quick Actions
                            </button>
                        </div>
                    </div>

                    <div
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        className="absolute inset-0 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 text-white shadow-xl sm:p-5"
                    >
                        <h3 className="mb-2 text-base font-bold sm:mb-3 sm:text-lg">Quick Actions</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Lihat Jadwal', href: `/user/akademik/jadwal?course=${course.id}`, icon: Calendar },
                                { label: 'Tugas & Materi', href: `/user/tugas?course=${course.id}`, icon: FileText },
                                { label: 'Analytics', href: `/user/rekapan?course=${course.id}`, icon: TrendingUp },
                                { label: 'Catatan', href: `/user/akademik/catatan?course=${course.id}`, icon: BookOpen },
                            ].map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/30 sm:text-sm"
                                >
                                    <action.icon className="h-4 w-4" />
                                    {action.label}
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Link>
                            ))}
                        </div>

                        <div className="mt-3 rounded-2xl border border-white/30 bg-black/10 p-2.5 backdrop-blur-md sm:mt-4 sm:p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-white/85">Completion Prediction</p>
                                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">AI</span>
                            </div>
                            <div className="rounded-xl border border-white/25 bg-white/15 p-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <Calendar className="h-4 w-4 text-white/90" />
                                    <span>{course.predicted_completion_date}</span>
                                </div>
                                <p className="mt-2 overflow-hidden text-xs leading-relaxed text-white/90 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                                    {aiSummary}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

function CourseCardList({
    course,
    index,
    aiSummary,
    onToggleFavorite,
    onOpenAI,
}: {
    course: Course;
    index: number;
    aiSummary: string;
    onToggleFavorite: (id: number) => void;
    onOpenAI: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={cardHover}
            className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
                <div className="flex items-start gap-3 lg:col-span-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="mb-1 flex flex-wrap gap-2">
                            <span className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-600">{course.code || '—'}</span>
                            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600">{course.mode}</span>
                        </div>
                        <h3 className="font-bold text-neutral-900 dark:text-white">{course.name}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{course.dosen}</p>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400">Progress Pertemuan</span>
                        <span className="font-bold text-neutral-900 dark:text-white">{course.progress.meeting_progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${course.progress.meeting_progress}%` }} />
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Kehadiran {course.progress.attendance_rate}%
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                            Nilai {course.progress.average_grade !== null ? course.progress.average_grade.toFixed(1) : '-'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:col-span-4 lg:justify-end">
                    <button
                        onClick={() => onToggleFavorite(course.id)}
                        className="rounded-xl border border-white/20 bg-white/70 p-2 dark:border-white/5 dark:bg-neutral-800/70"
                        aria-label="Toggle favorite"
                    >
                        <Star className={`h-4 w-4 ${course.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'}`} />
                    </button>
                    <button
                        onClick={onOpenAI}
                        className="rounded-xl bg-indigo-500 px-3 py-2 text-xs font-bold text-white"
                        title={aiSummary}
                    >
                        AI
                    </button>
                    <Link
                        href={`/user/akademik/jadwal?course=${course.id}`}
                        className="rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-xs font-bold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                    >
                        Jadwal
                    </Link>
                    <Link
                        href={`/user/tugas?course=${course.id}`}
                        className="rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-xs font-bold text-neutral-700 dark:border-white/5 dark:bg-neutral-800/70 dark:text-neutral-200"
                    >
                        Tugas
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

function ProgressRadial({
    label,
    value,
    color,
    displayValue,
}: {
    label: string;
    value: number | null;
    color: string;
    displayValue?: string;
}) {
    const numericValue = value ?? 0;
    const safeValue = Math.max(0, Math.min(100, numericValue));
    const textValue = displayValue ?? safeValue.toFixed(0);

    return (
        <div className="rounded-xl border border-white/20 bg-white/70 p-2 text-center dark:border-white/5 dark:bg-neutral-800/70">
            <div className="relative mx-auto h-16 w-16">
                <ResponsiveContainer>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="100%"
                        data={[{ name: label, value: safeValue }]}
                        startAngle={90}
                        endAngle={-270}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" tick={false} />
                        <RadialBar dataKey="value" cornerRadius={10} fill={color} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-neutral-700 dark:text-neutral-200">
                    {textValue}
                </div>
            </div>
            <p className="mt-1 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">{label}</p>
        </div>
    );
}
