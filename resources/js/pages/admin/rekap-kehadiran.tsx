import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileBarChart,
    Download,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    TrendingUp,
    RefreshCw,
    Calendar,
    BookOpen,
    Award,
    AlertTriangle,
    BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    LineChart,
    Line,
} from 'recharts';

interface AttendanceLog {
    id: number;
    status: string;
    scanned_at: string;
    mahasiswa: { nama: string; nim: string; kelas?: string } | null;
    session: { meeting_number: number; course: { nama: string; dosen?: { nama: string } } } | null;
    selfie_verification?: { status: string } | null;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    rejected: number;
    total_sessions: number;
    unique_students: number;
    avg_per_session: number;
    attendance_rate: number;
}

interface DailyTrend {
    labels: string[];
    datasets: { label: string; data: number[]; color: string }[];
}

interface CourseSummary {
    id: number;
    nama: string;
    dosen: string;
    total_sessions: number;
    total_attendance: number;
    present: number;
    late: number;
    rate: number;
}

interface TopAttendee {
    id: number;
    nama: string;
    nim: string;
    total_attendance: number;
}

interface LowAttendance {
    id: number;
    nama: string;
    nim: string;
    attendance_count: number;
    rate: number;
}

interface HourlyDistribution {
    labels: string[];
    values: number[];
}

interface Course {
    id: number;
    nama: string;
    dosen?: { nama: string };
}

