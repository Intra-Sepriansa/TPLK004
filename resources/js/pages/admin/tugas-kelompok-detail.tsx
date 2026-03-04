import axios from 'axios';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Award,
    BarChart3,
    CheckCircle,
    CheckCheck,
    ChevronRight,
    Clock,
    Download,
    Eye,
    Filter,
    FolderOpen,
    Lock,
    MessageSquare,
    Plus,
    Printer,
    RefreshCw,
    Search,
    Settings,
    Shield,
    Shuffle,
    Star,
    Table2,
    TrendingUp,
    Unlock,
    UserPlus,
    UserCheck,
    Users2,
    X,
} from 'lucide-react';
import { Fragment, type ComponentType, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

import StatStudentsIcon from '@/assets/admin/analytics/total-mahasiswa.png';
import StatCompletionIcon from '@/assets/admin/analytics/analytics.png';
import StatAverageIcon from '@/assets/admin/leaderboard/rata-rata.png';
import StatGroupIcon from '@/assets/admin/leaderboard/icon-leaderboard.png';
import StatGradedIcon from '@/assets/admin/informasi-tugas/draft.png';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import StatSubmittedIcon from '@/assets/admin/informasi-tugas/publised.png';

type Member = {
    id: number;
    nama: string;
    is_leader: boolean;
    contribution_points: number;
};

type GroupSummary = {
    id: number;
    name: string;
    member_count: number;
    members: Member[];
    task_stats: {
        total: number;
        completed: number;
        in_progress: number;
        pending: number;
    };
    message_count: number;
    file_count: number;
    has_submission: boolean;
    grade?: number | null;
    is_late: boolean;
    progress: number;
};

type AnalyticsOverview = {
    total_groups: number;
    total_students: number;
    submitted_groups: number;
    unsubmitted_groups: number;
    graded_groups: number;
    average_grade: number;
    late_submissions: number;
};

type TopContributor = {
    student_id: number;
    group_id: number;
    group_name: string;
    points: number;
};

type AnalyticsContribution = {
    average_contribution: number;
    max_contribution: number;
    min_contribution: number;
    inactive_members: number;
    top_contributors: TopContributor[];
};

type TimelineDay = {
    date: string;
    activities: number;
    messages: number;
    files: number;
    tasks: number;
};

type Analytics = {
    overview: AnalyticsOverview;
    contribution: AnalyticsContribution;
    groups: GroupSummary[];
    timeline: TimelineDay[];
};

type Student = {
    id: number;
    nama: string;
    nim: string;
};

type ConflictReport = {
    id: number;
    group: { name: string };
    reporter: { nama: string };
    description: string;
    status: string;
    created_at: string;
};

type Assignment = {
    id: number;
    title: string;
    description: string;
    formation_mode: string;
    grading_mode: string;
    min_members: number;
    max_members: number;
    is_locked: boolean;
    formation_deadline_display: string | null;
    submission_deadline_display: string | null;
    course: { id: number; nama: string };
    dosen: { id: number; nama: string } | null;
    features: string[];
    peer_evaluation_weight: number;
    allow_resubmission: boolean;
};

type PeerEvalSummary = {
    total_evaluations: number;
    completed_by: number;
    total_expected: number;
    completion_rate: number;
    avg_contribution: number;
    avg_communication: number;
    avg_reliability: number;
    avg_quality: number;
};

type Props = {
    assignment: Assignment;
    groups: GroupSummary[];
    analytics: Analytics;
    unassignedStudents: Student[];
    peerEvalSummary: unknown;
    conflictReports: ConflictReport[];
};

type TabKey = 'groups' | 'analytics' | 'grading' | 'monitoring' | 'conflicts' | 'settings';
type FilterStatus = 'all' | 'submitted' | 'unsubmitted' | 'late' | 'ungraded';
type SortBy = 'name' | 'progress' | 'grade' | 'members' | 'submission';
type RefreshMode = 'off' | '30s' | '60s';

const cV = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.12 },
    },
};

const iV = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

