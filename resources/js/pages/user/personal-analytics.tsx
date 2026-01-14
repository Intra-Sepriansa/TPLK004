import StudentLayout from '@/layouts/student-layout';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, TrendingUp, TrendingDown, Flame, Award, Calendar, CheckCircle, Clock, XCircle, AlertTriangle, Lightbulb, Users, BookOpen, FileText, GraduationCap } from 'lucide-react';

interface ActivityDay {
    date: string; count: number; level: number; types: string[]; dayOfWeek: number; week: number; month: number; monthName: string; isFuture?: boolean;
}

interface Props {
    mahasiswa: { id: number; nama: string; nim: string };
    overview: { total_sessions: number; present: number; late: number; absent: number; overall_rate: number; on_time_rate: number; this_month_rate: number; trend: number; trend_direction: 'up' | 'down' | 'stable' };
    streakData: { current_streak: number; longest_streak: number; last_attendance: string | null };
    courseBreakdown: Array<{ course_id: number; course_name: string; total: number; present: number; late: number; absent: number; rate: number; can_take_uas: boolean }>;
    weeklyTrend: Array<{ date: string; day: string; status: string; time: string | null }>;
    activityGraph: { activities: ActivityDay[]; weeks: ActivityDay[][]; months: Array<{ month: number; name: string }>; totalActivities: number; activeDays: number; longestStreak: number; currentStreak: number; year: number };
    comparison: { my_rate: number; class_average: number; difference: number; rank: number; total_students: number; percentile: number; status: 'above' | 'below' };
    badges: Array<{ id: number; name: string; description: string; icon: string; color: string; category: string; points: number; earned_at: string }>;
    tips: Array<{ type: 'success' | 'warning' | 'danger' | 'info'; title: string; message: string }>;
}

