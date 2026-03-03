import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    Plus, Search, Users2, Calendar, CheckCircle, Clock, AlertTriangle, Filter,
    BarChart3, ChevronRight, Lock, Unlock, Sparkles, UserCheck
} from 'lucide-react';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';

type Assignment = {
    id: number; title: string; description: string; formation_mode: string; grading_mode: string;
    course: { id: number; nama: string }; dosen: { id: number; nama: string } | null;
    min_members: number; max_members: number; is_locked: boolean;
    total_groups: number; total_students: number; submitted_groups: number; graded_groups: number;
    formation_deadline_display: string | null; submission_deadline_display: string | null;
    created_at: string; is_overdue: boolean; days_until_deadline: number;
};
type Stats = { total: number; active: number; overdue: number; total_groups: number; total_students: number; avg_completion: number };
type Course = { id: number; nama: string };
type Props = { assignments: Assignment[]; stats: Stats; courses: Course[]; filters: { search?: string; course_id?: string } };

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } };
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;

const formationIcons: Record<string, typeof Users2> = { 'self-form': Users2, random: Sparkles, manual: UserCheck };
const formationColors: Record<string, string> = { 'self-form': 'from-blue-500 to-cyan-500', random: 'from-purple-500 to-violet-500', manual: 'from-amber-500 to-orange-500' };

export default function AdminTugasKelompok({ assignments, stats, courses, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [courseFilter, setCourseFilter] = useState(filters.course_id || 'all');

    const handleSearch = () => router.get('/admin/tugas-kelompok', { search, course_id: courseFilter }, { preserveState: true });

    const statCards = [
        { label: 'Total Tugas', value: stats.total, icon: Users2, color: 'from-violet-500 to-purple-600' },
        { label: 'Aktif', value: stats.active, icon: CheckCircle, color: 'from-emerald-500 to-green-600' },
        { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
        { label: 'Total Kelompok', value: stats.total_groups, icon: Users2, color: 'from-blue-500 to-indigo-600' },
        { label: 'Total Mahasiswa', value: stats.total_students, icon: UserCheck, color: 'from-amber-500 to-orange-600' },
        { label: 'Avg Completion', value: `${stats.avg_completion}%`, icon: BarChart3, color: 'from-fuchsia-500 to-pink-600' },
    ];

    return (
        <AppLayout>
            <Head title="Tugas Kelompok" />
            <motion.div className="space-y-6 p-4 md:p-6" variants={cV} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                        <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="relative flex shrink-0 h-16 w-16 sm:h-20 sm:w-20"
                            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300 }}>
                            <img src={TugasIcon} alt="Tugas Kelompok" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                        </motion.div>
                        <div className="flex-1 mt-1 sm:mt-0">
                            <h1 className="text-2xl sm:text-3xl font-bold">Tugas Kelompok</h1>
                            <p className="mt-1 text-purple-100 text-sm">Kelola semua tugas kelompok mahasiswa</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={() => router.visit('/admin/tugas-kelompok/create')}
                                className="bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 rounded-xl">
                                <Plus className="mr-2 h-4 w-4" /> Buat Tugas Kelompok
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div variants={iV} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {statCards.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div key={i} whileHover={{ y: -4 }} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 backdrop-blur-xl shadow-lg">
                                <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-2', s.color)}><Icon className="h-4 w-4" /></div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                                <p className="text-xs text-slate-500">{s.label}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Filters */}
                <motion.div variants={iV} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Cari tugas kelompok..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()} className="pl-10 rounded-xl bg-white/60 dark:bg-neutral-800/60" />
                    </div>
                    <select value={courseFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setCourseFilter(e.target.value); router.get('/admin/tugas-kelompok', { search, course_id: e.target.value }, { preserveState: true }); }}
                        className="rounded-xl border px-3 py-2 text-sm bg-white/60 dark:bg-neutral-800/60">
                        <option value="all">Semua Mata Kuliah</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                    </select>
                </motion.div>

                {/* Assignments List */}
                <motion.div variants={iV} className="space-y-3">
                    {assignments.length === 0 ? (
                        <div className="text-center py-12 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl">
                            <Users2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">Belum ada tugas kelompok</p>
                        </div>
                    ) : assignments.map(a => {
                        const FIcon = formationIcons[a.formation_mode] || Users2;
                        const fColor = formationColors[a.formation_mode] || 'from-purple-500 to-fuchsia-500';
                        const progress = a.total_groups > 0 ? Math.round((a.submitted_groups / a.total_groups) * 100) : 0;
                        return (
                            <motion.div key={a.id} whileHover={{ y: -2 }} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 backdrop-blur-xl shadow-lg cursor-pointer"
                                onClick={() => router.visit(`/admin/tugas-kelompok/${a.id}`)}>
                                <div className="flex items-center gap-4">
                                    <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', fColor)}><FIcon className="h-6 w-6" /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{a.title}</h3>
                                            {a.is_locked && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                                            {a.is_overdue && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-medium">Overdue</span>}
                                        </div>
                                        <p className="text-sm text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                                            <span>{a.course.nama}</span>
                                            {a.dosen && <span>• {a.dosen.nama}</span>}
                                            <span>• {a.total_groups} kelompok</span>
                                            <span>• {a.total_students} mahasiswa</span>
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="w-20 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" style={{ width: `${progress}%` }} />
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{progress}% submit</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-300" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
