import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface CalendarProps {
    selected?: Date;
    onSelect?: (date: Date) => void;
    className?: string;
    markedDates?: {
        date: Date;
        status: 'present' | 'absent' | 'late' | 'pending';
    }[];
}

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function Calendar({ selected, onSelect, className, markedDates = [] }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        return { daysInMonth, startingDay };
    };

    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const getStatusForDate = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const marked = markedDates.find(m => 
            m.date.getDate() === date.getDate() &&
            m.date.getMonth() === date.getMonth() &&
            m.date.getFullYear() === date.getFullYear()
        );
        return marked?.status;
    };

    const statusColors = {
        present: 'bg-emerald-500 text-white',
        absent: 'bg-rose-500 text-white',
        late: 'bg-amber-500 text-white',
        pending: 'bg-sky-500 text-white',
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        if (!selected) return false;
        return (
            day === selected.getDate() &&
            currentMonth.getMonth() === selected.getMonth() &&
            currentMonth.getFullYear() === selected.getFullYear()
        );
    };

    return (
        <div className={cn('p-4 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800/70 dark:bg-slate-950/70', className)}>
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const status = getStatusForDate(day);
                    return (
                        <button
                            key={day}
                            onClick={() => onSelect?.(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                            className={cn(
                                'aspect-square rounded-lg text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800',
                                isToday(day) && !status && 'ring-2 ring-emerald-500 ring-offset-2',
                                isSelected(day) && 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
                                status && statusColors[status]
                            )}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">Hadir</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-slate-400">Telat</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-slate-600 dark:text-slate-400">Tidak Hadir</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-sky-500" />
                    <span className="text-slate-600 dark:text-slate-400">Pending</span>
                </div>
            </div>
        </div>
    );
}
