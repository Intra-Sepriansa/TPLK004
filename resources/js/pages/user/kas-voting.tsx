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
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCurrencyShimmer } from '@/components/ui/animated-currency';

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
                {/* Header dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                x: [0, 50, 0],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute top-1/2 right-1/4 h-40 w-40 rounded-full bg-white/5 blur-2xl"
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                >
                                    <Wallet className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-emerald-100 font-medium"
                                    >
                                        Keuangan Kelas
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Voting Pengeluaran Kas
                                    </motion.h1>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Button 
                                    onClick={() => setShowForm(true)}
                                    className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg font-semibold"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Usulkan Pengeluaran
                                </Button>
                            </motion.div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-emerald-100"
                        >
                            Usulkan dan vote pengeluaran kas secara demokratis bersama teman sekelas
                        </motion.p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total Usulan', value: totalVotings, delay: 0.6 },
                                { label: 'Tingkat Persetujuan', value: `${approvalRate}%`, delay: 0.65 },
                                { label: 'Voting Aktif', value: stats.open, delay: 0.7 },
                            ].map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: stat.delay }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white/10 backdrop-blur rounded-xl p-3 cursor-pointer"
                                >
                                    <p className="text-emerald-100 text-xs">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards dengan animasi dock-style */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { icon: Clock, label: 'Sedang Voting', value: stats.open, color: 'from-blue-500 to-cyan-600', progress: totalVotings > 0 ? (stats.open / totalVotings) * 100 : 0, delay: 0.1 },
                        { icon: CheckCircle, label: 'Disetujui', value: stats.approved, color: 'from-emerald-500 to-green-600', progress: totalVotings > 0 ? (stats.approved / totalVotings) * 100 : 0, delay: 0.15 },
                        { icon: XCircle, label: 'Ditolak', value: stats.rejected, color: 'from-red-500 to-rose-600', progress: totalVotings > 0 ? (stats.rejected / totalVotings) * 100 : 0, delay: 0.2 },
                        { icon: Target, label: 'Approval Rate', value: `${approvalRate}%`, color: 'from-purple-500 to-violet-600', progress: approvalRate, delay: 0.25 },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className="group relative overflow-hidden rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 cursor-pointer"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative flex items-center gap-3">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: stat.delay + 0.1, type: "spring" }}
                                        className="text-2xl font-bold text-slate-900 dark:text-white"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <Progress value={stat.progress} className="h-1.5" />
                            </div>
                            
                            {/* Animated border */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-900 dark:via-white to-transparent"
                                initial={{ width: "0%", opacity: 0 }}
                                whileHover={{ width: "100%", opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Voting List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                >
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
                        {/* Tabs dengan animasi */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {[
                                { value: 'open', label: 'Sedang Voting', icon: Clock, count: stats.open },
                                { value: 'approved', label: 'Disetujui', icon: CheckCircle, count: stats.approved },
                                { value: 'rejected', label: 'Ditolak', icon: XCircle, count: stats.rejected },
                                { value: 'all', label: 'Semua', icon: BarChart3, count: totalVotings },
                            ].map((tab, index) => (
                                <motion.button
                                    key={tab.value}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
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
                                </motion.button>
                            ))}
                        </div>

                        {/* Voting Items dengan AnimatePresence */}
                        <AnimatePresence mode="wait">
                            {votings.length > 0 ? (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid gap-4 md:grid-cols-2"
                                >
                                    {votings.map((voting, index) => {
                                        const statusConfig = getStatusConfig(voting.status);
                                        const StatusIcon = statusConfig.icon;
                                        const categoryConfig = getCategoryConfig(voting.category);
                                        const timeRemaining = getTimeRemaining(voting.voting_deadline);
                                        
                                        return (
                                            <motion.div
                                                key={voting.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.02, y: -5 }}
                                                className={`group rounded-2xl border-2 p-5 bg-white dark:bg-black/50 hover:shadow-xl transition-all cursor-pointer ${
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
                                                        <motion.span
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                                voting.my_vote === 'approve' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                            }`}
                                                        >
                                                            {voting.my_vote === 'approve' ? '✓ Setuju' : '✗ Tolak'}
                                                        </motion.span>
                                                    )}
                                                </div>

                                                {/* Title & Amount */}
                                                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">{voting.title}</h4>
                                                <div className="mb-2">
                                                    <AnimatedCurrencyShimmer
                                                        value={voting.amount}
                                                        duration={2000}
                                                        className="text-2xl"
                                                        gradient="from-emerald-600 via-teal-500 to-cyan-600"
                                                    />
                                                </div>
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
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${voting.stats.total > 0 ? (voting.stats.approve / voting.stats.total) * 100 : 0}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className="bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                        />
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${voting.stats.total > 0 ? (voting.stats.reject / voting.stats.total) * 100 : 0}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className="bg-gradient-to-r from-red-400 to-red-600"
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
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                                                    >
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
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="text-center py-16"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                                    >
                                        <Vote className="h-10 w-10 text-slate-400" />
                                    </motion.div>
                                    <p className="text-slate-500 font-medium">Belum ada voting</p>
                                    <p className="text-sm text-slate-400 mt-1">Jadilah yang pertama mengusulkan pengeluaran kas!</p>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button onClick={() => setShowForm(true)} className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600">
                                            <Plus className="h-4 w-4 mr-2" /> Buat Usulan
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Add Form Modal dengan animasi */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-black max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        initial={{ rotate: -180, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg"
                                    >
                                        <Sparkles className="h-6 w-6" />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Usulkan Pengeluaran</h3>
                                        <p className="text-sm text-slate-500">Usulan akan di-voting selama 3 hari</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowForm(false)}
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="h-5 w-5 text-slate-400" />
                                </motion.button>
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detail Modal dengan animasi */}
            <AnimatePresence>
                {selectedVoting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setSelectedVoting(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-black max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {(() => {
                                const statusConfig = getStatusConfig(selectedVoting.status);
                                const StatusIcon = statusConfig.icon;
                                const categoryConfig = getCategoryConfig(selectedVoting.category);
                                
                                return (
                                    <>
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <motion.span
                                                    initial={{ scale: 0, x: -20 }}
                                                    animate={{ scale: 1, x: 0 }}
                                                    transition={{ type: "spring", stiffness: 200 }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                                                >
                                                    <StatusIcon className="h-4 w-4" />
                                                    {statusConfig.label}
                                                </motion.span>
                                                <motion.span
                                                    initial={{ scale: 0, x: -20 }}
                                                    animate={{ scale: 1, x: 0 }}
                                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${categoryConfig.color}`}
                                                >
                                                    <span>{categoryConfig.icon}</span>
                                                    {categoryConfig.label}
                                                </motion.span>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 90 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setSelectedVoting(null)}
                                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <X className="h-5 w-5 text-slate-400" />
                                            </motion.button>
                                        </div>

                                        <motion.h3
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-2xl font-bold text-slate-900 dark:text-white mb-3"
                                        >
                                            {selectedVoting.title}
                                        </motion.h3>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="mb-4"
                                        >
                                            <AnimatedCurrencyShimmer
                                                value={selectedVoting.amount}
                                                duration={2500}
                                                className="text-3xl"
                                                gradient="from-emerald-600 via-teal-500 to-cyan-600"
                                            />
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6"
                                        >
                                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedVoting.description}</p>
                                        </motion.div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                                            >
                                                <p className="text-xs text-slate-500 mb-1">Diusulkan oleh</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{selectedVoting.creator}</p>
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                                            >
                                                <p className="text-xs text-slate-500 mb-1">Deadline Voting</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{formatDate(selectedVoting.voting_deadline)}</p>
                                            </motion.div>
                                        </div>

                                        {/* Vote Progress */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-semibold text-slate-900 dark:text-white">Hasil Voting</span>
                                                <span className="text-sm text-slate-500">{selectedVoting.stats.total} dari min. {selectedVoting.min_votes} votes</span>
                                            </div>
                                            <div className="flex h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 mb-3">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedVoting.stats.total > 0 ? (selectedVoting.stats.approve / selectedVoting.stats.total) * 100 : 0}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                />
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedVoting.stats.total > 0 ? (selectedVoting.stats.reject / selectedVoting.stats.total) * 100 : 0}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="bg-gradient-to-r from-red-400 to-red-600"
                                                />
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
                                        </motion.div>

                                        {/* Vote Buttons */}
                                        {selectedVoting.status === 'open' && !selectedVoting.is_expired && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                className="flex gap-3"
                                            >
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                    <Button
                                                        className={`w-full h-12 ${selectedVoting.my_vote === 'approve' 
                                                            ? 'bg-emerald-600 cursor-not-allowed' 
                                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30'
                                                        }`}
                                                        onClick={() => handleVote(selectedVoting.id, 'approve')}
                                                        disabled={selectedVoting.my_vote === 'approve'}
                                                    >
                                                        <ThumbsUp className="h-5 w-5 mr-2" />
                                                        {selectedVoting.my_vote === 'approve' ? 'Sudah Setuju' : 'Setuju'}
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                    <Button
                                                        variant="destructive"
                                                        className={`w-full h-12 ${selectedVoting.my_vote === 'reject' ? 'cursor-not-allowed' : 'shadow-lg shadow-red-500/30'}`}
                                                        onClick={() => handleVote(selectedVoting.id, 'reject')}
                                                        disabled={selectedVoting.my_vote === 'reject'}
                                                    >
                                                        <ThumbsDown className="h-5 w-5 mr-2" />
                                                        {selectedVoting.my_vote === 'reject' ? 'Sudah Tolak' : 'Tolak'}
                                                    </Button>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
