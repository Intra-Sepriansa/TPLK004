import { Card } from '@/components/ui/card';
import { useMemo } from 'react';

interface HeatmapData {
    day: string;
    hour: number;
    count: number;
}

interface AttendanceHeatmapProps {
    data: HeatmapData[];
}

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
    const days = [
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
        'Minggu',
    ];
    const hours = Array.from({ length: 11 }, (_, i) => i + 7); // 7 AM to 6 PM

    const maxCount = useMemo(() => {
        return Math.max(...data.map((d) => d.count), 1);
    }, [data]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        const intensity = count / maxCount;
        if (intensity > 0.75) return 'bg-emerald-600';
        if (intensity > 0.5) return 'bg-emerald-500';
        if (intensity > 0.25) return 'bg-emerald-400';
        return 'bg-emerald-300';
    };

    const getValue = (day: string, hour: number) => {
        const item = data.find((d) => d.day === day && d.hour === hour);
        return item?.count || 0;
    };

    return (
        <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">📊 Heatmap Kehadiran</h3>
            <p className="mb-6 text-sm text-muted-foreground">
                Pola kehadiran berdasarkan hari dan jam
            </p>

            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Hours header */}
                    <div className="mb-2 flex">
                        <div className="w-24"></div>
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="w-12 text-center text-xs text-muted-foreground"
                            >
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    {days.map((day) => (
                        <div key={day} className="mb-1 flex">
                            <div className="flex w-24 items-center text-sm font-medium">
                                {day}
                            </div>
                            {hours.map((hour) => {
                                const count = getValue(day, hour);
                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        className={`m-0.5 h-12 w-12 rounded ${getColor(count)} group relative cursor-pointer transition-all hover:scale-110`}
                                        title={`${day} ${hour}:00 - ${count} kehadiran`}
                                    >
                                        {count > 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                                {count}
                                            </div>
                                        )}
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            {day} {hour}:00
                                            <br />
                                            {count} kehadiran
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Intensitas:</span>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gray-100 dark:bg-gray-800"></div>
                    <span>0</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-emerald-300"></div>
                    <span>Rendah</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-emerald-500"></div>
                    <span>Sedang</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-emerald-600"></div>
                    <span>Tinggi</span>
                </div>
            </div>
        </Card>
    );
}
