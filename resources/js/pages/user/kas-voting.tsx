import { Head, router, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    Vote, Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Users, X, Wallet,
    TrendingUp, PieChart, Calendar, AlertCircle, Sparkles, Target, BarChart3, Info
} from 'lucide-react';
import { useState, FormEvent } from 'react';

interface Props {
    votings: Array<{
        id: number;
        title: string;
        description: string;
        amount: number;
        category: string;
        status: 'open' | 'approved' | 'rejected' | 'closed';
        creator: string;
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
        my_vote: 'approve' | 'reject' | null;
        created_at: string;
    }>;
    stats: {
        open: number;
        approved: number;
        rejected: number;
        total_amount_approved?: number;
        participation_rate?: number;
    };
    filters: { status: string };
}

const categories = [
    { value: 'kegiatan', label: 'Kegiatan Kelas', icon: '🎉', color: 'bg-purple-100 text-purple-700' },
    { value: 'perlengkapan', label: 'Perlengkapan', icon: '📦', color: 'bg-blue-100 text-blue-700' },
    { value: 'konsumsi', label: 'Konsumsi', icon: '🍕', color: 'bg-orange-100 text-orange-700' },
    { value: 'donasi', label: 'Donasi/Sosial', icon: '❤️', color: 'bg-pink-100 text-pink-700' },
    { value: 'lainnya', label: 'Lainnya', icon: '📋', color: 'bg-slate-100 text-slate-700' },
];

