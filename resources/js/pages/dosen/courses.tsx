import { Head, Link } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Progress } from '@/components/ui/progress';
import {
    BookOpen,
    Users,
    Calendar,
    TrendingUp,
    ChevronRight,
    GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    role: string;
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
    return (
        <DosenLayout>
            <Head title="Mata Kuliah" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Header */}
                <motion.div
                    variants={cardVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />

                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                            >
                                <BookOpen className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-indigo-100"
                                >
                                    Daftar
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl font-bold"
                                >
                                    Mata Kuliah
                                </motion.h1>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-indigo-100"
                        >
                            {courses.length} mata kuliah yang Anda ampu
                        </motion.p>
                    </div>
                </motion.div>

                {/* Course Grid */}
                {courses.length === 0 ? (
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
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Belum Ada Mata Kuliah</h3>
                        <p className="text-slate-500 mt-2">Anda belum ditugaskan ke mata kuliah manapun.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {courses.map((course, index) => (
                            <Link key={course.id} href={`/dosen/courses/${course.id}`}>
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md hover:border-indigo-200 dark:border-gray-800/70 dark:bg-black/80 dark:hover:border-indigo-800"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <motion.div
                                            whileHover={{ rotate: 10 }}
                                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                        >
                                            <BookOpen className="h-6 w-6" />
                                        </motion.div>
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 + 0.2 }}
                                            className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium dark:bg-indigo-900/30 dark:text-indigo-400"
                                        >
                                            {course.sks} SKS
                                        </motion.span>
                                    </div>

                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                                        {course.nama}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">{course.kode}</p>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Kehadiran</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{course.attendanceRate}%</span>
                                        </div>
                                        <Progress value={course.attendanceRate} className="h-2" />

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-2 text-sm text-slate-500"
                                            >
                                                <Calendar className="h-4 w-4" />
                                                <span>{course.totalSessions} sesi</span>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-2 text-sm text-slate-500"
                                            >
                                                <Users className="h-4 w-4" />
                                                <span>{course.totalStudents} mhs</span>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                                        <span className="text-xs text-slate-400 capitalize">{course.role}</span>
                                        <motion.div whileHover={{ x: 5 }}>
                                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                        </motion.div>
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
