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

// Advanced Animation Variants with 3D Effects
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05,
            when: "beforeChildren" as const,
        },
    },
};

const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: 60,
        scale: 0.8,
        rotateX: -15,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
            mass: 0.8,
        },
    },
};

const cardVariants = {
    hidden: { 
        opacity: 0, 
        y: 40,
        scale: 0.85,
        rotateY: -10,
    },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        rotateY: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 120,
            damping: 18,
            delay: i * 0.08,
        },
    }),
    hover: {
        y: -12,
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
        z: 50,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 20,
        },
    },
};

const scheduleItemVariants = {
    hidden: { 
        opacity: 0, 
        x: -30,
        scale: 0.85,
        rotateZ: -5,
    },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        scale: 1,
        rotateZ: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 150,
            damping: 20,
            delay: i * 0.06,
        },
    }),
    hover: {
        scale: 1.05,
        x: 8,
        rotateZ: 2,
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.2)",
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 20,
        },
    },
};

export default function AcademicSchedule({ weeklySchedule, currentDay, dayNames, today }: Props) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    // Enhanced animations with 3D effects, parallax, particles, and glow

    useEffect(() => {
        // Track mouse for parallax effect
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <StudentLayout>
            <Head title="Jadwal Kuliah" />
            
            {/* Animated Background Particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <motion.div 
                className="flex flex-col gap-6 p-4 md:p-6 relative"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Header with Parallax */}
                <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-4 relative"
                    style={{
                        x: mousePosition.x * 0.5,
                        y: mousePosition.y * 0.5,
                    }}
                >
                    <motion.div
                        whileHover={{ 
                            scale: 1.2, 
                            rotate: -10,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                        }}
                        whileTap={{ scale: 0.9, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Link href="/user/akademik" className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </motion.div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <motion.div
                                animate={{ 
                                    rotate: [0, 15, -15, 0],
                                    scale: [1, 1.2, 1.2, 1]
                                }}
                                transition={{ 
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                                whileHover={{
                                    rotate: 360,
                                    scale: 1.3,
                                    transition: { duration: 0.6 }
                                }}
                            >
                                <Calendar className="h-7 w-7 text-blue-600" />
                            </motion.div>
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Jadwal Mingguan
                            </motion.span>
                        </h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-muted-foreground"
                        >
                            {today.day}, {today.date}
                        </motion.p>
                    </div>
                    
                    {/* Floating Glow Effect */}
                    <motion.div
                        className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl -z-10 blur-xl"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {/* Legend with Enhanced Animations */}
                <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap gap-4 text-sm relative"
                >
                    {/* Animated Background Wave */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 rounded-2xl -z-10"
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: "200% 200%"
                        }}
                    />
                    
                    {[
                        { color: 'bg-blue-500', label: 'Online' },
                        { color: 'bg-emerald-500', label: 'Offline (Kamis)' },
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -30, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ 
                                delay: 0.3 + i * 0.1,
                                type: "spring",
                                stiffness: 200
                            }}
                            whileHover={{ 
                                scale: 1.15, 
                                x: 10,
                                transition: { type: "spring", stiffness: 400 }
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <motion.div 
                                className={`w-3 h-3 rounded-full ${item.color} relative`}
                                animate={{ 
                                    scale: [1, 1.3, 1],
                                    opacity: [1, 0.6, 1],
                                    boxShadow: [
                                        "0 0 0 0 rgba(59, 130, 246, 0.7)",
                                        "0 0 0 8px rgba(59, 130, 246, 0)",
                                        "0 0 0 0 rgba(59, 130, 246, 0)"
                                    ]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.4
                                }}
                            />
                            <motion.span
                                whileHover={{ x: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {item.label}
                            </motion.span>
                        </motion.div>
                    ))}
                    <motion.div 
                        initial={{ opacity: 0, x: -30, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ 
                            delay: 0.5,
                            type: "spring",
                            stiffness: 200
                        }}
                        whileHover={{ 
                            scale: 1.15, 
                            x: 10,
                            transition: { type: "spring", stiffness: 400 }
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 360]
                            }}
                            transition={{ 
                                scale: { duration: 1.5, repeat: Infinity },
                                rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                            }}
                        >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </motion.div>
                        <motion.span
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Selesai
                        </motion.span>
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

                {/* Info Card with Glow Effect */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ 
                        scale: 1.02, 
                        y: -4,
                        boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.3)"
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative"
                >
                    {/* Animated Glow Background */}
                    <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl opacity-20 blur-lg -z-10"
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    
                    <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30 border-blue-200 dark:border-blue-800 relative overflow-hidden">
                        {/* Animated Shine Effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{
                                x: ['-100%', '200%'],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "easeInOut"
                            }}
                        />
                        
                        <CardContent className="p-4 relative">
                            <div className="flex items-start gap-3">
                                <motion.div 
                                    className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg relative"
                                    animate={{ 
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1],
                                        boxShadow: [
                                            "0 0 0 0 rgba(59, 130, 246, 0.4)",
                                            "0 0 0 8px rgba(59, 130, 246, 0)",
                                            "0 0 0 0 rgba(59, 130, 246, 0)"
                                        ]
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
