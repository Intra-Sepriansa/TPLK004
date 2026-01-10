import { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceStats } from '@/components/ui/attendance-stats';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PDFGenerator } from '@/components/export/pdf-generator';
import {
    Search,
    Filter,
    Calendar as CalendarIcon,
    List,
    MapPin,
    Clock,
    Camera,
    ChevronRight,
    X,
    Flame,
    Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
    id: number;
    date: string;
    course: string;
    courseId: number;
    meetingNumber: number;
    status: 'present' | 'absent' | 'late' | 'pending';
    checkInTime: string | null;
    distance: number | null;
    selfieUrl: string | null;
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
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    absent: { label: 'Tidak Hadir', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    pending: { label: 'Pending', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
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

    // Filter records
    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            // Search
            if (searchQuery && !record.course.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Status filter
            if (statusFilter !== 'all' && record.status !== statusFilter) {
                return false;
            }
            // Course filter
            if (courseFilter !== 'all' && record.courseId.toString() !== courseFilter) {
                return false;
            }
            // Date filter
            if (selectedDate) {
                const recordDate = new Date(record.date);
                if (
                    recordDate.getDate() !== selectedDate.getDate() ||
                    recordDate.getMonth() !== selectedDate.getMonth() ||
                    recordDate.getFullYear() !== selectedDate.getFullYear()
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [records, searchQuery, statusFilter, courseFilter, selectedDate]);

    // Calendar marked dates
    const markedDates = useMemo(() => {
        return records.map(r => ({
            date: new Date(r.date),
            status: r.status,
        }));
    }, [records]);

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCourseFilter('all');
        setSelectedDate(undefined);
    };

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || courseFilter !== 'all' || selectedDate;

    return (
        <StudentLayout>
            <Head title="Riwayat Kehadiran" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Riwayat
                        </p>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Kehadiran Saya
                        </h1>
                    </div>
                    <PDFGenerator
                        student={mahasiswa}
                        records={filteredRecords}
                        stats={stats}
                    />
                </div>

                {/* Stats Overview */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <AttendanceStats
                                present={stats.present}
                                absent={stats.absent}
                                late={stats.late}
                                pending={stats.pending}
                                total={stats.total}
                            />
                        </div>
                    </div>

                    {/* Streak Card */}
                    <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Flame className="h-6 w-6" />
                            <span className="font-semibold">Streak Kehadiran</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-bold">{stats.streak}</span>
                            <span className="text-orange-100 mb-1">hari</span>
                        </div>
                        <p className="text-sm text-orange-100 mt-2">
                            Streak terbaik: {stats.longestStreak} hari
                        </p>
                        <div className="mt-4 flex gap-2">
                            <AchievementBadge
                                type="streak"
                                value={stats.streak}
                                size="sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters & View Toggle */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari mata kuliah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                        >
                            <option value="all">Semua Status</option>
                            <option value="present">Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="absent">Tidak Hadir</option>
                            <option value="pending">Pending</option>
                        </select>

                        {/* Course Filter */}
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                        >
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Reset
                            </Button>
                        )}

                        {/* View Toggle */}
                        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                            <button
                                onClick={() => setView('list')}
                                className={cn(
                                    'px-3 py-1.5 rounded-md text-sm transition-colors',
                                    view === 'list'
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setView('calendar')}
                                className={cn(
                                    'px-3 py-1.5 rounded-md text-sm transition-colors',
                                    view === 'calendar'
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
                                )}
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-500">Filter aktif:</span>
                            {searchQuery && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    "{searchQuery}"
                                </span>
                            )}
                            {statusFilter !== 'all' && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                                </span>
                            )}
                            {selectedDate && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    {selectedDate.toLocaleDateString('id-ID')}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                    {/* Calendar Sidebar */}
                    {view === 'calendar' && (
                        <div>
                            <Calendar
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                markedDates={markedDates}
                            />
                            {selectedDate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => setSelectedDate(undefined)}
                                >
                                    Tampilkan semua tanggal
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Records List */}
                    <div className={cn(view === 'list' && 'lg:col-span-2')}>
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Daftar Kehadiran
                                    </h2>
                                    <span className="text-sm text-slate-500">
                                        {filteredRecords.length} dari {records.length}
                                    </span>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                                {filteredRecords.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <CalendarIcon className="h-12 w-12 mx-auto text-slate-300" />
                                        <p className="mt-3 text-slate-500">
                                            Tidak ada data kehadiran
                                        </p>
                                    </div>
                                ) : (
                                    filteredRecords.map(record => (
                                        <button
                                            key={record.id}
                                            onClick={() => setSelectedRecord(record)}
                                            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-left"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                                    {record.course}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Pertemuan {record.meetingNumber} •{' '}
                                                    {new Date(record.date).toLocaleDateString('id-ID', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </p>
                                                {record.checkInTime && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        <Clock className="h-3 w-3 inline mr-1" />
                                                        {record.checkInTime}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={cn(
                                                'px-3 py-1 rounded-full text-xs font-medium shrink-0',
                                                statusConfig[record.status].color
                                            )}>
                                                {statusConfig[record.status].label}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRecord && (
                <RecordDetailModal
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </StudentLayout>
    );
}

function RecordDetailModal({
    record,
    onClose,
}: {
    record: AttendanceRecord;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <X className="h-5 w-5 text-slate-500" />
                </button>

                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <span className={cn(
                            'inline-block px-3 py-1 rounded-full text-xs font-medium mb-3',
                            statusConfig[record.status].color
                        )}>
                            {statusConfig[record.status].label}
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {record.course}
                        </h2>
                        <p className="text-slate-500">
                            Pertemuan {record.meetingNumber}
                        </p>
                    </div>

                    {/* Selfie */}
                    {record.selfieUrl && (
                        <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img
                                src={record.selfieUrl}
                                alt="Selfie"
                                className="w-full h-48 object-cover"
                            />
                        </div>
                    )}

                    {/* Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                            <CalendarIcon className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Tanggal</p>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {new Date(record.date).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {record.checkInTime && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <Clock className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Waktu Check-in</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {record.checkInTime}
                                    </p>
                                </div>
                            </div>
                        )}

                        {record.distance !== null && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <MapPin className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Jarak dari Lokasi</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {Math.round(record.distance)} meter
                                    </p>
                                </div>
                            </div>
                        )}

                        {record.note && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Catatan</p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    {record.note}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