const formationBadges: Record<string, { label: string; color: string }> = {
    'self-form': { label: 'Self-Form', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/35 dark:text-blue-300' },
    random: { label: 'Random', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/35 dark:text-purple-300' },
    manual: { label: 'Manual', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300' },
};

const gradingBadges: Record<string, { label: string; color: string }> = {
    same: { label: 'Same Grade', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300' },
    individual: { label: 'Individual', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/35 dark:text-blue-300' },
    peer: { label: 'Peer Eval', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/35 dark:text-fuchsia-300' },
    contribution: { label: 'Contribution', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/35 dark:text-orange-300' },
};

const escapeCsv = (value: string | number | boolean | null | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getConflictPriority = (status: string, createdAt: string): { label: string; className: string } => {
    const created = new Date(createdAt);
    const ageMs = Date.now() - created.getTime();
    const ageDays = Number.isNaN(ageMs) ? 0 : ageMs / (1000 * 60 * 60 * 24);

    if (status === 'resolved') {
        return { label: 'Low', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300' };
    }
    if (ageDays >= 7) {
        return { label: 'High', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/35 dark:text-rose-300' };
    }

    return { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300' };
};

export default function AdminTugasKelompokDetail({
    assignment,
    groups,
    analytics,
    unassignedStudents,
    peerEvalSummary,
    conflictReports,
}: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>('groups');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [sortBy, setSortBy] = useState<SortBy>('name');

    const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
    const [bulkGradeMode, setBulkGradeMode] = useState(false);
    const [bulkGradeValue, setBulkGradeValue] = useState('');
    const [bulkGradeNotes, setBulkGradeNotes] = useState('');
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const [gradeModalOpen, setGradeModalOpen] = useState(false);
    const [gradeTargetGroup, setGradeTargetGroup] = useState<GroupSummary | null>(null);

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);

    const [refreshMode, setRefreshMode] = useState<RefreshMode>('off');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

    const [resolutionNotes, setResolutionNotes] = useState<Record<number, string>>({});

    const gradeForm = useForm<{
        group_id: number;
        grade: string;
        notes: string;
        adjustments: Record<number, number | ''>;
    }>({
        group_id: 0,
        grade: '',
        notes: '',
        adjustments: {},
    });

    const assignForm = useForm<{ group_id: string; student_id: string }>({
        group_id: '',
        student_id: '',
    });

    const createGroupForm = useForm<{ name: string; leader_id: string }>({
        name: '',
        leader_id: '',
    });

    const formationBadge = formationBadges[assignment.formation_mode] ?? {
        label: assignment.formation_mode,
        color: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300',
    };

    const gradingBadge = gradingBadges[assignment.grading_mode] ?? {
        label: assignment.grading_mode,
        color: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300',
    };

    const peerSummary = useMemo<PeerEvalSummary>(() => {
        const source = (peerEvalSummary && typeof peerEvalSummary === 'object'
            ? (peerEvalSummary as Partial<PeerEvalSummary>)
            : {}) as Partial<PeerEvalSummary>;

        return {
            total_evaluations: Number(source.total_evaluations ?? 0),
            completed_by: Number(source.completed_by ?? 0),
            total_expected: Number(source.total_expected ?? 0),
            completion_rate: Number(source.completion_rate ?? 0),
            avg_contribution: Number(source.avg_contribution ?? 0),
            avg_communication: Number(source.avg_communication ?? 0),
            avg_reliability: Number(source.avg_reliability ?? 0),
            avg_quality: Number(source.avg_quality ?? 0),
        };
    }, [peerEvalSummary]);

    const filteredGroups = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        let result = groups.filter((group) => {
            const statusMatch =
                filterStatus === 'all'
                    ? true
                    : filterStatus === 'submitted'
                      ? group.has_submission
                      : filterStatus === 'unsubmitted'
                        ? !group.has_submission
                        : filterStatus === 'late'
                          ? group.is_late
                          : group.has_submission && (group.grade === null || group.grade === undefined);

            if (!statusMatch) return false;

            if (!q) return true;

            const inGroupName = group.name.toLowerCase().includes(q);
            const inMembers = group.members.some((member) => member.nama.toLowerCase().includes(q));

            return inGroupName || inMembers;
        });

        result = [...result].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'progress') return b.progress - a.progress;
            if (sortBy === 'grade') return (b.grade ?? -1) - (a.grade ?? -1);
            if (sortBy === 'members') return b.member_count - a.member_count;
            if (sortBy === 'submission') return Number(b.has_submission) - Number(a.has_submission);
            return 0;
        });

        return result;
    }, [filterStatus, groups, searchQuery, sortBy]);

    const allVisibleSelected =
        filteredGroups.length > 0 && filteredGroups.every((group) => selectedGroups.includes(group.id));

    const selectedGroupObjects = useMemo(
        () => groups.filter((group) => selectedGroups.includes(group.id)),
        [groups, selectedGroups],
    );

    const selectedSubmittedGroups = useMemo(
        () => selectedGroupObjects.filter((group) => group.has_submission),
        [selectedGroupObjects],
    );

    const submittedGroups = useMemo(() => groups.filter((group) => group.has_submission), [groups]);
    const gradedGroups = useMemo(
        () => groups.filter((group) => group.has_submission && group.grade !== null && group.grade !== undefined),
        [groups],
    );

    const gradeDistribution = useMemo(() => {
        const buckets = { A: 0, B: 0, C: 0, D: 0, E: 0 };

        gradedGroups.forEach((group) => {
            const score = Number(group.grade ?? 0);
            if (score >= 85) buckets.A += 1;
            else if (score >= 75) buckets.B += 1;
            else if (score >= 60) buckets.C += 1;
            else if (score >= 45) buckets.D += 1;
            else buckets.E += 1;
        });

        return buckets;
    }, [gradedGroups]);

    const latestTimeline = useMemo(
        () => [...(analytics.timeline ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
        [analytics.timeline],
    );

    const maxTimelineActivity = useMemo(() => {
        const max = Math.max(...latestTimeline.map((item) => item.activities), 0);
        return max > 0 ? max : 1;
    }, [latestTimeline]);

    const riskGroups = useMemo(
        () =>
            groups.filter(
                (group) =>
                    (!group.has_submission && group.progress < 60) ||
                    (group.has_submission && (group.grade ?? 0) < 65) ||
                    group.is_late,
            ),
        [groups],
    );

    const contributionLeaderboard = useMemo(() => {
        return groups
            .flatMap((group) =>
                group.members.map((member) => ({
                    memberId: member.id,
                    memberName: member.nama,
                    groupName: group.name,
                    points: member.contribution_points,
                })),
            )
            .sort((a, b) => b.points - a.points)
            .slice(0, 8);
    }, [groups]);

    const engagementScore = useMemo(() => {
        const totalMessages = groups.reduce((sum, group) => sum + group.message_count, 0);
        const totalFiles = groups.reduce((sum, group) => sum + group.file_count, 0);
        const totalCompletedTasks = groups.reduce((sum, group) => sum + group.task_stats.completed, 0);
        const studentBase = Math.max(1, analytics.overview.total_students);

        const raw = ((totalMessages + totalFiles * 2 + totalCompletedTasks * 3) / (studentBase * 10)) * 100;
        return Math.max(0, Math.min(100, Math.round(raw)));
    }, [analytics.overview.total_students, groups]);

    const activeMemberCount = useMemo(
        () => groups.reduce((sum, group) => sum + group.members.filter((member) => member.contribution_points > 0).length, 0),
        [groups],
    );

    const conflictSummary = useMemo(
        () => ({
            open: conflictReports.filter((item) => item.status === 'open').length,
            inReview: conflictReports.filter((item) => item.status === 'in_review').length,
            resolved: conflictReports.filter((item) => item.status === 'resolved').length,
        }),
        [conflictReports],
    );

    useEffect(() => {
        setSelectedGroups((prev) => prev.filter((id) => groups.some((group) => group.id === id)));
    }, [groups]);

    useEffect(() => {
        if (refreshMode === 'off') return undefined;

        const intervalMs = refreshMode === '30s' ? 30_000 : 60_000;
        const interval = window.setInterval(() => {
            setIsRefreshing(true);
            router.reload({
                only: ['groups', 'analytics', 'conflictReports', 'peerEvalSummary'],
                onFinish: () => {
                    setIsRefreshing(false);
                    setLastRefreshedAt(new Date());
                },
            });
        }, intervalMs);

        return () => window.clearInterval(interval);
    }, [refreshMode]);

    const handleToggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedGroups(Array.from(new Set([...selectedGroups, ...filteredGroups.map((group) => group.id)])));
            return;
        }
        const visibleIds = new Set(filteredGroups.map((group) => group.id));
        setSelectedGroups((prev) => prev.filter((id) => !visibleIds.has(id)));
    };

    const handleToggleGroup = (groupId: number, checked: boolean) => {
        if (checked) {
            setSelectedGroups((prev) => (prev.includes(groupId) ? prev : [...prev, groupId]));
            return;
        }
        setSelectedGroups((prev) => prev.filter((id) => id !== groupId));
    };

    const openGradeModal = (group: GroupSummary) => {
        setGradeTargetGroup(group);
        gradeForm.setData({
            group_id: group.id,
            grade: group.grade !== null && group.grade !== undefined ? String(group.grade) : '',
            notes: '',
            adjustments: {},
        });
        setGradeModalOpen(true);
    };

    const closeGradeModal = () => {
        setGradeModalOpen(false);
        setGradeTargetGroup(null);
        gradeForm.reset();
    };

    const handleSingleGradeSubmit = () => {
        const gradeValue = Number(gradeForm.data.grade);
        if (!Number.isFinite(gradeValue) || gradeValue < 0 || gradeValue > 100) {
            window.alert('Nilai harus di antara 0 sampai 100.');
            return;
        }

        const adjustments = Object.fromEntries(
            Object.entries(gradeForm.data.adjustments)
                .filter(([, value]) => value !== '')
                .map(([key, value]) => [key, Number(value)]),
        );

        router.post(
            `/admin/tugas-kelompok/${assignment.id}/grade`,
            {
                group_id: gradeForm.data.group_id,
                grade: gradeValue,
                notes: gradeForm.data.notes,
                adjustments,
            },
            {
                preserveScroll: true,
                onSuccess: () => closeGradeModal(),
            },
        );
    };

    const handleApplyBulkGrade = async () => {
        const gradeValue = Number(bulkGradeValue);

        if (!Number.isFinite(gradeValue) || gradeValue < 0 || gradeValue > 100) {
            window.alert('Nilai massal harus di antara 0 sampai 100.');
            return;
        }

        if (selectedSubmittedGroups.length === 0) {
            window.alert('Pilih minimal 1 kelompok yang sudah submit.');
            return;
        }

        try {
            setBulkProcessing(true);
            await Promise.all(
                selectedSubmittedGroups.map((group) =>
                    axios.post(`/admin/tugas-kelompok/${assignment.id}/grade`, {
                        group_id: group.id,
                        grade: gradeValue,
                        notes: bulkGradeNotes,
                    }),
                ),
            );

            setBulkGradeMode(false);
            setBulkGradeValue('');
            setBulkGradeNotes('');
            setSelectedGroups([]);

            router.reload({
                only: ['groups', 'analytics'],
            });
        } catch {
            window.alert('Gagal menyimpan nilai massal. Coba lagi.');
        } finally {
            setBulkProcessing(false);
        }
    };

    const handleResolveConflict = (reportId: number) => {
        router.post(
            `/admin/tugas-kelompok/${assignment.id}/resolve-conflict/${reportId}`,
            {
                resolution_notes: resolutionNotes[reportId] || 'Diselesaikan oleh admin',
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleAssignStudent = () => {
        assignForm.post(`/admin/tugas-kelompok/${assignment.id}/assign-student`, {
            preserveScroll: true,
            onSuccess: () => {
                assignForm.reset();
                setAssignDialogOpen(false);
            },
        });
    };

    const handleCreateGroup = () => {
        createGroupForm.post(`/admin/tugas-kelompok/${assignment.id}/create-group`, {
            preserveScroll: true,
            onSuccess: () => {
                createGroupForm.reset();
                setCreateGroupDialogOpen(false);
            },
        });
    };

    const handleExportCsv = () => {
        const headers = [
            'Kelompok',
            'Anggota',
            'Status Submit',
            'Nilai',
            'Progress',
            'Pesan',
            'File',
            'Task Selesai',
            'Task Total',
            'Terlambat',
        ];

        const rows = groups.map((group) => [
            group.name,
            group.members.map((member) => member.nama).join('; '),
            group.has_submission ? 'Submitted' : 'Belum Submit',
            group.grade ?? '',
            `${group.progress}%`,
            group.message_count,
            group.file_count,
            group.task_stats.completed,
            group.task_stats.total,
            group.is_late ? 'Ya' : 'Tidak',
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tugas-kelompok-${assignment.id}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        setExportDialogOpen(false);
    };

    const handlePrintReport = () => {
        const printWindow = window.open('', '_blank', 'width=1000,height=700');
        if (!printWindow) return;

        const rows = groups
            .map(
                (group) => `
                    <tr>
                        <td>${group.name}</td>
                        <td>${group.member_count}</td>
                        <td>${group.has_submission ? 'Submitted' : 'Belum Submit'}</td>
                        <td>${group.grade ?? '-'}</td>
                        <td>${group.progress}%</td>
                        <td>${group.task_stats.completed}/${group.task_stats.total}</td>
                        <td>${group.is_late ? 'Ya' : 'Tidak'}</td>
                    </tr>
                `,
            )
            .join('');

        printWindow.document.write(`
            <!doctype html>
            <html>
            <head>
                <title>Laporan Tugas Kelompok</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
                    h1 { margin: 0 0 6px; }
                    p { margin: 0 0 4px; color: #555; }
                    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
                    th, td { border: 1px solid #ddd; padding: 8px 10px; font-size: 13px; }
                    th { background: #f1f5f9; text-align: left; }
                </style>
            </head>
            <body>
                <h1>${assignment.title}</h1>
                <p>${assignment.course.nama}</p>
                <p>Tanggal cetak: ${new Date().toLocaleString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Kelompok</th>
                            <th>Anggota</th>
                            <th>Status</th>
                            <th>Nilai</th>
                            <th>Progress</th>
                            <th>Task</th>
                            <th>Terlambat</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setExportDialogOpen(false);
    };

    const handleConfirmDeleteAssignment = () => {
        router.delete(`/admin/tugas-kelompok/${assignment.id}`, {
            onSuccess: () => setDeleteDialogOpen(false),
        });
    };

    const tabs: Array<{ key: TabKey; label: string; icon: ComponentType<{ className?: string }>; count?: number }> = [
        { key: 'groups', label: 'Kelompok', icon: Users2, count: groups.length },
        { key: 'analytics', label: 'Analitik', icon: BarChart3 },
        { key: 'grading', label: 'Penilaian', icon: Award, count: submittedGroups.length },
        { key: 'monitoring', label: 'Monitoring', icon: Activity },
        { key: 'conflicts', label: 'Konflik', icon: AlertTriangle, count: conflictSummary.open + conflictSummary.inReview },
        { key: 'settings', label: 'Pengaturan', icon: Settings },
    ];

    return (
        <AppLayout>
            <Head title={assignment.title} />

            <motion.div className="space-y-6 overflow-x-hidden p-4 md:p-6" variants={cV} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -left-8 -bottom-8 h-44 w-44 rounded-full bg-indigo-500/30 blur-3xl" />

                    <div className="relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/admin/tugas-kelompok')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Tugas Kelompok
                        </motion.button>

                        <div className="flex flex-col items-start justify-between gap-6 xl:flex-row xl:items-center">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left xl:w-auto">
                                <motion.div
                                    className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                    whileHover={{ scale: 1.04, rotate: -4 }}
                                >
                                    <img
                                        src={TugasIcon}
                                        alt="Detail Tugas Kelompok"
                                        className="h-full w-full object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.5)]"
                                    />
                                </motion.div>

                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold sm:text-3xl">{assignment.title}</h1>
                                    <p className="mt-1 text-sm text-indigo-100 sm:text-base">
                                        {assignment.course.nama}
                                        {assignment.dosen && ` • ${assignment.dosen.nama}`}
                                    </p>
                                    <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', formationBadge.color)}>{formationBadge.label}</span>
                                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', gradingBadge.color)}>{gradingBadge.label}</span>
                                        {assignment.is_locked && (
                                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/35 dark:text-amber-300">
                                                <Lock className="mr-1 inline h-3 w-3" /> Locked
                                            </span>
                                        )}
                                        {assignment.submission_deadline_display && (
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300">
                                                Deadline: {assignment.submission_deadline_display}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                                <Button
                                    onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/toggle-lock`)}
                                    className="rounded-xl border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                                >
                                    {assignment.is_locked ? (
                                        <>
                                            <Unlock className="mr-2 h-4 w-4" /> Unlock
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" /> Lock
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={() => setExportDialogOpen(true)}
                                    className="rounded-xl border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                                >
                                    <Download className="mr-2 h-4 w-4" /> Export
                                </Button>

                                <Button
                                    onClick={() => setDeleteDialogOpen(true)}
                                    className="rounded-xl border border-rose-300/30 bg-rose-500/25 text-white backdrop-blur-md hover:bg-rose-500/35"
                                >
                                    <X className="mr-2 h-4 w-4" /> Hapus
                                </Button>
                            </div>
                        </div>

                        {assignment.description && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                            >
                                <p className="text-sm leading-relaxed text-white/90">{assignment.description}</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={iV} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        {
                            label: 'Total Kelompok',
                            value: analytics.overview.total_groups,
                            icon: StatGroupIcon,
                            cardClass: 'border-violet-300/40 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20',
                            valueClass: 'text-violet-700 dark:text-violet-200',
                            iconFilter: 'drop-shadow(0 8px 14px rgba(139, 92, 246, 0.35))',
                        },
                        {
                            label: 'Total Mahasiswa',
                            value: analytics.overview.total_students,
                            icon: StatStudentsIcon,
                            cardClass: 'border-blue-300/40 bg-blue-100/55 dark:border-blue-500/30 dark:bg-blue-900/20',
                            valueClass: 'text-blue-700 dark:text-blue-200',
                            iconFilter: 'drop-shadow(0 8px 14px rgba(59, 130, 246, 0.35))',
                        },
                        {
                            label: 'Sudah Submit',
                            value: analytics.overview.submitted_groups,
                            icon: StatSubmittedIcon,
                            cardClass: 'border-emerald-300/45 bg-emerald-100/55 dark:border-emerald-500/30 dark:bg-emerald-900/20',
                            valueClass: 'text-emerald-700 dark:text-emerald-200',
                            iconFilter: 'drop-shadow(0 8px 14px rgba(16, 185, 129, 0.35))',
                        },
                        {
                            label: 'Sudah Dinilai',
                            value: analytics.overview.graded_groups,
                            icon: StatGradedIcon,
                            cardClass: 'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20',
                            valueClass: 'text-amber-700 dark:text-amber-200',
                            iconFilter: 'drop-shadow(0 8px 14px rgba(245, 158, 11, 0.35))',
                        },
                        {
                            label: 'Rata-rata Nilai',
                            value: analytics.overview.average_grade.toFixed(1),
                            icon: StatAverageIcon,
                            cardClass: 'border-fuchsia-300/45 bg-fuchsia-100/55 dark:border-fuchsia-500/30 dark:bg-fuchsia-900/20',
                            valueClass: 'text-fuchsia-700 dark:text-fuchsia-200',
                            iconFilter: 'drop-shadow(0 8px 14px rgba(217, 70, 239, 0.35))',
                        },
                        {
                            label: 'Completion Rate',
                            value: `${analytics.overview.total_groups > 0 ? ((analytics.overview.submitted_groups / analytics.overview.total_groups) * 100).toFixed(0) : 0}%`,
                            icon: StatCompletionIcon,
                            cardClass: 'border-cyan-300/45 bg-cyan-100/55 dark:border-cyan-500/30 dark:bg-cyan-900/20',
                            valueClass: 'text-cyan-700 dark:text-cyan-200',
                            iconFilter: 'drop-shadow(0 8px 14px rgba(6, 182, 212, 0.35))',
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={`${stat.label}-${index}`}
                            variants={iV}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={cn('rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-300', stat.cardClass)}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <img src={stat.icon} alt={stat.label} className="h-11 w-11 shrink-0 object-contain" style={{ filter: stat.iconFilter }} />
                                <p className={cn('text-xl font-bold', stat.valueClass)}>{stat.value}</p>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter & Search */}
                <motion.div variants={iV} className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari kelompok atau anggota..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="rounded-xl border-white/20 bg-white/60 pl-10 backdrop-blur-sm dark:bg-neutral-800/60"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: `Semua (${groups.length})` },
                                { key: 'submitted', label: `Submitted (${groups.filter((group) => group.has_submission).length})` },
                                { key: 'unsubmitted', label: `Belum Submit (${groups.filter((group) => !group.has_submission).length})` },
                                { key: 'late', label: `Terlambat (${groups.filter((group) => group.is_late).length})` },
                                {
                                    key: 'ungraded',
                                    label: `Belum Dinilai (${groups.filter((group) => group.has_submission && (group.grade === null || group.grade === undefined)).length})`,
                                },
                            ].map((item) => (
                                <Button
                                    key={item.key}
                                    size="sm"
                                    variant={filterStatus === item.key ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus(item.key as FilterStatus)}
                                    className={cn(
                                        'rounded-xl',
                                        filterStatus === item.key && 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white',
                                    )}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-500" />
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                                <SelectTrigger className="w-[180px] rounded-xl border-white/20 bg-white/60 backdrop-blur-sm dark:bg-neutral-800/60">
                                    <SelectValue placeholder="Urutkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Nama Kelompok</SelectItem>
                                    <SelectItem value="progress">Progress</SelectItem>
                                    <SelectItem value="grade">Nilai</SelectItem>
                                    <SelectItem value="members">Jumlah Anggota</SelectItem>
                                    <SelectItem value="submission">Status Submit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div variants={iV} className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-100/50 p-2 backdrop-blur-md dark:bg-neutral-900/50">
                    <div className="max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="inline-flex min-w-max items-center gap-2">
                            {tabs.map((tab, index) => {
                                const TabIcon = tab.icon;
                                const isActive = activeTab === tab.key;

                                return (
                                    <Fragment key={tab.key}>
                                        <Button
                                            variant={isActive ? 'default' : 'outline'}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={cn(
                                                'h-11 shrink-0 rounded-xl px-4 text-sm font-semibold transition-all duration-300',
                                                isActive
                                                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/30'
                                                    : 'border-white/20 bg-white/50 text-slate-600 hover:bg-white/70 dark:bg-neutral-800/70 dark:text-slate-300 dark:hover:bg-neutral-700',
                                            )}
                                        >
                                            <TabIcon className="mr-2 h-4 w-4" />
                                            {tab.label}
                                            {tab.count !== undefined && (
                                                <span
                                                    className={cn(
                                                        'ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                                                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-slate-300',
                                                    )}
                                                >
                                                    {tab.count}
                                                </span>
                                            )}
                                        </Button>
                                        {index < tabs.length - 1 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                                    </Fragment>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Groups Tab */}
                    {activeTab === 'groups' && (
                        <motion.div key="groups" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="space-y-4">
                            {unassignedStudents.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-900/10"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex-1">
                                            <h4 className="mb-2 flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                                                <AlertTriangle className="h-4 w-4" />
                                                {unassignedStudents.length} Mahasiswa Belum Berkelompok
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {unassignedStudents.slice(0, 12).map((student) => (
                                                    <span
                                                        key={student.id}
                                                        className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-amber-700 dark:bg-neutral-800 dark:text-slate-300"
                                                    >
                                                        {student.nama}
                                                    </span>
                                                ))}
                                                {unassignedStudents.length > 12 && (
                                                    <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                        +{unassignedStudents.length - 12} lainnya
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Button onClick={() => setAssignDialogOpen(true)} className="rounded-xl bg-amber-500 text-white hover:bg-amber-600">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Assign ke Kelompok
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={allVisibleSelected}
                                            onCheckedChange={(checked) => handleToggleSelectAll(checked === true)}
                                            aria-label="Pilih semua kelompok yang tampil"
                                        />
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {selectedGroups.length > 0
                                                ? `${selectedGroups.length} kelompok dipilih`
                                                : `${filteredGroups.length} kelompok tampil`}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {assignment.formation_mode === 'manual' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setCreateGroupDialogOpen(true)}
                                                className="rounded-xl"
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Buat Kelompok
                                            </Button>
                                        )}
                                        {assignment.formation_mode === 'random' && !assignment.is_locked && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/random-groups`)}
                                                className="rounded-xl"
                                            >
                                                <Shuffle className="mr-2 h-4 w-4" /> Acak Ulang
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant={bulkGradeMode ? 'default' : 'outline'}
                                            onClick={() => setBulkGradeMode((prev) => !prev)}
                                            className={cn(bulkGradeMode && 'rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white')}
                                        >
                                            <Award className="mr-2 h-4 w-4" /> Nilai Massal
                                        </Button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {bulkGradeMode && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className="mt-3 rounded-xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-500/30 dark:bg-purple-900/20"
                                        >
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr_auto]">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={bulkGradeValue}
                                                    onChange={(event) => setBulkGradeValue(event.target.value)}
                                                    placeholder="Nilai 0-100"
                                                    className="rounded-xl"
                                                />
                                                <Input
                                                    value={bulkGradeNotes}
                                                    onChange={(event) => setBulkGradeNotes(event.target.value)}
                                                    placeholder="Catatan nilai massal (opsional)"
                                                    className="rounded-xl"
                                                />
                                                <Button
                                                    onClick={handleApplyBulkGrade}
                                                    disabled={bulkProcessing || selectedSubmittedGroups.length === 0}
                                                    className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                                >
                                                    {bulkProcessing ? 'Memproses...' : `Terapkan (${selectedSubmittedGroups.length})`}
                                                </Button>
                                            </div>
                                            {selectedGroups.length > selectedSubmittedGroups.length && (
                                                <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
                                                    Sebagian kelompok terpilih belum submit, jadi tidak ikut dinilai.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {filteredGroups.length === 0 ? (
                                <div className="rounded-3xl border border-white/20 bg-white/40 py-14 text-center shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <Users2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        {searchQuery ? 'Tidak ada kelompok yang cocok dengan pencarian.' : 'Belum ada kelompok.'}
                                    </p>
                                </div>
                            ) : (
                                filteredGroups.map((group, index) => (
                                    <motion.div
                                        key={group.id}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.04 }}
                                        whileHover={{ y: -2, scale: 1.01 }}
                                        className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 dark:border-white/5 dark:bg-neutral-900/40"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex flex-1 items-start gap-3">
                                                <Checkbox
                                                    checked={selectedGroups.includes(group.id)}
                                                    onCheckedChange={(checked) => handleToggleGroup(group.id, checked === true)}
                                                    className="mt-1"
                                                    aria-label={`Pilih ${group.name}`}
                                                />

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg">
                                                    {group.name.slice(-1).toUpperCase()}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{group.name}</h4>
                                                        {group.has_submission && (
                                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                                Submitted
                                                            </span>
                                                        )}
                                                        {group.is_late && (
                                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                                                                Terlambat
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                        {group.member_count} anggota • {group.task_stats.completed}/{group.task_stats.total} task selesai
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {group.members.map((member) => (
                                                            <span
                                                                key={member.id}
                                                                className={cn(
                                                                    'rounded-lg border px-2.5 py-1 text-xs',
                                                                    member.is_leader
                                                                        ? 'border-purple-200 bg-purple-100 font-medium text-purple-700 dark:border-purple-700 dark:bg-purple-900/35 dark:text-purple-300'
                                                                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300',
                                                                )}
                                                            >
                                                                {member.is_leader && <Star className="mr-1 inline h-3 w-3" />}
                                                                {member.nama}
                                                                <span className="ml-1 text-[10px] opacity-75">({member.contribution_points} pts)</span>
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="mt-3 flex items-center gap-3">
                                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-700">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${group.progress}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{group.progress}%</span>
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="inline-flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            {group.message_count} pesan
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <FolderOpen className="h-3 w-3" />
                                                            {group.file_count} file
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <CheckCheck className="h-3 w-3" />
                                                            {group.task_stats.in_progress} in progress
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row items-center gap-2 lg:flex-col lg:items-end">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2.5 py-1 text-xs font-medium',
                                                        !group.has_submission
                                                            ? 'bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400'
                                                            : group.grade !== null && group.grade !== undefined
                                                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300'
                                                              : group.is_late
                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/35 dark:text-rose-300'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/35 dark:text-blue-300',
                                                    )}
                                                >
                                                    {!group.has_submission
                                                        ? 'Belum Submit'
                                                        : group.grade !== null && group.grade !== undefined
                                                          ? `Nilai: ${group.grade}`
                                                          : group.is_late
                                                            ? 'Late Submit'
                                                            : 'Belum Dinilai'}
                                                </span>

                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setActiveTab('monitoring')}
                                                        className="h-8 rounded-lg px-2"
                                                    >
                                                        <Eye className="mr-1 h-4 w-4" /> Monitor
                                                    </Button>

                                                    {group.has_submission && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openGradeModal(group)}
                                                            className="h-8 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                                        >
                                                            <Award className="mr-1 h-3 w-3" /> Nilai
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <BarChart3 className="h-5 w-5 text-purple-500" />
                                        Group Performance Comparison
                                    </h3>
                                    <div className="space-y-3">
                                        {[...groups]
                                            .sort((a, b) => b.progress - a.progress)
                                            .map((group) => (
                                                <div key={group.id}>
                                                    <div className="mb-1 flex items-center justify-between text-xs">
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">{group.name}</span>
                                                        <span className="text-slate-500 dark:text-slate-400">
                                                            {group.progress}% • Nilai {group.grade ?? '-'}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-700">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${group.progress}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                                        Insight & Risk Assessment
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-500/30 dark:bg-emerald-900/20">
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300">Engagement Score</p>
                                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-200">{engagementScore}%</p>
                                        </div>
                                        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-500/30 dark:bg-blue-900/20">
                                            <p className="text-xs text-blue-700 dark:text-blue-300">Active Members</p>
                                            <p className="text-xl font-bold text-blue-700 dark:text-blue-200">
                                                {activeMemberCount}/{analytics.overview.total_students}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-500/30 dark:bg-amber-900/20">
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Late Submissions</p>
                                            <p className="text-xl font-bold text-amber-700 dark:text-amber-200">{analytics.overview.late_submissions}</p>
                                        </div>
                                        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-500/30 dark:bg-rose-900/20">
                                            <p className="text-xs text-rose-700 dark:text-rose-300">High Risk Groups</p>
                                            <p className="text-xl font-bold text-rose-700 dark:text-rose-200">{riskGroups.length}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Kelompok dengan risiko tertinggi</p>
                                        {riskGroups.length === 0 ? (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Tidak ada kelompok berisiko tinggi saat ini.</p>
                                        ) : (
                                            riskGroups.slice(0, 5).map((group) => (
                                                <div key={group.id} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-700 dark:text-slate-300">{group.name}</span>
                                                    <span className="font-medium text-rose-600 dark:text-rose-300">
                                                        {group.has_submission ? `Nilai ${group.grade ?? 0}` : 'Belum submit'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                    <Activity className="h-5 w-5 text-cyan-500" />
                                    Submission Pattern Timeline
                                </h3>

                                {latestTimeline.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data aktivitas timeline.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {latestTimeline.slice(-12).map((day) => (
                                            <div key={day.date} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/40 dark:hover:bg-neutral-800/40">
                                                <span className="w-28 shrink-0 text-xs text-slate-500 dark:text-slate-400">{formatDate(day.date)}</span>
                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-700">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"
                                                        style={{ width: `${Math.round((day.activities / maxTimelineActivity) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="w-20 text-right text-xs font-medium text-slate-600 dark:text-slate-300">{day.activities} aktivitas</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Grading Tab */}
                    {activeTab === 'grading' && (
                        <motion.div key="grading" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 lg:col-span-2">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <Award className="h-5 w-5 text-purple-500" />
                                        Grade Distribution
                                    </h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.entries(gradeDistribution).map(([label, count]) => (
                                            <div key={label} className="rounded-xl border border-white/20 bg-white/60 p-3 text-center dark:border-white/5 dark:bg-neutral-800/60">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Grade {label}</p>
                                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{count}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-500/30 dark:bg-emerald-900/20">
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300">Sudah Dinilai</p>
                                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-200">{gradedGroups.length}</p>
                                        </div>
                                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-500/30 dark:bg-amber-900/20">
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Belum Dinilai</p>
                                            <p className="text-xl font-bold text-amber-700 dark:text-amber-200">{submittedGroups.length - gradedGroups.length}</p>
                                        </div>
                                        <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-500/30 dark:bg-purple-900/20">
                                            <p className="text-xs text-purple-700 dark:text-purple-300">Average</p>
                                            <p className="text-xl font-bold text-purple-700 dark:text-purple-200">{analytics.overview.average_grade.toFixed(1)}</p>
                                        </div>
                                        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-500/30 dark:bg-blue-900/20">
                                            <p className="text-xs text-blue-700 dark:text-blue-300">Peer Eval Rate</p>
                                            <p className="text-xl font-bold text-blue-700 dark:text-blue-200">{peerSummary.completion_rate.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <UserCheck className="h-5 w-5 text-blue-500" />
                                        Peer Evaluation
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                            <span>Total Evaluasi</span>
                                            <span className="font-semibold">{peerSummary.total_evaluations}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                            <span>Selesai oleh</span>
                                            <span className="font-semibold">{peerSummary.completed_by}/{peerSummary.total_expected}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                            <span>Avg Contribution</span>
                                            <span className="font-semibold">{peerSummary.avg_contribution.toFixed(1)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                            <span>Avg Communication</span>
                                            <span className="font-semibold">{peerSummary.avg_communication.toFixed(1)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                            <span>Avg Reliability</span>
                                            <span className="font-semibold">{peerSummary.avg_reliability.toFixed(1)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                            <span>Avg Quality</span>
                                            <span className="font-semibold">{peerSummary.avg_quality.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                    <Table2 className="h-5 w-5 text-fuchsia-500" />
                                    Daftar Penilaian Kelompok
                                </h3>

                                {submittedGroups.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada kelompok yang submit tugas.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {submittedGroups.map((group) => (
                                            <div
                                                key={group.id}
                                                className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{group.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {group.member_count} anggota • {group.is_late ? 'Submit terlambat' : 'Submit tepat waktu'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {group.grade !== null && group.grade !== undefined ? (
                                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300">
                                                            {group.grade}
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-900/35 dark:text-amber-300">
                                                            Pending
                                                        </span>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openGradeModal(group)}
                                                        className="rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                                    >
                                                        <Award className="mr-2 h-4 w-4" /> Nilai
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Monitoring Tab */}
                    {activeTab === 'monitoring' && (
                        <motion.div key="monitoring" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="space-y-4">
                            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                            <Activity className="h-5 w-5 text-cyan-500" />
                                            Real-time Group Monitoring
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Update otomatis progress, aktivitas, dan indikator risiko.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Select value={refreshMode} onValueChange={(value) => setRefreshMode(value as RefreshMode)}>
                                            <SelectTrigger className="w-36 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="off">Auto Refresh Off</SelectItem>
                                                <SelectItem value="30s">Refresh 30 detik</SelectItem>
                                                <SelectItem value="60s">Refresh 60 detik</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setIsRefreshing(true);
                                                router.reload({
                                                    only: ['groups', 'analytics', 'conflictReports'],
                                                    onFinish: () => {
                                                        setIsRefreshing(false);
                                                        setLastRefreshedAt(new Date());
                                                    },
                                                });
                                            }}
                                            className="rounded-xl"
                                        >
                                            <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-3 dark:border-cyan-500/30 dark:bg-cyan-900/20">
                                        <p className="text-xs text-cyan-700 dark:text-cyan-300">Active Members</p>
                                        <p className="text-xl font-bold text-cyan-700 dark:text-cyan-200">{activeMemberCount}</p>
                                    </div>
                                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-500/30 dark:bg-indigo-900/20">
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300">Live Engagement</p>
                                        <p className="text-xl font-bold text-indigo-700 dark:text-indigo-200">{engagementScore}%</p>
                                    </div>
                                    <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-500/30 dark:bg-purple-900/20">
                                        <p className="text-xs text-purple-700 dark:text-purple-300">Timeline Points</p>
                                        <p className="text-xl font-bold text-purple-700 dark:text-purple-200">{latestTimeline.length}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-neutral-800/60">
                                        <p className="text-xs text-slate-600 dark:text-slate-300">Last Refresh</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString('id-ID') : 'Belum ada'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 xl:col-span-2">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <TrendingUp className="h-5 w-5 text-purple-500" />
                                        Progress Heatmap Kelompok
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {groups.map((group) => (
                                            <div key={group.id} className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                                <div className="mb-2 flex items-center justify-between text-xs">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{group.name}</span>
                                                    <span className="text-slate-500 dark:text-slate-400">{group.progress}%</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-700">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            group.progress >= 80
                                                                ? 'bg-emerald-500'
                                                                : group.progress >= 60
                                                                  ? 'bg-blue-500'
                                                                  : group.progress >= 40
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-rose-500',
                                                        )}
                                                        style={{ width: `${group.progress}%` }}
                                                    />
                                                </div>
                                                <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                                    <span>{group.task_stats.completed}/{group.task_stats.total} task</span>
                                                    <span>{group.message_count} pesan</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <UserCheck className="h-5 w-5 text-emerald-500" />
                                        Contribution Leaderboard
                                    </h3>
                                    {contributionLeaderboard.length === 0 ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data kontribusi anggota.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {contributionLeaderboard.map((row, index) => (
                                                <div key={`${row.memberId}-${row.groupName}`} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 text-xs dark:bg-neutral-800/60">
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                            #{index + 1} {row.memberName}
                                                        </p>
                                                        <p className="text-slate-500 dark:text-slate-400">{row.groupName}</p>
                                                    </div>
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-300">{row.points} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    Live Activity Feed
                                </h3>
                                {latestTimeline.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada aktivitas terekam.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {[...latestTimeline]
                                            .reverse()
                                            .slice(0, 10)
                                            .map((day) => (
                                                <div key={day.date} className="flex items-center justify-between rounded-xl border border-white/20 bg-white/60 px-3 py-2 dark:border-white/5 dark:bg-neutral-800/60">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(day.date)}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {day.messages} pesan • {day.files} file • {day.tasks} task
                                                        </p>
                                                    </div>
                                                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/35 dark:text-indigo-300">
                                                        {day.activities} aktivitas
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Conflicts Tab */}
                    {activeTab === 'conflicts' && (
                        <motion.div key="conflicts" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-500/30 dark:bg-rose-900/20">
                                    <p className="text-xs text-rose-700 dark:text-rose-300">Open</p>
                                    <p className="text-2xl font-bold text-rose-700 dark:text-rose-200">{conflictSummary.open}</p>
                                </div>
                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-900/20">
                                    <p className="text-xs text-amber-700 dark:text-amber-300">In Review</p>
                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-200">{conflictSummary.inReview}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/30 dark:bg-emerald-900/20">
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Resolved</p>
                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-200">{conflictSummary.resolved}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                    <Shield className="h-5 w-5 text-rose-500" />
                                    Conflict Resolution Center
                                </h3>

                                {conflictReports.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <CheckCircle className="mx-auto mb-2 h-10 w-10 text-emerald-400" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada laporan konflik.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {conflictReports.map((report) => {
                                            const priority = getConflictPriority(report.status, report.created_at);

                                            return (
                                                <div
                                                    key={report.id}
                                                    className="rounded-xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-800/60"
                                                >
                                                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                                        <div>
                                                            <p className="font-semibold text-slate-900 dark:text-white">{report.group?.name ?? 'Unknown Group'}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                Dilaporkan oleh {report.reporter?.nama ?? 'Unknown'} • {formatDate(report.created_at)}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', priority.className)}>
                                                                Priority: {priority.label}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                                    report.status === 'resolved'
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300'
                                                                        : report.status === 'in_review'
                                                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300'
                                                                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/35 dark:text-rose-300',
                                                                )}
                                                            >
                                                                {report.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-700 dark:text-slate-300">{report.description}</p>

                                                    {report.status !== 'resolved' && (
                                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                                                            <Textarea
                                                                rows={2}
                                                                value={resolutionNotes[report.id] ?? ''}
                                                                onChange={(event) =>
                                                                    setResolutionNotes((prev) => ({
                                                                        ...prev,
                                                                        [report.id]: event.target.value,
                                                                    }))
                                                                }
                                                                placeholder="Catatan mediasi / resolusi"
                                                                className="rounded-xl"
                                                            />
                                                            <Button
                                                                onClick={() => handleResolveConflict(report.id)}
                                                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" /> Resolve
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <Settings className="h-5 w-5 text-indigo-500" />
                                        Konfigurasi Assignment
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Mode Formasi</span><span className="font-semibold">{assignment.formation_mode}</span></div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Mode Penilaian</span><span className="font-semibold">{assignment.grading_mode}</span></div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Range Anggota</span><span className="font-semibold">{assignment.min_members} - {assignment.max_members}</span></div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Peer Weight</span><span className="font-semibold">{Math.round((assignment.peer_evaluation_weight ?? 0) * 100)}%</span></div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Resubmission</span><span className="font-semibold">{assignment.allow_resubmission ? 'Aktif' : 'Nonaktif'}</span></div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Status Group</span><span className="font-semibold">{assignment.is_locked ? 'Locked' : 'Open'}</span></div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Features</p>
                                        {assignment.features.length === 0 ? (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada fitur tambahan.</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {assignment.features.map((feature) => (
                                                    <span key={feature} className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <RefreshCw className="h-5 w-5 text-cyan-500" />
                                        Aksi Cepat Pengelolaan
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Button
                                            onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/toggle-lock`)}
                                            className="justify-start rounded-xl border border-white/20 bg-white/70 text-slate-700 hover:bg-white dark:bg-neutral-800 dark:text-slate-200"
                                        >
                                            {assignment.is_locked ? (
                                                <>
                                                    <Unlock className="mr-2 h-4 w-4" /> Unlock Kelompok
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="mr-2 h-4 w-4" /> Lock Kelompok
                                                </>
                                            )}
                                        </Button>

                                        {assignment.formation_mode === 'random' && !assignment.is_locked && (
                                            <Button
                                                onClick={() => router.post(`/admin/tugas-kelompok/${assignment.id}/random-groups`)}
                                                className="justify-start rounded-xl border border-white/20 bg-white/70 text-slate-700 hover:bg-white dark:bg-neutral-800 dark:text-slate-200"
                                            >
                                                <Shuffle className="mr-2 h-4 w-4" /> Generate Ulang Kelompok Random
                                            </Button>
                                        )}

                                        {assignment.formation_mode === 'manual' && (
                                            <>
                                                <Button
                                                    onClick={() => setCreateGroupDialogOpen(true)}
                                                    className="justify-start rounded-xl border border-white/20 bg-white/70 text-slate-700 hover:bg-white dark:bg-neutral-800 dark:text-slate-200"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" /> Buat Kelompok Baru
                                                </Button>
                                                <Button
                                                    onClick={() => setAssignDialogOpen(true)}
                                                    className="justify-start rounded-xl border border-white/20 bg-white/70 text-slate-700 hover:bg-white dark:bg-neutral-800 dark:text-slate-200"
                                                >
                                                    <UserPlus className="mr-2 h-4 w-4" /> Assign Mahasiswa ke Kelompok
                                                </Button>
                                            </>
                                        )}

                                        <Button
                                            onClick={() => setExportDialogOpen(true)}
                                            className="justify-start rounded-xl border border-white/20 bg-white/70 text-slate-700 hover:bg-white dark:bg-neutral-800 dark:text-slate-200"
                                        >
                                            <Download className="mr-2 h-4 w-4" /> Export Laporan
                                        </Button>

                                        <Button
                                            onClick={() => setDeleteDialogOpen(true)}
                                            className="justify-start rounded-xl border border-rose-300/30 bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 dark:text-rose-200"
                                        >
                                            <X className="mr-2 h-4 w-4" /> Hapus Assignment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Grade Modal */}
            <AnimatePresence>
                {gradeModalOpen && gradeTargetGroup && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={closeGradeModal} />
                        <motion.div
                            initial={{ scale: 0.95, y: 18 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 18 }}
                            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0B] text-white shadow-2xl"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold">Penilaian {gradeTargetGroup.name}</h3>
                                    <Button variant="ghost" size="icon" onClick={closeGradeModal} className="h-8 w-8 text-white hover:bg-white/20">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="grade-input" className="text-slate-200">Nilai Kelompok (0 - 100)</Label>
                                        <Input
                                            id="grade-input"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={gradeForm.data.grade}
                                            onChange={(event) => gradeForm.setData('grade', event.target.value)}
                                            className="mt-1 rounded-xl border-white/20 bg-white/10 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-slate-200">Catatan Penilaian</Label>
                                        <Input
                                            value={gradeForm.data.notes}
                                            onChange={(event) => gradeForm.setData('notes', event.target.value)}
                                            placeholder="Opsional"
                                            className="mt-1 rounded-xl border-white/20 bg-white/10 text-white"
                                        />
                                    </div>
                                </div>

                                {assignment.grading_mode === 'individual' && (
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                        <p className="mb-3 text-sm font-semibold text-slate-200">Adjustment Individu</p>
                                        <div className="space-y-2">
                                            {gradeTargetGroup.members.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between gap-3">
                                                    <div className="text-sm text-slate-200">
                                                        {member.nama}
                                                        <span className="ml-1 text-xs text-slate-400">({member.contribution_points} pts)</span>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        min={-50}
                                                        max={50}
                                                        value={gradeForm.data.adjustments[member.id] ?? ''}
                                                        onChange={(event) => {
                                                            const raw = event.target.value;
                                                            gradeForm.setData('adjustments', {
                                                                ...gradeForm.data.adjustments,
                                                                [member.id]: raw === '' ? '' : Number(raw),
                                                            });
                                                        }}
                                                        className="h-9 w-28 rounded-lg border-white/20 bg-white/10 text-white"
                                                        placeholder="-50..50"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <Button variant="outline" onClick={closeGradeModal} className="rounded-xl border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleSingleGradeSubmit}
                                        disabled={gradeForm.processing}
                                        className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                    >
                                        {gradeForm.processing ? 'Menyimpan...' : 'Simpan Nilai'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assign Student Dialog */}
            <AnimatePresence>
                {assignDialogOpen && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setAssignDialogOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, y: 18 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 18 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0B] text-white shadow-2xl"
                        >
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                                <h3 className="text-lg font-bold">Assign Mahasiswa ke Kelompok</h3>
                            </div>

                            <div className="space-y-4 p-5">
                                <div>
                                    <Label className="text-slate-200">Pilih Kelompok</Label>
                                    <Select value={assignForm.data.group_id} onValueChange={(value) => assignForm.setData('group_id', value)}>
                                        <SelectTrigger className="mt-1 rounded-xl border-white/20 bg-white/10 text-white">
                                            <SelectValue placeholder="Kelompok" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map((group) => (
                                                <SelectItem key={group.id} value={String(group.id)}>
                                                    {group.name} ({group.member_count} anggota)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-slate-200">Pilih Mahasiswa</Label>
                                    <Select value={assignForm.data.student_id} onValueChange={(value) => assignForm.setData('student_id', value)}>
                                        <SelectTrigger className="mt-1 rounded-xl border-white/20 bg-white/10 text-white">
                                            <SelectValue placeholder="Mahasiswa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unassignedStudents.map((student) => (
                                                <SelectItem key={student.id} value={String(student.id)}>
                                                    {student.nama} ({student.nim})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setAssignDialogOpen(false)} className="rounded-xl border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                                        Batal
                                    </Button>
                                    <Button onClick={handleAssignStudent} disabled={assignForm.processing} className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                        {assignForm.processing ? 'Memproses...' : 'Assign'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Group Dialog */}
            <AnimatePresence>
                {createGroupDialogOpen && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setCreateGroupDialogOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, y: 18 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 18 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0B] text-white shadow-2xl"
                        >
                            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4">
                                <h3 className="text-lg font-bold">Buat Kelompok Baru</h3>
                            </div>

                            <div className="space-y-4 p-5">
                                <div>
                                    <Label className="text-slate-200">Nama Kelompok</Label>
                                    <Input
                                        value={createGroupForm.data.name}
                                        onChange={(event) => createGroupForm.setData('name', event.target.value)}
                                        placeholder="Contoh: Kelompok Alpha"
                                        className="mt-1 rounded-xl border-white/20 bg-white/10 text-white"
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-200">Ketua Kelompok</Label>
                                    <Select value={createGroupForm.data.leader_id} onValueChange={(value) => createGroupForm.setData('leader_id', value)}>
                                        <SelectTrigger className="mt-1 rounded-xl border-white/20 bg-white/10 text-white">
                                            <SelectValue placeholder="Pilih ketua" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unassignedStudents.map((student) => (
                                                <SelectItem key={student.id} value={String(student.id)}>
                                                    {student.nama} ({student.nim})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setCreateGroupDialogOpen(false)} className="rounded-xl border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleCreateGroup}
                                        disabled={createGroupForm.processing}
                                        className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                                    >
                                        {createGroupForm.processing ? 'Memproses...' : 'Buat Kelompok'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Export Dialog */}
            <AnimatePresence>
                {exportDialogOpen && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setExportDialogOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, y: 18 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 18 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0B] text-white shadow-2xl"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4">
                                <h3 className="text-lg font-bold">Export & Report</h3>
                                <p className="text-sm text-indigo-100">Pilih format laporan yang ingin dibuat.</p>
                            </div>

                            <div className="space-y-2 p-4">
                                <Button onClick={handleExportCsv} className="w-full justify-start rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20">
                                    <Table2 className="mr-2 h-4 w-4" /> Export Excel (CSV)
                                </Button>
                                <Button onClick={handlePrintReport} className="w-full justify-start rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20">
                                    <Printer className="mr-2 h-4 w-4" /> Export PDF (Print)
                                </Button>
                                <Button variant="outline" onClick={() => setExportDialogOpen(false)} className="w-full rounded-xl border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                                    Tutup
                                </Button>
                            </div>
                        </motion.div>
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
        </AppLayout>
    );
}
