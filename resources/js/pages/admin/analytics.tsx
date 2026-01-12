import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Users, Calendar, BookOpen, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface Props {
    mataKuliahList: Array<{ id: number; nama: string; dosen: string }>;
    riskStats: {
        safe: number;
        warning: number;
        danger: number;
        total: number;
        safe_percentage: number;
        warning_percentage: number;
        danger_percentage: number;
    };
    studentsAtRisk: Array<{
        id: number;
        mahasiswa_id: number;
        nama: string;
        nim: string;
        mata_kuliah: string;
        total_sessions: number;
        present_count: number;
        late_count: number;
        permit_count: number;
        absent_count: number;
        attendance_percentage: number;
        activity_score: number;
        risk_status: 'safe' | 'warning' | 'danger';
    }>;
    courseComparison: Array<{
        id: number;
        nama: string;
        dosen: string;
        avg_attendance: number;
        avg_activity_score: number;
        danger_count: number;
        total_students: number;
    }>;
    attendanceTrends: Array<{
        date: string;
        full_date: string;
        present: number;
        late: number;
        absent: number;
        total: number;
        attendance_rate: number;
    }>;
    overallStats: {
        total_mahasiswa: number;
        total_sessions: number;
        avg_attendance_rate: number;
        danger_students: number;
    };
    filters: { mata_kuliah_id: string | null };
}

