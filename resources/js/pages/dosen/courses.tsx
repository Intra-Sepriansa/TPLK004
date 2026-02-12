import { Head, Link } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
    BookOpen,
    Users,
    Calendar,
    TrendingUp,
    ChevronRight,
    GraduationCap,
    Search,
    Filter,
    BarChart3,
    Award,
    Clock,
    Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
}

interface Course {
    id: number;
    nama: string;
    kode: string;
    sks: number;
    totalSessions: number;
    totalStudents: number;
    attendanceRate: number;
}

interface PageProps {
    dosen: DosenInfo;
    courses: Course[];
}

// Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 17,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};

export default function DosenCourses({ dosen, courses }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'students' | 'attendance'>('name');

    // Calculate stats
    const totalStudents = courses.reduce((sum, c) => sum + c.totalStudents, 0);
    const totalSessions = courses.reduce((sum, c) => sum + c.totalSessions, 0);
    const avgAttendance = courses.length > 0 
        ? Math.round(courses.reduce((sum, c) => sum + c.attendanceRate, 0) / courses.length)
        : 0;

    // Filter and sort courses
    const filteredCourses = courses
        .filter(course => 
            course.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.kode.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.nama.localeCompare(b.nama);
            if (sortBy === 'students') return b.totalStudents - a.totalStudents;
            if (sortBy === 'attendance') return b.attendanceRate - a.attendanceRate;
            return 0;
        });

    return (
        <DosenLayout>
            <Head title="Mata Kuliah" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Enhanced Header with Black Gradient Background */}
                <motion.div
                    variants={cardVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 text-white shadow-2xl border border-gray-800"
                >
                    {/* Animated Background Orbs */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl animate-pulse" />
                    <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
                            >
                                <BookOpen className="h-8 w-8" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-gray-400"
                                >
                                    Daftar Mata Kuliah
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold"
                                >
                                    Mata Kuliah Anda
                                </motion.h1>
                            </div>
                        </div>

                        {/* Stats Grid - Inside Header */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[
                                { icon: BookOpen, label: 'Total Matkul', value: courses.length, color: 'from-blue-500 to-cyan-600', iconBg: 'bg-blue-500' },
                                { icon: Users, label: 'Total Mahasiswa', value: totalStudents, color: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-500' },
                                { icon: Calendar, label: 'Total Sesi', value: totalSessions, color: 'from-purple-500 to-violet-600', iconBg: 'bg-purple-500' },
                                { icon: TrendingUp, label: 'Rata-rata Kehadiran', value: avgAttendance, suffix: '%', color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-500' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.03, y: -4 }}
                                    className="group relative rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2.5 rounded-xl ${stat.iconBg} shadow-lg`}>
                                                <stat.icon className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-400 mb-2">{stat.label}</p>
                                        <p className="text-2xl font-bold">
                                            {stat.value}{stat.suffix || ''}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filter Section */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm p-6 shadow-sm dark:border-gray-800/70 dark:bg-black/80"
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari mata kuliah atau kode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-2 focus:ring-4 focus:ring-indigo-500/20"
                            />
                        </div>

                        {/* Sort Options */}
                        <div className="flex gap-2">
                            {[
                                { value: 'name' as const, label: 'Nama', icon: BookOpen },
                                { value: 'students' as const, label: 'Mahasiswa', icon: Users },
                                { value: 'attendance' as const, label: 'Kehadiran', icon: TrendingUp },
                            ].map((option) => (
                                <motion.button
                                    key={option.value}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSortBy(option.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all",
                                        sortBy === option.value
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-400 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <option.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{option.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-sm text-slate-500"
                    >
                        Menampilkan {filteredCourses.length} dari {courses.length} mata kuliah
                    </motion.p>
                </motion.div>

                {/* Course Grid */}
                {filteredCourses.length === 0 ? (
                    <motion.div
                        variants={cardVariants}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-12 text-center shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <GraduationCap className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {searchQuery ? 'Tidak Ada Hasil' : 'Belum Ada Mata Kuliah'}
                        </h3>
                        <p className="text-slate-500 mt-2">
                            {searchQuery 
                                ? `Tidak ditemukan mata kuliah dengan kata kunci "${searchQuery}"`
                                : 'Anda belum ditugaskan ke mata kuliah manapun.'
                            }
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {filteredCourses.map((course, index) => (
                            <Link key={course.id} href={`/dosen/courses/${course.id}`}>
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.03, y: -8 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative rounded-2xl border-2 border-slate-200/70 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-sm backdrop-blur transition-all hover:shadow-xl hover:border-indigo-300 dark:border-gray-800/70 dark:from-black dark:to-gray-900/50 dark:hover:border-indigo-700 overflow-hidden"
                                >
                                    {/* Shimmer effect on hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ 
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <motion.div
                                                whileHover={{ rotate: 10, scale: 1.1 }}
                                                className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                                            >
                                                <BookOpen className="h-7 w-7" />
                                            </motion.div>
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 + 0.2 }}
                                                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg"
                                            >
                                                {course.sks} SKS
                                            </motion.span>
                                        </div>

                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                            {course.nama}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-4 font-mono">{course.kode}</p>

                                        <div className="space-y-4">
                                            {/* Attendance Progress */}
                                            <div>
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-slate-600 dark:text-slate-400 font-medium">Tingkat Kehadiran</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{course.attendanceRate}%</span>
                                                </div>
                                                <div className="relative h-3 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${course.attendanceRate}%` }}
                                                        transition={{ duration: 1, delay: index * 0.1 }}
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            course.attendanceRate >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-600" :
                                                            course.attendanceRate >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-600" :
                                                            "bg-gradient-to-r from-rose-500 to-red-600"
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <motion.div
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                                                        <Calendar className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-blue-600 dark:text-blue-400">Sesi</p>
                                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-300">{course.totalSessions}</p>
                                                    </div>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Mahasiswa</p>
                                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{course.totalStudents}</p>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-end mt-5 pt-4 border-t-2 border-slate-100 dark:border-gray-800">
                                            <motion.div 
                                                whileHover={{ x: 5 }}
                                                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium text-sm"
                                            >
                                                <span>Lihat Detail</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </DosenLayout>
    );
}
