import { Button } from '@/components/ui/button';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    ChevronRight,
    Clock,
    Pause,
    Play,
    QrCode,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
}

interface Course {
    id: number;
    nama: string;
    kode: string;
    sks: number;
}

interface Session {
    id: number;
    title: string;
    meeting_number: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
    attendance_count: number;
    present_count: number;
    late_count: number;
}

interface Student {
    id: number;
    nama: string;
    nim: string;
    total: number;
    present: number;
    rate: number;
}

interface Stats {
    totalSessions: number;
    totalStudents: number;
    attendanceRate: number;
    lateRate: number;
}

interface Distribution {
    name: string;
    value: number;
    color: string;
}

interface PageProps {
    dosen: DosenInfo;
    course: Course;
    sessions: Session[];
    students: Student[];
    stats: Stats;
    distribution: Distribution[];
}

export default function CourseShow({
    dosen,
    course,
    sessions,
    students,
    stats,
    distribution,
}: PageProps) {
    const handleActivate = (sessionId: number) => {
        router.patch(`/dosen/sessions/${sessionId}/activate`);
    };

    const handleClose = (sessionId: number) => {
        router.patch(`/dosen/sessions/${sessionId}/close`);
    };

    return (
        <DosenLayout>
            <Head title={course.nama} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg">
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative">
                        <Link
                            href="/dosen/courses"
                            className="mb-4 inline-flex items-center gap-2 text-indigo-100 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm">Kembali</span>
                        </Link>

                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-indigo-100">
                                    {course.kode} • {course.sks} SKS
                                </p>
                                <h1 className="text-2xl font-bold">
                                    {course.nama}
                                </h1>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="mb-1 flex items-center gap-2 text-indigo-100">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Total Sesi</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {stats.totalSessions}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="mb-1 flex items-center gap-2 text-indigo-100">
                                    <Users className="h-4 w-4" />
                                    <span className="text-xs">Mahasiswa</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {stats.totalStudents}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="mb-1 flex items-center gap-2 text-indigo-100">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-xs">Kehadiran</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {stats.attendanceRate}%
                                </p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="mb-1 flex items-center gap-2 text-indigo-100">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">Terlambat</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {stats.lateRate}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Sessions List */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Daftar Sesi
                                </h2>
                            </div>

                            {sessions.length === 0 ? (
                                <div className="py-8 text-center text-slate-500">
                                    <Calendar className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                                    <p>Belum ada sesi perkuliahan</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className={cn(
                                                'flex items-center gap-4 rounded-xl border p-4 transition-colors',
                                                session.is_active
                                                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                                                    : 'border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-900',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold',
                                                    session.is_active
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                                                )}
                                            >
                                                {session.meeting_number}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-medium text-slate-900 dark:text-white">
                                                        {session.title}
                                                    </p>
                                                    {session.is_active && (
                                                        <span className="animate-pulse rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                                                            AKTIF
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    {session.start_at} -{' '}
                                                    {session.end_at}
                                                </p>
                                                <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="text-emerald-600">
                                                        {session.present_count}{' '}
                                                        hadir
                                                    </span>
                                                    <span className="text-amber-600">
                                                        {session.late_count}{' '}
                                                        terlambat
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {session.is_active ? (
                                                    <>
                                                        <Link
                                                            href={`/dosen/sessions/${session.id}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <QrCode className="mr-1 h-4 w-4" />
                                                                QR
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleClose(
                                                                    session.id,
                                                                )
                                                            }
                                                        >
                                                            <Pause className="mr-1 h-4 w-4" />
                                                            Tutup
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={`/dosen/sessions/${session.id}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                Detail
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-500 hover:bg-emerald-600"
                                                            onClick={() =>
                                                                handleActivate(
                                                                    session.id,
                                                                )
                                                            }
                                                        >
                                                            <Play className="mr-1 h-4 w-4" />
                                                            Aktifkan
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Students */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Daftar Mahasiswa
                                </h2>
                                <Link
                                    href={`/dosen/courses/${course.id}/students`}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            {students.length === 0 ? (
                                <div className="py-8 text-center text-slate-500">
                                    <Users className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                                    <p>Belum ada data mahasiswa</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {students.slice(0, 5).map((student) => (
                                        <Link
                                            key={student.id}
                                            href={`/dosen/courses/${course.id}/students/${student.id}`}
                                        >
                                            <div className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-gray-900">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    {student.nama.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-slate-900 dark:text-white">
                                                        {student.nama}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {student.nim}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {student.rate}%
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {student.present}/
                                                        {student.total}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                            Distribusi Kehadiran
                        </h2>
                        {distribution.some((d) => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {distribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[250px] items-center justify-center text-slate-500">
                                Belum ada data
                            </div>
                        )}

                        <div className="mt-4 space-y-2">
                            {distribution.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DosenLayout>
    );
}
