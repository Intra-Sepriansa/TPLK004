import { cn } from '@/lib/utils';
import { AnimatedCounter } from './animated-counter';
import { Progress } from './progress';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AttendanceStatsProps {
    present: number;
    absent: number;
    late: number;
    pending: number;
    total: number;
    className?: string;
}

export function AttendanceStats({
    present,
    absent,
    late,
    pending,
    total,
    className,
}: AttendanceStatsProps) {
    const presentPercent = total > 0 ? (present / total) * 100 : 0;
    const absentPercent = total > 0 ? (absent / total) * 100 : 0;
    const latePercent = total > 0 ? (late / total) * 100 : 0;
    const pendingPercent = total > 0 ? (pending / total) * 100 : 0;

    const stats = [
        {
            label: 'Hadir',
            value: present,
            percent: presentPercent,
            icon: CheckCircle,
            color: 'emerald',
            bgColor: 'bg-emerald-500',
        },
        {
            label: 'Tidak Hadir',
            value: absent,
            percent: absentPercent,
            icon: XCircle,
            color: 'rose',
            bgColor: 'bg-rose-500',
        },
        {
            label: 'Terlambat',
            value: late,
            percent: latePercent,
            icon: Clock,
            color: 'amber',
            bgColor: 'bg-amber-500',
        },
        {
            label: 'Pending',
            value: pending,
            percent: pendingPercent,
            icon: AlertCircle,
            color: 'sky',
            bgColor: 'bg-sky-500',
        },
    ];

    return (
        <div className={cn('space-y-6', className)}>
            {/* Circular Progress */}
            <div className="flex justify-center">
                <div className="relative h-40 w-40">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-slate-200 dark:text-slate-800"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={`${presentPercent * 2.51} 251`}
                            strokeLinecap="round"
                            className="text-emerald-500 transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                            <AnimatedCounter value={presentPercent} suffix="%" decimals={1} />
                        </span>
                        <span className="text-xs text-slate-500">Kehadiran</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-slate-200/70 bg-white/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/50"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={cn('h-4 w-4', `text-${stat.color}-500`)} />
                                <span className="text-xs text-slate-500">{stat.label}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    <AnimatedCounter value={stat.value} />
                                </span>
                                <span className={cn('text-xs font-medium', `text-${stat.color}-600`)}>
                                    {stat.percent.toFixed(1)}%
                                </span>
                            </div>
                            <Progress
                                value={stat.percent}
                                className="mt-2 h-1.5"
                                indicatorClassName={stat.bgColor}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Stacked Bar */}
            <div className="space-y-2">
                <div className="flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                        className="bg-emerald-500 transition-all duration-500"
                        style={{ width: `${presentPercent}%` }}
                    />
                    <div
                        className="bg-amber-500 transition-all duration-500"
                        style={{ width: `${latePercent}%` }}
                    />
                    <div
                        className="bg-sky-500 transition-all duration-500"
                        style={{ width: `${pendingPercent}%` }}
                    />
                    <div
                        className="bg-rose-500 transition-all duration-500"
                        style={{ width: `${absentPercent}%` }}
                    />
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-1.5">
                            <div className={cn('h-2.5 w-2.5 rounded-full', stat.bgColor)} />
                            <span className="text-slate-600 dark:text-slate-400">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
