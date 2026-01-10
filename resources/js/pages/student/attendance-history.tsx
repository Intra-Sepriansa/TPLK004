import { Head, usePage } from '@inertiajs/react';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceStats } from '@/components/ui/attendance-stats';
import { AchievementBadge, AchievementList } from '@/components/ui/achievement-badge';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student-layout';
import { Download, Filter, CalendarDays, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface AttendanceRecord {
    id: number;
    date: string;
    course: string;
    status: 'present' | 'absent' | 'late' | 'pending';
    checkInTime: string | null;
    note: string | null;
}

interface PageProps {
    records: AttendanceRecord[];
    stats: {
        present: number;
        absent: number;
        late: number;
        pending: number;
        total: number;
        streak: number;
    };
    achievements: {
        type: 'streak' | 'perfect' | 'early' | 'consistent' | 'champion' | 'legend';
        value?: number;
        unlocked: boolean;
    }[];
}

export default function AttendanceHistory() {
    const { records = [], stats, achievements = [] } = usePage<{ props: PageProps }>().props as unknown as PageProps;
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Convert records to calendar marked dates
    const markedDates = records.map(record => ({
        date: new Date(record.date),
        status: record.status,
    }));

    // Filter records
    const filteredRecords = records.filter(record => {
        if (filterStatus !== 'all' && record.status !== filterStatus) return false;
        if (selectedDate) {
            const recordDate = new Date(record.date);
            return (
                recordDate.getDate() === selectedDate.getDate() &&
                recordDate.getMonth() === selectedDate.getMonth() &&
                recordDate.getFullYear() === selectedDate.getFullYear()
            );
        }
        return true;
    });

    const statusLabels = {
        present: 'Hadir',
        absent: 'Tidak Hadir',
        late: 'Terlambat',
        pending: 'Pending',
    };

    const statusColors = {
        present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        absent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        pending: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    };

    return (
        <StudentLayout>
            <Head title="Riwayat Kehadiran" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Riwayat
                        </p>
                        <h1 className="font-display text-2xl text-slate-900 dark:text-white">
                            Kehadiran Saya
                        </h1>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>

                {/* Stats & Achievements */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Stats Card */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Statistik Kehadiran
                            </h2>
                        </div>
                        <AttendanceStats
                            present={stats?.present || 0}
                            absent={stats?.absent || 0}
                            late={stats?.late || 0}
                            pending={stats?.pending || 0}
                            total={stats?.total || 0}
                        />
                    </div>

                    {/* Achievements */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Pencapaian
                            </h2>
                            {stats?.streak > 0 && (
                                <div className="flex items-center gap-2">
                                    <AchievementBadge type="streak" value={stats.streak} size="sm" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        {stats.streak} hari berturut-turut
                                    </span>
                                </div>
                            )}
                        </div>
                        <AchievementList
                            achievements={achievements.length > 0 ? achievements : [
                                { type: 'streak', value: stats?.streak || 0, unlocked: (stats?.streak || 0) >= 3 },
                                { type: 'perfect', unlocked: false },
                                { type: 'early', unlocked: false },
                                { type: 'consistent', unlocked: false },
                                { type: 'champion', unlocked: false },
                                { type: 'legend', unlocked: false },
                            ]}
                        />
                    </div>
                </div>

                {/* Calendar & Records */}
                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                    {/* Calendar */}
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
                                className="mt-2 w-full"
                                onClick={() => setSelectedDate(undefined)}
                            >
                                Tampilkan semua tanggal
                            </Button>
                        )}
                    </div>

                    {/* Records List */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-slate-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Daftar Kehadiran
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="text-sm border-none bg-transparent focus:ring-0"
                                >
                                    <option value="all">Semua</option>
                                    <option value="present">Hadir</option>
                                    <option value="late">Terlambat</option>
                                    <option value="absent">Tidak Hadir</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {filteredRecords.length === 0 ? (
                                <div className="text-center py-12">
                                    <CalendarDays className="h-12 w-12 mx-auto text-slate-300" />
                                    <p className="mt-2 text-sm text-slate-500">
                                        Tidak ada data kehadiran
                                    </p>
                                </div>
                            ) : (
                                filteredRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {record.course}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {new Date(record.date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                            {record.checkInTime && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Check-in: {record.checkInTime}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                                            {statusLabels[record.status]}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
