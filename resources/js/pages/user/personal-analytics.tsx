import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    BarChart3, TrendingUp, TrendingDown, Flame, Award, Calendar,
    CheckCircle, Clock, XCircle, AlertTriangle, Lightbulb, Users
} from 'lucide-react';

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
    monthlyCalendar: Array<{
        date: string;
        day: number;
        dayOfWeek: number;
        status: string | null;
        isToday: boolean;
        isPast: boolean;
    }>;
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
        image: string;
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
    monthlyCalendar, comparison, badges, tips
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

    return (
        <UserLayout>
            <Head title="Personal Analytics" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-6 w-6" />
                        Personal Analytics
                    </h1>
                    <p className="text-muted-foreground">Analisis kehadiran pribadi kamu</p>
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
                                    <p className="text-sm text-muted-foreground">Streak</p>
                                    <p className="text-2xl font-bold">{streakData.current_streak} hari</p>
                                </div>
                                <Flame className={`h-5 w-5 ${streakData.current_streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Terpanjang: {streakData.longest_streak} hari
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tepat Waktu</p>
                                    <p className="text-2xl font-bold">{overview.on_time_rate}%</p>
                                </div>
                                <Clock className="h-5 w-5 text-blue-500" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {overview.present} dari {overview.present + overview.late} kehadiran
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
                                <p className={`text-sm font-medium ${comparison.status === 'above' ? 'text-green-700' : 'text-red-700'}`}>
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
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Calendar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Kalender Bulan Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                                <div key={d} className="text-muted-foreground font-medium py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {/* Empty cells for days before month starts */}
                            {monthlyCalendar[0] && Array.from({ length: monthlyCalendar[0].dayOfWeek }, (_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {monthlyCalendar.map(day => (
                                <div
                                    key={day.date}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                                        day.isToday ? 'ring-2 ring-primary' : ''
                                    } ${getStatusColor(day.status)} ${
                                        day.status ? 'text-white' : ''
                                    }`}
                                >
                                    {day.day}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-4 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-green-500" /> Hadir
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-yellow-500" /> Terlambat
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-red-500" /> Absen
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-blue-500" /> Izin/Sakit
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Badges */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                Badge Kamu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {badges.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {badges.map(badge => (
                                        <div key={badge.id} className="text-center">
                                            <img
                                                src={badge.image || '/images/badges/default.png'}
                                                alt={badge.name}
                                                className="w-16 h-16 mx-auto"
                                            />
                                            <p className="text-xs font-medium mt-2">{badge.name}</p>
                                            <p className="text-xs text-muted-foreground">{badge.earned_at}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada badge</p>
                                    <p className="text-xs">Terus tingkatkan kehadiran untuk mendapatkan badge!</p>
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
        </UserLayout>
    );
}
