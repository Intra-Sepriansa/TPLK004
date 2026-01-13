import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    BookOpen, Calendar, CheckCircle2, Clock, AlertTriangle, 
    FileText, ArrowRight, GraduationCap, ListTodo, NotebookPen
} from 'lucide-react';

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
    return (
        <StudentLayout>
            <Head title="Akademik" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-7 w-7 text-emerald-600" />
                        Akademik
                    </h1>
                    <p className="text-muted-foreground">{today.day}, {today.date}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.totalCourses}</p>
                                    <p className="text-xs text-emerald-600/80">Mata Kuliah</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.completedTasks}</p>
                                    <p className="text-xs text-blue-600/80">Tugas Selesai</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.pendingTasks}</p>
                                    <p className="text-xs text-amber-600/80">Tugas Pending</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.overdueTasks}</p>
                                    <p className="text-xs text-red-600/80">Terlambat</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Navigation */}
                <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                    {[
                        { href: '/user/akademik/jadwal', icon: Calendar, label: 'Jadwal', color: 'text-blue-600' },
                        { href: '/user/akademik/tugas', icon: ListTodo, label: 'Tugas', color: 'text-amber-600' },
                        { href: '/user/akademik/catatan', icon: NotebookPen, label: 'Catatan', color: 'text-purple-600' },
                        { href: '/user/akademik/matkul', icon: BookOpen, label: 'Mata Kuliah', color: 'text-emerald-600' },
                        { href: '/user/akademik/ujian', icon: GraduationCap, label: 'Ujian', color: 'text-red-600' },
                    ].map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Today's Schedule */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                Jadwal Hari Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {todaySchedule.length > 0 ? (
                                <div className="space-y-3">
                                    {todaySchedule.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{item.course_name}</span>
                                                    <Badge variant={item.mode === 'offline' ? 'default' : 'secondary'} className="text-xs">
                                                        {item.mode === 'offline' ? 'Offline' : 'Online'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.time} • Pertemuan {item.meeting_number}/{item.total_meetings}
                                                </p>
                                            </div>
                                            {item.is_completed && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p>Tidak ada jadwal hari ini</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending Tasks */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ListTodo className="h-5 w-5 text-amber-600" />
                                    Tugas Pending
                                </CardTitle>
                                <Link href="/user/akademik/tugas" className="text-sm text-primary hover:underline">
                                    Lihat Semua
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {pendingTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingTasks.map((task) => (
                                        <div key={task.id} className={`p-3 rounded-lg border ${task.is_overdue ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30' : 'bg-muted/50'}`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium">{task.title}</p>
                                                    <p className="text-sm text-muted-foreground">{task.course_name}</p>
                                                </div>
                                                {task.deadline_formatted && (
                                                    <Badge variant={task.is_overdue ? 'destructive' : task.days_remaining !== null && task.days_remaining <= 3 ? 'secondary' : 'outline'} className="shrink-0">
                                                        {task.is_overdue ? 'Terlambat' : task.days_remaining !== null ? `${task.days_remaining} hari` : task.deadline_formatted}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50 text-emerald-500" />
                                    <p>Semua tugas selesai! 🎉</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upcoming Exams */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-red-600" />
                                    Ujian Mendatang
                                </CardTitle>
                                <Link href="/user/akademik/ujian" className="text-sm text-primary hover:underline">
                                    Lihat Semua
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {upcomingExams.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingExams.map((exam) => (
                                        <div key={exam.id} className={`p-3 rounded-lg border ${exam.is_critical ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/40' : exam.is_warning ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40' : 'bg-muted/50'}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={exam.type === 'UTS' ? 'secondary' : 'default'}>{exam.type}</Badge>
                                                        <span className="font-medium">{exam.course_name}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{exam.date_formatted}</p>
                                                </div>
                                                <div className={`text-right ${exam.is_critical ? 'text-red-600' : exam.is_warning ? 'text-amber-600' : ''}`}>
                                                    <p className="text-2xl font-bold">{exam.days_remaining}</p>
                                                    <p className="text-xs">hari lagi</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada ujian terjadwal</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Course Progress */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-emerald-600" />
                                    Progress Mata Kuliah
                                </CardTitle>
                                <Link href="/user/akademik/matkul" className="text-sm text-primary hover:underline">
                                    Kelola
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {courseProgress.length > 0 ? (
                                <div className="space-y-4">
                                    {courseProgress.map((course) => (
                                        <div key={course.id}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{course.name}</span>
                                                    <Badge variant="outline" className="text-xs">{course.mode}</Badge>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {course.current_meeting}/{course.total_meetings}
                                                </span>
                                            </div>
                                            <Progress value={course.progress} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada mata kuliah</p>
                                    <Link href="/user/akademik/matkul" className="text-sm text-primary hover:underline mt-2 inline-block">
                                        Tambah Mata Kuliah
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Notes */}
                {recentNotes.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <NotebookPen className="h-5 w-5 text-purple-600" />
                                    Catatan Terbaru
                                </CardTitle>
                                <Link href="/user/akademik/catatan" className="text-sm text-primary hover:underline">
                                    Lihat Semua
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-3">
                                {recentNotes.map((note) => (
                                    <Link key={note.id} href="/user/akademik/catatan">
                                        <div className="p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={note.course_mode === 'offline' ? 'default' : 'secondary'} className="text-xs">
                                                    {note.course_mode}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">P{note.meeting_number}</span>
                                            </div>
                                            <p className="font-medium text-sm line-clamp-1">{note.title}</p>
                                            <p className="text-xs text-muted-foreground">{note.course_name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{note.created_at}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StudentLayout>
    );
}
