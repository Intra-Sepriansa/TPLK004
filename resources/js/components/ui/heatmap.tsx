import { cn } from '@/lib/utils';

interface HeatmapData {
    hour: number;
    day: number;
    value: number;
}

interface HeatmapProps {
    data: HeatmapData[];
    maxValue?: number;
    className?: string;
}

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function Heatmap({ data, maxValue, className }: HeatmapProps) {
    const max = maxValue || Math.max(...data.map(d => d.value), 1);

    const getValue = (hour: number, day: number) => {
        const item = data.find(d => d.hour === hour && d.day === day);
        return item?.value || 0;
    };

    const getColor = (value: number) => {
        if (value === 0) return 'bg-slate-100 dark:bg-slate-800';
        const intensity = value / max;
        if (intensity < 0.25) return 'bg-emerald-200 dark:bg-emerald-900';
        if (intensity < 0.5) return 'bg-emerald-400 dark:bg-emerald-700';
        if (intensity < 0.75) return 'bg-emerald-500 dark:bg-emerald-600';
        return 'bg-emerald-600 dark:bg-emerald-500';
    };

    return (
        <div className={cn('overflow-x-auto', className)}>
            <div className="min-w-[600px]">
                <div className="flex gap-1 mb-2">
                    <div className="w-10" />
                    {HOURS.filter(h => h % 2 === 0).map(hour => (
                        <div
                            key={hour}
                            className="flex-1 text-center text-[10px] text-slate-500"
                        >
                            {hour.toString().padStart(2, '0')}
                        </div>
                    ))}
                </div>
                {DAYS.map((day, dayIndex) => (
                    <div key={day} className="flex gap-1 mb-1">
                        <div className="w-10 text-xs text-slate-500 flex items-center">
                            {day}
                        </div>
                        {HOURS.map(hour => {
                            const value = getValue(hour, dayIndex);
                            return (
                                <div
                                    key={hour}
                                    className={cn(
                                        'flex-1 aspect-square rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-slate-400',
                                        getColor(value)
                                    )}
                                    title={`${day} ${hour}:00 - ${value} absensi`}
                                />
                            );
                        })}
                    </div>
                ))}
                <div className="flex items-center justify-end gap-2 mt-4">
                    <span className="text-xs text-slate-500">Sedikit</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-sm bg-slate-100 dark:bg-slate-800" />
                        <div className="w-4 h-4 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
                        <div className="w-4 h-4 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                        <div className="w-4 h-4 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
                        <div className="w-4 h-4 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
                    </div>
                    <span className="text-xs text-slate-500">Banyak</span>
                </div>
            </div>
        </div>
    );
}
