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
    ArrowUpDown, Eye, Copy, Star, TrendingUp, BarChart3, ArrowRight, FileText
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

    // Mouse position for parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set((clientX / innerWidth - 0.5) * 20);
        mouseY.set((clientY / innerHeight - 0.5) * 20);
    };

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

    // Helper Components
    const TaskCard = ({ task, onToggle, onDelete }: { task: Task; onToggle: (id: number) => void; onDelete: (id: number) => void }) => (
        <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`p-4 rounded-lg border transition-all ${
                task.status === 'completed' 
                    ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' 
                    : task.is_overdue 
                        ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                        : 'hover:bg-muted/50'
            }`}
        >
            <div className="flex items-start gap-3">
                <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => onToggle(task.id)}
                    className="mt-1"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    {task.course_name}
                                </Badge>
                                {task.meeting_number && (
                                    <Badge variant="secondary" className="text-xs">
                                        P{task.meeting_number}
                                    </Badge>
                                )}
                                {task.priority && (
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                            task.priority === 'high' 
                                                ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30' 
                                                : task.priority === 'medium'
                                                    ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                                                    : 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                                        }`}
                                    >
                                        <Flag className="h-3 w-3 mr-1" />
                                        {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                    </Badge>
                                )}
                                {task.tags && task.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                    </Badge>
                                ))}
                                {task.status === 'completed' ? (
                                    <Badge className="bg-emerald-500 text-xs">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                    </Badge>
                                ) : task.is_overdue ? (
                                    <Badge variant="destructive" className="text-xs">
                                        <AlertTriangle className="h-3 w-3 mr-1" /> Terlambat
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {task.deadline_formatted && task.status !== 'completed' && (
                                <div className={`text-right mr-2 ${task.is_overdue ? 'text-red-600' : task.days_remaining !== null && task.days_remaining <= 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                    <div className="flex items-center gap-1 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        {task.deadline_formatted}
                                    </div>
                                    {task.days_remaining !== null && !task.is_overdue && (
                                        <p className="text-xs">{task.days_remaining} hari lagi</p>
                                    )}
                                </div>
                            )}
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleViewTask(task)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-violet-500 hover:text-violet-600 hover:bg-violet-50"
                                    onClick={() => handleDuplicateTask(task)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => onDelete(task.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                    {task.description && (
                        <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                    )}
                    {task.attachments && task.attachments.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{task.attachments.length} lampiran</span>
                        </div>
                    )}
                </div>
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
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
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
        
        return (
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">
                        {new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h3>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                            {day}
                        </div>
                    ))}
                    {emptyDays.map(i => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {days.map(day => {
                        const dayTasks = getTasksForDay(day);
                        const isToday = day === today.getDate() && currentMonth === today.getMonth();
                        
                        return (
                            <motion.div
                                key={day}
                                whileHover={{ scale: 1.05 }}
                                className={`aspect-square border rounded-lg p-2 ${
                                    isToday ? 'bg-violet-50 border-violet-300 dark:bg-violet-950/30' : 'hover:bg-muted/50'
                                }`}
                            >
                                <div className="text-sm font-medium mb-1">{day}</div>
                                {dayTasks.length > 0 && (
                                    <div className="space-y-1">
                                        {dayTasks.slice(0, 2).map(task => (
                                            <div
                                                key={task.id}
                                                className={`text-xs p-1 rounded truncate ${
                                                    task.priority === 'high' 
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-950/50' 
                                                        : task.priority === 'medium'
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50'
                                                }`}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                        {dayTasks.length > 2 && (
                                            <div className="text-xs text-muted-foreground">+{dayTasks.length - 2} lagi</div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
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

            <div 
                className="flex flex-col gap-6 p-4 md:p-6 relative z-10"
                onMouseMove={handleMouseMove}
                style={{
                    perspective: "1500px",
                }}
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

                {/* Header with Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        x: smoothMouseX,
                        y: smoothMouseY,
                    }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-6 text-white shadow-lg"
                >
                    {/* Animated gradient overlay */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{
                            x: ['-100%', '200%'],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut"
                        }}
                    />
                    
                    {/* Floating orbs */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1], 
                            opacity: [0.3, 0.5, 0.3] 
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1], 
                            opacity: [0.2, 0.4, 0.2] 
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/user/akademik">
                                <motion.div
                                    whileHover={{ scale: 1.2, rotate: -10 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </motion.div>
                            </Link>
                            <div>
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-bold flex items-center gap-2"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                    >
                                        <ListTodo className="h-7 w-7" />
                                    </motion.div>
                                    Tugas Akademik
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-amber-100"
                                >
                                    Kelola tugas per mata kuliah
                                </motion.p>
                            </div>
                        </div>
                        <Dialog open={showForm} onOpenChange={setShowForm}>
                            <DialogTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button className="bg-white text-amber-600 hover:bg-amber-50">
                                        <Plus className="h-4 w-4 mr-2" /> Tambah Tugas
                                    </Button>
                                </motion.div>
                            </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg"
                                    >
                                        <Plus className="h-5 w-5 text-white" />
                                    </motion.div>
                                    Tambah Tugas Baru
                                </DialogTitle>
                                <DialogDescription>Catat tugas untuk mata kuliah tertentu</DialogDescription>
                            </DialogHeader>

                            {/* Progress Steps */}
                            <div className="flex items-center justify-between mb-6 px-4">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center flex-1">
                                        <motion.div
                                            animate={{
                                                scale: formStep === step ? 1.1 : 1,
                                                backgroundColor: formStep >= step ? '#8b5cf6' : '#e5e7eb'
                                            }}
                                            className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold"
                                        >
                                            {formStep > step ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                step
                                            )}
                                        </motion.div>
                                        {step < 3 && (
                                            <motion.div
                                                animate={{
                                                    backgroundColor: formStep > step ? '#8b5cf6' : '#e5e7eb'
                                                }}
                                                className="flex-1 h-1 mx-2"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AnimatePresence mode="wait">
                                    {/* Step 1: Basic Info */}
                                    {formStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <div className="text-center mb-4">
                                                <h3 className="text-lg font-semibold text-violet-600">Informasi Dasar</h3>
                                                <p className="text-sm text-muted-foreground">Pilih mata kuliah dan judul tugas</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-violet-600" />
                                                    Mata Kuliah
                                                </Label>
                                                <Select value={data.mahasiswa_course_id} onValueChange={handleCourseSelect}>
                                                    <SelectTrigger className="h-12 border-2 hover:border-violet-300 transition-colors">
                                                        <SelectValue placeholder="Pilih mata kuliah" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courses.map((c) => (
                                                            <SelectItem key={c.id} value={String(c.id)}>
                                                                <div className="flex items-center gap-2">
                                                                    <BookOpen className="h-4 w-4 text-violet-600" />
                                                                    {c.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.mahasiswa_course_id && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 flex items-center gap-1"
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {errors.mahasiswa_course_id}
                                                    </motion.p>
                                                )}
                                            </div>

                                            {selectedCourse && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="space-y-2"
                                                >
                                                    <Label className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-violet-600" />
                                                        Pertemuan (Opsional)
                                                    </Label>
                                                    <Select value={data.meeting_number} onValueChange={(v) => setData('meeting_number', v)}>
                                                        <SelectTrigger className="h-12 border-2 hover:border-violet-300 transition-colors">
                                                            <SelectValue placeholder="Pilih pertemuan" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: selectedCourse.total_meetings }, (_, i) => (
                                                                <SelectItem key={i + 1} value={String(i + 1)}>
                                                                    Pertemuan {i + 1}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </motion.div>
                                            )}

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <ListTodo className="h-4 w-4 text-violet-600" />
                                                    Judul Tugas
                                                </Label>
                                                <Input
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    placeholder="Contoh: Tugas Bab 3"
                                                    className="h-12 border-2 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                                />
                                                {errors.title && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-500 flex items-center gap-1"
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {errors.title}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Details */}
                                    {formStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <div className="text-center mb-4">
                                                <h3 className="text-lg font-semibold text-violet-600">Detail Tugas</h3>
                                                <p className="text-sm text-muted-foreground">Tambahkan deskripsi, deadline, dan prioritas</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-violet-600" />
                                                    Deskripsi (Opsional)
                                                </Label>
                                                <Textarea
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Detail tugas..."
                                                    rows={4}
                                                    className="border-2 hover:border-violet-300 focus:border-violet-500 transition-colors resize-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-violet-600" />
                                                    Deadline (Opsional)
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={data.deadline}
                                                    onChange={(e) => setData('deadline', e.target.value)}
                                                    className="h-12 border-2 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Flag className="h-4 w-4 text-violet-600" />
                                                    Prioritas
                                                </Label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { value: 'high', label: 'Tinggi', color: 'red', icon: '🔥' },
                                                        { value: 'medium', label: 'Sedang', color: 'amber', icon: '⚡' },
                                                        { value: 'low', label: 'Rendah', color: 'blue', icon: '💧' }
                                                    ].map((priority) => (
                                                        <motion.button
                                                            key={priority.value}
                                                            type="button"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setData('priority', priority.value as any)}
                                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                                data.priority === priority.value
                                                                    ? `border-${priority.color}-500 bg-${priority.color}-50 dark:bg-${priority.color}-950/30`
                                                                    : 'border-gray-200 hover:border-violet-300'
                                                            }`}
                                                        >
                                                            <div className="text-2xl mb-1">{priority.icon}</div>
                                                            <div className="text-sm font-medium">{priority.label}</div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Tags & Files */}
                                    {formStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <div className="text-center mb-4">
                                                <h3 className="text-lg font-semibold text-violet-600">Tags & Lampiran</h3>
                                                <p className="text-sm text-muted-foreground">Tambahkan tags dan file pendukung</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-violet-600" />
                                                    Tags (Opsional)
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                        placeholder="Tambah tag..."
                                                        className="h-12 border-2 hover:border-violet-300 focus:border-violet-500 transition-colors"
                                                    />
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button type="button" onClick={addTag} size="lg" className="h-12 bg-violet-600 hover:bg-violet-700">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                                {data.tags.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="flex flex-wrap gap-2 mt-3 p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg"
                                                    >
                                                        {data.tags.map((tag, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                            >
                                                                <Badge variant="secondary" className="gap-1 py-1.5 px-3">
                                                                    <Tag className="h-3 w-3" />
                                                                    {tag}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeTag(tag)}
                                                                        className="ml-1 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Paperclip className="h-4 w-4 text-violet-600" />
                                                    Lampiran (Opsional)
                                                </Label>
                                                <div
                                                    onDragEnter={handleDrag}
                                                    onDragLeave={handleDrag}
                                                    onDragOver={handleDrag}
                                                    onDrop={handleDrop}
                                                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                                                        dragActive
                                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                                                            : 'border-gray-300 hover:border-violet-400'
                                                    }`}
                                                >
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <div className="text-center">
                                                        <motion.div
                                                            animate={{ y: [0, -10, 0] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className="mx-auto w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-3"
                                                        >
                                                            <Paperclip className="h-6 w-6 text-violet-600" />
                                                        </motion.div>
                                                        <p className="text-sm font-medium mb-1">
                                                            Drag & drop file atau klik untuk upload
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Mendukung berbagai format file
                                                        </p>
                                                    </div>
                                                </div>
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
                                                                className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg"
                                                            >
                                                                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                                                                    <Paperclip className="h-4 w-4 text-violet-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {(file.size / 1024).toFixed(2)} KB
                                                                    </p>
                                                                </div>
                                                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <DialogFooter className="gap-2">
                                    {formStep > 1 && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                                                <ArrowLeft className="h-4 w-4" />
                                                Kembali
                                            </Button>
                                        </motion.div>
                                    )}
                                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormStep(1); }}>
                                        Batal
                                    </Button>
                                    {formStep < 3 ? (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button type="button" onClick={nextStep} className="gap-2 bg-violet-600 hover:bg-violet-700">
                                                Lanjut
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button type="submit" disabled={processing} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
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
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    </div>
                </motion.div>

                {/* Stats with Advanced Animations */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ 
                            scale: 1.05, 
                            rotateY: 5,
                            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <Card className="relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                            <CardContent className="p-4 text-center relative z-10">
                                <motion.p 
                                    className="text-2xl font-bold"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {stats.total}
                                </motion.p>
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Total Tugas
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ 
                            scale: 1.05, 
                            rotateY: 5,
                            boxShadow: "0 20px 40px rgba(16,185,129,0.3)"
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20"
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            />
                            <CardContent className="p-4 text-center relative z-10">
                                <motion.p 
                                    className="text-2xl font-bold text-emerald-600"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                                >
                                    {stats.completed}
                                </motion.p>
                                <p className="text-sm text-emerald-600/80 flex items-center justify-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Selesai
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ 
                            scale: 1.05, 
                            rotateY: 5,
                            boxShadow: "0 20px 40px rgba(245,158,11,0.3)"
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20"
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            />
                            <CardContent className="p-4 text-center relative z-10">
                                <motion.p 
                                    className="text-2xl font-bold text-amber-600"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                                >
                                    {stats.pending}
                                </motion.p>
                                <p className="text-sm text-amber-600/80 flex items-center justify-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Pending
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ 
                            scale: 1.05, 
                            rotateY: 5,
                            boxShadow: "0 20px 40px rgba(239,68,68,0.3)"
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-rose-400/20"
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            />
                            <CardContent className="p-4 text-center relative z-10">
                                <motion.p 
                                    className="text-2xl font-bold text-red-600"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                                >
                                    {stats.overdue}
                                </motion.p>
                                <p className="text-sm text-red-600/80 flex items-center justify-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Terlambat
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 space-y-4">
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

                {/* Progress Tracker per Mata Kuliah */}
                {courses.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-indigo-500/5"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            />
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <motion.div
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                            {viewMode === 'list' ? 'Daftar Tugas' : viewMode === 'calendar' ? 'Kalender Tugas' : 'Kanban Board'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                {/* Task Detail Modal */}
                <Dialog open={showTaskDetail} onOpenChange={setShowTaskDetail}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        {selectedTask && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        {selectedTask.title}
                                        {selectedTask.priority && (
                                            <Badge 
                                                variant="outline" 
                                                className={`text-xs ${
                                                    selectedTask.priority === 'high' 
                                                        ? 'border-red-500 text-red-600 bg-red-50' 
                                                        : selectedTask.priority === 'medium'
                                                            ? 'border-amber-500 text-amber-600 bg-amber-50'
                                                            : 'border-blue-500 text-blue-600 bg-blue-50'
                                                }`}
                                            >
                                                <Flag className="h-3 w-3 mr-1" />
                                                {selectedTask.priority === 'high' ? 'Tinggi' : selectedTask.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                            </Badge>
                                        )}
                                    </DialogTitle>
                                    <DialogDescription>Detail lengkap tugas</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Mata Kuliah</Label>
                                            <p className="font-medium">{selectedTask.course_name}</p>
                                        </div>
                                        {selectedTask.meeting_number && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Pertemuan</Label>
                                                <p className="font-medium">Pertemuan {selectedTask.meeting_number}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {selectedTask.deadline && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Deadline</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-medium">{selectedTask.deadline_formatted}</p>
                                                {selectedTask.days_remaining !== null && !selectedTask.is_overdue && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {selectedTask.days_remaining} hari lagi
                                                    </Badge>
                                                )}
                                                {selectedTask.is_overdue && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Terlambat
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Status</Label>
                                        <div className="mt-1">
                                            {selectedTask.status === 'completed' ? (
                                                <Badge className="bg-emerald-500">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                                </Badge>
                                            ) : selectedTask.status === 'in_progress' ? (
                                                <Badge className="bg-blue-500">
                                                    <Clock className="h-3 w-3 mr-1" /> In Progress
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Clock className="h-3 w-3 mr-1" /> Pending
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {selectedTask.description && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Deskripsi</Label>
                                            <p className="mt-1 text-sm">{selectedTask.description}</p>
                                        </div>
                                    )}
                                    
                                    {selectedTask.tags && selectedTask.tags.length > 0 && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Tags</Label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {selectedTask.tags.map((tag, idx) => (
                                                    <Badge key={idx} variant="outline">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Lampiran</Label>
                                            <div className="space-y-2 mt-1">
                                                {selectedTask.attachments.map((file, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm flex-1">{file.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {(file.size / 1024).toFixed(2)} KB
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Dibuat: {new Date(selectedTask.created_at).toLocaleDateString('id-ID')}</span>
                                            {selectedTask.completed_at && (
                                                <span>Selesai: {new Date(selectedTask.completed_at).toLocaleDateString('id-ID')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowTaskDetail(false)}>
                                        Tutup
                                    </Button>
                                    <Button onClick={() => {
                                        handleDuplicateTask(selectedTask);
                                        setShowTaskDetail(false);
                                    }}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplikat
                                    </Button>
                                </DialogFooter>
                            </>
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
            </div>
        </StudentLayout>
    );
}
