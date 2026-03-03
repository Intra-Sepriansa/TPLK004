import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users2, Lock, Unlock, Sparkles, UserCheck, Award, BarChart3, Trophy, AlertTriangle,
    FileText, CheckCircle, Clock, Shield, ChevronDown, Star, Shuffle, Plus, Send, Eye
} from 'lucide-react';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import StatGroupIcon from '@/assets/admin/leaderboard/icon-leaderboard.png';
import StatStudentsIcon from '@/assets/admin/analytics/total-mahasiswa.png';
import StatSubmittedIcon from '@/assets/admin/informasi-tugas/publised.png';
import StatGradedIcon from '@/assets/admin/informasi-tugas/draft.png';
import StatAverageIcon from '@/assets/admin/leaderboard/rata-rata.png';
import StatCompletionIcon from '@/assets/admin/analytics/analytics.png';

type Member = { id: number; nama: string; is_leader: boolean; contribution_points: number };
type GroupSummary = {
    id: number; name: string; member_count: number;
    members: Member[];
    task_stats: { total: number; completed: number; in_progress: number; pending: number };
    message_count: number; file_count: number;
    has_submission: boolean; grade?: number | null; is_late: boolean;
    progress: number;
};
type AnalyticsOverview = {
    total_groups: number; total_students: number; submitted_groups: number;
    unsubmitted_groups: number; graded_groups: number; average_grade: number;
    late_submissions: number;
};
type AnalyticsContribution = { average_contribution: number; max_contribution: number; min_contribution: number; inactive_members: number; top_contributors: any[] };
type Analytics = {
    overview: AnalyticsOverview;
    contribution: AnalyticsContribution;
    groups: GroupSummary[];
    timeline: any[];
};
type Student = { id: number; nama: string; nim: string };
type ConflictReport = { id: number; group: { name: string }; reporter: { nama: string }; description: string; status: string; created_at: string };
type Assignment = {
    id: number; title: string; description: string; formation_mode: string; grading_mode: string;
    min_members: number; max_members: number; is_locked: boolean;
    formation_deadline_display: string | null; submission_deadline_display: string | null;
    course: { id: number; nama: string }; dosen: { id: number; nama: string } | null;
    features: string[]; peer_evaluation_weight: number; allow_resubmission: boolean;
};
type Props = {
    assignment: Assignment; groups: GroupSummary[]; analytics: Analytics;
    unassignedStudents: Student[]; peerEvalSummary: unknown; conflictReports: ConflictReport[];
};

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } };
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;

const formationBadges: Record<string, { label: string; color: string }> = {
    'self-form': { label: 'Self-Form', color: 'bg-blue-100 text-blue-700' },
    random: { label: 'Random', color: 'bg-purple-100 text-purple-700' },
    manual: { label: 'Manual', color: 'bg-amber-100 text-amber-700' },
};
const gradingBadges: Record<string, { label: string; color: string }> = {
    same: { label: 'Same Grade', color: 'bg-green-100 text-green-700' },
    individual: { label: 'Individual', color: 'bg-blue-100 text-blue-700' },
    peer: { label: 'Peer Eval', color: 'bg-purple-100 text-purple-700' },
    contribution: { label: 'Contribution', color: 'bg-orange-100 text-orange-700' },
};

const tabs = [
    { key: 'groups', label: 'Kelompok', icon: Users2 },
    { key: 'analytics', label: 'Analitik', icon: BarChart3 },
    { key: 'grading', label: 'Penilaian', icon: Award },
    { key: 'conflicts', label: 'Konflik', icon: AlertTriangle },
];

