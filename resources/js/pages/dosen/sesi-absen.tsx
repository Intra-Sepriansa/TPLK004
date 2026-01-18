import { Head, router, useForm } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Calendar, Play, Pause, Plus, Search, Clock, Users, CheckCircle, XCircle, RefreshCw, Eye, X, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Session {
    id: number;
    course_id: number;
    course_name: string;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
    logs_count: number;
    present_count: number;
    late_count: number;
    rejected_count: number;
}

interface Course {
    id: number;
    nama: string;
    sks: number;
}

interface PageProps {
    dosen: { id: number; nama: string };
    sessions: Session[];
    courses: Course[];
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 17
        }
    }
};

const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.05,
        y: -5,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 17
        }
    }
};

export default function DosenSesiAbsen({ dosen, sessions, courses }: PageProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    const createForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
        auto_activate: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/dosen/sessions', { 
            onSuccess: () => { 
                setShowCreateModal(false); 
                createForm.reset(); 
            } 
        });
    };

    const handleActivate = (id: number) => router.patch(`/dosen/sessions/${id}/activate`);
    const handleClose = (id: number) => router.patch(`/dosen/sessions/${id}/close`);

    const filteredSessions = sessions.filter(s => 
        s.course_name.toLowerCase().includes(search.toLowerCase()) ||
        s.title?.toLowerCase().includes(search.toLowerCase())
    );

    // Set default datetime values
    const now = new Date();
    const defaultStart = now.toISOString().slice(0, 16);
    const defaultEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

    // Calculate stats
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.is_active).length;
    const totalAttendance = sessions.reduce((acc, s) => acc + s.logs_count, 0);
    const totalLate = sessions.reduce((acc, s) => acc + s.late_count, 0);

    return (
        <DosenLayout>
            <Head title="Sesi Absen" />
            <motion.div 
                className="p-6 space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header with Advanced Animation */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl"
                >
                    {/* Animated Background Circles */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.15, 0.3, 0.15]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-white/10"
                    />
                    
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    whileHover={{ scale: 1.1, y: -3 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                >
                                    <Calendar className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-emerald-100"
                                    >
                                        Manajemen Sesi
                                    </motion.p>
                                    <motion.h1 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Sesi Absen
                                    </motion.h1>
                                    <motion.p 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-emerald-100"
                                    >
                                        Kelola sesi absensi mata kuliah Anda
                                    </motion.p>
                                </div>
                            </div>
                            <motion.button 
                                onClick={() => {
                                    createForm.setData({
                                        ...createForm.data,
                                        start_at: defaultStart,
                                        end_at: defaultEnd,
                                    });
                                    setShowCreateModal(true);
                                }} 
                                className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur shadow-lg"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Plus className="h-5 w-5" />
                                Buat Sesi Baru
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats with Advanced Animations */}
                <motion.div 
                    className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                    variants={containerVariants}
                >
                    {[
                        { icon: Calendar, label: 'Total Sesi', value: totalSessions, color: 'indigo', gradient: 'from-indigo-500 to-purple-500' },
                        { icon: Play, label: 'Sesi Aktif', value: activeSessions, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
                        { icon: Users, label: 'Total Kehadiran', value: totalAttendance, color: 'sky', gradient: 'from-sky-500 to-blue-500' },
                        { icon: Clock, label: 'Terlambat', value: totalLate, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover="hover"
                            initial="rest"
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-black/70 cursor-pointer"
                        >
                            <motion.div 
                                className="flex items-center gap-4"
                                variants={cardHoverVariants}
                            >
                                <motion.div 
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <motion.p 
                                        className="text-3xl font-bold text-slate-900 dark:text-white"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ 
                                            delay: 0.2 + index * 0.1,
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 17
                                        }}
                                    >
                                        {stat.value}
                                    </motion.p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="mt-3 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                <TrendingUp className="h-3 w-3" />
                                <span>Aktif</span>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Search with Animation */}
                <motion.div 
                    className="flex items-center gap-4"
                    variants={itemVariants}
                >
                    <motion.div 
                        className="relative flex-1"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <motion.input
                            type="text"
                            placeholder="Cari sesi atau mata kuliah..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            whileFocus={{ scale: 1.02 }}
                        />
                        <AnimatePresence>
                            {search && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    whileHover={{ scale: 1.2, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="h-4 w-4" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Sessions List with Advanced Animations */}
                <motion.div 
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-black/70 overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50">
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Mata Kuliah</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Pertemuan</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Waktu</th>
                                    <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">Kehadiran</th>
                                    <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                    <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredSessions.length === 0 ? (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                >
                                                    <AlertCircle className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada sesi absen</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Buat sesi baru untuk memulai</p>
                                                </motion.div>
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        filteredSessions.map((session, index) => (
                                            <motion.tr 
                                                key={session.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ 
                                                    delay: index * 0.05,
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 17
                                                }}
                                                className="border-b border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-900/50 transition-colors"
                                                whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                                            >
                                                <td className="px-6 py-4">
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.05 + 0.1 }}
                                                    >
                                                        <p className="font-semibold text-slate-900 dark:text-white">{session.course_name}</p>
                                                        {session.title && (
                                                            <motion.p 
                                                                className="text-xs text-slate-500 mt-1"
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 + 0.2 }}
                                                            >
                                                                {session.title}
                                                            </motion.p>
                                                        )}
                                                    </motion.div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <motion.div
                                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800"
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                    >
                                                        <Sparkles className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                            Pertemuan {session.meeting_number}
                                                        </span>
                                                    </motion.div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs space-y-1">
                                                        <motion.p 
                                                            className="text-slate-600 dark:text-slate-400"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 + 0.15 }}
                                                        >
                                                            {session.start_at}
                                                        </motion.p>
                                                        <motion.p 
                                                            className="text-slate-400 dark:text-slate-500"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 + 0.2 }}
                                                        >
                                                            s/d {session.end_at}
                                                        </motion.p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <motion.div 
                                                        className="flex items-center justify-center gap-3"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.05 + 0.25 }}
                                                    >
                                                        <motion.div 
                                                            className="flex items-center gap-1"
                                                            whileHover={{ scale: 1.1 }}
                                                        >
                                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{session.present_count}</span>
                                                        </motion.div>
                                                        <span className="text-slate-300">/</span>
                                                        <motion.div 
                                                            className="flex items-center gap-1"
                                                            whileHover={{ scale: 1.1 }}
                                                        >
                                                            <Clock className="h-4 w-4 text-amber-500" />
                                                            <span className="text-amber-600 dark:text-amber-400 font-semibold">{session.late_count}</span>
                                                        </motion.div>
                                                        <span className="text-slate-300">/</span>
                                                        <motion.div 
                                                            className="flex items-center gap-1"
                                                            whileHover={{ scale: 1.1 }}
                                                        >
                                                            <XCircle className="h-4 w-4 text-rose-500" />
                                                            <span className="text-rose-600 dark:text-rose-400 font-semibold">{session.rejected_count}</span>
                                                        </motion.div>
                                                    </motion.div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <AnimatePresence mode="wait">
                                                        {session.is_active ? (
                                                            <motion.span
                                                                key="active"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                <motion.span 
                                                                    className="h-2 w-2 rounded-full bg-emerald-500"
                                                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                />
                                                                Aktif
                                                            </motion.span>
                                                        ) : (
                                                            <motion.span
                                                                key="inactive"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                Nonaktif
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <motion.div
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => router.get(`/dosen/sessions/${session.id}`)}
                                                                className="hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </motion.div>
                                                        <AnimatePresence mode="wait">
                                                            {session.is_active ? (
                                                                <motion.div
                                                                    key="pause"
                                                                    initial={{ opacity: 0, rotate: -90 }}
                                                                    animate={{ opacity: 1, rotate: 0 }}
                                                                    exit={{ opacity: 0, rotate: 90 }}
                                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                                        onClick={() => handleClose(session.id)}
                                                                    >
                                                                        <Pause className="h-4 w-4" />
                                                                    </Button>
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    key="play"
                                                                    initial={{ opacity: 0, rotate: -90 }}
                                                                    animate={{ opacity: 1, rotate: 0 }}
                                                                    exit={{ opacity: 0, rotate: 90 }}
                                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                                        onClick={() => handleActivate(session.id)}
                                                                    >
                                                                        <Play className="h-4 w-4" />
                                                                    </Button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Create Modal with Advanced Animations */}
                <AnimatePresence>
                    {showCreateModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowCreateModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                            >
                                <motion.div 
                                    className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-900 pointer-events-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Buat Sesi Absen Baru</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Isi form di bawah untuk membuat sesi baru</p>
                                        </motion.div>
                                        <motion.button
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                            whileHover={{ scale: 1.05, rotate: 15 }}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, rotate: -90 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <X className="h-5 w-5" />
                                        </motion.button>
                                    </div>

                                    <form onSubmit={handleCreate} className="space-y-5">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mata Kuliah</label>
                                            <motion.select 
                                                value={createForm.data.course_id} 
                                                onChange={e => createForm.setData('course_id', e.target.value)} 
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                                required
                                                whileFocus={{ scale: 1.01 }}
                                            >
                                                <option value="">Pilih Mata Kuliah</option>
                                                {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                            </motion.select>
                                        </motion.div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.25 }}
                                            >
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pertemuan Ke</label>
                                                <motion.input 
                                                    type="number" 
                                                    min="1" 
                                                    max="21" 
                                                    value={createForm.data.meeting_number} 
                                                    onChange={e => createForm.setData('meeting_number', parseInt(e.target.value))} 
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Judul (Opsional)</label>
                                                <motion.input 
                                                    type="text" 
                                                    value={createForm.data.title} 
                                                    onChange={e => createForm.setData('title', e.target.value)} 
                                                    placeholder="Materi pertemuan" 
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.35 }}
                                            >
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mulai</label>
                                                <motion.input 
                                                    type="datetime-local" 
                                                    value={createForm.data.start_at} 
                                                    onChange={e => createForm.setData('start_at', e.target.value)} 
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Selesai</label>
                                                <motion.input 
                                                    type="datetime-local" 
                                                    value={createForm.data.end_at} 
                                                    onChange={e => createForm.setData('end_at', e.target.value)} 
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                        </div>

                                        <motion.label 
                                            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.45 }}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={createForm.data.auto_activate} 
                                                onChange={e => createForm.setData('auto_activate', e.target.checked)} 
                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Aktifkan langsung setelah dibuat</span>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sesi akan langsung aktif dan mahasiswa bisa absen</p>
                                            </div>
                                        </motion.label>

                                        <AnimatePresence>
                                            {createForm.errors && Object.keys(createForm.errors).length > 0 && (
                                                <motion.div 
                                                    className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    {Object.values(createForm.errors).map((error, i) => (
                                                        <motion.p 
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                        >
                                                            • {error}
                                                        </motion.p>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <motion.div 
                                            className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <motion.button 
                                                type="button" 
                                                onClick={() => setShowCreateModal(false)} 
                                                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Batal
                                            </motion.button>
                                            <motion.button 
                                                type="submit" 
                                                disabled={createForm.processing} 
                                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 text-sm font-semibold disabled:opacity-50 shadow-lg disabled:cursor-not-allowed"
                                                whileHover={{ scale: createForm.processing ? 1 : 1.05 }}
                                                whileTap={{ scale: createForm.processing ? 1 : 0.95 }}
                                            >
                                                {createForm.processing ? (
                                                    <span className="flex items-center gap-2">
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                        Menyimpan...
                                                    </span>
                                                ) : (
                                                    'Buat Sesi'
                                                )}
                                            </motion.button>
                                        </motion.div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </DosenLayout>
    );
}
