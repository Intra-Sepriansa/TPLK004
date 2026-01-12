import { Head, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import {
    ClipboardList,
    Download,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    FileText,
    Calendar,
} from 'lucide-react';
import { useState } from 'react';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
}

interface Course {
    id: number;
    nama: string;
    sks: number;
}

interface Session {
    id: number;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
}

interface AttendanceLog {
    id: number;
    mahasiswa_id: number;
    nama: string;
    nim: string;
    fakultas: string;
    prodi: string;
    kelas: string;
    jenis_reguler: string;
    semester: string;
    status: string;
    scanned_at: string | null;
    scanned_date: string | null;
}

interface Stats {
    total: number;
    hadir: number;
    terlambat: number;
    tidak_hadir: number;
}

interface PageProps {
    dosen: DosenInfo;
    courses: Course[];
    sessions: Session[];
    attendanceLogs: AttendanceLog[];
    selectedCourseId: string | null;
    selectedSessionId: string | null;
    selectedCourse: Course | null;
    selectedSession: Session | null;
    stats: Stats;
}

export default function DosenRekapan({
    dosen,
    courses,
    sessions,
    attendanceLogs,
    selectedCourseId,
    selectedSessionId,
    selectedCourse,
    selectedSession,
    stats,
}: PageProps) {
    const [courseId, setCourseId] = useState(selectedCourseId || '');
    const [sessionId, setSessionId] = useState(selectedSessionId || '');

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setCourseId(value);
        setSessionId('');
        if (value) {
            router.get('/dosen/rekapan', { course_id: value }, { preserveState: true });
        } else {
            router.get('/dosen/rekapan', {}, { preserveState: true });
        }
    };

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSessionId(value);
        if (value && courseId) {
            router.get('/dosen/rekapan', { course_id: courseId, session_id: value }, { preserveState: true });
        }
    };

    const handleExportPdf = () => {
        if (sessionId) {
            window.open(`/dosen/rekapan/pdf?session_id=${sessionId}`, '_blank');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        Hadir
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        Terlambat
                    </span>
                );
            case 'absent':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="h-3 w-3" />
                        Tidak Hadir
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        {status}
                    </span>
                );
        }
    };

    return (
        <DosenLayout>
            <Head title="Rekapan Kehadiran" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-100">Laporan</p>
                                <h1 className="text-2xl font-bold">Rekapan Kehadiran</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-indigo-100">
                            Lihat dan cetak laporan kehadiran mahasiswa
                        </p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Mata Kuliah
                            </label>
                            <select
                                value={courseId}
                                onChange={handleCourseChange}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="">Pilih Mata Kuliah</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.nama} ({course.sks} SKS)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Pertemuan
                            </label>
                            <select
                                value={sessionId}
                                onChange={handleSessionChange}
                                disabled={!courseId || sessions.length === 0}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="">Pilih Pertemuan</option>
                                {sessions.map(session => (
                                    <option key={session.id} value={session.id}>
                                        Pertemuan {session.meeting_number} {session.title ? `- ${session.title}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleExportPdf}
                                disabled={!sessionId}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Download className="h-4 w-4" />
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {sessionId && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Hadir</p>
                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.hadir}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Terlambat</p>
                                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.terlambat}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                    <XCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Tidak Hadir</p>
                                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.tidak_hadir}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance Table */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Daftar Kehadiran
                                </h2>
                            </div>
                            {selectedSession && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    Pertemuan {selectedSession.meeting_number}
                                </div>
                            )}
                        </div>
                    </div>

                    {!sessionId ? (
                        <div className="p-12 text-center">
                            <ClipboardList className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pilih Filter</h3>
                            <p className="text-slate-500 mt-2">Pilih mata kuliah dan pertemuan untuk melihat data kehadiran</p>
                        </div>
                    ) : attendanceLogs.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Belum Ada Data</h3>
                            <p className="text-slate-500 mt-2">Belum ada mahasiswa yang melakukan presensi pada sesi ini</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            NIM
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Nama Mahasiswa
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Kelas
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Jenis
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Waktu
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {attendanceLogs.map((log, index) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-white">
                                                {log.nim}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {log.nama}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {log.prodi}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {log.kelas}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {log.jenis_reguler}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(log.status)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {log.scanned_at || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DosenLayout>
    );
}
