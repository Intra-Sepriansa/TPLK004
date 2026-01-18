import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Clock, AlertTriangle, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface Props {
    dosen: { id: number; nama: string };
    courses: Array<{ id: number; nama: string; sks: number }>;
    selectedCourseId: number | null;
    insights: {
        course: { id: number; nama: string; sks: number };
        summary: { total_sessions: number; total_students: number; average_attendance: number; students_at_risk: number };
        byMeeting: Array<{ meeting: number; title: string; date: string; total: number; present: number; late: number; absent: number; rate: number }>;
        frequentlyLate: Array<{ id: number; nama: string; nim: string; late_count: number; late_percentage: number }>;
        atRisk: Array<{ id: number; nama: string; nim: string; absent_count: number; can_take_uas: boolean }>;
        topPerformers: Array<{ id: number; nama: string; nim: string; attended: number; rate: number; on_time_rate: number }>;
    } | null;
    comparison: Array<{ id: number; nama: string; sks: number; total_sessions: number; attendance_rate: number }>;
}

export default function ClassInsights({ dosen, courses, selectedCourseId, insights, comparison }: Props) {
    const handleCourseChange = (courseId: string) => {
        router.get('/dosen/class-insights', { course_id: courseId }, { preserveState: true });
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Class Insights" />
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
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg"
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
                                    <BarChart3 className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100">Analisis</p>
                                    <h1 className="text-2xl font-bold">Class Insights</h1>
                                </div>
                            </div>
                            <Select value={String(selectedCourseId || '')} onValueChange={handleCourseChange}>
                                <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white">
                                    <SelectValue placeholder="Pilih Mata Kuliah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="mt-4 text-indigo-100">Analisis kehadiran per kelas</p>
                    </div>
                </motion.div>

                {/* Course Comparison */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900 overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">Perbandingan Mata Kuliah</h2>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        {comparison.map((c, idx) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                whileHover={{ x: 5, scale: 1.02 }}
                                className="flex items-center gap-4"
                            >
                                <motion.span
                                    whileHover={{ rotate: 360, scale: 1.2 }}
                                    transition={{ duration: 0.5 }}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {idx + 1}
                                </motion.span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{c.nama}</span>
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.1 + 0.3 }}
                                            className="text-sm text-gray-600"
                                        >
                                            <AnimatedCounter value={c.attendance_rate} duration={1500} />%
                                        </motion.span>
                                    </div>
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 + 0.2 }}
                                        style={{ transformOrigin: 'left' }}
                                    >
                                        <Progress value={c.attendance_rate} className="h-2" />
                                    </motion.div>
                                </div>
                                <motion.span
                                    whileHover={{ scale: 1.1 }}
                                    className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                >
                                    {c.total_sessions} sesi
                                </motion.span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {!selectedCourseId && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900 py-12 text-center"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        </motion.div>
                        <p className="text-gray-500">Pilih mata kuliah untuk melihat insights detail</p>
                    </motion.div>
                )}

                {insights && (
                    <>
                        {/* Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: 10 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30"
                                    >
                                        <Clock className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Sesi</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            <AnimatedCounter value={insights.summary.total_sessions} duration={1500} />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900"
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
                                        <p className="text-xl font-bold text-blue-600">
                                            <AnimatedCounter value={insights.summary.total_students} duration={1500} />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900"
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
                                            <AnimatedCounter value={insights.summary.average_attendance} duration={1500} />%
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.25 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: 10 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30"
                                    >
                                        <AlertTriangle className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs text-gray-500">Berisiko</p>
                                        <p className="text-xl font-bold text-red-600">
                                            <AnimatedCounter value={insights.summary.students_at_risk} duration={1500} />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Attendance by Meeting */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-indigo-600" />
                                    <h2 className="font-semibold text-gray-900 dark:text-white">Kehadiran per Pertemuan</h2>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {insights.byMeeting.map((m, idx) => (
                                    <motion.div
                                        key={m.meeting}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{m.title}</span>
                                                <span className="text-sm text-gray-500 ml-2">{m.date}</span>
                                            </div>
                                            <motion.span
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${m.rate >= 80 ? 'bg-emerald-100 text-emerald-700' : m.rate >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                <AnimatedCounter value={m.rate} duration={1000} />%
                                            </motion.span>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 + 0.2 }}
                                            className="flex gap-2 text-xs"
                                        >
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className="px-2 py-0.5 bg-green-100 text-green-700 rounded dark:bg-green-900/30"
                                            >
                                                Hadir: {m.present}
                                            </motion.span>
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded dark:bg-yellow-900/30"
                                            >
                                                Terlambat: {m.late}
                                            </motion.span>
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className="px-2 py-0.5 bg-red-100 text-red-700 rounded dark:bg-red-900/30"
                                            >
                                                Absen: {m.absent}
                                            </motion.span>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Student Lists Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="grid lg:grid-cols-3 gap-6"
                        >
                            {/* Top Performers */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900 overflow-hidden"
                            >
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <motion.div whileHover={{ rotate: 10 }}>
                                            <Award className="h-5 w-5 text-yellow-500" />
                                        </motion.div>
                                        <h2 className="font-semibold text-gray-900 dark:text-white">Top Performers</h2>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {insights.topPerformers.map((s, idx) => (
                                        <motion.div
                                            key={s.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                                            whileHover={{ x: 5, scale: 1.02 }}
                                            className="flex items-center gap-3"
                                        >
                                            <motion.span
                                                whileHover={{ rotate: 360, scale: 1.2 }}
                                                transition={{ duration: 0.5 }}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {idx + 1}
                                            </motion.span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.nama}</p>
                                                <p className="text-xs text-gray-500">{s.nim}</p>
                                            </div>
                                            <div className="text-right">
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: idx * 0.1 + 0.3 }}
                                                    className="text-sm font-bold text-green-600"
                                                >
                                                    <AnimatedCounter value={s.rate} duration={1500} />%
                                                </motion.p>
                                                <p className="text-xs text-gray-500">{s.on_time_rate}% tepat waktu</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Frequently Late */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900 overflow-hidden"
                            >
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <motion.div whileHover={{ rotate: 10 }}>
                                            <Clock className="h-5 w-5 text-yellow-500" />
                                        </motion.div>
                                        <h2 className="font-semibold text-gray-900 dark:text-white">Sering Terlambat</h2>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {insights.frequentlyLate.length === 0 ? (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-gray-500 text-center py-4"
                                        >
                                            Tidak ada mahasiswa yang sering terlambat
                                        </motion.p>
                                    ) : (
                                        insights.frequentlyLate.map((s, idx) => (
                                            <motion.div
                                                key={s.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                                whileHover={{ x: 5, scale: 1.02 }}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.nama}</p>
                                                    <p className="text-xs text-gray-500">{s.nim}</p>
                                                </div>
                                                <motion.span
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                                                >
                                                    {s.late_count}x ({s.late_percentage}%)
                                                </motion.span>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            {/* At Risk Students */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900 overflow-hidden"
                            >
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <motion.div whileHover={{ rotate: 10 }}>
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                        </motion.div>
                                        <h2 className="font-semibold text-gray-900 dark:text-white">Mahasiswa Berisiko</h2>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {insights.atRisk.length === 0 ? (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-gray-500 text-center py-4"
                                        >
                                            Tidak ada mahasiswa berisiko
                                        </motion.p>
                                    ) : (
                                        insights.atRisk.map((s, idx) => (
                                            <motion.div
                                                key={s.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                                whileHover={{ x: 5, scale: 1.02 }}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.nama}</p>
                                                    <p className="text-xs text-gray-500">{s.nim}</p>
                                                </div>
                                                <div className="text-right">
                                                    <motion.span
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${s.can_take_uas ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}
                                                    >
                                                        {s.absent_count}x absen
                                                    </motion.span>
                                                    {!s.can_take_uas && (
                                                        <motion.p
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: idx * 0.1 + 0.2 }}
                                                            className="text-xs text-red-600 mt-1"
                                                        >
                                                            Tidak bisa UAS
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </DosenLayout>
    );
}
