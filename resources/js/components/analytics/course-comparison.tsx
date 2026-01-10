import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CourseStats {
    id: number;
    name: string;
    present: number;
    absent: number;
    late: number;
    total: number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
}

interface CourseComparisonProps {
    courses: CourseStats[];
    className?: string;
}

export function CourseComparison({ courses, className }: CourseComparisonProps) {
    const sortedCourses = useMemo(() => {
        return [...courses].sort((a, b) => {
            const rateA = a.total > 0 ? (a.present / a.total) * 100 : 0;
            const rateB = b.total > 0 ? (b.present / b.total) * 100 : 0;
            return rateB - rateA;
        });
    }, [courses]);

    const getAttendanceRate = (course: CourseStats) => {
        return course.total > 0 ? (course.present / course.total) * 100 : 0;
    };

    const getRateColor = (rate: number) => {
        if (rate >= 80) return 'text-emerald-600';
        if (rate >= 60) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getProgressColor = (rate: number) => {
        if (rate >= 80) return 'bg-emerald-500';
        if (rate >= 60) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4 text-rose-500" />;
        return <Minus className="h-4 w-4 text-slate-400" />;
    };

    return (
        <div className={cn('rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70', className)}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    Perbandingan Kehadiran per Mata Kuliah
                </h3>
                <span className="text-xs text-slate-500">
                    {courses.length} mata kuliah
                </span>
            </div>

            <div className="space-y-4">
                {sortedCourses.map((course, index) => {
                    const rate = getAttendanceRate(course);
                    return (
                        <div key={course.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                                        index === 0 && 'bg-amber-100 text-amber-700',
                                        index === 1 && 'bg-slate-200 text-slate-700',
                                        index === 2 && 'bg-orange-100 text-orange-700',
                                        index > 2 && 'bg-slate-100 text-slate-600'
                                    )}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                                            {course.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {course.present} hadir dari {course.total} sesi
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {course.trend && (
                                        <div className="flex items-center gap-1">
                                            <TrendIcon trend={course.trend} />
                                            {course.trendValue && (
                                                <span className={cn(
                                                    'text-xs font-medium',
                                                    course.trend === 'up' && 'text-emerald-600',
                                                    course.trend === 'down' && 'text-rose-600',
                                                    course.trend === 'stable' && 'text-slate-500'
                                                )}>
                                                    {course.trendValue > 0 ? '+' : ''}{course.trendValue}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <span className={cn('text-lg font-bold', getRateColor(rate))}>
                                        {rate.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <Progress
                                value={rate}
                                className="h-2"
                                indicatorClassName={getProgressColor(rate)}
                            />
                            <div className="flex gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Hadir: {course.present}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    Telat: {course.late}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                    Tidak Hadir: {course.absent}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {courses.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-sm text-slate-500">Tidak ada data mata kuliah</p>
                </div>
            )}
        </div>
    );
}
