import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
    BarChart3, TrendingUp, TrendingDown, Users, Calendar, Download,
    Filter, LineChart, PieChart, Award, AlertTriangle, Trophy,
    GitCompare, Sparkles, X, CheckCircle, Lightbulb, FileSpreadsheet,
    FileText, Code, RefreshCw, Minus, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import {
    LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart as RePieChart, Pie, Cell, Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { toast } from 'sonner';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import AnalyticsIcon from '@/assets/admin/analytics/analytics.png';
import StatTotalCourse from '@/assets/dosen/dashboard/stat-total-course.png';
import StatTotalStudents from '@/assets/dosen/dashboard/stat-total-students.png';
import StatTotalSessions from '@/assets/dosen/dashboard/stat-total-sessions.png';
import StatAttendanceRate from '@/assets/dosen/dashboard/stat-attendance-rate.png';

// ═══ TYPES & INTERFACES ═══

interface ClassInsight {
    course_id: number;
    course_name: string;
    course_code: string;
    sks: number;
    total_students: number;
    total_sessions: number;
    completed_sessions: number;
    average_attendance_rate: number;
    trend: 'up' | 'down' | 'stable';
    trend_percentage: number;
    grade_distribution: { A: number; B: number; C: number; D: number; E: number };
    at_risk_students: number;
    perfect_attendance: number;
    last_session_date: string;
    next_session_date: string;
    attendance_by_session: Array<{
        session_number: number;
        date: string;
        attendance_rate: number;
        present: number;
        late: number;
        absent: number;
    }>;
    top_performers: Array<{ mahasiswa_id: number; nama: string; nim: string; attendance_rate: number }>;
    bottom_performers: Array<{ mahasiswa_id: number; nama: string; nim: string; attendance_rate: number }>;
}

interface Props {
    dosen: { id: number; nama: string; nidn: string; email: string };
    courses: ClassInsight[];
    selectedCourse: ClassInsight | null;
    stats: {
        total_courses: number;
        total_students: number;
        average_attendance: number;
        total_sessions: number;
        courses_above_target: number;
        courses_below_target: number;
    };
}

// ═══ ANIMATION VARIANTS (EXACT COPY FROM KAS ADMIN) ═══

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
} as const;

// ═══ HELPER COMPONENTS ═══

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
    const spring = useSpring(0, { duration, bounce: 0 });
    const display = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
}

const getGradeColor = (grade: string): string => {
    switch (grade) {
        case 'A': return 'bg-emerald-500';
        case 'B': return 'bg-blue-500';
        case 'C': return 'bg-amber-500';
        case 'D': return 'bg-orange-500';
        case 'E': return 'bg-red-500';
        default: return 'bg-neutral-500';
    }
};

const getAttendanceColor = (rate: number): string => {
    if (rate >= 85) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (rate >= 75) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (rate >= 60) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
};

