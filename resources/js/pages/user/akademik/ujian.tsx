import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
    GraduationCap, ArrowLeft, Calendar, Clock, AlertTriangle, 
    CheckCircle2, BookOpen, Target, CheckCheck, Plus, Edit, Trash2, Save, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function AcademicExams({ upcomingExams, examsByMonth, courses, preparationChecklist }: Props) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [completedExams, setCompletedExams] = useState<Record<number, boolean>>({});
    const [customExams, setCustomExams] = useState<Exam[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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

    // Add custom exam
    const handleAddExam = () => {
        const newExam: Exam = {
            id: Date.now(),
            course_id: 0,
            course_name: formData.course_name,
            type: formData.type,
            date: formData.date,
            date_formatted: new Date(formData.date).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: formData.time,
            location: formData.location,
            duration: formData.duration,
            notes: formData.notes,
            days_remaining: Math.ceil((new Date(formData.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            meeting_number: 0,
            is_warning: false,
            is_critical: false,
        };
        setCustomExams(prev => [...prev, newExam]);
        setIsAddDialogOpen(false);
        resetForm();
    };

    // Edit exam
    const handleEditExam = () => {
        if (!editingExam) return;
        
        // Update custom exams
        if (editingExam.course_id === 0) {
            setCustomExams(prev => prev.map(exam => 
                exam.id === editingExam.id 
                    ? {
                        ...exam,
                        course_name: formData.course_name,
                        type: formData.type,
                        date: formData.date,
                        date_formatted: new Date(formData.date).toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        }),
                        time: formData.time,
                        location: formData.location,
                        duration: formData.duration,
                        notes: formData.notes,
                        days_remaining: Math.ceil((new Date(formData.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                    }
                    : exam
            ));
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
            setCustomExams(prev => {
                const existing = prev.find(e => e.id === editingExam.id);
                if (existing) {
                    return prev.map(e => e.id === editingExam.id ? updatedExam : e);
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
        setCustomExams(prev => prev.filter(exam => exam.id !== examId));
    };

    // Open edit dialog
    const openEditDialog = (exam: Exam) => {
        setEditingExam(exam);
        setFormData({
            course_name: exam.course_name,
            type: exam.type,
            date: exam.date,
            time: exam.time || '',
            location: exam.location || '',
            duration: exam.duration || 120,
            notes: exam.notes || '',
        });
        setIsEditDialogOpen(true);
    };

    // Merge backend exams with custom modifications
    const getMergedExam = (exam: Exam): Exam => {
        const customMod = customExams.find(e => e.id === exam.id && e.course_id !== 0);
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
        ...customExams.filter(e => e.course_id === 0)
    ].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate stats
    const stats = {
        total: allExams.length,
        critical: allExams.filter(e => e.is_critical).length,
        warning: allExams.filter(e => e.is_warning).length,
        uts: allExams.filter(e => e.type === 'UTS').length,
        uas: allExams.filter(e => e.type === 'UAS').length,
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
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    whileHover={{ scale: 1.15, y: -3 }}
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
                                                whileHover={{ scale: 1.2, y: -2 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                    {allExams.filter(e => e.is_critical || e.is_warning).map((exam, index) => (
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
                                            isCustom={exam.course_id === 0}
                                            onEdit={openEditDialog}
                                            onDelete={handleDeleteExam}
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
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                                                whileHover={{ scale: 1.15, y: -2 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                                            <div className="flex gap-2">
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
                                                                {/* Edit button */}
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => openEditDialog(getMergedExam(exam))}
                                                                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                                                                >
                                                                    <Edit className="h-5 w-5" />
                                                                </motion.button>
                                                            </div>
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
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                setIsProgressDetailOpen(true);
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
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
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

            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAddDialogOpen(true)}
                className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-red-500/50 transition-all"
            >
                <Plus className="h-6 w-6" />
            </motion.button>

            {/* Add Exam Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                <Label htmlFor="course_name" className="text-base font-semibold">
                                    Nama Mata Kuliah
                                </Label>
                                <Input
                                    id="course_name"
                                    value={formData.course_name}
                                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
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
                                    <Label htmlFor="type" className="text-base font-semibold">
                                        Jenis Ujian
                                    </Label>
                                    <Select value={formData.type} onValueChange={(value: 'UTS' | 'UAS') => setFormData({ ...formData, type: value })}>
                                        <SelectTrigger className="mt-2 h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTS">UTS (Ujian Tengah Semester)</SelectItem>
                                            <SelectItem value="UAS">UAS (Ujian Akhir Semester)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="duration" className="text-base font-semibold">
                                        Durasi (menit)
                                    </Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
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
                            className="space-y-4 pt-4 border-t"
                        >
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Jadwal Ujian
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="date" className="text-base font-semibold">
                                        Tanggal
                                    </Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="time" className="text-base font-semibold">
                                        Jam
                                    </Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                            className="space-y-4 pt-4 border-t"
                        >
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-purple-500" />
                                Detail Tambahan
                            </h3>
                            <div>
                                <Label htmlFor="location" className="text-base font-semibold">
                                    Lokasi
                                </Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Contoh: Ruang 301, Gedung A"
                                    className="mt-2 h-12 text-base"
                                />
                            </div>
                            <div>
                                <Label htmlFor="notes" className="text-base font-semibold">
                                    Catatan
                                </Label>
                                <textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Catatan tambahan tentang ujian..."
                                    className="mt-2 w-full min-h-[100px] px-3 py-2 text-base rounded-md border border-input bg-background"
                                />
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-3 pt-4"
                        >
                            <Button
                                onClick={handleAddExam}
                                disabled={!formData.course_name || !formData.date}
                                className="flex-1 h-12 text-base bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                            >
                                <Save className="h-5 w-5 mr-2" />
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
            <Dialog open={isProgressDetailOpen} onOpenChange={setIsProgressDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                        <h3 className="text-xl font-bold">{selectedCourse.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedCourse.sks} SKS • {selectedCourse.current_meeting} dari {selectedCourse.total_meetings} pertemuan
                                        </p>
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="text-center"
                                    >
                                        <div className="text-4xl font-bold text-emerald-600">
                                            {Math.round((selectedCourse.current_meeting / selectedCourse.total_meetings) * 100)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">Progress</p>
                                    </motion.div>
                                </div>

                                {/* Progress Bar with Details */}
                                <div className="relative pt-2">
                                    <Progress 
                                        value={(selectedCourse.current_meeting / selectedCourse.total_meetings) * 100} 
                                        className="h-6" 
                                    />
                                    {/* UTS Marker */}
                                    <div
                                        className="absolute top-2 h-6 w-1 bg-amber-500 rounded"
                                        style={{ left: `${(selectedCourse.uts_meeting / selectedCourse.total_meetings) * 100}%` }}
                                    />
                                    {/* UAS Marker */}
                                    <div
                                        className="absolute top-2 h-6 w-1 bg-red-500 rounded"
                                        style={{ left: `${(selectedCourse.uas_meeting / selectedCourse.total_meetings) * 100}%` }}
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
                                    className={`p-4 rounded-xl border-2 ${
                                        selectedCourse.uts_passed
                                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                                            : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                            <Target className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">UTS</h4>
                                            <p className="text-xs text-muted-foreground">Ujian Tengah Semester</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Pertemuan:</span>
                                            <span className="font-medium">P{selectedCourse.uts_meeting}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Status:</span>
                                            {selectedCourse.uts_passed ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                                </Badge>
                                            ) : selectedCourse.current_meeting >= selectedCourse.uts_meeting ? (
                                                <Badge variant="destructive">
                                                    <AlertTriangle className="h-3 w-3 mr-1" /> Terlewat
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Clock className="h-3 w-3 mr-1" /> Menunggu
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Sisa Pertemuan:</span>
                                            <span className="font-medium">
                                                {Math.max(0, selectedCourse.uts_meeting - selectedCourse.current_meeting)} pertemuan
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* UAS Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={`p-4 rounded-xl border-2 ${
                                        selectedCourse.uas_passed
                                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                                            : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                            <GraduationCap className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">UAS</h4>
                                            <p className="text-xs text-muted-foreground">Ujian Akhir Semester</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Pertemuan:</span>
                                            <span className="font-medium">P{selectedCourse.uas_meeting}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Status:</span>
                                            {selectedCourse.uas_passed ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                                </Badge>
                                            ) : selectedCourse.current_meeting >= selectedCourse.uas_meeting ? (
                                                <Badge variant="destructive">
                                                    <AlertTriangle className="h-3 w-3 mr-1" /> Terlewat
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Clock className="h-3 w-3 mr-1" /> Menunggu
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Sisa Pertemuan:</span>
                                            <span className="font-medium">
                                                {Math.max(0, selectedCourse.uas_meeting - selectedCourse.current_meeting)} pertemuan
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Meeting Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-3"
                            >
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Timeline Pertemuan
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {Array.from({ length: selectedCourse.total_meetings }, (_, i) => i + 1).map((meeting) => (
                                        <motion.div
                                            key={meeting}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + meeting * 0.02 }}
                                            className={`flex items-center gap-3 p-2 rounded-lg ${
                                                meeting <= selectedCourse.current_meeting
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/30'
                                                    : 'bg-gray-50 dark:bg-gray-900/30'
                                            }`}
                                        >
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                                                meeting <= selectedCourse.current_meeting
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {meeting}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Pertemuan {meeting}</p>
                                                {meeting === selectedCourse.uts_meeting && (
                                                    <Badge variant="secondary" className="text-xs mt-1">
                                                        <Target className="h-3 w-3 mr-1" /> UTS
                                                    </Badge>
                                                )}
                                                {meeting === selectedCourse.uas_meeting && (
                                                    <Badge variant="default" className="text-xs mt-1">
                                                        <GraduationCap className="h-3 w-3 mr-1" /> UAS
                                                    </Badge>
                                                )}
                                            </div>
                                            {meeting <= selectedCourse.current_meeting && (
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
                                transition={{ delay: 0.5 }}
                            >
                                <Button
                                    onClick={() => setIsProgressDetailOpen(false)}
                                    className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                <Label htmlFor="edit_course_name" className="text-base font-semibold">
                                    Nama Mata Kuliah
                                </Label>
                                <Input
                                    id="edit_course_name"
                                    value={formData.course_name}
                                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                    className="mt-2 h-12 text-base"
                                    disabled={editingExam?.course_id !== 0}
                                />
                                {editingExam?.course_id !== 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Nama mata kuliah dari sistem tidak dapat diubah
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
                                    <Label htmlFor="edit_type" className="text-base font-semibold">
                                        Jenis Ujian
                                    </Label>
                                    <Select 
                                        value={formData.type} 
                                        onValueChange={(value: 'UTS' | 'UAS') => setFormData({ ...formData, type: value })}
                                        disabled={editingExam?.course_id !== 0}
                                    >
                                        <SelectTrigger className="mt-2 h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTS">UTS</SelectItem>
                                            <SelectItem value="UAS">UAS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editingExam?.course_id !== 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Tidak dapat diubah
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="edit_duration" className="text-base font-semibold">
                                        Durasi (menit)
                                    </Label>
                                    <Input
                                        id="edit_duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
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
                            className="space-y-4 pt-4 border-t"
                        >
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Jadwal Ujian
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit_date" className="text-base font-semibold">
                                        Tanggal
                                    </Label>
                                    <Input
                                        id="edit_date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        disabled={editingExam?.course_id !== 0}
                                    />
                                    {editingExam?.course_id !== 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Tanggal dari sistem tidak dapat diubah
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="edit_time" className="text-base font-semibold">
                                        Jam
                                    </Label>
                                    <Input
                                        id="edit_time"
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                            className="space-y-4 pt-4 border-t"
                        >
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-purple-500" />
                                Detail Tambahan
                            </h3>
                            <div>
                                <Label htmlFor="edit_location" className="text-base font-semibold">
                                    Lokasi
                                </Label>
                                <Input
                                    id="edit_location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Contoh: Ruang 301, Gedung A"
                                    className="mt-2 h-12 text-base"
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit_notes" className="text-base font-semibold">
                                    Catatan
                                </Label>
                                <textarea
                                    id="edit_notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Catatan tambahan tentang ujian..."
                                    className="mt-2 w-full min-h-[100px] px-3 py-2 text-base rounded-md border border-input bg-background"
                                />
                            </div>
                        </motion.div>

                        {/* Info banner for backend exams */}
                        {editingExam?.course_id !== 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    ℹ️ Ujian ini dari sistem. Anda hanya bisa mengedit jam, lokasi, durasi, dan catatan.
                                </p>
                            </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-3 pt-4"
                        >
                            <Button
                                onClick={handleEditExam}
                                disabled={!formData.course_name || !formData.date}
                                className="flex-1 h-12 text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            >
                                <Save className="h-5 w-5 mr-2" />
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

function MagneticExamCard({ exam, index, checkedItems, preparationChecklist, toggleCheck, getCheckedCount, isCompleted, toggleCompletion, isCustom, onEdit, onDelete }: MagneticExamCardProps) {
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
                                <div className="space-y-1 mt-1">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{exam.date_formatted}</span>
                                    </div>
                                    {exam.time && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-1 text-sm text-muted-foreground"
                                        >
                                            <Clock className="h-4 w-4" />
                                            <span>{exam.time}</span>
                                            {exam.duration && <span className="text-xs">({exam.duration} menit)</span>}
                                        </motion.div>
                                    )}
                                    {exam.location && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="flex items-center gap-1 text-sm text-muted-foreground"
                                        >
                                            <Target className="h-4 w-4" />
                                            <span>{exam.location}</span>
                                        </motion.div>
                                    )}
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
                                <div className="flex gap-2">
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
                                    {/* Edit button for all exams */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onEdit?.(exam)}
                                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                                        title="Edit ujian"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </motion.button>
                                    {/* Delete only for custom exams */}
                                    {isCustom && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onDelete?.(exam.id)}
                                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                                            title="Hapus ujian"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preparation Checklist */}
                        <div className="mt-4 pt-4 border-t border-dashed">
                            {exam.notes && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
                                >
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Catatan:</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">{exam.notes}</p>
                                </motion.div>
                            )}
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
