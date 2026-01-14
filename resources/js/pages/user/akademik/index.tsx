import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    BookOpen, Calendar, CheckCircle2, Clock, AlertTriangle, 
    FileText, ArrowRight, GraduationCap, ListTodo, NotebookPen, Sparkles, Target, TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
    todaySchedule: Array<{
        id: number;
        course_name: string;
        time: string;
        meeting_number: number;
        total_meetings: number;
        mode: 'online' | 'offline';
        is_completed: boolean;
    }>;
    pendingTasks: Array<{
        id: number;
        title: string;
        course_name: string;
        deadline: string | null;
        deadline_formatted: string | null;
        days_remaining: number | null;
        is_overdue: boolean;
        status: string;
    }>;
    upcomingExams: Array<{
        id: number;
        course_name: string;
        type: 'UTS' | 'UAS';
        date: string;
        date_formatted: string;
        days_remaining: number;
        is_warning: boolean;
        is_critical: boolean;
    }>;
    courseProgress: Array<{
        id: number;
        name: string;
        progress: number;
        current_meeting: number;
        total_meetings: number;
        mode: 'online' | 'offline';
    }>;
    recentNotes: Array<{
        id: number;
        title: string;
        course_name: string;
        course_mode: 'online' | 'offline';
        meeting_number: number;
        created_at: string;
    }>;
    stats: {
        totalCourses: number;
        completedTasks: number;
        pendingTasks: number;
        overdueTasks: number;
        weeklyProgress: number;
    };
    today: {
        day: string;
        date: string;
    };
}

