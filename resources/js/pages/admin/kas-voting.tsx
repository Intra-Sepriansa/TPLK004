import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    Vote, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Users, 
    Eye, Gavel, AlertTriangle, BarChart3, Wallet, X, Target, Sparkles
} from 'lucide-react';
import { useState } from 'react';

interface Voter {
    id: number;
    nama: string;
    nim: string;
}

interface VoteDetail {
    id: number;
    mahasiswa: Voter | null;
    vote: 'approve' | 'reject';
    comment: string | null;
    created_at: string;
}

interface VotingItem {
    id: number;
    title: string;
    description: string;
    amount: number;
    category: string;
    status: 'open' | 'approved' | 'rejected' | 'closed';
    creator: Voter | null;
    voting_deadline: string;
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
    votes: VoteDetail[];
    created_at: string;
}

interface Props {
    votings: VotingItem[];
    stats: {
        total: number;
        open: number;
        approved: number;
        rejected: number;
        closed: number;
    };
    filters: { status: string };
}

const categories: Record<string, { label: string; icon: string; color: string }> = {
    kegiatan: { label: 'Kegiatan Kelas', icon: '🎉', color: 'bg-purple-100 text-purple-700' },
    perlengkapan: { label: 'Perlengkapan', icon: '📦', color: 'bg-blue-100 text-blue-700' },
    konsumsi: { label: 'Konsumsi', icon: '🍕', color: 'bg-orange-100 text-orange-700' },
    donasi: { label: 'Donasi/Sosial', icon: '❤️', color: 'bg-pink-100 text-pink-700' },
    lainnya: { label: 'Lainnya', icon: '📋', color: 'bg-slate-100 text-slate-700' },
};

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kas Voting', href: '/admin/kas-voting' },
];

