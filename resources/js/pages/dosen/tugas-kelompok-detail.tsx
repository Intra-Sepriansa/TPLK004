import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, Plus, Lock, Unlock, Sparkles, Award, BarChart3, AlertTriangle,
    CheckCircle, Clock, UserCheck, Eye, MessageSquare, FileText, ChevronRight, Target,
    Users2, Shuffle, FolderKanban, TrendingUp, Shield, Crown
} from 'lucide-react';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import StatTotalGroupIcon from '@/assets/dosen/template/total-template.png';
import StatSubmittedIcon from '@/assets/dosen/template/template-aktif.png';
import StatGradedIcon from '@/assets/dosen/template/Auto-Activate.png';
import StatAverageIcon from '@/assets/dosen/template/rata2-durasi.png';

type Member = { id: number; nama: string; nim: string; is_leader: boolean };
type GroupSummary = {
    id: number; name: string; member_count: number;
    members: { id: number; nama: string; is_leader: boolean; contribution_points: number }[];
    task_stats: { total: number; completed: number; in_progress: number; pending: number };
    message_count: number; file_count: number; has_submission: boolean; grade: number | null;
    is_late: boolean; progress: number;
};
type Analytics = {
    overview: { total_groups: number; total_students: number; submitted_groups: number; unsubmitted_groups: number; graded_groups: number; average_grade: number; late_submissions: number };
    contribution: { average_contribution: number; max_contribution: number; min_contribution: number; inactive_members: number; top_contributors: any[] };
    timeline: { date: string; activities: number; messages: number; files: number; tasks: number }[];
};
type Assignment = {
    id: number; title: string; description: string; formation_mode: string; grading_mode: string;
    min_members: number; max_members: number; formation_deadline_display: string | null;
    submission_deadline_display: string | null; is_locked: boolean;
    course: { id: number; nama: string }; features: string[];
    peer_evaluation_weight: number | null; allow_resubmission: boolean;
};
type ConflictReport = { id: number; group: { id: number; name: string }; reporter: { nama: string }; description: string; status: string; created_at: string };
type UnassignedStudent = { id: number; nama: string; nim: string };
type Props = {
    assignment: Assignment; groups: GroupSummary[]; analytics: Analytics;
    unassignedStudents: UnassignedStudent[]; peerEvalSummary: any;
    conflictReports: ConflictReport[]; dosen: { id: number; nama: string };
};

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } } as const;
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;

