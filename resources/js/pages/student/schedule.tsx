import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    BookOpen, 
    TrendingUp,
    CalendarDays,
    GraduationCap,
    Target,
    CheckCircle,
    Download,
    Search,
    X,
    ChevronRight,
    Building2,
    User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ScheduleItem {
    id: number;
    course_name: string;
    course_code: string;
    dosen_name: string;
    ruangan: string;
    time_range: string;
    jam_mulai: string;
    jam_selesai: string;
    duration: string;
    notes?: string;
    color: string;
}

interface Props {
    schedules: Record<string, ScheduleItem[]>;
    todaySchedule: ScheduleItem[];
    nextClass: (ScheduleItem & { day: string; is_today: boolean }) | null;
    stats: {
        total_courses: number;
        total_classes_per_week: number;
        classes_today: number;
        busiest_day: string;
    };
    currentDay: string;
}

const colorVariants: Record<string, { gradient: string; badge: string }> = {
    blue: { gradient: 'from-blue-500 to-blue-600', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    green: { gradient: 'from-green-500 to-green-600', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    purple: { gradient: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
    orange: { gradient: 'from-orange-500 to-orange-600', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
    pink: { gradient: 'from-pink-500 to-pink-600', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' },
    indigo: { gradient: 'from-indigo-500 to-indigo-600', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
    teal: { gradient: 'from-teal-500 to-teal-600', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' },
    cyan: { gradient: 'from-cyan-500 to-cyan-600', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' },
    amber: { gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
    rose: { gradient: 'from-rose-500 to-rose-600', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
};

const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// Simple dock-style animations
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
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
            stiffness: 200,
            damping: 20,
        },
    },
};

function QuickStatCard({
    icon: Icon,
    label,
    value,
    suffix,
    subtext,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    suffix?: string;
    subtext?: string;
    color: 'emerald' | 'amber' | 'sky' | 'violet' | 'rose';
}) {
    const colors = {
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.2, y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors[color])}
                >
                    <Icon className="h-5 w-5" />
                </motion.div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {value}{suffix}
                    </p>
                    {subtext && (
                        <p className="text-[10px] text-slate-400">{subtext}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function Schedule({ schedules, todaySchedule, nextClass, stats, currentDay }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDay, setSelectedDay] = useState(currentDay);
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Filter schedules based on search
    const filterSchedules = (daySchedules: ScheduleItem[]) => {
        if (!searchQuery) return daySchedules;
        return daySchedules.filter(item => 
            item.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.dosen_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Export schedule
    const exportSchedule = () => {
        let text = `JADWAL KULIAH MINGGUAN\n\n`;
        daysOrder.forEach(day => {
            const schedule = schedules[day] || [];
            if (schedule.length > 0) {
                text += `${day.toUpperCase()}\n`;
                schedule.forEach(item => {
                    text += `- ${item.course_name} (${item.course_code})\n`;
                    text += `  Dosen: ${item.dosen_name}\n`;
                    text += `  Waktu: ${item.time_range}\n`;
                    text += `  Ruangan: ${item.ruangan}\n\n`;
                });
            }
        });
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jadwal-kuliah-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <StudentLayout>
            <Head title="Jadwal Kuliah" />

            {/* Subtle Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden bg-gradient-to-br from-emerald-50/30 to-sky-50/30 dark:from-emerald-950/10 dark:to-sky-950/10" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 p-6 relative z-10"
            >
                {/* Header Card */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg"
                >
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
                            >
                                <CalendarDays className="h-8 w-8" />
                            </motion.div>
                            <div>
                                <p className="text-sm text-emerald-100">Jadwal Kuliah</p>
                                <h1 className="text-2xl font-bold">Minggu Ini</h1>
                                <p className="text-sm text-emerald-100">{currentDay}</p>
                            </div>
                        </div>
                        
                        {stats.classes_today > 0 && (
                            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
                                <Clock className="h-5 w-5 text-emerald-200" />
                                <span className="font-bold">{stats.classes_today}</span>
                                <span className="text-sm text-emerald-100">kelas hari ini</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                    <QuickStatCard
                        icon={BookOpen}
                        label="Total Mata Kuliah"
                        value={stats.total_courses}
                        subtext="semester ini"
                        color="emerald"
                    />
                    <QuickStatCard
                        icon={CalendarDays}
                        label="Kelas Per Minggu"
                        value={stats.total_classes_per_week}
                        subtext="total pertemuan"
                        color="sky"
                    />
                    <QuickStatCard
                        icon={Clock}
                        label="Kelas Hari Ini"
                        value={stats.classes_today}
                        subtext={currentDay}
                        color="amber"
                    />
                    <QuickStatCard
                        icon={TrendingUp}
                        label="Hari Tersibuk"
                        value={stats.busiest_day}
                        subtext="paling banyak"
                        color="violet"
                    />
                </motion.div>

                {/* Search and Export */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari mata kuliah, kode, atau dosen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12"
                            />
                            {searchQuery && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </motion.button>
                            )}
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportSchedule}
                        className="flex items-center justify-center gap-2 px-6 h-12 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </motion.button>
                </motion.div>

                {/* Next Class Highlight */}
                {nextClass && (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-sm dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <Target className="h-5 w-5 text-amber-600" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Kelas Selanjutnya
                                </h2>
                            </div>
                            <Badge className="bg-amber-500 hover:bg-amber-600">
                                {nextClass.is_today ? 'Hari ini' : nextClass.day}
                            </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {nextClass.course_name}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {nextClass.course_code} • {nextClass.dosen_name}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {nextClass.time_range}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {nextClass.ruangan}
                                    </div>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, x: 3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedSchedule(nextClass);
                                    setIsDetailOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                            >
                                <span>Detail</span>
                                <ChevronRight className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Weekly Schedule */}
                    <div className="space-y-6 lg:col-span-2">
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Jadwal Mingguan
                                </h2>
                            </div>

                            <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
                                <TabsList className="grid w-full grid-cols-7 bg-slate-100 dark:bg-slate-900 p-1">
                                    {daysOrder.map((day) => (
                                        <TabsTrigger 
                                            key={day} 
                                            value={day}
                                            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs"
                                        >
                                            {day.substring(0, 3)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {daysOrder.map((day) => {
                                    const daySchedules = filterSchedules(schedules[day] || []);
                                    return (
                                        <TabsContent key={day} value={day} className="space-y-3 mt-4">
                                            <AnimatePresence mode="popLayout">
                                                {daySchedules.length > 0 ? (
                                                    daySchedules.map((schedule, index) => (
                                                        <motion.div
                                                            key={schedule.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                                            whileHover={{ scale: 1.02, x: 5 }}
                                                            onClick={() => {
                                                                setSelectedSchedule(schedule);
                                                                setIsDetailOpen(true);
                                                            }}
                                                            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                                                        >
                                                            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colorVariants[schedule.color].badge)}>
                                                                <GraduationCap className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                                    {schedule.course_name}
                                                                </p>
                                                                <p className="text-xs text-slate-500 mt-0.5">
                                                                    {schedule.course_code}
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {schedule.time_range}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="h-3 w-3" />
                                                                        {schedule.ruangan}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                                        </motion.div>
                                                    ))
                                                ) : (
                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-center py-12"
                                                    >
                                                        <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                        <p className="text-sm text-slate-500">
                                                            {searchQuery ? 'Tidak ada hasil pencarian' : `Tidak ada kelas pada hari ${day}`}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </motion.div>
                    </div>

                    {/* Right Column - Today's Schedule & Info */}
                    <div className="space-y-6">
                        {/* Today's Schedule */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Jadwal Hari Ini
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {todaySchedule && todaySchedule.length > 0 ? (
                                    todaySchedule.map((schedule, index) => (
                                        <motion.div
                                            key={schedule.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            onClick={() => {
                                                setSelectedSchedule(schedule);
                                                setIsDetailOpen(true);
                                            }}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                                        >
                                            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colorVariants[schedule.color].badge)}>
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {schedule.course_name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {schedule.time_range}
                                                </p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {schedule.ruangan}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">
                                            Tidak ada kelas hari ini
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Info */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Target className="h-5 w-5 text-violet-600" />
                                Informasi
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <span className="text-slate-500">Total Mata Kuliah</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{stats.total_courses}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <span className="text-slate-500">Kelas Minggu Ini</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{stats.total_classes_per_week}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <span className="text-slate-500">Kelas Hari Ini</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{stats.classes_today}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <span className="text-slate-500">Hari Tersibuk</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{stats.busiest_day}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <BookOpen className="h-6 w-6 text-emerald-500" />
                            Detail Jadwal Kuliah
                        </DialogTitle>
                    </DialogHeader>
                    {selectedSchedule && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 py-4"
                        >
                            {/* Course Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {selectedSchedule.course_name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {selectedSchedule.course_code}
                                    </p>
                                    <Badge className={cn('mt-2', colorVariants[selectedSchedule.color].badge)}>
                                        {selectedSchedule.color.charAt(0).toUpperCase() + selectedSchedule.color.slice(1)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Time Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                            <Clock className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white">Waktu</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {selectedSchedule.time_range}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Durasi: {selectedSchedule.duration}
                                    </p>
                                </motion.div>

                                {/* Room Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-4 rounded-xl border-2 border-sky-200 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/30"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg">
                                            <Building2 className="h-5 w-5 text-sky-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white">Ruangan</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {selectedSchedule.ruangan}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Lecturer Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30"
                            >
                                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                    <User className="h-5 w-5 text-violet-600" />
                                    Dosen Pengampu
                                </h4>
                                <p className="text-lg font-medium text-slate-900 dark:text-white">
                                    {selectedSchedule.dosen_name}
                                </p>
                            </motion.div>

                            {/* Notes if available */}
                            {selectedSchedule.notes && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                                >
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                        Catatan
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {selectedSchedule.notes}
                                    </p>
                                </motion.div>
                            )}

                            {/* Close Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700"
                                >
                                    Tutup
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}
