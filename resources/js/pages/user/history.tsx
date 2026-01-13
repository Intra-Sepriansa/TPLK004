import { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceStats } from '@/components/ui/attendance-stats';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFGenerator } from '@/components/export/pdf-generator';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    Search,
    Calendar as CalendarIcon,
    List,
    MapPin,
    Clock,
    Camera,
    ChevronRight,
    X,
    Flame,
    BarChart3,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Image,
    BadgeCheck,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
    id: number;
    date: string;
    course: string;
    courseId: number;
    meetingNumber: number;
    status: 'present' | 'absent' | 'late' | 'pending' | 'rejected';
    checkInTime: string | null;
    distance: number | null;
    selfieUrl: string | null;
    selfieStatus?: 'approved' | 'pending' | 'rejected' | null;
    note: string | null;
    location?: { lat: number; lng: number };
}

interface Course {
    id: number;
    name: string;
}

interface PageProps {
    mahasiswa: { id: number; nama: string; nim: string };
    records: AttendanceRecord[];
    courses: Course[];
    stats: {
        present: number;
        absent: number;
        late: number;
        pending: number;
        total: number;
        streak: number;
        longestStreak: number;
    };
}

const statusConfig = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
    absent: { label: 'Tidak Hadir', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    pending: { label: 'Pending', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: AlertCircle },
};

const selfieStatusConfig = {
    approved: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: BadgeCheck },
    pending: { label: 'Menunggu', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
};

