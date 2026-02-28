import { Head, router, Link } from '@inertiajs/react';
import jadwalIcon from '@/assets/admin/jadwal/jadwal.png';
import mataKuliahIcon from '@/assets/dosen/matakuliah/mata-kuliah.png';
import weeklyIcon from '@/assets/mahasiswa/jadwal-kuliah/kelas-per-minggu.png';
import todayIcon from '@/assets/mahasiswa/jadwal-kuliah/kelas-hari-ini.png';
import sksIcon from '@/assets/mahasiswa/jadwal-kuliah/total-sks.png';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Calendar,
    Clock,
    MapPin,
    BookOpen,
    User,
    Building2,
    Monitor,
    Download,
    Search,
    X,
    CalendarDays,
    GraduationCap,
    Bell,
    TrendingUp,
    Sparkles,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/* ═══════════════════════════════════════════════════ */
/*                     TYPES                          */
/* ═══════════════════════════════════════════════════ */
interface ScheduleItem {
    id: number;
    course_name: string;
    time: string | null;
    schedule_time_end: string | null;
    meeting_number: number;
    total_meetings: number;
    mode: string;
    mode_name?: string;
    is_completed: boolean;
    progress: number;
    sks: number;
}

interface NextClass extends ScheduleItem {
    day: string;
    is_today: boolean;
}

interface Props {
    weeklySchedule: Record<string, ScheduleItem[]>;
    currentDay: string;
    dayNames: Record<string, string>;
    today: { day: string; date: string };
    stats: {
        total_courses: number;
        total_classes_per_week: number;
        classes_today: number;
        total_sks: number;
        busiest_day: string;
    };
    nextClass: NextClass | null;
}

/* ═══════════════════════════════════════════════════ */
/*          ANIMATION VARIANTS — Matching Dashboard   */
/* ═══════════════════════════════════════════════════ */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
};

