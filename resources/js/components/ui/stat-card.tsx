import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './animated-counter';

interface StatCardProps {
    title: string;
    value: number;
    change?: string | null;
    note?: string;
    icon?: LucideIcon;
    tone?: 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'slate';
    trend?: 'up' | 'down' | null;
    prefix?: string;
    suffix?: string;
    loading?: boolean;
}

const toneStyles = {
    emerald: {
        bg: 'bg-emerald-500/10',
        icon: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200/50 dark:border-emerald-900/50',
    },
    amber: {
        bg: 'bg-amber-500/10',
        icon: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200/50 dark:border-amber-900/50',
    },
    rose: {
        bg: 'bg-rose-500/10',
        icon: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200/50 dark:border-rose-900/50',
    },
    sky: {
        bg: 'bg-sky-500/10',
        icon: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-200/50 dark:border-sky-900/50',
    },
    violet: {
        bg: 'bg-violet-500/10',
        icon: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-200/50 dark:border-violet-900/50',
    },
    slate: {
        bg: 'bg-slate-500/10',
        icon: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200/50 dark:border-slate-800/50',
    },
};

export function StatCard({
    title,
    value,
    change,
    note,
    icon: Icon,
    tone = 'slate',
    trend,
    prefix = '',
    suffix = '',
    loading = false,
}: StatCardProps) {
    const styles = toneStyles[tone];

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-md dark:bg-slate-950/70',
            styles.border
        )}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        {title}
                    </p>
                    <p className="mt-2 font-display text-3xl text-slate-900 dark:text-white">
                        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        {change && trend && (
                            <span className={cn(
                                'flex items-center gap-1 text-xs font-medium',
                                trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                            )}>
                                {trend === 'up' ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {change}
                            </span>
                        )}
                        {note && (
                            <span className="text-xs text-slate-500">{note}</span>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', styles.bg)}>
                        <Icon className={cn('h-5 w-5', styles.icon)} />
                    </div>
                )}
            </div>
        </div>
    );
}
