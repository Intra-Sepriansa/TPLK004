import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
    GraduationCap, ArrowLeft, Calendar, Clock, AlertTriangle, 
    CheckCircle2, BookOpen, Target, CheckCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

interface Exam {
    id: number;
    course_id: number;
    course_name: string;
    type: 'UTS' | 'UAS';
    date: string;
    date_formatted: string;
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

export default function AcademicExams({ upcomingExams, examsByMonth, courses, preparationChecklist }: Props) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [completedExams, setCompletedExams] = useState<Record<number, boolean>>({});

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
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

    // Mouse tracking for parallax
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
    };

    // Toggle exam completion
    const toggleExamCompletion = (examId: number) => {
        setCompletedExams(prev => ({ ...prev, [examId]: !prev[examId] }));
    };

    // Calculate stats
    const stats = {
        total: upcomingExams.length,
        critical: upcomingExams.filter(e => e.is_critical).length,
        warning: upcomingExams.filter(e => e.is_warning).length,
        uts: upcomingExams.filter(e => e.type === 'UTS').length,
        uas: upcomingExams.filter(e => e.type === 'UAS').length,
        completed: Object.values(completedExams).filter(Boolean).length,
    };

    const toggleCheck = (examId: number, itemId: number) => {
        const key = `${examId}-${itemId}`;
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getCheckedCount = (examId: number) => {
        return preparationChecklist.filter(item => checkedItems[`${examId}-${item.id}`]).length;
    };

    return (
        <StudentLayout>
            <Head title="Kalender Ujian" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col gap-6 p-4 md:p-6"
            >
                {/* Advanced Header with Particles */}
                <motion.div
                    variants={itemVariants}
                    onMouseMove={handleMouseMove}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.4, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl"
                        />
                        
                        {/* Floating Graduation Cap Icons */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    y: [0, -40, -80],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            >
                                <GraduationCap className="h-4 w-4 text-white/40" />
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/user/akademik">
                                    <motion.div
                                        whileHover={{ scale: 1.1, x: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </motion.div>
                                </Link>
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30"
                                >
                                    <GraduationCap className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-white/90 font-medium"
                                    >
                                        Manajemen Ujian
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Kalender Ujian
                                    </motion.h1>
                                </div>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-white/90 text-lg"
                        >
                            Countdown UTS & UAS
                        </motion.p>
                        
                        {/* Quick Stats with Dock-Style Animations */}
                        {upcomingExams.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4"
                            >
                                {[
                                    { icon: Calendar, label: 'Total Ujian', value: stats.total, color: 'white' },
                                    { icon: CheckCheck, label: 'Selesai', value: stats.completed, color: 'emerald' },
                                    { icon: AlertTriangle, label: 'Segera', value: stats.critical, color: 'red' },
                                    { icon: Target, label: 'UTS', value: stats.uts, color: 'amber' },
                                    { icon: GraduationCap, label: 'UAS', value: stats.uas, color: 'rose' },
                                ].map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 200 }}
                                        whileHover={{ 
                                            scale: 1.05, 
                                            y: -5,
                                            boxShadow: "0 10px 30px rgba(255,255,255,0.2)"
                                        }}
                                        className="bg-white/10 backdrop-blur rounded-xl p-4 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <motion.div
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                            >
                                                <stat.icon className="h-5 w-5 text-white/80" />
                                            </motion.div>
                                            <p className="text-white/80 text-xs font-medium">{stat.label}</p>
                                        </div>
                                        <p className="text-3xl font-bold">
                                            <AnimatedCounter value={stat.value} duration={1500} />
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Upcoming Exams */}
                {upcomingExams.length > 0 ? (
                    <>
                        {/* Critical/Warning Exams */}
                        {upcomingExams.filter(e => e.is_critical || e.is_warning).length > 0 && (
                            <motion.div variants={itemVariants} className="space-y-3">
                                <motion.h2 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-semibold flex items-center gap-2"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    </motion.div>
                                    Perlu Perhatian
                                </motion.h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {upcomingExams.filter(e => e.is_critical || e.is_warning).map((exam, index) => (
                                        <MagneticExamCard 
                                            key={exam.id}
                                            exam={exam}
                                            index={index}
                                            checkedItems={checkedItems}
                                            preparationChecklist={preparationChecklist}
                                            toggleCheck={toggleCheck}
                                            getCheckedCount={getCheckedCount}
                                            isCompleted={completedExams[exam.id] || false}
                                            toggleCompletion={toggleExamCompletion}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* All Exams by Month */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            <motion.h2 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-semibold flex items-center gap-2"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.2, rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                </motion.div>
                                Jadwal Ujian
                            </motion.h2>
                            {examsByMonth.map((monthData, monthIndex) => (
                                <motion.div
                                    key={monthData.month}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: monthIndex * 0.1 }}
                                >
                                    <Card className="overflow-hidden">
                                        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                                            <CardTitle className="text-base">{monthData.month}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="space-y-3">
                                                {monthData.exams.map((exam, examIndex) => (
                                                    <motion.div
                                                        key={exam.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: examIndex * 0.05 }}
                                                        whileHover={{ 
                                                            scale: 1.02,
                                                            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                                                        }}
                                                        className={`relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                                            completedExams[exam.id]
                                                                ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20'
                                                                : exam.is_critical 
                                                                    ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' 
                                                                    : exam.is_warning 
                                                                        ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
                                                                        : 'hover:border-blue-300 dark:hover:border-blue-700'
                                                        }`}
                                                    >
                                                        {/* Completion Overlay */}
                                                        {completedExams[exam.id] && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="absolute inset-0 bg-emerald-500/5 rounded-lg"
                                                            />
                                                        )}
                                                        
                                                        <div className="flex items-center gap-3 relative z-10">
                                                            <motion.div 
                                                                whileHover={{ rotate: 360, scale: 1.1 }}
                                                                transition={{ duration: 0.5 }}
                                                                className={`p-2 rounded-lg ${
                                                                    completedExams[exam.id]
                                                                        ? 'bg-emerald-100 dark:bg-emerald-900/50'
                                                                        : exam.type === 'UTS' 
                                                                            ? 'bg-blue-100 dark:bg-blue-900/50' 
                                                                            : 'bg-purple-100 dark:bg-purple-900/50'
                                                                }`}
                                                            >
                                                                {completedExams[exam.id] ? (
                                                                    <CheckCheck className="h-5 w-5 text-emerald-600" />
                                                                ) : (
                                                                    <Target className={`h-5 w-5 ${exam.type === 'UTS' ? 'text-blue-600' : 'text-purple-600'}`} />
                                                                )}
                                                            </motion.div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant={exam.type === 'UTS' ? 'secondary' : 'default'} className="text-xs">
                                                                        {exam.type}
                                                                    </Badge>
                                                                    {completedExams[exam.id] && (
                                                                        <motion.div
                                                                            initial={{ scale: 0, rotate: -180 }}
                                                                            animate={{ scale: 1, rotate: 0 }}
                                                                            transition={{ type: "spring", stiffness: 200 }}
                                                                        >
                                                                            <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600">
                                                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                                                            </Badge>
                                                                        </motion.div>
                                                                    )}
                                                                    <span className={`font-medium ${completedExams[exam.id] ? 'line-through text-muted-foreground' : ''}`}>
                                                                        {exam.course_name}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {exam.date_formatted}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 relative z-10">
                                                            <motion.div 
                                                                whileHover={{ scale: 1.1 }}
                                                                className={`text-right ${
                                                                    completedExams[exam.id]
                                                                        ? 'text-emerald-600'
                                                                        : exam.is_critical 
                                                                            ? 'text-red-600' 
                                                                            : exam.is_warning 
                                                                                ? 'text-amber-600' 
                                                                                : 'text-blue-600'
                                                                }`}
                                                            >
                                                                <p className="text-xl font-bold">
                                                                    <AnimatedCounter value={exam.days_remaining} duration={1000} />
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">hari</p>
                                                            </motion.div>
                                                            {/* Toggle Completion Button */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => toggleExamCompletion(exam.id)}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                    completedExams[exam.id]
                                                                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                                                }`}
                                                            >
                                                                <CheckCircle2 className="h-5 w-5" />
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                ) : (
                    <motion.div variants={itemVariants}>
                        <Card className="overflow-hidden">
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
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
                                        className="text-sm text-muted-foreground mt-1"
                                    >
                                        Tambahkan mata kuliah untuk melihat jadwal ujian
                                    </motion.p>
                                    <Link href="/user/akademik/matkul">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
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
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.2 }}
                                        transition={{ duration: 0.6 }}
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
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ 
                                                scale: 1.02,
                                                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.1)"
                                            }}
                                            className="p-3 rounded-lg border hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{course.name}</span>
                                                <Badge variant="outline">{course.sks} SKS</Badge>
                                            </div>
                                            <div className="relative">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(course.current_meeting / course.total_meetings) * 100}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                >
                                                    <Progress 
                                                        value={(course.current_meeting / course.total_meetings) * 100} 
                                                        className="h-3" 
                                                    />
                                                </motion.div>
                                                {/* UTS Marker */}
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5 + index * 0.1 }}
                                                    className="absolute top-0 h-3 w-0.5 bg-amber-500"
                                                    style={{ left: `${(course.uts_meeting / course.total_meetings) * 100}%` }}
                                                />
                                                {/* UAS Marker */}
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.6 + index * 0.1 }}
                                                    className="absolute top-0 h-3 w-0.5 bg-red-500"
                                                    style={{ left: `${(course.uas_meeting / course.total_meetings) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                                <span>P{course.current_meeting}/{course.total_meetings}</span>
                                                <div className="flex items-center gap-4">
                                                    <motion.span 
                                                        whileHover={{ scale: 1.1 }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                        UTS (P{course.uts_meeting})
                                                        {course.uts_passed && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                transition={{ type: "spring", stiffness: 200 }}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                            </motion.div>
                                                        )}
                                                    </motion.span>
                                                    <motion.span 
                                                        whileHover={{ scale: 1.1 }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                                        UAS (P{course.uas_meeting})
                                                        {course.uas_passed && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                transition={{ type: "spring", stiffness: 200 }}
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
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 overflow-hidden relative">
                        {/* Animated Background */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 180],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-200/30 dark:bg-blue-800/20 blur-3xl"
                        />
                        <CardContent className="p-4 relative z-10">
                            <div className="flex items-start gap-3">
                                <motion.div 
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                    className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg"
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
                                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                        {preparationChecklist.map((item, index) => (
                                            <motion.li
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ x: 5 }}
                                                className="flex items-center gap-2"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                                                >
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                </motion.div>
                                                {item.text}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
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
}

function MagneticExamCard({ exam, index, checkedItems, preparationChecklist, toggleCheck, getCheckedCount, isCompleted, toggleCompletion }: MagneticExamCardProps) {
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateXValue = ((y - centerY) / centerY) * -10;
        const rotateYValue = ((x - centerX) / centerX) * 10;
        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
        >
            <motion.div
                animate={{
                    rotateX,
                    rotateY,
                }}
                transition={{
                    type: 'spring' as const,
                    stiffness: 300,
                    damping: 20,
                }}
                style={{
                    transformStyle: 'preserve-3d',
                }}
            >
                <Card 
                    className={`overflow-hidden relative ${
                        isCompleted
                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40'
                            : exam.is_critical 
                                ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/40' 
                                : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40'
                    }`}
                >
                    {/* Glow Effect */}
                    <motion.div
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`absolute inset-0 ${
                            isCompleted
                                ? 'bg-emerald-500/10'
                                : exam.is_critical 
                                    ? 'bg-red-500/10' 
                                    : 'bg-amber-500/10'
                        } blur-xl`}
                    />
                    
                    <div className={`h-1 ${
                        isCompleted
                            ? 'bg-emerald-500'
                            : exam.is_critical 
                                ? 'bg-red-500' 
                                : 'bg-amber-500'
                    }`} />
                    <CardContent className="p-4 relative z-10">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge variant={exam.type === 'UTS' ? 'secondary' : 'default'}>
                                        {exam.type}
                                    </Badge>
                                    {isCompleted && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                            </Badge>
                                        </motion.div>
                                    )}
                                    {!isCompleted && exam.is_critical && (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            <Badge variant="destructive" className="text-xs">
                                                <AlertTriangle className="h-3 w-3 mr-1" /> Segera!
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>
                                <h3 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                    {exam.course_name}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{exam.date_formatted}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <motion.div 
                                    whileHover={{ scale: 1.1 }}
                                    className={`text-right ${
                                        isCompleted
                                            ? 'text-emerald-600'
                                            : exam.is_critical 
                                                ? 'text-red-600' 
                                                : 'text-amber-600'
                                    }`}
                                >
                                    <p className="text-3xl font-bold">
                                        <AnimatedCounter value={exam.days_remaining} duration={1000} />
                                    </p>
                                    <p className="text-xs">hari lagi</p>
                                </motion.div>
                                {/* Toggle Completion Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleCompletion(exam.id)}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isCompleted
                                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                    }`}
                                    title={isCompleted ? 'Tandai belum selesai' : 'Tandai sudah selesai'}
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Preparation Checklist */}
                        <div className="mt-4 pt-4 border-t border-dashed">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">Persiapan</p>
                                <span className="text-xs text-muted-foreground">
                                    {getCheckedCount(exam.id)}/{preparationChecklist.length}
                                </span>
                            </div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                            >
                                <Progress 
                                    value={(getCheckedCount(exam.id) / preparationChecklist.length) * 100} 
                                    className="h-1.5 mb-3" 
                                />
                            </motion.div>
                            <div className="space-y-2">
                                {preparationChecklist.slice(0, 3).map((item, itemIndex) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: itemIndex * 0.1 }}
                                        whileHover={{ x: 5 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            id={`${exam.id}-${item.id}`}
                                            checked={checkedItems[`${exam.id}-${item.id}`] || false}
                                            onCheckedChange={() => toggleCheck(exam.id, item.id)}
                                        />
                                        <label 
                                            htmlFor={`${exam.id}-${item.id}`}
                                            className={`text-sm cursor-pointer ${checkedItems[`${exam.id}-${item.id}`] ? 'line-through text-muted-foreground' : ''}`}
                                        >
                                            {item.text}
                                        </label>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