export default function ClassInsights({ dosen, courses, selectedCourse, stats }: Props) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string>(selectedCourse ? String(selectedCourse.course_id) : '');
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');

    // Modals state
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Compare Modal State
    const [compareClass1, setCompareClass1] = useState<string>('');
    const [compareClass2, setCompareClass2] = useState<string>('');

    const handleCourseChange = (val: string) => {
        setSelectedCourseId(val);
        router.visit('/dosen/class-insights', {
            data: { course_id: val },
            preserveState: true,
            preserveScroll: true,
            only: ['selectedCourse'],
        });
    };

    const handleRefresh = () => {
        router.reload({ only: ['courses', 'stats', 'selectedCourse'] });
        toast.success('Data berhasil direfresh');
    };

    const handleExport = async (format: 'csv' | 'pdf' | 'excel' | 'json') => {
        if (!selectedCourse) {
            toast.error('Pilih mata kuliah terlebih dahulu');
            return;
        }

        try {
            setIsExporting(true);
            const response = await fetch(`/dosen/class-insights/export-${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ course_id: selectedCourse.course_id }),
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `class-insights-${selectedCourse.course_code}-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Laporan berhasil diexport sebagai ${format.toUpperCase()}`);
            setShowExportModal(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal export laporan');
        } finally {
            setIsExporting(false);
        }
    };

    // Derived Data for Comparison
    const comparisonData = useMemo(() => {
        if (!compareClass1 || !compareClass2) return [];
        const c1 = courses.find(c => String(c.course_id) === compareClass1);
        const c2 = courses.find(c => String(c.course_id) === compareClass2);
        if (!c1 || !c2) return [];

        const maxSessions = Math.max(c1.attendance_by_session.length, c2.attendance_by_session.length);
        return Array.from({ length: maxSessions }, (_, i) => ({
            session: `Sesi ${i + 1}`,
            class1: c1.attendance_by_session[i]?.attendance_rate || 0,
            class2: c2.attendance_by_session[i]?.attendance_rate || 0,
            name1: c1.course_name,
            name2: c2.course_name,
        }));
    }, [compareClass1, compareClass2, courses]);

    // ═══ MAIN RENDER ═══

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Class Insights" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* ═══ HEADER (EXACT COPY FROM KAS ADMIN) ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Overlay & Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* 3 PULSE RINGS (Animated) */}
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i }}
                        />
                    ))}

                    <div className="relative">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                >
                                    <img src={AnalyticsIcon} alt="Class Insights" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>Analitik Kehadiran</motion.p>
                                    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>Class Insights</motion.h1>
                                    <motion.p className="mt-2 text-indigo-100 text-sm leading-relaxed max-w-lg"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Analisis kehadiran per kelas untuk {dosen.nama}</motion.p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                {selectedCourse && (
                                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                                        className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg"><TrendingUp className="h-6 w-6 text-white" /></div>
                                        <div>
                                            <p className="text-xs text-indigo-100">Rata-rata Kehadiran</p>
                                            <div className="text-2xl font-bold text-white flex items-center gap-1"><AnimatedCounter value={selectedCourse.average_attendance_rate} />%</div>
                                        </div>
                                    </motion.div>
                                )}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2">
                                    <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }} whileTap={{ scale: 0.98 }} onClick={handleRefresh} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30 transition-all"><RefreshCw className="h-4 w-4" />Refresh</motion.button>
                                    <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => setShowExportModal(true)} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30 transition-all"><Download className="h-4 w-4" />Export</motion.button>
                                    <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => setShowCompareModal(true)} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30 transition-all"><GitCompare className="h-4 w-4" />Bandingkan</motion.button>
                                    <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => setShowAIInsights(true)} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30 transition-all"><Sparkles className="h-4 w-4" />AI Insights</motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ SUMMARY CARDS ═══ */}
                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-4">
                    {/* Card 1: Total Mata Kuliah */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('courses')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-blue-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10" />
                        <motion.div
                            animate={{ scale: hoveredCard === 'courses' ? 1.5 : 1, opacity: hoveredCard === 'courses' ? 0.4 : 0.2 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex shrink-0 h-14 w-14 items-center justify-center">
                                <img src={StatTotalCourse} alt="Total MK" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total MK</p>
                                <div className="mt-1"><span className="text-2xl font-bold text-neutral-900 dark:text-white"><AnimatedCounter value={stats.total_courses} /></span></div>
                                <p className="text-xs text-neutral-400 mt-1">mata kuliah</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Total Mahasiswa */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('students')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            animate={{ scale: hoveredCard === 'students' ? 1.5 : 1, opacity: hoveredCard === 'students' ? 0.4 : 0.2 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex shrink-0 h-14 w-14 items-center justify-center">
                                <img src={StatTotalStudents} alt="Total Mhs" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Mhs</p>
                                <div className="mt-1"><span className="text-2xl font-bold text-neutral-900 dark:text-white"><AnimatedCounter value={stats.total_students} /></span></div>
                                <p className="text-xs text-neutral-400 mt-1">terdaftar</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Rata-rata Kehadiran */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('average')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-purple-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10" />
                        <motion.div
                            animate={{ scale: hoveredCard === 'average' ? 1.5 : 1, opacity: hoveredCard === 'average' ? 0.4 : 0.2 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex shrink-0 h-14 w-14 items-center justify-center">
                                <img src={StatAttendanceRate} alt="Rata-rata" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Rata-rata</p>
                                <div className="mt-1"><span className="text-2xl font-bold text-neutral-900 dark:text-white"><AnimatedCounter value={stats.average_attendance} />%</span></div>
                                <p className="text-xs text-neutral-400 mt-1">kehadiran</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 4: Total Sesi */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('sessions')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-amber-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" />
                        <motion.div
                            animate={{ scale: hoveredCard === 'sessions' ? 1.5 : 1, opacity: hoveredCard === 'sessions' ? 0.4 : 0.2 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex shrink-0 h-14 w-14 items-center justify-center">
                                <img src={StatTotalSessions} alt="Total Sesi" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Sesi</p>
                                <div className="mt-1"><span className="text-2xl font-bold text-neutral-900 dark:text-white"><AnimatedCounter value={stats.total_sessions} /></span></div>
                                <p className="text-xs text-neutral-400 mt-1">pertemuan</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ═══ FILTER & PREVIEW ═══ */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="flex items-center gap-3 mb-5">
                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Filter className="h-6 w-6" />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Pilih Mata Kuliah</h3>
                            <p className="text-sm text-neutral-500">Lihat analisis detail per kelas</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Select value={selectedCourseId} onValueChange={handleCourseChange}>
                            <SelectTrigger className="border-2 focus:ring-4 focus:ring-indigo-500/20 py-6">
                                <SelectValue placeholder="Pilih mata kuliah..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.course_id} value={String(course.course_id)}>
                                        <div className="flex items-center justify-between w-full gap-4 min-w-[300px]">
                                            <div>
                                                <span className="font-bold block">{course.course_name}</span>
                                                <span className="text-xs text-neutral-400">{course.course_code} • {course.sks} SKS</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getAttendanceColor(course.average_attendance_rate)}`}>
                                                    {course.average_attendance_rate}%
                                                </span>
                                                {course.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                {course.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                                {course.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedCourse && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-4 gap-3 pt-4 border-t border-neutral-200/50 dark:border-neutral-800">
                                <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-2xl font-bold text-blue-600">{selectedCourse.total_students}</p><p className="text-xs text-neutral-500">Mahasiswa</p></div>
                                <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-2xl font-bold text-emerald-600">{selectedCourse.completed_sessions}/{selectedCourse.total_sessions}</p><p className="text-xs text-neutral-500">Sesi</p></div>
                                <div className="text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20"><p className="text-2xl font-bold text-purple-600">{selectedCourse.average_attendance_rate}%</p><p className="text-xs text-neutral-500">Kehadiran</p></div>
                                <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><p className="text-2xl font-bold text-red-600">{selectedCourse.at_risk_students}</p><p className="text-xs text-neutral-500">At-Risk</p></div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* ═══ TREND CHART ═══ */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg shadow-blue-500/30">
                                <LineChart className="h-6 w-6" />
                            </motion.div>
                            <div><h3 className="font-bold text-neutral-900 dark:text-white">Trend Kehadiran</h3><p className="text-sm text-neutral-500">Analisis per pertemuan</p></div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setChartType('line')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartType === 'line' ? 'bg-indigo-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>Line</button>
                            <button onClick={() => setChartType('bar')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-indigo-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>Bar</button>
                        </div>
                    </div>

                    {selectedCourse ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'line' ? (
                                    <ReLineChart data={selectedCourse.attendance_by_session}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="session_number" label={{ value: 'Pertemuan', position: 'insideBottom', offset: -5 }} stroke="#6b7280" />
                                        <YAxis domain={[0, 100]} stroke="#6b7280" />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="attendance_rate" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 8 }} name="Kehadiran (%)" />
                                        <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Hadir" />
                                        <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Absen" />
                                    </ReLineChart>
                                ) : (
                                    <BarChart data={selectedCourse.attendance_by_session}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="session_number" stroke="#6b7280" />
                                        <YAxis domain={[0, 100]} stroke="#6b7280" />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                        <Legend />
                                        <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Hadir" />
                                        <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Terlambat" />
                                        <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absen" />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-neutral-400">Pilih mata kuliah untuk melihat data</div>
                    )}
                </motion.div>

                {/* ═══ GRADE DISTRIBUTION & PERFORMERS ═══ */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Grade Distribution */}
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="flex items-center gap-3 mb-6">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                <PieChart className="h-6 w-6" />
                            </motion.div>
                            <div><h3 className="font-bold text-neutral-900 dark:text-white">Distribusi Grade</h3><p className="text-sm text-neutral-500">Berdasarkan tingkat kehadiran</p></div>
                        </div>
                        {selectedCourse ? (
                            <div className="space-y-4">
                                {Object.entries(selectedCourse.grade_distribution).map(([grade, count]) => (
                                    <div key={grade} className="flex items-center gap-3">
                                        <motion.span whileHover={{ scale: 1.15 }} className={`w-10 h-10 rounded-xl ${getGradeColor(grade)} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>{grade}</motion.span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1"><span className="font-medium">{count} mahasiswa</span><span className="font-bold">{selectedCourse.total_students > 0 ? Math.round((count / selectedCourse.total_students) * 100) : 0}%</span></div>
                                            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${selectedCourse.total_students > 0 ? (count / selectedCourse.total_students) * 100 : 0}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${getGradeColor(grade)}`} /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="h-64 flex items-center justify-center text-neutral-400">Pilih mata kuliah</div>}
                    </motion.div>

                    {/* Top Top Performers */}
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="flex items-center gap-3 mb-6">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                <Award className="h-6 w-6" />
                            </motion.div>
                            <div><h3 className="font-bold text-neutral-900 dark:text-white">Top & Bottom</h3><p className="text-sm text-neutral-500">Analisis performa individu</p></div>
                        </div>
                        {selectedCourse ? (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-3"><Trophy className="h-4 w-4 text-amber-500" /><h4 className="font-bold text-sm">Top 3 Performers</h4></div>
                                    <div className="space-y-2">
                                        {selectedCourse.top_performers.slice(0, 3).map((s, i) => (
                                            <motion.div key={s.mahasiswa_id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                                <div className="flex items-center gap-3"><div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white text-xs font-bold">{i + 1}</div><div><p className="text-sm font-bold">{s.nama}</p><p className="text-xs text-neutral-500">{s.nim}</p></div></div><span className="text-sm font-bold text-emerald-600">{s.attendance_rate}%</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-red-500" /><h4 className="font-bold text-sm">Needs Attention</h4></div>
                                    <div className="space-y-2">
                                        {selectedCourse.bottom_performers.slice(0, 3).map((s, i) => (
                                            <motion.div key={s.mahasiswa_id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                                <div className="flex items-center gap-3"><div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500 text-white text-xs font-bold">{i + 1}</div><div><p className="text-sm font-bold">{s.nama}</p><p className="text-xs text-neutral-500">{s.nim}</p></div></div><span className="text-sm font-bold text-red-600">{s.attendance_rate}%</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : <div className="h-64 flex items-center justify-center text-neutral-400">Pilih mata kuliah</div>}
                    </motion.div>
                </div>
            </motion.div>

            {/* ═══ MODALS ═══ */}

            {/* COMPARE MODAL */}
            <AnimatePresence>
                {showCompareModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCompareModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-5xl rounded-3xl border border-white/20 bg-white dark:bg-neutral-950 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shrink-0">
                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                {[0, 1, 2].map(i => (<motion.div key={i} className="absolute right-10 top-1/2 -translate-y-1/2 h-20 w-20 rounded-full border border-white/10" animate={{ scale: [1, 2], opacity: [0.3, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: i * 0.8 }} />))}
                                <div className="relative flex items-center justify-between"><div className="flex items-center gap-4"><motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"><GitCompare className="h-7 w-7" /></motion.div><div><h3 className="text-xl font-bold">Bandingkan Kelas</h3><p className="text-sm text-white/80">Analisis komparatif antar mata kuliah</p></div></div><motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowCompareModal(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30"><X className="h-5 w-5" /></motion.button></div>
                            </div>
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium mb-2">Kelas 1</label><Select value={compareClass1} onValueChange={setCompareClass1}><SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.course_id} value={String(c.course_id)}>{c.course_name}</SelectItem>)}</SelectContent></Select></div>
                                    <div><label className="block text-sm font-medium mb-2">Kelas 2</label><Select value={compareClass2} onValueChange={setCompareClass2}><SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.course_id} value={String(c.course_id)}>{c.course_name}</SelectItem>)}</SelectContent></Select></div>
                                </div>
                                {compareClass1 && compareClass2 && (
                                    <div className="rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-6 h-[400px]">
                                        <h4 className="font-bold mb-4">Perbandingan Kehadiran Sesi</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={comparisonData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="session" />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip cursor={{ fill: 'transparent' }} />
                                                <Legend />
                                                <Bar dataKey="class1" fill="#6366f1" name={comparisonData[0]?.name1 || 'Kelas 1'} radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="class2" fill="#ec4899" name={comparisonData[0]?.name2 || 'Kelas 2'} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI INSIGHTS MODAL */}
            <AnimatePresence>
                {showAIInsights && selectedCourse && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAIInsights(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-4xl rounded-3xl border border-white/20 bg-white dark:bg-neutral-950 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-6 text-white shrink-0">
                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                <div className="relative flex items-center justify-between"><div className="flex items-center gap-4"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"><Sparkles className="h-7 w-7" /></motion.div><div><h3 className="text-xl font-bold">AI Insights</h3><p className="text-sm text-white/80">Analisis cerdas & rekomendasi</p></div></div><motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowAIInsights(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30"><X className="h-5 w-5" /></motion.button></div>
                            </div>
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/20 p-5 flex gap-4">
                                    <div className="bg-blue-500 rounded-xl p-3 h-fit text-white"><TrendingUp className="h-5 w-5" /></div>
                                    <div><h4 className="font-bold text-blue-900 dark:text-blue-300">Analisis Trend</h4><p className="text-sm text-blue-700 dark:text-blue-400">Trend kehadiran {selectedCourse.trend === 'up' ? 'meningkat' : selectedCourse.trend === 'down' ? 'menurun' : 'stabil'} dengan perubahan {Math.abs(selectedCourse.trend_percentage)}%. {selectedCourse.trend === 'down' && 'Perlu intervensi agar tidak semakin turun.'}</p></div>
                                </motion.div>
                                {selectedCourse.at_risk_students > 0 && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-red-200/50 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20 p-5 flex gap-4"><div className="bg-red-500 rounded-xl p-3 h-fit text-white"><AlertTriangle className="h-5 w-5" /></div><div><h4 className="font-bold text-red-900 dark:text-red-300">At-Risk Students ({selectedCourse.at_risk_students})</h4><p className="text-sm text-red-700 dark:text-red-400">Ada {selectedCourse.at_risk_students} mahasiswa dengan kehadiran di bawah 75%. Segera lakukan konseling individual.</p></div></motion.div>}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-purple-200/50 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-900/20 p-5 flex gap-4">
                                    <div className="bg-purple-500 rounded-xl p-3 h-fit text-white"><Lightbulb className="h-5 w-5" /></div>
                                    <div><h4 className="font-bold text-purple-900 dark:text-purple-300">Rekomendasi AI</h4><ul className="space-y-2 mt-2 text-sm text-purple-700 dark:text-purple-400"><li className="flex gap-2"><CheckCircle className="h-4 w-4 mt-0.5" /><span>Kirim reminder otomatis H-1 jadwal kuliah.</span></li><li className="flex gap-2"><CheckCircle className="h-4 w-4 mt-0.5" /><span>Berikan apresiasi pada Top 3 Performers di kelas.</span></li><li className="flex gap-2"><CheckCircle className="h-4 w-4 mt-0.5" /><span>Evaluasi materi pertemuan dengan kehadiran terendah.</span></li></ul></div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EXPORT MODAL */}
            <AnimatePresence>
                {showExportModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowExportModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/20 bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden">
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 text-white">
                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                <div className="relative flex items-center justify-between"><div className="flex items-center gap-3"><motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"><Download className="h-6 w-6" /></motion.div><div><h3 className="text-lg font-bold">Export Laporan</h3><p className="text-sm text-white/80">Pilih format export</p></div></div><motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowExportModal(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30"><X className="h-5 w-5" /></motion.button></div>
                            </div>
                            <div className="p-6 space-y-3">
                                <motion.button whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => handleExport('csv')} disabled={isExporting} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg"><FileSpreadsheet className="h-6 w-6" /></div><div className="text-left"><p className="font-bold text-neutral-900 dark:text-white">CSV / Excel</p><p className="text-sm text-neutral-500">Data tabular lengkap</p></div></motion.button>
                                <motion.button whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => handleExport('pdf')} disabled={isExporting} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-pink-600 text-white shadow-lg"><FileText className="h-6 w-6" /></div><div className="text-left"><p className="font-bold text-neutral-900 dark:text-white">PDF Report</p><p className="text-sm text-neutral-500">Siap cetak & presentasi</p></div></motion.button>
                                <motion.button whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => handleExport('json')} disabled={isExporting} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg"><Code className="h-6 w-6" /></div><div className="text-left"><p className="font-bold text-neutral-900 dark:text-white">JSON API</p><p className="text-sm text-neutral-500">Format data raw</p></div></motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DosenLayout>
    );
}
