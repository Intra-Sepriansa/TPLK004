import completedStatIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import examIcon from '@/assets/dosen/dashboard/course-icon.png';
import mataKuliahStatIcon from '@/assets/dosen/matakuliah/mata-kuliah.png';
import uasStatIcon from '@/assets/mahasiswa/akademik/uas.png';
import utsStatIcon from '@/assets/mahasiswa/akademik/uts.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import StudentLayout from '@/layouts/student-layout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCheck,
    CheckCircle2,
    Clock,
    Edit,
    GraduationCap,
    Plus,
    Save,
    Target,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Exam {
    id: number;
    course_id: number;
    course_name: string;
    type: 'UTS' | 'UAS';
    date: string;
    date_formatted: string;
    time?: string; // Jam ujian
    location?: string; // Lokasi ujian
    duration?: number; // Durasi dalam menit
    notes?: string; // Catatan tambahan
    days_remaining: number;
    meeting_number: number;
    is_warning: boolean;
    is_critical: boolean;
}

interface ExamsByMonth {
    month: string;
    exams: Exam[];
}

interface Course {
    id: number;
    name: string;
    sks: number;
    uts_meeting: number;
    uas_meeting: number;
    current_meeting: number;
    total_meetings: number;
    uts_passed: boolean;
    uas_passed: boolean;
}

interface ChecklistItem {
    id: number;
    text: string;
}

interface Props {
    upcomingExams: Exam[];
    examsByMonth: ExamsByMonth[];
    courses: Course[];
    preparationChecklist: ChecklistItem[];
}

