import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import { Calendar, Zap, Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface Tugas {
    id: number; judul: string; deskripsi: string; jenis: string;
    deadline: string; deadline_display: string; prioritas: string;
    course: { id: number; nama: string; dosen: string | null }; created_by: string;
    is_overdue: boolean; days_until_deadline: number; is_read: boolean; diskusi_count: number;
}

export default function TimelineView({ tugasList }: { tugasList: Tugas[] }) {
    const sorted = [...tugasList].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <Calendar className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Timeline Deadline</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Urutan deadline tugas</p>
                </div>
            </div>
            <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
                <div className="space-y-6">
                    {sorted.map((t, i) => {
                        const isOverdue = t.is_overdue;
                        const isUrgent = t.days_until_deadline <= 3 && !isOverdue;
                        const pc: Record<string, { icon: typeof Zap }> = {
                            tinggi: { icon: Zap }, sedang: { icon: Target }, rendah: { icon: CheckCircle },
                        };
                        const PIcon = (pc[t.prioritas] || pc.rendah).icon;
                        return (
                            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }} className="relative pl-16">
                                <motion.div whileHover={{ scale: 1.2 }}
                                    className={`absolute left-6 top-2 h-5 w-5 rounded-full border-4 border-white dark:border-neutral-900 ${isOverdue ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                    {isOverdue && (
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full bg-red-500 opacity-50" />
                                    )}
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.02, x: 5 }}
                                    onClick={() => router.visit(`/user/tugas/${t.id}`)}
                                    className={`rounded-2xl border p-4 cursor-pointer transition-all ${isOverdue
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        : isUrgent
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                            : 'bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/5 backdrop-blur-xl'
                                        }`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-neutral-900 dark:text-white mb-1">{t.judul}</h4>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{t.course.nama}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r ${t.prioritas === 'tinggi' ? 'from-red-500 to-rose-600' : t.prioritas === 'sedang' ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-green-500'}`}>
                                                    <PIcon className="h-2.5 w-2.5" />{t.prioritas === 'tinggi' ? 'Tinggi' : t.prioritas === 'sedang' ? 'Sedang' : 'Rendah'}
                                                </span>
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.deadline_display}</span>
                                            </div>
                                        </div>
                                        <div className={`flex min-w-[70px] flex-col items-center justify-center rounded-xl p-3 text-white ${isOverdue ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                            {isOverdue ? (
                                                <AlertTriangle className="h-5 w-5" />
                                            ) : (
                                                <span className="text-xl font-bold">{t.days_until_deadline}</span>
                                            )}
                                            <span className="text-[10px] font-medium">{isOverdue ? 'Lewat' : 'Hari'}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                    {sorted.length === 0 && <div className="text-center py-12 text-neutral-400">Tidak ada tugas</div>}
                </div>
            </div>
        </motion.div>
    );
}
