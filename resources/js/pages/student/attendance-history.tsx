import { Head, usePage } from '@inertiajs/react';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceStats } from '@/components/ui/attendance-stats';
import { AchievementBadge, AchievementList } from '@/components/ui/achievement-badge';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student-layout';
import { Download, Filter, CalendarDays, TrendingUp, History, Award } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

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
                {/* Enhanced Header - Matching Dashboard Style */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 shadow-2xl"
                >
                    {/* 3 Large Animated Orbs */}
                    <motion.div 
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.15, 0.1],
                            x: [0, -30, 0],
                            y: [0, 20, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl"
                    />
                    <motion.div 
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                            opacity: [0.08, 0.12, 0.08],
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-500/30 blur-3xl"
                    />
                    <motion.div 
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                            opacity: [0.08, 0.12, 0.08],
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2,
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-teal-400/20 blur-3xl"
                    />
                    
                    {/* 30 Floating Particles with Advanced Physics */}
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{ 
                                opacity: [0, 0.8, 1, 0.6, 0],
                                scale: [0, 1.8, 1.2, 0.8, 0],
                                y: [0, -50, -100, -150, -200],
                                x: [0, Math.sin(i * 0.5) * 40, Math.cos(i * 0.3) * 30, Math.sin(i) * 20, 0],
                                rotate: [0, 180, 360, 540, 720],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 3,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeOut"
                            }}
                            className="absolute rounded-full shadow-lg"
                            style={{
                                width: `${3 + Math.random() * 10}px`,
                                height: `${3 + Math.random() * 10}px`,
                                left: `${10 + (i * 3) % 80}%`,
                                top: `${20 + (i % 4) * 20}%`,
                                background: i % 3 === 0 
                                    ? 'rgba(255, 255, 255, 0.6)' 
                                    : i % 3 === 1 
                                        ? 'rgba(6, 182, 212, 0.5)' 
                                        : 'rgba(59, 130, 246, 0.5)',
                                filter: 'blur(1px)',
                                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                            }}
                        />
                    ))}
                    
                    {/* Floating Icons with Advanced Animations */}
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            x: [0, 10, 0],
                            rotate: [0, 5, -5, 0],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-10 right-20 text-white/20"
                    >
                        <History className="h-16 w-16" />
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, 20, 0],
                            x: [0, -15, 0],
                            rotate: [0, -10, 10, 0],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute bottom-10 left-20 text-white/20"
                    >
                        <Award className="h-20 w-20" />
                    </motion.div>
                    
                    {/* Animated Rings */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 2, 3],
                                opacity: [0.3, 0.15, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: i * 1.3,
                                ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30"
                            style={{
                                width: '100px',
                                height: '100px',
                            }}
                        />
                    ))}
                    
                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-5">
                            <motion.div 
                                whileHover={{ 
                                    scale: 1.2, 
                                    rotate: [0, -8, 8, 0],
                                    boxShadow: "0 0 40px rgba(255,255,255,0.6)"
                                }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-xl ring-4 ring-white/40 cursor-pointer shadow-2xl"
                            >
                                {/* Glow effect behind icon */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/50 to-blue-300/50 blur-xl"
                                />
                                <History className="relative h-10 w-10 text-white drop-shadow-2xl" />
                            </motion.div>
                            <div>
                                <motion.p 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-[10px] uppercase tracking-[0.2em] text-cyan-100 font-semibold"
                                >
                                    Riwayat Lengkap
                                </motion.p>
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="font-display text-3xl font-bold text-white drop-shadow-lg"
                                >
                                    Kehadiran Saya
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-cyan-100/80 mt-1"
                                >
                                    Pantau dan analisis kehadiran Anda
                                </motion.p>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button 
                                variant="outline" 
                                size="lg"
                                className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-xl"
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Export PDF
                            </Button>
                        </motion.div>
                    </div>

                    {/* Stats Badge */}
                    {stats?.streak > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-xl px-4 py-2 border border-white/20"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-2 w-2 rounded-full bg-emerald-400"
                            />
                            <span className="text-sm font-medium text-white">
                                🔥 {stats.streak} hari berturut-turut
                            </span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Stats & Achievements */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Stats Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -4 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
                            >
                                <TrendingUp className="h-5 w-5 text-white" />
                            </motion.div>
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
                    </motion.div>

                    {/* Achievements */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -4 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: -10 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg"
                                >
                                    <Award className="h-5 w-5 text-white" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Pencapaian
                                </h2>
                            </div>
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
                    </motion.div>
                </div>

                {/* Calendar & Records */}
                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                    {/* Calendar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Calendar
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            markedDates={markedDates}
                        />
                        {selectedDate && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 w-full"
                                    onClick={() => setSelectedDate(undefined)}
                                >
                                    Tampilkan semua tanggal
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Records List */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg"
                                >
                                    <CalendarDays className="h-5 w-5 text-white" />
                                </motion.div>
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
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <CalendarDays className="h-12 w-12 mx-auto text-slate-300" />
                                    <p className="mt-2 text-sm text-slate-500">
                                        Tidak ada data kehadiran
                                    </p>
                                </motion.div>
                            ) : (
                                filteredRecords.map((record, index) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-black/50 transition-colors cursor-pointer"
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
                                        <motion.span 
                                            whileHover={{ scale: 1.1 }}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}
                                        >
                                            {statusLabels[record.status]}
                                        </motion.span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </StudentLayout>
    );
}