const CHART_COLORS = {
    present: '#10b981',
    late: '#f59e0b',
    absent: '#f43f5e',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <p className="font-medium text-slate-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function AttendanceHistory() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: '', nim: '' },
        records = [],
        courses = [],
        stats = { present: 0, absent: 0, late: 0, pending: 0, total: 0, streak: 0, longestStreak: 0 },
    } = props as unknown as PageProps;

    const [view, setView] = useState<'calendar' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [courseFilter, setCourseFilter] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            if (searchQuery && !record.course.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (statusFilter !== 'all' && record.status !== statusFilter) return false;
            if (courseFilter !== 'all' && record.courseId.toString() !== courseFilter) return false;
            if (selectedDate) {
                const recordDate = new Date(record.date);
                if (recordDate.getDate() !== selectedDate.getDate() ||
                    recordDate.getMonth() !== selectedDate.getMonth() ||
                    recordDate.getFullYear() !== selectedDate.getFullYear()) return false;
            }
            return true;
        });
    }, [records, searchQuery, statusFilter, courseFilter, selectedDate]);

    const markedDates = useMemo(() => records.map(r => ({ date: new Date(r.date), status: r.status })), [records]);

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCourseFilter('all');
        setSelectedDate(undefined);
    };

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || courseFilter !== 'all' || selectedDate;

    const courseChartData = useMemo(() => {
        const courseStats: Record<string, { present: number; late: number; absent: number }> = {};
        records.forEach(record => {
            if (!courseStats[record.course]) courseStats[record.course] = { present: 0, late: 0, absent: 0 };
            if (record.status === 'present') courseStats[record.course].present++;
            else if (record.status === 'late') courseStats[record.course].late++;
            else courseStats[record.course].absent++;
        });
        return Object.entries(courseStats).map(([course, data]) => ({
            name: course.length > 15 ? course.substring(0, 15) + '...' : course,
            Hadir: data.present,
            Terlambat: data.late,
            'Tidak Hadir': data.absent,
        }));
    }, [records]);

    const monthlyTrendData = useMemo(() => {
        const monthStats: Record<string, { present: number; late: number; absent: number }> = {};
        records.forEach(record => {
            const date = new Date(record.date);
            const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            if (!monthStats[monthKey]) monthStats[monthKey] = { present: 0, late: 0, absent: 0 };
            if (record.status === 'present') monthStats[monthKey].present++;
            else if (record.status === 'late') monthStats[monthKey].late++;
            else monthStats[monthKey].absent++;
        });
        return Object.entries(monthStats).slice(-6).map(([month, data]) => ({
            name: month,
            Hadir: data.present,
            Terlambat: data.late,
            'Tidak Hadir': data.absent,
        }));
    }, [records]);

    return (
        <StudentLayout>
            <Head title="Riwayat Kehadiran" />

            <div className="p-6 space-y-6">
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-sky-100">Riwayat Kehadiran</p>
                                <h1 className="text-2xl font-bold">{mahasiswa.nama}</h1>
                                <p className="text-sm text-sky-100">NIM: {mahasiswa.nim}</p>
                            </div>
                            <PDFGenerator student={mahasiswa} records={filteredRecords} stats={stats} />
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-sky-100">Total Record</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-sky-100">Hadir</p>
                                <p className="text-2xl font-bold">{stats.present}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-sky-100">Terlambat</p>
                                <p className="text-2xl font-bold">{stats.late}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-sky-100">Tidak Hadir</p>
                                <p className="text-2xl font-bold">{stats.absent}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Streak */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <AttendanceStats present={stats.present} absent={stats.absent} late={stats.late} pending={stats.pending} total={stats.total} />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Flame className="h-6 w-6" />
                            <span className="font-semibold">Streak Kehadiran</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-bold">{stats.streak}</span>
                            <span className="text-orange-100 mb-1">hari</span>
                        </div>
                        <p className="text-sm text-orange-100 mt-2">Streak terbaik: {stats.longestStreak} hari</p>
                        <div className="mt-4 flex gap-2">
                            <AchievementBadge type="streak" value={stats.streak} size="sm" />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {courseChartData.length > 0 && (
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran per Mata Kuliah</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={courseChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="Hadir" fill={CHART_COLORS.present} stackId="a" />
                                    <Bar dataKey="Terlambat" fill={CHART_COLORS.late} stackId="a" />
                                    <Bar dataKey="Tidak Hadir" fill={CHART_COLORS.absent} stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {monthlyTrendData.length > 0 && (
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Tren Kehadiran Bulanan</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={monthlyTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Hadir" stroke={CHART_COLORS.present} strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Terlambat" stroke={CHART_COLORS.late} strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Tidak Hadir" stroke={CHART_COLORS.absent} strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Cari mata kuliah..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <option value="all">Semua Status</option>
                            <option value="present">Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="absent">Tidak Hadir</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map(course => (<option key={course.id} value={course.id}>{course.name}</option>))}
                        </select>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-1" /> Reset
                            </Button>
                        )}
                        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                            <button onClick={() => setView('list')} className={cn('px-3 py-1.5 rounded-md text-sm transition-colors', view === 'list' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400')}>
                                <List className="h-4 w-4" />
                            </button>
                            <button onClick={() => setView('calendar')} className={cn('px-3 py-1.5 rounded-md text-sm transition-colors', view === 'calendar' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400')}>
                                <CalendarIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-500">Filter aktif:</span>
                            {searchQuery && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">"{searchQuery}"</span>}
                            {statusFilter !== 'all' && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">{statusConfig[statusFilter as keyof typeof statusConfig]?.label}</span>}
                            {selectedDate && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">{selectedDate.toLocaleDateString('id-ID')}</span>}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                    {view === 'calendar' && (
                        <div>
                            <Calendar selected={selectedDate} onSelect={setSelectedDate} markedDates={markedDates} />
                            {selectedDate && (
                                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setSelectedDate(undefined)}>
                                    Tampilkan semua tanggal
                                </Button>
                            )}
                        </div>
                    )}
                    <div className={cn(view === 'list' && 'lg:col-span-2')}>
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Kehadiran</h2>
                                    <span className="text-sm text-slate-500">{filteredRecords.length} dari {records.length}</span>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                                {filteredRecords.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <CalendarIcon className="h-12 w-12 mx-auto text-slate-300" />
                                        <p className="mt-3 text-slate-500">Tidak ada data kehadiran</p>
                                    </div>
                                ) : (
                                    filteredRecords.map(record => {
                                        const StatusIcon = statusConfig[record.status].icon;
                                        return (
                                            <button key={record.id} onClick={() => setSelectedRecord(record)} className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-left">
                                                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', statusConfig[record.status].color)}>
                                                    <StatusIcon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">{record.course}</p>
                                                    <p className="text-sm text-slate-500">
                                                        Pertemuan {record.meetingNumber} • {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                    </p>
                                                    {record.checkInTime && <p className="text-xs text-slate-400 mt-1"><Clock className="h-3 w-3 inline mr-1" />{record.checkInTime}</p>}
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusConfig[record.status].color)}>{statusConfig[record.status].label}</span>
                                                    {record.selfieUrl && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                                            <Camera className="h-3 w-3" /> Bukti
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedRecord && <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
        </StudentLayout>
    );
}

function RecordDetailModal({ record, onClose }: { record: AttendanceRecord; onClose: () => void }) {
    const StatusIcon = statusConfig[record.status].icon;
    const selfieStatus = record.selfieStatus ?? (record.selfieUrl ? 'pending' : null);
    const selfieConfig = selfieStatus ? selfieStatusConfig[selfieStatus] : null;
    const SelfieIcon = selfieConfig?.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="h-5 w-5 text-slate-500" />
                </button>

                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', statusConfig[record.status].color)}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig[record.status].label}
                            </span>
                            {selfieConfig && SelfieIcon && (
                                <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', selfieConfig.color)}>
                                    <SelfieIcon className="h-3 w-3" />
                                    {selfieConfig.label}
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{record.course}</h2>
                        <p className="text-slate-500">Pertemuan {record.meetingNumber}</p>
                    </div>

                    {/* Selfie / Bukti Masuk */}
                    <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {record.selfieUrl ? (
                            <div className="relative">
                                <img src={record.selfieUrl} alt="Bukti selfie" className="w-full h-56 object-cover" />
                                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                    {selfieConfig && SelfieIcon && (
                                        <span className={cn('inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur', selfieConfig.color)}>
                                            <SelfieIcon className="h-3.5 w-3.5" />
                                            {selfieConfig.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <Image className="h-10 w-10 mb-2" />
                                <span className="text-sm">Tidak ada bukti selfie</span>
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                            <CalendarIcon className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Tanggal</p>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        {record.checkInTime && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <Clock className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Waktu Check-in</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{record.checkInTime}</p>
                                </div>
                            </div>
                        )}
                        {record.distance !== null && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <MapPin className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Jarak dari Lokasi</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{Math.round(record.distance)} meter</p>
                                </div>
                            </div>
                        )}
                        {record.note && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Catatan</p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">{record.note}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="outline" className="flex-1" onClick={onClose}>Tutup</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
