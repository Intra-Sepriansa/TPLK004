import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, CheckCircle, Clock, Eye, ChevronRight, AlertTriangle,
    Award, Lock, Unlock, FileText, Users2, Sparkles, UserCheck, Target
} from 'lucide-react';

type Assignment = {
    id: number; title: string; description: string; formation_mode: string; grading_mode: string;
    course: { nama: string }; min_members: number; max_members: number;
    formation_deadline_display: string | null; submission_deadline_display: string | null;
    is_locked: boolean; is_overdue: boolean; days_until_deadline: number;
    my_group: { id: number; name: string; member_count: number; role: string } | null;
    total_groups: number; has_submitted: boolean; my_grade: number | null;
};
type Props = { assignments: Assignment[]; mahasiswa: { id: number; nama: string } };

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } } as const;
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;

const formationIcons: Record<string, any> = { 'self-form': Users2, random: Sparkles, manual: UserCheck };
const formationColors: Record<string, string> = { 'self-form': 'from-blue-500 to-cyan-500', random: 'from-purple-500 to-violet-500', manual: 'from-amber-500 to-orange-500' };

export default function UserTugasKelompok({ assignments, mahasiswa }: Props) {
    return (
        <StudentLayout>
            <Head title="Tugas Kelompok" />
            <motion.div className="space-y-6 p-4 md:p-6" variants={cV} initial="hidden" animate="visible">
                {/* ═══ HEADER ═══ */}
                <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300 }}>
                                <Users className="h-10 w-10 text-white" />
                            </motion.div>
                            <div>
                                <motion.h1 className="text-2xl sm:text-3xl font-bold" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>Tugas Kelompok</motion.h1>
                                <motion.p className="mt-1 text-purple-100 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>Kolaborasi, pesan, dan file sharing dalam satu tempat</motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ SUMMARY ═══ */}
                <motion.div variants={iV} className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total', value: assignments.length, color: 'from-purple-500 to-violet-500', icon: FileText },
                        { label: 'Sudah Submit', value: assignments.filter(a => a.has_submitted).length, color: 'from-emerald-500 to-green-500', icon: CheckCircle },
                        { label: 'Belum Kelompok', value: assignments.filter(a => !a.my_group).length, color: 'from-amber-500 to-orange-500', icon: AlertTriangle },
                    ].map(s => {
                        const SIcon = s.icon;
                        return (
                            <motion.div key={s.label} whileHover={{ y: -3 }} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 backdrop-blur-xl text-center">
                                <div className={cn('w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white bg-gradient-to-br mb-2', s.color)}><SIcon className="h-5 w-5" /></div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                                <p className="text-xs text-slate-500">{s.label}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══ ASSIGNMENT LIST ═══ */}
                <motion.div variants={iV} className="space-y-3">
                    {assignments.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl">
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full"><Users className="h-10 w-10 text-white" /></motion.div>
                            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Belum ada tugas kelompok</p>
                            <p className="text-sm text-slate-500 mt-2">Tugas kelompok dari dosen akan muncul di sini</p>
                        </motion.div>
                    ) : assignments.map((a, i) => {
                        const FIcon = formationIcons[a.formation_mode] || Users2;
                        const fColor = formationColors[a.formation_mode] || 'from-blue-500 to-cyan-500';
                        return (
                            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                onClick={() => router.visit(`/user/akademik/tugas-kelompok/${a.id}`)}
                                className={cn('rounded-2xl border-2 p-4 cursor-pointer relative overflow-hidden transition-all',
                                    a.is_overdue ? 'border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20' :
                                        a.my_group ? 'border-purple-200/50 bg-purple-50/30 dark:border-purple-800/30 dark:bg-purple-950/10' :
                                            'border-slate-200/50 bg-white/60 dark:border-slate-700/50 dark:bg-neutral-800/30')}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Badges */}
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r', fColor)}>
                                                <FIcon className="h-3 w-3" /> {a.formation_mode}
                                            </span>
                                            {a.my_group ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                    <Users className="h-3 w-3" /> {a.my_group.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                    <AlertTriangle className="h-3 w-3" /> Belum punya kelompok
                                                </span>
                                            )}
                                            {a.has_submitted && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" /> Submitted</span>}
                                            {a.my_grade !== null && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Award className="h-3 w-3" /> {a.my_grade}</span>}
                                            {a.is_locked && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700"><Lock className="h-3 w-3" /></span>}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{a.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">{a.description}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                                            <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{a.course.nama}</span>
                                            {a.submission_deadline_display && (
                                                <span className={cn('inline-flex items-center gap-1', a.is_overdue && 'text-red-600')}>
                                                    <Calendar className="h-3 w-3" />{a.submission_deadline_display}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{a.min_members}-{a.max_members} anggota</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 shrink-0 mt-2" />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
