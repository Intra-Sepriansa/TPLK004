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

export default function DosenCourses({ dosen, courses }: PageProps) {
    return (
        <DosenLayout>
            <Head title="Mata Kuliah" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-100">Daftar</p>
                                <h1 className="text-2xl font-bold">Mata Kuliah</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-indigo-100">
                            {courses.length} mata kuliah yang Anda ampu
                        </p>
                    </div>
                </div>

                {/* Course Grid */}
                {courses.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-12 text-center shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <GraduationCap className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Belum Ada Mata Kuliah</h3>
                        <p className="text-slate-500 mt-2">Anda belum ditugaskan ke mata kuliah manapun.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map(course => (
                            <Link key={course.id} href={`/dosen/courses/${course.id}`}>
                                <div className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md hover:border-indigo-200 dark:border-slate-800/70 dark:bg-slate-950/70 dark:hover:border-indigo-800">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium dark:bg-indigo-900/30 dark:text-indigo-400">
                                            {course.sks} SKS
                                        </span>
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
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="h-4 w-4" />
                                                <span>{course.totalSessions} sesi</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Users className="h-4 w-4" />
                                                <span>{course.totalStudents} mhs</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-xs text-slate-400 capitalize">{course.role}</span>
                                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DosenLayout>
    );
}
