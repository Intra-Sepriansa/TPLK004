import VotingKasIcon from '@/assets/admin/voting-kas/voting.png';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    CalendarClock,
    CheckCircle,
    CheckCircle2,
    Clock3,
    DollarSign,
    Download,
    LayoutDashboard,
    MessageSquare,
    Search,
    ShieldCheck,
    ThumbsDown,
    ThumbsUp,
    User,
    Users,
    Vote,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface VoteRow {
    id: number;
    mahasiswa: {
        id: number | null;
        nama: string;
        nim: string;
        kelas: string;
    };
    vote: 'approve' | 'reject';
    comment: string | null;
    created_at: string;
    created_at_iso: string | null;
}

interface VotingDetail {
    id: number;
    title: string;
    description: string;
    amount: number;
    category: string;
    status: 'open' | 'approved' | 'rejected' | 'closed';
    creator: {
        id: number;
        nama: string;
        nim: string;
    } | null;
    voting_deadline: string | null;
    voting_deadline_human: string;
    is_expired: boolean;
    min_votes: number;
    approval_threshold: number;
    stats: {
        approve: number;
        reject: number;
        total: number;
        approval_percentage: number;
        is_valid: boolean;
    };
    participation_rate: number;
    vote_velocity: number;
    created_at: string;
    updated_at: string;
    votes: VoteRow[];
}

interface AnalyticsPayload {
    timeline: Array<{
        at: string;
        approve: number;
        reject: number;
        total: number;
    }>;
    hourly_pattern: Array<{
        hour: string;
        approve: number;
        reject: number;
        total: number;
    }>;
    demographic_breakdown: Array<{
        label: string;
        approve: number;
        reject: number;
        total: number;
    }>;
    comment_threads: Array<{
        id: number;
        nama: string;
        nim: string;
        vote: 'approve' | 'reject';
        comment: string;
        created_at: string;
    }>;
    consensus_score: number;
}

interface FinancialPayload {
    current_balance: number;
    projected_balance: number;
    budget_impact_percent: number;
    category_expense_total: number;
    summary: {
        total_income: number;
        total_expense: number;
        total_balance: number;
    };
    monthly_category_spending: Array<{
        month: string;
        label: string;
        total: number;
    }>;
    related_transactions: Array<{
        id: number;
        description: string;
        category: string;
        amount: number;
        status: string;
        period_date: string;
    }>;
}

interface ComparisonPayload {
    similar_votings: Array<{
        id: number;
        title: string;
        status: string;
        amount: number;
        approval_percentage: number;
        total_votes: number;
        created_at: string;
        creator: string;
    }>;
    category_approved_average: number;
}

interface ActivityItem {
    type: 'create' | 'vote' | 'status' | 'admin';
    title: string;
    description: string;
    by: string;
    at: string;
    at_human: string;
}

interface Props {
    voting: VotingDetail;
    analytics: AnalyticsPayload;
    financial: FinancialPayload;
    comparison: ComparisonPayload;
    activityLog: ActivityItem[];
    totalEligibleVoters: number;
    discussionCount: number;
    refreshedAt: string;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kas Voting', href: '/admin/kas-voting' },
    { title: 'Detail Voting', href: '#' },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.08 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 280, damping: 24 },
    },
};

const statusConfig = {
    open: {
        label: 'Voting Aktif',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        icon: Clock3,
    },
    approved: {
        label: 'Disetujui',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Ditolak',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        icon: XCircle,
    },
    closed: {
        label: 'Ditutup',
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: AlertCircle,
    },
} as const;

const categoryConfig: Record<
    string,
    { label: string; badge: string; icon: string }