interface PageProps {
    attendanceLogs: {
        data: AttendanceLog[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    stats: Stats;
    dailyTrend: DailyTrend;
    courseSummary: CourseSummary[];
    topAttendees: TopAttendee[];
    lowAttendance: LowAttendance[];
    hourlyDistribution: HourlyDistribution;
    courses: Course[];
    filters: {
        date_from: string;
        date_to: string;
        course_id: string;
        status: string;
    };
}

export default function AdminRekapKehadiran({
    attendanceLogs,
    stats,
    dailyTrend,
    courseSummary,
    topAttendees,
    lowAttendance,
    hourlyDistribution,
    courses,
    filters,
}: PageProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);

    const handleFilter = () => {
        router.get('/admin/rekap-kehadiran', { date_from: dateFrom, date_to: dateTo, course_id: courseId, status }, { preserveState: true });
    };

    const handleExportPdf = () => {
        window.open(`/admin/rekap-kehadiran/pdf?date_from=${dateFrom}&date_to=${dateTo}&course_id=${courseId}`, '_blank');
    };

    // Prepare chart data
    const trendData = dailyTrend.labels.map((label, i) => ({
        name: label,
        Hadir: dailyTrend.datasets[0]?.data[i] || 0,
        Terlambat: dailyTrend.datasets[1]?.data[i] || 0,
        Ditolak: dailyTrend.datasets[2]?.data[i] || 0,
    }));

    const hourlyData = hourlyDistribution.labels.map((label, i) => ({
        name: label,
        total: hourlyDistribution.values[i],
    }));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle className="h-3 w-3" />Hadir</span>;
            case 'late':
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="h-3 w-3" />Terlambat</span>;
            case 'rejected':
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="h-3 w-3" />Ditolak</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    return (
        <AppLayout>
            <Head title="Rekap Kehadiran" />

            <div className="p-6 space-y-6">
                {/* Header dengan animasi masuk */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-2xl border border-slate-700/50"
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl"
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50"
                                >
                                    <FileBarChart className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-slate-400 font-medium"
                                    >
                                        Laporan Lengkap
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                                    >
                                        Rekap Kehadiran
                                    </motion.h1>
                                </div>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-slate-400"
                        >
                            Analisis kehadiran mahasiswa secara komprehensif
                        </motion.p>
                    </div>
                </motion.div>

                {/* Filter Section dengan background hitam */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl bg-gradient-to-br from-slate-900 to-black p-6 shadow-xl border border-slate-800/50"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="font-semibold text-white text-lg">Filter Data</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Mata Kuliah</label>
                            <select
                                value={courseId}
                                onChange={e => setCourseId(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="all">Semua Mata Kuliah</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.nama}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="all">Semua Status</option>
                                <option value="present">Hadir</option>
                                <option value="late">Terlambat</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFilter}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Filter
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExportPdf}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-slate-600 hover:to-slate-800 transition-all"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards dengan animasi dock-style */}
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
                    {[
                        { icon: Users, label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-600', delay: 0.1 },
                        { icon: CheckCircle, label: 'Hadir', value: stats.present, color: 'from-emerald-500 to-green-600', delay: 0.15 },
                        { icon: Clock, label: 'Terlambat', value: stats.late, color: 'from-amber-500 to-orange-600', delay: 0.2 },
                        { icon: XCircle, label: 'Ditolak', value: stats.rejected, color: 'from-red-500 to-rose-600', delay: 0.25 },
                        { icon: Calendar, label: 'Sesi', value: stats.total_sessions, color: 'from-purple-500 to-violet-600', delay: 0.3 },
                        { icon: Users, label: 'Mahasiswa', value: stats.unique_students, color: 'from-indigo-500 to-blue-600', delay: 0.35 },
                        { icon: BarChart3, label: 'Rata-rata', value: stats.avg_per_session, color: 'from-cyan-500 to-teal-600', delay: 0.4 },
                        { icon: TrendingUp, label: 'Rate', value: `${stats.attendance_rate}%`, color: 'from-teal-500 to-emerald-600', delay: 0.45 },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-black p-4 shadow-xl border border-slate-800/50 cursor-pointer"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                                >
                                    <stat.icon className="h-5 w-5 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: stat.delay + 0.1, type: "spring" }}
                                        className="text-lg font-bold text-white"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                            </div>
                            
                            {/* Animated border */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                                initial={{ width: "0%", opacity: 0 }}
                                whileHover={{ width: "100%", opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row dengan background hitam */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl bg-gradient-to-br from-slate-900 to-black p-6 shadow-xl border border-slate-800/50"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="font-semibold text-white text-lg">Tren Kehadiran Harian</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                    <Area type="monotone" dataKey="Hadir" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="Terlambat" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="Ditolak" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Hourly Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-2xl bg-gradient-to-br from-slate-900 to-black p-6 shadow-xl border border-slate-800/50"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="font-semibold text-white text-lg">Distribusi Per Jam</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#475569" />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Course Summary & Top/Low Attendance dengan background hitam */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Course Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-xl border border-slate-800/50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="font-semibold text-white text-lg">Ringkasan Per Mata Kuliah</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-80">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-slate-800/50 backdrop-blur">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Mata Kuliah</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Sesi</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Hadir</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Terlambat</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {courseSummary.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Tidak ada data</td></tr>
                                    ) : (
                                        courseSummary.map((course, index) => (
                                            <motion.tr
                                                key={course.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.8 + index * 0.05 }}
                                                whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
                                                className="transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-white">{course.nama}</p>
                                                    <p className="text-xs text-slate-400">{course.dosen}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm text-slate-300">{course.total_sessions}</td>
                                                <td className="px-4 py-3 text-center text-sm text-emerald-400 font-medium">{course.present}</td>
                                                <td className="px-4 py-3 text-center text-sm text-amber-400 font-medium">{course.late}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                                        course.rate >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                                        course.rate >= 60 ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {course.rate}%
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Top & Low Attendance */}
                    <div className="space-y-6">
                        {/* Top Attendees */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-xl border border-slate-800/50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
                                        <Award className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="font-semibold text-white">Top Kehadiran</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {topAttendees.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">Tidak ada data</div>
                                ) : (
                                    topAttendees.map((student, i) => (
                                        <motion.div
                                            key={student.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.9 + i * 0.05 }}
                                            whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.5)", x: 5 }}
                                            className="p-3 flex items-center gap-3 transition-all cursor-pointer"
                                        >
                                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                i === 1 ? 'bg-slate-500/20 text-slate-400' :
                                                i === 2 ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-slate-700/50 text-slate-400'
                                            }`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{student.nama}</p>
                                                <p className="text-xs text-slate-400">{student.nim}</p>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-400">{student.total_attendance}x</span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Low Attendance */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-xl border border-slate-800/50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
                                        <AlertTriangle className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="font-semibold text-white">Kehadiran Rendah</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {lowAttendance.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">Tidak ada data</div>
                                ) : (
                                    lowAttendance.map((student, index) => (
                                        <motion.div
                                            key={student.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.0 + index * 0.05 }}
                                            whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.5)", x: 5 }}
                                            className="p-3 flex items-center gap-3 transition-all cursor-pointer"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{student.nama}</p>
                                                <p className="text-xs text-slate-400">{student.nim}</p>
                                            </div>
                                            <span className="text-sm font-bold text-red-400">{student.rate}%</span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Attendance Logs Table dengan background hitam */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-xl border border-slate-800/50 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="font-semibold text-white text-lg">Detail Kehadiran</h2>
                            </div>
                            <span className="text-sm text-slate-400">
                                Halaman {attendanceLogs.current_page} dari {attendanceLogs.last_page}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-800/50 backdrop-blur">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Mata Kuliah</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Pertemuan</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Selfie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {attendanceLogs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <Users className="h-10 w-10 mx-auto text-slate-700 mb-2" />
                                            <p className="text-slate-500">Tidak ada data kehadiran</p>
                                        </td>
                                    </tr>
                                ) : (
                                    attendanceLogs.data.map((log, index) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.1 + index * 0.03 }}
                                            whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
                                            className="transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                                                {log.scanned_at}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.mahasiswa ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{log.mahasiswa.nama}</p>
                                                        <p className="text-xs text-slate-400">{log.mahasiswa.nim}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-300">
                                                {log.session?.course?.nama || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-300">
                                                {log.session?.meeting_number ? `Pertemuan ${log.session.meeting_number}` : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(log.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.selfie_verification ? (
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                        log.selfie_verification.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        log.selfie_verification.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {log.selfie_verification.status === 'approved' ? 'Verified' :
                                                         log.selfie_verification.status === 'pending' ? 'Pending' : 'Rejected'}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-500">-</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {attendanceLogs.last_page > 1 && (
                        <div className="p-4 border-t border-slate-800 flex justify-center gap-2">
                            {attendanceLogs.links.map((link, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: link.url ? 1.05 : 1 }}
                                    whileTap={{ scale: link.url ? 0.95 : 1 }}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                                        link.active
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                                            : link.url
                                            ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}
