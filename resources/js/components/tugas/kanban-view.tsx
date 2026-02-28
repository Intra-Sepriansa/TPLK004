import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import { FileText, Clock, Eye, CheckCircle, Calendar, Zap, Target, AlertTriangle } from 'lucide-react';

interface Tugas {
    id: number; judul: string; deskripsi: string; jenis: string;
    deadline: string; deadline_display: string; prioritas: string;
    course: { id: number; nama: string; dosen: string | null }; created_by: string;
    is_overdue: boolean; days_until_deadline: number; is_read: boolean; diskusi_count: number;
}

const priorityBadge = (p: string) => {
    const c: Record<string, { bg: string; icon: typeof Zap; label: string }> = {
        tinggi: { bg: 'from-red-500 to-rose-600', icon: Zap, label: 'Tinggi' },
        sedang: { bg: 'from-amber-500 to-orange-500', icon: Target, label: 'Sedang' },
        rendah: { bg: 'from-emerald-500 to-green-500', icon: CheckCircle, label: 'Rendah' },
    };
    const cfg = c[p] || c.rendah;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gradient-to-r ${cfg.bg} text-white`}>
            <Icon className="h-2.5 w-2.5" />{cfg.label}
        </span>
    );
};

const columns = [
    { id: 'todo', title: 'Belum Dikerjakan', color: 'from-slate-500 to-slate-600', icon: FileText, filter: (t: Tugas) => !t.is_overdue && t.days_until_deadline > 3 },
    { id: 'urgent', title: 'Segera Dikerjakan', color: 'from-amber-500 to-orange-600', icon: Clock, filter: (t: Tugas) => !t.is_overdue && t.days_until_deadline <= 3 && t.days_until_deadline >= 0 },
    { id: 'overdue', title: 'Terlewat', color: 'from-red-500 to-rose-600', icon: AlertTriangle, filter: (t: Tugas) => t.is_overdue },
    { id: 'read', title: 'Sudah Dibaca', color: 'from-emerald-500 to-teal-600', icon: Eye, filter: (t: Tugas) => t.is_read && !t.is_overdue && t.days_until_deadline > 3 },
];

export default function KanbanView({ tugasList }: { tugasList: Tugas[] }) {
    // Distribute tasks into columns
    const assigned = new Set<number>();
    const colData = columns.map(col => {
        const tasks = tugasList.filter(t => {
            if (assigned.has(t.id)) return false;
            if (col.filter(t)) { assigned.add(t.id); return true; }
            return false;
        });
        return { ...col, tasks };
    });
    // Remaining unassigned go to first column
    const remaining = tugasList.filter(t => !assigned.has(t.id));
    if (remaining.length) colData[0].tasks.push(...remaining);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {colData.map((col, ci) => (
                <motion.div key={col.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5">
                    <div className={`flex items-center justify-between mb-4 p-3 rounded-2xl bg-gradient-to-r ${col.color} text-white`}>
                        <div className="flex items-center gap-2">
                            <col.icon className="h-5 w-5" />
                            <h3 className="font-bold text-sm">{col.title}</h3>
                        </div>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{col.tasks.length}</span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                        {col.tasks.map((task, i) => (
                            <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                onClick={() => router.visit(`/user/tugas/${task.id}`)}
                                className="rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-4 shadow-lg backdrop-blur-xl cursor-pointer dark:border-white/5">
                                <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2 line-clamp-2">{task.judul}</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-1">{task.course.nama}</p>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                                    <Calendar className="h-3 w-3" />{task.deadline_display}
                                </div>
                                <div className="flex items-center gap-2">
                                    {priorityBadge(task.prioritas)}
                                    {task.is_overdue && <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">Overdue!</span>}
                                </div>
                            </motion.div>
                        ))}
                        {col.tasks.length === 0 && (
                            <div className="text-center py-8 text-neutral-400 text-sm">Tidak ada tugas</div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