> = {
    kegiatan: {
        label: 'Kegiatan Kelas',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        icon: '🎉',
    },
    perlengkapan: {
        label: 'Perlengkapan',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        icon: '📦',
    },
    konsumsi: {
        label: 'Konsumsi',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        icon: '🍽️',
    },
    donasi: {
        label: 'Donasi/Sosial',
        badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        icon: '❤️',
    },
    lainnya: {
        label: 'Lainnya',
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: '📋',
    },
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDuration(ms: number): string {
    if (ms <= 0) return 'Waktu voting telah berakhir';

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days} hari ${hours} jam ${minutes} menit`;
    if (hours > 0) return `${hours} jam ${minutes} menit ${seconds} detik`;
    if (minutes > 0) return `${minutes} menit ${seconds} detik`;
    return `${seconds} detik`;
}

function toCsv(rows: string[][]): string {
    return rows
        .map((row) =>
            row
                .map((cell) => {
                    const escaped = String(cell ?? '').replace(/"/g, '""');
                    return `"${escaped}"`;
                })
                .join(','),
        )
        .join('\n');
}

function downloadCsv(filename: string, rows: string[][]): void {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function AdminKasVotingDetail({
    voting,
    analytics,
    financial,
    comparison,
    activityLog,
    totalEligibleVoters,
    discussionCount,
    refreshedAt,
}: Props) {
    const [activeTab, setActiveTab] = useState<
        | 'overview'
        | 'votes'
        | 'analytics'
        | 'discussion'
        | 'financial'
        | 'audit'
    >('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [voteTypeFilter, setVoteTypeFilter] = useState<
        'all' | 'approve' | 'reject' | 'commented'
    >('all');
    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'name'>(
        'latest',
    );
    const [processing, setProcessing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [liveNow, setLiveNow] = useState(() =>
        refreshedAt ? new Date(refreshedAt).getTime() : 0,
    );
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const status = statusConfig[voting.status];
    const StatusIcon = status.icon;
    const category = categoryConfig[voting.category] ?? categoryConfig.lainnya;
    const remainingMs = voting.voting_deadline
        ? new Date(voting.voting_deadline).getTime() - liveNow
        : 0;
    const pendingVoters = Math.max(totalEligibleVoters - voting.stats.total, 0);

    useEffect(() => {
        const tick = window.setInterval(() => setLiveNow(Date.now()), 1000);
        return () => window.clearInterval(tick);
    }, []);

    useEffect(() => {
        if (!autoRefresh || voting.status !== 'open') return;

        const refresh = window.setInterval(() => {
            router.reload({
                only: [
                    'voting',
                    'analytics',
                    'financial',
                    'comparison',
                    'activityLog',
                    'discussionCount',
                    'refreshedAt',
                ],
            });
        }, 10000);

        return () => window.clearInterval(refresh);
    }, [autoRefresh, voting.status]);

    const voteVelocity = useMemo(() => {
        const oneHourAgo = liveNow - 3600 * 1000;
        return voting.votes.filter((vote) => {
            if (!vote.created_at_iso) return false;
            return new Date(vote.created_at_iso).getTime() >= oneHourAgo;
        }).length;
    }, [liveNow, voting.votes]);

    const predictedOutcome = useMemo(() => {
        if (voting.status === 'approved') return 'Keputusan final: Disetujui';
        if (voting.status === 'rejected') return 'Keputusan final: Ditolak';
        if (voting.status === 'closed') return 'Keputusan final: Ditutup';
        if (voting.stats.total === 0)
            return 'Belum ada suara, hasil masih netral';

        const threshold = voting.approval_threshold;
        const approvalNow = voting.stats.approval_percentage;

        if (approvalNow >= threshold && voting.stats.is_valid) {
            return 'Trend saat ini condong disetujui';
        }
        if (!voting.stats.is_valid && pendingVoters > 0) {
            return 'Belum kuorum, perlu partisipasi tambahan';
        }
        if (approvalNow < threshold && pendingVoters === 0) {
            return 'Cenderung ditolak jika tidak ada suara baru';
        }

        return 'Masih fluktuatif, pantau hingga deadline';
    }, [
        pendingVoters,
        voting.approval_threshold,
        voting.stats.approval_percentage,
        voting.stats.is_valid,
        voting.stats.total,
        voting.status,
    ]);

    const filteredVotes = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        let rows = [...voting.votes];
        if (query) {
            rows = rows.filter((row) => {
                const payload =
                    `${row.mahasiswa.nama} ${row.mahasiswa.nim} ${row.mahasiswa.kelas} ${row.comment ?? ''}`.toLowerCase();
                return payload.includes(query);
            });
        }

        if (voteTypeFilter === 'approve')
            rows = rows.filter((row) => row.vote === 'approve');
        if (voteTypeFilter === 'reject')
            rows = rows.filter((row) => row.vote === 'reject');
        if (voteTypeFilter === 'commented')
            rows = rows.filter((row) => Boolean(row.comment));

        if (sortBy === 'latest') {
            rows.sort(
                (a, b) =>
                    new Date(b.created_at_iso ?? 0).getTime() -
                    new Date(a.created_at_iso ?? 0).getTime(),
            );
        } else if (sortBy === 'oldest') {
            rows.sort(
                (a, b) =>
                    new Date(a.created_at_iso ?? 0).getTime() -
                    new Date(b.created_at_iso ?? 0).getTime(),
            );
        } else {
            rows.sort((a, b) =>
                a.mahasiswa.nama.localeCompare(b.mahasiswa.nama, 'id-ID'),
            );
        }

        return rows;
    }, [searchQuery, sortBy, voteTypeFilter, voting.votes]);

    const discussionKeywords = useMemo(() => {
        const stopWords = new Set([
            'yang',
            'dan',
            'untuk',
            'dengan',
            'atau',
            'dari',
            'karena',
            'agar',
            'pada',
            'ini',
            'itu',
            'sudah',
            'belum',
            'kami',
            'kita',
            'saya',
            'anda',
            'juga',
            'lebih',
            'dalam',
            'akan',
            'bisa',
            'sebagai',
            'tidak',
            'iya',
        ]);

        const counts = new Map<string, number>();
        analytics.comment_threads.forEach((thread) => {
            thread.comment
                .toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter((word) => word.length >= 4 && !stopWords.has(word))
                .forEach((word) => {
                    counts.set(word, (counts.get(word) ?? 0) + 1);
                });
        });

        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([word, count]) => ({ word, count }));
    }, [analytics.comment_threads]);

    const pieData = useMemo(
        () => [
            { name: 'Setuju', value: voting.stats.approve, color: '#10b981' },
            { name: 'Tolak', value: voting.stats.reject, color: '#ef4444' },
        ],
        [voting.stats.approve, voting.stats.reject],
    );

    const handleApprove = () => {
        setProcessing(true);
        router.post(
            `/admin/kas-voting/${voting.id}/approve`,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setApproveDialogOpen(false);
                },
            },
        );
    };

    const handleReject = () => {
        setProcessing(true);
        router.post(
            `/admin/kas-voting/${voting.id}/reject`,
            { reason: rejectReason },
            {
                onFinish: () => {
                    setProcessing(false);
                    setRejectDialogOpen(false);
                    setRejectReason('');
                },
            },
        );
    };

    const handleCloseVoting = () => {
        setProcessing(true);
        router.post(
            `/admin/kas-voting/${voting.id}/close`,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setCloseDialogOpen(false);
                },
            },
        );
    };

    const handleFinalizeVoting = () => {
        setProcessing(true);
        router.post(
            `/admin/kas-voting/${voting.id}/finalize`,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setFinalizeDialogOpen(false);
                },
            },
        );
    };

    const handleExportVotes = () => {
        const rows: string[][] = [
            ['Nama', 'NIM', 'Kelas', 'Vote', 'Komentar', 'Waktu'],
            ...filteredVotes.map((row) => [
                row.mahasiswa.nama,
                row.mahasiswa.nim,
                row.mahasiswa.kelas,
                row.vote === 'approve' ? 'Setuju' : 'Tolak',
                row.comment ?? '',
                row.created_at,
            ]),
        ];
        downloadCsv(`kas-voting-${voting.id}-votes.csv`, rows);
    };

    const handleExportAudit = () => {
        const rows: string[][] = [
            ['Jenis', 'Judul', 'Deskripsi', 'Aktor', 'Waktu'],
            ...activityLog.map((item) => [
                item.type,
                item.title,
                item.description,
                item.by,
                item.at_human,
            ]),
        ];
        downloadCsv(`kas-voting-${voting.id}-audit.csv`, rows);
    };

    const handleExportSummary = () => {
        const rows: string[][] = [
            ['Ringkasan Voting', ''],
            ['Judul', voting.title],
            ['Status', status.label],
            ['Nominal', formatCurrency(voting.amount)],
            ['Kategori', category.label],
            ['Total Suara', String(voting.stats.total)],
            ['Setuju', String(voting.stats.approve)],
            ['Tolak', String(voting.stats.reject)],
            ['Approval Rate', `${voting.stats.approval_percentage}%`],
            ['Partisipasi', `${voting.participation_rate}%`],
            ['Consensus Score', `${analytics.consensus_score}%`],
            ['Saldo Saat Ini', formatCurrency(financial.current_balance)],
            ['Proyeksi Saldo', formatCurrency(financial.projected_balance)],
            ['Dampak Anggaran', `${financial.budget_impact_percent}%`],
            ['Refreshed At', refreshedAt],
        ];
        downloadCsv(`kas-voting-${voting.id}-summary.csv`, rows);
    };

    const renderOverviewTab = () => (
        <motion.div
            key="overview"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
            <div className="space-y-4 lg:col-span-2">
                <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Ringkasan Usulan
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {voting.description}
                    </p>

                    <div className="mt-4 rounded-xl border border-white/20 bg-white/60 p-4 dark:border-white/10 dark:bg-neutral-800/60">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300">
                                Progress Persetujuan
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                                {voting.stats.approval_percentage}%
                            </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${voting.stats.approval_percentage}%`,
                                }}
                                transition={{ duration: 0.8 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                            <div className="rounded-lg bg-emerald-100/70 px-3 py-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                Setuju: {voting.stats.approve}
                            </div>
                            <div className="rounded-lg bg-red-100/70 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                Tolak: {voting.stats.reject}
                            </div>
                            <div className="rounded-lg bg-blue-100/70 px-3 py-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                Kuorum: {voting.stats.total}/{voting.min_votes}
                            </div>
                            <div className="rounded-lg bg-violet-100/70 px-3 py-2 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                                Pending: {pendingVoters}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Aktivitas Terbaru
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Update:{' '}
                            {new Date(refreshedAt).toLocaleTimeString('id-ID')}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {activityLog.slice(0, 8).map((item, index) => (
                            <motion.div
                                key={`${item.at}-${index}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/10 dark:bg-neutral-800/60"
                            >
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {item.title}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                                    {item.description}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    <span>Aktor: {item.by}</span>
                                    <span>•</span>
                                    <span>{item.at_human}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Monitoring Real-time
                    </h3>
                    <div className="mt-3 space-y-2 text-sm">
                        <p className="text-slate-600 dark:text-slate-300">
                            Sisa waktu:{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                {formatDuration(remainingMs)}
                            </span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                            Vote velocity:{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                {voteVelocity}/jam
                            </span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                            Prediksi:{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {predictedOutcome}
                            </span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setAutoRefresh((prev) => !prev)}
                        className={cn(
                            'mt-3 w-full rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                            autoRefresh
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-neutral-700 dark:text-slate-200 dark:hover:bg-neutral-600',
                        )}
                    >
                        {autoRefresh
                            ? 'Auto Refresh Aktif (10 detik)'
                            : 'Auto Refresh Nonaktif'}
                    </button>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Decision Panel
                    </h3>
                    <div className="mt-3 space-y-2">
                        <Button
                            onClick={() => setApproveDialogOpen(true)}
                            disabled={voting.status !== 'open' || processing}
                            className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Setujui Penuh
                        </Button>
                        <Button
                            onClick={() => setRejectDialogOpen(true)}
                            disabled={voting.status !== 'open' || processing}
                            className="h-10 w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Tolak Voting
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setFinalizeDialogOpen(true)}
                            disabled={voting.status !== 'open' || processing}
                            className="h-10 w-full rounded-xl"
                        >
                            <Vote className="mr-2 h-4 w-4" />
                            Finalisasi Sesuai Suara
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCloseDialogOpen(true)}
                            disabled={voting.status !== 'open' || processing}
                            className="h-10 w-full rounded-xl"
                        >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Tutup Tanpa Keputusan
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderVotesTab = () => (
        <motion.div
            key="votes"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
        >
            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                    <div className="relative lg:col-span-2">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            placeholder="Cari nama, NIM, kelas, atau komentar"
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={
                                voteTypeFilter === 'all' ? 'default' : 'outline'
                            }
                            onClick={() => setVoteTypeFilter('all')}
                            className="h-10 flex-1 rounded-xl text-xs"
                        >
                            Semua
                        </Button>
                        <Button
                            variant={
                                voteTypeFilter === 'approve'
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() => setVoteTypeFilter('approve')}
                            className="h-10 flex-1 rounded-xl text-xs"
                        >
                            Setuju
                        </Button>
                        <Button
                            variant={
                                voteTypeFilter === 'reject'
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() => setVoteTypeFilter('reject')}
                            className="h-10 flex-1 rounded-xl text-xs"
                        >
                            Tolak
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(
                                    event.target.value as
                                        | 'latest'
                                        | 'oldest'
                                        | 'name',
                                )
                            }
                            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                        >
                            <option value="latest">Urut: Terbaru</option>
                            <option value="oldest">Urut: Terlama</option>
                            <option value="name">Urut: Nama</option>
                        </select>
                        <Button
                            variant="outline"
                            onClick={handleExportVotes}
                            className="h-10 rounded-xl"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="space-y-3 xl:col-span-2">
                    {filteredVotes.length === 0 ? (
                        <div className="rounded-2xl border border-white/20 bg-white/40 p-8 text-center text-sm text-slate-500 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 dark:text-slate-400">
                            Data vote tidak ditemukan dengan filter saat ini.
                        </div>
                    ) : (
                        filteredVotes.map((row) => (
                            <div
                                key={row.id}
                                className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                                            {row.mahasiswa.nama
                                                .slice(0, 1)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {row.mahasiswa.nama}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {row.mahasiswa.nim} •{' '}
                                                {row.mahasiswa.kelas}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            'rounded-lg px-2.5 py-1 text-xs font-semibold',
                                            row.vote === 'approve'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                                        )}
                                    >
                                        {row.vote === 'approve'
                                            ? 'Setuju'
                                            : 'Tolak'}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                                    {row.comment
                                        ? row.comment
                                        : 'Tidak ada komentar.'}
                                </p>
                                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    {row.created_at}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Vote Breakdown
                        </h3>
                        <div className="mt-3 space-y-2 text-sm">
                            <p className="text-slate-600 dark:text-slate-300">
                                Total suara:{' '}
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {voting.stats.total}
                                </span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-300">
                                Setuju:{' '}
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {voting.stats.approve}
                                </span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-300">
                                Tolak:{' '}
                                <span className="font-bold text-red-600 dark:text-red-400">
                                    {voting.stats.reject}
                                </span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-300">
                                Komentar masuk:{' '}
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {analytics.comment_threads.length}
                                </span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-300">
                                Partisipasi:{' '}
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {voting.participation_rate}%
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Filter Cepat
                        </h3>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Button
                                variant={
                                    voteTypeFilter === 'commented'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setVoteTypeFilter('commented')}
                                className="h-9 rounded-xl text-xs"
                            >
                                Berkomentar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery('');
                                    setVoteTypeFilter('all');
                                    setSortBy('latest');
                                }}
                                className="h-9 rounded-xl text-xs"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderAnalyticsTab = () => (
        <motion.div
            key="analytics"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        >
            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Distribusi Suara
                </h3>
                <div className="mt-3 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={4}
                            >
                                {pieData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) =>
                                    typeof value === 'number' ? value : 0
                                }
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Timeline Voting
                </h3>
                <div className="mt-3 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.timeline}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                strokeOpacity={0.2}
                            />
                            <XAxis dataKey="at" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="approve"
                                name="Setuju"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="reject"
                                name="Tolak"
                                stroke="#ef4444"
                                strokeWidth={2.5}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Pola Voting per Jam
                </h3>
                <div className="mt-3 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.hourly_pattern}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                strokeOpacity={0.2}
                            />
                            <XAxis
                                dataKey="hour"
                                tick={{ fontSize: 10 }}
                                interval={2}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="approve"
                                stroke="#10b981"
                                fill="#10b98155"
                            />
                            <Area
                                type="monotone"
                                dataKey="reject"
                                stroke="#ef4444"
                                fill="#ef444455"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Breakdown Kelas
                </h3>
                <div className="mt-3 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.demographic_breakdown}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                strokeOpacity={0.2}
                            />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="approve"
                                name="Setuju"
                                fill="#10b981"
                                radius={[6, 6, 0, 0]}
                            />
                            <Bar
                                dataKey="reject"
                                name="Tolak"
                                fill="#ef4444"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl xl:col-span-2 dark:border-white/5 dark:bg-neutral-900/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Consensus & Engagement
                    </h3>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        Consensus Score: {analytics.consensus_score}%
                    </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analytics.consensus_score}%` }}
                        transition={{ duration: 0.9 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Skor ini menunjukkan tingkat kebulatan suara: semakin tinggi
                    berarti mayoritas suara bergerak ke satu keputusan.
                </p>
            </div>
        </motion.div>
    );

    const renderDiscussionTab = () => (
        <motion.div
            key="discussion"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 gap-4 xl:grid-cols-3"
        >
            <div className="space-y-3 xl:col-span-2">
                {analytics.comment_threads.length === 0 ? (
                    <div className="rounded-2xl border border-white/20 bg-white/40 p-8 text-center text-sm text-slate-500 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 dark:text-slate-400">
                        Belum ada komentar diskusi pada voting ini.
                    </div>
                ) : (
                    analytics.comment_threads.map((thread) => (
                        <div
                            key={thread.id}
                            className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {thread.nama}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {thread.nim}
                                    </p>
                                </div>
                                <span
                                    className={cn(
                                        'rounded-lg px-2.5 py-1 text-xs font-semibold',
                                        thread.vote === 'approve'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                                    )}
                                >
                                    {thread.vote === 'approve'
                                        ? 'Setuju'
                                        : 'Tolak'}
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                {thread.comment}
                            </p>
                            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                {thread.created_at}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-4">
                <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Top Kata Kunci Diskusi
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {discussionKeywords.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Belum ada keyword karena komentar masih kosong.
                            </p>
                        ) : (
                            discussionKeywords.map((item) => (
                                <span
                                    key={item.word}
                                    className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                >
                                    {item.word} ({item.count})
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Dokumentasi Keputusan
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li>
                            Status saat ini:{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {status.label}
                            </span>
                        </li>
                        <li>
                            Threshold persetujuan:{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {voting.approval_threshold}%
                            </span>
                        </li>
                        <li>
                            Kuorum minimum:{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {voting.min_votes} suara
                            </span>
                        </li>
                        <li>
                            Partisipasi terkini:{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {voting.participation_rate}%
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </motion.div>
    );

    const renderFinancialTab = () => (
        <motion.div
            key="financial"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
        >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-emerald-300/40 bg-emerald-100/60 p-4 shadow-lg backdrop-blur-xl dark:border-emerald-500/30 dark:bg-emerald-900/20">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Saldo Saat Ini
                    </p>
                    <p className="mt-1 text-xl font-black text-emerald-800 dark:text-emerald-200">
                        {formatCurrency(financial.current_balance)}
                    </p>
                </div>
                <div className="rounded-2xl border border-violet-300/40 bg-violet-100/60 p-4 shadow-lg backdrop-blur-xl dark:border-violet-500/30 dark:bg-violet-900/20">
                    <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                        Nominal Usulan
                    </p>
                    <p className="mt-1 text-xl font-black text-violet-800 dark:text-violet-200">
                        {formatCurrency(voting.amount)}
                    </p>
                </div>
                <div className="rounded-2xl border border-blue-300/40 bg-blue-100/60 p-4 shadow-lg backdrop-blur-xl dark:border-blue-500/30 dark:bg-blue-900/20">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        Proyeksi Setelah Approve
                    </p>
                    <p className="mt-1 text-xl font-black text-blue-800 dark:text-blue-200">
                        {formatCurrency(financial.projected_balance)}
                    </p>
                </div>
                <div className="rounded-2xl border border-amber-300/40 bg-amber-100/60 p-4 shadow-lg backdrop-blur-xl dark:border-amber-500/30 dark:bg-amber-900/20">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                        Dampak Anggaran
                    </p>
                    <p className="mt-1 text-xl font-black text-amber-800 dark:text-amber-200">
                        {financial.budget_impact_percent}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl xl:col-span-2 dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Spending Kategori per Bulan
                    </h3>
                    <div className="mt-3 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={financial.monthly_category_spending}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    strokeOpacity={0.2}
                                />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(
                                            typeof value === 'number'
                                                ? value
                                                : 0,
                                        )
                                    }
                                />
                                <Bar
                                    dataKey="total"
                                    name="Total"
                                    fill="#6366f1"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Perbandingan Kategori
                    </h3>
                    <div className="mt-3 space-y-2 text-sm">
                        <p className="text-slate-600 dark:text-slate-300">
                            Total expense kategori ini:{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                {formatCurrency(
                                    financial.category_expense_total,
                                )}
                            </span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                            Rata-rata voting approved kategori:{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                {formatCurrency(
                                    comparison.category_approved_average,
                                )}
                            </span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                            Total pemasukan kas:{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                {formatCurrency(financial.summary.total_income)}
                            </span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                            Total pengeluaran kas:{' '}
                            <span className="font-bold text-slate-900 dark:text-white">
                                {formatCurrency(
                                    financial.summary.total_expense,
                                )}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Transaksi Terkait
                    </h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportSummary}
                        className="rounded-xl"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Ringkas
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="border-b border-white/20 text-left text-xs tracking-wide text-slate-500 uppercase dark:border-white/10 dark:text-slate-400">
                                <th className="px-3 py-2">Tanggal</th>
                                <th className="px-3 py-2">Deskripsi</th>
                                <th className="px-3 py-2">Kategori</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">
                                    Nominal
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {financial.related_transactions.length === 0 ? (
                                <tr>
                                    <td
                                        className="px-3 py-4 text-slate-500 dark:text-slate-400"
                                        colSpan={5}
                                    >
                                        Belum ada transaksi terkait.
                                    </td>
                                </tr>
                            ) : (
                                financial.related_transactions.map(
                                    (transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="border-b border-white/10 dark:border-white/5"
                                        >
                                            <td className="px-3 py-2">
                                                {transaction.period_date}
                                            </td>
                                            <td className="px-3 py-2">
                                                {transaction.description}
                                            </td>
                                            <td className="px-3 py-2">
                                                {transaction.category}
                                            </td>
                                            <td className="px-3 py-2 capitalize">
                                                {transaction.status}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold">
                                                {formatCurrency(
                                                    transaction.amount,
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );

    const renderAuditTab = () => (
        <motion.div
            key="audit"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
        >
            <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Audit Trail Voting
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Log lengkap aktivitas untuk transparansi keputusan
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleExportAudit}
                        className="rounded-xl"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Audit CSV
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {activityLog.map((item, index) => (
                    <motion.div
                        key={`${item.at}-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    {item.description}
                                </p>
                            </div>
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 uppercase dark:bg-slate-800 dark:text-slate-300">
                                {item.type}
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            {item.by} • {item.at_human}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Voting Kas #${voting.id}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:p-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 16,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-35" />
                    <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/admin/kas-voting')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Voting
                        </motion.button>

                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                                <motion.div
                                    className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 24,
                                    }}
                                >
                                    <img
                                        src={VotingKasIcon}
                                        alt="Detail Voting Kas"
                                        className="h-full w-full object-contain drop-shadow-[0_15px_24px_rgba(0,0,0,0.55)]"
                                    />
                                </motion.div>

                                <div>
                                    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase',
                                                status.badge,
                                            )}
                                        >
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {status.label}
                                        </span>
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                                                category.badge,
                                            )}
                                        >
                                            <span>{category.icon}</span>
                                            {category.label}
                                        </span>
                                        {voting.is_expired &&
                                            voting.status === 'open' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    Expired
                                                </span>
                                            )}
                                    </div>

                                    <h1 className="text-2xl font-bold sm:text-3xl">
                                        {voting.title}
                                    </h1>
                                    <p className="mt-1 bg-gradient-to-r from-yellow-200 to-amber-300 bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                                        {formatCurrency(voting.amount)}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-indigo-100/90 sm:justify-start sm:text-sm">
                                        <span className="inline-flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" />
                                            {voting.creator?.nama ?? '-'}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            Dibuat: {voting.created_at}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            Deadline:{' '}
                                            {voting.voting_deadline_human}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-wrap gap-2 xl:w-auto xl:justify-end">
                                {voting.status === 'open' && (
                                    <>
                                        <Button
                                            onClick={() =>
                                                setApproveDialogOpen(true)
                                            }
                                            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Setujui
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setRejectDialogOpen(true)
                                            }
                                            className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Tolak
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={handleExportSummary}
                                    className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
                >
                    {[
                        {
                            label: 'Total Vote',
                            value: voting.stats.total,
                            icon: Users,
                            cardClass:
                                'border-blue-300/40 bg-blue-100/55 dark:border-blue-500/30 dark:bg-blue-900/20',
                            valueClass: 'text-blue-700 dark:text-blue-200',
                        },
                        {
                            label: 'Setuju',
                            value: voting.stats.approve,
                            icon: ThumbsUp,
                            cardClass:
                                'border-emerald-300/45 bg-emerald-100/55 dark:border-emerald-500/30 dark:bg-emerald-900/20',
                            valueClass:
                                'text-emerald-700 dark:text-emerald-200',
                        },
                        {
                            label: 'Tolak',
                            value: voting.stats.reject,
                            icon: ThumbsDown,
                            cardClass:
                                'border-red-300/45 bg-red-100/55 dark:border-red-500/30 dark:bg-red-900/20',
                            valueClass: 'text-red-700 dark:text-red-200',
                        },
                        {
                            label: 'Approval Rate',
                            value: `${voting.stats.approval_percentage}%`,
                            icon: BarChart3,
                            cardClass:
                                'border-violet-300/45 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20',
                            valueClass: 'text-violet-700 dark:text-violet-200',
                        },
                        {
                            label: 'Partisipasi',
                            value: `${voting.participation_rate}%`,
                            icon: Vote,
                            cardClass:
                                'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20',
                            valueClass: 'text-amber-700 dark:text-amber-200',
                        },
                        {
                            label: 'Vote Velocity',
                            value: `${voteVelocity}/jam`,
                            icon: Zap,
                            cardClass:
                                'border-cyan-300/45 bg-cyan-100/55 dark:border-cyan-500/30 dark:bg-cyan-900/20',
                            valueClass: 'text-cyan-700 dark:text-cyan-200',
                        },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={cn(
                                'rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all',
                                stat.cardClass,
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <stat.icon
                                    className={cn('h-8 w-8', stat.valueClass)}
                                />
                                <p
                                    className={cn(
                                        'text-lg font-bold',
                                        stat.valueClass,
                                    )}
                                >
                                    {stat.value}
                                </p>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50"
                >
                    <div className="max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="inline-flex min-w-max gap-1">
                            {[
                                {
                                    key: 'overview',
                                    label: 'Overview',
                                    icon: LayoutDashboard,
                                },
                                {
                                    key: 'votes',
                                    label: 'Votes',
                                    icon: Users,
                                    count: voting.stats.total,
                                },
                                {
                                    key: 'analytics',
                                    label: 'Analytics',
                                    icon: BarChart3,
                                },
                                {
                                    key: 'discussion',
                                    label: 'Discussion',
                                    icon: MessageSquare,
                                    count: discussionCount,
                                },
                                {
                                    key: 'financial',
                                    label: 'Financial',
                                    icon: DollarSign,
                                },
                                {
                                    key: 'audit',
                                    label: 'Audit Trail',
                                    icon: ShieldCheck,
                                    count: activityLog.length,
                                },
                            ].map((tab) => (
                                <Button
                                    key={tab.key}
                                    variant={
                                        activeTab === tab.key
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setActiveTab(
                                            tab.key as typeof activeTab,
                                        )
                                    }
                                    className={cn(
                                        'shrink-0 gap-2 rounded-xl whitespace-nowrap transition-all duration-300',
                                        activeTab === tab.key
                                            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                                            : 'hover:bg-white/50 dark:hover:bg-neutral-800/50',
                                    )}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span
                                            className={cn(
                                                'ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs',
                                                activeTab === tab.key
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-slate-300',
                                            )}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'votes' && renderVotesTab()}
                    {activeTab === 'analytics' && renderAnalyticsTab()}
                    {activeTab === 'discussion' && renderDiscussionTab()}
                    {activeTab === 'financial' && renderFinancialTab()}
                    {activeTab === 'audit' && renderAuditTab()}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {rejectDialogOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setRejectDialogOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Tolak Voting
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Masukkan alasan penolakan
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRejectDialogOpen(false)}
                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-neutral-800 dark:hover:text-slate-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reject-reason">Alasan</Label>
                                <Textarea
                                    id="reject-reason"
                                    rows={4}
                                    value={rejectReason}
                                    onChange={(event) =>
                                        setRejectReason(event.target.value)
                                    }
                                    placeholder="Contoh: Nominal belum sesuai prioritas anggaran"
                                />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setRejectDialogOpen(false)}
                                    className="flex-1 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleReject}
                                    disabled={processing}
                                    className="flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700"
                                >
                                    Ya, Tolak
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                open={approveDialogOpen}
                onOpenChange={setApproveDialogOpen}
                onConfirm={handleApprove}
                title="Setujui Voting"
                message="Yakin ingin menyetujui voting ini? Pengeluaran akan langsung dicatat ke kas."
                variant="success"
                confirmText="Ya, Setujui"
                cancelText="Batal"
                loading={processing}
            />

            <ConfirmDialog
                open={closeDialogOpen}
                onOpenChange={setCloseDialogOpen}
                onConfirm={handleCloseVoting}
                title="Tutup Voting"
                message="Yakin ingin menutup voting tanpa keputusan akhir?"
                variant="warning"
                confirmText="Ya, Tutup"
                cancelText="Batal"
                loading={processing}
            />

            <ConfirmDialog
                open={finalizeDialogOpen}
                onOpenChange={setFinalizeDialogOpen}
                onConfirm={handleFinalizeVoting}
                title="Finalisasi Voting"
                message="Yakin ingin memfinalisasi voting berdasarkan hasil suara saat ini?"
                variant="info"
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                loading={processing}
            />
        </AppLayout>
    );
}
