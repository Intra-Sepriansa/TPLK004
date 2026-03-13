import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Target,
    Zap,
} from 'lucide-react';

interface Tugas {
    id: number;
    judul: string;
    deskripsi: string;
    jenis: string;
    deadline: string;
    deadline_display: string;
    prioritas: string;
    course: { id: number; nama: string; dosen: string | null };
    created_by: string;
    is_overdue: boolean;
    days_until_deadline: number;
    is_read: boolean;
    diskusi_count: number;
}

const priorityBadge = (p: string) => {
    const c: Record<string, { bg: string; icon: typeof Zap; label: string }> = {
        tinggi: { bg: 'from-red-500 to-rose-600', icon: Zap, label: 'Tinggi' },
        sedang: {
            bg: 'from-amber-500 to-orange-500',
            icon: Target,
            label: 'Sedang',
        },
        rendah: {
            bg: 'from-emerald-500 to-green-500',
            icon: CheckCircle,
            label: 'Rendah',
        },
    };
    const cfg = c[p] || c.rendah;
    const Icon = cfg.icon;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-lg bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold ${cfg.bg} text-white`}
        >
            <Icon className="h-2.5 w-2.5" />
            {cfg.label}
        </span>
    );
};

const columns = [
    {
        id: 'todo',
        title: 'Belum Dikerjakan',
        color: 'from-slate-500 to-slate-600',
        icon: FileText,
        filter: (t: Tugas) => !t.is_overdue && t.days_until_deadline > 3,
    },
    {
        id: 'urgent',
        title: 'Segera Dikerjakan',
        color: 'from-amber-500 to-orange-600',
        icon: Clock,
        filter: (t: Tugas) =>
            !t.is_overdue &&
            t.days_until_deadline <= 3 &&
            t.days_until_deadline >= 0,
    },
    {
        id: 'overdue',
        title: 'Terlewat',
        color: 'from-red-500 to-rose-600',
        icon: AlertTriangle,
        filter: (t: Tugas) => t.is_overdue,
    },
    {
        id: 'read',
        title: 'Sudah Dibaca',
        color: 'from-emerald-500 to-teal-600',
        icon: Eye,
        filter: (t: Tugas) =>
            t.is_read && !t.is_overdue && t.days_until_deadline > 3,
    },
];

export default function KanbanView({ tugasList }: { tugasList: Tugas[] }) {
    // Distribute tasks into columns
    const assigned = new Set<number>();
    const colData = columns.map((col) => {
        const tasks = tugasList.filter((t) => {
            if (assigned.has(t.id)) return false;
            if (col.filter(t)) {
                assigned.add(t.id);
                return true;
            }
            return false;
        });
        return { ...col, tasks };
    });
    // Remaining unassigned go to first column
    const remaining = tugasList.filter((t) => !assigned.has(t.id));
    if (remaining.length) colData[0].tasks.push(...remaining);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {colData.map((col, ci) => (
                <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.1 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div
                        className={`mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r p-3 ${col.color} text-white`}
                    >
                        <div className="flex items-center gap-2">
                            <col.icon className="h-5 w-5" />
                            <h3 className="text-sm font-bold">{col.title}</h3>
                        </div>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                            {col.tasks.length}
                        </span>
                    </div>
                    <div className="min-h-[200px] space-y-3">
                        {col.tasks.map((task, i) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                onClick={() =>
                                    router.visit(`/user/tugas/${task.id}`)
                                }
                                className="cursor-pointer rounded-2xl border border-white/20 bg-white/60 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                            >
                                <h4 className="mb-2 line-clamp-2 text-sm font-bold text-neutral-900 dark:text-white">
                                    {task.judul}
                                </h4>
                                <p className="mb-2 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                                    {task.course.nama}
                                </p>
                                <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    <Calendar className="h-3 w-3" />
                                    {task.deadline_display}
                                </div>
                                <div className="flex items-center gap-2">
                                    {priorityBadge(task.prioritas)}
                                    {task.is_overdue && (
                                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                                            Overdue!
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {col.tasks.length === 0 && (
                            <div className="py-8 text-center text-sm text-neutral-400">
                                Tidak ada tugas
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
