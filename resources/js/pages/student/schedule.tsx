import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    User, 
    BookOpen, 
    TrendingUp,
    CalendarDays,
    Timer,
    GraduationCap,
    Sparkles,
    Target,
    CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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

// Animation variants - SAMA DENGAN DASHBOARD
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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
            stiffness: 100,
            damping: 15,
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
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ rotate: 10 }}
                    className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors[color])}
                >
                    <Icon className="h-5 w-5" />
                </motion.div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {value}{suffix}
                    </p>
                    {subtext && (
                        <p className="text-[10px] text-gray-400">{subtext}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function Schedule({ schedules, todaySchedule, nextClass, stats, currentDay }: Props) {
    return (
        <StudentLayout>
            <Head title="Jadwal Kuliah" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 p-6"
            >
                {/* Welcome Card - SAMA DENGAN DASHBOARD */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                <CalendarDays className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100">Jadwal Kuliah</p>
                                <h1 className="text-2xl font-bold">Minggu Ini</h1>
                                <p className="text-sm text-emerald-100">{currentDay}</p>
                            </div>
                        </div>
                        
                        <div className="hidden sm:flex items-center gap-3">
                            {stats.classes_today > 0 && (
                                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
                                    <Clock className="h-5 w-5 text-emerald-200" />
                                    <span className="font-bold">{stats.classes_today}</span>
                                    <span className="text-sm text-emerald-100">kelas hari ini</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile CTA */}
                    <div className="mt-4 flex gap-2 sm:hidden">
                        <div className="flex-1 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{stats.classes_today} kelas hari ini</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats - SAMA DENGAN DASHBOARD */}
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

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Schedule */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Next Class */}
                        {nextClass && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-amber-600" />
                                        <h2 className="font-semibold text-gray-900 dark:text-white">
                                            Kelas Selanjutnya
                                        </h2>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium dark:bg-amber-900/30 dark:text-amber-400">
                                        {nextClass.is_today ? 'Hari ini' : nextClass.day}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {nextClass.course_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {nextClass.course_code}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
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
                                </div>
                            </div>
                        )}

                        {/* Schedule Tabs */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="h-5 w-5 text-sky-600" />
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    Jadwal Mingguan
                                </h2>
                            </div>

                            <Tabs defaultValue={currentDay} className="w-full">
                                <TabsList className="grid w-full grid-cols-7 bg-gray-100 dark:bg-gray-900 p-1">
                                    {daysOrder.map((day) => (
                                        <TabsTrigger 
                                            key={day} 
                                            value={day}
                                            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                                        >
                                            {day.substring(0, 3)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {daysOrder.map((day) => (
                                    <TabsContent key={day} value={day} className="space-y-3 mt-4">
                                        {schedules[day] && schedules[day].length > 0 ? (
                                            schedules[day].map((schedule, index) => (
                                                <motion.div
                                                    key={schedule.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                                >
                                                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', colorVariants[schedule.color].badge)}>
                                                        <GraduationCap className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {schedule.course_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Clock className="h-3 w-3" />
                                                            {schedule.time_range}
                                                            <span>•</span>
                                                            <MapPin className="h-3 w-3" />
                                                            {schedule.ruangan}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 mb-2">
                                                    <Calendar className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Tidak ada kelas pada hari {day}
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    </div>

                    {/* Right Column - Today's Schedule */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    Jadwal Hari Ini
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {todaySchedule && todaySchedule.length > 0 ? (
                                    todaySchedule.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50"
                                        >
                                            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colorVariants[schedule.color].badge)}>
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {schedule.course_name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {schedule.time_range}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {schedule.ruangan}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-gray-500">
                                            Tidak ada kelas hari ini
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Informasi
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Mata Kuliah</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{stats.total_courses}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Kelas Minggu Ini</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{stats.total_classes_per_week}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hari Tersibuk</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{stats.busiest_day}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
