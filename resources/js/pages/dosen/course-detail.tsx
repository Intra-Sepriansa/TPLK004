import { Head, Link, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Users, Calendar, TrendingUp, TrendingDown, Clock,
    AlertTriangle, CheckCircle, XCircle, Search, Filter, Download,
    ChevronRight, MoreVertical, Plus, ArrowLeft, ArrowUpRight,
    Sparkles, Target, Zap, Award, BarChart3, PieChart as PieChartIcon,
    Activity, FileText, Bell, Share2, Settings, QrCode, Play, Pause,
    ChevronDown, Check
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
    Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types & Interfaces ---

interface Course {
    id: number;
    nama: string;
    kode: string;
    sks: number;
    semester?: string;
    academic_year?: string;
}

interface Session {
    id: number;
    title: string;
    meeting_number: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
    status: 'active' | 'completed' | 'scheduled';
    attendance_count: number;
    present_count: number;
    late_count: number;
    absent_count: number;
    rate: number;
}

interface Student {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    total: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'fail';
    trend?: 'up' | 'down' | 'stable';
    avatar_url?: string;
}

interface Stats {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalStudents: number;
    attendanceRate: number;
    lateRate: number;
    absentRate: number;
    atRiskCount: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
}

interface ActivityItem {
    type: string;
    icon: string;
    text: string;
    detail: string;
    time: string;
    timestamp: string;
}

interface ChartData {
    meeting: string;
    meetingNumber: number;
    hadir: number;
    terlambat: number;
    tidakHadir: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    total: number;
}

interface Prediction {
    nextSessionAttendance: { predicted: number; confidence: 'high' | 'medium' | 'low' };
    atRiskStudents: { count: number; students: Partial<Student>[] };
    passRate: { predicted: number };
}

interface Distribution {
    name: string;
    value: number;
    color: string;
}

interface PageProps {
    dosen: { id: number; nama: string; nidn: string };
    course: Course;
    sessions: Session[];
    students: Student[];
    stats: Stats;
    distribution: Distribution[];
    chartData: ChartData[];
    activities: ActivityItem[];
    predictions: Prediction;
}

// --- Animation Variants ---

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.02,
        y: -5,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
};


export default function CourseDetail({
    dosen, course, sessions, students, stats, distribution,
    chartData, activities, predictions
}: PageProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'mahasiswa' | 'sesi-absen'>('overview');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Student; direction: 'asc' | 'desc' } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedSessionDate, setSelectedSessionDate] = useState<string | null>(null);

    // Derived State: Filtered Students
    const filteredStudents = useMemo(() => {
        let filtered = [...students];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.nama.toLowerCase().includes(lowerQuery) ||
                s.nim.toLowerCase().includes(lowerQuery)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [students, searchQuery, statusFilter, sortConfig]);

    // Sorting Helper
    const requestSort = (key: keyof Student) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Derived State: Session Performance Data for Bar Chart
    const sessionPerformanceData = useMemo(() => {
        return chartData.map(item => ({
            name: item.meeting,
            Hadir: item.presentCount,
            Terlambat: item.lateCount,
            TidakHadir: item.absentCount,
        }));
    }, [chartData]);


    const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
        // In a real app, this would trigger a download
        alert(`Exporting course data to ${type.toUpperCase()}...`);
        // router.get(`/dosen/courses/${course.id}/export?type=${type}`);
    };

    const handleCreateSession = () => {
        // router.visit(`/dosen/courses/${course.id}/sessions/create`);
        alert("Navigating to create session page...");
    };

    const handleSendAnnouncement = () => {
        alert("Opening announcement modal...");
    };


    return (
        <DosenLayout>
            <Head title={`Detail ${course.nama || "Mata Kuliah"}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* ═══════ SECTION 1: HEADER (Animated Gradient) ═══════ */}
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

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i }}
                        />
                    ))}

                    <div className="relative">
                        <Link href="/dosen/courses" className="inline-flex items-center gap-2 text-indigo-100 mb-6 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Mata Kuliah
                        </Link>

                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <BookOpen className="h-10 w-10 text-white" />
                                </motion.div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm">
                                            {course.kode}
                                        </Badge>
                                        <Badge variant="outline" className="text-indigo-100 border-white/30 backdrop-blur-sm">
                                            {course.sks} SKS
                                        </Badge>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{course.nama}</h1>
                                    <p className="mt-2 text-indigo-100 max-w-lg flex items-center gap-2">
                                        <Users className="h-4 w-4" /> {stats.totalStudents} Mahasiswa Terdaftar
                                        <span className="mx-2">•</span>
                                        <span className={cn(
                                            "font-semibold",
                                            stats.attendanceRate >= 80 ? "text-emerald-300" :
                                            stats.attendanceRate >= 70 ? "text-yellow-300" : "text-red-300"
                                        )}>
                                            {stats.attendanceRate}% Kehadiran
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="hidden md:block"
                            >
                                <div className="flex gap-4">
                                     <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                         <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Sesi Aktif</p>
                                         <p className="text-2xl font-bold text-white mt-1">{stats.activeSessions}</p>
                                     </div>
                                     <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                         <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Sesi Selesai</p>
                                         <p className="text-2xl font-bold text-white mt-1">{stats.completedSessions}</p>
                                     </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10"
                        >
                            <Button
                                onClick={handleCreateSession}
                                className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg shadow-black/10 border-none font-semibold"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Buat Sesi Baru
                            </Button>

                            <Button
                                onClick={handleExport.bind(null, 'pdf')}
                                variant="outline"
                                className="bg-white/20 text-white border-white/20 hover:bg-white/30 backdrop-blur-md shadow-lg"
                            >
                                <Download className="mr-2 h-4 w-4" /> Export Laporan
                            </Button>

                            <Button
                                onClick={handleSendAnnouncement}
                                variant="outline"
                                className="bg-white/20 text-white border-white/20 hover:bg-white/30 backdrop-blur-md shadow-lg"
                            >
                                <Bell className="mr-2 h-4 w-4" /> Kirim Pengumuman
                            </Button>

                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="text-white hover:bg-white/20 ml-auto">
                                        <Settings className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem>Pengaturan Kelas</DropdownMenuItem>
                                    <DropdownMenuItem>Arsipkan Kelas</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </motion.div>
                    </div>
                </motion.div>