export default function DosenTugasKelompokDetail({ assignment, groups, analytics, unassignedStudents, peerEvalSummary, conflictReports, dosen }: Props) {
    const [activeTab, setActiveTab] = useState<'groups' | 'grading' | 'analytics' | 'conflicts'>('groups');
    const [gradeModal, setGradeModal] = useState<{ open: boolean; group: GroupSummary | null }>({ open: false, group: null });
    const [assignModal, setAssignModal] = useState(false);
    const [createGroupModal, setCreateGroupModal] = useState(false);

    const gradeForm = useForm({ group_id: 0, grade: 0, notes: '', adjustments: {} as Record<number, number> });
    const assignForm = useForm({ group_id: '', student_id: '' });
    const createGroupForm = useForm({ name: '', leader_id: '' });

    const tabs = [
        { key: 'groups', label: 'Kelompok', icon: Users, count: groups.length },
        { key: 'grading', label: 'Penilaian', icon: Award, count: analytics.overview.graded_groups },
        { key: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
        { key: 'conflicts', label: 'Konflik', icon: AlertTriangle, count: conflictReports.filter(c => c.status === 'open').length },
    ];

    const handleGrade = () => {
        gradeForm.post(`/dosen/tugas-kelompok/${assignment.id}/grade`, { onSuccess: () => setGradeModal({ open: false, group: null }) });
    };

    const handleAssign = () => {
        assignForm.post(`/dosen/tugas-kelompok/${assignment.id}/assign-student`, { onSuccess: () => setAssignModal(false) });
    };

    const handleCreateGroup = () => {
        createGroupForm.post(`/dosen/tugas-kelompok/${assignment.id}/create-group`, { onSuccess: () => setCreateGroupModal(false) });
    };

    return (
        <DosenLayout>
            <Head title={assignment.title} />
            <motion.div className="space-y-6 overflow-x-hidden p-4 md:p-6" variants={cV} initial="hidden" animate="visible">
                {/* ═══ HEADER ═══ */}
                <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/dosen/tugas-kelompok')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="relative flex shrink-0 h-16 w-16 sm:h-20 sm:w-20"
                                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300 }}>
                                    <img src={TugasIcon} alt="Detail" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <p className="text-sm text-purple-100 font-medium">{assignment.course.nama}</p>
                                    <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{assignment.title}</h1>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">{assignment.formation_mode}</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">{assignment.grading_mode}</span>
                                        <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">
                                            {assignment.is_locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                                            {assignment.is_locked ? 'Locked' : 'Open'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => router.patch(`/dosen/tugas-kelompok/${assignment.id}/toggle-lock`)}
                                    className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                    {assignment.is_locked ? <><Unlock className="h-4 w-4" /> Unlock</> : <><Lock className="h-4 w-4" /> Lock Kelompok</>}
                                </motion.button>
                                {assignment.formation_mode === 'random' && !assignment.is_locked && (
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => router.post(`/dosen/tugas-kelompok/${assignment.id}/random-groups`)}
                                        className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                        <Shuffle className="h-4 w-4" /> Acak Ulang
                                    </motion.button>
                                )}
                                {(assignment.formation_mode === 'manual') && (
                                    <>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => setCreateGroupModal(true)}
                                            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                            <Plus className="h-4 w-4" /> Buat Kelompok
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => setAssignModal(true)}
                                            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                            <UserCheck className="h-4 w-4" /> Assign Mahasiswa
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ OVERVIEW CARDS ═══ */}
                <motion.div variants={iV} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        {
                            label: 'Kelompok',
                            value: analytics.overview.total_groups,
                            icon: StatTotalGroupIcon,
                            cardClass: 'border-violet-300/40 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20',
                            valueClass: 'text-violet-700 dark:text-violet-200',
                        },
                        {
                            label: 'Submit',
                            value: analytics.overview.submitted_groups,
                            icon: StatSubmittedIcon,
                            cardClass: 'border-emerald-300/45 bg-emerald-100/55 dark:border-emerald-500/30 dark:bg-emerald-900/20',
                            valueClass: 'text-emerald-700 dark:text-emerald-200',
                        },
                        {
                            label: 'Dinilai',
                            value: analytics.overview.graded_groups,
                            icon: StatGradedIcon,
                            cardClass: 'border-sky-300/45 bg-sky-100/55 dark:border-sky-500/30 dark:bg-sky-900/20',
                            valueClass: 'text-sky-700 dark:text-sky-200',
                        },
                        {
                            label: 'Rata-rata',
                            value: analytics.overview.average_grade,
                            icon: StatAverageIcon,
                            cardClass: 'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20',
                            valueClass: 'text-amber-700 dark:text-amber-200',
                        },
                    ].map(s => {
                        return (
                            <motion.div
                                key={s.label}
                                whileHover={{ y: -3 }}
                                className={cn(
                                    'rounded-2xl border p-4 backdrop-blur-xl shadow-lg',
                                    s.cardClass,
                                )}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <img
                                        src={s.icon}
                                        alt={s.label}
                                        className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.28)]"
                                    />
                                    <div className="text-right">
                                        <p className={cn('text-2xl font-bold', s.valueClass)}>{s.value}</p>
                                        <p className="text-xs text-slate-500">{s.label}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══ TABS ═══ */}
                <motion.div variants={iV}>
                    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-100/50 backdrop-blur-md dark:bg-neutral-900/50">
                        <div className="max-w-full overflow-x-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="inline-flex min-w-max gap-1">
                        {tabs.map(tab => {
                            const TabIcon = tab.icon;
                            return (
                                <motion.button key={tab.key} layout onClick={() => setActiveTab(tab.key as any)}
                                    className={cn('relative shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors', activeTab === tab.key ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
                                    {activeTab === tab.key && <motion.div layoutId="activeTabGK" className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                                    <span className="relative z-10 flex items-center gap-2"><TabIcon className="h-4 w-4" />{tab.label}{tab.count !== null && <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}</span>
                                </motion.button>
                            );
                        })}
                        </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ TAB CONTENT ═══ */}
                <AnimatePresence mode="wait">
                    {/* ── GROUPS TAB ── */}
                    {activeTab === 'groups' && (
                        <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            {unassignedStudents.length > 0 && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:bg-amber-900/20 p-4 flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    <div><p className="font-semibold text-amber-800 dark:text-amber-200">{unassignedStudents.length} mahasiswa belum punya kelompok</p>
                                        <p className="text-xs text-amber-600">{unassignedStudents.map(s => s.nama).join(', ')}</p></div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {groups.map((g, i) => (
                                    <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -4, scale: 1.01 }}
                                        className="rounded-2xl border border-slate-200/50 dark:border-slate-700 bg-white/60 dark:bg-neutral-800/30 overflow-hidden">
                                        <div className={cn('h-1.5 bg-gradient-to-r', g.has_submission ? g.grade !== null ? 'from-emerald-500 to-green-500' : 'from-blue-500 to-indigo-500' : 'from-slate-300 to-slate-400')} />
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-bold text-slate-900 dark:text-white">{g.name}</h4>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{g.member_count} anggota</span>
                                            </div>
                                            <div className="space-y-1.5 mb-3">
                                                {g.members.map(m => (
                                                    <div key={m.id} className="flex items-center justify-between text-sm">
                                                        <span className={cn('text-slate-700 dark:text-slate-300', m.is_leader && 'font-medium')}>
                                                            {m.is_leader && <Crown className="mr-1 inline h-3.5 w-3.5 text-amber-500" />}
                                                            {m.nama}
                                                        </span>
                                                        <span className="text-xs text-slate-400">{m.contribution_points} pts</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mb-3">
                                                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{g.message_count}</span>
                                                <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{g.file_count}</span>
                                                <span className="flex items-center gap-1"><Target className="h-3 w-3" />{g.task_stats.completed}/{g.task_stats.total}</span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-3">
                                                <div className={cn('h-full rounded-full', g.progress >= 80 ? 'bg-emerald-500' : g.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: `${g.progress}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                {g.has_submission ? (
                                                    g.grade !== null ? <span className="text-xs font-bold text-emerald-600">Nilai: {g.grade}</span> : <span className="text-xs text-blue-600">Sudah submit</span>
                                                ) : <span className="text-xs text-slate-400">Belum submit</span>}
                                                {g.has_submission && g.grade === null && (
                                                    <Button size="sm" onClick={() => { gradeForm.setData('group_id', g.id); setGradeModal({ open: true, group: g }); }}
                                                        className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs h-7">
                                                        <Award className="mr-1 h-3 w-3" /> Nilai
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── GRADING TAB ── */}
                    {activeTab === 'grading' && (
                        <motion.div key="grading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-purple-500" /> Ringkasan Penilaian</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-slate-900 dark:text-white">{analytics.overview.graded_groups}</p><p className="text-xs text-slate-500">Dinilai</p></div>
                                    <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-amber-600">{analytics.overview.submitted_groups - analytics.overview.graded_groups}</p><p className="text-xs text-slate-500">Belum Dinilai</p></div>
                                    <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-emerald-600">{analytics.overview.average_grade}</p><p className="text-xs text-slate-500">Rata-rata</p></div>
                                    <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-red-600">{analytics.overview.late_submissions}</p><p className="text-xs text-slate-500">Terlambat</p></div>
                                </div>
                                {groups.filter(g => g.has_submission).map(g => (
                                    <div key={g.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200/50 dark:border-slate-700 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold', g.grade !== null ? 'bg-emerald-500' : 'bg-amber-500')}>{g.grade !== null ? '✓' : '?'}</div>
                                            <div><p className="font-medium text-slate-900 dark:text-white">{g.name}</p><p className="text-xs text-slate-500">{g.member_count} anggota {g.is_late && '• Terlambat'}</p></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {g.grade !== null ? <span className="font-bold text-emerald-600">{g.grade}</span> :
                                                <Button size="sm" onClick={() => { gradeForm.setData('group_id', g.id); setGradeModal({ open: true, group: g }); }}
                                                    className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs h-7"><Award className="mr-1 h-3 w-3" /> Nilai</Button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── ANALYTICS TAB ── */}
                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-purple-500" /> Analisis Kontribusi</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-indigo-600">{analytics.contribution.average_contribution}</p><p className="text-xs text-slate-500">Rata-rata</p></div>
                                    <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-emerald-600">{analytics.contribution.max_contribution}</p><p className="text-xs text-slate-500">Tertinggi</p></div>
                                    <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-amber-600">{analytics.contribution.min_contribution}</p><p className="text-xs text-slate-500">Terendah</p></div>
                                    <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-red-600">{analytics.contribution.inactive_members}</p><p className="text-xs text-slate-500">Tidak Aktif</p></div>
                                </div>
                                {analytics.contribution.top_contributors.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 inline-flex items-center gap-1.5">
                                            <Award className="h-4 w-4 text-amber-500" />
                                            Top Contributors
                                        </h4>
                                        {analytics.contribution.top_contributors.map((tc: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">{tc.group_name}</span>
                                                <span className="font-bold text-indigo-600">{tc.points} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {analytics.timeline.length > 0 && (
                                <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 inline-flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-purple-500" />
                                        Timeline Aktivitas
                                    </h3>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {analytics.timeline.map((day, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                <span className="text-xs font-medium text-slate-500 w-20 shrink-0">{day.date}</span>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${Math.min((day.activities / (analytics.timeline[0]?.activities || 1)) * 100, 100)}%` }} />
                                                    </div>
                                                    <span className="inline-flex w-auto shrink-0 items-center gap-2 text-xs text-slate-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <MessageSquare className="h-3.5 w-3.5" />
                                                            {day.messages}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <FileText className="h-3.5 w-3.5" />
                                                            {day.files}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <Target className="h-3.5 w-3.5" />
                                                            {day.tasks}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── CONFLICTS TAB ── */}
                    {activeTab === 'conflicts' && (
                        <motion.div key="conflicts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-red-500" /> Laporan Konflik</h3>
                                {conflictReports.length === 0 ? (
                                    <div className="text-center py-8"><p className="text-slate-500">Tidak ada laporan konflik</p></div>
                                ) : conflictReports.map(cr => (
                                    <div key={cr.id} className={cn('p-4 rounded-xl border mb-3', cr.status === 'open' ? 'border-red-200 bg-red-50/50' : cr.status === 'in_review' ? 'border-amber-200 bg-amber-50/50' : 'border-green-200 bg-green-50/50')}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                                                        cr.status === 'open' ? 'bg-red-100 text-red-700' : cr.status === 'in_review' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>{cr.status}</span>
                                                    <span className="text-xs text-slate-500">{cr.group.name}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300">{cr.description}</p>
                                                <p className="text-xs text-slate-400 mt-1">Dilaporkan oleh {cr.reporter.nama}</p>
                                            </div>
                                            {cr.status === 'open' && (
                                                <Button size="sm" onClick={() => router.post(`/dosen/tugas-kelompok/${assignment.id}/conflicts/${cr.id}/resolve`, { resolution_notes: 'Diselesaikan oleh dosen' })}
                                                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs h-7"><CheckCircle className="mr-1 h-3 w-3" /> Resolve</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ═══ GRADE MODAL ═══ */}
            <AnimatePresence>
                {gradeModal.open && gradeModal.group && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setGradeModal({ open: false, group: null })} />
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><Award className="h-5 w-5" /> Nilai {gradeModal.group.name}</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setGradeModal({ open: false, group: null })} className="text-white hover:bg-white/20"><span className="text-lg">×</span></Button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label>Nilai (0-100)</Label>
                                    <Input type="number" min={0} max={100} value={gradeForm.data.grade} onChange={(e) => gradeForm.setData('grade', parseFloat(e.target.value))} className="mt-1" />
                                </div>
                                {assignment.grading_mode === 'individual' && gradeModal.group.members.map(m => (
                                    <div key={m.id} className="flex items-center gap-3">
                                        <span className="text-sm flex-1">{m.nama}</span>
                                        <Input type="number" min={-50} max={50} placeholder="0" className="w-24"
                                            onChange={(e) => gradeForm.setData('adjustments', { ...gradeForm.data.adjustments, [m.id]: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                ))}
                                <div>
                                    <Label>Catatan</Label>
                                    <Textarea value={gradeForm.data.notes} onChange={(e) => gradeForm.setData('notes', e.target.value)} rows={2} className="mt-1" />
                                </div>
                            </div>
                            <div className="p-4 border-t flex gap-3">
                                <Button variant="outline" onClick={() => setGradeModal({ open: false, group: null })} className="flex-1">Batal</Button>
                                <Button onClick={handleGrade} disabled={gradeForm.processing} className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white">
                                    <CheckCircle className="mr-2 h-4 w-4" /> Simpan Nilai
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ ASSIGN MODAL ═══ */}
            <AnimatePresence>
                {assignModal && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAssignModal(false)} />
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4"><h2 className="text-lg font-bold text-white">Assign Mahasiswa</h2></div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label>Kelompok</Label>
                                    <Select value={assignForm.data.group_id} onValueChange={(v) => assignForm.setData('group_id', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih kelompok" /></SelectTrigger>
                                        <SelectContent>{groups.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name} ({g.member_count})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Mahasiswa</Label>
                                    <Select value={assignForm.data.student_id} onValueChange={(v) => assignForm.setData('student_id', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih mahasiswa" /></SelectTrigger>
                                        <SelectContent>{unassignedStudents.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nama} ({s.nim})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="p-4 border-t flex gap-3">
                                <Button variant="outline" onClick={() => setAssignModal(false)} className="flex-1">Batal</Button>
                                <Button onClick={handleAssign} disabled={assignForm.processing} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">Assign</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ CREATE GROUP MODAL ═══ */}
            <AnimatePresence>
                {createGroupModal && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCreateGroupModal(false)} />
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 p-4"><h2 className="text-lg font-bold text-white">Buat Kelompok Baru</h2></div>
                            <div className="p-6 space-y-4">
                                <div><Label>Nama Kelompok</Label><Input value={createGroupForm.data.name} onChange={(e) => createGroupForm.setData('name', e.target.value)} placeholder="Kelompok 1" className="mt-1" /></div>
                                <div>
                                    <Label>Ketua Kelompok</Label>
                                    <Select value={createGroupForm.data.leader_id} onValueChange={(v) => createGroupForm.setData('leader_id', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih ketua" /></SelectTrigger>
                                        <SelectContent>{unassignedStudents.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="p-4 border-t flex gap-3">
                                <Button variant="outline" onClick={() => setCreateGroupModal(false)} className="flex-1">Batal</Button>
                                <Button onClick={handleCreateGroup} disabled={createGroupForm.processing} className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white">Buat</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DosenLayout>
    );
}
