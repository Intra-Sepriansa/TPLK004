import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    ListTodo, Plus, ArrowLeft, Clock, CheckCircle2, AlertTriangle, 
    Calendar, Trash2, Filter, BookOpen, CheckCircle, XCircle, Target, Flag,
    LayoutList, CalendarDays, Columns3, Paperclip, Tag, X, Search, 
    ArrowUpDown, Eye, Copy, Star, TrendingUp, BarChart3, ArrowRight, FileText,
    User, Award, Download
} from 'lucide-react';
import { useState, FormEvent, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

interface Task {
    id: number;
    title: string;
    description: string | null;
    course_id: number;
    course_name: string;
    meeting_number: number | null;
    deadline: string | null;
    deadline_formatted: string | null;
    days_remaining: number | null;
    status: 'pending' | 'in_progress' | 'completed';
    priority?: 'high' | 'medium' | 'low';
    is_overdue: boolean;
    completed_at: string | null;
    created_at: string;
    tags?: string[];
    attachments?: { name: string; url: string; size: number }[];
}

interface Course {
    id: number;
    name: string;
    total_meetings: number;
}

interface Props {
    tasks: Task[];
    courses: Course[];
    stats: {
        total: number;
        completed: number;
        pending: number;
        overdue: number;
    };
    filters: {
        status: string;
        course_id: string;
    };
}

// Animation variants - matching dashboard
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.05,
            when: "beforeChildren" as const,
        },
    },
};

const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: 30, 
        scale: 0.92,
        rotateX: -8,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
            mass: 0.8,
        },
    },
};

const cardHoverVariants = {
    rest: { 
        scale: 1, 
        y: 0,
        rotateY: 0,
        rotateX: 0,
    },
    hover: {
        scale: 1.03,
        y: -8,
        rotateY: 3,
        rotateX: 2,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 20,
        },
    },
    tap: {
        scale: 0.97,
        transition: {
            type: 'spring' as const,
            stiffness: 500,
            damping: 30,
        },
    },
};

