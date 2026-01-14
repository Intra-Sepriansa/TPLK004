import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    AlertTriangle, TrendingUp, Users, Calendar, BookOpen, 
    ShieldAlert, ShieldCheck, ShieldX, BarChart3, Target, Award, Sparkles
} from 'lucide-react';

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

    const getRiskBadge = (status: string) => {
        switch (status) {
            case 'danger': return 'bg-red-100 text-red-700 border-red-200';
            case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
    };

    const safePercentage = overallStats.total_mahasiswa > 0 
        ? Math.round((riskStats.safe / overallStats.total_mahasiswa) * 100) 
        : 0;

    return (
        <AppLayout>
            <Head title="Analytics & Prediksi" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                    <BarChart3 className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium">Dashboard Analitik</p>
                                    <h1 className="text-2xl font-bold">Analytics & Prediksi Risiko</h1>
                                </div>
                            </div>
                            <Select value={filters.mata_kuliah_id || 'all'} onValueChange={(v) => handleFilterChange('mata_kuliah_id', v)}>
                                <SelectTrigger className="w-[250px] bg-white/20 border-0 text-white backdrop-blur">
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
                        <p className="mt-4 text-indigo-100">Analisis kehadiran dan prediksi mahasiswa berisiko tidak lulus</p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-4 w-4 text-indigo-200" />
                                    <p className="text-indigo-100 text-xs font-medium">Total Mahasiswa</p>
                                </div>
                                <p className="text-3xl font-bold">{overallStats.total_mahasiswa}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="h-4 w-4 text-indigo-200" />
                                    <p className="text-indigo-100 text-xs font-medium">Total Sesi</p>
                                </div>
                                <p className="text-3xl font-bold">{overallStats.total_sessions}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-indigo-200" />
                                    <p className="text-indigo-100 text-xs font-medium">Rata-rata Kehadiran</p>
                                </div>
                                <p className="text-3xl font-bold">{overallStats.avg_attendance_rate}%</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-indigo-200" />
                                    <p className="text-indigo-100 text-xs font-medium">Mahasiswa Berisiko</p>
                                </div>
                                <p className="text-3xl font-bold">{overallStats.danger_students}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                                <Users className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total Mahasiswa</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{overallStats.total_mahasiswa}</p>
                                <p className="text-xs text-slate-400">{safePercentage}% aman</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/30">
                                <Calendar className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total Sesi</p>
                                <p className="text-2xl font-bold text-purple-600">{overallStats.total_sessions}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                                <TrendingUp className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Rata-rata Kehadiran</p>
                                <p className="text-2xl font-bold text-emerald-600">{overallStats.avg_attendance_rate}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30">
                                <AlertTriangle className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Mahasiswa Berisiko</p>
                                <p className="text-2xl font-bold text-red-600">{overallStats.danger_students}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Risk Distribution & Trends */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Risk Distribution */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                                    <ShieldAlert className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi Status Risiko</h2>
                                    <p className="text-xs text-slate-500">Berdasarkan aturan UNPAM: 3x absen = tidak bisa ikut UAS</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="space-y-4">
                                {/* Safe */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-28">
                                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">Aman</span>
                                    </div>
                                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all flex items-center justify-end pr-2" 
                                            style={{ width: `${riskStats.safe_percentage}%` }}
                                        >
                                            {riskStats.safe_percentage > 10 && (
                                                <span className="text-xs text-white font-medium">{riskStats.safe_percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="w-12 text-right font-bold text-emerald-600">{riskStats.safe}</span>
                                </div>
                                
                                {/* Warning */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-28">
                                        <div className="p-1.5 rounded-lg bg-yellow-100 text-yellow-600">
                                            <ShieldAlert className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">Peringatan</span>
                                    </div>
                                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                                        <div 
                                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all flex items-center justify-end pr-2" 
                                            style={{ width: `${riskStats.warning_percentage}%` }}
                                        >
                                            {riskStats.warning_percentage > 10 && (
                                                <span className="text-xs text-white font-medium">{riskStats.warning_percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="w-12 text-right font-bold text-yellow-600">{riskStats.warning}</span>
                                </div>
                                
                                {/* Danger */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-28">
                                        <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                                            <ShieldX className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">Bahaya</span>
                                    </div>
                                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                                        <div 
                                            className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all flex items-center justify-end pr-2" 
                                            style={{ width: `${riskStats.danger_percentage}%` }}
                                        >
                                            {riskStats.danger_percentage > 10 && (
                                                <span className="text-xs text-white font-medium">{riskStats.danger_percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="w-12 text-right font-bold text-red-600">{riskStats.danger}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        <strong>Peringatan:</strong> Mahasiswa dengan status "Bahaya" (≥3x absen) tidak dapat mengikuti UAS sesuai aturan UNPAM.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Trends */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Tren Kehadiran</h2>
                                    <p className="text-xs text-slate-500">8 sesi terakhir</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {attendanceTrends.length > 0 ? (
                                <div className="space-y-3">
                                    {attendanceTrends.map((trend, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="w-14 text-xs text-slate-500 font-medium">{trend.date}</span>
                                            <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden flex dark:bg-slate-800">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" 
                                                    style={{ width: `${(trend.present / trend.total) * 100}%` }} 
                                                    title={`Hadir: ${trend.present}`} 
                                                />
                                                <div 
                                                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all" 
                                                    style={{ width: `${(trend.late / trend.total) * 100}%` }} 
                                                    title={`Terlambat: ${trend.late}`} 
                                                />
                                                <div 
                                                    className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all" 
                                                    style={{ width: `${(trend.absent / trend.total) * 100}%` }} 
                                                    title={`Absen: ${trend.absent}`} 
                                                />
                                            </div>
                                            <span className={`w-14 text-right text-sm font-bold ${
                                                trend.attendance_rate >= 80 ? 'text-emerald-600' :
                                                trend.attendance_rate >= 60 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>{trend.attendance_rate}%</span>
                                        </div>
                                    ))}
                                    <div className="flex gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded" />
                                            <span className="text-slate-600">Hadir</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded" />
                                            <span className="text-slate-600">Terlambat</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded" />
                                            <span className="text-slate-600">Absen</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p className="text-slate-500">Belum ada data sesi</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Students at Risk */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-red-600 text-white">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Mahasiswa Berisiko Tidak Lulus</h2>
                                <p className="text-xs text-slate-500">Mahasiswa dengan status peringatan atau bahaya</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {studentsAtRisk.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Mahasiswa</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Mata Kuliah</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Hadir</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Terlambat</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Izin</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Absen</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Kehadiran</th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {studentsAtRisk.map((student, idx) => (
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                            student.risk_status === 'danger' 
                                                                ? 'bg-gradient-to-br from-red-400 to-red-600' 
                                                                : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                                        }`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{student.nama}</p>
                                                            <p className="text-xs text-slate-500">{student.nim}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{student.mata_kuliah}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="font-medium text-emerald-600">{student.present_count}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="font-medium text-yellow-600">{student.late_count}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="font-medium text-blue-600">{student.permit_count}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="font-bold text-red-600">{student.absent_count}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`font-bold ${
                                                        student.attendance_percentage >= 80 ? 'text-emerald-600' :
                                                        student.attendance_percentage >= 60 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>{student.attendance_percentage}%</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getRiskBadge(student.risk_status)}`}>
                                                        {student.risk_status === 'danger' ? 'BAHAYA' : 'PERINGATAN'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <ShieldCheck className="h-10 w-10 text-emerald-500" />
                                </div>
                                <p className="text-slate-500 font-medium">Tidak ada mahasiswa berisiko saat ini</p>
                                <p className="text-sm text-slate-400 mt-1">Semua mahasiswa dalam kondisi aman</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Comparison */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Perbandingan Kehadiran Antar Mata Kuliah</h2>
                                <p className="text-xs text-slate-500">Ranking berdasarkan tingkat kehadiran</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {courseComparison.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {courseComparison.map((course, idx) => {
                                    const isTop = idx === 0;
                                    const hasRisk = course.danger_count > 0;
                                    
                                    return (
                                        <div 
                                            key={course.id} 
                                            className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                                                isTop ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20' :
                                                hasRisk ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' :
                                                'border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                        idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                        idx === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                                        idx === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-700' :
                                                        'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                                    }`}>
                                                        {idx + 1}
                                                    </span>
                                                    {isTop && <Sparkles className="h-4 w-4 text-yellow-500" />}
                                                </div>
                                                {hasRisk && (
                                                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                                                        {course.danger_count} berisiko
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{course.nama}</h4>
                                            <p className="text-xs text-slate-500 mb-4">{course.dosen}</p>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-slate-600">Rata-rata Kehadiran</span>
                                                        <span className={`font-bold ${
                                                            course.avg_attendance >= 80 ? 'text-emerald-600' :
                                                            course.avg_attendance >= 60 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>{course.avg_attendance}%</span>
                                                    </div>
                                                    <Progress value={course.avg_attendance} className="h-2" />
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Nilai Keaktifan</span>
                                                    <span className="font-medium text-slate-900 dark:text-white">{course.avg_activity_score}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Mahasiswa</span>
                                                    <span className="font-medium text-slate-900 dark:text-white">{course.total_students}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-slate-500">Belum ada data mata kuliah</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