export default function AdminTugasKelompokDetail({ assignment, groups, analytics, unassignedStudents, peerEvalSummary, conflictReports }: Props) {
    const [activeTab, setActiveTab] = useState('groups');
    const [gradeForm, setGradeForm] = useState<{ groupId: number; grade: string; notes: string } | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const fb = formationBadges[assignment.formation_mode] || { label: assignment.formation_mode, color: 'bg-slate-100 text-slate-700' };
    const gb = gradingBadges[assignment.grading_mode] || { label: assignment.grading_mode, color: 'bg-slate-100 text-slate-700' };
    const handleConfirmDeleteAssignment = () => {
        router.delete(`/admin/tugas-kelompok/${assignment.id}`, {
            onSuccess: () => setDeleteDialogOpen(false),
        });
    };

    return (
        <AppLayout>
            <Head title={assignment.title} />
            <motion.div className="space-y-6 overflow-x-hidden p-4 md:p-6" variants={cV} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <motion.button whileHover={{ scale: 1.02, x: -2 }} whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/admin/tugas-kelompok')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </motion.button>

                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="relative flex shrink-0 h-16 w-16 sm:h-20 sm:w-20"
                                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300 }}>
                                    <img src={TugasIcon} alt="Detail" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold">{assignment.title}</h1>
                                    <p className="mt-1 text-purple-100 text-sm">{assignment.course.nama} {assignment.dosen ? `• ${assignment.dosen.nama}` : ''}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', fb.color)}>{fb.label}</span>
                                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', gb.color)}>{gb.label}</span>
                                        {assignment.is_locked && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Lock className="inline h-3 w-3 mr-1" />Locked</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/toggle-lock`)}
                                        className="bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 rounded-xl">
                                        {assignment.is_locked ? <><Unlock className="mr-2 h-4 w-4" /> Unlock</> : <><Lock className="mr-2 h-4 w-4" /> Lock</>}
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button onClick={() => setDeleteDialogOpen(true)}
                                        className="bg-red-500/30 backdrop-blur-md text-white border border-red-400/30 hover:bg-red-500/40 rounded-xl">Hapus</Button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={iV} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                        {
                            label: 'Kelompok',
                            value: analytics.overview.total_groups,
                            icon: StatGroupIcon,
                            cardClass: 'border-violet-300/40 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20',
                            valueClass: 'text-violet-700 dark:text-violet-200',
                        },
                        {
                            label: 'Mahasiswa',
                            value: analytics.overview.total_students,
                            icon: StatStudentsIcon,
                            cardClass: 'border-blue-300/40 bg-blue-100/55 dark:border-blue-500/30 dark:bg-blue-900/20',
                            valueClass: 'text-blue-700 dark:text-blue-200',
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
                            cardClass: 'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20',
                            valueClass: 'text-amber-700 dark:text-amber-200',
                        },
                        {
                            label: 'Avg Grade',
                            value: analytics.overview.average_grade.toFixed(1),
                            icon: StatAverageIcon,
                            cardClass: 'border-fuchsia-300/45 bg-fuchsia-100/55 dark:border-fuchsia-500/30 dark:bg-fuchsia-900/20',
                            valueClass: 'text-fuchsia-700 dark:text-fuchsia-200',
                        },
                        {
                            label: 'Completion',
                            value: `${analytics.overview.total_groups > 0 ? ((analytics.overview.submitted_groups / analytics.overview.total_groups) * 100).toFixed(0) : 0}%`,
                            icon: StatCompletionIcon,
                            cardClass: 'border-cyan-300/45 bg-cyan-100/55 dark:border-cyan-500/30 dark:bg-cyan-900/20',
                            valueClass: 'text-cyan-700 dark:text-cyan-200',
                        },
                    ].map((s, i) => {
                        return (
                            <motion.div
                                key={i}
                                whileHover={{ y: -4 }}
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
                                    <p className={cn('text-xl font-bold', s.valueClass)}>{s.value}</p>
                                </div>
                                <p className="text-xs text-slate-500">{s.label}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Tabs */}
                <motion.div variants={iV} className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50">
                    <div className="max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="inline-flex min-w-max gap-1">
                            {tabs.map(t => {
                                const TIcon = t.icon;
                                return (
                                    <Button key={t.key} variant={activeTab === t.key ? 'default' : 'outline'}
                                        onClick={() => setActiveTab(t.key)}
                                        className={cn('shrink-0 whitespace-nowrap rounded-xl gap-2', activeTab === t.key ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white' : '')}>
                                        <TIcon className="h-4 w-4" /> {t.label}
                                        {t.key === 'conflicts' && conflictReports.length > 0 && (
                                            <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{conflictReports.length}</span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'groups' && (
                        <motion.div key="groups" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
                            {unassignedStudents.length > 0 && (
                                <div className="rounded-2xl border border-amber-200/50 bg-amber-50/50 dark:bg-amber-900/10 p-4 mb-4">
                                    <h4 className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" /> {unassignedStudents.length} Mahasiswa Belum Berkelompok</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {unassignedStudents.slice(0, 10).map(s => (
                                            <span key={s.id} className="bg-white dark:bg-neutral-800 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 border">{s.nama}</span>
                                        ))}
                                        {unassignedStudents.length > 10 && <span className="text-xs text-amber-600">+{unassignedStudents.length - 10} lainnya</span>}
                                    </div>
                                </div>
                            )}

                            {groups.length === 0 ? (
                                <div className="text-center py-12 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl">
                                    <Users2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500">Belum ada kelompok</p>
                                    {assignment.formation_mode === 'random' && (
                                        <Button onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/random-groups`)}
                                            className="mt-4 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white">
                                            <Shuffle className="mr-2 h-4 w-4" /> Generate Kelompok Random
                                        </Button>
                                    )}
                                </div>
                            ) : groups.map(g => (
                                <motion.div key={g.id} whileHover={{ y: -2 }} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 backdrop-blur-xl shadow-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">{g.name.slice(-1)}</div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{g.name}</h4>
                                                <p className="text-xs text-slate-500">{g.member_count} anggota</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {g.has_submission ? (
                                                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', g.grade != null ? 'bg-emerald-100 text-emerald-700' : g.is_late ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
                                                    {g.grade != null ? `Nilai: ${g.grade}` : g.is_late ? 'Late Submit' : 'Submitted'}
                                                </span>
                                            ) : <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Belum Submit</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {g.members.map(m => (
                                            <span key={m.id} className={cn('text-xs px-2.5 py-1 rounded-lg border', m.is_leader ? 'bg-purple-100 border-purple-200 text-purple-700 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-slate-300')}>
                                                {m.is_leader && <Star className="inline h-3 w-3 mr-1" />}{m.nama} <span className="text-[10px] ml-1 opacity-70">({m.contribution_points} pts)</span>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>{g.task_stats.total} task</span>
                                        <span>{g.file_count} file</span>
                                        <span>{g.message_count} pesan</span>
                                        <div className="flex-1">
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" style={{ width: `${g.progress}%` }} />
                                            </div>
                                        </div>
                                        <span>{g.progress}%</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-lg">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-purple-500" /> Statistik Detail</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Kelompok', value: analytics.overview.total_groups },
                                        { label: 'Total Mahasiswa', value: analytics.overview.total_students },
                                        { label: 'Telah Submit', value: analytics.overview.submitted_groups },
                                        { label: 'Avg Contribution', value: `${analytics.contribution.average_contribution.toFixed(1)} pts` },
                                        { label: 'Max Contribution', value: `${analytics.contribution.max_contribution} pts` },
                                        { label: 'Completion Rate', value: `${analytics.overview.total_groups > 0 ? ((analytics.overview.submitted_groups / analytics.overview.total_groups) * 100).toFixed(0) : 0}%` },
                                    ].map((s, i) => (
                                        <div key={i} className="rounded-xl bg-slate-50 dark:bg-neutral-800/50 p-4">
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'grading' && (
                        <motion.div key="grading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
                            <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-lg">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-purple-500" /> Penilaian Kelompok</h3>
                                {groups.filter(g => g.has_submission).length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-6">Belum ada kelompok yang submit</p>
                                ) : groups.filter(g => g.has_submission).map(g => (
                                    <div key={g.id} className="rounded-xl bg-slate-50 dark:bg-neutral-800/50 p-4 mb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{g.name}</h4>
                                                <p className="text-xs text-slate-500">{g.is_late ? 'Terlambat Submit' : 'Tepat Waktu'}</p>
                                            </div>
                                            {g.grade != null ? (
                                                <span className="text-lg font-bold text-emerald-600">{g.grade}</span>
                                            ) : gradeForm?.groupId === g.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input type="number" min={0} max={100} value={gradeForm.grade}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                                        className="w-20 h-8 text-sm rounded-lg" placeholder="0-100" />
                                                    <Button size="sm" className="h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white" onClick={() => {
                                                        router.post(`/admin/tugas-kelompok/${assignment.id}/grade`, { group_id: g.id, grade: parseInt(gradeForm.grade), notes: gradeForm.notes });
                                                        setGradeForm(null);
                                                    }}><CheckCircle className="h-3 w-3" /></Button>
                                                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setGradeForm(null)}>✕</Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" className="rounded-lg" onClick={() => setGradeForm({ groupId: g.id, grade: '', notes: '' })}>
                                                    <Award className="mr-1 h-3 w-3" /> Beri Nilai
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'conflicts' && (
                        <motion.div key="conflicts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-lg">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /> Laporan Konflik</h3>
                                {conflictReports.length === 0 ? (
                                    <div className="text-center py-6"><Shield className="h-10 w-10 mx-auto text-emerald-300 mb-2" /><p className="text-sm text-slate-500">Tidak ada laporan konflik</p></div>
                                ) : conflictReports.map((r) => (
                                    <div key={r.id} className="rounded-xl bg-slate-50 dark:bg-neutral-800/50 p-4 mb-3 border-l-4 border-red-400">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{r.group?.name ?? 'Unknown Group'}</h4>
                                                <p className="text-xs text-slate-500">Dilaporkan oleh {r.reporter?.nama ?? 'Unknown'}</p>
                                            </div>
                                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', r.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                                                {r.status === 'resolved' ? 'Resolved' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{r.description}</p>
                                        {r.status !== 'resolved' && (
                                            <Button size="sm" className="mt-2 rounded-lg" onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/resolve-conflict/${r.id}`, { resolution_notes: 'Resolved by admin' })}>
                                                <CheckCircle className="mr-1 h-3 w-3" /> Resolve
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDeleteAssignment}
                    title="Hapus Tugas Kelompok"
                    message="Yakin ingin menghapus tugas kelompok ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </motion.div>
        </AppLayout>
    );
}
