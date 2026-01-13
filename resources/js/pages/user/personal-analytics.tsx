import StudentLayout from '@/layouts/student-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    BarChart3, TrendingUp, TrendingDown, Flame, Award, Calendar,
    CheckCircle, Clock, XCircle, AlertTriangle, Lightbulb, Users,
    BookOpen, FileText, GraduationCap
} from 'lucide-react';

interface ActivityDay {
    date: string;
    count: number;
    level: number;
    types: string[];
    dayOfWeek: number;
    week: number;
    month: number;
    monthName: string;
}

interface Props {
    mahasiswa: { id: number; nama: string; nim: string };
    overview: {
        total_sessions: number;
        present: number;
        late: number;
        absent: number;
        overall_rate: number;
        on_time_rate: number;
        this_month_rate: number;
        trend: number;
        trend_direction: 'up' | 'down' | 'stable';
    };
    streakData: {
        current_streak: number;
        longest_streak: number;
        last_attendance: string | null;
    };
    courseBreakdown: Array<{
        course_id: number;
        course_name: string;
        total: number;
        present: number;
        late: number;
        absent: number;
        rate: number;
        can_take_uas: boolean;
    }>;
    weeklyTrend: Array<{
        date: string;
        day: string;
        status: string;
        time: string | null;
    }>;
    activityGraph: {
        activities: ActivityDay[];
        weeks: ActivityDay[][];
        months: Array<{ month: number; name: string }>;
        totalActivities: number;
        activeDays: number;
        longestStreak: number;
        currentStreak: number;
    };
    comparison: {
        my_rate: number;
        class_average: number;
        difference: number;
        rank: number;
        total_students: number;
        percentile: number;
        status: 'above' | 'below';
    };
    badges: Array<{
        id: number;
        name: string;
        description: string;
        icon: string;
        color: string;
        category: string;
        points: number;
        earned_at: string;
    }>;
    tips: Array<{
        type: 'success' | 'warning' | 'danger' | 'info';
        title: string;
        message: string;
    }>;
}

