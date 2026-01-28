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
    Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function Schedule({ schedules, todaySchedule, nextClass, stats, currentDay }: Props) {
    return (
        <StudentLayout>
            <Head title="Jadwal Kuliah" />

            <div className="p-6 space-y-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                                    <CalendarDays className="h-10 w-10 text-blue-600" />
                                    Jadwal Kuliah
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 mt-2">
                                    Lihat jadwal kuliah mingguan Anda
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{currentDay}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:shadow-xl transition-all duration-300">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Mata Kuliah</p>
                                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                                {stats.total_courses}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Semester ini</p>
                                        </div>
                                        <BookOpen className="h-12 w-12 text-blue-600/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:shadow-xl transition-all duration-300">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Kelas Per Minggu</p>
                                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                                {stats.total_classes_per_week}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Total pertemuan</p>
                                        </div>
                                        <CalendarDays className="h-12 w-12 text-purple-600/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 hover:shadow-xl transition-all duration-300">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Kelas Hari Ini</p>
                                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                                                {stats.classes_today}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Pertemuan {currentDay}</p>
                                        </div>
                                        <Clock className="h-12 w-12 text-green-600/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 hover:shadow-xl transition-all duration-300">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Hari Tersibuk</p>
                                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                                                {stats.busiest_day}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Paling banyak kelas</p>
                                        </div>
                                        <TrendingUp className="h-12 w-12 text-orange-600/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Next Class Card */}
                    {nextClass && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:shadow-2xl transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                                                colorVariants[nextClass.color].gradient
                                            )}>
                                                <Sparkles className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl">Kelas Selanjutnya</CardTitle>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {nextClass.is_today ? '🔥 Hari ini' : `📅 ${nextClass.day}`}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={cn("text-base px-4 py-2", colorVariants[nextClass.color].badge)}>
                                            <Clock className="h-4 w-4 mr-2" />
                                            {nextClass.time_range}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-200">
                                                {nextClass.course_name}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {nextClass.course_code}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-slate-500" />
                                                <span className="text-slate-700 dark:text-slate-300">{nextClass.dosen_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-slate-500" />
                                                <span className="text-slate-700 dark:text-slate-300">{nextClass.ruangan}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Timer className="h-4 w-4 text-slate-500" />
                                                <span className="text-slate-700 dark:text-slate-300">{nextClass.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Schedule Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Target className="h-6 w-6 text-blue-600" />
                                    Jadwal Mingguan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue={currentDay} className="w-full">
                                    <TabsList className="grid w-full grid-cols-7 bg-slate-100 dark:bg-slate-800 p-1">
                                        {daysOrder.map((day) => (
                                            <TabsTrigger 
                                                key={day} 
                                                value={day}
                                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                                            >
                                                {day.substring(0, 3)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {daysOrder.map((day) => (
                                        <TabsContent key={day} value={day} className="space-y-4 mt-6">
                                            {schedules[day] && schedules[day].length > 0 ? (
                                                schedules[day].map((schedule, index) => (
                                                    <motion.div
                                                        key={schedule.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    >
                                                        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group border-l-4">
                                                            <div className={cn(
                                                                "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity",
                                                                colorVariants[schedule.color].gradient
                                                            )}></div>
                                                            <CardContent className="p-6 relative">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1 space-y-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <Badge className={cn("text-sm px-3 py-1", colorVariants[schedule.color].badge)}>
                                                                                <Clock className="h-3 w-3 mr-1" />
                                                                                {schedule.time_range}
                                                                            </Badge>
                                                                            <span className="text-xs text-slate-500">{schedule.duration}</span>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                                                                                {schedule.course_name}
                                                                            </h4>
                                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                                {schedule.course_code}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                                            <div className="flex items-center gap-2">
                                                                                <User className="h-4 w-4" />
                                                                                <span>{schedule.dosen_name}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <MapPin className="h-4 w-4" />
                                                                                <span>{schedule.ruangan}</span>
                                                                            </div>
                                                                        </div>
                                                                        {schedule.notes && (
                                                                            <p className="text-sm text-slate-500 italic">{schedule.notes}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className={cn(
                                                                        "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                                                                        colorVariants[schedule.color].gradient
                                                                    )}>
                                                                        <GraduationCap className="h-6 w-6 text-white" />
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="text-center py-16">
                                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                                        <Calendar className="h-10 w-10 text-slate-400" />
                                                    </div>
                                                    <h3 className="font-semibold text-xl mb-2 text-slate-700 dark:text-slate-300">
                                                        Tidak Ada Kelas
                                                    </h3>
                                                    <p className="text-slate-500">
                                                        Tidak ada jadwal kuliah pada hari {day}
                                                    </p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </StudentLayout>
    );
}