export default function AcademicTasks({ tasks, courses, stats, filters }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;
    
    const [showForm, setShowForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('deadline');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [formStep, setFormStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);

    // Show flash message as toast
    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success, flash?.error]);

    const { data, setData, post, processing, errors, reset } = useForm({
        mahasiswa_course_id: '',
        meeting_number: '',
        title: '',
        description: '',
        deadline: '',
        priority: 'medium' as 'high' | 'medium' | 'low',
        tags: [] as string[],
        attachments: [] as File[],
    });

    const addTag = () => {
        if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
            setData('tags', [...data.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setData('tags', data.tags.filter(t => t !== tag));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('attachments', Array.from(e.target.files));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/akademik/tugas', {
            onSuccess: () => {
                reset();
                setShowForm(false);
                setSelectedCourse(null);
                setFormStep(1);
            },
            onError: () => {
                setToast({ type: 'error', message: 'Gagal menambahkan tugas' });
                setTimeout(() => setToast(null), 3000);
            },
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('attachments', Array.from(e.dataTransfer.files));
        }
    };

    const nextStep = () => {
        if (formStep < 3) setFormStep(formStep + 1);
    };

    const prevStep = () => {
        if (formStep > 1) setFormStep(formStep - 1);
    };

    const handleToggle = (id: number) => {
        router.post(`/user/akademik/tugas/${id}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/akademik/tugas/${deleteDialog.id}`, {
                preserveScroll: true,
            });
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/user/akademik/tugas', { 
            ...filters, 
            [key]: value === 'all' ? '' : value 
        }, { preserveState: true });
    };

    const handleCourseSelect = (courseId: string) => {
        setData('mahasiswa_course_id', courseId);
        const course = courses.find(c => c.id === parseInt(courseId));
        setSelectedCourse(course || null);
    };

    // Filter and Sort Tasks
    const filteredAndSortedTasks = useMemo(() => {
        let filtered = [...tasks];
        
        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.course_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Tags filter
        if (selectedTags.length > 0) {
            filtered = filtered.filter(task => 
                task.tags?.some(tag => selectedTags.includes(tag))
            );
        }
        
        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'deadline') {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            } else if (sortBy === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return (priorityOrder[a.priority || 'low'] || 2) - (priorityOrder[b.priority || 'low'] || 2);
            } else {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });
        
        return filtered;
    }, [tasks, searchQuery, selectedTags, sortBy]);

    // Get all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        tasks.forEach(task => {
            task.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    }, [tasks]);

    const handleDuplicateTask = (task: Task) => {
        setData({
            mahasiswa_course_id: String(task.course_id),
            meeting_number: task.meeting_number ? String(task.meeting_number) : '',
            title: `${task.title} (Copy)`,
            description: task.description || '',
            deadline: task.deadline || '',
            priority: task.priority || 'medium',
            tags: task.tags || [],
            attachments: [],
        });
        setShowForm(true);
    };

    const handleViewTask = (task: Task) => {
        setSelectedTask(task);
        setShowTaskDetail(true);
    };

    // Ultra Modern Task Card Component - Redesigned V2
    const TaskCard = ({ task, onToggle, onDelete }: { task: Task; onToggle: (id: number) => void; onDelete: (id: number) => void }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="group relative"
        >
            {/* Main Card Container */}
            <div className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                task.status === 'completed' 
                    ? 'bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border-emerald-400/50 dark:from-emerald-500/20 dark:via-green-500/10 dark:to-teal-500/20 dark:border-emerald-500/50' 
                    : task.is_overdue 
                        ? 'bg-gradient-to-br from-rose-500/10 via-red-500/5 to-pink-500/10 border-rose-400/50 dark:from-rose-500/20 dark:via-red-500/10 dark:to-pink-500/20 dark:border-rose-500/50'
                        : 'bg-white/80 backdrop-blur-sm border-slate-200/70 dark:bg-gray-900/80 dark:border-gray-700/70 hover:border-blue-400/70 dark:hover:border-blue-500/70'
            }`}>
                {/* Animated Gradient Overlay */}
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: task.status === 'completed'
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)'
                            : task.is_overdue
                                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(244, 63, 94, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
                    }}
                />
                
                {/* Shimmer Effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '200%', opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                
                {/* Content */}
                <div className="relative z-10 p-6">
                    {/* Top Row: Checkbox, Title, Actions */}
                    <div className="flex items-start gap-4 mb-4">
                        {/* Checkbox */}
                        <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 500 }}
                            className="mt-0.5"
                        >
                            <Checkbox
                                checked={task.status === 'completed'}
                                onCheckedChange={() => onToggle(task.id)}
                                className="h-6 w-6 border-2 rounded-lg data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600"
                            />
                        </motion.div>
                        
                        {/* Title & Course */}
                        <div className="flex-1 min-w-0">
                            <motion.h3 
                                className={`font-bold text-xl mb-2 ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}
                                whileHover={{ x: 3 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {task.title}
                            </motion.h3>
                            
                            <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {task.course_name}
                                </div>
                                {task.meeting_number && (
                                    <div className="px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                                        P{task.meeting_number}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                    onClick={() => handleViewTask(task)}
                                >
                                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/50"
                                    onClick={() => handleDuplicateTask(task)}
                                >
                                    <Copy className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50"
                                    onClick={() => onDelete(task.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Description */}
                    {task.description && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed"
                        >
                            {task.description}
                        </motion.p>
                    )}
                    
                    {/* Bottom Row: Badges & Deadline */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Left: Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Priority Badge */}
                            {task.priority && (
                                <motion.div 
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    animate={task.priority === 'high' ? { scale: [1, 1.03, 1] } : {}}
                                    transition={task.priority === 'high' ? { duration: 2, repeat: Infinity } : {}}
                                >
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                        task.priority === 'high' 
                                            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30' 
                                            : task.priority === 'medium'
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                                                : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                    }`}>
                                        <Flag className="h-3 w-3" />
                                        {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                    </div>
                                </motion.div>
                            )}
                            
                            {/* Status Badge */}
                            {task.status === 'completed' ? (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                >
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Selesai
                                    </div>
                                </motion.div>
                            ) : task.is_overdue ? (
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    whileHover={{ scale: 1.08, y: -2 }}
                                >
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-500/30">
                                        <AlertTriangle className="h-3 w-3" />
                                        Terlambat
                                    </div>
                                </motion.div>
                            ) : null}
                            
                            {/* Tags */}
                            {task.tags && task.tags.slice(0, 2).map((tag, idx) => (
                                <motion.div 
                                    key={idx}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-semibold">
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </div>
                                </motion.div>
                            ))}
                            {task.tags && task.tags.length > 2 && (
                                <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold">
                                    +{task.tags.length - 2}
                                </div>
                            )}
                            
                            {/* Attachments */}
                            {task.attachments && task.attachments.length > 0 && (
                                <motion.div 
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                                >
                                    <Paperclip className="h-3 w-3" />
                                    {task.attachments.length}
                                </motion.div>
                            )}
                        </div>
                        
                        {/* Right: Deadline */}
                        {task.deadline_formatted && task.status !== 'completed' && (
                            <motion.div 
                                whileHover={{ scale: 1.03 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
                                    task.is_overdue 
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-700' 
                                        : task.days_remaining !== null && task.days_remaining <= 3 
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-700' 
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700'
                                }`}
                            >
                                <Calendar className="h-4 w-4" />
                                <div>
                                    <div>{task.deadline_formatted}</div>
                                    {task.days_remaining !== null && !task.is_overdue && (
                                        <div className="text-xs opacity-75">{task.days_remaining} hari lagi</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
                
                {/* Left Border Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    task.status === 'completed' 
                        ? 'bg-gradient-to-b from-emerald-500 to-teal-600' 
                        : task.is_overdue 
                            ? 'bg-gradient-to-b from-red-500 to-rose-600'
                            : task.priority === 'high'
                                ? 'bg-gradient-to-b from-red-500 to-rose-600'
                                : task.priority === 'medium'
                                    ? 'bg-gradient-to-b from-amber-500 to-orange-600'
                                    : 'bg-gradient-to-b from-blue-500 to-cyan-600'
                }`} />
            </div>
        </motion.div>
    );

    const EmptyState = ({ onAddTask }: { onAddTask: () => void }) => (
        <div className="text-center py-12">
            <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">Belum ada tugas</p>
            <Button variant="outline" className="mt-4" onClick={onAddTask}>
                <Plus className="h-4 w-4 mr-2" /> Tambah Tugas Pertama
            </Button>
        </div>
    );

    const CalendarView = ({ tasks }: { tasks: Task[] }) => {
        const [currentDate, setCurrentDate] = useState(new Date());
        const [selectedDate, setSelectedDate] = useState<Date | null>(null);
        const [hoveredDay, setHoveredDay] = useState<number | null>(null);
        const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
        
        const today = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
        
        const getTasksForDay = (day: number) => {
            return tasks.filter(task => {
                if (!task.deadline) return false;
                const taskDate = new Date(task.deadline);
                return taskDate.getDate() === day && 
                       taskDate.getMonth() === currentMonth && 
                       taskDate.getFullYear() === currentYear;
            });
        };
        
        const goToPreviousMonth = () => {
            setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
        };
        
        const goToNextMonth = () => {
            setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
        };
        
        const goToToday = () => {
            setCurrentDate(new Date());
        };
        
        const isToday = (day: number) => {
            return day === today.getDate() && 
                   currentMonth === today.getMonth() && 
                   currentYear === today.getFullYear();
        };
        
        const isPastDate = (day: number) => {
            const date = new Date(currentYear, currentMonth, day);
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return date < todayStart;
        };
        
        return (
            <div className="space-y-6">
                {/* Calendar Header with Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.h3 
                            key={`${currentMonth}-${currentYear}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl font-bold text-gray-900 dark:text-white"
                        >
                            {new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </motion.h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToToday}
                            className="text-xs"
                        >
                            Hari Ini
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Button
                                variant={calendarView === 'month' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setCalendarView('month')}
                                className="text-xs h-8"
                            >
                                <CalendarDays className="h-3 w-3 mr-1" />
                                Bulan
                            </Button>
                            <Button
                                variant={calendarView === 'week' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setCalendarView('week')}
                                className="text-xs h-8"
                            >
                                <LayoutList className="h-3 w-3 mr-1" />
                                Minggu
                            </Button>
                        </div>
                        
                        {/* Month Navigation */}
                        <div className="flex items-center gap-1">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToPreviousMonth}
                                    className="h-9 w-9"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToNextMonth}
                                    className="h-9 w-9"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
                
                {/* Calendar Grid */}
                <motion.div 
                    key={`${currentMonth}-${currentYear}-${calendarView}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg"
                >
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day, idx) => (
                            <div 
                                key={day} 
                                className={`text-center text-sm font-bold py-3 ${
                                    idx === 0 || idx === 6 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                        {emptyDays.map(i => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {days.map(day => {
                            const dayTasks = getTasksForDay(day);
                            const isTodayDate = isToday(day);
                            const isPast = isPastDate(day);
                            const hasHighPriority = dayTasks.some(t => t.priority === 'high');
                            const hasOverdue = dayTasks.some(t => t.is_overdue);
                            
                            return (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: day * 0.01 }}
                                    whileHover={{ scale: 1.05, zIndex: 10 }}
                                    onHoverStart={() => setHoveredDay(day)}
                                    onHoverEnd={() => setHoveredDay(null)}
                                    onClick={() => {
                                        if (dayTasks.length > 0) {
                                            setSelectedDate(new Date(currentYear, currentMonth, day));
                                        }
                                    }}
                                    className={`relative aspect-square border-2 rounded-xl p-2 transition-all cursor-pointer ${
                                        isTodayDate 
                                            ? 'bg-gradient-to-br from-blue-500 to-cyan-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                            : isPast
                                                ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60'
                                                : hasOverdue
                                                    ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900 hover:border-red-500'
                                                    : hasHighPriority
                                                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900 hover:border-amber-500'
                                                        : dayTasks.length > 0
                                                            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 hover:border-blue-500'
                                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-400'
                                    }`}
                                >
                                    {/* Day Number */}
                                    <div className={`text-sm font-bold mb-1 ${
                                        isTodayDate 
                                            ? 'text-white' 
                                            : isPast
                                                ? 'text-gray-400 dark:text-gray-600'
                                                : 'text-gray-900 dark:text-white'
                                    }`}>
                                        {day}
                                    </div>
                                    
                                    {/* Task Indicators */}
                                    {dayTasks.length > 0 && (
                                        <div className="space-y-1">
                                            {/* Task Dots */}
                                            <div className="flex flex-wrap gap-1">
                                                {dayTasks.slice(0, 3).map((task, idx) => (
                                                    <motion.div
                                                        key={task.id}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            task.status === 'completed'
                                                                ? 'bg-emerald-500'
                                                                : task.is_overdue
                                                                    ? 'bg-red-500 animate-pulse'
                                                                    : task.priority === 'high'
                                                                        ? 'bg-red-500'
                                                                        : task.priority === 'medium'
                                                                            ? 'bg-amber-500'
                                                                            : 'bg-blue-500'
                                                        }`}
                                                        title={task.title}
                                                    />
                                                ))}
                                                {dayTasks.length > 3 && (
                                                    <span className={`text-[10px] font-semibold ${
                                                        isTodayDate ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                        +{dayTasks.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Task Count Badge */}
                                            <div className={`text-[10px] font-bold ${
                                                isTodayDate 
                                                    ? 'text-white/90' 
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {dayTasks.length} tugas
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Hover Preview */}
                                    <AnimatePresence>
                                        {hoveredDay === day && dayTasks.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute left-0 top-full mt-2 z-50 w-64 p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {day} {new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long' })}
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {dayTasks.length} tugas
                                                        </Badge>
                                                    </div>
                                                    {dayTasks.slice(0, 3).map(task => (
                                                        <div
                                                            key={task.id}
                                                            className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                                        >
                                                            <div className={`h-2 w-2 rounded-full mt-1 flex-shrink-0 ${
                                                                task.status === 'completed'
                                                                    ? 'bg-emerald-500'
                                                                    : task.is_overdue
                                                                        ? 'bg-red-500'
                                                                        : task.priority === 'high'
                                                                            ? 'bg-red-500'
                                                                            : task.priority === 'medium'
                                                                                ? 'bg-amber-500'
                                                                                : 'bg-blue-500'
                                                            }`} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                                    {task.title}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                                    {task.course_name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {dayTasks.length > 3 && (
                                                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
                                                            +{dayTasks.length - 3} tugas lainnya
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {/* Today Indicator */}
                                    {isTodayDate && (
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full shadow-lg"
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
                
                {/* Legend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-4 text-xs"
                >
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-600 dark:text-gray-400">Selesai</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-gray-600 dark:text-gray-400">Prioritas Tinggi / Terlambat</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-gray-600 dark:text-gray-400">Prioritas Sedang</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">Prioritas Rendah</span>
                    </div>
                </motion.div>
                
                {/* Selected Date Tasks Modal */}
                <AnimatePresence>
                    {selectedDate && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedDate(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {selectedDate.toLocaleDateString('id-ID', { 
                                                weekday: 'long', 
                                                day: 'numeric', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {getTasksForDay(selectedDate.getDate()).length} tugas pada tanggal ini
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedDate(null)}
                                        className="rounded-full"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                
                                <div className="space-y-3">
                                    {getTasksForDay(selectedDate.getDate()).map((task, idx) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => handleViewTask(task)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={task.status === 'completed'}
                                                    onCheckedChange={() => handleToggle(task.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-semibold text-gray-900 dark:text-white mb-1 ${
                                                        task.status === 'completed' ? 'line-through opacity-60' : ''
                                                    }`}>
                                                        {task.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="text-xs">
                                                            <BookOpen className="h-3 w-3 mr-1" />
                                                            {task.course_name}
                                                        </Badge>
                                                        {task.priority && (
                                                            <Badge className={`text-xs ${
                                                                task.priority === 'high' 
                                                                    ? 'bg-red-500' 
                                                                    : task.priority === 'medium'
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-blue-500'
                                                            }`}>
                                                                <Flag className="h-3 w-3 mr-1" />
                                                                {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                                            </Badge>
                                                        )}
                                                        {task.is_overdue && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                Terlambat
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const KanbanBoard = ({ tasks, onToggle, onDelete }: { tasks: Task[]; onToggle: (id: number) => void; onDelete: (id: number) => void }) => {
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
        const completedTasks = tasks.filter(t => t.status === 'completed');
        
        const KanbanColumn = ({ title, tasks, color }: { title: string; tasks: Task[]; color: string }) => (
            <div className="flex-1 min-w-[280px]">
                <div className={`p-3 rounded-t-lg ${color}`}>
                    <h3 className="font-semibold text-white flex items-center justify-between">
                        {title}
                        <Badge variant="secondary" className="bg-white/20 text-white">
                            {tasks.length}
                        </Badge>
                    </h3>
                </div>
                <div className="border border-t-0 rounded-b-lg p-3 space-y-3 min-h-[400px] bg-muted/20">
                    {tasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        >
                            <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} />
                        </motion.div>
                    ))}
                </div>
            </div>
        );
        
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                <KanbanColumn title="Pending" tasks={pendingTasks} color="bg-amber-500" />
                <KanbanColumn title="In Progress" tasks={inProgressTasks} color="bg-blue-500" />
                <KanbanColumn title="Completed" tasks={completedTasks} color="bg-emerald-500" />
            </div>
        );
    };

    return (
        <StudentLayout>
            <Head title="Tugas Akademik" />
            
            {/* Floating Particles Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(25)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-amber-500/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, Math.random() * 30 - 15, 0],
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6 p-4 md:p-6"
            >
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div 
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${
                                toast.type === 'success' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                            }`}
                        >
                            {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header - ULTRA ADVANCED matching Dashboard */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, rotateY: 1 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 text-white shadow-2xl mb-2"
                    style={{ transformStyle: 'preserve-3d', perspective: '1500px' }}
                >
                    {/* Ultra Advanced Animated Background Orbs */}
                    <motion.div 
                        animate={{
                            scale: [1, 1.4, 1],
                            rotate: [0, 180, 360],
                            opacity: [0.1, 0.2, 0.1],
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl"
                    />
                    <motion.div 
                        animate={{
                            scale: [1, 1.5, 1],
                            rotate: [360, 180, 0],
                            opacity: [0.1, 0.15, 0.1],
                            x: [0, -40, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-500/30 blur-3xl"
                    />
                    <motion.div 
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                            opacity: [0.08, 0.12, 0.08],
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2,
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-teal-400/20 blur-3xl"
                    />
                    
                    {/* 30 Floating Particles with Advanced Physics */}
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{ 
                                opacity: [0, 0.8, 1, 0.6, 0],
                                scale: [0, 1.8, 1.2, 0.8, 0],
                                y: [0, -50, -100, -150, -200],
                                x: [0, Math.sin(i * 0.5) * 40, Math.cos(i * 0.3) * 30, Math.sin(i) * 20, 0],
                                rotate: [0, 180, 360, 540, 720],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 3,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeOut"
                            }}
                            className="absolute rounded-full shadow-lg"
                            style={{
                                width: `${3 + Math.random() * 10}px`,
                                height: `${3 + Math.random() * 10}px`,
                                left: `${10 + (i * 3) % 80}%`,
                                top: `${20 + (i % 4) * 20}%`,
                                background: i % 3 === 0 
                                    ? 'rgba(255, 255, 255, 0.6)' 
                                    : i % 3 === 1 
                                        ? 'rgba(6, 182, 212, 0.5)' 
                                        : 'rgba(59, 130, 246, 0.5)',
                                filter: 'blur(1px)',
                                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                            }}
                        />
                    ))}
                    
                    {/* Floating Icons with Advanced Animations */}
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            x: [0, 10, 0],
                            rotate: [0, 5, -5, 0],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-10 right-20 text-white/20"
                    >
                        <ListTodo className="h-16 w-16" />
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, 20, 0],
                            x: [0, -15, 0],
                            rotate: [0, -10, 10, 0],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute bottom-10 left-20 text-white/20"
                    >
                        <Target className="h-20 w-20" />
                    </motion.div>
                    
                    {/* Animated Rings */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 2, 3],
                                opacity: [0.3, 0.15, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: i * 1.3,
                                ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30"
                            style={{
                                width: '100px',
                                height: '100px',
                            }}
                        />
                    ))}
                    
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-5">
                            <motion.div
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                <Link href="/user/akademik" className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </motion.div>
                            <motion.div 
                                whileHover={{ 
                                    scale: 1.2, 
                                    rotate: [0, -8, 8, 0],
                                    boxShadow: "0 0 40px rgba(255,255,255,0.6)"
                                }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-xl ring-4 ring-white/40 cursor-pointer shadow-2xl"
                            >
                                {/* Glow effect behind icon */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/50 to-blue-300/50 blur-xl"
                                />
                                <motion.div
                                    whileHover={{ scale: 1.15, y: -3 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="relative"
                                >
                                    <ListTodo className="h-10 w-10" />
                                </motion.div>
                            </motion.div>
                            <div>
                                <motion.p 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="text-sm text-cyan-100 font-semibold tracking-wide"
                                >
                                    Manajemen Akademik
                                </motion.p>
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                                    className="text-3xl font-extrabold tracking-tight"
                                >
                                    Informasi Tugas
                                </motion.h1>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                    className="flex items-center gap-2 mt-1"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.7, 1, 0.7],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="h-2 w-2 rounded-full bg-cyan-300"
                                    />
                                    <p className="text-sm text-cyan-100 font-mono">
                                        Lihat dan kelola tugas dari dosen dengan mudah dan terorganisir
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    onClick={() => setShowForm(true)}
                                    className="flex items-center gap-2 px-6 py-3 h-auto rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xl border-2 border-white/40 shadow-lg transition-all text-white"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span className="font-semibold">Tambah Tugas</span>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                    
                    <div className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                        >
                            <p className="text-xs text-cyan-100">Total Tugas</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                        >
                            <p className="text-xs text-cyan-100">Selesai</p>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                        >
                            <p className="text-xs text-cyan-100">Mendatang</p>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                        >
                            <p className="text-xs text-cyan-100">Terlewat</p>
                            <p className="text-2xl font-bold">{stats.overdue}</p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Ultra Advanced Form Modal */}
                <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                        onClick={() => { setShowForm(false); setFormStep(1); }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.85, y: 30, rotateX: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 30, rotateX: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="w-full max-w-3xl rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white dark:from-gray-900 dark:via-black dark:to-gray-900 p-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-slate-200/50 dark:border-gray-800/50"
                            style={{ transformStyle: 'preserve-3d' as const, perspective: '1500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Animated Background Orbs */}
                            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        rotate: [0, 90, 180],
                                        opacity: [0.05, 0.1, 0.05],
                                    }}
                                    transition={{
                                        duration: 15,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 blur-3xl"
                                />
                                <motion.div
                                    animate={{
                                        scale: [1, 1.4, 1],
                                        rotate: [180, 90, 0],
                                        opacity: [0.05, 0.08, 0.05],
                                    }}
                                    transition={{
                                        duration: 18,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 blur-3xl"
                                />
                            </div>

                            {/* Header with Close Button */}
                            <div className="relative flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                        whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
                                        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 via-violet-500 to-purple-500 text-white shadow-2xl shadow-violet-500/30"
                                    >
                                        {/* Glow Effect */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 0.8, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 blur-xl"
                                        />
                                        <ListTodo className="relative h-8 w-8" />
                                    </motion.div>
                                    <div>
                                        <motion.h3 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-2xl font-bold text-slate-900 dark:text-white"
                                        >
                                            Tambah Tugas Baru
                                        </motion.h3>
                                        <motion.p 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-sm text-slate-600 dark:text-slate-400 font-medium"
                                        >
                                            Isi form berikut dengan lengkap dan jelas
                                        </motion.p>
                                    </div>
                                </div>
                                <motion.button 
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => { setShowForm(false); setFormStep(1); }} 
                                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                                >
                                    <X className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                                </motion.button>
                            </div>

                            {/* Ultra Advanced Progress Steps */}
                            <div className="relative mb-10 px-6">
                                <div className="flex items-center justify-between">
                                    {[
                                        { step: 1, label: 'Info Dasar', icon: BookOpen },
                                        { step: 2, label: 'Detail', icon: FileText },
                                        { step: 3, label: 'Lampiran', icon: Paperclip }
                                    ].map((item, index) => (
                                        <div key={item.step} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center relative z-10">
                                                <motion.div
                                                    animate={{
                                                        scale: formStep === item.step ? 1.15 : 1,
                                                        backgroundColor: formStep >= item.step ? '#8b5cf6' : '#e5e7eb'
                                                    }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    className="relative flex items-center justify-center w-14 h-14 rounded-2xl text-white font-bold shadow-lg"
                                                >
                                                    {/* Pulse Effect */}
                                                    {formStep === item.step && (
                                                        <motion.div
                                                            animate={{
                                                                scale: [1, 1.4, 1],
                                                                opacity: [0.5, 0, 0.5],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: "easeOut"
                                                            }}
                                                            className="absolute inset-0 rounded-2xl bg-violet-500"
                                                        />
                                                    )}
                                                    
                                                    {formStep > item.step ? (
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{ type: "spring", stiffness: 300 }}
                                                        >
                                                            <CheckCircle className="h-7 w-7" />
                                                        </motion.div>
                                                    ) : (
                                                        <item.icon className="h-6 w-6 relative z-10" />
                                                    )}
                                                </motion.div>
                                                <motion.p
                                                    animate={{
                                                        color: formStep >= item.step ? '#8b5cf6' : '#9ca3af',
                                                        fontWeight: formStep === item.step ? 700 : 500
                                                    }}
                                                    className="text-xs mt-2 text-center"
                                                >
                                                    {item.label}
                                                </motion.p>
                                            </div>
                                            {index < 2 && (
                                                <motion.div
                                                    animate={{
                                                        backgroundColor: formStep > item.step ? '#8b5cf6' : '#e5e7eb',
                                                        scaleX: formStep > item.step ? 1 : 0.95
                                                    }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex-1 h-1.5 mx-3 rounded-full"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-violet-500 scrollbar-track-slate-200 dark:scrollbar-track-gray-800">
                                <AnimatePresence mode="wait">
                                    {/* Step 1: Basic Info - Ultra Enhanced */}
                                    {formStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="space-y-6"
                                        >
                                            {/* Step Header with Animation */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200/50 dark:border-blue-800/50"
                                            >
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, 5, -5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="inline-block mb-3"
                                                >
                                                    <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                                </motion.div>
                                                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Informasi Dasar</h3>
                                                <p className="text-sm text-blue-600 dark:text-blue-400">Pilih mata kuliah dan judul tugas</p>
                                            </motion.div>

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                    </motion.div>
                                                    Mata Kuliah
                                                </Label>
                                                <Select value={data.mahasiswa_course_id} onValueChange={handleCourseSelect}>
                                                    <SelectTrigger className="h-14 border-2 hover:border-violet-400 focus:border-violet-500 transition-all rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md">
                                                        <SelectValue placeholder="Pilih mata kuliah" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {courses.map((c) => (
                                                            <SelectItem key={c.id} value={String(c.id)} className="rounded-lg my-1">
                                                                <div className="flex items-center gap-3 py-1">
                                                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                                                        <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                                                    </div>
                                                                    <span className="font-medium">{c.name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <AnimatePresence>
                                                    {errors.mahasiswa_course_id && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                                            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                                                        >
                                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                                            {errors.mahasiswa_course_id}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>

                                            {selectedCourse && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    transition={{ delay: 0.3 }}
                                                    className="space-y-3"
                                                >
                                                    <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                        <motion.div
                                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                        >
                                                            <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                        </motion.div>
                                                        Pertemuan (Opsional)
                                                    </Label>
                                                    <Select value={data.meeting_number} onValueChange={(v) => setData('meeting_number', v)}>
                                                        <SelectTrigger className="h-14 border-2 hover:border-violet-400 focus:border-violet-500 transition-all rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md">
                                                            <SelectValue placeholder="Pilih pertemuan" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            {Array.from({ length: selectedCourse.total_meetings }, (_, i) => (
                                                                <SelectItem key={i + 1} value={String(i + 1)} className="rounded-lg my-1">
                                                                    Pertemuan {i + 1}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </motion.div>
                                            )}

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <ListTodo className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                    </motion.div>
                                                    Judul Tugas
                                                </Label>
                                                <Input
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    placeholder="Contoh: Tugas Bab 3"
                                                    className="h-14 border-2 hover:border-violet-400 focus:border-violet-500 transition-all rounded-xl text-base"
                                                />
                                                <AnimatePresence>
                                                    {errors.title && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                                            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                                                        >
                                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                                            {errors.title}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Details - Ultra Enhanced */}
                                    {formStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="space-y-6"
                                        >
                                            {/* Step Header with Animation */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200/50 dark:border-purple-800/50"
                                            >
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, -5, 5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="inline-block mb-3"
                                                >
                                                    <FileText className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                                                </motion.div>
                                                <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">Detail Tugas</h3>
                                                <p className="text-sm text-purple-600 dark:text-purple-400">Tambahkan deskripsi, deadline, dan prioritas</p>
                                            </motion.div>

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                    </motion.div>
                                                    Deskripsi (Opsional)
                                                </Label>
                                                <Textarea
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Detail tugas..."
                                                    rows={4}
                                                    className="border-2 hover:border-violet-400 focus:border-violet-500 transition-all resize-none rounded-xl"
                                                />
                                            </motion.div>

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                    </motion.div>
                                                    Deadline (Opsional)
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={data.deadline}
                                                    onChange={(e) => setData('deadline', e.target.value)}
                                                    className="h-14 border-2 hover:border-violet-400 focus:border-violet-500 transition-all rounded-xl"
                                                />
                                            </motion.div>

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <Flag className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                    </motion.div>
                                                    Prioritas
                                                </Label>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {[
                                                        { value: 'high', label: 'Tinggi', color: 'red', gradient: 'from-red-400 to-red-600', icon: Flag },
                                                        { value: 'medium', label: 'Sedang', color: 'amber', gradient: 'from-amber-400 to-amber-600', icon: Flag },
                                                        { value: 'low', label: 'Rendah', color: 'blue', gradient: 'from-blue-400 to-blue-600', icon: Flag }
                                                    ].map((priority, index) => (
                                                        <motion.button
                                                            key={priority.value}
                                                            type="button"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 300 }}
                                                            whileHover={{ scale: 1.05, y: -5 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setData('priority', priority.value as any)}
                                                            className={`relative p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${
                                                                data.priority === priority.value
                                                                    ? priority.color === 'red'
                                                                        ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 shadow-xl shadow-red-500/20'
                                                                        : priority.color === 'amber'
                                                                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 shadow-xl shadow-amber-500/20'
                                                                        : 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 shadow-xl shadow-blue-500/20'
                                                                    : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-600'
                                                            }`}
                                                        >
                                                            {/* Animated Background Gradient */}
                                                            {data.priority === priority.value && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0 }}
                                                                    animate={{ opacity: 0.1, scale: 1 }}
                                                                    className={`absolute inset-0 bg-gradient-to-br ${priority.gradient}`}
                                                                />
                                                            )}
                                                            
                                                            {/* Floating Particles */}
                                                            {data.priority === priority.value && [...Array(5)].map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, y: 0 }}
                                                                    animate={{
                                                                        opacity: [0, 1, 0],
                                                                        y: [0, -30, -60],
                                                                        x: [0, Math.random() * 20 - 10, 0],
                                                                    }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        repeat: Infinity,
                                                                        delay: i * 0.3,
                                                                    }}
                                                                    className="absolute w-2 h-2 rounded-full bg-current"
                                                                    style={{
                                                                        left: `${20 + i * 15}%`,
                                                                        bottom: '20%',
                                                                    }}
                                                                />
                                                            ))}
                                                            
                                                            <div className="relative">
                                                                <motion.div
                                                                    whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.1 }}
                                                                    transition={{ duration: 0.6 }}
                                                                    className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg ${
                                                                        data.priority === priority.value
                                                                            ? priority.color === 'red' 
                                                                                ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30' 
                                                                                : priority.color === 'amber'
                                                                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30'
                                                                                : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30'
                                                                            : 'bg-slate-100 dark:bg-gray-700'
                                                                    }`}
                                                                >
                                                                    <priority.icon className={`h-6 w-6 ${
                                                                        data.priority === priority.value ? 'text-white' : 'text-slate-400 dark:text-gray-500'
                                                                    }`} />
                                                                </motion.div>
                                                                <div className="text-center">
                                                                    <p className={`text-sm font-bold ${data.priority === priority.value ? 
                                                                        (priority.color === 'red' ? 'text-red-700 dark:text-red-300' : 
                                                                         priority.color === 'amber' ? 'text-amber-700 dark:text-amber-300' :
                                                                         'text-blue-700 dark:text-blue-300')
                                                                        : 'text-slate-700 dark:text-slate-300'
                                                                    }`}>
                                                                        {priority.label}
                                                                    </p>
                                                                </div>
                                                                
                                                                {/* Checkmark Indicator */}
                                                                <AnimatePresence>
                                                                    {data.priority === priority.value && (
                                                                        <motion.div
                                                                            initial={{ scale: 0, rotate: -180 }}
                                                                            animate={{ scale: 1, rotate: 0 }}
                                                                            exit={{ scale: 0, rotate: 180 }}
                                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                                            className="absolute top-2 right-2"
                                                                        >
                                                                            <div className={`p-1 rounded-full ${
                                                                                priority.color === 'red' ? 'bg-red-500' : 
                                                                                priority.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
                                                                            } shadow-lg`}>
                                                                                <CheckCircle className="h-3 w-3 text-white" />
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Tags & Files - Ultra Enhanced */}
                                    {formStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="space-y-6"
                                        >
                                            {/* Step Header with Animation */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-2 border-indigo-200/50 dark:border-indigo-800/50"
                                            >
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
                                                    className="inline-block mb-3"
                                                >
                                                    <Paperclip className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                                </motion.div>
                                                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">Tags & Lampiran</h3>
                                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Tambahkan tags dan file pendukung</p>
                                            </motion.div>

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <Tag className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                    </motion.div>
                                                    Tags (Opsional)
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                        placeholder="Tambah tag..."
                                                        className="h-14 border-2 hover:border-violet-400 focus:border-violet-500 transition-all rounded-xl"
                                                    />
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button type="button" onClick={addTag} size="lg" className="h-14 px-6 bg-violet-600 hover:bg-violet-700 rounded-xl">
                                                            <Plus className="h-5 w-5" />
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                                {data.tags.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="flex flex-wrap gap-2 mt-3 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-200 dark:border-violet-800"
                                                    >
                                                        {data.tags.map((tag, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                            >
                                                                <Badge variant="secondary" className="gap-1.5 py-2 px-4 text-sm">
                                                                    <Tag className="h-3.5 w-3.5" />
                                                                    {tag}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeTag(tag)}
                                                                        className="ml-1 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </Badge>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <Paperclip className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                    </motion.div>
                                                    Lampiran (Opsional)
                                                </Label>
                                                <motion.div
                                                    animate={{
                                                        scale: dragActive ? 1.02 : 1,
                                                        borderColor: dragActive ? '#8b5cf6' : undefined,
                                                    }}
                                                    onDragEnter={handleDrag}
                                                    onDragLeave={handleDrag}
                                                    onDragOver={handleDrag}
                                                    onDrop={handleDrop}
                                                    className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 overflow-hidden ${
                                                        dragActive
                                                            ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 shadow-xl shadow-violet-500/20'
                                                            : 'border-slate-300 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 bg-white dark:bg-gray-800'
                                                    }`}
                                                >
                                                    {/* Animated Background Pattern */}
                                                    <motion.div
                                                        animate={{
                                                            opacity: dragActive ? 0.1 : 0,
                                                            scale: dragActive ? 1 : 0.8,
                                                        }}
                                                        className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500"
                                                    />
                                                    
                                                    {/* Floating Upload Icons */}
                                                    {dragActive && [...Array(8)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 0 }}
                                                            animate={{
                                                                opacity: [0, 1, 0],
                                                                y: [0, -40, -80],
                                                                x: [0, Math.random() * 40 - 20, 0],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                delay: i * 0.2,
                                                            }}
                                                            className="absolute"
                                                            style={{
                                                                left: `${20 + i * 10}%`,
                                                                bottom: '20%',
                                                            }}
                                                        >
                                                            <Paperclip className="h-4 w-4 text-violet-400" />
                                                        </motion.div>
                                                    ))}
                                                    
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="text-center relative">
                                                        <motion.div
                                                            animate={{ y: dragActive ? [0, -10, 0] : [0, -10, 0] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className="mx-auto w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                                                        >
                                                            <Paperclip className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                                                        </motion.div>
                                                        <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                            {dragActive ? 'Lepaskan file di sini' : 'Drag & drop file atau klik untuk upload'}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            Mendukung berbagai format file
                                                        </p>
                                                    </div>
                                                </motion.div>
                                                {data.attachments.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="space-y-2 mt-3"
                                                    >
                                                        {Array.from(data.attachments).map((file, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-200 dark:border-violet-800"
                                                            >
                                                                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                                                                    <Paperclip className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                        {(file.size / 1024).toFixed(2)} KB
                                                                    </p>
                                                                </div>
                                                                <CheckCircle className="h-6 w-6 text-emerald-500" />
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Ultra Advanced Footer Buttons */}
                                <div className="relative flex items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-gray-800 mt-8">
                                    {formStep > 1 && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            whileHover={{ scale: 1.05 }} 
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={prevStep} 
                                                className="gap-2 h-12 px-6 rounded-xl border-2 hover:border-violet-400"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Kembali
                                            </Button>
                                        </motion.div>
                                    )}
                                    <div className="flex-1" />
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }} 
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => { setShowForm(false); setFormStep(1); }}
                                            className="h-12 px-6 rounded-xl border-2"
                                        >
                                            Batal
                                        </Button>
                                    </motion.div>
                                    {formStep < 3 ? (
                                        <motion.div 
                                            whileHover={{ scale: 1.05 }} 
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button 
                                                type="button" 
                                                onClick={nextStep} 
                                                className="gap-2 h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl shadow-lg shadow-violet-500/30"
                                            >
                                                Lanjut
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            whileHover={{ scale: 1.05 }} 
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button 
                                                type="submit" 
                                                disabled={processing} 
                                                className="gap-2 h-12 px-6 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 rounded-xl shadow-lg shadow-violet-500/30"
                                            >
                                                {processing ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <Clock className="h-4 w-4" />
                                                        </motion.div>
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4" />
                                                        Simpan Tugas
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Stats with Advanced Animations */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                </div>

                {/* Filters */}
                <motion.div
                    variants={itemVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    className="perspective-1000"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all">
                        {/* Animated gradient background */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        
                        {/* Shimmer Effect */}
                        <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                backgroundSize: '200% 100%',
                            }}
                            animate={{
                                backgroundPosition: ['200% 0', '-200% 0'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                        
                        <CardContent className="p-4 space-y-4 relative z-10">
                        {/* Search and Sort */}
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex-1 min-w-[200px] max-w-md relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari tugas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                    <SelectTrigger className="w-[160px]">
                                        <ArrowUpDown className="h-4 w-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="deadline">Sort by Deadline</SelectItem>
                                        <SelectItem value="priority">Sort by Priority</SelectItem>
                                        <SelectItem value="created">Sort by Created</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Filter:</span>
                            </div>
                            <Select value={filters.course_id || 'all'} onValueChange={(v) => handleFilter('course_id', v)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Semua Matkul" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Matkul</SelectItem>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {/* Tags Filter */}
                            {allTags.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-muted-foreground">Tags:</span>
                                    {allTags.map(tag => (
                                        <motion.button
                                            key={tag}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedTags(prev => 
                                                    prev.includes(tag) 
                                                        ? prev.filter(t => t !== tag)
                                                        : [...prev, tag]
                                                );
                                            }}
                                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                                                selectedTags.includes(tag)
                                                    ? 'bg-violet-500 text-white'
                                                    : 'bg-muted hover:bg-muted/80'
                                            }`}
                                        >
                                            <Tag className="h-3 w-3 inline mr-1" />
                                            {tag}
                                        </motion.button>
                                    ))}
                                    {selectedTags.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedTags([])}
                                            className="h-7 text-xs"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                            
                        {/* View Mode Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {filteredAndSortedTasks.length} dari {tasks.length} tugas
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-white dark:bg-gray-800 text-violet-600 shadow-sm' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <LayoutList className="h-4 w-4" />
                                    List
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode('calendar')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                        viewMode === 'calendar' 
                                            ? 'bg-white dark:bg-gray-800 text-violet-600 shadow-sm' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Calendar
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode('kanban')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                        viewMode === 'kanban' 
                                            ? 'bg-white dark:bg-gray-800 text-violet-600 shadow-sm' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Columns3 className="h-4 w-4" />
                                    Kanban
                                </motion.button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                </motion.div>

                {/* Progress Tracker per Mata Kuliah */}
                {courses.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                        className="perspective-1000"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all group">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-indigo-500/5"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            />
                            
                            {/* Glow Effect on Hover */}
                            <motion.div
                                className="absolute inset-0 rounded-2xl"
                                initial={{ opacity: 0 }}
                                whileHover={{ 
                                    opacity: 1,
                                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
                                }}
                                transition={{ duration: 0.3 }}
                            />
                            
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <motion.div
                                        whileHover={{ 
                                            scale: 1.2, 
                                            y: -2,
                                            rotate: [0, -10, 10, 0],
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Target className="h-5 w-5 text-violet-600" />
                                    </motion.div>
                                    Progress per Mata Kuliah
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                {courses.map((course, index) => {
                                    const courseTasks = tasks.filter(t => t.course_id === course.id);
                                    const completedTasks = courseTasks.filter(t => t.status === 'completed').length;
                                    const totalTasks = courseTasks.length;
                                    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                                    
                                    return (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + index * 0.1 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-violet-600" />
                                                    <span className="font-medium text-sm">{course.name}</span>
                                                </div>
                                                <motion.span 
                                                    className="text-sm font-semibold text-violet-600"
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                                >
                                                    {completedTasks}/{totalTasks}
                                                </motion.span>
                                            </div>
                                            <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ 
                                                        duration: 1.5, 
                                                        delay: 0.7 + index * 0.1,
                                                        type: "spring",
                                                        stiffness: 50
                                                    }}
                                                    className={`h-full rounded-full relative ${
                                                        progress === 100 
                                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                                                            : progress >= 50 
                                                                ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                                                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                    }`}
                                                >
                                                    <motion.div
                                                        className="absolute inset-0 bg-white/30"
                                                        animate={{ x: ['-100%', '200%'] }}
                                                        transition={{ 
                                                            duration: 2, 
                                                            repeat: Infinity,
                                                            ease: "linear"
                                                        }}
                                                    />
                                                </motion.div>
                                            </div>
                                            {totalTasks === 0 && (
                                                <p className="text-xs text-muted-foreground">Belum ada tugas</p>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Tasks List */}
                <motion.div
                    variants={itemVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    className="perspective-1000"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all">
                        {/* Animated gradient background */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                        />
                        
                        {/* Glow Effect on Hover */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl"
                            initial={{ opacity: 0 }}
                            whileHover={{ 
                                opacity: 1,
                                boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                            }}
                            transition={{ duration: 0.3 }}
                        />
                        
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <motion.div
                                    whileHover={{ 
                                        scale: 1.2, 
                                        rotate: [0, -10, 10, 0],
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {viewMode === 'list' ? <LayoutList className="h-5 w-5 text-blue-600" /> : 
                                     viewMode === 'calendar' ? <CalendarDays className="h-5 w-5 text-cyan-600" /> : 
                                     <Columns3 className="h-5 w-5 text-teal-600" />}
                                </motion.div>
                                {viewMode === 'list' ? 'Daftar Tugas' : viewMode === 'calendar' ? 'Kalender Tugas' : 'Kanban Board'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                        {viewMode === 'list' && (
                            <Tabs defaultValue={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v)}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="all">Semua</TabsTrigger>
                                    <TabsTrigger value="pending">Pending</TabsTrigger>
                                    <TabsTrigger value="completed">Selesai</TabsTrigger>
                                    <TabsTrigger value="overdue">Terlambat</TabsTrigger>
                                </TabsList>
                                <TabsContent value={filters.status || 'all'}>
                                    {filteredAndSortedTasks.length > 0 ? (
                                        <div className="space-y-3">
                                            {filteredAndSortedTasks.map((task) => (
                                                <TaskCard key={task.id} task={task} onToggle={handleToggle} onDelete={openDeleteDialog} />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState onAddTask={() => setShowForm(true)} />
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                        
                        {viewMode === 'calendar' && (
                            <CalendarView tasks={filteredAndSortedTasks} />
                        )}
                        
                        {viewMode === 'kanban' && (
                            <KanbanBoard tasks={filteredAndSortedTasks} onToggle={handleToggle} onDelete={openDeleteDialog} />
                        )}
                    </CardContent>
                </Card>
                </motion.div>
                {/* Task Detail Modal - CLEAN & MODERN REDESIGN */}
                <Dialog open={showTaskDetail} onOpenChange={setShowTaskDetail}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl bg-white dark:bg-gray-950">
                        {selectedTask && (
                            <div className="relative">
                                {/* Clean Header with Subtle Gradient */}
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 dark:from-gray-950 dark:via-black dark:to-gray-950 p-8 text-white border-b border-gray-800"
                                >
                                    {/* Subtle Background Pattern */}
                                    <div className="absolute inset-0 opacity-5">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                                            backgroundSize: '32px 32px'
                                        }} />
                                    </div>
                                    
                                    {/* Subtle Glow Effect */}
                                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                                    
                                    <div className="relative z-10">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-start gap-4 text-white">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shrink-0"
                                                >
                                                    <ListTodo className="h-6 w-6" />
                                                </motion.div>
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-2xl font-bold tracking-tight mb-2 break-words">
                                                        {selectedTask.title}
                                                    </h2>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30">
                                                            <BookOpen className="h-3 w-3 mr-1" />
                                                            {selectedTask.course_name}
                                                        </Badge>
                                                        {selectedTask.meeting_number && (
                                                            <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                Pertemuan {selectedTask.meeting_number}
                                                            </Badge>
                                                        )}
                                                        {selectedTask.priority && (
                                                            <Badge className={`border ${
                                                                selectedTask.priority === 'high' 
                                                                    ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                                                                    : selectedTask.priority === 'medium'
                                                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                            }`}>
                                                                <Flag className="h-3 w-3 mr-1" />
                                                                {selectedTask.priority === 'high' ? 'Tinggi' : selectedTask.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </DialogTitle>
                                        </DialogHeader>
                                    </div>
                                </motion.div>

                                {/* Clean Content Area */}
                                <div className="p-8 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                                    {/* Deadline & Status Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Deadline Card */}
                                        {selectedTask.deadline && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className={`p-5 rounded-xl border-2 ${
                                                    selectedTask.is_overdue 
                                                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' 
                                                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        selectedTask.is_overdue 
                                                            ? 'bg-red-100 dark:bg-red-900/30' 
                                                            : 'bg-amber-100 dark:bg-amber-900/30'
                                                    }`}>
                                                        <Clock className={`h-5 w-5 ${
                                                            selectedTask.is_overdue 
                                                                ? 'text-red-600 dark:text-red-400' 
                                                                : 'text-amber-600 dark:text-amber-400'
                                                        }`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-xs font-semibold uppercase tracking-wide ${
                                                            selectedTask.is_overdue 
                                                                ? 'text-red-600 dark:text-red-400' 
                                                                : 'text-amber-600 dark:text-amber-400'
                                                        }`}>
                                                            {selectedTask.is_overdue ? 'Deadline Terlewat' : 'Deadline'}
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                                            {selectedTask.deadline_formatted}
                                                        </p>
                                                        {selectedTask.days_remaining !== null && !selectedTask.is_overdue && (
                                                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                                {selectedTask.days_remaining} hari lagi
                                                            </p>
                                                        )}
                                                        {selectedTask.is_overdue && (
                                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1 flex items-center gap-1">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Sudah melewati batas waktu
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        {/* Status Card */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className={`p-5 rounded-xl border-2 ${
                                                selectedTask.status === 'completed'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                                                    : selectedTask.status === 'in_progress'
                                                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                                                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    selectedTask.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                                    selectedTask.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800/30'
                                                }`}>
                                                    {selectedTask.status === 'completed' ? (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                                        Status
                                                    </p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                                        {selectedTask.status === 'completed' ? 'Selesai' : 
                                                         selectedTask.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Belum Dikerjakan'}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                    
                                    {/* Description */}
                                    {selectedTask.description && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                                    <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                                    Deskripsi
                                                </h3>
                                            </div>
                                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {selectedTask.description}
                                            </p>
                                        </motion.div>
                                    )}
                                    
                                    {/* Tags */}
                                    {selectedTask.tags && selectedTask.tags.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                                                    <Tag className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                                    Tags
                                                </h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTask.tags.map((tag: string, idx: number) => (
                                                    <Badge 
                                                        key={idx}
                                                        variant="outline" 
                                                        className="border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    {/* Attachments */}
                                    {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                                    <Paperclip className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                                    Lampiran
                                                </h3>
                                            </div>
                                            <div className="space-y-2">
                                                {selectedTask.attachments.map((file: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                                    >
                                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                                            <Paperclip className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{file.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {(file.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        </div>
                                                        <Download className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    {/* Footer Info */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="pt-4 border-t border-gray-200 dark:border-gray-800"
                                    >
                                        <div className="flex items-center justify-between text-sm flex-wrap gap-3">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Clock className="h-4 w-4" />
                                                <span>Dibuat: {new Date(selectedTask.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            {selectedTask.completed_at && (
                                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Selesai: {new Date(selectedTask.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                                
                                {/* Clean Footer */}
                                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <DialogFooter className="gap-3">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setShowTaskDetail(false)}
                                            className="px-6"
                                        >
                                            Tutup
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                if (selectedTask) {
                                                    handleDuplicateTask(selectedTask);
                                                    setShowTaskDetail(false);
                                                }
                                            }}
                                            className="px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Duplikat Tugas
                                        </Button>
                                    </DialogFooter>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                    onConfirm={handleDelete}
                    title="Hapus Tugas"
                    message="Yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </motion.div>
        </StudentLayout>
    );
}
