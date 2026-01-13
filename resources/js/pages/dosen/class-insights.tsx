import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    BarChart3, Users, Clock, AlertTriangle, Award, TrendingUp, TrendingDown
} from 'lucide-react';

interface Props {
    dosen: { id: number; nama: string };
    courses: Array<{ id: number; nama: string; sks: number }>;
    selectedCourseId: number | null;
    insights: {
        course: { id: number; nama: string; sks: number };
        summary: {
            total_sessions: number;
            total_students: number;
            average_attendance: number;
            students_at_risk: number;
        };
        byMeeting: Array<{
            meeting: number;
            title: string;
            date: string;
            total: number;
            present: number;
            late: number;
            absent: number;
            rate: number;
        }>;
        frequentlyLate: Array<{
            id: number;
            nama: string;
            nim: string;
            late_count: number;
            late_percentage: number;
        }>;
        atRisk: Array<{
            id: number;
            nama: string;
            nim: string;
            absent_count: number;
            can_take_uas: boolean;
        }>;
        topPerformers: Array<{
            id: number;
            nama: string;
            nim: string;
            attended: number;
            rate: number;
            on_time_rate: number;
        }>;
    } | null;
    comparison: Array<{
        id: number;
        nama: string;
        sks: number;
        total_sessions: number;
        attendance_rate: number;
    }>;
}

export default function ClassInsights({ dosen, courses, selectedCourseId, insights, comparison }: Props) {
    const handleCourseChange = (courseId: string) => {
        router.get('/dosen/class-insights', { course_id: courseId }, { preserveState: true });
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Class Insights" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-6 w-6" />
                            Class Insights
                        </h1>
                        <p className="text-muted-foreground">Analisis kehadiran per kelas</p>
                    </div>
                    <Select value={String(selectedCourseId || '')} onValueChange={handleCourseChange}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Pilih Mata Kuliah" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(c => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Course Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Perbandingan Mata Kuliah</CardTitle>
                        <CardDescription>Ranking berdasarkan tingkat kehadiran</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {comparison.map((c, idx) => (
                                <div key={c.id} className="flex items-center gap-4">
                                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">{c.nama}</span>
                                            <span className="text-sm">{c.attendance_rate}%</span>
                                        </div>
                                        <Progress value={c.attendance_rate} className="h-2" />
                                    </div>
                                    <Badge variant="outline">{c.total_sessions} sesi</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {!selectedCourseId && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Pilih mata kuliah untuk melihat insights detail</p>
                        </CardContent>
                    </Card>
                )}

                {insights && (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Sesi</p>
                                            <p className="text-2xl font-bold">{insights.summary.total_sessions}</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Mahasiswa</p>
                                            <p className="text-2xl font-bold">{insights.summary.total_students}</p>
                                        </div>
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Rata-rata</p>
                                            <p className="text-2xl font-bold text-green-600">{insights.summary.average_attendance}%</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Berisiko</p>
                                            <p className="text-2xl font-bold text-red-600">{insights.summary.students_at_risk}</p>
                                        </div>
                                        <AlertTriangle className="h-8 w-8 text-red-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Attendance by Meeting */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Kehadiran per Pertemuan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {insights.byMeeting.map(m => (
                                        <div key={m.meeting} className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <span className="font-medium">{m.title}</span>
                                                    <span className="text-sm text-muted-foreground ml-2">{m.date}</span>
                                                </div>
                                                <Badge variant={m.rate >= 80 ? 'default' : m.rate >= 60 ? 'secondary' : 'destructive'}>
                                                    {m.rate}%
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded dark:bg-green-900/30">
                                                    Hadir: {m.present}
                                                </span>
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded dark:bg-yellow-900/30">
                                                    Terlambat: {m.late}
                                                </span>
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded dark:bg-red-900/30">
                                                    Absen: {m.absent}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Top Performers */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-500" />
                                        Top Performers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {insights.topPerformers.map((s, idx) => (
                                            <div key={s.id} className="flex items-center gap-3">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    idx === 0 ? 'bg-yellow-500 text-white' :
                                                    idx === 1 ? 'bg-gray-400 text-white' :
                                                    idx === 2 ? 'bg-orange-600 text-white' :
                                                    'bg-muted'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{s.nama}</p>
                                                    <p className="text-xs text-muted-foreground">{s.nim}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-green-600">{s.rate}%</p>
                                                    <p className="text-xs text-muted-foreground">{s.on_time_rate}% tepat waktu</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Frequently Late */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-yellow-500" />
                                        Sering Terlambat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {insights.frequentlyLate.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                Tidak ada mahasiswa yang sering terlambat
                                            </p>
                                        ) : (
                                            insights.frequentlyLate.map(s => (
                                                <div key={s.id} className="flex items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{s.nama}</p>
                                                        <p className="text-xs text-muted-foreground">{s.nim}</p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {s.late_count}x ({s.late_percentage}%)
                                                    </Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* At Risk */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Mahasiswa Berisiko
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {insights.atRisk.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                Tidak ada mahasiswa berisiko
                                            </p>
                                        ) : (
                                            insights.atRisk.map(s => (
                                                <div key={s.id} className="flex items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{s.nama}</p>
                                                        <p className="text-xs text-muted-foreground">{s.nim}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={s.can_take_uas ? 'secondary' : 'destructive'}>
                                                            {s.absent_count}x absen
                                                        </Badge>
                                                        {!s.can_take_uas && (
                                                            <p className="text-xs text-red-600 mt-1">Tidak bisa UAS</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </DosenLayout>
    );
}