export default function PersonalAnalytics({
    mahasiswa, overview, streakData, courseBreakdown, weeklyTrend,
    activityGraph, comparison, badges, tips
}: Props) {
    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'present': return 'bg-green-500';
            case 'late': return 'bg-yellow-500';
            case 'rejected': case 'absent': return 'bg-red-500';
            case 'permit': case 'sick': return 'bg-blue-500';
            default: return 'bg-gray-200 dark:bg-gray-700';
        }
    };

    const getTipIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'danger': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Lightbulb className="h-5 w-5 text-blue-500" />;
        }
    };

    const getTipBg = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200';
            case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
            case 'danger': return 'bg-red-50 dark:bg-red-900/20 border-red-200';
            default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
        }
    };

    const getActivityColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-gray-100 dark:bg-gray-800';
            case 1: return 'bg-emerald-200 dark:bg-emerald-900';
            case 2: return 'bg-emerald-400 dark:bg-emerald-700';
            case 3: return 'bg-emerald-500 dark:bg-emerald-600';
            case 4: return 'bg-emerald-600 dark:bg-emerald-500';
            default: return 'bg-gray-100 dark:bg-gray-800';
        }
    };

    const getBadgeGradient = (color: string) => {
        switch (color) {
            case 'orange': return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
            case 'yellow': return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
            case 'green': return 'bg-gradient-to-br from-green-400 to-green-600 text-white';
            case 'blue': return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white';
            case 'purple': return 'bg-gradient-to-br from-purple-400 to-purple-600 text-white';
            case 'red': return 'bg-gradient-to-br from-red-400 to-red-600 text-white';
            case 'emerald': return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white';
            case 'pink': return 'bg-gradient-to-br from-pink-400 to-pink-600 text-white';
            default: return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white';
        }
    };

    const getBadgeEmoji = (category: string) => {
        switch (category) {
            case 'streak': return '🔥';
            case 'attendance': return '✅';
            case 'achievement': return '🏆';
            case 'special': return '⭐';
            default: return '🎖️';
        }
    };

    const formatActivityDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const getActivityTypeLabel = (types: string[]) => {
        const labels: string[] = [];
        if (types.includes('attendance')) labels.push('Absensi');
        if (types.includes('task')) labels.push('Tugas');
        if (types.includes('note')) labels.push('Catatan');
        return labels.join(', ');
    };

    return (
        <StudentLayout>
            <Head title="Personal Analytics" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-6 w-6" />
                        Personal Analytics
                    </h1>
                    <p className="text-muted-foreground">Analisis aktivitas akademik kamu</p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Rate Kehadiran</p>
                                    <p className="text-2xl font-bold">{overview.overall_rate}%</p>
                                </div>
                                {overview.trend_direction === 'up' ? (
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                ) : overview.trend_direction === 'down' ? (
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {overview.trend > 0 ? '+' : ''}{overview.trend}% dari bulan lalu
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Streak Aktivitas</p>
                                    <p className="text-2xl font-bold">{activityGraph.currentStreak} hari</p>
                                </div>
                                <Flame className={`h-5 w-5 ${activityGraph.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Terpanjang: {activityGraph.longestStreak} hari
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Aktivitas</p>
                                    <p className="text-2xl font-bold">{activityGraph.totalActivities}</p>
                                </div>
                                <Calendar className="h-5 w-5 text-blue-500" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {activityGraph.activeDays} hari aktif
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ranking</p>
                                    <p className="text-2xl font-bold">#{comparison.rank}</p>
                                </div>
                                <Users className="h-5 w-5 text-purple-500" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Top {comparison.percentile}% dari {comparison.total_students} mahasiswa
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* GitHub-style Activity Graph */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calendar className="h-5 w-5" />
                            Aktivitas Setahun Terakhir
                        </CardTitle>
                        <CardDescription>
                            {activityGraph.totalActivities} aktivitas dalam setahun terakhir
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto pb-2">
                            {/* Month labels */}
                            <div className="flex mb-1 ml-8">
                                {activityGraph.months.map((m, i) => (
                                    <div 
                                        key={i} 
                                        className="text-xs text-muted-foreground"
                                        style={{ width: `${100 / activityGraph.months.length}%`, minWidth: '30px' }}
                                    >
                                        {m.name}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Activity grid */}
                            <div className="flex gap-[2px]">
                                {/* Day labels */}
                                <div className="flex flex-col gap-[2px] mr-1 text-xs text-muted-foreground">
                                    <div className="h-[10px]"></div>
                                    <div className="h-[10px] flex items-center">Sen</div>
                                    <div className="h-[10px]"></div>
                                    <div className="h-[10px] flex items-center">Rab</div>
                                    <div className="h-[10px]"></div>
                                    <div className="h-[10px] flex items-center">Jum</div>
                                    <div className="h-[10px]"></div>
                                </div>
                                
                                {/* Weeks */}
                                <TooltipProvider>
                                    <div className="flex gap-[2px]">
                                        {activityGraph.weeks.map((week, weekIndex) => (
                                            <div key={weekIndex} className="flex flex-col gap-[2px]">
                                                {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                                                    const day = week.find(d => d.dayOfWeek === dayOfWeek);
                                                    if (!day) {
                                                        return <div key={dayOfWeek} className="w-[10px] h-[10px]" />;
                                                    }
                                                    return (
                                                        <Tooltip key={dayOfWeek}>
                                                            <TooltipTrigger asChild>
                                                                <div 
                                                                    className={`w-[10px] h-[10px] rounded-sm ${getActivityColor(day.level)} cursor-pointer hover:ring-1 hover:ring-gray-400`}
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs">
                                                                <p className="font-medium">{formatActivityDate(day.date)}</p>
                                                                {day.count > 0 ? (
                                                                    <>
                                                                        <p>{day.count} aktivitas</p>
                                                                        <p className="text-muted-foreground">{getActivityTypeLabel(day.types)}</p>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-muted-foreground">Tidak ada aktivitas</p>
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </TooltipProvider>
                            </div>
                            
                            {/* Legend */}
                            <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
                                <span>Sedikit</span>
                                <div className="flex gap-[2px]">
                                    {[0, 1, 2, 3, 4].map(level => (
                                        <div key={level} className={`w-[10px] h-[10px] rounded-sm ${getActivityColor(level)}`} />
                                    ))}
                                </div>
                                <span>Banyak</span>
                            </div>
                            
                            {/* Activity type legend */}
                            <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                                <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>Absensi</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-blue-500" />
                                    <span>Tugas</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3 text-purple-500" />
                                    <span>Catatan</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Weekly Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Kehadiran Minggu Ini</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between">
                                {weeklyTrend.map((d, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-xs text-muted-foreground mb-2">{d.day}</p>
                                        <div className={`w-10 h-10 rounded-full ${getStatusColor(d.status)} flex items-center justify-center mx-auto`}>
                                            {d.status === 'present' && <CheckCircle className="h-5 w-5 text-white" />}
                                            {d.status === 'late' && <Clock className="h-5 w-5 text-white" />}
                                            {(d.status === 'rejected' || d.status === 'absent') && <XCircle className="h-5 w-5 text-white" />}
                                        </div>
                                        <p className="text-xs mt-2">{d.date}</p>
                                        {d.time && <p className="text-xs text-muted-foreground">{d.time}</p>}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Class Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Perbandingan dengan Kelas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Kamu</span>
                                <span className="font-bold">{comparison.my_rate}%</span>
                            </div>
                            <Progress value={comparison.my_rate} className="h-3" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Rata-rata Kelas</span>
                                <span className="font-bold">{comparison.class_average}%</span>
                            </div>
                            <Progress value={comparison.class_average} className="h-3 bg-muted" />
                            <div className={`p-3 rounded-lg ${comparison.status === 'above' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                <p className={`text-sm font-medium ${comparison.status === 'above' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {comparison.status === 'above' 
                                        ? `🎉 Kamu ${comparison.difference}% di atas rata-rata!`
                                        : `📈 Kamu ${Math.abs(comparison.difference)}% di bawah rata-rata`
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Course Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kehadiran per Mata Kuliah</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {courseBreakdown.map(course => (
                                <div key={course.course_id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium">{course.course_name}</p>
                                            <div className="flex gap-2 mt-1 text-xs">
                                                <span className="text-green-600">Hadir: {course.present}</span>
                                                <span className="text-yellow-600">Terlambat: {course.late}</span>
                                                <span className="text-red-600">Absen: {course.absent}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={course.rate >= 80 ? 'default' : course.rate >= 60 ? 'secondary' : 'destructive'}>
                                                {course.rate}%
                                            </Badge>
                                            {!course.can_take_uas && (
                                                <p className="text-xs text-red-600 mt-1">⚠️ Tidak bisa UAS</p>
                                            )}
                                        </div>
                                    </div>
                                    <Progress value={course.rate} className="h-2" />
                                </div>
                            ))}
                            {courseBreakdown.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada data kehadiran</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Badges */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                Badge Kamu ({badges.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {badges.length > 0 ? (
                                <div className="space-y-3">
                                    {badges.map(badge => (
                                        <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r from-transparent to-transparent hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/10 dark:hover:to-orange-900/10 transition-colors">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${getBadgeGradient(badge.color)}`}>
                                                {getBadgeEmoji(badge.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm truncate">{badge.name}</p>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                        +{badge.points} pts
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{badge.description}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Diperoleh {badge.earned_at}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada badge</p>
                                    <p className="text-xs">Terus tingkatkan aktivitas untuk mendapatkan badge!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                Tips & Saran
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {tips.map((tip, i) => (
                                    <div key={i} className={`p-3 rounded-lg border ${getTipBg(tip.type)}`}>
                                        <div className="flex items-start gap-3">
                                            {getTipIcon(tip.type)}
                                            <div>
                                                <p className="font-medium text-sm">{tip.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{tip.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StudentLayout>
    );
}