const colorVariants: Record<number, { bg: string; badge: string; accent: string }> = {
    0: { bg: 'bg-blue-50/50 dark:bg-blue-900/20', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', accent: 'text-blue-600' },
    1: { bg: 'bg-emerald-50/50 dark:bg-emerald-900/20', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', accent: 'text-emerald-600' },
    2: { bg: 'bg-purple-50/50 dark:bg-purple-900/20', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300', accent: 'text-purple-600' },
    3: { bg: 'bg-orange-50/50 dark:bg-orange-900/20', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', accent: 'text-orange-600' },
    4: { bg: 'bg-pink-50/50 dark:bg-pink-900/20', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300', accent: 'text-pink-600' },
};

export default function AcademicSchedule({ weeklySchedule, currentDay, dayNames, today, stats, nextClass }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline'>('all');

    const daysOrder = Object.keys(dayNames); // ['monday', 'tuesday', ...]

    // Filter schedules
    const filterSchedules = (daySchedules: ScheduleItem[]) => {
        return daySchedules.filter(item => {
            const matchesMode = filterMode === 'all' || item.mode === filterMode;
            const matchesSearch = item.course_name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesMode && matchesSearch;
        });
    };

    return (
        <StudentLayout>
            <Head title="Jadwal Kuliah" />

            <motion.div
                className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HERO HEADER — Matching Dashboard ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Static Background Graphic */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50" />
                    <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50" />

                    <div className="relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                            <div className="flex items-center gap-4 sm:gap-6 text-left">
                                <motion.div
                                    className="relative flex shrink-0 h-16 w-16 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img src={jadwalIcon} alt="Jadwal" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1">
                                    <motion.p
                                        className="text-xs sm:text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Jadwal Kuliah
                                    </motion.p>
                                    <motion.h1
                                        className="text-xl sm:text-3xl font-bold text-white mt-0.5 sm:mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Minggu Ini
                                    </motion.h1>
                                    <motion.p
                                        className="mt-1 sm:mt-2 text-indigo-100 max-w-lg text-[11px] sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kelola dan pantau jadwal perkuliahan Anda
                                    </motion.p>
                                </div>
                            </div>

                            <div className="flex flex-col w-full sm:w-auto items-end gap-2 mt-2 sm:mt-0">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center justify-end gap-3 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-xl px-3 py-1.5 sm:px-6 sm:py-3 shadow-lg border border-white/10 w-fit self-end"
                                >
                                    <div className="text-right">
                                        <p className="text-2xl sm:text-3xl font-bold">{today.day}</p>
                                        <p className="text-[10px] sm:text-xs text-indigo-200">{today.date}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>


                    </div>
                </motion.div>

                {/* ═══════ STATS CARDS — Matching Dashboard ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
                    }}
                >
                    {[
                        {
                            customIcon: mataKuliahIcon, // Total Mata Kuliah
                            title: 'Total Mata Kuliah',
                            value: stats.total_courses,
                            note: 'semester ini',
                            colorConfig: { gradientBg: 'from-purple-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/10', glow: 'bg-purple-500' },
                        },
                        {
                            customIcon: weeklyIcon, // Kelas Per Minggu
                            title: 'Kelas Per Minggu',
                            value: stats.total_classes_per_week,
                            note: 'total pertemuan',
                            colorConfig: { gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10', glow: 'bg-sky-500' },
                        },
                        {
                            customIcon: todayIcon, // Kelas Hari Ini
                            title: 'Kelas Hari Ini',
                            value: stats.classes_today,
                            note: today.day,
                            colorConfig: { gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', glow: 'bg-emerald-500' },
                        },
                        {
                            customIcon: sksIcon, // Total SKS
                            title: 'Total SKS',
                            value: stats.total_sks,
                            note: 'beban studi',
                            colorConfig: { gradientBg: 'from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10', glow: 'bg-orange-500' },
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.9 },
                                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
                            }}
                            whileHover={{ scale: 1.04, y: -4 }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`} />
                            <motion.div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.glow} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

                            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                                >
                                    <img src={stat.customIcon} alt={stat.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                                </motion.div>

                                <div className="flex flex-col items-center sm:items-start">
                                    <p className="text-[10px] sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.title}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white mt-0.5 sm:mt-1">{stat.value}</p>
                                    <p className="text-[8px] sm:text-xs text-neutral-400 mt-0.5">{stat.note}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════ SEARCH & FILTER ═══════ */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <motion.div className="relative" whileHover={{ scale: 1.01 }}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="Cari mata kuliah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 rounded-xl border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl dark:border-white/5"
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 180 }}
                                        whileHover={{ scale: 1.2, rotate: 90 }}
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                                    >
                                        <X className="h-4 w-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <div className="flex gap-2">
                        {([
                            { value: 'all' as const, label: 'Semua', icon: Calendar },
                            { value: 'online' as const, label: 'Online', icon: Monitor },
                            { value: 'offline' as const, label: 'Offline', icon: Building2 },
                        ]).map((filter) => (
                            <motion.button
                                key={filter.value}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterMode(filter.value)}
                                className={cn(
                                    'flex items-center gap-2 px-4 h-12 rounded-xl border-2 transition-all shadow-sm',
                                    filterMode === filter.value
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500'
                                        : 'bg-white/40 dark:bg-neutral-900/40 border-white/20 dark:border-white/5 backdrop-blur-xl'
                                )}
                            >
                                <filter.icon className="h-4 w-4" />
                                <span className="hidden sm:inline font-medium">{filter.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ═══════ NEXT CLASS HIGHLIGHT ═══════ */}
                {nextClass && (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-xl dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30 relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                        />

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg"
                                >
                                    <Bell className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">Kelas Berikutnya</h3>
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        {nextClass.is_today ? 'Hari ini' : nextClass.day}
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-amber-500 text-white">
                                {nextClass.is_today ? 'Segera' : 'Mendatang'}
                            </Badge>
                        </div>

                        <div className="relative z-10 space-y-3">
                            <div>
                                <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                    {nextClass.course_name}
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Pertemuan {nextClass.meeting_number}/{nextClass.total_meetings} • {nextClass.sks} SKS
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                                    <Clock className="h-4 w-4" />
                                    <span>{nextClass.time}{nextClass.schedule_time_end ? ` - ${nextClass.schedule_time_end}` : ''}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                                    {nextClass.mode === 'online' ? (
                                        <><Monitor className="h-4 w-4" /><span>Online</span></>
                                    ) : (
                                        <><Building2 className="h-4 w-4" /><span>Offline</span></>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div className="flex justify-between text-xs text-amber-700 dark:text-amber-300 mb-1">
                                    <span>Progress Perkuliahan</span>
                                    <span>{nextClass.progress}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-amber-200 dark:bg-amber-900/50 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${nextClass.progress}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ WEEKLY SCHEDULE GRID ═══════ */}
                <motion.div
                    className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
                    }}
                >
                    {daysOrder.map((dayKey) => {
                        const isToday = dayKey === currentDay;
                        const dayLabel = dayNames[dayKey];
                        const daySchedules = filterSchedules(weeklySchedule[dayKey] || []);

                        return (
                            <motion.div
                                key={dayKey}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -4 }}
                                className={cn(
                                    'rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5 transition-all',
                                    isToday && 'ring-2 ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                                )}
                            >
                                {/* Day Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-xl shadow-lg',
                                            isToday
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                                : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 text-neutral-600 dark:text-neutral-400'
                                        )}>
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                'font-semibold',
                                                isToday ? 'text-indigo-900 dark:text-indigo-100' : 'text-neutral-900 dark:text-white'
                                            )}>
                                                {dayLabel}
                                            </h3>
                                            <p className="text-xs text-neutral-500">
                                                {daySchedules.length} kelas
                                            </p>
                                        </div>
                                    </div>
                                    {isToday && (
                                        <Badge className="bg-indigo-500 text-white text-[10px]">
                                            Hari Ini
                                        </Badge>
                                    )}
                                </div>

                                {/* Schedule Items */}
                                <div className="space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {daySchedules.length > 0 ? (
                                            daySchedules.map((item, itemIndex) => {
                                                const colors = colorVariants[item.id % 5];
                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        transition={{ delay: itemIndex * 0.05 }}
                                                        whileHover={{ scale: 1.03, x: 4 }}
                                                        onClick={() => router.visit(`/user/akademik/jadwal/${item.id}`)}
                                                        className={cn(
                                                            'p-3 sm:p-4 rounded-xl border cursor-pointer transition-all',
                                                            colors.bg,
                                                            'border-white/20 dark:border-white/5'
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <div className="flex items-center gap-1.5">
                                                                {item.mode === 'online' ? (
                                                                    <Monitor className="h-3.5 w-3.5 text-blue-600" />
                                                                ) : (
                                                                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                                                                )}
                                                                <Badge className={cn(colors.badge, 'text-[10px]')}>
                                                                    {item.mode === 'online' ? 'Online' : 'Offline'}
                                                                </Badge>
                                                            </div>
                                                            <span className="text-[10px] font-mono text-neutral-500">
                                                                {item.sks} SKS
                                                            </span>
                                                        </div>

                                                        <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1 line-clamp-2">
                                                            {item.course_name}
                                                        </h4>

                                                        <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{item.time}{item.schedule_time_end ? ` - ${item.schedule_time_end}` : ''}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <BookOpen className="h-3 w-3" />
                                                                <span>Pertemuan {item.meeting_number}/{item.total_meetings}</span>
                                                            </div>
                                                        </div>

                                                        {/* Mini progress */}
                                                        <div className="mt-2">
                                                            <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
                                                                    style={{ width: `${item.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="rounded-2xl border border-white/10 bg-neutral-50/50 dark:bg-neutral-800/50 p-6 text-center text-sm text-neutral-500"
                                            >
                                                Tidak ada kelas
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

            </motion.div>
        </StudentLayout>
    );
}
