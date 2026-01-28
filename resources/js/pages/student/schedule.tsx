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

            {/* Black Background Container */}
            <div className="min-h-screen bg-black p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header with Advanced Animations */}
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                            duration: 0.8,
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                        }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-8 text-white shadow-2xl"
                    >
                        {/* Animated Background Particles */}
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 90, 0],
                                    opacity: [0.1, 0.2, 0.1]
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white blur-3xl"
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    rotate: [0, -90, 0],
                                    opacity: [0.1, 0.15, 0.1]
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white blur-2xl"
                            />
                            {/* Floating Sparkles */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ 
                                        opacity: [0, 1, 0],
                                        scale: [0, 1, 0],
                                        y: [0, -30, -60]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: i * 0.5,
                                        ease: "easeOut"
                                    }}
                                    className="absolute rounded-full bg-white/30"
                                    style={{
                                        width: `${4 + Math.random() * 8}px`,
                                        height: `${4 + Math.random() * 8}px`,
                                        left: `${10 + i * 15}%`,
                                        top: `${20 + (i % 3) * 25}%`,
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative z-10">
                            {/* Title Section with Stagger Animation */}
                            <div className="flex items-start gap-4 mb-8">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                        delay: 0.2
                                    }}
                                    whileHover={{ 
                                        scale: 1.1,
                                        rotate: 360,
                                        transition: { duration: 0.6 }
                                    }}
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm cursor-pointer"
                                >
                                    <CalendarDays className="h-7 w-7" />
                                </motion.div>
                                <div className="flex-1">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center gap-2 mb-1"
                                    >
                                        <span className="text-sm font-medium text-blue-100">Akademik</span>
                                    </motion.div>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-3xl font-bold mb-2"
                                    >
                                        Jadwal Kuliah
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-blue-100 text-sm"
                                    >
                                        Lihat dan kelola jadwal kuliah dengan mudah dan terorganisir
                                    </motion.p>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: "spring" }}
                                    whileHover={{ scale: 1.05 }}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium text-sm">{currentDay}</span>
                                </motion.div>
                            </div>

                            {/* Stats Grid with Advanced Stagger */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: BookOpen, label: 'Total Kuliah', value: stats.total_courses, color: 'blue-400/30', delay: 0.1 },
                                    { icon: Clock, label: 'Hari Ini', value: stats.classes_today, color: 'green-400/30', delay: 0.2 },
                                    { icon: CalendarDays, label: 'Per Minggu', value: stats.total_classes_per_week, color: 'purple-400/30', delay: 0.3 },
                                    { icon: TrendingUp, label: 'Tersibuk', value: stats.busiest_day, color: 'orange-400/30', delay: 0.4, isText: true },
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ 
                                            delay: stat.delay,
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 15
                                        }}
                                        whileHover={{ 
                                            scale: 1.05,
                                            y: -5,
                                            transition: { type: "spring", stiffness: 400, damping: 10 }
                                        }}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className={cn("flex h-10 w-10 items-center justify-center rounded-xl", `bg-${stat.color}`)}
                                        >
                                            <stat.icon className="h-5 w-5" />
                                        </motion.div>
                                        <div>
                                            <p className="text-xs text-blue-100">{stat.label}</p>
                                            <motion.p
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: stat.delay + 0.2, type: "spring" }}
                                                className={stat.isText ? "text-xl font-bold" : "text-2xl font-bold"}
                                            >
                                                {stat.value}
                                            </motion.p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Next Class Card with Advanced Animation */}
                    {nextClass && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                                duration: 0.6,
                                type: "spring",
                                stiffness: 100,
                                delay: 0.5
                            }}
                            whileHover={{ 
                                scale: 1.02,
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                        >
                            <Card className="relative overflow-hidden border-2 border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                                {/* Animated Glow Effect */}
                                <motion.div
                                    animate={{
                                        opacity: [0.3, 0.6, 0.3],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={cn(
                                        "absolute inset-0 bg-gradient-to-r opacity-10 blur-xl",
                                        colorVariants[nextClass.color].gradient
                                    )}
                                />
                                
                                <CardHeader className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                className={cn(
                                                    "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                                                    colorVariants[nextClass.color].gradient
                                                )}
                                            >
                                                <Sparkles className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <CardTitle className="text-2xl text-white">Kelas Selanjutnya</CardTitle>
                                                <p className="text-sm text-slate-400">
                                                    {nextClass.is_today ? '🔥 Hari ini' : `📅 ${nextClass.day}`}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Badge className={cn("text-base px-4 py-2", colorVariants[nextClass.color].badge)}>
                                                <Clock className="h-4 w-4 mr-2" />
                                                {nextClass.time_range}
                                            </Badge>
                                        </motion.div>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-2xl text-white">
                                                {nextClass.course_name}
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {nextClass.course_code}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <motion.div
                                                whileHover={{ x: 5 }}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <User className="h-4 w-4 text-slate-500" />
                                                <span className="text-slate-300">{nextClass.dosen_name}</span>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ x: 5 }}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <MapPin className="h-4 w-4 text-slate-500" />
                                                <span className="text-slate-300">{nextClass.ruangan}</span>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ x: 5 }}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Timer className="h-4 w-4 text-slate-500" />
                                                <span className="text-slate-300">{nextClass.duration}</span>
                                            </motion.div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Schedule Tabs with Advanced Animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                            duration: 0.6,
                            type: "spring",
                            stiffness: 100,
                            delay: 0.6
                        }}
                    >
                        <Card className="bg-slate-900 border-slate-800 backdrop-blur-sm shadow-2xl">
                            <CardHeader>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <CardTitle className="text-2xl flex items-center gap-2 text-white">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Target className="h-6 w-6 text-blue-500" />
                                        </motion.div>
                                        Jadwal Mingguan
                                    </CardTitle>
                                </motion.div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue={currentDay} className="w-full">
                                    <TabsList className="grid w-full grid-cols-7 bg-slate-800 p-1 border border-slate-700">
                                        {daysOrder.map((day, index) => (
                                            <motion.div
                                                key={day}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 + index * 0.05 }}
                                            >
                                                <TabsTrigger 
                                                    value={day}
                                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white text-slate-400 hover:text-white transition-all"
                                                >
                                                    {day.substring(0, 3)}
                                                </TabsTrigger>
                                            </motion.div>
                                        ))}
                                    </TabsList>
                                    {daysOrder.map((day) => (
                                        <TabsContent key={day} value={day} className="space-y-4 mt-6">
                                            {schedules[day] && schedules[day].length > 0 ? (
                                                schedules[day].map((schedule, index) => (
                                                    <motion.div
                                                        key={schedule.id}
                                                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                                        transition={{ 
                                                            duration: 0.4,
                                                            delay: index * 0.1,
                                                            type: "spring",
                                                            stiffness: 200
                                                        }}
                                                        whileHover={{ 
                                                            scale: 1.02,
                                                            x: 10,
                                                            transition: { type: "spring", stiffness: 400, damping: 10 }
                                                        }}
                                                    >
                                                        <Card className="relative overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group border-l-4 border-slate-800 bg-slate-800/50">
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                whileHover={{ opacity: 0.1 }}
                                                                transition={{ duration: 0.3 }}
                                                                className={cn(
                                                                    "absolute inset-0 bg-gradient-to-r",
                                                                    colorVariants[schedule.color].gradient
                                                                )}
                                                            />
                                                            <CardContent className="p-6 relative">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1 space-y-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <motion.div
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.95 }}
                                                                            >
                                                                                <Badge className={cn("text-sm px-3 py-1", colorVariants[schedule.color].badge)}>
                                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                                    {schedule.time_range}
                                                                                </Badge>
                                                                            </motion.div>
                                                                            <span className="text-xs text-slate-500">{schedule.duration}</span>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-lg text-white">
                                                                                {schedule.course_name}
                                                                            </h4>
                                                                            <p className="text-sm text-slate-400">
                                                                                {schedule.course_code}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                                                            <motion.div
                                                                                whileHover={{ x: 5 }}
                                                                                className="flex items-center gap-2"
                                                                            >
                                                                                <User className="h-4 w-4" />
                                                                                <span>{schedule.dosen_name}</span>
                                                                            </motion.div>
                                                                            <motion.div
                                                                                whileHover={{ x: 5 }}
                                                                                className="flex items-center gap-2"
                                                                            >
                                                                                <MapPin className="h-4 w-4" />
                                                                                <span>{schedule.ruangan}</span>
                                                                            </motion.div>
                                                                        </div>
                                                                        {schedule.notes && (
                                                                            <p className="text-sm text-slate-500 italic">{schedule.notes}</p>
                                                                        )}
                                                                    </div>
                                                                    <motion.div
                                                                        whileHover={{ 
                                                                            rotate: 360,
                                                                            scale: 1.1
                                                                        }}
                                                                        transition={{ duration: 0.6 }}
                                                                        className={cn(
                                                                            "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                                                                            colorVariants[schedule.color].gradient
                                                                        )}
                                                                    >
                                                                        <GraduationCap className="h-6 w-6 text-white" />
                                                                    </motion.div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="text-center py-16"
                                                >
                                                    <motion.div
                                                        animate={{ 
                                                            scale: [1, 1.1, 1],
                                                            rotate: [0, 5, -5, 0]
                                                        }}
                                                        transition={{ 
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-4"
                                                    >
                                                        <Calendar className="h-10 w-10 text-slate-600" />
                                                    </motion.div>
                                                    <h3 className="font-semibold text-xl mb-2 text-slate-300">
                                                        Tidak Ada Kelas
                                                    </h3>
                                                    <p className="text-slate-500">
                                                        Tidak ada jadwal kuliah pada hari {day}
                                                    </p>
                                                </motion.div>
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