export default function Analytics({
    mataKuliahList,
    riskStats,
    studentsAtRisk,
    courseComparison,
    attendanceTrends,
    overallStats,
    filters,
}: Props) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(route('admin.analytics'), { ...filters, [key]: value === 'all' ? null : value }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Analytics & Prediksi" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Analytics & Prediksi Risiko
                        </h1>
                        <p className="text-muted-foreground">Analisis kehadiran dan prediksi mahasiswa berisiko tidak lulus</p>
                    </div>
                    <Select value={filters.mata_kuliah_id || 'all'} onValueChange={(v) => handleFilterChange('mata_kuliah_id', v)}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Semua Mata Kuliah" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                            {mataKuliahList.map((mk) => (
                                <SelectItem key={mk.id} value={String(mk.id)}>{mk.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Overall Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Mahasiswa</p>
                                    <p className="text-2xl font-bold">{overallStats.total_mahasiswa}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Sesi</p>
                                    <p className="text-2xl font-bold">{overallStats.total_sessions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Rata-rata Kehadiran</p>
                                    <p className="text-2xl font-bold">{overallStats.avg_attendance_rate}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Mahasiswa Berisiko</p>
                                    <p className="text-2xl font-bold text-red-600">{overallStats.danger_students}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Risk Distribution */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" />
                                Distribusi Status Risiko
                            </CardTitle>
                            <CardDescription>Berdasarkan aturan UNPAM: 3x absen = tidak bisa ikut UAS</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-24">
                                        <ShieldCheck className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Aman</span>
                                    </div>
                                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${riskStats.safe_percentage}%` }} />
                                    </div>
                                    <span className="w-16 text-right font-medium">{riskStats.safe}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-24">
                                        <ShieldAlert className="h-4 w-4 text-yellow-600" />
                                        <span className="text-sm">Peringatan</span>
                                    </div>
                                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                                        <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${riskStats.warning_percentage}%` }} />
                                    </div>
                                    <span className="w-16 text-right font-medium">{riskStats.warning}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-24">
                                        <ShieldX className="h-4 w-4 text-red-600" />
                                        <span className="text-sm">Bahaya</span>
                                    </div>
                                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                                        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${riskStats.danger_percentage}%` }} />
                                    </div>
                                    <span className="w-16 text-right font-medium">{riskStats.danger}</span>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    <strong>Peringatan:</strong> Mahasiswa dengan status "Bahaya" (≥3x absen) tidak dapat mengikuti UAS sesuai aturan UNPAM.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Tren Kehadiran
                            </CardTitle>
                            <CardDescription>8 sesi terakhir</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {attendanceTrends.length > 0 ? (
                                <div className="space-y-3">
                                    {attendanceTrends.map((trend, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="w-12 text-xs text-muted-foreground">{trend.date}</span>
                                            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden flex dark:bg-gray-800">
                                                <div className="h-full bg-green-500" style={{ width: `${(trend.present / trend.total) * 100}%` }} title={`Hadir: ${trend.present}`} />
                                                <div className="h-full bg-yellow-500" style={{ width: `${(trend.late / trend.total) * 100}%` }} title={`Terlambat: ${trend.late}`} />
                                                <div className="h-full bg-red-500" style={{ width: `${(trend.absent / trend.total) * 100}%` }} title={`Absen: ${trend.absent}`} />
                                            </div>
                                            <span className="w-12 text-right text-sm font-medium">{trend.attendance_rate}%</span>
                                        </div>
                                    ))}
                                    <div className="flex gap-4 mt-2 text-xs">
                                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded" /> Hadir</div>
                                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded" /> Terlambat</div>
                                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /> Absen</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">Belum ada data sesi</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Students at Risk */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Mahasiswa Berisiko Tidak Lulus
                        </CardTitle>
                        <CardDescription>Mahasiswa dengan status peringatan atau bahaya</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {studentsAtRisk.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2">Mahasiswa</th>
                                            <th className="text-left py-2 px-2">Mata Kuliah</th>
                                            <th className="text-center py-2 px-2">Hadir</th>
                                            <th className="text-center py-2 px-2">Terlambat</th>
                                            <th className="text-center py-2 px-2">Izin</th>
                                            <th className="text-center py-2 px-2">Absen</th>
                                            <th className="text-center py-2 px-2">Kehadiran</th>
                                            <th className="text-center py-2 px-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentsAtRisk.map((student) => (
                                            <tr key={student.id} className="border-b hover:bg-muted/50">
                                                <td className="py-2 px-2">
                                                    <div>
                                                        <p className="font-medium">{student.nama}</p>
                                                        <p className="text-xs text-muted-foreground">{student.nim}</p>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2">{student.mata_kuliah}</td>
                                                <td className="text-center py-2 px-2 text-green-600">{student.present_count}</td>
                                                <td className="text-center py-2 px-2 text-yellow-600">{student.late_count}</td>
                                                <td className="text-center py-2 px-2 text-blue-600">{student.permit_count}</td>
                                                <td className="text-center py-2 px-2 text-red-600 font-bold">{student.absent_count}</td>
                                                <td className="text-center py-2 px-2">{student.attendance_percentage}%</td>
                                                <td className="text-center py-2 px-2">
                                                    <Badge variant={student.risk_status === 'danger' ? 'destructive' : 'secondary'} className={student.risk_status === 'warning' ? 'bg-yellow-500 text-white' : ''}>
                                                        {student.risk_status === 'danger' ? 'BAHAYA' : 'PERINGATAN'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShieldCheck className="h-12 w-12 mx-auto text-green-500 mb-2" />
                                <p className="text-muted-foreground">Tidak ada mahasiswa berisiko saat ini</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Course Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Perbandingan Kehadiran Antar Mata Kuliah
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {courseComparison.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {courseComparison.map((course) => (
                                    <div key={course.id} className="p-4 border rounded-lg">
                                        <h4 className="font-medium">{course.nama}</h4>
                                        <p className="text-xs text-muted-foreground mb-3">{course.dosen}</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Rata-rata Kehadiran</span>
                                                <span className="font-medium">{course.avg_attendance}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Nilai Keaktifan</span>
                                                <span className="font-medium">{course.avg_activity_score}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Mahasiswa Berisiko</span>
                                                <span className={`font-medium ${course.danger_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {course.danger_count} / {course.total_students}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">Belum ada data mata kuliah</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
