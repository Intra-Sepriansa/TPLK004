import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';

interface Tugas {
    id: number; judul: string; deskripsi: string; jenis: string;
    deadline: string; deadline_display: string; prioritas: string;
    course: { id: number; nama: string; dosen: string | null }; created_by: string;
    is_overdue: boolean; days_until_deadline: number; is_read: boolean; diskusi_count: number;
}

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const priorityColor: Record<string, string> = {
    tinggi: 'bg-red-500', sedang: 'bg-amber-500', rendah: 'bg-emerald-500',
};

export default function CalendarView({ tugasList }: { tugasList: Tugas[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const tasksByDate = useMemo(() => {
        const map: Record<string, Tugas[]> = {};
        tugasList.forEach(t => {
            const d = new Date(t.deadline);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!map[key]) map[key] = [];
            map[key].push(t);
        });
        return map;
    }, [tugasList]);

    const days: { day: number; key: string; tasks: Tugas[] }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${month}-${d}`;
        days.push({ day: d, key, tasks: tasksByDate[key] || [] });
    }

    const todayKey = (() => { const n = new Date(); return `${n.getFullYear()}-${n.getMonth()}-${n.getDate()}`; })();
    const selectedTasks = selectedDay ? (tasksByDate[selectedDay] || []) : [];

    const handleExportGCal = (t: Tugas) => {
        const d = new Date(t.deadline);
        const e = new Date(d.getTime() + 3600000);
        const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t.judul)}&dates=${fmt(d)}/${fmt(e)}&details=${encodeURIComponent(t.deskripsi)}&location=${encodeURIComponent(t.course.nama)}`, '_blank');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Kalender Deadline</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{MONTHS[month]} {year}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentDate(new Date(year, month - 1))}
                        className="p-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/5">
                        <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentDate(new Date(year, month + 1))}
                        className="p-2 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/5">
                        <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                    </motion.button>
                </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-neutral-500 dark:text-neutral-400 py-2">{d}</div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {days.map(({ day, key, tasks }) => {
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDay;
                    return (
                        <motion.button key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDay(isSelected ? null : key)}
                            className={`relative p-2 rounded-xl text-center min-h-[60px] transition-all ${isSelected
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
                                : isToday
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500'
                                    : 'bg-white/60 dark:bg-neutral-800/40 hover:bg-white/80 dark:hover:bg-neutral-700/60'
                                }`}>
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-700 dark:text-neutral-300'}`}>{day}</span>
                            {tasks.length > 0 && (
                                <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                                    {tasks.slice(0, 3).map((t, i) => (
                                        <div key={i} className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : priorityColor[t.prioritas] || 'bg-neutral-400'}`} />
                                    ))}
                                    {tasks.length > 3 && <span className="text-[8px] text-neutral-400">+{tasks.length - 3}</span>}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                {[{ c: 'bg-red-500', l: 'Tinggi' }, { c: 'bg-amber-500', l: 'Sedang' }, { c: 'bg-emerald-500', l: 'Rendah' }].map(({ c, l }) => (
                    <div key={l} className="flex items-center gap-1.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${c}`} />
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{l}</span>
                    </div>
                ))}
            </div>

            {/* Selected Day Detail */}
            {selectedDay && selectedTasks.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/5">
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-3">Tugas pada hari ini</h4>
                    <div className="space-y-2">
                        {selectedTasks.map(t => (
                            <div key={t.id} onClick={() => router.visit(`/user/tugas/${t.id}`)}
                                className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all">
                                <div>
                                    <p className="font-bold text-sm text-neutral-900 dark:text-white">{t.judul}</p>
                                    <p className="text-xs text-neutral-500">{t.course.nama}</p>
                                </div>
                                <div className="flex gap-2">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={(e) => { e.stopPropagation(); handleExportGCal(t); }}
                                        className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                        <Download className="h-3.5 w-3.5" />
                                    </motion.button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
