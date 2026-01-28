import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    User, 
    BookOpen, 
    TrendingUp,
    ChevronRight,
    CalendarDays,
    Timer,
    GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const colorVariants: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    green: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-700 dark:text-pink-300', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-300', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
};

const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function Schedule({ schedules, todaySchedule, nextClass, stats, currentDay }: Props) {
    return (
        <>
            <Head title="Jadwal Kuliah" />

            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Jadwal Kuliah</h1>
                            <p className="text-muted-foreground mt-1">
                                Lihat jadwal kuliah mingguan Anda
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{currentDay}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Mata Kuliah</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_courses}</div>
                                <p className="text-xs text-muted-foreground">Semester ini</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Kelas Per Minggu</CardTitle>
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_classes_per_week}</div>
                                <p className="text-xs text-muted-foreground">Total pertemuan</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Kelas Hari Ini</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.classes_today}</div>
                                <p className="text-xs text-muted-foreground">Pertemuan {currentDay}</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Hari Tersibuk</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.busiest_day}</div>
                                <p className="text-xs text-muted-foreground">Paling banyak kelas</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Next Class Card */}
                {nextClass && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Card className={cn(
                            "border-2",
                            colorVariants[nextClass.color].border,
                            colorVariants[nextClass.color].bg
                        )}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            colorVariants[nextClass.color].badge
                                        )}>
                                            <GraduationCap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Kelas Selanjutnya</CardTitle>
                                            <CardDescription>
                                                {nextClass.is_today ? 'Hari ini' : nextClass.day}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={colorVariants[nextClass.color].badge}>
                                        {nextClass.time_range}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className={cn("font-semibold text-lg", colorVariants[nextClass.color].text)}>
                                            {nextClass.course_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{nextClass.course_code}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{nextClass.dosen_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{nextClass.ruangan}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Timer className="h-4 w-4 text-muted-foreground" />
                                            <span>{nextClass.duration}</span>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Jadwal Mingguan</CardTitle>
                            <CardDescription>
                                Lihat jadwal kuliah per hari
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={currentDay} className="w-full">
                                <TabsList className="grid w-full grid-cols-7">
                                    {daysOrder.map((day) => (
                                        <TabsTrigger 
                                            key={day} 
                                            value={day}
                                            className="text-xs"
                                        >
                                            {day.substring(0, 3)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {daysOrder.map((day, dayIndex) => (
                                    <TabsContent key={day} value={day} className="space-y-4 mt-4">
                                        {schedules[day] && schedules[day].length > 0 ? (
                                            schedules[day].map((schedule, index) => (
                                                <motion.div
                                                    key={schedule.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                >
                                                    <Card className={cn(
                                                        "border-l-4 hover:shadow-md transition-shadow",
                                                        colorVariants[schedule.color].border
                                                    )}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge 
                                                                            variant="secondary"
                                                                            className={colorVariants[schedule.color].badge}
                                                                        >
                                                                            {schedule.time_range}
                                                                        </Badge>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {schedule.duration}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-semibold text-base">
                                                                            {schedule.course_name}
                                                                        </h4>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {schedule.course_code}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <User className="h-3.5 w-3.5" />
                                                                            <span>{schedule.dosen_name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <MapPin className="h-3.5 w-3.5" />
                                                                            <span>{schedule.ruangan}</span>
                                                                        </div>
                                                                    </div>
                                                                    {schedule.notes && (
                                                                        <p className="text-sm text-muted-foreground italic">
                                                                            {schedule.notes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="font-semibold text-lg mb-2">Tidak Ada Kelas</h3>
                                                <p className="text-muted-foreground">
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
        </>
    );
}
