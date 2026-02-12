import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
    GraduationCap, Download, Users, Award, AlertTriangle, 
    CheckCircle, TrendingUp, X, Search, Filter, FileSpreadsheet,
    ArrowUpDown, Eye, BarChart3, FileText, Printer
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Input } from '@/components/ui/input';

interface Grade {
    mahasiswa_id: number;
    nama: string;
    nim: string;
    total_sessions: number;
    attended_sessions: number;
    attendance_rate: number;
    average_points: number;
    attendance_grade: number;
    grade_letter: string;
    can_take_uas: boolean;
    details: Array<{
        meeting: number;
        title: string;
        date: string;
        status: string;
        points: number;
    }>;
}

interface Props {
    dosen: { id: number; nama: string };
    courses: Array<{ id: number; nama: string; sks: number }>;
    selectedCourseId: number | null;
    grades: {
        course: { id: number; nama: string; sks: number };
        summary: {
            total_students: number;
            total_sessions: number;
            grade_distribution: Record<string, number>;
            average_attendance_rate: number;
            students_at_risk: number;
        };
        grades: Grade[];
    } | null;
}

export default function Grading({ dosen, courses, selectedCourseId, grades }: Props) {
    const [overrideModal, setOverrideModal] = useState<{ open: boolean; logId: number | null; currentStatus: string }>({
        open: false, logId: null, currentStatus: ''
    });
    const [detailModal, setDetailModal] = useState<{ open: boolean; student: Grade | null }>({ open: false, student: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'nim' | 'rate' | 'grade'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterGrade, setFilterGrade] = useState<string>('all');
    const [filterUAS, setFilterUAS] = useState<string>('all');

    const overrideForm = useForm({ log_id: 0, status: '', reason: '' });

    // Filtered and sorted grades
    const filteredGrades = useMemo(() => {
        if (!grades) return [];
        
        let filtered = grades.grades.filter(g => {
            const matchSearch = g.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               g.nim.includes(searchQuery);
            const matchGrade = filterGrade === 'all' || g.grade_letter === filterGrade;
            const matchUAS = filterUAS === 'all' || 
                           (filterUAS === 'can' && g.can_take_uas) || 
                           (filterUAS === 'cannot' && !g.can_take_uas);
            
            return matchSearch && matchGrade && matchUAS;
        });

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.nama.localeCompare(b.nama);
                    break;
                case 'nim':
                    comparison = a.nim.localeCompare(b.nim);
                    break;
                case 'rate':
                    comparison = a.attendance_rate - b.attendance_rate;
                    break;
                case 'grade':
                    const gradeOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
                    comparison = (gradeOrder[a.grade_letter as keyof typeof gradeOrder] || 0) - 
                                (gradeOrder[b.grade_letter as keyof typeof gradeOrder] || 0);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [grades, searchQuery, sortBy, sortOrder, filterGrade, filterUAS]);

    const handleCourseChange = (courseId: string) => {
        router.get('/dosen/grading', { course_id: courseId }, { preserveState: true });
    };

    const handleExportCsv = () => {
        if (selectedCourseId) {
            window.location.href = `/dosen/grading/export/${selectedCourseId}`;
        }
    };

    const handleExportPdf = () => {
        if (selectedCourseId) {
            window.location.href = `/dosen/grading/export-pdf/${selectedCourseId}`;
        }
    };

    const handleOverride = () => {
        overrideForm.post('/dosen/grading/override', {
            onSuccess: () => {
                setOverrideModal({ open: false, logId: null, currentStatus: '' });
                overrideForm.reset();
            }
        });
    };

    const getGradeColor = (letter: string) => {
        switch (letter) {
            case 'A': return 'bg-green-500';
            case 'B': return 'bg-blue-500';
            case 'C': return 'bg-yellow-500';
            case 'D': return 'bg-orange-500';
            default: return 'bg-red-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'late': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            case 'permit': case 'sick': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            default: return 'text-red-600 bg-red-100 dark:bg-red-900/30';
        }
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Penilaian Kehadiran" />
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 text-white shadow-lg"
                >
                    {/* Animated Background Orbs */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl"
                    />

                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
                                >
                                    <GraduationCap className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-gray-400"
                                    >
                                        Penilaian
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Nilai Kehadiran
                                    </motion.h1>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={String(selectedCourseId || '')} onValueChange={handleCourseChange}>
                                    <SelectTrigger className="w-[250px] bg-white/10 border-white/20 text-white backdrop-blur hover:bg-white/20 transition-colors">
                                        <SelectValue placeholder="Pilih Mata Kuliah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {grades && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Export
                                                </Button>
                                            </motion.div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={handleExportCsv} className="cursor-pointer">
                                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                                Export CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer">
                                                <FileText className="h-4 w-4 mr-2" />
                                                Export PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-gray-400"
                        >
                            Kalkulasi nilai kehadiran otomatis berdasarkan data presensi
                        </motion.p>
                    </div>
                </motion.div>

                {!selectedCourseId && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                    >
                        <div className="py-12 text-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            </motion.div>
                            <p className="text-gray-500">Pilih mata kuliah untuk melihat nilai kehadiran</p>
                        </div>
                    </motion.div>
                )}

                {grades && (
                    <>
                        {/* Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="grid grid-cols-2 md:grid-cols-5 gap-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: 10 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                    >
                                        <Users className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs text-gray-500">Mahasiswa</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            <AnimatedCounter value={grades.summary.total_students} duration={1500} />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: 10 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                    >
                                        <TrendingUp className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs text-gray-500">Rata-rata</p>
                                        <p className="text-xl font-bold text-emerald-600">
                                            <AnimatedCounter value={grades.summary.average_attendance_rate} duration={1500} />%
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: 10 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                                    >
                                        <Award className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs text-gray-500">Pertemuan</p>
                                        <p className="text-xl font-bold text-purple-600">
                                            <AnimatedCounter value={grades.summary.total_sessions} duration={1500} />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.25 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: 10 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30"
                                    >
                                        <AlertTriangle className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tidak Bisa UAS</p>
                                        <p className="text-xl font-bold text-red-600">
                                            <AnimatedCounter value={grades.summary.students_at_risk} duration={1500} />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                            >
                                <div className="flex justify-center gap-1">
                                    {Object.entries(grades.summary.grade_distribution).map(([grade, count]) => (
                                        <div key={grade} className="text-center px-2">
                                            <motion.div
                                                whileHover={{ rotate: 10, scale: 1.1 }}
                                                className={`w-6 h-6 rounded-full ${getGradeColor(grade)} text-white text-xs flex items-center justify-center mx-auto`}
                                            >
                                                {grade}
                                            </motion.div>
                                            <p className="text-xs mt-1 text-gray-600">{count}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Search and Filter Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                            className="rounded-2xl border-2 border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div 
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600"
                                >
                                    <Filter className="h-5 w-5 text-white" />
                                </motion.div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Filter & Pencarian</h3>
                                    <p className="text-xs text-gray-500">Temukan data mahasiswa dengan mudah</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-5">
                                {/* Search */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cari Mahasiswa
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Nama atau NIM..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 border-2 focus:ring-4 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Urutkan
                                    </label>
                                    <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                        <SelectTrigger className="border-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Nama</SelectItem>
                                            <SelectItem value="nim">NIM</SelectItem>
                                            <SelectItem value="rate">Persentase</SelectItem>
                                            <SelectItem value="grade">Grade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Filter Grade */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Grade
                                    </label>
                                    <Select value={filterGrade} onValueChange={setFilterGrade}>
                                        <SelectTrigger className="border-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua</SelectItem>
                                            <SelectItem value="A">A</SelectItem>
                                            <SelectItem value="B">B</SelectItem>
                                            <SelectItem value="C">C</SelectItem>
                                            <SelectItem value="D">D</SelectItem>
                                            <SelectItem value="E">E</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Filter UAS */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status UAS
                                    </label>
                                    <Select value={filterUAS} onValueChange={setFilterUAS}>
                                        <SelectTrigger className="border-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua</SelectItem>
                                            <SelectItem value="can">Bisa UAS</SelectItem>
                                            <SelectItem value="cannot">Tidak Bisa UAS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Sort Order Toggle */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                        {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                                    </motion.button>
                                    <span className="text-sm text-gray-500">
                                        Menampilkan {filteredGrades.length} dari {grades.grades.length} mahasiswa
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterGrade('all');
                                            setFilterUAS('all');
                                            setSortBy('name');
                                            setSortOrder('asc');
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                                    >
                                        Reset Filter
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Grades Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="rounded-2xl border-2 border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
                        >
                            <div className="p-6 border-b-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-black">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <motion.div 
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600"
                                        >
                                            <BarChart3 className="h-5 w-5 text-white" />
                                        </motion.div>
                                        <div>
                                            <h2 className="font-semibold text-gray-900 dark:text-white">Daftar Nilai Mahasiswa</h2>
                                            <p className="text-sm text-gray-500">{grades.course.nama} ({grades.course.sks} SKS)</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleExportCsv}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            CSV
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleExportPdf}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all"
                                        >
                                            <FileText className="h-4 w-4" />
                                            PDF
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">No</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">NIM</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Hadir</th>
                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Poin</th>
                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">UAS</th>
                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {filteredGrades.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-4 py-12 text-center">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                    >
                                                        <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                        <p className="text-gray-500">Tidak ada data yang sesuai dengan filter</p>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredGrades.map((g, idx) => (
                                            <motion.tr
                                                key={g.mahasiswa_id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.03 }}
                                                whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <td className="px-4 py-4 text-gray-600 dark:text-gray-400 font-medium">{idx + 1}</td>
                                                <td className="px-4 py-4 font-mono text-xs text-gray-600 dark:text-gray-400 font-semibold">{g.nim}</td>
                                                <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{g.nama}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                                                        {g.attended_sessions}/{g.total_sessions}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Progress value={g.attendance_rate} className="h-2 w-20" />
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{g.attendance_rate}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold">
                                                        {g.average_points}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <motion.span
                                                        whileHover={{ scale: 1.15, y: -2 }}
                                                        className={`inline-block px-3 py-1.5 rounded-lg text-white text-sm font-bold shadow-lg ${getGradeColor(g.grade_letter)}`}
                                                    >
                                                        {g.grade_letter}
                                                    </motion.span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {g.can_take_uas ? (
                                                        <motion.div whileHover={{ scale: 1.2, y: -2 }}>
                                                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto drop-shadow-lg" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div whileHover={{ scale: 1.2, y: -2 }}>
                                                            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto drop-shadow-lg" />
                                                        </motion.div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setDetailModal({ open: true, student: g })}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        Detail
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                        ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* Detail Modal */}
                <AnimatePresence>
                    {detailModal.open && detailModal.student && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                            onClick={() => setDetailModal({ open: false, student: null })}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-3xl rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-2xl max-h-[90vh] overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-6 text-white">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"
                                    />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                                className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                            >
                                                <GraduationCap className="h-7 w-7" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold">Detail Kehadiran</h3>
                                                <p className="text-sm text-white/80">Riwayat lengkap presensi mahasiswa</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setDetailModal({ open: false, student: null })}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                                    {/* Student Info Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black p-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-2xl font-bold">
                                                    {detailModal.student.nama.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{detailModal.student.nama}</p>
                                                    <p className="text-sm font-mono text-gray-500">{detailModal.student.nim}</p>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <motion.span
                                                    whileHover={{ scale: 1.1, y: -2 }}
                                                    className={`inline-block px-4 py-2 rounded-xl text-white text-lg font-bold shadow-lg ${getGradeColor(detailModal.student.grade_letter)}`}
                                                >
                                                    Grade {detailModal.student.grade_letter}
                                                </motion.span>
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-semibold text-purple-600">{detailModal.student.average_points}</span> poin rata-rata
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4 mt-6">
                                            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 text-center">
                                                <p className="text-2xl font-bold text-blue-600">{detailModal.student.attended_sessions}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Hadir</p>
                                            </div>
                                            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3 text-center">
                                                <p className="text-2xl font-bold text-emerald-600">{detailModal.student.attendance_rate}%</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Persentase</p>
                                            </div>
                                            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-3 text-center">
                                                <p className="text-2xl font-bold text-purple-600">{detailModal.student.total_sessions}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Sesi</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Attendance History */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <motion.div 
                                                whileHover={{ scale: 1.1 }}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600"
                                            >
                                                <FileText className="h-4 w-4 text-white" />
                                            </motion.div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Riwayat Kehadiran</h4>
                                        </div>
                                        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
                                            <div className="max-h-[400px] overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                                                        <tr>
                                                            <th className="text-left p-4 font-bold text-gray-700 dark:text-gray-300">Pertemuan</th>
                                                            <th className="text-left p-4 font-bold text-gray-700 dark:text-gray-300">Tanggal</th>
                                                            <th className="text-center p-4 font-bold text-gray-700 dark:text-gray-300">Status</th>
                                                            <th className="text-center p-4 font-bold text-gray-700 dark:text-gray-300">Poin</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                                        {detailModal.student.details.map((d, idx) => (
                                                            <motion.tr
                                                                key={d.meeting}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.03 }}
                                                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', x: 5 }}
                                                                className="transition-colors"
                                                            >
                                                                <td className="p-4">
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900 dark:text-white">{d.title}</p>
                                                                        <p className="text-xs text-gray-500">Pertemuan {d.meeting}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-gray-600 dark:text-gray-400">{d.date}</td>
                                                                <td className="p-4 text-center">
                                                                    <motion.span 
                                                                        whileHover={{ scale: 1.1 }}
                                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusColor(d.status)}`}
                                                                    >
                                                                        {d.status === 'present' && <CheckCircle className="h-3 w-3" />}
                                                                        {d.status === 'late' && <AlertTriangle className="h-3 w-3" />}
                                                                        {d.status}
                                                                    </motion.span>
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold">
                                                                        {d.points}
                                                                    </span>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Override Modal */}
                <AnimatePresence>
                    {overrideModal.open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setOverrideModal({ open: false, logId: null, currentStatus: '' })}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-black"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Override Status Kehadiran</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setOverrideModal({ open: false, logId: null, currentStatus: '' })}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Status Baru</label>
                                        <Select value={overrideForm.data.status} onValueChange={(v) => overrideForm.setData('status', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="present">Hadir</SelectItem>
                                                <SelectItem value="late">Terlambat</SelectItem>
                                                <SelectItem value="permit">Izin</SelectItem>
                                                <SelectItem value="sick">Sakit</SelectItem>
                                                <SelectItem value="rejected">Tidak Hadir</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Alasan</label>
                                        <Textarea
                                            value={overrideForm.data.reason}
                                            onChange={(e) => overrideForm.setData('reason', e.target.value)}
                                            placeholder="Alasan perubahan status..."
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                            <Button onClick={handleOverride} disabled={overrideForm.processing} className="w-full">
                                                Simpan
                                            </Button>
                                        </motion.div>
                                        <motion.div whileTap={{ scale: 0.95 }}>
                                            <Button variant="outline" onClick={() => setOverrideModal({ open: false, logId: null, currentStatus: '' })}>
                                                Batal
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
        </motion.div>
        </DosenLayout>
    );
}