export default function AcademicExams({
    upcomingExams,
    examsByMonth,
    courses,
    preparationChecklist,
}: Props) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
        {},
    );
    const [completedExams, setCompletedExams] = useState<
        Record<number, boolean>
    >({});
    const [customExams, setCustomExams] = useState<Exam[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [selectedCourse] = useState<Course | null>(null);
    const [isProgressDetailOpen, setIsProgressDetailOpen] = useState(false);
    const [formData, setFormData] = useState({
        course_name: '',
        type: 'UTS' as 'UTS' | 'UAS',
        date: '',
        time: '',
        location: '',
        duration: 120,
        notes: '',
    });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 20,
            },
        },
    };

    // Toggle exam completion
    const toggleExamCompletion = (examId: number) => {
        setCompletedExams((prev) => ({ ...prev, [examId]: !prev[examId] }));
    };

    // Add custom exam
    const handleAddExam = () => {
        const nextCustomId =
            customExams.length > 0
                ? Math.max(...customExams.map((exam) => exam.id)) + 1
                : allExams.length + 1;

        const newExam: Exam = {
            id: nextCustomId,
            course_id: 0,
            course_name: formData.course_name,
            type: formData.type,
            date: formData.date,
            date_formatted: new Date(formData.date).toLocaleDateString(
                'id-ID',
                {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                },
            ),
            time: formData.time,
            location: formData.location,
            duration: formData.duration,
            notes: formData.notes,
            days_remaining: Math.ceil(
                (new Date(formData.date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
            ),
            meeting_number: 0,
            is_warning: false,
            is_critical: false,
        };
        setCustomExams((prev) => [...prev, newExam]);
        setIsAddDialogOpen(false);
        resetForm();
    };

    // Edit exam
    const handleEditExam = () => {
        if (!editingExam) return;

        // Update custom exams
        if (editingExam.course_id === 0) {
            setCustomExams((prev) =>
                prev.map((exam) =>
                    exam.id === editingExam.id
                        ? {
                              ...exam,
                              course_name: formData.course_name,
                              type: formData.type,
                              date: formData.date,
                              date_formatted: new Date(
                                  formData.date,
                              ).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                              }),
                              time: formData.time,
                              location: formData.location,
                              duration: formData.duration,
                              notes: formData.notes,
                              days_remaining: Math.ceil(
                                  (new Date(formData.date).getTime() -
                                      new Date().getTime()) /
                                      (1000 * 60 * 60 * 24),
                              ),
                          }
                        : exam,
                ),
            );
        } else {
            // Update backend exams (stored in local state for UI purposes)
            const updatedExam = {
                ...editingExam,
                time: formData.time,
                location: formData.location,
                duration: formData.duration,
                notes: formData.notes,
            };

            // Store in a separate state for backend exam modifications
            setCustomExams((prev) => {
                const existing = prev.find((e) => e.id === editingExam.id);
                if (existing) {
                    return prev.map((e) =>
                        e.id === editingExam.id ? updatedExam : e,
                    );
                }
                return [...prev, updatedExam];
            });
        }

        setIsEditDialogOpen(false);
        setEditingExam(null);
        resetForm();
    };

    // Delete exam
    const handleDeleteExam = (examId: number) => {
        setCustomExams((prev) => prev.filter((exam) => exam.id !== examId));
    };

    // Open edit dialog
    const openEditDialog = (exam: Exam) => {
        const query = new URLSearchParams();
        query.set('exam_id', String(exam.id));
        if (exam.course_id) {
            query.set('course_id', String(exam.course_id));
        }

        router.visit(`/user/akademik/ujian/detail?${query.toString()}`);
    };

    // Merge backend exams with custom modifications
    const getMergedExam = (exam: Exam): Exam => {
        const customMod = customExams.find(
            (e) => e.id === exam.id && e.course_id !== 0,
        );
        if (customMod) {
            return { ...exam, ...customMod };
        }
        return exam;
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            course_name: '',
            type: 'UTS',
            date: '',
            time: '',
            location: '',
            duration: 120,
            notes: '',
        });
    };

    // Combine all exams
    const allExams = [
        ...upcomingExams.map(getMergedExam),
        ...customExams.filter((e) => e.course_id === 0),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate stats
    const stats = {
        total: allExams.length,
        critical: allExams.filter((e) => e.is_critical).length,
        warning: allExams.filter((e) => e.is_warning).length,
        uts: allExams.filter((e) => e.type === 'UTS').length,
        uas: allExams.filter((e) => e.type === 'UAS').length,
        completed: Object.values(completedExams).filter(Boolean).length,
    };

    const toggleCheck = (examId: number, itemId: number) => {
        const key = `${examId}-${itemId}`;
        setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const getCheckedCount = (examId: number) => {
        return preparationChecklist.filter(
            (item) => checkedItems[`${examId}-${item.id}`],
        ).length;
    };

    return (
        <StudentLayout>
            <Head title="Kalender Ujian" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8"
            >
                {/* Header - Matching Admin Dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/akademik')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start sm:gap-6">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center sm:mx-0 sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={examIcon}
                                        alt="Kalender Ujian"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen Ujian
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Kalender Ujian
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Countdown UTS dan UAS dengan persiapan
                                        lengkap
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards - Glassmorphism */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {[
                        {
                            key: 'total',
                            title: 'Total Ujian',
                            value: stats.total,
                            icon: mataKuliahStatIcon,
                            colorConfig: {
                                bg: 'bg-purple-500',
                                gradientBg:
                                    'from-purple-500/5 to-purple-500/5 dark:from-purple-500/10 dark:to-purple-500/10',
                            },
                        },
                        {
                            key: 'completed',
                            title: 'Selesai',
                            value: stats.completed,
                            icon: completedStatIcon,
                            colorConfig: {
                                bg: 'bg-emerald-500',
                                gradientBg:
                                    'from-emerald-500/5 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/10',
                            },
                        },
                        {
                            key: 'uts',
                            title: 'UTS',
                            value: stats.uts,
                            icon: utsStatIcon,
                            colorConfig: {
                                bg: 'bg-amber-500',
                                gradientBg:
                                    'from-amber-500/5 to-amber-500/5 dark:from-amber-500/10 dark:to-amber-500/10',
                            },
                        },
                        {
                            key: 'uas',
                            title: 'UAS',
                            value: stats.uas,
                            icon: uasStatIcon,
                            colorConfig: {
                                bg: 'bg-blue-500',
                                gradientBg:
                                    'from-blue-500/5 to-blue-500/5 dark:from-blue-500/10 dark:to-blue-500/10',
                            },
                        },
                    ].map((stat, index) => {
                        const cardKey = `stat-${index}`;

                        return (
                            <motion.div
                                key={stat.key}
                                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        },
                                    },
                                }}
                                whileHover={{
                                    scale: 1.04,
                                    y: -4,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 15,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(cardKey)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`}
                                />
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale:
                                            hoveredCard === cardKey ? 1.5 : 1,
                                        opacity:
                                            hoveredCard === cardKey ? 0.4 : 0.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl`}
                                />
                                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12"
                                    >
                                        <img
                                            src={stat.icon}
                                            alt={stat.title}
                                            className={`h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.28)] ${stat.key === 'total' ? 'scale-[1.18]' : 'scale-100'}`}
                                        />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                            {stat.title}
                                        </p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                                <AnimatedCounter
                                                    value={stat.value}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Upcoming Exams */}
                {upcomingExams.length > 0 ? (
                    <>
                        {/* Critical/Warning Exams */}
                        {upcomingExams.filter(
                            (e) => e.is_critical || e.is_warning,
                        ).length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="space-y-3"
                            >
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 font-semibold"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 15,
                                        }}
                                    >
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    </motion.div>
                                    Perlu Perhatian
                                </motion.h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {allExams
                                        .filter(
                                            (e) =>
                                                e.is_critical || e.is_warning,
                                        )
                                        .map((exam, index) => (
                                            <MagneticExamCard
                                                key={exam.id}
                                                exam={exam}
                                                index={index}
                                                checkedItems={checkedItems}
                                                preparationChecklist={
                                                    preparationChecklist
                                                }
                                                toggleCheck={toggleCheck}
                                                getCheckedCount={
                                                    getCheckedCount
                                                }
                                                isCompleted={
                                                    completedExams[exam.id] ||
                                                    false
                                                }
                                                toggleCompletion={
                                                    toggleExamCompletion
                                                }
                                                isCustom={exam.course_id === 0}
                                                onEdit={openEditDialog}
                                                onDelete={handleDeleteExam}
                                            />
                                        ))}
                                </div>
                            </motion.div>
                        )}

                        {/* All Exams by Month */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-4"
                        >
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 font-semibold"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 15,
                                    }}
                                >
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                </motion.div>
                                Jadwal Ujian
                            </motion.h2>
                            {examsByMonth.map((monthData) => (
                                <motion.div
                                    key={monthData.month}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                        <CardHeader className="border-b border-white/20 pb-2 dark:border-white/5">
                                            <CardTitle className="text-base text-neutral-900 dark:text-white">
                                                {monthData.month}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="space-y-3">
                                                {monthData.exams.map(
                                                    (exam, examIndex) => (
                                                        <motion.div
                                                            key={exam.id}
                                                            initial={{
                                                                opacity: 0,
                                                                x: -20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    examIndex *
                                                                    0.05,
                                                            }}
                                                            whileHover={{
                                                                scale: 1.02,
                                                                boxShadow:
                                                                    '0 10px 30px rgba(0,0,0,0.1)',
                                                            }}
                                                            className={`relative flex cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-all sm:flex-row sm:items-center sm:justify-between ${
                                                                completedExams[
                                                                    exam.id
                                                                ]
                                                                    ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20'
                                                                    : exam.is_critical
                                                                      ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
                                                                      : exam.is_warning
                                                                        ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
                                                                        : 'hover:border-blue-300 dark:hover:border-blue-700'
                                                            }`}
                                                        >
                                                            {/* Completion Overlay */}
                                                            {completedExams[
                                                                exam.id
                                                            ] && (
                                                                <motion.div
                                                                    initial={{
                                                                        opacity: 0,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                    }}
                                                                    className="absolute inset-0 rounded-lg bg-emerald-500/5"
                                                                />
                                                            )}

                                                            <div className="relative z-10 flex items-start gap-3">
                                                                <motion.div
                                                                    whileHover={{
                                                                        scale: 1.15,
                                                                        y: -2,
                                                                    }}
                                                                    transition={{
                                                                        type: 'spring',
                                                                        stiffness: 300,
                                                                        damping: 15,
                                                                    }}
                                                                    className={`rounded-lg p-2 ${
                                                                        completedExams[
                                                                            exam
                                                                                .id
                                                                        ]
                                                                            ? 'bg-emerald-100 dark:bg-emerald-900/50'
                                                                            : exam.type ===
                                                                                'UTS'
                                                                              ? 'bg-blue-100 dark:bg-blue-900/50'
                                                                              : 'bg-purple-100 dark:bg-purple-900/50'
                                                                    }`}
                                                                >
                                                                    {completedExams[
                                                                        exam.id
                                                                    ] ? (
                                                                        <CheckCheck className="h-5 w-5 text-emerald-600" />
                                                                    ) : (
                                                                        <Target
                                                                            className={`h-5 w-5 ${exam.type === 'UTS' ? 'text-blue-600' : 'text-purple-600'}`}
                                                                        />
                                                                    )}
                                                                </motion.div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge
                                                                            variant={
                                                                                exam.type ===
                                                                                'UTS'
                                                                                    ? 'secondary'
                                                                                    : 'default'
                                                                            }
                                                                            className="text-xs"
                                                                        >
                                                                            {
                                                                                exam.type
                                                                            }
                                                                        </Badge>
                                                                        {completedExams[
                                                                            exam
                                                                                .id
                                                                        ] && (
                                                                            <motion.div
                                                                                initial={{
                                                                                    scale: 0,
                                                                                    rotate: -180,
                                                                                }}
                                                                                animate={{
                                                                                    scale: 1,
                                                                                    rotate: 0,
                                                                                }}
                                                                                transition={{
                                                                                    type: 'spring',
                                                                                    stiffness: 200,
                                                                                }}
                                                                            >
                                                                                <Badge className="bg-emerald-500 text-xs hover:bg-emerald-600">
                                                                                    <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                                                                    Selesai
                                                                                </Badge>
                                                                            </motion.div>
                                                                        )}
                                                                        <span
                                                                            className={`truncate font-medium ${completedExams[exam.id] ? 'text-muted-foreground line-through' : ''}`}
                                                                        >
                                                                            {
                                                                                exam.course_name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                                                        <Clock className="h-3 w-3" />
                                                                        {
                                                                            exam.date_formatted
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="relative z-10 flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                                                                <motion.div
                                                                    whileHover={{
                                                                        scale: 1.1,
                                                                    }}
                                                                    className={`text-right ${
                                                                        completedExams[
                                                                            exam
                                                                                .id
                                                                        ]
                                                                            ? 'text-emerald-600'
                                                                            : exam.is_critical
                                                                              ? 'text-red-600'
                                                                              : exam.is_warning
                                                                                ? 'text-amber-600'
                                                                                : 'text-blue-600'
                                                                    }`}
                                                                >
                                                                    <p className="text-xl font-bold">
                                                                        <AnimatedCounter
                                                                            value={
                                                                                exam.days_remaining
                                                                            }
                                                                            duration={
                                                                                1000
                                                                            }
                                                                        />
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        hari
                                                                    </p>
                                                                </motion.div>
                                                                <div className="flex shrink-0 gap-2">
                                                                    {/* Toggle Completion Button */}
                                                                    <motion.button
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                        }}
                                                                        whileTap={{
                                                                            scale: 0.9,
                                                                        }}
                                                                        onClick={() =>
                                                                            toggleExamCompletion(
                                                                                exam.id,
                                                                            )
                                                                        }
                                                                        className={`rounded-lg p-2 transition-colors ${
                                                                            completedExams[
                                                                                exam
                                                                                    .id
                                                                            ]
                                                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50'
                                                                                : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-gray-800 dark:hover:bg-emerald-900/30'
                                                                        }`}
                                                                    >
                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                    </motion.button>
                                                                    {/* Edit button */}
                                                                    <motion.button
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                        }}
                                                                        whileTap={{
                                                                            scale: 0.9,
                                                                        }}
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                getMergedExam(
                                                                                    exam,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900/70"
                                                                    >
                                                                        <Edit className="h-5 w-5" />
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                ) : (
                    <motion.div variants={itemVariants}>
                        <Card className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <GraduationCap className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                    </motion.div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-muted-foreground"
                                    >
                                        Belum ada ujian terjadwal
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-1 text-sm text-muted-foreground"
                                    >
                                        Tambahkan mata kuliah untuk melihat
                                        jadwal ujian
                                    </motion.p>
                                    <Link href="/user/akademik/matkul">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                                        >
                                            Kelola Mata Kuliah
                                        </motion.button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Course Progress Overview */}
                {courses.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <Card className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            <CardHeader className="border-b border-white/20 pb-3 dark:border-white/5">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <motion.div
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 15,
                                        }}
                                    >
                                        <BookOpen className="h-5 w-5 text-emerald-600" />
                                    </motion.div>
                                    Progress Menuju Ujian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    {courses.map((course, index) => (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{
                                                scale: 1.02,
                                                boxShadow:
                                                    '0 10px 30px rgba(16, 185, 129, 0.1)',
                                            }}
                                            onClick={() =>
                                                router.visit(
                                                    `/user/akademik/ujian/detail?course_id=${course.id}`,
                                                )
                                            }
                                            className="cursor-pointer rounded-lg border p-3 transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="font-medium">
                                                    {course.name}
                                                </span>
                                                <Badge variant="outline">
                                                    {course.sks} SKS
                                                </Badge>
                                            </div>
                                            <div className="relative">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${(course.current_meeting / course.total_meetings) * 100}%`,
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        delay: index * 0.05,
                                                    }}
                                                >
                                                    <Progress
                                                        value={
                                                            (course.current_meeting /
                                                                course.total_meetings) *
                                                            100
                                                        }
                                                        className="h-3"
                                                    />
                                                </motion.div>
                                                {/* UTS Marker */}
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay:
                                                            0.5 + index * 0.1,
                                                    }}
                                                    className="absolute top-0 h-3 w-0.5 bg-amber-500"
                                                    style={{
                                                        left: `${(course.uts_meeting / course.total_meetings) * 100}%`,
                                                    }}
                                                />
                                                {/* UAS Marker */}
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay:
                                                            0.6 + index * 0.1,
                                                    }}
                                                    className="absolute top-0 h-3 w-0.5 bg-red-500"
                                                    style={{
                                                        left: `${(course.uas_meeting / course.total_meetings) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>
                                                    P{course.current_meeting}/
                                                    {course.total_meetings}
                                                </span>
                                                <div className="flex items-center gap-4">
                                                    <motion.span
                                                        whileHover={{
                                                            scale: 1.1,
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                        UTS (P
                                                        {course.uts_meeting})
                                                        {course.uts_passed && (
                                                            <motion.div
                                                                initial={{
                                                                    scale: 0,
                                                                    rotate: -180,
                                                                }}
                                                                animate={{
                                                                    scale: 1,
                                                                    rotate: 0,
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 200,
                                                                }}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                            </motion.div>
                                                        )}
                                                    </motion.span>
                                                    <motion.span
                                                        whileHover={{
                                                            scale: 1.1,
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                                        UAS (P
                                                        {course.uas_meeting})
                                                        {course.uas_passed && (
                                                            <motion.div
                                                                initial={{
                                                                    scale: 0,
                                                                    rotate: -180,
                                                                }}
                                                                animate={{
                                                                    scale: 1,
                                                                    rotate: 0,
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 200,
                                                                }}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                            </motion.div>
                                                        )}
                                                    </motion.span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Preparation Tips */}
                <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                        {/* Animated Background */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 180],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-800/20"
                        />
                        <CardContent className="relative z-10 p-4">
                            <div className="flex items-start gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 15,
                                    }}
                                    className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50"
                                >
                                    <Target className="h-5 w-5 text-blue-600" />
                                </motion.div>
                                <div className="flex-1">
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="font-medium"
                                    >
                                        Tips Persiapan Ujian
                                    </motion.p>
                                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                        {preparationChecklist.map(
                                            (item, index) => (
                                                <motion.li
                                                    key={item.id}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: index * 0.05,
                                                    }}
                                                    whileHover={{ x: 5 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{
                                                            delay:
                                                                0.5 +
                                                                index * 0.1,
                                                            type: 'spring',
                                                        }}
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                    </motion.div>
                                                    {item.text}
                                                </motion.li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAddDialogOpen(true)}
                className="fixed right-8 bottom-8 z-50 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white shadow-2xl transition-all hover:shadow-purple-500/50"
            >
                <Plus className="h-6 w-6" />
            </motion.button>

            {/* Add Exam Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 15,
                                }}
                            >
                                <GraduationCap className="h-6 w-6 text-red-500" />
                            </motion.div>
                            Tambah Ujian Baru
                        </DialogTitle>
                    </DialogHeader>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 py-4"
                    >
                        {/* Step 1: Basic Info */}
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Label
                                    htmlFor="course_name"
                                    className="text-base font-semibold"
                                >
                                    Nama Mata Kuliah
                                </Label>
                                <Input
                                    id="course_name"
                                    value={formData.course_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            course_name: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Pemrograman Web"
                                    className="mt-2 h-12 text-base"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <Label
                                        htmlFor="type"
                                        className="text-base font-semibold"
                                    >
                                        Jenis Ujian
                                    </Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: 'UTS' | 'UAS') =>
                                            setFormData({
                                                ...formData,
                                                type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-2 h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTS">
                                                UTS (Ujian Tengah Semester)
                                            </SelectItem>
                                            <SelectItem value="UAS">
                                                UAS (Ujian Akhir Semester)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="duration"
                                        className="text-base font-semibold"
                                    >
                                        Durasi (menit)
                                    </Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                duration: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="mt-2 h-12 text-base"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Step 2: Schedule */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4 border-t pt-4"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Jadwal Ujian
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label
                                        htmlFor="date"
                                        className="text-base font-semibold"
                                    >
                                        Tanggal
                                    </Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                date: e.target.value,
                                            })
                                        }
                                        className="mt-2 h-12 text-base"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="time"
                                        className="text-base font-semibold"
                                    >
                                        Jam
                                    </Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                time: e.target.value,
                                            })
                                        }
                                        className="mt-2 h-12 text-base"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Step 3: Location & Notes */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4 border-t pt-4"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Target className="h-5 w-5 text-purple-500" />
                                Detail Tambahan
                            </h3>
                            <div>
                                <Label
                                    htmlFor="location"
                                    className="text-base font-semibold"
                                >
                                    Lokasi
                                </Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Ruang 301, Gedung A"
                                    className="mt-2 h-12 text-base"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="notes"
                                    className="text-base font-semibold"
                                >
                                    Catatan
                                </Label>
                                <textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Catatan tambahan tentang ujian..."
                                    className="mt-2 min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                                />
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-3 pt-4"
                        >
                            <Button
                                onClick={handleAddExam}
                                disabled={
                                    !formData.course_name || !formData.date
                                }
                                className="h-12 flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-base hover:from-red-600 hover:to-pink-700"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                Simpan Ujian
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddDialogOpen(false);
                                    resetForm();
                                }}
                                className="h-12 px-6"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </DialogContent>
            </Dialog>

            {/* Progress Detail Dialog */}
            <Dialog
                open={isProgressDetailOpen}
                onOpenChange={setIsProgressDetailOpen}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 15,
                                }}
                            >
                                <BookOpen className="h-6 w-6 text-emerald-500" />
                            </motion.div>
                            Detail Progress Mata Kuliah
                        </DialogTitle>
                    </DialogHeader>
                    {selectedCourse && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 py-4"
                        >
                            {/* Course Info */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            {selectedCourse.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {selectedCourse.sks} SKS •{' '}
                                            {selectedCourse.current_meeting}{' '}
                                            dari {selectedCourse.total_meetings}{' '}
                                            pertemuan
                                        </p>
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 200,
                                        }}
                                        className="text-center"
                                    >
                                        <div className="text-4xl font-bold text-emerald-600">
                                            {Math.round(
                                                (selectedCourse.current_meeting /
                                                    selectedCourse.total_meetings) *
                                                    100,
                                            )}
                                            %
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Progress
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Progress Bar with Details */}
                                <div className="relative pt-2">
                                    <Progress
                                        value={
                                            (selectedCourse.current_meeting /
                                                selectedCourse.total_meetings) *
                                            100
                                        }
                                        className="h-6"
                                    />
                                    {/* UTS Marker */}
                                    <div
                                        className="absolute top-2 h-6 w-1 rounded bg-amber-500"
                                        style={{
                                            left: `${(selectedCourse.uts_meeting / selectedCourse.total_meetings) * 100}%`,
                                        }}
                                    />
                                    {/* UAS Marker */}
                                    <div
                                        className="absolute top-2 h-6 w-1 rounded bg-red-500"
                                        style={{
                                            left: `${(selectedCourse.uas_meeting / selectedCourse.total_meetings) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Exam Status Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* UTS Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={`rounded-xl border-2 p-4 ${
                                        selectedCourse.uts_passed
                                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                                            : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
                                    }`}
                                >
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
                                            <Target className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">
                                                UTS
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                Ujian Tengah Semester
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Pertemuan:
                                            </span>
                                            <span className="font-medium">
                                                P{selectedCourse.uts_meeting}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Status:
                                            </span>
                                            {selectedCourse.uts_passed ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                                    Selesai
                                                </Badge>
                                            ) : selectedCourse.current_meeting >=
                                              selectedCourse.uts_meeting ? (
                                                <Badge variant="destructive">
                                                    <AlertTriangle className="mr-1 h-3 w-3" />{' '}
                                                    Terlewat
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Clock className="mr-1 h-3 w-3" />{' '}
                                                    Menunggu
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Sisa Pertemuan:
                                            </span>
                                            <span className="font-medium">
                                                {Math.max(
                                                    0,
                                                    selectedCourse.uts_meeting -
                                                        selectedCourse.current_meeting,
                                                )}{' '}
                                                pertemuan
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* UAS Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={`rounded-xl border-2 p-4 ${
                                        selectedCourse.uas_passed
                                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                                            : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'
                                    }`}
                                >
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/50">
                                            <GraduationCap className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">
                                                UAS
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                Ujian Akhir Semester
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Pertemuan:
                                            </span>
                                            <span className="font-medium">
                                                P{selectedCourse.uas_meeting}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Status:
                                            </span>
                                            {selectedCourse.uas_passed ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                                    Selesai
                                                </Badge>
                                            ) : selectedCourse.current_meeting >=
                                              selectedCourse.uas_meeting ? (
                                                <Badge variant="destructive">
                                                    <AlertTriangle className="mr-1 h-3 w-3" />{' '}
                                                    Terlewat
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Clock className="mr-1 h-3 w-3" />{' '}
                                                    Menunggu
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Sisa Pertemuan:
                                            </span>
                                            <span className="font-medium">
                                                {Math.max(
                                                    0,
                                                    selectedCourse.uas_meeting -
                                                        selectedCourse.current_meeting,
                                                )}{' '}
                                                pertemuan
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Meeting Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-3"
                            >
                                <h4 className="flex items-center gap-2 font-semibold">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Timeline Pertemuan
                                </h4>
                                <div className="max-h-60 space-y-2 overflow-y-auto">
                                    {Array.from(
                                        {
                                            length: selectedCourse.total_meetings,
                                        },
                                        (_, i) => i + 1,
                                    ).map((meeting) => (
                                        <motion.div
                                            key={meeting}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: 0.4 + meeting * 0.02,
                                            }}
                                            className={`flex items-center gap-3 rounded-lg p-2 ${
                                                meeting <=
                                                selectedCourse.current_meeting
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/30'
                                                    : 'bg-gray-50 dark:bg-gray-900/30'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                                    meeting <=
                                                    selectedCourse.current_meeting
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                }`}
                                            >
                                                {meeting}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    Pertemuan {meeting}
                                                </p>
                                                {meeting ===
                                                    selectedCourse.uts_meeting && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="mt-1 text-xs"
                                                    >
                                                        <Target className="mr-1 h-3 w-3" />{' '}
                                                        UTS
                                                    </Badge>
                                                )}
                                                {meeting ===
                                                    selectedCourse.uas_meeting && (
                                                    <Badge
                                                        variant="default"
                                                        className="mt-1 text-xs"
                                                    >
                                                        <GraduationCap className="mr-1 h-3 w-3" />{' '}
                                                        UAS
                                                    </Badge>
                                                )}
                                            </div>
                                            {meeting <=
                                                selectedCourse.current_meeting && (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Close Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Button
                                    onClick={() =>
                                        setIsProgressDetailOpen(false)
                                    }
                                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-base hover:from-emerald-600 hover:to-teal-700"
                                >
                                    Tutup
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Exam Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 15,
                                }}
                            >
                                <Edit className="h-6 w-6 text-blue-500" />
                            </motion.div>
                            Edit Ujian
                        </DialogTitle>
                    </DialogHeader>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 py-4"
                    >
                        {/* Basic Info - Disabled for backend exams */}
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Label
                                    htmlFor="edit_course_name"
                                    className="text-base font-semibold"
                                >
                                    Nama Mata Kuliah
                                </Label>
                                <Input
                                    id="edit_course_name"
                                    value={formData.course_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            course_name: e.target.value,
                                        })
                                    }
                                    className="mt-2 h-12 text-base"
                                    disabled={editingExam?.course_id !== 0}
                                />
                                {editingExam?.course_id !== 0 && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Nama mata kuliah dari sistem tidak dapat
                                        diubah
                                    </p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <Label
                                        htmlFor="edit_type"
                                        className="text-base font-semibold"
                                    >
                                        Jenis Ujian
                                    </Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: 'UTS' | 'UAS') =>
                                            setFormData({
                                                ...formData,
                                                type: value,
                                            })
                                        }
                                        disabled={editingExam?.course_id !== 0}
                                    >
                                        <SelectTrigger className="mt-2 h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTS">
                                                UTS
                                            </SelectItem>
                                            <SelectItem value="UAS">
                                                UAS
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editingExam?.course_id !== 0 && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Tidak dapat diubah
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label
                                        htmlFor="edit_duration"
                                        className="text-base font-semibold"
                                    >
                                        Durasi (menit)
                                    </Label>
                                    <Input
                                        id="edit_duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                duration: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="mt-2 h-12 text-base"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Schedule - Date disabled for backend exams */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4 border-t pt-4"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Jadwal Ujian
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label
                                        htmlFor="edit_date"
                                        className="text-base font-semibold"
                                    >
                                        Tanggal
                                    </Label>
                                    <Input
                                        id="edit_date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                date: e.target.value,
                                            })
                                        }
                                        className="mt-2 h-12 text-base"
                                        disabled={editingExam?.course_id !== 0}
                                    />
                                    {editingExam?.course_id !== 0 && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Tanggal dari sistem tidak dapat
                                            diubah
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label
                                        htmlFor="edit_time"
                                        className="text-base font-semibold"
                                    >
                                        Jam
                                    </Label>
                                    <Input
                                        id="edit_time"
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                time: e.target.value,
                                            })
                                        }
                                        className="mt-2 h-12 text-base"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Location & Notes - Always editable */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4 border-t pt-4"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Target className="h-5 w-5 text-purple-500" />
                                Detail Tambahan
                            </h3>
                            <div>
                                <Label
                                    htmlFor="edit_location"
                                    className="text-base font-semibold"
                                >
                                    Lokasi
                                </Label>
                                <Input
                                    id="edit_location"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Ruang 301, Gedung A"
                                    className="mt-2 h-12 text-base"
                                />
                            </div>

                            <div>
                                <Label
                                    htmlFor="edit_notes"
                                    className="text-base font-semibold"
                                >
                                    Catatan
                                </Label>
                                <textarea
                                    id="edit_notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Catatan tambahan tentang ujian..."
                                    className="mt-2 min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                                />
                            </div>
                        </motion.div>

                        {/* Info banner for backend exams */}
                        {editingExam?.course_id !== 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30"
                            >
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    ℹ️ Ujian ini dari sistem. Anda hanya bisa
                                    mengedit jam, lokasi, durasi, dan catatan.
                                </p>
                            </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-3 pt-4"
                        >
                            <Button
                                onClick={handleEditExam}
                                disabled={
                                    !formData.course_name || !formData.date
                                }
                                className="h-12 flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-base hover:from-blue-600 hover:to-indigo-700"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                Simpan Perubahan
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingExam(null);
                                    resetForm();
                                }}
                                className="h-12 px-6"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}

// Magnetic 3D Exam Card Component
interface MagneticExamCardProps {
    exam: Exam;
    index: number;
    checkedItems: Record<string, boolean>;
    preparationChecklist: ChecklistItem[];
    toggleCheck: (examId: number, itemId: number) => void;
    getCheckedCount: (examId: number) => number;
    isCompleted: boolean;
    toggleCompletion: (examId: number) => void;
    isCustom?: boolean;
    onEdit?: (exam: Exam) => void;
    onDelete?: (examId: number) => void;
}

function MagneticExamCard({
    exam,
    index,
    checkedItems,
    preparationChecklist,
    toggleCheck,
    getCheckedCount,
    isCompleted,
    toggleCompletion,
    isCustom,
    onEdit,
    onDelete,
}: MagneticExamCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative rounded-2xl border-2 bg-white/60 p-5 backdrop-blur-xl transition-all hover:shadow-lg dark:bg-neutral-900/60 ${
                isCompleted
                    ? 'border-emerald-200 dark:border-emerald-800'
                    : exam.is_critical
                      ? 'border-red-200 dark:border-red-800'
                      : exam.is_warning
                        ? 'border-amber-200 dark:border-amber-800'
                        : 'border-neutral-200 dark:border-neutral-700'
            }`}
        >
            {isCompleted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl bg-emerald-500/5"
                />
            )}

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : exam.type === 'UTS'
                                  ? 'bg-blue-100 dark:bg-blue-900/30'
                                  : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}
                    >
                        {isCompleted ? (
                            <CheckCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <Target
                                className={`h-6 w-6 ${exam.type === 'UTS' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}
                            />
                        )}
                    </motion.div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge
                                variant={
                                    exam.type === 'UTS'
                                        ? 'secondary'
                                        : 'default'
                                }
                                className="text-xs"
                            >
                                {exam.type}
                            </Badge>
                            {isCompleted && (
                                <Badge className="bg-emerald-500 text-xs hover:bg-emerald-600">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Selesai
                                </Badge>
                            )}
                            {exam.is_critical && !isCompleted && (
                                <Badge className="bg-red-500 text-xs hover:bg-red-600">
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    Segera
                                </Badge>
                            )}
                        </div>

                        <h3
                            className={`font-semibold break-words text-neutral-900 dark:text-white ${isCompleted ? 'line-through opacity-60' : ''}`}
                        >
                            {exam.course_name}
                        </h3>
                        <div className="mt-1 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{exam.date_formatted}</span>
                            </div>
                            {exam.time && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{exam.time}</span>
                                    {exam.duration && (
                                        <span className="text-xs">
                                            ({exam.duration} menit)
                                        </span>
                                    )}
                                </div>
                            )}
                            {exam.location && (
                                <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    <span>{exam.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex w-full items-center justify-between sm:block sm:w-auto sm:text-right">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`inline-flex flex-col items-center justify-center rounded-xl p-3 ${
                            isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : exam.is_critical
                                  ? 'bg-red-100 dark:bg-red-900/30'
                                  : exam.is_warning
                                    ? 'bg-amber-100 dark:bg-amber-900/30'
                                    : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}
                    >
                        <span
                            className={`text-2xl font-bold ${
                                isCompleted
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : exam.is_critical
                                      ? 'text-red-600 dark:text-red-400'
                                      : exam.is_warning
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-blue-600 dark:text-blue-400'
                            }`}
                        >
                            {isCompleted ? '✓' : exam.days_remaining}
                        </span>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {isCompleted ? 'Selesai' : 'hari lagi'}
                        </span>
                    </motion.div>

                    <div className="mt-0 flex items-center justify-end gap-2 sm:mt-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleCompletion(exam.id)}
                            className="text-xs text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        >
                            {isCompleted ? 'Batalkan' : 'Tandai Selesai'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEdit?.(exam)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900/70"
                            title="Edit ujian"
                        >
                            <Edit className="h-4 w-4" />
                        </motion.button>
                        {isCustom && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onDelete?.(exam.id)}
                                className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70"
                                title="Hapus ujian"
                            >
                                <Trash2 className="h-4 w-4" />
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 border-t border-white/20 pt-4 dark:border-white/5">
                {exam.notes && (
                    <div className="mb-4 rounded-xl border border-white/20 bg-neutral-100/70 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                        <p className="mb-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            Catatan:
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {exam.notes}
                        </p>
                    </div>
                )}
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Persiapan
                    </p>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {getCheckedCount(exam.id)}/{preparationChecklist.length}
                    </span>
                </div>
                <Progress
                    value={
                        (getCheckedCount(exam.id) /
                            preparationChecklist.length) *
                        100
                    }
                    className="mb-3 h-1.5"
                />
                <div className="space-y-2">
                    {preparationChecklist.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                            <Checkbox
                                id={`${exam.id}-${item.id}`}
                                checked={
                                    checkedItems[`${exam.id}-${item.id}`] ||
                                    false
                                }
                                onCheckedChange={() =>
                                    toggleCheck(exam.id, item.id)
                                }
                            />
                            <label
                                htmlFor={`${exam.id}-${item.id}`}
                                className={`cursor-pointer text-sm ${checkedItems[`${exam.id}-${item.id}`] ? 'text-neutral-500 line-through dark:text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}`}
                            >
                                {item.text}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
