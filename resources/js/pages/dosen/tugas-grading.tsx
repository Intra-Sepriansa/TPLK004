import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Award,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    GraduationCap,
    MessageSquare,
    Save,
    Sparkles,
    User,
    AlertTriangle,
    TrendingUp,
    Search,
    Filter,
    ArrowUpDown,
    Mail,
    Printer,
    FileSpreadsheet,
    BarChart3,
    CheckSquare,
    X,
    Edit,
} from 'lucide-react';

type Submission = {
    id: number;
    mahasiswa: { id: number; nama: string; nim: string };
    content: string | null;
    file_path: string | null;
    file_name: string | null;
    status: string;
    grade: number | null;
    grade_letter: string | null;
    feedback: string | null;
    submitted_at: string;
    graded_at: string | null;
    is_late: boolean;
};

type Props = {
    tugas: { id: number; judul: string; deadline: string; max_grade: number };
    submissions: Submission[];
    stats: { total: number; graded: number; pending: number; avg_grade: number };
};

export default function DosenTugasGrading({ tugas, submissions, stats }: Props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showGradeDialog, setShowGradeDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showBulkGradeDialog, setShowBulkGradeDialog] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'grade'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkGrade, setBulkGrade] = useState({ grade: '', feedback: '' });

    useEffect(() => { setIsLoaded(true); }, []);

    // Filtered and sorted submissions
    const filteredSubmissions = useMemo(() => {
        let filtered = submissions.filter(s => {
            const matchSearch = s.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               s.mahasiswa.nim.includes(searchQuery);
            const matchStatus = filterStatus === 'all' ||
                              (filterStatus === 'graded' && s.status === 'graded') ||
                              (filterStatus === 'pending' && s.status !== 'graded') ||
                              (filterStatus === 'late' && s.is_late);
            return matchSearch && matchStatus;
        });

        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.mahasiswa.nama.localeCompare(b.mahasiswa.nama);
                    break;
                case 'date':
                    comparison = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
                    break;
                case 'grade':
                    comparison = (a.grade || 0) - (b.grade || 0);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [submissions, searchQuery, filterStatus, sortBy, sortOrder]);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSubmissions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSubmissions.map(s => s.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkGrade = () => {
        router.post(`/dosen/tugas/${tugas.id}/bulk-grade`, {
            submission_ids: selectedIds,
            grade: parseFloat(bulkGrade.grade),
            feedback: bulkGrade.feedback,
        }, {
            onSuccess: () => {
                setShowBulkGradeDialog(false);
                setSelectedIds([]);
                setBulkGrade({ grade: '', feedback: '' });
            },
        });
    };

    const openGradeDialog = (submission: Submission) => {
        setSelectedSubmission(submission);
        setGradeForm({
            grade: submission.grade?.toString() || '',
            feedback: submission.feedback || '',
        });
        setShowGradeDialog(true);
    };

    const openDetailDialog = (submission: Submission) => {
        setSelectedSubmission(submission);
        setShowDetailDialog(true);
    };

    const handleGrade = () => {
        if (!selectedSubmission) return;
        router.patch(`/dosen/tugas/submission/${selectedSubmission.id}/grade`, {
            grade: parseFloat(gradeForm.grade),
            feedback: gradeForm.feedback,
        }, {
            onSuccess: () => {
                setShowGradeDialog(false);
                setSelectedSubmission(null);
            },
        });
    };

    const getStatusBadge = (status: string, isLate: boolean) => {
        if (status === 'graded') {
            return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">✓ Dinilai</Badge>;
        }
        if (isLate) {
            return <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white">⚠️ Terlambat</Badge>;
        }
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">⏳ Menunggu</Badge>;
    };

    const getGradeBadge = (grade: number | null, letter: string | null) => {
        if (grade === null) return null;
        const colors: Record<string, string> = {
            'A': 'from-emerald-500 to-green-500',
            'B': 'from-blue-500 to-indigo-500',
            'C': 'from-amber-500 to-yellow-500',
            'D': 'from-orange-500 to-red-400',
            'E': 'from-red-500 to-rose-600',
        };
        const color = colors[letter || 'E'] || colors['E'];
        return (
            <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${color} text-white shadow-lg`}>
                    {grade.toFixed(1)}
                </span>
                {letter && (
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-gradient-to-r ${color} text-white shadow-lg`}>
                        {letter}
                    </span>
                )}
            </div>
        );
    };

    return (
        <DosenLayout>
            <Head title={`Penilaian - ${tugas.judul}`} />
            <div className="space-y-6 p-6">
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
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)}
                            className="mb-6 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Tugas
                        </motion.button>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
                                >
                                    <Award className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-gray-400"
                                    >
                                        Penilaian Tugas
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        {tugas.judul}
                                    </motion.h1>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedIds.length > 0 && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            onClick={() => setShowBulkGradeDialog(true)}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30"
                                        >
                                            <CheckSquare className="h-4 w-4 mr-2" />
                                            Nilai {selectedIds.length} Terpilih
                                        </Button>
                                    </motion.div>
                                )}
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur">
                                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-gray-400"
                        >
                            Deadline: {tugas.deadline} • Max Grade: {tugas.max_grade}
                        </motion.p>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-4 gap-4"
                >
                    {[
                        { icon: FileText, label: 'Total Submission', value: stats.total, color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
                        { icon: CheckCircle, label: 'Sudah Dinilai', value: stats.graded, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
                        { icon: Clock, label: 'Menunggu Nilai', value: stats.pending, color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
                        { icon: TrendingUp, label: 'Rata-rata Nilai', value: stats.avg_grade.toFixed(1), color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 * i }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-2xl border-2 border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                                >
                                    <stat.icon className="h-7 w-7 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
                            <p className="text-xs text-gray-500">Temukan submission dengan mudah</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
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

                        {/* Filter Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="graded">Sudah Dinilai</SelectItem>
                                    <SelectItem value="pending">Menunggu</SelectItem>
                                    <SelectItem value="late">Terlambat</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    <SelectItem value="date">Tanggal Submit</SelectItem>
                                    <SelectItem value="name">Nama</SelectItem>
                                    <SelectItem value="grade">Nilai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Sort Order Toggle & Results Counter */}
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
                                Menampilkan {filteredSubmissions.length} dari {submissions.length} submission
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedIds([])}
                                    className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-sm font-medium text-red-600 transition-colors"
                                >
                                    <X className="h-4 w-4 inline mr-1" />
                                    Clear ({selectedIds.length})
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterStatus('all');
                                    setSortBy('date');
                                    setSortOrder('desc');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                            >
                                Reset Filter
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Submissions List */}
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
                                    <h2 className="font-semibold text-gray-900 dark:text-white">Daftar Submission</h2>
                                    <p className="text-sm text-gray-500">{filteredSubmissions.length} submission</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                                >
                                    <Mail className="h-4 w-4" />
                                    Email
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </motion.button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                                    <th className="px-4 py-4 text-left">
                                        <Checkbox
                                            checked={selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Mahasiswa</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Waktu Submit</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nilai</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                            >
                                                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                <p className="text-gray-500">Tidak ada submission yang sesuai dengan filter</p>
                                            </motion.div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubmissions.map((submission, index) => (
                                        <motion.tr
                                            key={submission.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.03 }}
                                            whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-4">
                                                <Checkbox
                                                    checked={selectedIds.includes(submission.id)}
                                                    onCheckedChange={() => toggleSelect(submission.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg">
                                                        {submission.mahasiswa.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{submission.mahasiswa.nama}</p>
                                                        <p className="text-xs font-mono text-gray-500">{submission.mahasiswa.nim}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-4 w-4" />
                                                    {submission.submitted_at}
                                                </div>
                                                {submission.is_late && (
                                                    <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Terlambat
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(submission.status, submission.is_late)}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getGradeBadge(submission.grade, submission.grade_letter) || (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => openDetailDialog(submission)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                                                    >
                                                        <Eye className="h-3 w-3" /> Lihat
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => openGradeDialog(submission)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
                                                    >
                                                        <Award className="h-3 w-3" /> Nilai
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Grade Dialog */}
                <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-6 -m-6 mb-4">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"
                                />
                                <div className="relative">
                                    <DialogTitle className="text-2xl text-white flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                        >
                                            <Award className="h-6 w-6" />
                                        </motion.div>
                                        <span>Beri Nilai</span>
                                    </DialogTitle>
                                    <p className="text-white/80 mt-2 ml-15">Berikan penilaian untuk submission mahasiswa</p>
                                </div>
                            </div>
                        </DialogHeader>
                        {selectedSubmission && (
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl shadow-lg">
                                            {selectedSubmission.mahasiswa.nama.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">{selectedSubmission.mahasiswa.nama}</p>
                                            <p className="text-sm font-mono text-gray-500">{selectedSubmission.mahasiswa.nim}</p>
                                        </div>
                                        {getStatusBadge(selectedSubmission.status, selectedSubmission.is_late)}
                                    </div>
                                    {selectedSubmission.is_late && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
                                        >
                                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                            <span className="font-medium">Submission terlambat - pertimbangkan pengurangan nilai</span>
                                        </motion.div>
                                    )}
                                </motion.div>

                                <div className="space-y-2">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                                            <Award className="h-4 w-4 text-white" />
                                        </div>
                                        Nilai (0-{tugas.max_grade})
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={tugas.max_grade}
                                        value={gradeForm.grade}
                                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                        className="text-3xl font-bold text-center border-2 h-16 focus:ring-4 focus:ring-emerald-500/20"
                                        placeholder="0"
                                    />
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Minimum: 0</span>
                                        <span>Maximum: {tugas.max_grade}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                                            <MessageSquare className="h-4 w-4 text-white" />
                                        </div>
                                        Feedback (Opsional)
                                    </Label>
                                    <Textarea
                                        value={gradeForm.feedback}
                                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                        placeholder="Berikan feedback konstruktif untuk mahasiswa..."
                                        rows={5}
                                        className="border-2 focus:ring-4 focus:ring-blue-500/20 resize-none"
                                    />
                                    <p className="text-xs text-gray-500">Feedback akan membantu mahasiswa memahami penilaian Anda</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                        <Button
                                            onClick={handleGrade}
                                            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base font-semibold shadow-lg shadow-emerald-500/30"
                                            disabled={!gradeForm.grade}
                                        >
                                            <Save className="h-5 w-5 mr-2" /> Simpan Nilai
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowGradeDialog(false)}
                                            className="h-12 px-6 border-2"
                                        >
                                            Batal
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Detail Dialog */}
                <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 p-6 -m-6 mb-4">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"
                                />
                                <div className="relative">
                                    <DialogTitle className="text-2xl text-white flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                        >
                                            <FileText className="h-6 w-6" />
                                        </motion.div>
                                        <span>Detail Submission</span>
                                    </DialogTitle>
                                    <p className="text-white/80 mt-2 ml-15">Informasi lengkap submission mahasiswa</p>
                                </div>
                            </div>
                        </DialogHeader>
                        {selectedSubmission && (
                            <div className="space-y-5 overflow-y-auto pr-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-bold text-2xl shadow-lg">
                                                {selectedSubmission.mahasiswa.nama.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">{selectedSubmission.mahasiswa.nama}</p>
                                                <p className="text-sm font-mono text-gray-500">{selectedSubmission.mahasiswa.nim}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(selectedSubmission.status, selectedSubmission.is_late)}
                                    </div>
                                </motion.div>

                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <p className="text-blue-600 dark:text-blue-400 font-semibold">Waktu Submit</p>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedSubmission.submitted_at}</p>
                                    </motion.div>
                                    {selectedSubmission.graded_at && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Waktu Dinilai</p>
                                            </div>
                                            <p className="text-gray-900 dark:text-white font-medium">{selectedSubmission.graded_at}</p>
                                        </motion.div>
                                    )}
                                </div>

                                {selectedSubmission.content && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                                                <FileText className="h-4 w-4 text-white" />
                                            </div>
                                            Jawaban Mahasiswa
                                        </Label>
                                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                            {selectedSubmission.content}
                                        </div>
                                    </motion.div>
                                )}

                                {selectedSubmission.file_path && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                                <Download className="h-4 w-4 text-white" />
                                            </div>
                                            File Lampiran
                                        </Label>
                                        <motion.a
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            href={selectedSubmission.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 transition-all"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                                <Download className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{selectedSubmission.file_name || 'Download File'}</p>
                                                <p className="text-xs text-gray-500">Klik untuk download</p>
                                            </div>
                                        </motion.a>
                                    </motion.div>
                                )}

                                {selectedSubmission.grade !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Award className="h-5 w-5 text-emerald-600" />
                                                Nilai
                                            </span>
                                            {getGradeBadge(selectedSubmission.grade, selectedSubmission.grade_letter)}
                                        </div>
                                        {selectedSubmission.feedback && (
                                            <div className="mt-4 pt-4 border-t-2 border-emerald-200 dark:border-emerald-800">
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                                    <MessageSquare className="h-4 w-4" /> Feedback Dosen
                                                </p>
                                                <p className="text-gray-900 dark:text-white">{selectedSubmission.feedback}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        onClick={() => {
                                            setShowDetailDialog(false);
                                            openGradeDialog(selectedSubmission);
                                        }}
                                        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-base font-semibold shadow-lg shadow-indigo-500/30"
                                    >
                                        <Award className="h-5 w-5 mr-2" /> {selectedSubmission.grade !== null ? 'Edit Nilai' : 'Beri Nilai'}
                                    </Button>
                                </motion.div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Bulk Grade Dialog */}
                <Dialog open={showBulkGradeDialog} onOpenChange={setShowBulkGradeDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-emerald-600" /> Nilai Massal
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                    Anda akan memberi nilai untuk <span className="font-bold">{selectedIds.length} submission</span> sekaligus
                                </p>
                            </div>
                            <div>
                                <Label>Nilai (0-100)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={bulkGrade.grade}
                                    onChange={(e) => setBulkGrade({ ...bulkGrade, grade: e.target.value })}
                                    className="text-2xl font-bold text-center border-2"
                                />
                            </div>
                            <div>
                                <Label>Feedback (Opsional)</Label>
                                <Textarea
                                    value={bulkGrade.feedback}
                                    onChange={(e) => setBulkGrade({ ...bulkGrade, feedback: e.target.value })}
                                    placeholder="Berikan feedback untuk semua mahasiswa..."
                                    rows={4}
                                    className="border-2"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleBulkGrade}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                    disabled={!bulkGrade.grade}
                                >
                                    <Save className="h-4 w-4 mr-2" /> Simpan Semua
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowBulkGradeDialog(false)}
                                >
                                    Batal
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DosenLayout>
    );
}
