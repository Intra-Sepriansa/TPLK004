import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
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
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <FileBarChart className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Laporan Lengkap</p>
                                <h1 className="text-2xl font-bold">Rekap Kehadiran</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">
                            Analisis kehadiran mahasiswa secara komprehensif
                        </p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mata Kuliah</label>
                            <select
                                value={courseId}
                                onChange={e => setCourseId(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="all">Semua Mata Kuliah</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.nama}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="all">Semua Status</option>
                                <option value="present">Hadir</option>
                                <option value="late">Terlambat</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleFilter}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Filter
                            </button>
                            <button
                                onClick={handleExportPdf}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Hadir</p>
                                <p className="text-lg font-bold text-emerald-600">{stats.present}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Terlambat</p>
                                <p className="text-lg font-bold text-amber-600">{stats.late}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                <XCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Ditolak</p>
                                <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Sesi</p>
                                <p className="text-lg font-bold text-purple-600">{stats.total_sessions}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Mahasiswa</p>
                                <p className="text-lg font-bold text-indigo-600">{stats.unique_students}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Rata-rata</p>
                                <p className="text-lg font-bold text-cyan-600">{stats.avg_per_session}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Rate</p>
                                <p className="text-lg font-bold text-teal-600">{stats.attendance_rate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Trend Chart */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Tren Kehadiran Harian</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="Hadir" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="Terlambat" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="Ditolak" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Hourly Distribution */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi Per Jam</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Course Summary & Top/Low Attendance */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Course Summary */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Ringkasan Per Mata Kuliah</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-80">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mata Kuliah</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Sesi</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Hadir</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Terlambat</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {courseSummary.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Tidak ada data</td></tr>
                                    ) : (
                                        courseSummary.map(course => (
                                            <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{course.nama}</p>
                                                    <p className="text-xs text-slate-500">{course.dosen}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm text-slate-600">{course.total_sessions}</td>
                                                <td className="px-4 py-3 text-center text-sm text-emerald-600 font-medium">{course.present}</td>
                                                <td className="px-4 py-3 text-center text-sm text-amber-600 font-medium">{course.late}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                                        course.rate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                        course.rate >= 60 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {course.rate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top & Low Attendance */}
                    <div className="space-y-6">
                        {/* Top Attendees */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-emerald-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Top Kehadiran</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {topAttendees.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">Tidak ada data</div>
                                ) : (
                                    topAttendees.map((student, i) => (
                                        <div key={student.id} className="p-3 flex items-center gap-3">
                                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                i === 1 ? 'bg-slate-200 text-slate-700' :
                                                i === 2 ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{student.nama}</p>
                                                <p className="text-xs text-slate-500">{student.nim}</p>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-600">{student.total_attendance}x</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Low Attendance */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran Rendah</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {lowAttendance.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">Tidak ada data</div>
                                ) : (
                                    lowAttendance.map(student => (
                                        <div key={student.id} className="p-3 flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{student.nama}</p>
                                                <p className="text-xs text-slate-500">{student.nim}</p>
                                            </div>
                                            <span className="text-sm font-bold text-red-600">{student.rate}%</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Logs Table */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Detail Kehadiran</h2>
                            </div>
                            <span className="text-sm text-slate-500">
                                Halaman {attendanceLogs.current_page} dari {attendanceLogs.last_page}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mata Kuliah</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pertemuan</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Selfie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {attendanceLogs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                            <p className="text-slate-500">Tidak ada data kehadiran</p>
                                        </td>
                                    </tr>
                                ) : (
                                    attendanceLogs.data.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                                                {log.scanned_at}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.mahasiswa ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{log.mahasiswa.nama}</p>
                                                        <p className="text-xs text-slate-500">{log.mahasiswa.nim}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {log.session?.course?.nama || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {log.session?.meeting_number ? `Pertemuan ${log.session.meeting_number}` : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(log.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.selfie_verification ? (
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                        log.selfie_verification.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        log.selfie_verification.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {log.selfie_verification.status === 'approved' ? 'Verified' :
                                                         log.selfie_verification.status === 'pending' ? 'Pending' : 'Rejected'}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {attendanceLogs.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {attendanceLogs.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            : 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-slate-900'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
