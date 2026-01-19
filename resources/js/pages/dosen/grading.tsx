import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
    GraduationCap, Download, Users, Award, AlertTriangle, 
    CheckCircle, TrendingUp, X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';

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

    const overrideForm = useForm({ log_id: 0, status: '', reason: '' });

    const handleCourseChange = (courseId: string) => {
        router.get('/dosen/grading', { course_id: courseId }, { preserveState: true });
    };

    const handleExport = () => {
        if (selectedCourseId) {
            window.location.href = `/dosen/grading/export/${selectedCourseId}`;
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
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                >
                                    <GraduationCap className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-blue-100">Penilaian</p>
                                    <h1 className="text-2xl font-bold">Nilai Kehadiran</h1>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={String(selectedCourseId || '')} onValueChange={handleCourseChange}>
                                    <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white">
                                        <SelectValue placeholder="Pilih Mata Kuliah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {grades && (
                                    <Button variant="secondary" onClick={handleExport} className="bg-white/20 hover:bg-white/30 text-white border-0">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                )}
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">
                            Kalkulasi nilai kehadiran otomatis berdasarkan data presensi
                        </p>
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

                        {/* Grades Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-semibold text-gray-900 dark:text-white">Daftar Nilai</h2>
                                    <span className="text-sm text-gray-500 ml-2">{grades.course.nama} ({grades.course.sks} SKS)</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-black">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NIM</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Hadir</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Rate</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Poin</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Grade</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">UAS</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {grades.grades.map((g, idx) => (
                                            <motion.tr
                                                key={g.mahasiswa_id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            >
                                                <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{g.nim}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{g.nama}</td>
                                                <td className="px-4 py-3 text-center text-gray-600">{g.attended_sessions}/{g.total_sessions}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={g.attendance_rate} className="h-2 w-16" />
                                                        <span className="text-xs text-gray-600">{g.attendance_rate}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">{g.average_points}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <motion.span
                                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                                        className={`inline-block px-2 py-1 rounded text-white text-xs font-bold ${getGradeColor(g.grade_letter)}`}
                                                    >
                                                        {g.grade_letter}
                                                    </motion.span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {g.can_take_uas ? (
                                                        <motion.div whileHover={{ scale: 1.2 }}>
                                                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                                                            <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" />
                                                        </motion.div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setDetailModal({ open: true, student: g })}
                                                    >
                                                        Detail
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
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
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setDetailModal({ open: false, student: null })}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-black max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Detail Kehadiran</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setDetailModal({ open: false, student: null })}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.button>
                                </div>
                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{detailModal.student.nama}</p>
                                            <p className="text-sm text-gray-500">{detailModal.student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <motion.span
                                                whileHover={{ rotate: 10, scale: 1.1 }}
                                                className={`inline-block px-3 py-1 rounded text-white font-bold ${getGradeColor(detailModal.student.grade_letter)}`}
                                            >
                                                {detailModal.student.grade_letter}
                                            </motion.span>
                                            <p className="text-sm text-gray-500 mt-1">{detailModal.student.average_points} poin</p>
                                        </div>
                                    </motion.div>
                                    <div className="max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold text-gray-600">Pertemuan</th>
                                                    <th className="text-left p-3 font-semibold text-gray-600">Tanggal</th>
                                                    <th className="text-center p-3 font-semibold text-gray-600">Status</th>
                                                    <th className="text-center p-3 font-semibold text-gray-600">Poin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {detailModal.student.details.map((d, idx) => (
                                                    <motion.tr
                                                        key={d.meeting}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                    >
                                                        <td className="p-3 text-gray-900 dark:text-white">{d.title}</td>
                                                        <td className="p-3 text-gray-500">{d.date}</td>
                                                        <td className="p-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusColor(d.status)}`}>
                                                                {d.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center font-medium text-gray-900 dark:text-white">{d.points}</td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
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