export default function AdminKasVoting({ votings, stats, filters }: Props) {
    const [selectedVoting, setSelectedVoting] = useState<VotingItem | null>(null);
    const [showVoters, setShowVoters] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState(filters.status);
    const [approveDialog, setApproveDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [closeDialog, setCloseDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [finalizeDialog, setFinalizeDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

    const openApproveDialog = (id: number) => setApproveDialog({ open: true, id });
    const handleApprove = () => {
        if (!approveDialog.id) return;
        setProcessing(true);
        router.post(`/admin/kas-voting/${approveDialog.id}/approve`, {}, {
            onFinish: () => {
                setProcessing(false);
                setApproveDialog({ open: false, id: null });
            },
        });
    };

    const handleReject = (votingId: number) => {
        setProcessing(true);
        router.post(`/admin/kas-voting/${votingId}/reject`, { reason: rejectReason }, {
            onFinish: () => {
                setProcessing(false);
                setShowRejectDialog(false);
                setRejectReason('');
            },
        });
    };

    const openCloseDialog = (id: number) => setCloseDialog({ open: true, id });
    const handleClose = () => {
        if (!closeDialog.id) return;
        setProcessing(true);
        router.post(`/admin/kas-voting/${closeDialog.id}/close`, {}, {
            onFinish: () => {
                setProcessing(false);
                setCloseDialog({ open: false, id: null });
            },
        });
    };

    const openFinalizeDialog = (id: number) => setFinalizeDialog({ open: true, id });
    const handleFinalize = () => {
        if (!finalizeDialog.id) return;
        setProcessing(true);
        router.post(`/admin/kas-voting/${finalizeDialog.id}/finalize`, {}, {
            onFinish: () => {
                setProcessing(false);
                setFinalizeDialog({ open: false, id: null });
            },
        });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/admin/kas-voting', { status: tab }, { preserveState: true });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'open': return { icon: Clock, label: 'Voting Aktif', bg: 'bg-blue-100', text: 'text-blue-700' };
            case 'approved': return { icon: CheckCircle, label: 'Disetujui', bg: 'bg-emerald-100', text: 'text-emerald-700' };
            case 'rejected': return { icon: XCircle, label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-700' };
            case 'closed': return { icon: AlertTriangle, label: 'Ditutup', bg: 'bg-slate-100', text: 'text-slate-700' };
            default: return { icon: Vote, label: status, bg: 'bg-slate-100', text: 'text-slate-700' };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const getCategoryConfig = (cat: string) => categories[cat] || categories.lainnya;
    const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin - Kas Voting" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-xl">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                <Wallet className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100 font-medium">Manajemen Keuangan</p>
                                <h1 className="text-2xl font-bold">Voting Pengeluaran Kas</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-emerald-100">Kelola dan pantau voting pengeluaran kas mahasiswa</p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-emerald-100 text-xs font-medium">Total Voting</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-emerald-100 text-xs font-medium">Sedang Voting</p>
                                <p className="text-2xl font-bold">{stats.open}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-emerald-100 text-xs font-medium">Disetujui</p>
                                <p className="text-2xl font-bold">{stats.approved}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-emerald-100 text-xs font-medium">Approval Rate</p>
                                <p className="text-2xl font-bold">{approvalRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-lg shadow-slate-500/30">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Voting</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Disetujui</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Ditolak</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Ditutup</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.closed}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Voting List */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                                <Vote className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Voting Pengeluaran</h2>
                                <p className="text-xs text-slate-500">Lihat detail voting dan ambil keputusan</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {[
                                { value: 'all', label: 'Semua', icon: BarChart3, count: stats.total },
                                { value: 'open', label: 'Sedang Voting', icon: Clock, count: stats.open },
                                { value: 'approved', label: 'Disetujui', icon: CheckCircle, count: stats.approved },
                                { value: 'rejected', label: 'Ditolak', icon: XCircle, count: stats.rejected },
                                { value: 'closed', label: 'Ditutup', icon: AlertTriangle, count: stats.closed },
                            ].map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        activeTab === tab.value
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                        activeTab === tab.value ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Voting Items */}
                        {votings.length > 0 ? (
                            <div className="space-y-4">
                                {votings.map((voting) => {
                                    const statusConfig = getStatusConfig(voting.status);
                                    const StatusIcon = statusConfig.icon;
                                    const categoryConfig = getCategoryConfig(voting.category);
                                    
                                    return (
                                        <div 
                                            key={voting.id} 
                                            className={`rounded-2xl border-2 p-5 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-all ${
                                                voting.status === 'open' ? 'border-blue-200 dark:border-blue-800' :
                                                voting.status === 'approved' ? 'border-emerald-200 dark:border-emerald-800' :
                                                voting.status === 'rejected' ? 'border-red-200 dark:border-red-800' :
                                                'border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                <div className="flex-1">
                                                    {/* Status & Category */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {statusConfig.label}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${categoryConfig.color}`}>
                                                            <span>{categoryConfig.icon}</span>
                                                            {categoryConfig.label}
                                                        </span>
                                                        {voting.is_expired && voting.status === 'open' && (
                                                            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-100 text-red-700">
                                                                ⏰ Expired
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title & Amount */}
                                                    <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{voting.title}</h4>
                                                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                                        {formatCurrency(voting.amount)}
                                                    </p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{voting.description}</p>

                                                    {/* Meta Info */}
                                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                                                        <span>Diusulkan: {voting.creator?.nama || '-'} ({voting.creator?.nim || '-'})</span>
                                                        <span>•</span>
                                                        <span>Deadline: {voting.voting_deadline}</span>
                                                        <span>•</span>
                                                        <span>Dibuat: {voting.created_at}</span>
                                                    </div>

                                                    {/* Vote Progress */}
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                        <div className="flex items-center justify-between text-sm mb-2">
                                                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                                <Users className="h-4 w-4" />
                                                                <span className="font-medium">{voting.stats.total}</span> votes
                                                                {!voting.stats.is_valid && (
                                                                    <span className="text-yellow-600 text-xs">(min {voting.min_votes})</span>
                                                                )}
                                                            </span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                                {voting.stats.approval_percentage}% setuju
                                                                <span className="text-xs font-normal text-slate-500 ml-1">(threshold: {voting.approval_threshold}%)</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 mb-2">
                                                            <div 
                                                                className="bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all flex items-center justify-center text-xs text-white font-medium" 
                                                                style={{ width: `${voting.stats.total > 0 ? (voting.stats.approve / voting.stats.total) * 100 : 0}%` }}
                                                            >
                                                                {voting.stats.approve > 0 && voting.stats.approve}
                                                            </div>
                                                            <div 
                                                                className="bg-gradient-to-r from-red-400 to-red-600 transition-all flex items-center justify-center text-xs text-white font-medium" 
                                                                style={{ width: `${voting.stats.total > 0 ? (voting.stats.reject / voting.stats.total) * 100 : 0}%` }}
                                                            >
                                                                {voting.stats.reject > 0 && voting.stats.reject}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-xs font-medium">
                                                            <span className="text-emerald-600 flex items-center gap-1">
                                                                <ThumbsUp className="h-3 w-3" /> {voting.stats.approve} setuju
                                                            </span>
                                                            <span className="text-red-600 flex items-center gap-1">
                                                                <ThumbsDown className="h-3 w-3" /> {voting.stats.reject} tolak
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-col gap-2 min-w-[160px]">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="justify-start"
                                                        onClick={() => {
                                                            setSelectedVoting(voting);
                                                            setShowVoters(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Lihat Voters
                                                    </Button>
                                                    
                                                    {voting.status === 'open' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="justify-start bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
                                                                onClick={() => openApproveDialog(voting.id)}
                                                                disabled={processing}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="justify-start shadow-lg shadow-red-500/30"
                                                                onClick={() => {
                                                                    setSelectedVoting(voting);
                                                                    setShowRejectDialog(true);
                                                                }}
                                                                disabled={processing}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Tolak
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="justify-start"
                                                                onClick={() => openFinalizeDialog(voting.id)}
                                                                disabled={processing}
                                                            >
                                                                <Gavel className="h-4 w-4 mr-2" />
                                                                Finalisasi
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="justify-start"
                                                                onClick={() => openCloseDialog(voting.id)}
                                                                disabled={processing}
                                                            >
                                                                Tutup Voting
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Vote className="h-10 w-10 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">Belum ada voting</p>
                                <p className="text-sm text-slate-400 mt-1">Voting akan muncul ketika mahasiswa mengusulkan pengeluaran</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Voters Modal */}
            {showVoters && selectedVoting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Detail Voters</h3>
                                <p className="text-sm text-slate-500">{selectedVoting.title}</p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="text-emerald-600 font-medium">{selectedVoting.stats.approve} setuju</span>
                                    <span className="text-red-600 font-medium">{selectedVoting.stats.reject} tolak</span>
                                    <span className="text-slate-500">Total: {selectedVoting.stats.total}</span>
                                </div>
                            </div>
                            <button onClick={() => setShowVoters(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        
                        {selectedVoting.votes.length > 0 ? (
                            <div className="space-y-3">
                                {selectedVoting.votes.map((vote) => (
                                    <div key={vote.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                                vote.vote === 'approve' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-red-600'
                                            }`}>
                                                {vote.vote === 'approve' ? <ThumbsUp className="h-5 w-5" /> : <ThumbsDown className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{vote.mahasiswa?.nama || '-'}</p>
                                                <p className="text-xs text-slate-500">{vote.mahasiswa?.nim || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                                vote.vote === 'approve' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {vote.vote === 'approve' ? 'Setuju' : 'Tolak'}
                                            </span>
                                            <p className="text-xs text-slate-500 mt-1">{vote.created_at}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-slate-500">Belum ada yang vote</p>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button onClick={() => setShowVoters(false)} className="w-full">Tutup</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectDialog && selectedVoting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <XCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tolak Voting</h3>
                                    <p className="text-sm text-slate-500">{selectedVoting.title}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRejectDialog(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Alasan Penolakan (opsional)</Label>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Masukkan alasan penolakan..."
                                    rows={4}
                                    className="rounded-xl resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="flex-1">
                                Batal
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => handleReject(selectedVoting.id)}
                                disabled={processing}
                                className="flex-1 shadow-lg shadow-red-500/30"
                            >
                                {processing ? 'Memproses...' : 'Tolak Voting'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Confirmation Dialog */}
            <ConfirmDialog
                open={approveDialog.open}
                onOpenChange={(open) => setApproveDialog({ open, id: open ? approveDialog.id : null })}
                onConfirm={handleApprove}
                title="Setujui Voting"
                message="Yakin ingin menyetujui voting ini? Pengeluaran kas akan langsung dicatat."
                variant="success"
                confirmText="Ya, Setujui"
                cancelText="Batal"
                loading={processing}
            />

            {/* Close Confirmation Dialog */}
            <ConfirmDialog
                open={closeDialog.open}
                onOpenChange={(open) => setCloseDialog({ open, id: open ? closeDialog.id : null })}
                onConfirm={handleClose}
                title="Tutup Voting"
                message="Yakin ingin menutup voting ini tanpa keputusan?"
                variant="warning"
                confirmText="Ya, Tutup"
                cancelText="Batal"
                loading={processing}
            />

            {/* Finalize Confirmation Dialog */}
            <ConfirmDialog
                open={finalizeDialog.open}
                onOpenChange={(open) => setFinalizeDialog({ open, id: open ? finalizeDialog.id : null })}
                onConfirm={handleFinalize}
                title="Finalisasi Voting"
                message="Finalisasi voting berdasarkan hasil suara saat ini?"
                variant="info"
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                loading={processing}
            />
        </AppLayout>
    );
}
