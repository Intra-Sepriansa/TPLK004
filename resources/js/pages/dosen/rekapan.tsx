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
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';

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

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 17,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};

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

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Header */}
                <motion.div
                    variants={cardVariants}
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
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                            >
                                <ClipboardList className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-indigo-100"
                                >
                                    Laporan
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl font-bold"
                                >
                                    Rekapan Kehadiran
                                </motion.h1>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-indigo-100"
                        >
                            Lihat dan cetak laporan kehadiran mahasiswa
                        </motion.p>
                    </div>
                </motion.div>

                {/* Filter Section */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <motion.div whileHover={{ rotate: 10 }}>
                            <Filter className="h-5 w-5 text-indigo-600" />
                        </motion.div>
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
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-gray-900 dark:text-white"
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
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-gray-900 dark:text-white"
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
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExportPdf}
                                disabled={!sessionId}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Download className="h-4 w-4" />
                                Export PDF
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                {sessionId && (
                    <motion.div
                        variants={containerVariants}
                        className="grid gap-4 md:grid-cols-4"
                    >
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 10 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                >
                                    <Users className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-slate-500">Total</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        <AnimatedCounter value={stats.total} duration={1500} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 10 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-slate-500">Hadir</p>
                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        <AnimatedCounter value={stats.hadir} duration={1500} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 10 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                >
                                    <Clock className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-slate-500">Terlambat</p>
                                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                        <AnimatedCounter value={stats.terlambat} duration={1500} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 10 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                >
                                    <XCircle className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-slate-500">Tidak Hadir</p>
                                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                        <AnimatedCounter value={stats.tidak_hadir} duration={1500} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Attendance Table */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                </motion.div>
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 text-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <ClipboardList className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            </motion.div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pilih Filter</h3>
                            <p className="text-slate-500 mt-2">Pilih mata kuliah dan pertemuan untuk melihat data kehadiran</p>
                        </motion.div>
                    ) : attendanceLogs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            </motion.div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Belum Ada Data</h3>
                            <p className="text-slate-500 mt-2">Belum ada mahasiswa yang melakukan presensi pada sesi ini</p>
                        </motion.div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-gray-900/50">
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
                                <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
                                    {attendanceLogs.map((log, index) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 5, backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                                            className="hover:bg-slate-50 dark:hover:bg-gray-900/30 transition-colors"
                                        >
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
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </DosenLayout>
    );
}
