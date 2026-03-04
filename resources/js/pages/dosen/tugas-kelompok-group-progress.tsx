import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, Award, BarChart3, Target, MessageSquare, FileText,
    CheckCircle, Clock, Crown, Star, Shield, TrendingUp, Download, AlertTriangle,
    ChevronDown, ChevronUp, Eye, Timer, Activity, Folder, Send
} from 'lucide-react';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import StatTotalGroupIcon from '@/assets/dosen/template/total-template.png';
import StatSubmittedIcon from '@/assets/dosen/template/template-aktif.png';
import StatGradedIcon from '@/assets/dosen/template/Auto-Activate.png';
import StatAverageIcon from '@/assets/dosen/template/rata2-durasi.png';

type Member = { id: number; nama: string; nim: string; kelas?: string | null; is_leader: boolean; joined_at?: string; contribution_points: number; message_count: number; file_count: number; tasks_completed: number; tasks_assigned: number };
type Task = { id: number; title: string; description?: string; status: string; deadline?: string | null; deadline_display?: string | null; assignees: { id: number; nama: string }[]; created_at?: string };
type GaFile = { id: number; original_name: string; file_type?: string | null; file_size_formatted?: string | null; uploader_name: string; file_path: string; created_at?: string };
type ActivityLog = { id: number; type: string; user_name: string; metadata?: any; points: number; created_at: string; created_at_full?: string };
type ConflictReport = { id: number; reporter_name: string; description: string; status: string; resolution_notes?: string | null; created_at?: string };
type Submission = { submitted_at?: string; is_late: boolean; late_duration: number; grade: number | null; grading_notes?: string | null; graded_at?: string | null };
type Props = {
    assignment: { id: number; title: string; course: { id: number; nama: string }; formation_mode: string; grading_mode: string; submission_deadline?: string | null; submission_deadline_display?: string | null; is_locked: boolean };
    group: { id: number; name: string; slot_number?: number | null; leader_id: number; progress: number };
    members: Member[]; tasks: Task[];
    taskStats: { total: number; completed: number; in_progress: number; pending: number };
    communicationStats: { total_messages: number; distribution: { student_id: number; nama: string; count: number }[] };
    files: GaFile[]; activityLogs: ActivityLog[]; submission: Submission | null;
    conflictReports: ConflictReport[]; lastActivity: string | null;
    dosen: { id: number; nama: string };
};

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } } as const;
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;
const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Selesai' },
    in_progress: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Dikerjakan' },
    pending: { bg: 'bg-slate-100 dark:bg-slate-800/30', text: 'text-slate-600 dark:text-slate-400', label: 'Pending' },
};
const activityTypeIcons: Record<string, { icon: typeof Activity; color: string }> = {
    message: { icon: MessageSquare, color: 'text-blue-500' },
    file_upload: { icon: FileText, color: 'text-purple-500' },
    task_created: { icon: Target, color: 'text-amber-500' },
    task_completed: { icon: CheckCircle, color: 'text-emerald-500' },
    member_joined: { icon: Users, color: 'text-cyan-500' },
    member_left: { icon: Users, color: 'text-red-500' },
};

function ContributionBar({ value, max, color = 'from-purple-500 to-fuchsia-500' }: { value: number; max: number; color?: string }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-2 rounded-full bg-slate-200/60 dark:bg-neutral-700/50 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn('h-full rounded-full bg-gradient-to-r', color)} />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 w-8 text-right">{value}</span>
        </div>
    );
}

