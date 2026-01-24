import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertTriangle, Bell, BookOpen, Calendar, Clock, Eye, FileText, MessageSquare, Search, Sparkles,
    CheckCircle, Filter, TrendingUp, Target, Zap, ArrowRight, ListTodo, BarChart3, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';

type Course = { id: number; nama: string; dosen: string | null };
type Tugas = {
    id: number; judul: string; deskripsi: string; jenis: string;
    deadline: string; deadline_display: string; prioritas: string;
    course: { id: number; nama: string; dosen: string | null }; created_by: string;
    is_overdue: boolean; days_until_deadline: number; is_read: boolean; diskusi_count: number;
};
type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    tugasList: Tugas[]; courses: Course[];
    stats: { total: number; upcoming: number; overdue: number; unread: number };
    filters: { search: string; course_id: string; status: string };
};

export default function UserTugas({ mahasiswa, tugasList, courses, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
            },
        },
    };

    const getPriorityConfig = (p: string) => {
        const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
            tinggi: { bg: 'bg-gradient-to-r from-red-500 to-rose-600', text: 'text-white', icon: Zap, label: 'Tinggi' },
            sedang: { bg: 'bg-gradient-to-r from-amber-500 to-orange-500', text: 'text-white', icon: Target, label: 'Sedang' },
            rendah: { bg: 'bg-gradient-to-r from-emerald-500 to-green-500', text: 'text-white', icon: CheckCircle, label: 'Rendah' },
        };
        return configs[p] || configs.rendah;
    };

    const completionRate = stats.total > 0 ? Math.round(((stats.total - stats.upcoming - stats.overdue) / stats.total) * 100) : 0;

    return (
        <StudentLayout mahasiswa={mahasiswa}>
            <Head title="Informasi Tugas" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* Header with Advanced Animations */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.4, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl"
                        />
                        
                        {/* Floating Task Icons */}
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    y: [0, -40, -80],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            >
                                <FileText className="h-4 w-4 text-white/40" />
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30"
                            >
                                <ListTodo className="h-8 w-8" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-white/90 font-medium"
                                >
                                    Akademik
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold flex items-center gap-2"
                                >
                                    Informasi Tugas
                                </motion.h1>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-white/90 text-lg"
                        >
                            Lihat dan kelola tugas dari dosen dengan mudah dan terorganisir
                        </motion.p>
                        
                        {/* Quick Stats with Dock-Style Animations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {[
                                { icon: FileText, label: 'Total Tugas', value: stats.total },
                                { icon: Clock, label: 'Mendatang', value: stats.upcoming },
                                { icon: AlertTriangle, label: 'Terlewat', value: stats.overdue },
                                { icon: Bell, label: 'Belum Dibaca', value: stats.unread },
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                                    whileHover={{ 
                                        scale: 1.05, 
                                        y: -5,
                                        boxShadow: "0 10px 30px rgba(255,255,255,0.2)"
                                    }}
                                    className="bg-white/10 backdrop-blur rounded-xl p-4 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <stat.icon className="h-5 w-5 text-white/80" />
                                        </motion.div>
                                        <p className="text-white/80 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-3xl font-bold">
                                        <AnimatedCounter value={stat.value} duration={1500} />
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Cards with Dock-Style Animations */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        { icon: FileText, label: 'Total', value: stats.total, gradient: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/50' },
                        { icon: Clock, label: 'Mendatang', value: stats.upcoming, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/50' },
                        { icon: AlertTriangle, label: 'Terlewat', value: stats.overdue, gradient: 'from-red-400 to-red-600', shadow: 'shadow-red-500/50' },
                        { icon: Bell, label: 'Belum Dibaca', value: stats.unread, gradient: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/50' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ 
                                scale: 1.08, 
                                y: -10,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 p-5 shadow-lg backdrop-blur dark:border-slate-800/50 dark:from-slate-900/80 dark:to-black/80 overflow-hidden cursor-pointer"
                        >
                            <div className="relative flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow}`}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} duration={1500} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                            <Filter className="h-4 w-4" />
                        </div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Tugas</h2>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input 
                                placeholder="Cari tugas..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && router.get('/user/tugas', { search, course_id: courseId, status }, { preserveState: true })}
                                className="pl-10 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500" 
                            />
                        </div>
                        <Select value={courseId} onValueChange={(v) => { setCourseId(v); router.get('/user/tugas', { search, course_id: v, status }, { preserveState: true }); }}>
                            <SelectTrigger className="w-full md:w-48 rounded-xl">
                                <SelectValue placeholder="Semua Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={(v) => { setStatus(v); router.get('/user/tugas', { search, course_id: courseId, status: v }, { preserveState: true }); }}>
                            <SelectTrigger className="w-full md:w-40 rounded-xl">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="upcoming">Mendatang</SelectItem>
                                <SelectItem value="overdue">Terlewat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* Tugas List */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                    <ListTodo className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Tugas</h2>
                                    <p className="text-xs text-slate-500">{tugasList.length} tugas ditemukan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {tugasList.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="relative mx-auto w-24 h-24 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg shadow-blue-500/30">
                                        <FileText className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <p className="text-xl font-semibold text-slate-700 dark:text-gray-300">Belum ada tugas</p>
                                <p className="text-sm text-slate-500 mt-2">Tugas dari dosen akan muncul di sini</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tugasList.map((tugas, index) => {
                                    const priorityConfig = getPriorityConfig(tugas.prioritas);
                                    const PriorityIcon = priorityConfig.icon;
                                    
                                    return (
                                        <motion.div
                                            key={tugas.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            onClick={() => router.visit(`/user/tugas/${tugas.id}`)}
                                            className={`rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-xl cursor-pointer group ${
                                                tugas.is_overdue 
                                                    ? 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-800' 
                                                    : !tugas.is_read 
                                                        ? 'border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-700' 
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    {/* Badges */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-black/25">
                                                            {tugas.jenis}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${priorityConfig.bg} ${priorityConfig.text} shadow-lg`}>
                                                            <PriorityIcon className="h-3 w-3" />
                                                            {priorityConfig.label}
                                                        </span>
                                                        {tugas.is_overdue && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse shadow-lg shadow-red-500/25">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Terlewat
                                                            </span>
                                                        )}
                                                        {!tugas.is_read && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                                                                <Sparkles className="h-3 w-3 animate-pulse" />
                                                                Baru
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Title */}
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {tugas.judul}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 mt-2">{tugas.deskripsi}</p>
                                                    
                                                    {/* Meta Info */}
                                                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-sm text-slate-600 dark:text-gray-400">
                                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                                            {tugas.course.nama}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-sm text-slate-600 dark:text-gray-400">
                                                            <Calendar className="h-4 w-4 text-purple-500" />
                                                            {tugas.deadline_display}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-sm text-slate-600 dark:text-gray-400">
                                                            <MessageSquare className="h-4 w-4 text-emerald-500" />
                                                            {tugas.diskusi_count} diskusi
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Deadline Warning */}
                                                    {!tugas.is_overdue && tugas.days_until_deadline <= 3 && tugas.days_until_deadline >= 0 && (
                                                        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                                            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2 font-medium">
                                                                <AlertTriangle className="h-4 w-4 animate-bounce" />
                                                                Deadline dalam {tugas.days_until_deadline} hari!
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Action Button */}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="opacity-0 group-hover:opacity-100 transition-all bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl"
                                                >
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