export default function KasVoting({ votings, stats, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState(filters.status);
    const [selectedVoting, setSelectedVoting] = useState<Props['votings'][0] | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        amount: '',
        category: 'kegiatan',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/kas-voting', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleVote = (votingId: number, vote: 'approve' | 'reject') => {
        router.post(`/user/kas-voting/${votingId}/vote`, { vote });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/user/kas-voting', { status: tab }, { preserveState: true });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'open':
                return { icon: Clock, label: 'Voting Aktif', bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-500' };
            case 'approved':
                return { icon: CheckCircle, label: 'Disetujui', bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500' };
            case 'rejected':
                return { icon: XCircle, label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500' };
            case 'closed':
                return { icon: AlertCircle, label: 'Ditutup', bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-500' };
            default:
                return { icon: Info, label: status, bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-500' };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getTimeRemaining = (deadline: string) => {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end.getTime() - now.getTime();
        if (diff <= 0) return 'Berakhir';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days} hari ${hours} jam`;
        return `${hours} jam`;
    };

    const getCategoryConfig = (categoryValue: string) => {
        return categories.find(c => c.value === categoryValue) || categories[4];
    };

    const totalVotings = stats.open + stats.approved + stats.rejected;
    const approvalRate = totalVotings > 0 ? Math.round((stats.approved / totalVotings) * 100) : 0;

    return (
        <StudentLayout>
            <Head title="Voting Pengeluaran Kas" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                    <Wallet className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-100 font-medium">Keuangan Kelas</p>
                                    <h1 className="text-2xl font-bold">Voting Pengeluaran Kas</h1>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setShowForm(true)}
                                className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg font-semibold"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Usulkan Pengeluaran
                            </Button>
                        </div>
                        <p className="mt-4 text-emerald-100">Usulkan dan vote pengeluaran kas secara demokratis bersama teman sekelas</p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-emerald-100 text-xs">Total Usulan</p>
                                <p className="text-2xl font-bold">{totalVotings}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-emerald-100 text-xs">Tingkat Persetujuan</p>
                                <p className="text-2xl font-bold">{approvalRate}%</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-emerald-100 text-xs">Voting Aktif</p>
                                <p className="text-2xl font-bold">{stats.open}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Sedang Voting</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.open}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Progress value={totalVotings > 0 ? (stats.open / totalVotings) * 100 : 0} className="h-1.5" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Disetujui</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Progress value={totalVotings > 0 ? (stats.approved / totalVotings) * 100 : 0} className="h-1.5 [&>div]:bg-emerald-500" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Ditolak</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Progress value={totalVotings > 0 ? (stats.rejected / totalVotings) * 100 : 0} className="h-1.5 [&>div]:bg-red-500" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/30">
                                <Target className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Approval Rate</p>
                                <p className="text-2xl font-bold text-purple-600">{approvalRate}%</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Progress value={approvalRate} className="h-1.5 [&>div]:bg-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Voting List */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Vote className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Voting</h2>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    {votings.length} usulan
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {[
                                { value: 'open', label: 'Sedang Voting', icon: Clock, count: stats.open },
                                { value: 'approved', label: 'Disetujui', icon: CheckCircle, count: stats.approved },
                                { value: 'rejected', label: 'Ditolak', icon: XCircle, count: stats.rejected },
                                { value: 'all', label: 'Semua', icon: BarChart3, count: totalVotings },
                            ].map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        activeTab === tab.value
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 hover:shadow-md'
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
                            <div className="grid gap-4 md:grid-cols-2">
                                {votings.map((voting) => {
                                    const statusConfig = getStatusConfig(voting.status);
                                    const StatusIcon = statusConfig.icon;
                                    const categoryConfig = getCategoryConfig(voting.category);
                                    const timeRemaining = getTimeRemaining(voting.voting_deadline);
                                    
                                    return (
                                        <div 
                                            key={voting.id} 
                                            className={`rounded-2xl border-2 p-5 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-all cursor-pointer ${
                                                voting.status === 'open' ? 'border-blue-200 dark:border-blue-800 hover:border-blue-300' :
                                                voting.status === 'approved' ? 'border-emerald-200 dark:border-emerald-800' :
                                                voting.status === 'rejected' ? 'border-red-200 dark:border-red-800' :
                                                'border-slate-200 dark:border-slate-700'
                                            }`}
                                            onClick={() => setSelectedVoting(voting)}
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        {statusConfig.label}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${categoryConfig.color}`}>
                                                        <span>{categoryConfig.icon}</span>
                                                        {categoryConfig.label}
                                                    </span>
                                                </div>
                                                {voting.my_vote && (
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                        voting.my_vote === 'approve' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {voting.my_vote === 'approve' ? '✓ Setuju' : '✗ Tolak'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title & Amount */}
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">{voting.title}</h4>
                                            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                                {formatCurrency(voting.amount)}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{voting.description}</p>

                                            {/* Meta Info */}
                                            <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {voting.creator}
                                                </span>
                                                {voting.status === 'open' && (
                                                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {timeRemaining}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Vote Progress */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                        <Users className="h-4 w-4" />
                                                        <span className="font-medium">{voting.stats.total}</span> votes
                                                        {!voting.stats.is_valid && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <span className="text-yellow-600 text-xs">(min {voting.min_votes})</span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Minimal {voting.min_votes} vote untuk valid</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{voting.stats.approval_percentage}% setuju</span>
                                                </div>
                                                <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                                    <div 
                                                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all" 
                                                        style={{ width: `${voting.stats.total > 0 ? (voting.stats.approve / voting.stats.total) * 100 : 0}%` }} 
                                                    />
                                                    <div 
                                                        className="bg-gradient-to-r from-red-400 to-red-600 transition-all" 
                                                        style={{ width: `${voting.stats.total > 0 ? (voting.stats.reject / voting.stats.total) * 100 : 0}%` }} 
                                                    />
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

                                            {/* Vote Buttons */}
                                            {voting.status === 'open' && !voting.is_expired && (
                                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                    <Button
                                                        size="sm"
                                                        className={`flex-1 ${voting.my_vote === 'approve' 
                                                            ? 'bg-emerald-600 cursor-not-allowed' 
                                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30'
                                                        }`}
                                                        onClick={(e) => { e.stopPropagation(); handleVote(voting.id, 'approve'); }}
                                                        disabled={voting.my_vote === 'approve'}
                                                    >
                                                        <ThumbsUp className="h-4 w-4 mr-1" />
                                                        {voting.my_vote === 'approve' ? 'Sudah Setuju' : 'Setuju'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className={`flex-1 ${voting.my_vote === 'reject' 
                                                            ? 'cursor-not-allowed' 
                                                            : 'shadow-lg shadow-red-500/30'
                                                        }`}
                                                        onClick={(e) => { e.stopPropagation(); handleVote(voting.id, 'reject'); }}
                                                        disabled={voting.my_vote === 'reject'}
                                                    >
                                                        <ThumbsDown className="h-4 w-4 mr-1" />
                                                        {voting.my_vote === 'reject' ? 'Sudah Tolak' : 'Tolak'}
                                                    </Button>
                                                </div>
                                            )}
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
                                <p className="text-sm text-slate-400 mt-1">Jadilah yang pertama mengusulkan pengeluaran kas!</p>
                                <Button onClick={() => setShowForm(true)} className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600">
                                    <Plus className="h-4 w-4 mr-2" /> Buat Usulan
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Usulkan Pengeluaran</h3>
                                    <p className="text-sm text-slate-500">Usulan akan di-voting selama 3 hari</p>
                                </div>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Judul Usulan</Label>
                                <Input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Beli spidol whiteboard"
                                    className="h-12 rounded-xl"
                                />
                                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Deskripsi</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan kebutuhan dan alasan pengeluaran ini..."
                                    rows={4}
                                    className="rounded-xl resize-none"
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Jumlah (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="50000"
                                        className="h-12 rounded-xl"
                                    />
                                    {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Kategori</Label>
                                    <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span>{cat.icon}</span>
                                                        {cat.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-12 rounded-xl">
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Usulan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedVoting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedVoting(null)}>
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {(() => {
                            const statusConfig = getStatusConfig(selectedVoting.status);
                            const StatusIcon = statusConfig.icon;
                            const categoryConfig = getCategoryConfig(selectedVoting.category);
                            
                            return (
                                <>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                <StatusIcon className="h-4 w-4" />
                                                {statusConfig.label}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${categoryConfig.color}`}>
                                                <span>{categoryConfig.icon}</span>
                                                {categoryConfig.label}
                                            </span>
                                        </div>
                                        <button onClick={() => setSelectedVoting(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <X className="h-5 w-5 text-slate-400" />
                                        </button>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedVoting.title}</h3>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                                        {formatCurrency(selectedVoting.amount)}
                                    </p>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6">
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedVoting.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-1">Diusulkan oleh</p>
                                            <p className="font-semibold text-slate-900 dark:text-white">{selectedVoting.creator}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-1">Deadline Voting</p>
                                            <p className="font-semibold text-slate-900 dark:text-white">{formatDate(selectedVoting.voting_deadline)}</p>
                                        </div>
                                    </div>

                                    {/* Vote Progress */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-semibold text-slate-900 dark:text-white">Hasil Voting</span>
                                            <span className="text-sm text-slate-500">{selectedVoting.stats.total} dari min. {selectedVoting.min_votes} votes</span>
                                        </div>
                                        <div className="flex h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 mb-3">
                                            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all" style={{ width: `${selectedVoting.stats.total > 0 ? (selectedVoting.stats.approve / selectedVoting.stats.total) * 100 : 0}%` }} />
                                            <div className="bg-gradient-to-r from-red-400 to-red-600 transition-all" style={{ width: `${selectedVoting.stats.total > 0 ? (selectedVoting.stats.reject / selectedVoting.stats.total) * 100 : 0}%` }} />
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                <span className="text-sm font-medium text-emerald-600">{selectedVoting.stats.approve} Setuju ({selectedVoting.stats.approval_percentage}%)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                                <span className="text-sm font-medium text-red-600">{selectedVoting.stats.reject} Tolak ({100 - selectedVoting.stats.approval_percentage}%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vote Buttons */}
                                    {selectedVoting.status === 'open' && !selectedVoting.is_expired && (
                                        <div className="flex gap-3">
                                            <Button
                                                className={`flex-1 h-12 ${selectedVoting.my_vote === 'approve' 
                                                    ? 'bg-emerald-600 cursor-not-allowed' 
                                                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30'
                                                }`}
                                                onClick={() => handleVote(selectedVoting.id, 'approve')}
                                                disabled={selectedVoting.my_vote === 'approve'}
                                            >
                                                <ThumbsUp className="h-5 w-5 mr-2" />
                                                {selectedVoting.my_vote === 'approve' ? 'Sudah Setuju' : 'Setuju'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className={`flex-1 h-12 ${selectedVoting.my_vote === 'reject' ? 'cursor-not-allowed' : 'shadow-lg shadow-red-500/30'}`}
                                                onClick={() => handleVote(selectedVoting.id, 'reject')}
                                                disabled={selectedVoting.my_vote === 'reject'}
                                            >
                                                <ThumbsDown className="h-5 w-5 mr-2" />
                                                {selectedVoting.my_vote === 'reject' ? 'Sudah Tolak' : 'Tolak'}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}
