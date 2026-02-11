import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2, ArrowLeft, Monitor, Building2, MapPin, BookOpen, X, Download } from 'lucide-react';
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

// Simple Animation Variants
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
        y: 20,
    },
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
            stiffness: 200,
            damping: 20,
            delay: i * 0.05,
        },
    }),
};

const scheduleItemVariants = {
    hidden: { 
        opacity: 0, 
        x: -10,
    },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 200,
            damping: 20,
            delay: i * 0.03,
        },
    }),
};

export default function AcademicSchedule({ weeklySchedule, currentDay, dayNames, today }: Props) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter schedules
    const filterSchedules = (schedule: ScheduleItem[]) => {
        return schedule.filter(item => {
            const matchesMode = filterMode === 'all' || item.mode === filterMode;
            const matchesSearch = item.course_name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesMode && matchesSearch;
        });
    };

    // Export schedule as text
    const exportSchedule = () => {
        let text = `JADWAL MINGGUAN - ${today.date}\n\n`;
        days.forEach(day => {
            const schedule = weeklySchedule[day] || [];
            if (schedule.length > 0) {
                text += `${dayNames[day].toUpperCase()}\n`;
                schedule.forEach(item => {
                    text += `- ${item.course_name}\n`;
                    text += `  Waktu: ${item.time}\n`;
                    text += `  Mode: ${item.mode === 'offline' ? 'Offline' : 'Online'}\n`;
                    text += `  Pertemuan: ${item.meeting_number}/${item.total_meetings}\n\n`;
                });
            }
        });
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jadwal-mingguan-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <StudentLayout>
            <Head title="Jadwal Kuliah" />
            
            {/* Subtle Background Gradient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden bg-gradient-to-br from-blue-50/30 to-emerald-50/30 dark:from-blue-950/10 dark:to-emerald-950/10" />

            <motion.div 
                className="flex flex-col gap-6 p-4 md:p-6 relative"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-4 relative"
                >
                    <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        <Link href="/user/akademik" className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </motion.div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <motion.div
                                whileHover={{ scale: 1.2, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                </motion.div>

                {/* Legend */}
                <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap gap-4 text-sm relative"
                >
                    {[
                        { color: 'bg-blue-500', label: 'Online' },
                        { color: 'bg-emerald-500', label: 'Offline (Kamis)' },
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                                delay: 0.2 + i * 0.05,
                                type: "spring",
                                stiffness: 200
                            }}
                            whileHover={{ scale: 1.05, x: 3 }}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span>{item.label}</span>
                        </motion.div>
                    ))}
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                            delay: 0.3,
                            type: "spring",
                            stiffness: 200
                        }}
                        whileHover={{ scale: 1.05, x: 3 }}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Selesai</span>
                    </motion.div>
                </motion.div>

                {/* Filter and Search Bar */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Cari mata kuliah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12"
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            {searchQuery && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        {[
                            { value: 'all' as const, label: 'Semua', icon: Calendar },
                            { value: 'online' as const, label: 'Online', icon: Monitor },
                            { value: 'offline' as const, label: 'Offline', icon: Building2 },
                        ].map((filter) => (
                            <motion.button
                                key={filter.value}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterMode(filter.value)}
                                className={`flex items-center gap-2 px-4 h-12 rounded-lg border-2 transition-all ${
                                    filterMode === filter.value
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-background border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                }`}
                            >
                                <filter.icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{filter.label}</span>
                            </motion.button>
                        ))}
                        
                        {/* Export Button */}
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={exportSchedule}
                            className="flex items-center gap-2 px-4 h-12 rounded-lg border-2 border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Weekly Schedule */}
                <motion.div 
                    className="grid gap-4 md:grid-cols-5"
                    variants={containerVariants}
                >
                    {days.map((day, dayIndex) => {
                        const isToday = day === currentDay;
                        const schedule = filterSchedules(weeklySchedule[day] || []);
                        
                        return (
                            <motion.div
                                key={dayIndex}
                                custom={dayIndex}
                                variants={cardVariants}
                                whileHover={{ scale: 1.02, y: -3 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                                    whileHover={{ scale: 1.02, x: 3 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                                    layout
                                                    onClick={() => {
                                                        setSelectedSchedule(item);
                                                        setIsDetailOpen(true);
                                                    }}
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
                                                            whileHover={{ scale: 1.2, y: -2 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
                                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
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
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="relative"
                >
                    <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30 border-blue-200 dark:border-blue-800 relative overflow-hidden">
                        <CardContent className="p-4 relative">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
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

            {/* Schedule Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <BookOpen className="h-6 w-6 text-blue-500" />
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
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold">{selectedSchedule.course_name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge 
                                                variant={selectedSchedule.mode === 'offline' ? 'default' : 'secondary'}
                                                className={`${selectedSchedule.mode === 'offline' ? 'bg-emerald-500' : ''}`}
                                            >
                                                {selectedSchedule.mode === 'offline' ? (
                                                    <><Building2 className="h-3 w-3 mr-1" /> Offline</>
                                                ) : (
                                                    <><Monitor className="h-3 w-3 mr-1" /> Online</>
                                                )}
                                            </Badge>
                                            {selectedSchedule.is_completed && (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="text-center"
                                    >
                                        <div className="text-4xl font-bold text-blue-600">
                                            {selectedSchedule.progress}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">Progress</p>
                                    </motion.div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Pertemuan</span>
                                        <span className="font-medium">
                                            {selectedSchedule.meeting_number} dari {selectedSchedule.total_meetings}
                                        </span>
                                    </div>
                                    <Progress value={selectedSchedule.progress} className="h-3" />
                                </div>
                            </div>

                            {/* Schedule Details */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Time Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h4 className="font-semibold">Waktu</h4>
                                    </div>
                                    <p className="text-2xl font-bold">{selectedSchedule.time}</p>
                                </motion.div>

                                {/* Mode Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={`p-4 rounded-xl border-2 ${
                                        selectedSchedule.mode === 'offline'
                                            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                                            : 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${
                                            selectedSchedule.mode === 'offline'
                                                ? 'bg-emerald-100 dark:bg-emerald-900/50'
                                                : 'bg-blue-100 dark:bg-blue-900/50'
                                        }`}>
                                            {selectedSchedule.mode === 'offline' ? (
                                                <Building2 className="h-5 w-5 text-emerald-600" />
                                            ) : (
                                                <Monitor className="h-5 w-5 text-blue-600" />
                                            )}
                                        </div>
                                        <h4 className="font-semibold">Mode</h4>
                                    </div>
                                    <p className="text-2xl font-bold capitalize">{selectedSchedule.mode}</p>
                                </motion.div>
                            </div>

                            {/* Additional Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30 space-y-3"
                            >
                                <h4 className="font-semibold flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-600" />
                                    Informasi Tambahan
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Pertemuan Saat Ini:</span>
                                        <span className="font-medium">Pertemuan {selectedSchedule.meeting_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Total Pertemuan:</span>
                                        <span className="font-medium">{selectedSchedule.total_meetings} pertemuan</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Sisa Pertemuan:</span>
                                        <span className="font-medium">
                                            {selectedSchedule.total_meetings - selectedSchedule.meeting_number} pertemuan
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge variant={selectedSchedule.is_completed ? 'default' : 'secondary'}>
                                            {selectedSchedule.is_completed ? 'Selesai' : 'Berlangsung'}
                                        </Badge>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Close Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="w-full h-12 text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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
