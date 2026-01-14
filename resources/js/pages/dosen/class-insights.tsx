import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Clock, AlertTriangle, Award, TrendingUp } from 'lucide-react';

interface Props {
    dosen: { id: number; nama: string };
    courses: Array<{ id: number; nama: string; sks: number }>;
    selectedCourseId: number | null;
    insights: {
        course: { id: number; nama: string; sks: number };
        summary: { total_sessions: number; total_students: number; average_attendance: number; students_at_risk: number };
        byMeeting: Array<{ meeting: number; title: string; date: string; total: number; present: number; late: number; absent: number; rate: number }>;
        frequentlyLate: Array<{ id: number; nama: string; nim: string; late_count: number; late_percentage: number }>;
        atRisk: Array<{ id: number; nama: string; nim: string; absent_count: number; can_take_uas: boolean }>;
        topPerformers: Array<{ id: number; nama: string; nim: string; attended: number; rate: number; on_time_rate: number }>;
    } | null;
    comparison: Array<{ id: number; nama: string; sks: number; total_sessions: number; attendance_rate: number }>;
}

export default function ClassInsights({ dosen, courses, selectedCourseId, insights, comparison }: Props) {
    const handleCourseChange = (courseId: string) => {
        router.get('/dosen/class-insights', { course_id: courseId }, { preserveState: true });
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Class Insights" />
            <div className="p-6 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-indigo-100">Analisis</p>
                                    <h1 className="text-2xl font-bold">Class Insights</h1>
                                </div>
                            </div>
                            <Select value={String(selectedCourseId || '')} onValueChange={handleCourseChange}>
                                <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white">
                                    <SelectValue placeholder="Pilih Mata Kuliah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="mt-4 text-indigo-100">Analisis kehadiran per kelas</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Perbandingan Mata Kuliah</h2>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        {comparison.map((c, idx) => (
                            <div key={c.id} className="flex items-center gap-4">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{c.nama}</span>
                                        <span className="text-sm text-slate-600">{c.attendance_rate}%</span>
                                    </div>
                                    <Progress value={c.attendance_rate} className="h-2" />
                                </div>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{c.total_sessions} sesi</span>
                            </div>
                        ))}
                    </div>
                </div>

                {!selectedCourseId && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 py-12 text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500">Pilih mata kuliah untuk melihat insights detail</p>
                    </div>
                )}

                {insights && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"><Clock className="h-5 w-5" /></div>
                                    <div><p className="text-xs text-slate-500">Total Sesi</p><p className="text-xl font-bold text-slate-900 dark:text-white">{insights.summary.total_sessions}</p></div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Users className="h-5 w-5" /></div>
                                    <div><p className="text-xs text-slate-500">Mahasiswa</p><p className="text-xl font-bold text-blue-600">{insights.summary.total_students}</p></div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
                                    <div><p className="text-xs text-slate-500">Rata-rata</p><p className="text-xl font-bold text-emerald-600">{insights.summary.average_attendance}%</p></div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
                                    <div><p className="text-xs text-slate-500">Berisiko</p><p className="text-xl font-bold text-red-600">{insights.summary.students_at_risk}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-indigo-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran per Pertemuan</h2>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {insights.byMeeting.map(m => (
                                    <div key={m.meeting} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <span className="font-medium text-slate-900 dark:text-white">{m.title}</span>
                                                <span className="text-sm text-slate-500 ml-2">{m.date}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.rate >= 80 ? 'bg-emerald-100 text-emerald-700' : m.rate >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{m.rate}%</span>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">Hadir: {m.present}</span>
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">Terlambat: {m.late}</span>
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">Absen: {m.absent}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-500" />
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Top Performers</h2>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {insights.topPerformers.map((s, idx) => (
                                        <div key={s.id} className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{idx + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.nama}</p>
                                                <p className="text-xs text-slate-500">{s.nim}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-green-600">{s.rate}%</p>
                                                <p className="text-xs text-slate-500">{s.on_time_rate}% tepat waktu</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-yellow-500" />
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Sering Terlambat</h2>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {insights.frequentlyLate.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">Tidak ada mahasiswa yang sering terlambat</p>
                                    ) : (
                                        insights.frequentlyLate.map(s => (
                                            <div key={s.id} className="flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.nama}</p>
                                                    <p className="text-xs text-slate-500">{s.nim}</p>
                                                </div>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{s.late_count}x ({s.late_percentage}%)</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Mahasiswa Berisiko</h2>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {insights.atRisk.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">Tidak ada mahasiswa berisiko</p>
                                    ) : (
                                        insights.atRisk.map(s => (
                                            <div key={s.id} className="flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.nama}</p>
                                                    <p className="text-xs text-slate-500">{s.nim}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.can_take_uas ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.absent_count}x absen</span>
                                                    {!s.can_take_uas && <p className="text-xs text-red-600 mt-1">Tidak bisa UAS</p>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DosenLayout>
    );
}