export default function PersonalAnalytics({ mahasiswa, overview, streakData, courseBreakdown, weeklyTrend, activityGraph, comparison, badges, tips }: Props) {
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
            case -1: return 'bg-gray-100/50 dark:bg-gray-800/30';
            case 0: return 'bg-gray-200 dark:bg-gray-700';
            case 1: return 'bg-emerald-300 dark:bg-emerald-800';
            case 2: return 'bg-emerald-400 dark:bg-emerald-600';
            case 3: return 'bg-emerald-500 dark:bg-emerald-500';
            case 4: return 'bg-emerald-600 dark:bg-emerald-400';
            default: return 'bg-gray-200 dark:bg-gray-700';
        }
    };

    const getBadgeGradient = (color: string) => {
        const gradients: Record<string, string> = {
            orange: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
            yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
            green: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
            blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
            purple: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
            red: 'bg-gradient-to-br from-red-400 to-red-600 text-white',
            emerald: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white',
            pink: 'bg-gradient-to-br from-pink-400 to-pink-600 text-white',
        };
        return gradients[color] || 'bg-gradient-to-br from-gray-400 to-gray-600 text-white';
    };

    const getBadgeEmoji = (category: string) => {
        const emojis: Record<string, string> = { streak: '🔥', attendance: '✅', achievement: '🏆', special: '⭐' };
        return emojis[category] || '🎖️';
    };

    const formatActivityDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-100">Analisis</p>
                                <h1 className="text-2xl font-bold">Personal Analytics</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-indigo-100">Analisis aktivitas akademik kamu</p>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                {overview.trend_direction === 'up' ? <TrendingUp className="h-5 w-5" /> : overview.trend_direction === 'down' ? <TrendingDown className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Rate Kehadiran</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{overview.overall_rate}%</p>
                                <p className="text-xs text-slate-500">{overview.trend > 0 ? '+' : ''}{overview.trend}% dari bulan lalu</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${activityGraph.currentStreak > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Flame className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Streak Aktivitas</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{activityGraph.currentStreak} hari</p>
                                <p className="text-xs text-slate-500">Terpanjang: {activityGraph.longestStreak} hari</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Aktivitas</p>
                                <p className="text-xl font-bold text-emerald-600">{activityGraph.totalActivities}</p>
                                <p className="text-xs text-slate-500">{activityGraph.activeDays} hari aktif</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Ranking</p>
                                <p className="text-xl font-bold text-purple-600">#{comparison.rank}</p>
                                <p className="text-xs text-slate-500">Top {comparison.percentile}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Graph */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Tahun {activityGraph.year}</h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{activityGraph.totalActivities} aktivitas sejak 1 Januari {activityGraph.year}</p>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <div className="flex mb-2 ml-8 text-xs text-slate-500">
                            {(() => {
                                const monthPositions: { name: string; startWeek: number; span: number }[] = [];
                                let currentMonth = -1;
                                activityGraph.weeks.forEach((week, weekIndex) => {
                                    const firstDayOfWeek = week.find(d => d.month !== undefined);
                                    if (firstDayOfWeek && firstDayOfWeek.month !== currentMonth) {
                                        if (monthPositions.length > 0) monthPositions[monthPositions.length - 1].span = weekIndex - monthPositions[monthPositions.length - 1].startWeek;
                                        monthPositions.push({ name: firstDayOfWeek.monthName, startWeek: weekIndex, span: 1 });
                                        currentMonth = firstDayOfWeek.month;
                                    }
                                });
                                if (monthPositions.length > 0) monthPositions[monthPositions.length - 1].span = activityGraph.weeks.length - monthPositions[monthPositions.length - 1].startWeek;
                                return monthPositions.map((m, i) => (
                                    <div key={i} style={{ width: `${m.span * 13}px`, minWidth: m.span > 2 ? 'auto' : '0px' }} className="text-left">{m.span > 2 ? m.name : ''}</div>
                                ));
                            })()}
                        </div>
                        <div className="flex gap-[3px]">
                            <div className="flex flex-col gap-[3px] mr-2 text-[10px] text-slate-500">
                                <div className="h-[11px]"></div>
                                <div className="h-[11px] flex items-center">Sen</div>
                                <div className="h-[11px]"></div>
                                <div className="h-[11px] flex items-center">Rab</div>
                                <div className="h-[11px]"></div>
                                <div className="h-[11px] flex items-center">Jum</div>
                                <div className="h-[11px]"></div>
                            </div>
                            <TooltipProvider>
                                <div className="flex gap-[3px]">
                                    {activityGraph.weeks.map((week, weekIndex) => (
                                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                                            {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                                                const day = week.find(d => d.dayOfWeek === dayOfWeek);
                                                if (!day) return <div key={dayOfWeek} className="w-[11px] h-[11px]" />;
                                                return (
                                                    <Tooltip key={dayOfWeek}>
                                                        <TooltipTrigger asChild>
                                                            <div className={`w-[11px] h-[11px] rounded-[2px] ${getActivityColor(day.level)} cursor-pointer hover:ring-1 hover:ring-offset-1 hover:ring-gray-400 transition-all`} />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            <p className="font-medium">{formatActivityDate(day.date)}</p>
                                                            {day.isFuture ? <p className="text-slate-500">Belum terjadi</p> : day.count > 0 ? (<><p>{day.count} aktivitas</p><p className="text-slate-500">{getActivityTypeLabel(day.types)}</p></>) : <p className="text-slate-500">Tidak ada aktivitas</p>}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
                            <span>Sedikit</span>
                            <div className="flex gap-[3px]">{[0, 1, 2, 3, 4].map(level => (<div key={level} className={`w-[11px] h-[11px] rounded-[2px] ${getActivityColor(level)}`} />))}</div>
                            <span>Banyak</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /><span>Absensi</span></div>
                            <div className="flex items-center gap-1"><FileText className="h-3 w-3 text-blue-500" /><span>Tugas</span></div>
                            <div className="flex items-center gap-1"><BookOpen className="h-3 w-3 text-purple-500" /><span>Catatan</span></div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Weekly Trend */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran Minggu Ini</h2>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between">
                                {weeklyTrend.map((d, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-xs text-slate-500 mb-2">{d.day}</p>
                                        <div className={`w-10 h-10 rounded-full ${getStatusColor(d.status)} flex items-center justify-center mx-auto`}>
                                            {d.status === 'present' && <CheckCircle className="h-5 w-5 text-white" />}
                                            {d.status === 'late' && <Clock className="h-5 w-5 text-white" />}
                                            {(d.status === 'rejected' || d.status === 'absent') && <XCircle className="h-5 w-5 text-white" />}
                                        </div>
                                        <p className="text-xs mt-2 text-slate-600">{d.date}</p>
                                        {d.time && <p className="text-xs text-slate-500">{d.time}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Class Comparison */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Perbandingan dengan Kelas</h2>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Kamu</span><span className="font-bold text-slate-900 dark:text-white">{comparison.my_rate}%</span></div>
                            <Progress value={comparison.my_rate} className="h-3" />
                            <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Rata-rata Kelas</span><span className="font-bold text-slate-900 dark:text-white">{comparison.class_average}%</span></div>
                            <Progress value={comparison.class_average} className="h-3 bg-slate-200" />
                            <div className={`p-3 rounded-lg ${comparison.status === 'above' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                <p className={`text-sm font-medium ${comparison.status === 'above' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {comparison.status === 'above' ? `🎉 Kamu ${comparison.difference}% di atas rata-rata!` : `📈 Kamu ${Math.abs(comparison.difference)}% di bawah rata-rata`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Breakdown */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran per Mata Kuliah</h2>
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        {courseBreakdown.map(course => (
                            <div key={course.course_id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{course.course_name}</p>
                                        <div className="flex gap-2 mt-1 text-xs">
                                            <span className="text-green-600">Hadir: {course.present}</span>
                                            <span className="text-yellow-600">Terlambat: {course.late}</span>
                                            <span className="text-red-600">Absen: {course.absent}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={course.rate >= 80 ? 'default' : course.rate >= 60 ? 'secondary' : 'destructive'}>{course.rate}%</Badge>
                                        {!course.can_take_uas && <p className="text-xs text-red-600 mt-1">⚠️ Tidak bisa UAS</p>}
                                    </div>
                                </div>
                                <Progress value={course.rate} className="h-2" />
                            </div>
                        ))}
                        {courseBreakdown.length === 0 && (
                            <div className="text-center py-8">
                                <GraduationCap className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-slate-500">Belum ada data kehadiran</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Badges */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Badge Kamu ({badges.length})</h2>
                            </div>
                        </div>
                        <div className="p-4">
                            {badges.length > 0 ? (
                                <div className="space-y-3">
                                    {badges.map(badge => (
                                        <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                            <div className="w-14 h-14 shrink-0">
                                                {badge.icon ? (
                                                    <img src={`/images/badges/${badge.icon}`} alt={badge.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
                                                ) : null}
                                                <div className={`w-full h-full rounded-full items-center justify-center text-xl ${getBadgeGradient(badge.color)} ${badge.icon ? 'hidden' : 'flex'}`}>{getBadgeEmoji(badge.category)}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{badge.name}</p>
                                                    <span className="px-1.5 py-0 rounded text-[10px] bg-slate-100 text-slate-600">+{badge.points} pts</span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1">{badge.description}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Diperoleh {badge.earned_at}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Award className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p className="text-slate-500">Belum ada badge</p>
                                    <p className="text-xs text-slate-400">Terus tingkatkan aktivitas untuk mendapatkan badge!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Tips & Saran</h2>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {tips.map((tip, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${getTipBg(tip.type)}`}>
                                    <div className="flex items-start gap-3">
                                        {getTipIcon(tip.type)}
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{tip.title}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{tip.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tips.length === 0 && (
                                <div className="text-center py-8">
                                    <Lightbulb className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p className="text-slate-500">Tidak ada tips saat ini</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