export default function AcademicDashboard({ 
    todaySchedule, pendingTasks, upcomingExams, courseProgress, recentNotes, stats, today 
}: Props) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const completionRate = stats.totalCourses > 0 
        ? Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks + stats.overdueTasks)) * 100) || 0
        : 0;

    return (
        <StudentLayout>
            <Head title="Akademik" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                <GraduationCap className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100 font-medium">{today.day}, {today.date}</p>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    Dashboard Akademik
                                    <Sparkles className="h-6 w-6 animate-pulse" />
                                </h1>
                            </div>
                        </div>
                        <p className="mt-4 text-emerald-100">Kelola jadwal, tugas, dan catatan kuliah kamu</p>
                        
                        {/* Quick Stats */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <BookOpen className="h-4 w-4 text-emerald-200" />
                                    <p className="text-emerald-100 text-xs font-medium">Mata Kuliah</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                                    <p className="text-emerald-100 text-xs font-medium">Tugas Selesai</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-emerald-200" />
                                    <p className="text-emerald-100 text-xs font-medium">Tugas Pending</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="h-4 w-4 text-emerald-200" />
                                    <p className="text-emerald-100 text-xs font-medium">Completion</p>
                                </div>
                                <p className="text-2xl font-bold">{completionRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={`grid gap-4 grid-cols-2 md:grid-cols-4 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Mata Kuliah</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.totalCourses}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Tugas Selesai</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.completedTasks}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Tugas Pending</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.pendingTasks}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Terlambat</p>
                                <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className={`grid gap-3 grid-cols-2 md:grid-cols-5 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                    {[
                        { href: '/user/akademik/jadwal', icon: Calendar, label: 'Jadwal', color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/30' },
                        { href: '/user/akademik/tugas', icon: ListTodo, label: 'Tugas', color: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/30' },
                        { href: '/user/akademik/catatan', icon: NotebookPen, label: 'Catatan', color: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/30' },
                        { href: '/user/akademik/matkul', icon: BookOpen, label: 'Mata Kuliah', color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/30' },
                        { href: '/user/akademik/ujian', icon: GraduationCap, label: 'Ujian', color: 'from-red-400 to-red-600', shadow: 'shadow-red-500/30' },
                    ].map((item, index) => (
                        <Link key={item.href} href={item.href}>
                            <div 
                                className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all cursor-pointer group hover:scale-[1.02]"
                                style={{ 
                                    animationDelay: `${index * 50}ms`,
                                    animation: isLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow} group-hover:scale-110 transition-transform`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-sm text-slate-900 dark:text-white">{item.label}</span>
                                    <ArrowRight className="h-4 w-4 ml-auto text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Today's Schedule */}
                    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Hari Ini</h2>
                                    <p className="text-xs text-slate-500">{todaySchedule.length} perkuliahan</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {todaySchedule.length > 0 ? (
                                <div className="space-y-3">
                                    {todaySchedule.map((item, index) => (
                                        <div 
                                            key={item.id} 
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                            style={{ 
                                                animationDelay: `${index * 100}ms`,
                                                animation: isLoaded ? 'fadeInLeft 0.5s ease-out forwards' : 'none'
                                            }}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900 dark:text-white">{item.course_name}</span>
                                                    <Badge variant={item.mode === 'offline' ? 'default' : 'secondary'} className="text-xs">
                                                        {item.mode === 'offline' ? 'Offline' : 'Online'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    {item.time} • Pertemuan {item.meeting_number}/{item.total_meetings}
                                                </p>
                                            </div>
                                            {item.is_completed && (
                                                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Calendar className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Tidak ada jadwal hari ini</p>
                                    <p className="text-sm text-slate-400">Nikmati waktu luangmu!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pending Tasks */}
                    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '350ms' }}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                                        <ListTodo className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Tugas Pending</h2>
                                        <p className="text-xs text-slate-500">{pendingTasks.length} tugas menunggu</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/tugas" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    Lihat Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            {pendingTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingTasks.slice(0, 4).map((task, index) => (
                                        <div 
                                            key={task.id} 
                                            className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                                                task.is_overdue 
                                                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30' 
                                                    : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                                                    <p className="text-sm text-slate-500">{task.course_name}</p>
                                                </div>
                                                {task.deadline_formatted && (
                                                    <Badge 
                                                        variant={task.is_overdue ? 'destructive' : task.days_remaining !== null && task.days_remaining <= 3 ? 'secondary' : 'outline'} 
                                                        className="shrink-0"
                                                    >
                                                        {task.is_overdue ? '⚠️ Terlambat' : task.days_remaining !== null ? `${task.days_remaining} hari` : task.deadline_formatted}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Semua tugas selesai! 🎉</p>
                                    <p className="text-sm text-slate-400">Kerja bagus!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upcoming Exams */}
                    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-red-600 text-white">
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Ujian Mendatang</h2>
                                        <p className="text-xs text-slate-500">{upcomingExams.length} ujian terjadwal</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/ujian" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    Lihat Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            {upcomingExams.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingExams.slice(0, 3).map((exam) => (
                                        <div 
                                            key={exam.id} 
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                exam.is_critical 
                                                    ? 'border-red-300 bg-gradient-to-r from-red-50 to-rose-50 dark:border-red-700 dark:from-red-950/40 dark:to-rose-950/40' 
                                                    : exam.is_warning 
                                                        ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-950/40 dark:to-orange-950/40' 
                                                        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={exam.type === 'UTS' ? 'secondary' : 'default'} className="font-semibold">
                                                            {exam.type}
                                                        </Badge>
                                                        <span className="font-medium text-slate-900 dark:text-white">{exam.course_name}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">{exam.date_formatted}</p>
                                                </div>
                                                <div className={`text-right p-2 rounded-xl ${
                                                    exam.is_critical ? 'bg-red-100 dark:bg-red-900/30' : 
                                                    exam.is_warning ? 'bg-amber-100 dark:bg-amber-900/30' : 
                                                    'bg-slate-100 dark:bg-slate-800'
                                                }`}>
                                                    <p className={`text-2xl font-bold ${
                                                        exam.is_critical ? 'text-red-600' : 
                                                        exam.is_warning ? 'text-amber-600' : 
                                                        'text-slate-700 dark:text-slate-300'
                                                    }`}>{exam.days_remaining}</p>
                                                    <p className="text-xs text-slate-500">hari lagi</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <GraduationCap className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Belum ada ujian terjadwal</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Course Progress */}
                    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '450ms' }}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Progress Mata Kuliah</h2>
                                        <p className="text-xs text-slate-500">Pertemuan yang sudah dilalui</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/matkul" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    Kelola <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            {courseProgress.length > 0 ? (
                                <div className="space-y-4">
                                    {courseProgress.slice(0, 4).map((course) => (
                                        <div key={course.id} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-slate-900 dark:text-white">{course.name}</span>
                                                    <Badge variant="outline" className="text-xs">{course.mode}</Badge>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    {course.current_meeting}/{course.total_meetings}
                                                </span>
                                            </div>
                                            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out group-hover:from-emerald-500 group-hover:to-emerald-700"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <BookOpen className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Belum ada mata kuliah</p>
                                    <Link href="/user/akademik/matkul" className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
                                        Tambah Mata Kuliah
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Notes */}
                {recentNotes.length > 0 && (
                    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                                        <NotebookPen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Catatan Terbaru</h2>
                                        <p className="text-xs text-slate-500">Catatan kuliah terakhir</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/catatan" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    Lihat Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                {recentNotes.map((note, index) => (
                                    <Link key={note.id} href="/user/akademik/catatan">
                                        <div 
                                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group hover:scale-[1.02]"
                                            style={{ 
                                                animationDelay: `${index * 100}ms`,
                                                animation: isLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={note.course_mode === 'offline' ? 'default' : 'secondary'} className="text-xs">
                                                    {note.course_mode}
                                                </Badge>
                                                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">P{note.meeting_number}</span>
                                            </div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{note.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{note.course_name}</p>
                                            <p className="text-xs text-slate-400 mt-2">{note.created_at}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </StudentLayout>
    );
}
