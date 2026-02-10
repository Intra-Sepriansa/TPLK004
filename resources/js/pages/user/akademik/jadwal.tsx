import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle2, ArrowLeft, Monitor, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ScheduleItem {
    id: number;
    course_name: string;
    time: string;
    meeting_number: number;
    total_meetings: number;
    mode: 'online' | 'offline';
    is_completed: boolean;
    progress: number;
}

interface Props {
    weeklySchedule: {
        [day: string]: ScheduleItem[];
    };
    currentDay: string;
    dayNames: {
        [key: string]: string;
    };
    today: {
        day: string;
        date: string;
    };
}

// Animation Variants
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
    hidden: { 
        opacity: 0, 
        y: 30,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
        },
    },
};

const cardVariants = {
    hidden: { 
        opacity: 0, 
        y: 20,
    },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 120,
            damping: 18,
            delay: i * 0.05,
        },
    }),
    hover: {
        y: -5,
        scale: 1.02,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 25,
        },
    },
};

const scheduleItemVariants = {
    hidden: { 
        opacity: 0, 
        x: -20,
        scale: 0.9,
    },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 150,
            damping: 20,
            delay: i * 0.05,
        },
    }),
    hover: {
        scale: 1.03,
        x: 5,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 25,
        },
    },
};

export default function AcademicSchedule({ weeklySchedule, currentDay, dayNames, today }: Props) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <StudentLayout>
            <Head title="Jadwal Kuliah" />
            <motion.div 
                className="flex flex-col gap-6 p-4 md:p-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link href="/user/akademik" className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </motion.div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <motion.div
                                animate={{ 
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <Calendar className="h-7 w-7 text-blue-600" />
                            </motion.div>
                            Jadwal Mingguan
                        </h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground"
                        >
                            {today.day}, {today.date}
                        </motion.p>
                    </div>
                </motion.div>

                {/* Legend */}
                <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap gap-4 text-sm"
                >
                    {[
                        { color: 'bg-blue-500', label: 'Online' },
                        { color: 'bg-emerald-500', label: 'Offline (Kamis)' },
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            whileHover={{ scale: 1.05, x: 5 }}
                            className="flex items-center gap-2"
                        >
                            <motion.div 
                                className={`w-3 h-3 rounded-full ${item.color}`}
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [1, 0.7, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3
                                }}
                            />
                            <span>{item.label}</span>
                        </motion.div>
                    ))}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.05, x: 5 }}
                        className="flex items-center gap-2"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </motion.div>
                        <span>Selesai</span>
                    </motion.div>
                </motion.div>

                {/* Weekly Schedule */}
                <motion.div 
                    className="grid gap-4 md:grid-cols-5"
                    variants={containerVariants}
                >
                    {days.map((day, dayIndex) => {
                        const isToday = day === currentDay;
                        const schedule = weeklySchedule[day] || [];
                        
                        return (
                            <motion.div
                                key={day}
                                custom={dayIndex}
                                variants={cardVariants}
                                whileHover="hover"
                            >
                                <Card 
                                    className={`${isToday ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''} overflow-hidden`}
                                >
                                <CardHeader className="pb-2">
                                    <CardTitle className={`text-base flex items-center justify-between ${isToday ? 'text-blue-600' : ''}`}>
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: dayIndex * 0.05 }}
                                        >
                                            {dayNames[day]}
                                        </motion.span>
                                        <AnimatePresence>
                                            {isToday && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                                >
                                                    <Badge variant="default" className="bg-blue-500 text-xs">
                                                        Hari Ini
                                                    </Badge>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {schedule.length > 0 ? (
                                            schedule.map((item, itemIndex) => (
                                                <motion.div 
                                                    key={item.id}
                                                    custom={itemIndex}
                                                    variants={scheduleItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                                    whileHover="hover"
                                                    layout
                                                    className={`p-3 rounded-lg border cursor-pointer ${
                                                        item.is_completed 
                                                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' 
                                                            : item.mode === 'offline' 
                                                                ? 'bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/50'
                                                                : 'bg-blue-50/50 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-800/50'
                                                    }`}
                                                >
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <motion.div
                                                            animate={{ 
                                                                rotate: [0, 5, -5, 0],
                                                                scale: [1, 1.1, 1]
                                                            }}
                                                            transition={{ 
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                repeatDelay: 5
                                                            }}
                                                        >
                                                            {item.mode === 'offline' ? (
                                                                <Building2 className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <Monitor className="h-4 w-4 text-blue-600" />
                                                            )}
                                                        </motion.div>
                                                        <motion.div
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Badge 
                                                                variant={item.mode === 'offline' ? 'default' : 'secondary'} 
                                                                className={`text-xs ${item.mode === 'offline' ? 'bg-emerald-500' : ''}`}
                                                            >
                                                                {item.mode === 'offline' ? 'Offline' : 'Online'}
                                                            </Badge>
                                                        </motion.div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {item.is_completed && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                exit={{ scale: 0, rotate: 180 }}
                                                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <motion.p 
                                                    className="font-medium text-sm line-clamp-2"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    {item.course_name}
                                                </motion.p>
                                                <motion.div 
                                                    className="flex items-center gap-1 text-xs text-muted-foreground mt-1"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.15 }}
                                                >
                                                    <Clock className="h-3 w-3" />
                                                    <span>{item.time}</span>
                                                </motion.div>
                                                <motion.div 
                                                    className="mt-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span>Pertemuan {item.meeting_number}/{item.total_meetings}</span>
                                                        <motion.span
                                                            key={item.progress}
                                                            initial={{ scale: 1.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: 'spring', stiffness: 300 }}
                                                        >
                                                            {item.progress}%
                                                        </motion.span>
                                                    </div>
                                                    <motion.div
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: 1 }}
                                                        transition={{ delay: 0.3, duration: 0.5 }}
                                                        style={{ transformOrigin: 'left' }}
                                                    >
                                                        <Progress value={item.progress} className="h-1.5" />
                                                    </motion.div>
                                                </motion.div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200 }}
                                            className="text-center py-6 text-muted-foreground"
                                        >
                                            <motion.div
                                                animate={{ 
                                                    rotate: [0, 10, -10, 0],
                                                    scale: [1, 1.1, 1]
                                                }}
                                                transition={{ 
                                                    duration: 3,
                                                    repeat: Infinity
                                                }}
                                            >
                                                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            </motion.div>
                                            <p className="text-xs">Tidak ada jadwal</p>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Info Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <motion.div 
                                    className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg"
                                    animate={{ 
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ 
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatDelay: 2
                                    }}
                                >
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </motion.div>
                                <div>
                                    <motion.p 
                                        className="font-medium"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Jadwal Kelas 06TPLK004
                                    </motion.p>
                                    <motion.p 
                                        className="text-sm text-muted-foreground mt-1"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        Perkuliahan online dilaksanakan Senin - Jumat. Perkuliahan offline hanya di hari Kamis.
                                    </motion.p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
