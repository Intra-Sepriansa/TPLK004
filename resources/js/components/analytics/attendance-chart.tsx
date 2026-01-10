import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
    label: string;
    present?: number;
    absent?: number;
    late?: number;
    total?: number;
    value?: number;
}

interface AttendanceChartProps {
    data: ChartData[];
    type?: 'area' | 'bar' | 'line' | 'pie';
    title?: string;
    className?: string;
    showLegend?: boolean;
    height?: number;
}

const COLORS = {
    present: '#10b981',
    absent: '#f43f5e',
    late: '#f59e0b',
    total: '#6366f1',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <p className="font-medium text-slate-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export function AttendanceChart({
    data,
    type = 'area',
    title,
    className,
    showLegend = true,
    height = 300,
}: AttendanceChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            name: item.label,
            Hadir: item.present || 0,
            'Tidak Hadir': item.absent || 0,
            Terlambat: item.late || 0,
            Total: item.total || item.value || 0,
        }));
    }, [data]);

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fill: '#64748b' }} />
                        <YAxis className="text-xs" tick={{ fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        <Bar dataKey="Hadir" fill={COLORS.present} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Terlambat" fill={COLORS.late} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Tidak Hadir" fill={COLORS.absent} radius={[4, 4, 0, 0]} />
                    </BarChart>
                );

            case 'line':
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fill: '#64748b' }} />
                        <YAxis className="text-xs" tick={{ fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        <Line type="monotone" dataKey="Hadir" stroke={COLORS.present} strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Terlambat" stroke={COLORS.late} strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Tidak Hadir" stroke={COLORS.absent} strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                );

            case 'pie':
                const pieData = [
                    { name: 'Hadir', value: chartData.reduce((sum, d) => sum + d.Hadir, 0), color: COLORS.present },
                    { name: 'Terlambat', value: chartData.reduce((sum, d) => sum + d.Terlambat, 0), color: COLORS.late },
                    { name: 'Tidak Hadir', value: chartData.reduce((sum, d) => sum + d['Tidak Hadir'], 0), color: COLORS.absent },
                ];
                return (
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                    </PieChart>
                );

            case 'area':
            default:
                return (
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.present} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.present} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.late} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.late} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.absent} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.absent} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fill: '#64748b' }} />
                        <YAxis className="text-xs" tick={{ fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        <Area
                            type="monotone"
                            dataKey="Hadir"
                            stroke={COLORS.present}
                            fillOpacity={1}
                            fill="url(#colorPresent)"
                        />
                        <Area
                            type="monotone"
                            dataKey="Terlambat"
                            stroke={COLORS.late}
                            fillOpacity={1}
                            fill="url(#colorLate)"
                        />
                        <Area
                            type="monotone"
                            dataKey="Tidak Hadir"
                            stroke={COLORS.absent}
                            fillOpacity={1}
                            fill="url(#colorAbsent)"
                        />
                    </AreaChart>
                );
        }
    };

    return (
        <div className={cn('rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70', className)}>
            {title && (
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