export default function DosenGroupProgress({ assignment, group, members, tasks, taskStats, communicationStats, files, activityLogs, submission, conflictReports, lastActivity, dosen }: Props) {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const toggleSection = (s: string) => setActiveSection(prev => prev === s ? null : s);

    const maxContrib = useMemo(() => Math.max(...members.map(m => m.contribution_points), 1), [members]);
    const maxMessages = useMemo(() => Math.max(...communicationStats.distribution.map(d => d.count), 1), [communicationStats]);
    const leader = members.find(m => m.is_leader);
    const taskProgress = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

    const overviewCards = [
        { label: 'Progress', value: `${group.progress}%`, icon: StatTotalGroupIcon, cardClass: 'border-violet-300/40 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20', valueClass: 'text-violet-700 dark:text-violet-200' },
        { label: 'Task Selesai', value: `${taskStats.completed}/${taskStats.total}`, icon: StatSubmittedIcon, cardClass: 'border-emerald-300/45 bg-emerald-100/55 dark:border-emerald-500/30 dark:bg-emerald-900/20', valueClass: 'text-emerald-700 dark:text-emerald-200' },
        { label: 'Pesan', value: communicationStats.total_messages, icon: StatGradedIcon, cardClass: 'border-sky-300/45 bg-sky-100/55 dark:border-sky-500/30 dark:bg-sky-900/20', valueClass: 'text-sky-700 dark:text-sky-200' },
        { label: 'File', value: files.length, icon: StatAverageIcon, cardClass: 'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20', valueClass: 'text-amber-700 dark:text-amber-200' },
    ];

    return (
        <DosenLayout>
            <Head title={`Progress - ${group.name}`} />
            <motion.div className="space-y-5 overflow-x-hidden p-4 md:p-6" variants={cV} initial="hidden" animate="visible">
                {/* ═══ HEADER ═══ */}
                <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <motion.button whileHover={{ scale: 1.02, x: -2 }} whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit(`/dosen/tugas-kelompok/${assignment.id}`)}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Kelompok
                        </motion.button>

                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="relative flex shrink-0 h-16 w-16 sm:h-20 sm:w-20"
                                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300 }}>
                                <img src={TugasIcon} alt="Progress" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-sm text-purple-100 font-medium">{assignment.course.nama} • {assignment.title}</p>
                                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{group.name}</h1>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur inline-flex items-center gap-1"><Users className="h-3 w-3" />{members.length} Anggota</span>
                                    {leader && <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur inline-flex items-center gap-1"><Crown className="h-3 w-3" />Ketua: {leader.nama}</span>}
                                    {submission && <span className={cn('px-3 py-1 rounded-full text-xs backdrop-blur inline-flex items-center gap-1', submission.grade !== null ? 'bg-emerald-500/30' : 'bg-blue-500/30')}>{submission.grade !== null ? <><Award className="h-3 w-3" />Nilai: {submission.grade}</> : <><CheckCircle className="h-3 w-3" />Submitted</>}</span>}
                                    {lastActivity && <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur inline-flex items-center gap-1"><Clock className="h-3 w-3" />{lastActivity}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Overall progress bar */}
                        <div className="mt-5">
                            <div className="flex justify-between text-xs text-purple-200 mb-1.5"><span>Overall Progress</span><span className="font-bold">{group.progress}%</span></div>
                            <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${group.progress}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                                    className={cn('h-full rounded-full', group.progress >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-400' : group.progress >= 50 ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-amber-400 to-orange-400')} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ OVERVIEW CARDS ═══ */}
                <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {overviewCards.map(s => (
                        <motion.div key={s.label} whileHover={{ y: -3 }} className={cn('rounded-2xl border p-4 backdrop-blur-xl shadow-lg', s.cardClass)}>
                            <div className="flex items-center justify-between gap-3">
                                <img src={s.icon} alt={s.label} className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.28)]" />
                                <div className="text-right"><p className={cn('text-2xl font-bold', s.valueClass)}>{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══ MEMBER CONTRIBUTION MATRIX ═══ */}
                <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden">
                    <div className="p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4"><Users className="h-5 w-5 text-purple-500" /> Kontribusi Anggota</h3>
                        <div className="space-y-4">
                            {members.map((m, i) => (
                                <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className={cn('rounded-2xl border p-4', m.is_leader ? 'border-amber-200/50 bg-amber-50/30 dark:border-amber-700/30 dark:bg-amber-900/10' : 'border-slate-200/50 bg-white/50 dark:border-neutral-700/30 dark:bg-neutral-800/20')}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0', m.is_leader ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-purple-500 to-fuchsia-500')}>
                                            {m.nama.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                                {m.nama}{m.is_leader && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{m.nim}{m.kelas ? ` • ${m.kelas}` : ''}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{m.contribution_points}</p>
                                            <p className="text-[10px] text-slate-500">poin</p>
                                        </div>
                                    </div>
                                    {/* Metrics grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                            <div className="flex-1"><p className="text-[10px] text-slate-500 mb-0.5">Pesan</p><ContributionBar value={m.message_count} max={maxMessages} color="from-blue-500 to-cyan-500" /></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                            <div className="flex-1"><p className="text-[10px] text-slate-500 mb-0.5">File</p><ContributionBar value={m.file_count} max={Math.max(...members.map(mm => mm.file_count), 1)} color="from-purple-500 to-fuchsia-500" /></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                            <div className="flex-1"><p className="text-[10px] text-slate-500 mb-0.5">Task Selesai</p><ContributionBar value={m.tasks_completed} max={Math.max(...members.map(mm => mm.tasks_assigned), 1)} color="from-emerald-500 to-green-500" /></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                            <div className="flex-1"><p className="text-[10px] text-slate-500 mb-0.5">Ditugaskan</p><ContributionBar value={m.tasks_assigned} max={taskStats.total > 0 ? taskStats.total : 1} color="from-amber-500 to-orange-500" /></div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ═══ TASK & MILESTONE TRACKER ═══ */}
                <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden">
                    <button onClick={() => toggleSection('tasks')} className="w-full flex items-center justify-between p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Target className="h-5 w-5 text-purple-500" /> Task Board ({taskStats.completed}/{taskStats.total})</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-24 h-2 rounded-full bg-slate-200/60 dark:bg-neutral-700/50 overflow-hidden"><div className={cn('h-full rounded-full', taskProgress >= 80 ? 'bg-emerald-500' : taskProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: `${taskProgress}%` }} /></div>
                            <span className="text-xs font-bold text-slate-500">{taskProgress}%</span>
                            {activeSection === 'tasks' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                    </button>
                    <AnimatePresence>{activeSection === 'tasks' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5">
                                {/* Task status summary */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[{ l: 'Selesai', v: taskStats.completed, c: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
                                    { l: 'Dikerjakan', v: taskStats.in_progress, c: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                                    { l: 'Pending', v: taskStats.pending, c: 'text-slate-500 bg-slate-100 dark:bg-slate-800/30' }
                                    ].map(s => <div key={s.l} className={cn('rounded-xl p-3 text-center', s.c)}><p className="text-xl font-bold">{s.v}</p><p className="text-[10px]">{s.l}</p></div>)}
                                </div>
                                {tasks.length === 0 ? <p className="text-center py-4 text-sm text-slate-400">Belum ada task</p> : (
                                    <div className="space-y-2">
                                        {tasks.map(t => {
                                            const sc = statusColors[t.status] || statusColors.pending;
                                            return (
                                                <div key={t.id} className={cn('rounded-xl border p-3 flex items-center gap-3', sc.bg)}>
                                                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', t.status === 'completed' ? 'bg-emerald-500 text-white' : t.status === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300')}>
                                                        {t.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : t.status === 'in_progress' ? <Timer className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn('text-sm font-medium truncate', t.status === 'completed' && 'line-through text-slate-400')}>{t.title}</p>
                                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', sc.bg, sc.text)}>{sc.label}</span>
                                                            {t.assignees.length > 0 && <span className="text-[10px] text-slate-500">{t.assignees.map(a => a.nama).join(', ')}</span>}
                                                            {t.deadline_display && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{t.deadline_display}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}</AnimatePresence>
                </motion.div>

                {/* ═══ COMMUNICATION ANALYTICS ═══ */}
                <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden">
                    <button onClick={() => toggleSection('comm')} className="w-full flex items-center justify-between p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageSquare className="h-5 w-5 text-purple-500" /> Komunikasi ({communicationStats.total_messages} pesan)</h3>
                        {activeSection === 'comm' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>
                    <AnimatePresence>{activeSection === 'comm' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5 space-y-3">
                                <p className="text-sm text-slate-500 font-medium">Distribusi Pesan per Anggota</p>
                                {communicationStats.distribution.map((d, i) => {
                                    const pct = communicationStats.total_messages > 0 ? Math.round((d.count / communicationStats.total_messages) * 100) : 0;
                                    const isLow = d.count < (communicationStats.total_messages / members.length) * 0.3;
                                    return (
                                        <div key={d.student_id} className="flex items-center gap-3">
                                            <div className="w-24 sm:w-32 text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{d.nama}</div>
                                            <div className="flex-1 h-3 rounded-full bg-slate-200/60 dark:bg-neutral-700/50 overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((d.count / maxMessages) * 100, 100)}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                                                    className={cn('h-full rounded-full bg-gradient-to-r', isLow ? 'from-red-400 to-red-500' : 'from-blue-500 to-cyan-500')} />
                                            </div>
                                            <span className="text-xs font-mono text-slate-500 w-16 text-right">{d.count} ({pct}%)</span>
                                            {isLow && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}</AnimatePresence>
                </motion.div>

                {/* ═══ FILES & RESOURCES ═══ */}
                <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden">
                    <button onClick={() => toggleSection('files')} className="w-full flex items-center justify-between p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Folder className="h-5 w-5 text-purple-500" /> File & Resources ({files.length})</h3>
                        {activeSection === 'files' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>
                    <AnimatePresence>{activeSection === 'files' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5">
                                {files.length === 0 ? <p className="text-center py-4 text-sm text-slate-400">Belum ada file</p> : (
                                    <div className="space-y-2">{files.map(f => (
                                        <div key={f.id} className="flex items-center justify-between rounded-xl border p-3 bg-white/60 dark:bg-neutral-800/30">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileText className="h-8 w-8 text-purple-500 shrink-0" />
                                                <div className="min-w-0"><p className="text-sm font-medium text-slate-900 dark:text-white truncate">{f.original_name}</p><p className="text-xs text-slate-500">{f.file_size_formatted ?? '-'} • {f.uploader_name} • {f.created_at}</p></div>
                                            </div>
                                            {f.file_path && <a href={f.file_path} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-700 shrink-0"><Download className="h-4 w-4" /></a>}
                                        </div>
                                    ))}</div>
                                )}
                            </div>
                        </motion.div>
                    )}</AnimatePresence>
                </motion.div>

                {/* ═══ ACTIVITY TIMELINE ═══ */}
                <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden">
                    <button onClick={() => toggleSection('activity')} className="w-full flex items-center justify-between p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><TrendingUp className="h-5 w-5 text-purple-500" /> Timeline Aktivitas ({activityLogs.length})</h3>
                        {activeSection === 'activity' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>
                    <AnimatePresence>{activeSection === 'activity' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5">
                                {activityLogs.length === 0 ? <p className="text-center py-4 text-sm text-slate-400">Belum ada aktivitas</p> : (
                                    <div className="relative space-y-0">
                                        <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-400 via-purple-300 to-transparent dark:from-purple-600 dark:via-purple-800" />
                                        {activityLogs.slice(0, 30).map((log, i) => {
                                            const at = activityTypeIcons[log.type] || { icon: Activity, color: 'text-slate-400' };
                                            const Icon = at.icon;
                                            return (
                                                <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                                    className="relative flex gap-3 py-2.5 pl-1">
                                                    <div className={cn('relative z-10 w-[30px] h-[30px] rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center bg-white dark:bg-neutral-800 shrink-0 shadow-sm', at.color)}>
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-medium text-slate-900 dark:text-white">{log.user_name}</span> — {log.type.replace(/_/g, ' ')}</p>
                                                        <p className="text-[10px] text-slate-400">{log.created_at_full ?? log.created_at}{log.points > 0 && <span className="ml-2 text-purple-500 font-medium">+{log.points} pts</span>}</p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}</AnimatePresence>
                </motion.div>

                {/* ═══ SUBMISSION STATUS ═══ */}
                <motion.div variants={iV} className={cn('rounded-3xl border p-5 backdrop-blur-xl shadow-xl', submission ? (submission.grade !== null ? 'border-emerald-200/50 bg-emerald-50/40 dark:border-emerald-700/30 dark:bg-emerald-900/10' : 'border-blue-200/50 bg-blue-50/40 dark:border-blue-700/30 dark:bg-blue-900/10') : 'border-slate-200/50 bg-white/40 dark:border-neutral-700/30 dark:bg-neutral-900/40')}>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><Award className="h-5 w-5 text-purple-500" /> Status Pengumpulan</h3>
                    {!submission ? (
                        <div className="flex items-center gap-3 text-slate-500"><Clock className="h-5 w-5" /><p className="text-sm">Belum mengumpulkan tugas</p></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded-xl border p-3 text-center bg-white/60 dark:bg-neutral-800/30">
                                <p className="text-xs text-slate-500 mb-1">Waktu Submit</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{submission.submitted_at ?? '-'}</p>
                                {submission.is_late && <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1"><AlertTriangle className="h-2.5 w-2.5" />Terlambat {submission.late_duration} menit</span>}
                            </div>
                            <div className="rounded-xl border p-3 text-center bg-white/60 dark:bg-neutral-800/30">
                                <p className="text-xs text-slate-500 mb-1">Nilai</p>
                                <p className={cn('text-2xl font-bold', submission.grade !== null ? 'text-emerald-600' : 'text-slate-400')}>{submission.grade ?? '-'}</p>
                            </div>
                            <div className="rounded-xl border p-3 text-center bg-white/60 dark:bg-neutral-800/30">
                                <p className="text-xs text-slate-500 mb-1">Catatan Dosen</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{submission.grading_notes || '-'}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* ═══ CONFLICT REPORTS ═══ */}
                {conflictReports.length > 0 && (
                    <motion.div variants={iV} className="rounded-3xl border border-red-200/40 bg-red-50/30 dark:border-red-700/30 dark:bg-red-900/10 p-5 backdrop-blur-xl shadow-xl">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><Shield className="h-5 w-5 text-red-500" /> Laporan Konflik ({conflictReports.length})</h3>
                        <div className="space-y-3">
                            {conflictReports.map(cr => (
                                <div key={cr.id} className={cn('rounded-xl border p-4', cr.status === 'open' ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20' : cr.status === 'in_review' ? 'border-amber-200 bg-amber-50/50' : 'border-green-200 bg-green-50/50')}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', cr.status === 'open' ? 'bg-red-100 text-red-700' : cr.status === 'in_review' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>{cr.status}</span>
                                                <span className="text-xs text-slate-500">oleh {cr.reporter_name} • {cr.created_at}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{cr.description}</p>
                                            {cr.resolution_notes && <p className="text-xs text-emerald-600 mt-1 italic">Resolusi: {cr.resolution_notes}</p>}
                                        </div>
                                        {cr.status === 'open' && (
                                            <Button size="sm" onClick={() => router.post(`/dosen/tugas-kelompok/${assignment.id}/conflicts/${cr.id}/resolve`, { resolution_notes: 'Diselesaikan oleh dosen' })}
                                                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs h-7 shrink-0"><CheckCircle className="mr-1 h-3 w-3" />Resolve</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </DosenLayout>
    );
}
